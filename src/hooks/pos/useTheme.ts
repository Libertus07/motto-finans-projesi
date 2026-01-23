import { useState, useEffect } from 'react';

export const useTheme = (): [boolean, () => void] => {
    // 1. Başlangıç değerini belirle (LocalStorage > Sistem Tercihi > Varsayılan Dark)
    const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
        // Server-side rendering koruması (Next.js vb. için)
        if (typeof window === 'undefined') return true;

        try {
            const savedTheme = localStorage.getItem('motto_pos_theme');
            // Eğer kayıtlı bir tercih varsa onu kullan
            if (savedTheme !== null) {
                return savedTheme === 'dark';
            }
            // Yoksa sistem tercihini kontrol et
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        } catch (e) {
            return true; // Hata durumunda varsayılan Dark
        }
    });

    // 2. Değişiklikleri uygula ve kaydet
    useEffect(() => {
        try {
            const themeValue = isDarkMode ? 'dark' : 'light';

            // LocalStorage'a kaydet
            localStorage.setItem('motto_pos_theme', themeValue);

            // HTML elementine class ekle (Tailwind dark mode desteği için)
            const root = window.document.documentElement;
            root.classList.remove(isDarkMode ? 'light' : 'dark');
            root.classList.add(themeValue);

            // ✨ MOBİL İÇİN: Meta theme-color güncelle (Adres çubuğu rengi)
            let metaThemeColor = document.querySelector("meta[name=theme-color]") as HTMLMetaElement;
            if (!metaThemeColor) {
                metaThemeColor = document.createElement('meta');
                metaThemeColor.name = "theme-color";
                document.head.appendChild(metaThemeColor);
            }
            // Dark: Slate 950 (#020617), Light: Açık Gri (#F1F5F9)
            metaThemeColor.content = isDarkMode ? "#020617" : "#F1F5F9";

        } catch (e) {
            console.error('Tema kaydedilemedi:', e);
        }
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode(prev => !prev);

    return [isDarkMode, toggleTheme];
};
