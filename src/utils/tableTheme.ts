// src/utils/tableTheme.ts

interface ThemeConfig {
    bg: string;
    hoverBg: string;
    hoverBorder: string;
    border: string;
    text: string;
    titleColor: string;
    priceColor: string;
    currencyColor: string;
    iconBtn: string;
    indicator?: string;
}

interface OccupancyConfig {
    fillBg: string;
    label: string;
    fill: string;
    text: string;
    badgeBg: string;
    badgeBorder: string;
    glow: string;
    cardBg: string;
    cardBorder: string;
    animate?: string;
}

interface TableThemeConfig {
    card: string;
    textColor: string;
    iconColor: string;
    badge: string;
    glow: string;
    amountColor?: string;
    ghostIcon?: string;
    ghostText?: string;
}

// 🎨 DİNAMİK RENK MOTORU (KATEGORİLER İÇİN)
export const getCategoryTheme = (categoryName: string | undefined, isDark: boolean): ThemeConfig => {
    const name = (categoryName || '').toLowerCase();

    // 🌑 DARK MODE (Mevcut koyu tema)
    if (isDark) {
        const base: ThemeConfig = {
            bg: 'bg-slate-800',
            hoverBg: 'group-hover:bg-slate-700',
            hoverBorder: 'group-hover:border-slate-500/50',
            border: 'border-white/5',
            text: 'text-slate-400', // Kategori etiketi
            titleColor: 'text-slate-200 group-hover:text-white',
            priceColor: 'text-emerald-400',
            currencyColor: 'text-emerald-500/70',
            iconBtn: 'bg-slate-800 border-white/10 text-slate-400 group-hover:bg-emerald-600 group-hover:border-emerald-500 group-hover:text-white'
        };

        if (name.includes('kahve') || name.includes('latte') || name.includes('espresso')) return { ...base, text: 'text-amber-400', border: 'border-amber-900/20 group-hover:border-amber-500/50', indicator: 'bg-amber-500' };
        if (name.includes('soğuk') || name.includes('su') || name.includes('frozen') || name.includes('milkshake')) return { ...base, text: 'text-cyan-400', border: 'border-cyan-900/20 group-hover:border-cyan-500/50', indicator: 'bg-cyan-500' };
        if (name.includes('tatlı') || name.includes('pasta') || name.includes('kek') || name.includes('waffle')) return { ...base, text: 'text-pink-400', border: 'border-pink-900/20 group-hover:border-pink-500/50', indicator: 'bg-pink-500' };
        if (name.includes('yiyecek') || name.includes('tost') || name.includes('sandviç') || name.includes('kahvaltı')) return { ...base, text: 'text-emerald-400', border: 'border-emerald-900/20 group-hover:border-emerald-500/50', indicator: 'bg-emerald-500' };

        return { ...base, text: 'text-indigo-400', border: 'border-indigo-900/20 group-hover:border-indigo-500/50', indicator: 'bg-indigo-500' };
    }

    // 🌞 LIGHT MODE (VIBRANT / CANLI RENKLER)
    const vibrantCommon: Partial<ThemeConfig> = {
        titleColor: 'text-white',
        priceColor: 'text-white',
        currencyColor: 'text-white/80',
        text: 'text-white/90', // Kategori etiketi
    };

    if (name.includes('kahve') || name.includes('latte') || name.includes('espresso')) {
        return { ...vibrantCommon, bg: 'bg-orange-500', hoverBg: 'group-hover:bg-orange-600', border: 'border-orange-600', hoverBorder: 'group-hover:border-orange-700', iconBtn: 'bg-white/20 text-white group-hover:bg-white group-hover:text-orange-600 shadow-sm', indicator: 'bg-white' } as ThemeConfig;
    }
    if (name.includes('soğuk') || name.includes('su') || name.includes('frozen') || name.includes('milkshake')) {
        return { ...vibrantCommon, bg: 'bg-cyan-500', hoverBg: 'group-hover:bg-cyan-600', border: 'border-cyan-600', hoverBorder: 'group-hover:border-cyan-700', iconBtn: 'bg-white/20 text-white group-hover:bg-white group-hover:text-cyan-600 shadow-sm', indicator: 'bg-white' } as ThemeConfig;
    }
    if (name.includes('tatlı') || name.includes('pasta') || name.includes('kek') || name.includes('waffle')) {
        return { ...vibrantCommon, bg: 'bg-pink-500', hoverBg: 'group-hover:bg-pink-600', border: 'border-pink-600', hoverBorder: 'group-hover:border-pink-700', iconBtn: 'bg-white/20 text-white group-hover:bg-white group-hover:text-pink-600 shadow-sm', indicator: 'bg-white' } as ThemeConfig;
    }
    if (name.includes('yiyecek') || name.includes('tost') || name.includes('sandviç') || name.includes('kahvaltı')) {
        return { ...vibrantCommon, bg: 'bg-emerald-500', hoverBg: 'group-hover:bg-emerald-600', border: 'border-emerald-600', hoverBorder: 'group-hover:border-emerald-700', iconBtn: 'bg-white/20 text-white group-hover:bg-white group-hover:text-emerald-600 shadow-sm', indicator: 'bg-white' } as ThemeConfig;
    }

    // Default Vibrant
    return { ...vibrantCommon, bg: 'bg-indigo-500', hoverBg: 'group-hover:bg-indigo-600', border: 'border-indigo-600', hoverBorder: 'group-hover:border-indigo-700', iconBtn: 'bg-white/20 text-white group-hover:bg-white group-hover:text-indigo-600 shadow-sm', indicator: 'bg-white' } as ThemeConfig;
};

