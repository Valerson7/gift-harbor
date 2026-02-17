"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getItem, Item, getItemProgress, ItemProgress, contribute, reserveItem } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, DollarSign, Gift, Users, CheckCircle } from "lucide-react";
import Link from "next/link";

const getImageUrl = (name: string) => {
  const images: Record<string, string> = {
    'Наушники Sony WH-1000XM5': 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600',
    'Apple Watch Series 9': 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600',
    'PlayStation 5 Slim': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600',
    'Книга «Грокаем алгоритмы»': 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600',
    'Электрогитара Yamaha Pacifica 112V': 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=600',
    'Кофемашина De\'Longhi Dedica': 'https://images.unsplash.com/photo-1525088553748-01d6e210e00b?w=600',
    'Монитор LG UltraGear 27" 1440p': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600',
    'Микрофон Blue Yeti USB': 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=600',
    'Смартфон Google Pixel 7a': 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600',
    'Умные весы Xiaomi Mi Body Composition 2': 'https://images.unsplash.com/photo-1576670399724-3c318d6cd0b4?w=600',
    'Набор косметики Lush': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600',
    'Сковорода De Buyer Mineral B 26см': 'https://images.unsplash.com/photo-1584990347449-a7aa05d4f80f?w=600',
    'Чемодан алюминиевый Away Carry-On': 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=600',
    'Настольная игра «Билет на поезд»': 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=600',
    'Кресло компьютерное DXRacer': 'https://images.unsplash.com/photo-1586158775613-8c3ee053bdae?w=600'
  };
  return images[name] || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600';
};

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = parseInt(params.id as string);
  
  const [item, setItem] = useState<Item | null>(null);
  const [progress, setProgress] = useState<ItemProgress | null>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItemData();
  }, [itemId]);

  const loadItemData = async () => {
    try {
      const itemData = await getItem(itemId);
      setItem(itemData);
      
      const progressData = await getItemProgress(itemId);
      setProgress(progressData);
    } catch (error) {
      console.error("Error loading item:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleContribute = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Необходимо войти в систему");
      router.push('/login');
      return;
    }

    const value = parseFloat(amount);
    if (isNaN(value) || value < 10) {
      alert("Минимальная сумма вклада: $10");
      return;
    }

    try {
      await contribute(itemId, value);
      const updatedProgress = await getItemProgress(itemId);
      setProgress(updatedProgress);
      setAmount("");
      alert("✅ Вклад успешно добавлен!");
    } catch (error: any) {
      console.error("Error contributing:", error);
      if (error.response?.status === 401) {
        alert("Необходимо войти в систему");
        router.push('/login');
      } else {
        alert("Ошибка при внесении вклада");
      }
    }
  };

  const handleReserve = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Необходимо войти в систему");
      router.push('/login');
      return;
    }

    try {
      await reserveItem(itemId);
      const updatedProgress = await getItemProgress(itemId);
      setProgress(updatedProgress);
      alert("🎉 Подарок зарезервирован!");
    } catch (error: any) {
      console.error("Error reserving:", error);
      if (error.response?.status === 401) {
        alert("Необходимо войти в систему");
        router.push('/login');
      } else if (error.response?.data?.detail === "Item already reserved") {
        alert("Этот подарок уже зарезервирован");
      } else {
        alert("Ошибка при резервации");
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-terracotta border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-storm">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="font-playfair text-3xl font-semibold text-storm mb-4">Товар не найден</h1>
        <Link href="/wishlists" className="text-terracotta hover:underline">
          Вернуться к вишлистам
        </Link>
      </div>
    );
  }

  const collected = progress?.total_collected || 0;
  const percent = progress?.progress_percent || 0;
  const contributors = progress?.contributors_count || 0;
  const remaining = progress?.remaining || item.price;
  const isFullyFunded = progress?.is_fully_funded || false;

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-storm hover:text-terracotta transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Картинка */}
        <div className="rounded-2xl overflow-hidden shadow-xl border-2 border-peach/20">
          <img
            src={getImageUrl(item.name)}
            alt={item.name}
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Информация */}
        <div>
          <h1 className="font-playfair text-3xl font-bold text-storm mb-2">
            {item.name}
          </h1>
          <p className="text-storm/70 mb-4">{item.description}</p>
          
          <div className="text-4xl font-bold text-terracotta mb-6">
            ${item.price}
          </div>

          {/* Прогресс-бар */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-storm">Собрано: ${collected}</span>
              <span className="text-storm flex items-center gap-1">
                <Users className="w-4 h-4" />
                {contributors} чел.
              </span>
            </div>
            <div className="w-full h-3 bg-peach/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-terracotta transition-all duration-500"
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span>{percent.toFixed(1)}%</span>
              <span>Осталось: ${remaining.toFixed(2)}</span>
            </div>
          </div>

          {/* Вклад */}
          <div className="space-y-4">
            {!isFullyFunded ? (
              <>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="10"
                    step="10"
                    placeholder="Сумма ($)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="flex-1 rounded-lg border-peach/30 focus:border-terracotta"
                  />
                  <Button
                    onClick={handleContribute}
                    className="rounded-lg btn-hover bg-terracotta hover:bg-[#b36b3f] text-white"
                  >
                    <DollarSign className="w-4 h-4 mr-1" />
                    Внести
                  </Button>
                </div>

                <Button
                  variant="outline"
                  className="w-full rounded-lg btn-hover border-terracotta text-terracotta hover:bg-terracotta hover:text-white"
                  onClick={handleReserve}
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Зарезервировать подарок
                </Button>
              </>
            ) : (
              <div className="text-center p-4 bg-green-100 text-green-700 rounded-lg flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" />
                🎉 Подарок полностью собран!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}