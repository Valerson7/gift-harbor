"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getWishlists, Wishlist, getItemsByWishlist, Item, getItemProgress, ItemProgress, deleteItem, deleteWishlist } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Gift, Users, DollarSign, LogOut, Trash2, PlusCircle } from "lucide-react";
import Link from "next/link";

const getImageUrl = (name: string) => {
  // ТОЧНЫЕ ФОТОГРАФИИ С МАГАЗИНОВ ДЛЯ КАЖДОГО ТОВАРА
  const images: Record<string, string> = {
    // Наушники Sony WH-1000XM5 - НОВОЕ ФОТО
    'Наушники Sony WH-1000XM5': 'https://m.media-amazon.com/images/I/61+btxzpfDL._AC_SL1500_.jpg?w=300',
    'sony': 'https://m.media-amazon.com/images/I/61+btxzpfDL._AC_SL1500_.jpg?w=300',
    'наушники': 'https://m.media-amazon.com/images/I/61+btxzpfDL._AC_SL1500_.jpg?w=300',
    
    // Apple Watch Series 9 (оставляем старую, она подходит)
    'Apple Watch Series 9': 'https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg?w=300',
    'apple': 'https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg?w=300',
    
    // PlayStation 5 Slim (оставляем старую)
    'PlayStation 5 Slim': 'https://images.pexels.com/photos/3945657/pexels-photo-3945657.jpeg?w=300',
    'playstation': 'https://images.pexels.com/photos/3945657/pexels-photo-3945657.jpeg?w=300',
    
    // Книга «Грокаем алгоритмы» (оставляем старую)
    'Книга «Грокаем алгоритмы»': 'https://images.pexels.com/photos/256450/pexels-photo-256450.jpeg?w=300',
    'книга': 'https://images.pexels.com/photos/256450/pexels-photo-256450.jpeg?w=300',
    
    // Электрогитара Yamaha Pacifica 112V [citation:2][citation:9]
    'Электрогитара Yamaha Pacifica 112V': 'https://www.gear4music.com/dw/image/v2/BDWZ_PRD/on/demandware.static/-/Sites-gear4music-master-catalog/default/dw2b081711/products/177014/177014_PS.jpg?sw=300',
    'гитара': 'https://www.gear4music.com/dw/image/v2/BDWZ_PRD/on/demandware.static/-/Sites-gear4music-master-catalog/default/dw2b081711/products/177014/177014_PS.jpg?sw=300',
    'yamaha': 'https://www.gear4music.com/dw/image/v2/BDWZ_PRD/on/demandware.static/-/Sites-gear4music-master-catalog/default/dw2b081711/products/177014/177014_PS.jpg?sw=300',
    
    // Кофемашина De'Longhi Dedica [citation:3][citation:10]
    'Кофемашина De\'Longhi Dedica': 'https://www.euronics.lv/UserFiles/Products/Images/160337-ec685.png?w=300',
    'кофемашина': 'https://www.euronics.lv/UserFiles/Products/Images/160337-ec685.png?w=300',
    'delonghi': 'https://www.euronics.lv/UserFiles/Products/Images/160337-ec685.png?w=300',
    
    // Монитор LG UltraGear 27" 1440p (оставляем старую)
    'Монитор LG UltraGear 27" 1440p': 'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?w=300',
    'монитор': 'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?w=300',
    
    // Микрофон Blue Yeti USB (оставляем старую)
    'Микрофон Blue Yeti USB': 'https://images.pexels.com/photos/3784221/pexels-photo-3784221.jpeg?w=300',
    'микрофон': 'https://images.pexels.com/photos/3784221/pexels-photo-3784221.jpeg?w=300',
    
    // Смартфон Google Pixel 7a (оставляем старую)
    'Смартфон Google Pixel 7a': 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?w=300',
    'смартфон': 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?w=300',
    
    // Умные весы Xiaomi Mi Body Composition 2 (оставляем старую)
    'Умные весы Xiaomi Mi Body Composition 2': 'https://images.pexels.com/photos/4397820/pexels-photo-4397820.jpeg?w=300',
    'весы': 'https://images.pexels.com/photos/4397820/pexels-photo-4397820.jpeg?w=300',
    'xiaomi': 'https://images.pexels.com/photos/4397820/pexels-photo-4397820.jpeg?w=300',
    
    // Набор косметики Lush (оставляем старую)
    'Набор косметики Lush': 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?w=300',
    'косметика': 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?w=300',
    
    // Сковорода De Buyer Mineral B 26см [citation:4]
    'Сковорода De Buyer Mineral B 26см': 'https://content1.rozetka.com.ua/goods/images/big/297589796.jpg?w=300',
    'сковорода': 'https://content1.rozetka.com.ua/goods/images/big/297589796.jpg?w=300',
    'de buyer': 'https://content1.rozetka.com.ua/goods/images/big/297589796.jpg?w=300',
    
    // Чемодан алюминиевый Away Carry-On [citation:5]
    'Чемодан алюминиевый Away Carry-On': 'https://i.ebayimg.com/images/g/iV4AAOSwkFtlfRcM/s-l1600.jpg?w=300',
    'чемодан': 'https://i.ebayimg.com/images/g/iV4AAOSwkFtlfRcM/s-l1600.jpg?w=300',
    'away': 'https://i.ebayimg.com/images/g/iV4AAOSwkFtlfRcM/s-l1600.jpg?w=300',
    
    // Настольная игра «Билет на поезд» [citation:6]
    'Настольная игра «Билет на поезд»': 'https://gaga.ru/upload/iblock/2f7/2f72b3ba90b1c943b2e16a6c79847aa3.jpg?w=300',
    'настольная': 'https://gaga.ru/upload/iblock/2f7/2f72b3ba90b1c943b2e16a6c79847aa3.jpg?w=300',
    'билет на поезд': 'https://gaga.ru/upload/iblock/2f7/2f72b3ba90b1c943b2e16a6c79847aa3.jpg?w=300',
    
    // Кресло компьютерное DXRacer [citation:7]
    'Кресло компьютерное DXRacer': 'https://images.pexels.com/photos/1957477/pexels-photo-1957477.jpeg?w=300',
    'кресло': 'https://images.pexels.com/photos/1957477/pexels-photo-1957477.jpeg?w=300',
    'dxracer': 'https://images.pexels.com/photos/1957477/pexels-photo-1957477.jpeg?w=300'
  };

  // Сначала ищем по точному названию
  if (images[name]) {
    return images[name];
  }

  // Если нет, ищем по ключевым словам
  const lowerName = name.toLowerCase();
  for (const [key, url] of Object.entries(images)) {
    if (lowerName.includes(key.toLowerCase())) {
      return url;
    }
  }

  // Заглушка, если ничего не найдено
  return 'https://images.pexels.com/photos/909907/pexels-photo-909907.jpeg?w=300';
};

