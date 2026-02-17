"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getItemsByWishlist, Item, getItemProgress, ItemProgress } from "@/lib/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, DollarSign } from "lucide-react";
import Link from "next/link";

const getImageUrl = (name: string) => {
  const images: Record<string, string> = {
    'Наушники Sony WH-1000XM5': 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=300',
    'Apple Watch Series 9': 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=300',
    'PlayStation 5 Slim': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=300',
    'Книга «Грокаем алгоритмы»': 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300',
    'Электрогитара Yamaha Pacifica 112V': 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=300',
    'Кофемашина De\'Longhi Dedica': 'https://images.unsplash.com/photo-1525088553748-01d6e210e00b?w=300',
    'Монитор LG UltraGear 27" 1440p': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300',
    'Микрофон Blue Yeti USB': 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=300',
    'Смартфон Google Pixel 7a': 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300',
    'Умные весы Xiaomi Mi Body Composition 2': 'https://images.unsplash.com/photo-1576670399724-3c318d6cd0b4?w=300',
    'Набор косметики Lush': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300',
    'Сковорода De Buyer Mineral B 26см': 'https://images.unsplash.com/photo-1584990347449-a7aa05d4f80f?w=300',
    'Чемодан алюминиевый Away Carry-On': 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=300',
    'Настольная игра «Билет на поезд»': 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=300',
    'Кресло компьютерное DXRacer': 'https://images.unsplash.com/photo-1586158775613-8c3ee053bdae?w=300'
  };
  return images[name] || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=300';
};

export default function PublicWishlistPage() {
  const params = useParams();
  const wishlistId = parseInt(params.id as string);
  const [items, setItems] = useState<Item[]>([]);
  const [progress, setProgress] = useState<Record<number, ItemProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, [wishlistId]);

  const loadWishlist = async () => {
    try {
      const itemsData = await getItemsByWishlist(wishlistId);
      setItems(itemsData);
      
      const progressData: Record<number, ItemProgress> = {};
      for (const item of itemsData) {
        try {
          const itemProgress = await getItemProgress(item.id);
          progressData[item.id] = itemProgress;
        } catch (e) {
          console.log(`Progress not available for item ${item.id}`);
        }
      }
      setProgress(progressData);
    } catch (error) {
      console.error("Error loading wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-terracotta border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-storm">Загрузка вишлиста...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="font-playfair text-4xl font-bold text-storm mb-2">🎁 Подарки</h1>
        <p className="text-storm/70">Выберите, что хотите подарить</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const itemProgress = progress[item.id];
          const collected = itemProgress?.total_collected || 0;
          const percent = itemProgress?.progress_percent || 0;
          const contributors = itemProgress?.contributors_count || 0;

          return (
            <Card key={item.id} className="overflow-hidden hover:shadow-xl transition-all">
              <img 
                src={getImageUrl(item.name)}
                alt={item.name}
                className="w-full h-48 object-cover"
              />
              <CardHeader>
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <CardDescription className="line-clamp-2">{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-terracotta mb-2">${item.price}</p>
                
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Собрано: ${collected}</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {contributors}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-peach/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-terracotta transition-all duration-500"
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/items/${item.id}`} className="w-full">
                  <Button className="w-full rounded-full btn-hover bg-terracotta hover:bg-[#b36b3f] text-white">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Подробнее
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="text-center mt-8">
        <Link href="/login" className="text-terracotta hover:underline">
          Хотите создать свой вишлист? Войдите в аккаунт
        </Link>
      </div>
    </div>
  );
}