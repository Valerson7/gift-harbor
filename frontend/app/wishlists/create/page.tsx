"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createWishlist } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Gift } from "lucide-react";

export default function CreateWishlistPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert("Название вишлиста обязательно");
      return;
    }

    setLoading(true);
    try {
      await createWishlist(title, description, isPublic);
      router.push("/wishlists");
    } catch (error) {
      console.error("Error creating wishlist:", error);
      alert("Ошибка при создании вишлиста");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-storm hover:text-terracotta transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад
      </button>

      <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-peach/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-peach/30 rounded-full flex items-center justify-center">
            <Gift className="w-6 h-6 text-terracotta" />
          </div>
          <h1 className="font-playfair text-3xl font-semibold text-storm">
            Создать новый вишлист
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title" className="text-storm font-medium">
              Название *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: День рождения 2026"
              className="mt-1 rounded-lg border-peach/30 focus:border-terracotta focus:ring-terracotta"
              maxLength={100}
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-storm font-medium">
              Описание
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Расскажите, чему будет посвящён этот список желаний..."
              className="mt-1 rounded-lg border-peach/30 focus:border-terracotta focus:ring-terracotta"
              rows={4}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
              className="data-[state=checked]:bg-terracotta"
            />
            <Label htmlFor="public" className="text-storm">
              Публичный вишлист (доступен по ссылке всем)
            </Label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1 rounded-full btn-hover border-terracotta text-terracotta hover:bg-terracotta hover:text-white"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-full btn-hover bg-terracotta hover:bg-[#b36b3f] text-white"
            >
              {loading ? "Создание..." : "Создать вишлист"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}