export default function WishlistsPage() {
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [selectedWishlist, setSelectedWishlist] = useState<Wishlist | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [progress, setProgress] = useState<Record<number, ItemProgress>>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadWishlists();
  };

  const loadWishlists = async () => {
    try {
      const data = await getWishlists();
      setWishlists(data);
      if (data.length > 0) {
        selectWishlist(data[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading wishlists:", error);
      router.push('/login');
    }
  };

  const selectWishlist = async (wishlist: Wishlist) => {
    setSelectedWishlist(wishlist);
    try {
      const itemsData = await getItemsByWishlist(wishlist.id);
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
      console.error("Error loading items:", error);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (confirm('Удалить этот товар из вишлиста?')) {
      try {
        await deleteItem(itemId);
        if (selectedWishlist) {
          const updatedItems = items.filter(item => item.id !== itemId);
          setItems(updatedItems);
        }
      } catch (error) {
        console.error("Error deleting item:", error);
        alert('Ошибка при удалении товара');
      }
    }
  };

  const handleDeleteWishlist = async (wishlistId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Удалить этот вишлист? Все товары внутри тоже будут удалены.')) {
      try {
        await deleteWishlist(wishlistId);
        const updatedWishlists = wishlists.filter(w => w.id !== wishlistId);
        setWishlists(updatedWishlists);
        if (selectedWishlist?.id === wishlistId) {
          setSelectedWishlist(updatedWishlists[0] || null);
          if (updatedWishlists[0]) {
            selectWishlist(updatedWishlists[0]);
          } else {
            setItems([]);
          }
        }
      } catch (error) {
        console.error("Error deleting wishlist:", error);
        alert('Ошибка при удалении вишлиста');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-terracotta border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-storm">Загрузка ваших вишлистов...</p>
        </div>
      </div>
    );
  }

  if (wishlists.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="rounded-full btn-hover border-terracotta text-terracotta hover:bg-terracotta hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Выйти
          </Button>
        </div>
        <div className="text-center">
          <div className="w-24 h-24 bg-peach/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Gift className="w-12 h-12 text-terracotta" />
          </div>
          <h2 className="font-playfair text-3xl font-semibold mb-2 text-storm">
            У вас пока нет вишлистов
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Создайте первый вишлист и добавьте в него подарки
          </p>
          <Button 
            size="lg" 
            className="rounded-full px-8 btn-hover bg-terracotta hover:bg-[#b36b3f] text-white"
            onClick={() => router.push('/wishlists/create')}
          >
            Создать вишлист
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-playfair text-3xl font-semibold text-storm">Мои вишлисты</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/wishlists/create')}
            className="rounded-full btn-hover border-terracotta text-terracotta hover:bg-terracotta hover:text-white"
          >
            <PlusCircle className="w-4 h-4 mr-1" />
            Добавить
          </Button>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="rounded-full btn-hover border-terracotta text-terracotta hover:bg-terracotta hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Выйти
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {wishlists.map((wishlist) => (
          <Card 
            key={wishlist.id} 
            className={`cursor-pointer transition-all btn-hover relative group ${
              selectedWishlist?.id === wishlist.id 
                ? 'border-terracotta border-2 shadow-lg' 
                : 'hover:border-peach hover:shadow-md'
            }`}
            onClick={() => selectWishlist(wishlist)}
          >
            <button
              onClick={(e) => handleDeleteWishlist(wishlist.id, e)}
              className="absolute top-2 right-2 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-50"
              title="Удалить вишлист"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
            <CardHeader>
              <CardTitle className="text-storm">{wishlist.title}</CardTitle>
              {wishlist.description && (
                <CardDescription>{wishlist.description}</CardDescription>
              )}
            </CardHeader>
          </Card>
        ))}
      </div>

      {selectedWishlist && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-playfair text-2xl font-semibold text-storm">
              Товары в вишлисте
            </h2>
            <Button
              onClick={() => router.push('/wishlists/create-item')}
              className="rounded-full btn-hover bg-terracotta hover:bg-[#b36b3f] text-white"
            >
              <PlusCircle className="w-4 h-4 mr-1" />
              Добавить товар
            </Button>
          </div>

          {items.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">В этом вишлисте пока нет товаров</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => {
                const itemProgress = progress[item.id];
                const collected = itemProgress?.total_collected || 0;
                const percent = itemProgress?.progress_percent || 0;
                const contributors = itemProgress?.contributors_count || 0;

                return (
                  <Card key={item.id} className="overflow-hidden hover:shadow-xl transition-all relative group">
                    <img 
                      src={getImageUrl(item.name)}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/909907/pexels-photo-909907.jpeg?w=300';
                      }}
                    />
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id);
                      }}
                      className="absolute top-2 right-2 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-50"
                      title="Удалить товар"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>

                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg line-clamp-1">{item.name}</CardTitle>
                      <CardDescription className="line-clamp-2 text-sm">{item.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="pb-2">
                      <p className="text-2xl font-bold text-terracotta mb-2">${item.price}</p>
                      
                      <div className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Собрано: ${collected}</span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
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
                      <Button 
                        className="w-full rounded-full btn-hover bg-terracotta hover:bg-[#b36b3f] text-white"
                        onClick={() => router.push(`/items/${item.id}`)}
                      >
                        <DollarSign className="w-4 h-4 mr-1" />
                        Подробнее
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}