// 📊 DETAYLI DOLULUK KONFİGÜRASYONU (GÜNCELLENDİ: KART ARKAPLANI İÇİN)
export const getDetailedOccupancyConfig = (rate: number, isDark: boolean): OccupancyConfig => {
    // Ortak (Common) Özellikler
    const common = {
        fillBg: isDark ? '#1e293b' : '#e2e8f0'
    };

    if (rate < 20) return {
        ...common, label: "SAKİN", fill: "#06b6d4", text: "text-cyan-400",
        badgeBg: "bg-cyan-500/10", badgeBorder: "border-cyan-500/20", glow: "from-cyan-500/20",
        cardBg: isDark ? "bg-cyan-950/30" : "bg-cyan-50", cardBorder: isDark ? "border-cyan-500/20" : "border-cyan-200"
    };
    if (rate < 40) return {
        ...common, label: "HAFİF TEMPO", fill: "#10b981", text: "text-emerald-400",
        badgeBg: "bg-emerald-500/10", badgeBorder: "border-emerald-500/20", glow: "from-emerald-500/20",
        cardBg: isDark ? "bg-emerald-950/30" : "bg-emerald-50", cardBorder: isDark ? "border-emerald-500/20" : "border-emerald-200"
    };
    if (rate < 60) return {
        ...common, label: "CANLI", fill: "#f59e0b", text: "text-amber-400",
        badgeBg: "bg-amber-500/10", badgeBorder: "border-amber-500/20", glow: "from-amber-500/20",
        cardBg: isDark ? "bg-amber-950/30" : "bg-amber-50", cardBorder: isDark ? "border-amber-500/20" : "border-amber-200"
    };
    if (rate < 80) return {
        ...common, label: "YOĞUN", fill: "#f97316", text: "text-orange-400",
        badgeBg: "bg-orange-500/10", badgeBorder: "border-orange-500/20", glow: "from-orange-500/20",
        cardBg: isDark ? "bg-orange-950/30" : "bg-orange-50", cardBorder: isDark ? "border-orange-500/20" : "border-orange-200"
    };
    return {
        ...common, label: "TAM KAPASİTE", fill: "#ef4444", text: "text-rose-500",
        badgeBg: "bg-rose-500/10", badgeBorder: "border-rose-500/20", glow: "from-rose-500/20", animate: "animate-pulse",
        cardBg: isDark ? "bg-rose-950/30" : "bg-rose-50", cardBorder: isDark ? "border-rose-500/20" : "border-rose-200"
    };
};

