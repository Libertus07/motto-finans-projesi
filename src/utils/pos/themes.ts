// utils/pos/themes.ts

export interface ThemeColors {
    bg: string;
    hoverBg: string;
    hoverBorder: string;
    border: string;
    text: string;
    indicator: string;
    priceColor: string;
    iconStyle: string;
}

export const getCategoryTheme = (categoryName: string, isDarkMode: boolean): ThemeColors => {
    const name = (categoryName || '').toLowerCase();

    // 🌞 LIGHT MODE
    if (!isDarkMode) {
        const vibrantBase = {
            bg: 'bg-slate-700',
            hoverBg: 'group-hover:bg-slate-600',
            hoverBorder: 'group-hover:border-slate-500',
            border: 'border-slate-600 shadow-md',
            text: 'text-white',
            indicator: 'text-white',
            priceColor: 'text-slate-200',
            iconStyle: 'bg-white text-slate-700 hover:bg-slate-200'
        };

        if (name.includes('kahve') || name.includes('latte') || name.includes('espresso')) {
            return { ...vibrantBase, bg: 'bg-orange-600', hoverBg: 'group-hover:bg-orange-500', border: 'border-orange-500', priceColor: 'text-orange-100', iconStyle: 'bg-white text-orange-600 hover:bg-orange-100' };
        }
        if (name.includes('soğuk') || name.includes('su') || name.includes('frozen') || name.includes('milkshake')) {
            return { ...vibrantBase, bg: 'bg-cyan-600', hoverBg: 'group-hover:bg-cyan-500', border: 'border-cyan-500', priceColor: 'text-cyan-100', iconStyle: 'bg-white text-cyan-600 hover:bg-cyan-100' };
        }
        if (name.includes('tatlı') || name.includes('pasta') || name.includes('kek') || name.includes('waffle')) {
            return { ...vibrantBase, bg: 'bg-pink-600', hoverBg: 'group-hover:bg-pink-500', border: 'border-pink-500', priceColor: 'text-pink-100', iconStyle: 'bg-white text-pink-600 hover:bg-pink-100' };
        }
        if (name.includes('yiyecek') || name.includes('tost') || name.includes('sandviç') || name.includes('kahvaltı')) {
            return { ...vibrantBase, bg: 'bg-emerald-600', hoverBg: 'group-hover:bg-emerald-500', border: 'border-emerald-500', priceColor: 'text-emerald-100', iconStyle: 'bg-white text-emerald-600 hover:bg-emerald-100' };
        }
        if (name.includes('çay') || name.includes('bitki')) {
            return { ...vibrantBase, bg: 'bg-red-600', hoverBg: 'group-hover:bg-red-500', border: 'border-red-500', priceColor: 'text-red-100', iconStyle: 'bg-white text-red-600 hover:bg-red-100' };
        }

        return { ...vibrantBase, bg: 'bg-indigo-600', hoverBg: 'group-hover:bg-indigo-500', border: 'border-indigo-500', priceColor: 'text-indigo-100', iconStyle: 'bg-white text-indigo-600 hover:bg-indigo-100' };
    }

    // 🌙 DARK MODE
    const darkBase = {
        bg: 'bg-[#13161c]',
        hoverBg: 'group-hover:bg-[#1d2129]',
        hoverBorder: 'group-hover:border-slate-500/50',
        border: 'border-white/5',
        text: 'text-indigo-400',
        indicator: 'text-indigo-500', // Default
        priceColor: 'text-emerald-400',
        iconStyle: 'bg-slate-800 border-white/10 text-slate-400 group-hover:bg-emerald-600 group-hover:border-emerald-500 group-hover:text-white'
    };

    if (name.includes('kahve') || name.includes('latte') || name.includes('espresso')) {
        return { ...darkBase, bg: 'bg-[#191512]', hoverBg: 'group-hover:bg-[#261f1a]', text: 'text-amber-400', border: 'border-amber-900/20 group-hover:border-amber-500/50', indicator: 'text-amber-500' };
    }
    if (name.includes('soğuk') || name.includes('su') || name.includes('frozen')) {
        return { ...darkBase, bg: 'bg-[#0f1619]', hoverBg: 'group-hover:bg-[#142026]', text: 'text-cyan-400', border: 'border-cyan-900/20 group-hover:border-cyan-500/50', indicator: 'text-cyan-500' };
    }
    if (name.includes('tatlı') || name.includes('pasta') || name.includes('kek')) {
        return { ...darkBase, bg: 'bg-[#191216]', hoverBg: 'group-hover:bg-[#261a20]', text: 'text-pink-400', border: 'border-pink-900/20 group-hover:border-pink-500/50', indicator: 'text-pink-500' };
    }
    if (name.includes('yiyecek') || name.includes('tost')) {
        return { ...darkBase, bg: 'bg-[#0f1912]', hoverBg: 'group-hover:bg-[#14261a]', text: 'text-emerald-400', border: 'border-emerald-900/20 group-hover:border-emerald-500/50', indicator: 'text-emerald-500' };
    }
    if (name.includes('çay')) {
        return { ...darkBase, bg: 'bg-[#1a1212]', hoverBg: 'group-hover:bg-[#261a1a]', text: 'text-red-400', border: 'border-red-900/20 group-hover:border-red-500/50', indicator: 'text-red-500' };
    }
    return { ...darkBase, text: 'text-indigo-400', border: 'border-indigo-900/20 group-hover:border-indigo-500/50', indicator: 'text-indigo-500' };
};

export interface BankOption {
    key: string;
    label: string;
    gradient: string;
    border: string;
    shadow: string;
    text: string;
    color: string;
}

export const bankOptions: BankOption[] = [
    { key: 'ziraat', label: 'Ziraat', gradient: 'from-red-600 to-red-900', border: 'border-red-500', shadow: 'shadow-red-500/40', text: 'text-red-100', color: 'from-red-600 to-red-500' },
    { key: 'halk', label: 'Halk', gradient: 'from-blue-600 to-blue-900', border: 'border-blue-500', shadow: 'shadow-blue-500/40', text: 'text-blue-100', color: 'from-blue-600 to-blue-500' },
    { key: 'iban', label: 'Diğer', gradient: 'from-purple-600 to-purple-900', border: 'border-purple-500', shadow: 'shadow-purple-500/40', text: 'text-purple-100', color: 'from-purple-600 to-purple-500' }
];
