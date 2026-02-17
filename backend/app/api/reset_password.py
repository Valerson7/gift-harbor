from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import traceback

from app.database import get_db
from app.models.user import User
from app.models.password_reset import PasswordReset
from app.api.auth import get_password_hash
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/auth", tags=["password_reset"])

# Pydantic-схемы
class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

class PasswordResetResponse(BaseModel):
    message: str

# ⚠️ КОНФИГУРАЦИЯ EMAIL
SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = "valersonik23@gmail.com"
SMTP_PASSWORD = "bpdvfpayrqohdekh"  # Пароль приложения БЕЗ пробелов

def send_reset_email(email: str, token: str):
    """Отправка письма для сброса пароля на реальный email с подробным логированием"""
    print("\n" + "="*60)
    print(f"🔍 НАЧАЛО ОТПРАВКИ ПИСЬМА ДЛЯ {email}")
    print("="*60)
    
    try:
        # Проверяем наличие пароля
        if not SMTP_PASSWORD:
            print("❌ ОШИБКА: SMTP_PASSWORD не установлен!")
            return False
            
        print(f"📧 SMTP_HOST: {SMTP_HOST}")
        print(f"📧 SMTP_PORT: {SMTP_PORT}")
        print(f"📧 SMTP_USER: {SMTP_USER}")
        print(f"📧 SMTP_PASSWORD: {'*' * len(SMTP_PASSWORD)} (длина: {len(SMTP_PASSWORD)})")
        
        # Создаём письмо
        print("📨 Создание письма...")
        msg = MIMEMultipart()
        msg['From'] = SMTP_USER
        msg['To'] = email
        msg['Subject'] = "🔐 Восстановление пароля в GiftHarbor"
        
        # Ссылка для сброса
        reset_link = f"http://localhost:3000/reset-password?token={token}"
        print(f"🔗 Ссылка для сброса: {reset_link}")
        
        # Красивое HTML-письмо
        body = f"""
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: #ffffff; border-radius: 16px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 25px;">
                    <div style="background-color: #FFDAB9; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                        <span style="font-size: 40px;">🎁</span>
                    </div>
                    <h1 style="color: #2F4F4F; font-size: 28px; margin-top: 15px; margin-bottom: 5px;">GiftHarbor</h1>
                    <p style="color: #666; font-size: 16px; margin: 0;">Восстановление доступа к аккаунту</p>
                </div>
                
                <p style="color: #333; font-size: 16px; line-height: 1.5;">Здравствуйте!</p>
                <p style="color: #333; font-size: 16px; line-height: 1.5;">Мы получили запрос на восстановление пароля для вашего аккаунта в GiftHarbor.</p>
                
                <div style="text-align: center; margin: 35px 0;">
                    <a href="{reset_link}" style="display: inline-block; padding: 15px 35px; background-color: #CC7F4B; color: white; text-decoration: none; border-radius: 50px; font-size: 18px; font-weight: 600; box-shadow: 0 4px 8px rgba(204,127,75,0.3); transition: transform 0.2s;">
                        🔑 Сбросить пароль
                    </a>
                </div>
                
                <p style="color: #666; font-size: 14px; line-height: 1.5;">Ссылка действительна в течение <strong>30 минут</strong>.</p>
                <p style="color: #666; font-size: 14px; line-height: 1.5;">Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо.</p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0 20px;">
                
                <p style="color: #999; font-size: 13px; text-align: center; margin: 0;">
                    С любовью, команда GiftHarbor ❤️<br>
                    <span style="font-size: 12px;">Дарите радость вместе с нами</span>
                </p>
            </div>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(body, 'html'))
        
        # Подключаемся к серверу
        print("📤 Подключение к SMTP серверу...")
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=30)
        server.set_debuglevel(1)  # Включаем подробный вывод команд SMTP
        
        print("🔐 Включение TLS...")
        server.starttls()
        
        print("🔑 Попытка входа в аккаунт...")
        server.login(SMTP_USER, SMTP_PASSWORD)
        
        print("📨 Отправка письма...")
        server.send_message(msg)
        
        print("👋 Закрытие соединения...")
        server.quit()
        
        print(f"✅ ПИСЬМО УСПЕШНО ОТПРАВЛЕНО на {email}!")
        print("="*60 + "\n")
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        print(f"❌ ОШИБКА АУТЕНТИФИКАЦИИ: {str(e)}")
        print("🔧 Возможные причины:")
        print("   1. Неправильный пароль приложения")
        print("   2. Пароль приложения содержит пробелы")
        print("   3. Не включена двухфакторная аутентификация")
        print("   4. Google заблокировал доступ для 'менее безопасных приложений'")
        return False
        
    except smtplib.SMTPException as e:
        print(f"❌ SMTP ОШИБКА: {str(e)}")
        traceback.print_exc()
        return False
        
    except Exception as e:
        print(f"❌ НЕИЗВЕСТНАЯ ОШИБКА: {type(e).__name__}: {str(e)}")
        traceback.print_exc()
        return False

def send_reset_email_dev(email: str, token: str):
    """Для разработки — просто выводим токен в консоль"""
    print("\n" + "="*50)
    print("🔐 ВОССТАНОВЛЕНИЕ ПАРОЛЯ (РЕЖИМ РАЗРАБОТКИ)")
    print(f"Email: {email}")
    print(f"Токен: {token}")
    print(f"Ссылка: http://localhost:3000/reset-password?token={token}")
    print("="*50 + "\n")
    return True

@router.post("/forgot-password", response_model=PasswordResetResponse)
async def forgot_password(
    request: PasswordResetRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Запрос на сброс пароля"""
    print(f"\n🔔 ПОЛУЧЕН ЗАПРОС НА СБРОС ПАРОЛЯ ДЛЯ: {request.email}")
    
    # Ищем пользователя
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        print(f"⚠️ Пользователь {request.email} не найден в БД")
        return {"message": "Если email зарегистрирован, на него отправлена инструкция"}
    
    print(f"✅ Пользователь {user.email} найден (ID: {user.id})")
    
    # Генерируем уникальный токен
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(minutes=30)
    print(f"🔐 Сгенерирован токен: {token}")
    print(f"⏰ Истекает: {expires_at}")
    
    # Сохраняем в БД
    reset = PasswordReset(
        user_id=user.id,
        token=token,
        expires_at=expires_at
    )
    db.add(reset)
    db.commit()
    print(f"💾 Токен сохранён в БД (ID: {reset.id})")
    
    # ОТПРАВЛЯЕМ РЕАЛЬНОЕ ПИСЬМО
    print(f"📧 Запуск отправки письма в фоновом режиме...")
    background_tasks.add_task(send_reset_email, request.email, token)
    
    print(f"✅ Запрос на сброс пароля обработан")
    return {"message": "Если email зарегистрирован, на него отправлена инструкция"}

