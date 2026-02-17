"use client";

import React, { useState, useEffect } from 'react';
import { Share2, Copy, Check, Zap, Shield, Users, Gift, ExternalLink } from 'lucide-react';
import { getWishlists } from '@/lib/api';

const categories = [
  { 
    id: 'nodoubles', 
    label: 'Без дубликатов, без пропусков', 
    icon: '🔄',
    title: 'Умная система предотвращения дубликатов',
    description: 'Никто не подарит вам два одинаковых подарка!',
    examples: [
      '✅ Если друг уже зарезервировал наушники Sony — кнопка "Зарезервировать" исчезает',
      '✅ Вы никогда не получите два тостера на день рождения',
      '✅ Все дарители видят актуальный статус каждого подарка'
    ],
    stats: 'Предотвращено дубликатов: 127',
    color: 'from-blue-500/20 to-blue-500/5',
    action: 'protection'
  },
  { 
    id: 'realtime', 
    label: 'Управление в режиме реального времени', 
    icon: '⚡',
    title: 'Мгновенные обновления без перезагрузки',
    description: 'Все изменения видны сразу всем участникам',
    examples: [
      '⚡ Кто-то внёс $50 в подарок — прогресс-бар обновляется у всех',
      '⚡ Подарок зарезервирован — кнопка меняется моментально',
      '⚡ Вы добавили новый вишлист — друзья видят это сразу'
    ],
    stats: 'Скорость обновления: < 100ms',
    color: 'from-yellow-500/20 to-yellow-500/5',
    action: 'realtime'
  },
  { 
    id: 'family', 
    label: 'Доступно для всей семьи', 
    icon: '👨‍👩‍👧‍👦',
    title: 'Собирайте подарки вместе с близкими',
    description: 'Мама, папа, дети, бабушки и дедушки — все могут участвовать',
    examples: [
      '👨 Отец добавил новый вишлист — вся семья видит',
      '👩 Мама внесла вклад в подарок для дочери',
      '🧒 Дети могут предлагать свои идеи подарков'
    ],
    stats: 'Активных семей: 1,234',
    color: 'from-green-500/20 to-green-500/5',
    action: 'family'
  },
  { 
    id: 'share', 
    label: 'Простой и быстрый обмен', 
    icon: '🤝',
    title: 'Делитесь вишлистами в один клик',
    description: 'Отправьте ссылку — и друзья уже могут выбирать подарки',
    examples: [
      '📱 Отправьте ссылку в Telegram — друзья открывают сразу',
      '📧 Поделитесь по email — получают доступ без регистрации',
      '🔗 Скопируйте ссылку — вставьте куда угодно'
    ],
    stats: 'Поделились сегодня: 342 раза',
    color: 'from-purple-500/20 to-purple-500/5',
    action: 'share'
  },
];

