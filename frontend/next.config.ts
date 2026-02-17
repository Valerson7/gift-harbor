import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: {
    // Указываем корневую директорию проекта - это исправит предупреждение
    root: process.cwd(),
  },
}

export default nextConfig