/**
 * Returns premium theme configuration for a table card based on its status
 * 
 * Provides comprehensive visual styling including:
 * - Background colors and gradients
 * - Border and ring colors
 * - Text and icon colors
 * - Shadow and glow effects
 * - Badge styling
 * - Hover states and animations
 * 
 * Supports multiple operational modes:
 * - **Transfer mode**: Highlights source table for moving orders
 * - **Clean mode**: Dims non-cleaning tables
 * - **Reserve mode**: Dims occupied tables
 * 
 * Theme adapts to both dark and light modes with appropriate color schemes.
 * 
 * @param status - Current table status
 * @param isDark - Whether dark mode is active
 * @param activeMode - Optional active operational mode ('transfer' | 'clean' | 'reserve')
 * @param isSource - Whether this table is the source in transfer mode
 * 
 * @returns Theme configuration object with Tailwind CSS classes
 * @returns card - Complete card styling classes
 * @returns textColor - Text color classes
 * @returns iconColor - Icon color classes
 * @returns badge - Badge styling classes
 * @returns glow - Gradient glow effect classes
 * @returns amountColor - Amount text color (for occupied tables)
 * @returns ghostIcon - Ghost icon color (for empty tables)
 * @returns ghostText - Ghost text color (for empty tables)
 * 
 * @example
 * // Get theme for occupied table in dark mode
 * const theme = getTableTheme('occupied', true);
 * // Returns: {
 * //   card: 'bg-rose-950/40 ring-rose-500/30 ...',
 * //   textColor: 'text-rose-100',
 * //   iconColor: 'text-rose-400',
 * //   ...
 * // }
 * 
 * @example
 * // Get theme for transfer mode source table
 * const theme = getTableTheme('occupied', false, 'transfer', true);
 * // Returns highlighted blue theme with scale and glow effects
 */
