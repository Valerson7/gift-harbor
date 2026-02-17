# Сначала импортируем все базовые модели
from .user import User
from .wishlist import Wishlist
from .item import Item
from .reservation import Reservation
from .contribution import Contribution

# ПОСЛЕ этого добавляем связи
from . import relationships