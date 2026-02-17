import sys
import os

# Добавляем путь к папке backend в пути Python
backend_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app.database import Base, engine
from app.models import user, wishlist, item, reservation, contribution
from app.models.password_reset import PasswordReset  # ВАЖНО: импортируем новую модель!

print("🚀 Создаём таблицы в Supabase...")
print(f"📂 Путь к backend: {backend_path}")

# Создаём все таблицы
Base.metadata.create_all(bind=engine)

print("✅ Все таблицы успешно созданы!")
print("📋 Таблицы: users, wishlists, items, reservations, contributions, password_resets")