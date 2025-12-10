import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000, // Uyarı limitini 500kb'den 1000kb'ye çıkarır
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Node_modules içindeki kütüphaneleri ayrı paketle
          if (id.includes('node_modules')) {
            // Firebase'i ayrı bir dosyaya koy
            if (id.includes('firebase')) {
              return 'firebase';
            }
            // Grafik kütüphanesini ayrı dosyaya koy
            if (id.includes('recharts')) {
              return 'recharts';
            }
            // İkonları ayrı dosyaya koy
            if (id.includes('lucide-react')) {
              return 'lucide';
            }
            
            // Geri kalan her şeyi vendor.js içine koy
            return 'vendor';
          }
        },
      },
    },
  },
})