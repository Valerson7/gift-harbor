from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import datetime

from app.database import get_db
from app.models.wishlist import Wishlist
from app.models.user import User
from app.api.auth import get_current_active_user
from pydantic import BaseModel

router = APIRouter(prefix="/wishlists", tags=["wishlists"])

# Pydantic-схемы
class WishlistCreate(BaseModel):
    title: str
    description: str | None = None
    is_public: bool = True

class WishlistResponse(BaseModel):
    id: int
    title: str
    description: str | None = None
    user_id: int
    share_code: str
    is_public: bool
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True

# ========== АВТОМАТИЧЕСКОЕ ДОБАВЛЕНИЕ 15 ТОВАРОВ ==========
def add_default_items_to_wishlist(wishlist_id: int, db: Session):
    """Добавляет 15 стандартных товаров в новый вишлист"""
    default_items = [
        {
            "name": "🎧 Наушники Sony WH-1000XM5",
            "description": "Лучшие беспроводные наушники с шумоподавлением. Идеальны для музыки и путешествий.",
            "price": 349,
            "url": "https://www.sony.com/electronics/headband-headphones/wh-1000xm5",
            "image_url": "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=300"
        },
        {
            "name": "⌚ Apple Watch Series 9",
            "description": "Умные часы с дисплеем Always-On, измерением кислорода в крови и ЭКГ.",
            "price": 399,
            "url": "https://www.apple.com/apple-watch-series-9/",
            "image_url": "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=300"
        },
        {
            "name": "🎮 PlayStation 5 Slim",
            "description": "Игровая приставка нового поколения с быстрой загрузкой и потрясающей графикой.",
            "price": 449,
            "url": "https://www.playstation.com/ps5/",
            "image_url": "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=300"
        },
        {
            "name": "📚 Книга «Грокаем алгоритмы»",
            "description": "Иллюстрированное пособие для программистов. Алгоритмы становятся понятными и интересными.",
            "price": 29,
            "url": "https://www.piter.com/product/grokaem-algoritmy",
            "image_url": "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300"
        },
        {
            "name": "🎸 Электрогитара Yamaha Pacifica 112V",
            "description": "Отличная гитара для начинающих и опытных музыкантов. Звук, качество, стиль.",
            "price": 549,
            "url": "https://ru.yamaha.com/products/musical_instruments/guitars_basses/electric_guitars/pacifica/pacifica_112v/index.html",
            "image_url": "https://images.unsplash.com/photo-1550985616-10810253b84d?w=300"
        },
        {
            "name": "☕ Кофемашина De'Longhi Dedica",
            "description": "Компактная кофемашина для идеального эспрессо и капучино дома.",
            "price": 249,
            "url": "https://www.delonghi.com/ru-ru/products/coffee/espresso-machines/dedica-ec-680-ec680",
            "image_url": "https://images.unsplash.com/photo-1525088553748-01d6e210e00b?w=300"
        },
        {
            "name": "🖥️ Монитор LG UltraGear 27\" 1440p",
            "description": "Игровой монитор с частотой 165 Гц и быстрым IPS матрицей.",
            "price": 299,
            "url": "https://www.lg.com/us/monitors/lg-27gp850-b",
            "image_url": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300"
        },
        {
            "name": "🎤 Микрофон Blue Yeti USB",
            "description": "Профессиональный USB-микрофон для подкастов, стримов и записи.",
            "price": 129,
            "url": "https://www.bluemic.com/yeti/",
            "image_url": "https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=300"
        },
        {
            "name": "📱 Смартфон Google Pixel 7a",
            "description": "Качественный смартфон с отличной камерой и чистым Android.",
            "price": 349,
            "url": "https://store.google.com/product/pixel_7a",
            "image_url": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300"
        },
        {
            "name": "🏋️ Умные весы Xiaomi Mi Body Composition 2",
            "description": "Весы с анализом состава тела: вес, процент жира, мышц, костной массы.",
            "price": 29,
            "url": "https://www.mi.com/ru/product/mi-body-composition-scale-2/",
            "image_url": "https://images.unsplash.com/photo-1576670399724-3c318d6cd0b4?w=300"
        },
        {
            "name": "🎁 Набор косметики Lush (праздничный)",
            "description": "Подарочный набор натуральной косметики: бомбочки для ванн, мыло, кремы.",
            "price": 59,
            "url": "https://www.lush.com/ru/ru/gifts",
            "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300"
        },
        {
            "name": "🍳 Сковорода De Buyer Mineral B 26см",
            "description": "Профессиональная сковорода из углеродистой стали, любимая поварами.",
            "price": 69,
            "url": "https://www.debuyer.com/en/mineral-b/369-mineral-b-fry-pan-26-cm.html",
            "image_url": "https://images.unsplash.com/photo-1584990347449-a7aa05d4f80f?w=300"
        },
        {
            "name": "🧳 Чемодан алюминиевый Away Carry-On",
            "description": "Стильный и прочный алюминиевый чемодан для путешествий.",
            "price": 275,
            "url": "https://www.awaytravel.com/luggage/carry-on/aluminum",
            "image_url": "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=300"
        },
        {
            "name": "🎲 Настольная игра «Билет на поезд»",
            "description": "Культовая настольная стратегия о железных дорогах. Для компании и семьи.",
            "price": 49,
            "url": "https://hobbyworld.ru/bilet-na-poezd",
            "image_url": "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=300"
        },
        {
            "name": "💺 Кресло компьютерное DXRacer",
            "description": "Эргономичное игровое кресло с поддержкой спины и подголовником.",
            "price": 349,
            "url": "https://www.dxracer.com/ru-ru/",
            "image_url": "https://images.unsplash.com/photo-1586158775613-8c3ee053bdae?w=300"
        }
    ]
    
    from app.models.item import Item
    for item_data in default_items:
        item = Item(
            wishlist_id=wishlist_id,
            name=item_data["name"],
            description=item_data["description"],
            price=item_data["price"],
            url=item_data["url"],
            image_url=item_data["image_url"]
        )
        db.add(item)
    db.commit()
    print(f"✅ Добавлено 15 товаров в вишлист {wishlist_id}")

