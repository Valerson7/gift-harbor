# Этот файл добавляет связи ПОСЛЕ того, как все модели определены
from sqlalchemy.orm import relationship
from app.models.user import User
from app.models.wishlist import Wishlist
from app.models.item import Item
from app.models.reservation import Reservation
from app.models.contribution import Contribution
from app.models.password_reset import PasswordReset

# Добавляем связи к User
User.wishlists = relationship("Wishlist", back_populates="owner", cascade="all, delete-orphan")
User.reservations = relationship("Reservation", back_populates="user")
User.contributions = relationship("Contribution", back_populates="user")

# Добавляем связи к Wishlist
Wishlist.owner = relationship("User", back_populates="wishlists")
Wishlist.items = relationship("Item", back_populates="wishlist", cascade="all, delete-orphan")

# Добавляем связи к Item
Item.wishlist = relationship("Wishlist", back_populates="items")
Item.reservations = relationship("Reservation", back_populates="item", cascade="all, delete-orphan")
Item.contributions = relationship("Contribution", back_populates="item", cascade="all, delete-orphan")

# Добавляем связи к Reservation
Reservation.item = relationship("Item", back_populates="reservations")
Reservation.user = relationship("User", back_populates="reservations")

# Добавляем связи к Contribution
Contribution.item = relationship("Item", back_populates="contributions")
Contribution.user = relationship("User", back_populates="contributions")

# Связь для PasswordReset
User.password_resets = relationship("PasswordReset", back_populates="user", cascade="all, delete-orphan")
PasswordReset.user = relationship("User", back_populates="password_resets")