export const getTableTheme = (
    status: 'occupied' | 'ordered' | 'reserved' | 'needs_cleaning' | 'empty',
    isDark: boolean,
    activeMode?: 'transfer' | 'clean' | 'reserve' | null,
    isSource?: boolean
): TableThemeConfig => {
    const base = "transition-all duration-500 relative overflow-hidden backdrop-blur-xl shadow-sm rounded-2xl ring-1";

    if (activeMode === 'transfer' && isSource) {
        return {
            card: `${base} bg-blue-500/30 ring-blue-400/50 shadow-[0_0_40px_rgba(59,130,246,0.4)] scale-105 z-10`,
            textColor: "text-white",
            iconColor: "text-blue-300",
            badge: "bg-blue-500 text-white",
            glow: "from-blue-400/20 via-blue-500/10 to-transparent",
            ghostIcon: "text-blue-400/20",
            ghostText: "text-blue-400"
        };
    }

    const isDimmed = (activeMode === 'clean' && status !== 'needs_cleaning') ||
        (activeMode === 'reserve' && status !== 'empty') ||
        (activeMode === 'transfer' && !isSource && status === 'reserved');

    const opacityClass = isDimmed ? "opacity-30 grayscale-[0.8] scale-95" : "opacity-100";

    switch (status) {
        case 'occupied':
            return {
                card: `${base} ${opacityClass} ` + (isDark
                    ? `bg-rose-950/40 ring-rose-500/30 hover:ring-rose-500/60 shadow-[0_0_30px_-10px_rgba(244,63,94,0.3)]`
                    : `bg-gradient-to-br from-red-500 to-red-600 ring-red-400 shadow-xl shadow-red-500/20`),
                textColor: isDark ? "text-rose-100" : "text-white",
                amountColor: "text-white",
                iconColor: isDark ? "text-rose-400" : "text-white",
                badge: isDark ? "bg-rose-500/20 ring-1 ring-rose-500/30 text-rose-300" : "bg-white/20 ring-1 ring-white/30 text-white backdrop-blur-md",
                glow: "from-rose-500/20 via-rose-500/5 to-transparent"
            };
        case 'ordered':
            return {
                card: `${base} ${opacityClass} ` + (isDark
                    ? `bg-amber-950/40 ring-amber-500/30 hover:ring-amber-500/60 shadow-[0_0_30px_-10px_rgba(245,158,11,0.2)]`
                    : `bg-gradient-to-br from-orange-400 to-orange-500 ring-orange-300 shadow-xl shadow-orange-500/20`),
                iconColor: isDark ? "text-amber-400" : "text-white",
                textColor: isDark ? "text-amber-100" : "text-white",
                amountColor: "text-white",
                badge: isDark ? "bg-amber-500/20 ring-1 ring-amber-500/30 text-amber-300" : "bg-white/20 ring-1 ring-white/30 text-white backdrop-blur-md",
                glow: "from-amber-500/20 via-amber-500/5 to-transparent"
            };
        case 'reserved':
            return {
                card: `${base} ${opacityClass} ` + (isDark
                    ? `bg-purple-950/40 ring-purple-500/30 hover:ring-purple-400/60 shadow-[0_0_25px_-5px_rgba(168,85,247,0.3)]`
                    : `bg-gradient-to-br from-purple-500 to-purple-600 ring-purple-400 shadow-xl shadow-purple-500/20`),
                textColor: isDark ? "text-purple-100" : "text-white",
                amountColor: "text-white",
                iconColor: isDark ? "text-purple-400" : "text-white",
                badge: isDark ? "bg-purple-500/20 ring-1 ring-purple-500/30 text-purple-300" : "bg-white/20 ring-1 ring-white/30 text-white backdrop-blur-md",
                glow: "from-purple-500/20 via-purple-500/5 to-transparent"
            };
        case 'needs_cleaning':
            return {
                card: `${base} ${opacityClass} animate-pulse ` + (isDark
                    ? `bg-cyan-950/40 ring-cyan-500/30 border-dashed hover:ring-cyan-400/60`
                    : `bg-cyan-500/90 ring-cyan-400 ring-2 border-dashed shadow-xl shadow-cyan-500/20`),
                textColor: isDark ? "text-cyan-100" : "text-white",
                amountColor: "text-white",
                iconColor: isDark ? "text-cyan-400" : "text-white",
                badge: isDark ? "bg-cyan-500/20 ring-1 ring-cyan-500/30 text-cyan-200" : "bg-white/20 ring-1 ring-white/30 text-white backdrop-blur-md",
                glow: "from-cyan-400/20 via-cyan-400/5 to-transparent"
            };
        case 'empty':
        default:
            return {
                card: `${base} ${opacityClass} ` + (isDark
                    ? `bg-slate-900/60 ring-white/5 hover:ring-emerald-500/40 hover:bg-slate-800 hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)] group`
                    : `bg-white/80 ring-slate-200 hover:ring-emerald-400 hover:shadow-xl hover:shadow-emerald-500/10 group`),
                textColor: isDark ? "text-slate-400 group-hover:text-emerald-200 transition-colors" : "text-slate-500 group-hover:text-emerald-600 transition-colors",
                amountColor: isDark ? "text-white" : "text-slate-800",
                iconColor: isDark ? "text-emerald-800/50 group-hover:text-emerald-400 transition-colors" : "text-slate-300 group-hover:text-emerald-500 transition-colors",
                badge: isDark ? "bg-emerald-500/10 ring-1 ring-emerald-500/20 text-emerald-400" : "bg-slate-100 ring-1 ring-slate-200 text-slate-500",
                glow: isDark ? "from-emerald-500/10 via-emerald-500/5 to-transparent" : "from-emerald-400/5 via-emerald-400/2 to-transparent",
                ghostIcon: isDark ? "text-white/5" : "text-slate-100",
                ghostText: isDark ? "text-emerald-500/30" : "text-slate-200"
            };
    }
};
