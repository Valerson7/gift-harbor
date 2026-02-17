import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans, Playfair_Display } from 'next/font/google'
import './globals.css'

// Inter поддерживает кириллицу, оставляем
const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
})

// Plus_Jakarta_Sans НЕ поддерживает кириллицу, убираем
const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  variable: '--font-jakarta',
})

// Playfair_Display поддерживает кириллицу, оставляем
const playfair = Playfair_Display({ 
  subsets: ['latin', 'cyrillic'],
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  title: 'GiftHarbor',
  description: 'Дарить — легко. Скидываться — вместе.',
  keywords: 'вишлист, подарки, скидывание, сюрприз, друзья',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={`
        ${inter.variable} 
        ${jakarta.variable} 
        ${playfair.variable} 
        font-sans antialiased
      `}>
        {children}
      </body>
    </html>
  )
}