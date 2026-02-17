import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
})

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin', 'cyrillic'],
  variable: '--font-jakarta',
})

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