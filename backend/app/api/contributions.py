from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app.models.contribution import Contribution
from app.models.item import Item
from app.models.wishlist import Wishlist
from app.models.user import User
from app.api.auth import get_current_active_user
from pydantic import BaseModel

router = APIRouter(prefix="/contributions", tags=["contributions"])

# Pydantic-схемы
class ContributionCreate(BaseModel):
    item_id: int
    amount: float

class ContributionResponse(BaseModel):
    id: int
    item_id: int
    user_id: int
    amount: float
    created_at: datetime

    class Config:
        from_attributes = True

class ItemProgressResponse(BaseModel):
    item_id: int
    item_name: str
    item_price: float
    total_collected: float
    progress_percent: float
    contributors_count: int
    remaining: float
    is_fully_funded: bool
    
    class Config:
        from_attributes = True

@router.post("/", response_model=ContributionResponse, status_code=status.HTTP_201_CREATED)
def create_contribution(
    contribution: ContributionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Внести вклад в подарок (можно несколько раз)"""
    try:
        print(f"🔔 Получен запрос на вклад: item_id={contribution.item_id}, amount={contribution.amount}")
        
        # Проверяем минимальную сумму
        if contribution.amount < 10:
            raise HTTPException(status_code=400, detail="Minimum contribution is $10")
        
        # Проверяем, существует ли товар
        item = db.query(Item).filter(Item.id == contribution.item_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        
        # Проверяем, что товар активен
        if not item.is_active:
            raise HTTPException(status_code=400, detail="Item is not active")
        
        # Проверяем, не владелец ли это вишлиста
        wishlist = db.query(Wishlist).filter(Wishlist.id == item.wishlist_id).first()
        if wishlist.user_id == current_user.id:
            raise HTTPException(status_code=400, detail="Cannot contribute to your own item")
        
        # Считаем уже собранную сумму
        existing_contributions = db.query(Contribution).filter(
            Contribution.item_id == contribution.item_id
        ).all()
        total_collected = sum(c.amount for c in existing_contributions)
        
        # Проверяем, не превысит ли новый вклад цену товара
        if total_collected + contribution.amount > item.price:
            max_possible = item.price - total_collected
            raise HTTPException(
                status_code=400, 
                detail=f"Total would exceed item price. Max remaining: ${max_possible:.2f}"
            )
        
        # Создаём вклад
        db_contribution = Contribution(
            item_id=contribution.item_id,
            user_id=current_user.id,
            amount=contribution.amount
        )
        db.add(db_contribution)
        db.commit()
        db.refresh(db_contribution)
        
        print(f"✅ Вклад добавлен: {contribution.amount} на товар {contribution.item_id}")
        return db_contribution
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Ошибка в create_contribution: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/item/{item_id}/progress", response_model=ItemProgressResponse)
def get_item_progress(
    item_id: int,
    db: Session = Depends(get_db)
):
    """Получить прогресс сбора для товара (публичный endpoint)"""
    try:
        item = db.query(Item).filter(Item.id == item_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        
        # Считаем сумму всех вкладов
        contributions = db.query(Contribution).filter(
            Contribution.item_id == item_id
        ).all()
        
        total = sum(c.amount for c in contributions)
        progress = (total / item.price) * 100 if item.price > 0 else 0
        remaining = item.price - total
        
        return {
            "item_id": item.id,
            "item_name": item.name,
            "item_price": item.price,
            "total_collected": total,
            "remaining": remaining,
            "progress_percent": round(progress, 2),
            "contributors_count": len(contributions),
            "is_fully_funded": total >= item.price
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_item_progress: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/item/{item_id}/my-contribution", response_model=float)
def get_my_contribution(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Сколько уже внёс текущий пользователь (для отображения)"""
    try:
        contributions = db.query(Contribution).filter(
            Contribution.item_id == item_id,
            Contribution.user_id == current_user.id
        ).all()
        
        total = sum(c.amount for c in contributions)
        return total
    except Exception as e:
        print(f"Error in get_my_contribution: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/item/{item_id}/all", response_model=List[ContributionResponse])
def get_item_contributions(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Получить все вклады на товар (только для владельца вишлиста)"""
    try:
        item = db.query(Item).filter(Item.id == item_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        
        # Проверяем, что пользователь — владелец вишлиста
        wishlist = db.query(Wishlist).filter(Wishlist.id == item.wishlist_id).first()
        if wishlist.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Only wishlist owner can view contributions")
        
        contributions = db.query(Contribution).filter(
            Contribution.item_id == item_id
        ).all()
        return contributions
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_item_contributions: {e}")
        raise HTTPException(status_code=500, detail=str(e))