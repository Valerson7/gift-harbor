"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, ArrowLeft, Mail, KeyRound } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

// Основной компонент, который использует useSearchParams
function ResetPasswordContent() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"request" | "reset" | "success">("request");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  React.useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
      setStep("reset");
    }
  }, [searchParams]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.post('/auth/forgot-password', { email });
      setStep("reset");
    } catch (error) {
      console.error("Ошибка запроса сброса:", error);
      alert("Произошла ошибка. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (newPassword.length < 6) {
      alert("Пароль должен быть не менее 6 символов");
      setLoading(false);
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      alert("Пароль должен содержать хотя бы одну заглавную букву");
      setLoading(false);
      return;
    }
    if (!/\d/.test(newPassword)) {
      alert("Пароль должен содержать хотя бы одну цифру");
      setLoading(false);
      return;
    }
    
    try {
      await api.post('/auth/reset-password', {
        token,
        new_password: newPassword
      });
      setStep("success");
    } catch (error: any) {
      console.error("Ошибка сброса пароля:", error);
      if (error.response?.status === 400) {
        alert("Недействительный или истёкший токен. Запросите сброс заново.");
        setStep("request");
      } else {
        alert("Произошла ошибка. Попробуйте позже.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md border-2 border-peach/20">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-peach/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8 text-terracotta" />
          </div>
          <CardTitle className="font-playfair text-3xl text-storm">
            {step === "request" && "Восстановление пароля"}
            {step === "reset" && "Новый пароль"}
            {step === "success" && "Пароль изменён!"}
          </CardTitle>
          <CardDescription>
            {step === "request" && "Введите email, указанный при регистрации"}
            {step === "reset" && "Придумайте новый надёжный пароль"}
            {step === "success" && "Теперь вы можете войти с новым паролем"}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {step === "request" && (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Ваш email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-lg border-peach/30 focus:border-terracotta"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-full btn-hover bg-terracotta hover:bg-[#b36b3f] text-white"
              >
                {loading ? "Отправка..." : "Отправить инструкцию"}
                <Mail className="w-4 h-4 ml-2" />
              </Button>
            </form>
          )}
          
          {step === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Новый пароль"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="rounded-lg border-peach/30 focus:border-terracotta"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Пароль должен содержать: минимум 6 символов, заглавную букву и цифру
                </p>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-full btn-hover bg-terracotta hover:bg-[#b36b3f] text-white"
              >
                {loading ? "Сохранение..." : "Сохранить новый пароль"}
                <KeyRound className="w-4 h-4 ml-2" />
              </Button>
            </form>
          )}
          
          {step === "success" && (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <Button
                onClick={() => router.push('/login')}
                className="rounded-full btn-hover bg-terracotta hover:bg-[#b36b3f] text-white"
              >
                Перейти к входу
              </Button>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="justify-center">
          <Link
            href="/login"
            className="text-sm text-terracotta hover:underline flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            Вернуться к входу
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

// Экспортируем страницу с обёрткой Suspense
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-8 flex items-center justify-center min-h-screen">Загрузка...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}