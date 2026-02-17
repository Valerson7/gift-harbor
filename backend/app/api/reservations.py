from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app.models.reservation import Reservation
from app.models.item import Item
from app.models.wishlist import Wishlist
from app.models.user import User
from app.api.auth import get_current_active_user
from pydantic import BaseModel

router = APIRouter(prefix="/reservations", tags=["reservations"])

# Pydantic-схемы
class ReservationCreate(BaseModel):
    item_id: int

class ReservationResponse(BaseModel):
    id: int
    item_id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class PublicReservationResponse(BaseModel):
    item_id: int
    is_reserved: bool
    
    class Config:
        from_attributes = True

@router.post("/", response_model=ReservationResponse, status_code=status.HTTP_201_CREATED)
def create_reservation(
    reservation: ReservationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Зарезервировать подарок (анонимно для владельца)"""
    try:
        print(f"🔔 Получен запрос на резервацию item_id: {reservation.item_id}")
        
        # Проверяем, существует ли товар
        item = db.query(Item).filter(Item.id == reservation.item_id).first()
        if not item:
            print(f"❌ Товар {reservation.item_id} не найден")
            raise HTTPException(status_code=404, detail="Item not found")
        
        # Проверяем, не владелец ли это вишлиста
        wishlist = db.query(Wishlist).filter(Wishlist.id == item.wishlist_id).first()
        if wishlist.user_id == current_user.id:
            print(f"❌ Владелец пытается зарезервировать свой товар")
            raise HTTPException(status_code=400, detail="Cannot reserve your own item")
        
        # Проверяем, не зарезервирован ли уже товар
        existing = db.query(Reservation).filter(
            Reservation.item_id == reservation.item_id
        ).first()
        
        if existing:
            print(f"❌ Товар {reservation.item_id} уже зарезервирован")
            raise HTTPException(status_code=400, detail="Item already reserved")
        
        db_reservation = Reservation(
            item_id=reservation.item_id,
            user_id=current_user.id
        )
        db.add(db_reservation)
        db.commit()
        db.refresh(db_reservation)
        
        print(f"✅ Товар {reservation.item_id} зарезервирован пользователем {current_user.id}")
        return db_reservation
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Ошибка в create_reservation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reservation(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Отменить резервацию (только тот, кто резервировал)"""
    try:
        reservation = db.query(Reservation).filter(
            Reservation.item_id == item_id,
            Reservation.user_id == current_user.id
        ).first()
        
        if not reservation:
            raise HTTPException(status_code=404, detail="Reservation not found")
        
        db.delete(reservation)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error in delete_reservation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/item/{item_id}", response_model=PublicReservationResponse)
def get_item_reservation_status(
    item_id: int,
    db: Session = Depends(get_db)
):
    """Проверить, зарезервирован ли товар (публичный endpoint)"""
    try:
        reservation = db.query(Reservation).filter(
            Reservation.item_id == item_id
        ).first()
        
        return {
            "item_id": item_id,
            "is_reserved": reservation is not None
        }
    except Exception as e:
        print(f"Error in get_item_reservation_status: {e}")
        raise HTTPException(status_code=500, detail=str(e))