# Эндпоинты
@router.get("/", response_model=List[WishlistResponse])
def get_my_wishlists(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Получить все вишлисты текущего пользователя"""
    try:
        wishlists = db.query(Wishlist).filter(Wishlist.user_id == current_user.id).all()
        return wishlists
    except Exception as e:
        print(f"Error in get_my_wishlists: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=WishlistResponse, status_code=status.HTTP_201_CREATED)
def create_wishlist(
    wishlist: WishlistCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Создать новый вишлист"""
    try:
        # Генерируем уникальный код для публичной ссылки
        share_code = str(uuid.uuid4())[:8]
        
        db_wishlist = Wishlist(
            title=wishlist.title,
            description=wishlist.description,
            user_id=current_user.id,
            share_code=share_code,
            is_public=wishlist.is_public
        )
        db.add(db_wishlist)
        db.commit()
        db.refresh(db_wishlist)
        
        # АВТОМАТИЧЕСКИ ДОБАВЛЯЕМ 15 ТОВАРОВ
        add_default_items_to_wishlist(db_wishlist.id, db)
        
        return db_wishlist
    except Exception as e:
        db.rollback()
        print(f"Error in create_wishlist: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{wishlist_id}", response_model=WishlistResponse)
def get_wishlist(
    wishlist_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Получить конкретный вишлист по ID"""
    try:
        wishlist = db.query(Wishlist).filter(
            Wishlist.id == wishlist_id,
            Wishlist.user_id == current_user.id
        ).first()
        
        if not wishlist:
            raise HTTPException(status_code=404, detail="Wishlist not found")
        return wishlist
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_wishlist: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{wishlist_id}", response_model=WishlistResponse)
def update_wishlist(
    wishlist_id: int,
    wishlist_update: WishlistCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Обновить вишлист"""
    try:
        wishlist = db.query(Wishlist).filter(
            Wishlist.id == wishlist_id,
            Wishlist.user_id == current_user.id
        ).first()
        
        if not wishlist:
            raise HTTPException(status_code=404, detail="Wishlist not found")
        
        wishlist.title = wishlist_update.title
        wishlist.description = wishlist_update.description
        wishlist.is_public = wishlist_update.is_public
        
        db.commit()
        db.refresh(wishlist)
        return wishlist
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error in update_wishlist: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{wishlist_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_wishlist(
    wishlist_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Удалить вишлист"""
    try:
        wishlist = db.query(Wishlist).filter(
            Wishlist.id == wishlist_id,
            Wishlist.user_id == current_user.id
        ).first()
        
        if not wishlist:
            raise HTTPException(status_code=404, detail="Wishlist not found")
        
        db.delete(wishlist)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error in delete_wishlist: {e}")
        raise HTTPException(status_code=500, detail=str(e))