@router.post("/reset-password", response_model=PasswordResetResponse)
def reset_password(
    request: PasswordResetConfirm,
    db: Session = Depends(get_db)
):
    """Сброс пароля по токену"""
    print(f"\n🔔 ПОЛУЧЕН ЗАПРОС НА СБРОС ПАРОЛЯ С ТОКЕНОМ: {request.token[:10]}...")
    
    # Ищем токен
    reset = db.query(PasswordReset).filter(
        PasswordReset.token == request.token,
        PasswordReset.used == False,
        PasswordReset.expires_at > datetime.utcnow()
    ).first()
    
    if not reset:
        print(f"❌ Токен недействителен или истёк")
        raise HTTPException(status_code=400, detail="Недействительный или истёкший токен")
    
    print(f"✅ Токен действителен для пользователя ID: {reset.user_id}")
    
    # Находим пользователя
    user = db.query(User).filter(User.id == reset.user_id).first()
    if not user:
        print(f"❌ Пользователь с ID {reset.user_id} не найден")
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    # Обновляем пароль
    new_hashed = get_password_hash(request.new_password)
    user.hashed_password = new_hashed
    
    # Помечаем токен как использованный
    reset.used = True
    
    db.commit()
    
    print(f"✅ Пароль успешно изменён для пользователя {user.email}")
    return {"message": "Пароль успешно изменён"}