// components/pos/shared/MobileTabBar.tsx
import React from 'react';
import { ShoppingBag, ChevronRight } from 'lucide-react';

interface MobileTabBarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    cartCount: number;
    isDarkMode: boolean;
    cartTotal?: number;
}

const MobileTabBar: React.FC<MobileTabBarProps> = ({
    activeTab,
    onTabChange,
    cartCount,
    isDarkMode,
    cartTotal = 0
}) => {

    // Sadece menüde ve sepet doluysa göster
    if (activeTab !== 'menu' || cartCount === 0) return null;

    // TL Formatlama Fonksiyonu
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <div className="lg:hidden fixed bottom-10 left-0 right-0 px-6 z-[100] flex justify-center animate-in slide-in-from-bottom-8 fade-in duration-500">
            <button
                onClick={() => onTabChange('cart')}
                className={`
                    relative group flex items-center justify-between w-full max-w-[340px] h-[64px] pl-2 pr-5 rounded-full
                    border transition-all duration-300 active:scale-95
                    ${isDarkMode
                        ? 'bg-slate-900/40 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
                        : 'bg-white/40 border-slate-200/60 shadow-[0_20px_50px_rgba(15,23,42,0.1)]'}
                    backdrop-blur-[24px] saturate-[180%]
                `}
            >
                {/* Sol: İkon ve Bilgi */}
                <div className="flex items-center gap-3">
                    <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center relative
                        ${isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'}
                    `}>
                        <ShoppingBag size={22} strokeWidth={2.5} />

                        {/* Dinamik Sayaç */}
                        <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black h-4.5 min-w-[18px] px-1 rounded-full flex items-center justify-center border-2 border-inherit shadow-sm animate-bounce">
                            {cartCount}
                        </span>
                    </div>

                    <div className="flex flex-col items-start leading-tight">
                        <span className={`text-[9px] font-black tracking-[0.15em] uppercase opacity-50 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            TOPLAM TUTAR
                        </span>
                        <span className={`text-base font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            {formatCurrency(cartTotal)}
                        </span>
                    </div>
                </div>

                {/* Sağ: Aksiyon */}
                <div className="flex items-center gap-2">
                    <div className={`
                        flex items-center justify-center gap-1 py-1.5 px-3 rounded-full
                        ${isDarkMode ? 'bg-white/5 text-emerald-400' : 'bg-emerald-500/10 text-emerald-600'}
                    `}>
                        <span className="text-[10px] font-black tracking-wider uppercase">SEPETE GİT</span>
                        <ChevronRight size={14} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>

                {/* Arka Plan Glow Efekti */}
                <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none`} />
            </button>
        </div>
    );
};

export default MobileTabBar;
