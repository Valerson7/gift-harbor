"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createItem, getWishlists } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Gift } from "lucide-react";
import Link from "next/link";

export default function CreateItemPage() {
  const [wishlists, setWishlists] = useState<any[]>([]);
  const [selectedWishlist, setSelectedWishlist] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [url, setUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadWishlists();
  }, []);

  const loadWishlists = async () => {
    try {
      const data = await getWishlists();
      setWishlists(data);
      if (data.length > 0) {
        setSelectedWishlist(data[0].id.toString());
      }
    } catch (error) {
      console.error("Error loading wishlists:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedWishlist) {
      alert("Выберите вишлист");
      return;
    }
    
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 10) {
      alert("Цена должна быть не менее $10");
      return;
    }

    setLoading(true);
    try {
      await createItem(
        parseInt(selectedWishlist),
        name,
        priceNum,
        description,
        url || undefined,
        imageUrl || undefined
      );
      router.push("/wishlists");
    } catch (error) {
      console.error("Error creating item:", error);
      alert("Ошибка при создании товара");
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

      <Card className="border-2 border-peach/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-peach/30 rounded-full flex items-center justify-center">
              <Gift className="w-6 h-6 text-terracotta" />
            </div>
            <div>
              <CardTitle className="font-playfair text-2xl text-storm">
                Добавить новый подарок
              </CardTitle>
              <CardDescription>
                Заполните информацию о подарке
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-storm mb-1 block">
                Вишлист *
              </label>
              <select
                value={selectedWishlist}
                onChange={(e) => setSelectedWishlist(e.target.value)}
                className="w-full rounded-lg border border-peach/30 bg-white px-3 py-2 text-storm focus:border-terracotta focus:outline-none"
                required
              >
                <option value="">Выберите вишлист</option>
                {wishlists.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-storm mb-1 block">
                Название подарка *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Например: Наушники Sony"
                required
                className="rounded-lg border-peach/30 focus:border-terracotta"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-storm mb-1 block">
                Описание
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Краткое описание подарка..."
                className="rounded-lg border-peach/30 focus:border-terracotta"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-storm mb-1 block">
                Цена ($) *
              </label>
              <Input
                type="number"
                min="10"
                step="10"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="349"
                required
                className="rounded-lg border-peach/30 focus:border-terracotta"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Минимальная цена: $10
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-storm mb-1 block">
                Ссылка на товар
              </label>
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="rounded-lg border-peach/30 focus:border-terracotta"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-storm mb-1 block">
                Ссылка на картинку
              </label>
              <Input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="rounded-lg border-peach/30 focus:border-terracotta"
              />
            </div>
          </CardContent>

          <CardFooter className="flex gap-4">
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
              {loading ? "Создание..." : "Добавить подарок"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}