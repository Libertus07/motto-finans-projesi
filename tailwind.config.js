/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ☕ MOTTO COFFEE (Kurumsal Renkler)
        motto: {
          50: '#faf6f1',   // En açık fon
          100: '#F0E3D3',  // Latte/Krem (Verdiğin renk)
          200: '#e6d5c0',
          500: '#63432E',  // Espresso/Kahve (Ana renk - Verdiğin renk)
          DEFAULT: '#63432E',
          700: '#4d3424',
          900: '#3d2b1f',  // Dark Roast
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
      }
    },
  },
  plugins: [],
}