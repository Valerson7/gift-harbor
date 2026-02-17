from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, wishlists, items, reservations, contributions, reset_password

app = FastAPI(title="GiftHarbor API")

# ВАЖНО: CORS должен быть настроен ПРАВИЛЬНО
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",   # Твой фронтенд
        "http://127.0.0.1:3000",   # Альтернативный localhost
    ],
    allow_credentials=True,        # Разрешаем отправку куки и заголовков авторизации
    allow_methods=["*"],            # Разрешаем все методы (GET, POST, PUT, DELETE, OPTIONS)
    allow_headers=["*"],            # Разрешаем все заголовки (включая Authorization)
)

# Подключаем все роутеры
app.include_router(auth.router)
app.include_router(wishlists.router)
app.include_router(items.router)
app.include_router(reservations.router)
app.include_router(contributions.router)
app.include_router(reset_password.router)

@app.get("/")
def root():
    return {"message": "GiftHarbor API is running! 🚀"}