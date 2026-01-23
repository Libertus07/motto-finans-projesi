/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 🏛️ MOTTO GOLDEN AGE (Olimpos Teması)
        motto: {
          base: '#FDFBF7',    // Olimpos Kremi (Zemin)
          dark: '#432818',    // Koyu Kahve (Logo Rengi - Yazılar)
          light: '#BB9457',   // Açık Kahve (İkincil)
          gold: '#D4AF37',    // Antik Altın (Şimşek/Vurgu)
          red: '#99582A',     // Uyarı/İndirim (Sıcak Kiremit)
          // Legacy mapping for compatibility
          50: '#FDFBF7',
          100: '#FDFBF7',
          500: '#432818',
          DEFAULT: '#432818',
        },

        // ✨ GOLD (Premium/M-Coin)
        gold: {
          100: '#F5E6AD',
          200: '#f0db8a',
          500: '#FFD700',  // Standart Gold
          DEFAULT: '#FFD700',
          900: '#996515',
        },

        // 🟢 SUCCESS (Onay/Başarı)
        success: {
          100: '#d1fae5',
          500: '#10b981',
          DEFAULT: '#10b981',
          900: '#064e3b',
        },

        // 🔴 DANGER (Hata/Silme)
        danger: {
          100: '#fee2e2',
          500: '#ef4444',
          DEFAULT: '#ef4444',
          900: '#7f1d1d',
        },

        // 🔵 INFO (Bilgi/Kişi Başı)
        info: {
          100: '#e0f2fe',
          500: '#0ea5e9',
          DEFAULT: '#0ea5e9',
          900: '#0c4a6e',
        },

        // 🟠 WARNING (İndirim/Uyarı)
        warning: {
          100: '#edd32b',
          500: '#f59e0b',
          DEFAULT: '#f59e0b',
          900: '#78350f',
        },

        // 🌑 SURFACE (Arayüz Temeli)
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          500: '#64748b',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        }
      },
      fontFamily: {
        titan: ['"Titan One"', 'sans-serif'],
        cinzel: ['"Cinzel"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
      animation: {
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      }
    },
  },
  plugins: [],
}