import axios from 'axios';

const API_URL = 'http://localhost:8080';

// Наши 15 товаров
const items = [
  {
    name: "🎧 Наушники Sony WH-1000XM5",
    description: "Лучшие беспроводные наушники с шумоподавлением. Идеальны для музыки и путешествий.",
    price: 349,
    url: "https://www.sony.com/electronics/headband-headphones/wh-1000xm5",
    image_url: "https://m.media-amazon.com/images/I/61+btxzpfDL._AC_SL1500_.jpg"
  },
  {
    name: "⌚ Apple Watch Series 9",
    description: "Умные часы с дисплеем Always-On, измерением кислорода в крови и ЭКГ.",
    price: 399,
    url: "https://www.apple.com/apple-watch-series-9/",
    image_url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/watch-case-45-aluminum-midnight-nc-s9_VW_PF+watch-face-45-aluminum-midnight-s9_VW_PF"
  },
  {
    name: "🎮 PlayStation 5 Slim",
    description: "Игровая приставка нового поколения с быстрой загрузкой и потрясающей графикой.",
    price: 449,
    url: "https://www.playstation.com/ps5/",
    image_url: "https://gmedia.playstation.com/is/image/SIEPDC/ps5-slim-group-image-01-en-14sep23"
  },
  {
    name: "📚 Книга «Грокаем алгоритмы»",
    description: "Иллюстрированное пособие для программистов. Алгоритмы становятся понятными и интересными.",
    price: 29,
    url: "https://www.piter.com/product/grokaem-algoritmy",
    image_url: "https://www.piter.com/upload/iblock/1c3/1c3a1f3c5b5c5c5c5c5c5c5c5c5c5c5c.png"
  },
  {
    name: "🎸 Электрогитара Yamaha Pacifica 112V",
    description: "Отличная гитара для начинающих и опытных музыкантов. Звук, качество, стиль.",
    price: 549,
    url: "https://ru.yamaha.com/products/musical_instruments/guitars_basses/electric_guitars/pacifica/pacifica_112v/index.html",
    image_url: "https://cdn.yamaha.com/ru/images/products/guitars_basses/electric_guitars/pacifica/112v/pacifica_112v_bl_main_22780_141222_940x940.jpg"
  },
  {
    name: "☕ Кофемашина De'Longhi Dedica",
    description: "Компактная кофемашина для идеального эспрессо и капучино дома.",
    price: 249,
    url: "https://www.delonghi.com/ru-ru/products/coffee/espresso-machines/dedica-ec-680-ec680",
    image_url: "https://images.delonghi.com/ec680.m_w1200"
  },
  {
    name: "🖥️ Монитор LG UltraGear 27\" 1440p",
    description: "Игровой монитор с частотой 165 Гц и быстрым IPS матрицей.",
    price: 299,
    url: "https://www.lg.com/us/monitors/lg-27gp850-b",
    image_url: "https://www.lg.com/us/images/monitors/md07511876/gallery/large01.jpg"
  },
  {
    name: "🎤 Микрофон Blue Yeti USB",
    description: "Профессиональный USB-микрофон для подкастов, стримов и записи.",
    price: 129,
    url: "https://www.bluemic.com/yeti/",
    image_url: "https://www.bluemic.com/media/catalog/product/cache/1/image/1800x/040ec09b1e35df139433887a97daa66f/y/e/yeti_black_1.png"
  },
  {
    name: "📱 Смартфон Google Pixel 7a",
    description: "Качественный смартфон с отличной камерой и чистым Android.",
    price: 349,
    url: "https://store.google.com/product/pixel_7a",
    image_url: "https://lh3.googleusercontent.com/2gB3b5qQ5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5"
  },
  {
    name: "🏋️ Умные весы Xiaomi Mi Body Composition 2",
    description: "Весы с анализом состава тела: вес, процент жира, мышц, костной массы.",
    price: 29,
    url: "https://www.mi.com/ru/product/mi-body-composition-scale-2/",
    image_url: "https://i01.appmifile.com/webfile/globalimg/products/electronics/mi-body-composition-scale-2/gallery-img-1.jpg"
  },
  {
    name: "🎁 Набор косметики Lush (праздничный)",
    description: "Подарочный набор натуральной косметики: бомбочки для ванн, мыло, кремы.",
    price: 59,
    url: "https://www.lush.com/ru/ru/gifts",
    image_url: "https://www.lush.com/ru/ru/media/images/products/gift-boxes/gift-box-1.jpg"
  },
  {
    name: "🍳 Сковорода De Buyer Mineral B 26см",
    description: "Профессиональная сковорода из углеродистой стали, любимая поварами.",
    price: 69,
    url: "https://www.debuyer.com/en/mineral-b/369-mineral-b-fry-pan-26-cm.html",
    image_url: "https://www.debuyer.com/1815-thickbox_default/mineral-b-fry-pan-26-cm.jpg"
  },
  {
    name: "🧳 Чемодан алюминиевый Away Carry-On",
    description: "Стильный и прочный алюминиевый чемодан для путешествий.",
    price: 275,
    url: "https://www.awaytravel.com/luggage/carry-on/aluminum",
    image_url: "https://images.awaytravel.com/tr:w-1200,h-1200,c-at_max/media/catalog/product/c/a/carry-on-aluminum-silver.jpg"
  },
  {
    name: "🎲 Настольная игра «Билет на поезд»",
    description: "Культовая настольная стратегия о железных дорогах. Для компании и семьи.",
    price: 49,
    url: "https://hobbyworld.ru/bilet-na-poezd",
    image_url: "https://hobbyworld.ru/upload/iblock/8b1/8b1a1f3c5b5c5c5c5c5c5c5c5c5c5c5c.jpg"
  },
  {
    name: "💺 Кресло компьютерное DXRacer",
    description: "Эргономичное игровое кресло с поддержкой спины и подголовником.",
    price: 349,
    url: "https://www.dxracer.com/ru-ru/",
    image_url: "https://www.dxracer.com/ru-ru/media/catalog/product/d/r/dr_1.png"
  }
];