export function CategoryStrip() {
  const [activeCategory, setActiveCategory] = useState('nodoubles');
  const [hoveredExample, setHoveredExample] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [wishlistLink, setWishlistLink] = useState('');
  const [wishlistId, setWishlistId] = useState<number | null>(null);

  // Загружаем реальный ID вишлиста при монтировании компонента
  useEffect(() => {
    const fetchFirstWishlist = async () => {
      try {
        const wishlists = await getWishlists();
        if (wishlists && wishlists.length > 0) {
          const firstWishlist = wishlists[0];
          setWishlistId(firstWishlist.id);
          // ИСПРАВЛЕННАЯ ССЫЛКА — теперь ведёт на главную, если вишлиста нет
          setWishlistLink(`http://localhost:3000/wishlist/${firstWishlist.id}`);
        } else {
          // Если вишлистов нет, даём ссылку на создание
          setWishlistLink('http://localhost:3000/wishlists/create');
        }
      } catch (error) {
        console.error('Ошибка загрузки вишлистов:', error);
        setWishlistLink('http://localhost:3000/login');
      }
    };
    fetchFirstWishlist();
  }, []);

  const activeData = categories.find(c => c.id === activeCategory)!;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(wishlistLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!wishlistId) {
      alert('Сначала создайте вишлист!');
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Мой вишлист в GiftHarbor',
          text: 'Посмотри, что я хочу получить в подарок!',
          url: wishlistLink,
        });
      } catch (error) {
        setShowShareModal(true);
      }
    } else {
      setShowShareModal(true);
    }
  };

  const handleAction = () => {
    switch(activeData.action) {
      case 'protection':
        alert('🔄 Система предотвращения дубликатов активна!');
        break;
      case 'realtime':
        alert('⚡ Демонстрация реального времени: представьте, что кто-то только что внёс $50!');
        break;
      case 'family':
        alert('👨‍👩‍👧‍👦 Функция приглашения семьи появится в следующем обновлении!');
        break;
      case 'share':
        handleShare();
        break;
    }
  };

  return (
    <div className="w-full py-8 px-4 bg-gradient-to-b from-peach/5 via-white to-peach/5">
      <div className="relative max-w-6xl mx-auto">
        {/* Полоска с категориями */}
        <div className="flex flex-wrap items-center justify-center gap-4 relative z-10 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`
                relative group flex items-center gap-3 px-6 py-4 rounded-xl
                transition-all duration-500 ease-out
                ${activeCategory === cat.id 
                  ? 'bg-terracotta text-white shadow-2xl scale-105' 
                  : 'bg-white text-storm hover:bg-peach/30 shadow-lg'
                }
              `}
            >
              {/* Эффект светового луча при наведении */}
              <span className="absolute inset-0 rounded-xl overflow-hidden">
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/50 to-transparent" />
              </span>
              
              {/* Иконка */}
              <span className="text-3xl">{cat.icon}</span>
              
              {/* Текст */}
              <span className="text-base md:text-lg font-medium whitespace-nowrap">
                {cat.label}
              </span>

              {/* Активный индикатор */}
              {activeCategory === cat.id && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-white rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>

        {/* Модальное окно для ссылки */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowShareModal(false)}>
            <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-terracotta/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Share2 className="w-8 h-8 text-terracotta" />
                </div>
                <h3 className="font-playfair text-xl font-bold text-storm mb-2">
                  Поделиться вишлистом
                </h3>
                <p className="text-storm/70">
                  Скопируйте ссылку и отправьте друзьям
                </p>
              </div>

              {/* РАБОЧАЯ ССЫЛКА */}
              <div className="bg-peach/20 rounded-xl p-4 mb-4 border-2 border-terracotta/30">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-5 h-5 text-terracotta" />
                  <span className="text-sm font-medium text-storm">Ваша ссылка:</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={wishlistLink}
                    readOnly
                    className="flex-1 bg-white border-2 border-peach rounded-lg px-3 py-2 text-sm text-storm focus:outline-none focus:border-terracotta"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="p-2 bg-terracotta text-white rounded-lg hover:bg-[#b36b3f] transition-all btn-hover"
                    title="Копировать ссылку"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                  <a
                    href={wishlistLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-terracotta text-white rounded-lg hover:bg-[#b36b3f] transition-all btn-hover"
                    title="Открыть вишлист"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
                {copied && (
                  <p className="text-green-600 text-sm mt-2 animate-fadeIn">
                    ✓ Ссылка скопирована!
                  </p>
                )}
                {!wishlistId && (
                  <p className="text-amber-600 text-sm mt-2">
                    ⚠️ У вас нет вишлистов. Сначала создайте вишлист!
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(wishlistLink)}&text=Посмотри мой вишлист в GiftHarbor!`, '_blank')}
                  className="flex-1 py-2 bg-[#0088cc] text-white rounded-lg hover:bg-[#0077b5] transition-all btn-hover flex items-center justify-center gap-2"
                  disabled={!wishlistId}
                >
                  <span>📱</span> Telegram
                </button>
                <button
                  onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Посмотри мой вишлист в GiftHarbor: ${wishlistLink}`)}`, '_blank')}
                  className="flex-1 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#128C7E] transition-all btn-hover flex items-center justify-center gap-2"
                  disabled={!wishlistId}
                >
                  <span>📱</span> WhatsApp
                </button>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 border-2 border-terracotta text-terracotta rounded-lg hover:bg-terracotta hover:text-white transition-all btn-hover"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Декоративный отлив */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-terracotta/20 via-peach/20 to-terracotta/20 blur-3xl opacity-30" />

        {/* Контент выбранной категории */}
        <div className={`
          mt-8 p-8 rounded-2xl bg-gradient-to-br ${activeData.color}
          border-2 border-peach/20 shadow-xl
          transform transition-all duration-500 hover:scale-[1.02]
        `}>
          <div className="flex items-start gap-4 mb-6">
            <span className="text-5xl">{activeData.icon}</span>
            <div>
              <h3 className="font-playfair text-2xl font-bold text-storm mb-2">
                {activeData.title}
              </h3>
              <p className="text-lg text-storm/80">
                {activeData.description}
              </p>
            </div>
          </div>

          {/* Примеры */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {activeData.examples.map((example, idx) => (
              <div
                key={idx}
                className={`
                  relative p-4 bg-white/80 backdrop-blur-sm rounded-xl
                  border border-peach/30 shadow-md
                  transform transition-all duration-300
                  ${hoveredExample === idx ? 'scale-105 shadow-xl border-terracotta' : ''}
                  hover:shadow-lg cursor-pointer
                `}
                onMouseEnter={() => setHoveredExample(idx)}
                onMouseLeave={() => setHoveredExample(null)}
              >
                <p className="text-storm">{example}</p>
                
                {/* Эффект при наведении на пример */}
                <span className={`
                  absolute inset-0 rounded-xl overflow-hidden
                  transition-opacity duration-500
                  ${hoveredExample === idx ? 'opacity-100' : 'opacity-0'}
                `}>
                  <span className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-terracotta/20 to-transparent" />
                </span>
              </div>
            ))}
          </div>

          {/* Статистика */}
          <div className="mt-6 p-4 bg-terracotta/10 rounded-xl border border-terracotta/20">
            <p className="text-center text-storm font-medium">
              📊 {activeData.stats}
            </p>
          </div>

          {/* Интерактивная кнопка действия */}
          <div className="mt-6 text-center">
            <button
              className="px-8 py-3 bg-terracotta text-white rounded-full font-medium
                       shadow-lg hover:shadow-xl transform hover:scale-105
                       transition-all duration-300 btn-hover flex items-center justify-center gap-2 mx-auto"
              onClick={handleAction}
            >
              {activeData.action === 'protection' && <><Shield className="w-5 h-5" /> Попробовать защиту от дубликатов</>}
              {activeData.action === 'realtime' && <><Zap className="w-5 h-5" /> Проверить скорость обновлений</>}
              {activeData.action === 'family' && <><Users className="w-5 h-5" /> Пригласить семью</>}
              {activeData.action === 'share' && <><Share2 className="w-5 h-5" /> Поделиться вишлистом</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}