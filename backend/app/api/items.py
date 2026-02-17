from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app.models.item import Item
from app.models.wishlist import Wishlist
from app.models.user import User
from app.api.auth import get_current_active_user
from pydantic import BaseModel

router = APIRouter(prefix="/items", tags=["items"])

# Pydantic-схемы
class ItemCreate(BaseModel):
    wishlist_id: int
    name: str
    description: str | None = None
    price: float
    url: str | None = None
    image_url: str | None = None

class ItemResponse(BaseModel):
    id: int
    wishlist_id: int
    name: str
    description: str | None = None
    price: float
    url: str | None = None
    image_url: str | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True

class ItemUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: float | None = None
    url: str | None = None
    image_url: str | None = None
    is_active: bool | None = None

# Эндпоинты
@router.post("/", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
def create_item(
    item: ItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Добавить товар в вишлист"""
    try:
        # Проверяем, что вишлист принадлежит пользователю
        wishlist = db.query(Wishlist).filter(
            Wishlist.id == item.wishlist_id,
            Wishlist.user_id == current_user.id
        ).first()
        
        if not wishlist:
            raise HTTPException(status_code=404, detail="Wishlist not found")
        
        # Проверяем минимальную цену
        if item.price < 10:
            raise HTTPException(status_code=400, detail="Minimum price is $10")
        
        db_item = Item(
            wishlist_id=item.wishlist_id,
            name=item.name,
            description=item.description,
            price=item.price,
            url=item.url,
            image_url=item.image_url
        )
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error in create_item: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/wishlist/{wishlist_id}", response_model=List[ItemResponse])
def get_items_by_wishlist(
    wishlist_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Получить все товары вишлиста"""
    try:
        # Проверяем доступ к вишлисту
        wishlist = db.query(Wishlist).filter(
            Wishlist.id == wishlist_id,
            Wishlist.user_id == current_user.id
        ).first()
        
        if not wishlist:
            raise HTTPException(status_code=404, detail="Wishlist not found")
        
        items = db.query(Item).filter(
            Item.wishlist_id == wishlist_id,
            Item.is_active == True
        ).all()
        return items
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_items_by_wishlist: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{item_id}", response_model=ItemResponse)
def get_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Получить конкретный товар"""
    try:
        item = db.query(Item).filter(Item.id == item_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        
        # Проверяем, что вишлист принадлежит пользователю
        wishlist = db.query(Wishlist).filter(
            Wishlist.id == item.wishlist_id,
            Wishlist.user_id == current_user.id
        ).first()
        
        if not wishlist:
            raise HTTPException(status_code=403, detail="Not enough permissions")
        
        return item
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_item: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{item_id}", response_model=ItemResponse)
def update_item(
    item_id: int,
    item_update: ItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Обновить товар"""
    try:
        item = db.query(Item).filter(Item.id == item_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        
        # Проверяем доступ
        wishlist = db.query(Wishlist).filter(
            Wishlist.id == item.wishlist_id,
            Wishlist.user_id == current_user.id
        ).first()
        
        if not wishlist:
            raise HTTPException(status_code=403, detail="Not enough permissions")
        
        # Обновляем только переданные поля
        if item_update.name is not None:
            item.name = item_update.name
        if item_update.description is not None:
            item.description = item_update.description
        if item_update.price is not None:
            if item_update.price < 10:
                raise HTTPException(status_code=400, detail="Minimum price is $10")
            item.price = item_update.price
        if item_update.url is not None:
            item.url = item_update.url
        if item_update.image_url is not None:
            item.image_url = item_update.image_url
        if item_update.is_active is not None:
            item.is_active = item_update.is_active
        
        db.commit()
        db.refresh(item)
        return item
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error in update_item: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Удалить товар (мягкое удаление)"""
    try:
        item = db.query(Item).filter(Item.id == item_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        
        # Проверяем доступ
        wishlist = db.query(Wishlist).filter(
            Wishlist.id == item.wishlist_id,
            Wishlist.user_id == current_user.id
        ).first()
        
        if not wishlist:
            raise HTTPException(status_code=403, detail="Not enough permissions")
        
        # Мягкое удаление
        item.is_active = False
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error in delete_item: {e}")
        raise HTTPException(status_code=500, detail=str(e))