async function addItemsToAllWishlists() {
  // Получаем токен из аргументов командной строки
  const token = process.argv[2];
  
  if (!token) {
    console.log('❌ Укажите токен: npx ts-node auto-add-items.ts "ваш_токен"');
    return;
  }

  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  try {
    // Получаем все вишлисты пользователя
    const wishlistsResponse = await axiosInstance.get('/wishlists');
    const wishlists = wishlistsResponse.data;

    if (wishlists.length === 0) {
      console.log('❌ У пользователя нет вишлистов. Сначала создайте вишлист.');
      return;
    }

    console.log(`📋 Найдено вишлистов: ${wishlists.length}`);

    // Для каждого вишлиста добавляем товары
    for (const wishlist of wishlists) {
      console.log(`\n📋 Обрабатываем вишлист ID: ${wishlist.id} (${wishlist.title})`);
      
      // Получаем текущие товары в вишлисте
      const existingItems = await axiosInstance.get(`/items/wishlist/${wishlist.id}`);
      const existingNames = new Set(existingItems.data.map((item: any) => item.name));
      
      let added = 0;
      let skipped = 0;

      for (const item of items) {
        if (existingNames.has(item.name)) {
          console.log(`⏭️ Пропущен (уже есть): ${item.name}`);
          skipped++;
          continue;
        }

        try {
          await axiosInstance.post('/items', {
            wishlist_id: wishlist.id,
            name: item.name,
            description: item.description,
            price: item.price,
            url: item.url,
            image_url: item.image_url
          });
          console.log(`✅ Добавлен: ${item.name} ($${item.price})`);
          added++;
        } catch (error: any) {
          console.log(`❌ Ошибка при добавлении ${item.name}:`, error.response?.data?.detail || error.message);
        }
      }

      console.log(`\n📊 Итог по вишлисту ${wishlist.id}: добавлено ${added}, пропущено ${skipped}`);
    }

    console.log('\n🎉 Готово! Товары добавлены во все вишлисты.');
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

addItemsToAllWishlists();