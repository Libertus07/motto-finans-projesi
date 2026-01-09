import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import basicSsl from '@vitejs/plugin-basic-ssl' // ✨ SSL eklentisini içe aktar

export default defineConfig({
  plugins: [
    react(),
    basicSsl(), // ✨ SSL eklentisini buraya ekle
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Motto Coffee System',
        short_name: 'MottoPOS',
        description: 'Motto Coffee Kurumsal Yönetim Sistemi',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        icons: [
          {
            src: 'logo.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 3000000
      }
    })
  ],
  // ✨ MOBİL ERİŞİM İÇİN SUNUCU AYARLARI
  server: {
    host: true, // Yerel ağdaki diğer cihazların (Telefon gibi) erişmesini sağlar
    https: true, // Sunucuyu HTTPS üzerinden başlatır
    port: 5173  // Sabit bir port belirlemek iyidir
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'firebase';
            if (id.includes('recharts')) return 'recharts';
            if (id.includes('lucide-react')) return 'lucide';
            return 'vendor';
          }
        },
      },
    },
  },
})