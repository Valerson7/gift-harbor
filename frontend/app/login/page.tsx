"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, register } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      router.push("/wishlists");
    } catch (error) {
      console.error("Login error:", error);
      alert("Ошибка входа. Проверьте email и пароль.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      alert("Пароль должен быть не менее 6 символов");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      alert("Пароль должен содержать хотя бы одну заглавную букву");
      return;
    }
    if (!/\d/.test(password)) {
      alert("Пароль должен содержать хотя бы одну цифру");
      return;
    }
    setLoading(true);
    try {
      await register(email, password, fullName);
      // После регистрации сразу логинимся
      await login(email, password);
      router.push("/wishlists");
    } catch (error: any) {
      console.error("Register error:", error);
      if (error.response?.data?.detail === "Email already registered") {
        alert("Этот email уже зарегистрирован. Попробуйте войти.");
      } else {
        alert("Ошибка регистрации");
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
            GiftHarbor
          </CardTitle>
          <CardDescription>
            Войдите или зарегистрируйтесь, чтобы продолжить
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="rounded-lg border-peach/30 focus:border-terracotta"
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="rounded-lg border-peach/30 focus:border-terracotta"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full btn-hover bg-terracotta hover:bg-[#b36b3f] text-white"
                >
                  {loading ? "Вход..." : "Войти"}
                </Button>
                
                {/* ССЫЛКА НА ВОССТАНОВЛЕНИЕ ПАРОЛЯ */}
                <div className="text-center mt-2">
                  <Link
                    href="/reset-password"
                    className="text-sm text-terracotta hover:underline"
                  >
                    Забыли пароль?
                  </Link>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Имя"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="rounded-lg border-peach/30 focus:border-terracotta"
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="rounded-lg border-peach/30 focus:border-terracotta"
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Пароль (мин. 6 символов, заглавная буква, цифра)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="rounded-lg border-peach/30 focus:border-terracotta"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full btn-hover bg-terracotta hover:bg-[#b36b3f] text-white"
                >
                  {loading ? "Регистрация..." : "Зарегистрироваться"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground">
          После входа вы сможете создавать вишлисты и добавлять подарки
        </CardFooter>
      </Card>
    </div>
  );
}