// components/pos/Cart/CartSummary.tsx
import React, { useMemo, memo } from 'react';
import { X, Zap, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../../utils/helpers';

interface LoyaltyDiscountDisplayProps {
    loyaltyDiscount: number;
    onCancelLoyaltyDiscount: () => void;
    isDarkMode: boolean;
}

const LoyaltyDiscountDisplay: React.FC<LoyaltyDiscountDisplayProps> = memo(({
    loyaltyDiscount,
    onCancelLoyaltyDiscount,
    isDarkMode
}) => {
    // Enhanced number validation and formatting with error handling
    const formattedDiscount = useMemo(() => {
        const val = Number(loyaltyDiscount);
        if (isNaN(val) || val <= 0) return '0.00';
        return formatCurrency(val);
    }, [loyaltyDiscount]);

    // Early return for invalid or zero discount to prevent rendering
    const discountValue = Number(loyaltyDiscount);
    if (isNaN(discountValue) || discountValue <= 0) return null;

    // Extract and organize class names for better readability
    const containerClasses = `
        flex items-center gap-1.5 flex-1 justify-between relative transition-all px-1.5 py-1.5 rounded-xl border animate-in zoom-in duration-300
        ${isDarkMode
            ? 'bg-slate-900/50 border-info text-amber-200'
            : 'text-purple-400 bg-purple-500/10 border-purple-500/70 shadow-[0_0_20px_rgba(168,85,247,0.1)]'}
    `;

    const separatorClasses = `w-[2px] h-2.5 ${isDarkMode ? 'bg-purple-400/50' : 'bg-purple-400/70 shadow-[0_0_20px_rgba(168,85,247,0.1)]'}`;

    // Separate price color control
    const priceClasses = `text-[12px] font-bold ${isDarkMode ? 'text-warning' : 'text-warning'}`;

    const buttonClasses = `
        w-5 h-5 flex items-center justify-center rounded-lx transition-all active:scale-90 rounded-full border 
        ${isDarkMode
            ? 'bg-red hover:bg-purple-500/10 text-white hover:text-purple-400'
            : 'bg-red-500/10 hover:bg-red-500/10 text-red-500 hover:text-purple-400 border-red-500/70 shadow-[0_0_20px_rgba(168,85,247,0.1)]'}
    `;

    return (
        <div className={containerClasses}>
            {/* Icon Group */}
            <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest">
                    M-COIN AVANTAJI
                </span>
            </div>

            {/* Separator Line */}
            <div className={separatorClasses} />

            {/* Amount and Cancel Button */}
            <div className="flex items-center gap-1.5">
                <span className={priceClasses}>
                    -{formattedDiscount} ₺
                </span>

                <button
                    onClick={onCancelLoyaltyDiscount}
                    className={buttonClasses}
                    aria-label="İndirimi Kaldır"
                    title="İndirimi Kaldır"
                >
                    <X size={10} strokeWidth={5} />
                </button>
            </div>
        </div>
    );
});

interface CartSummaryProps {
    isDarkMode: boolean;
    isPartialMode: boolean;
    isSelectionMode: boolean;
    currentPayable: number;
    paidSoFar: number;
    remainingDebt: number;
    discountAmount: number;
    splitCount: number;
    onClose: () => void;
    // ✨ YENİ: Seçili Müşteri Verisi
    loyaltyCustomer: any;
    loyaltyDiscount: number;
    onCancelLoyaltyDiscount: () => void;
}

const CartSummary: React.FC<CartSummaryProps> = ({
    isDarkMode,
    isPartialMode,
    isSelectionMode,
    currentPayable,
    paidSoFar,
    remainingDebt,
    discountAmount,
    splitCount,
    onClose,
    // ✨ YENİ: Seçili Müşteri Verisi
    loyaltyCustomer,
    loyaltyDiscount,
    onCancelLoyaltyDiscount
}) => {

    // 🏆 AKILLI PUAN HESAPLAMA
    const pointsForecast = useMemo(() => {
        // currentPayable, indirimler düşülmüş olan "Ödenecek Net Tutar"dır
        if (!loyaltyCustomer || currentPayable <= 0) return 0;

        // Seviye çarpanlarını koruyarak net tutar üzerinden hesapla
        let multiplier = 1;
        if (loyaltyCustomer.tier === 'SILVER') multiplier = 1.25;
        if (loyaltyCustomer.tier === 'GOLD') multiplier = 1.5;

        // ✨ Net Tutar / 10 * Çarpan
        return Math.floor((currentPayable / 10) * multiplier);
    }, [loyaltyCustomer, currentPayable]);

    const getDisplayLabel = () => {
        if (isPartialMode) return 'TAHSİL EDİLECEK';
        if (isSelectionMode) return 'SEÇİLEN TUTAR';
        return 'TOPLAM TUTAR';
    };

    const getBgClass = () => {
        if (isPartialMode) return 'bg-pink-900/10 border-pink-500/30 shadow-[0_0_20px_rgba(236,72,153,0.1)]';
        if (isSelectionMode) return 'bg-purple-900/10 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.1)]';
        return isDarkMode ? 'bg-slate-900/50 border-white/5' : 'bg-slate-50 border-slate-200';
    };

    const getLabelColor = () => {
        if (isPartialMode) return 'text-pink-400';
        if (isSelectionMode) return 'text-purple-400';
        return isDarkMode ? 'text-slate-400' : 'text-slate-500';
    };

    return (
        <div className={`relative overflow-hidden rounded-2xl border p-4 flex flex-col gap-2 transition-all duration-500 ${getBgClass()}`}>

            {/* KAPAT BUTONU */}
            {(isPartialMode || isSelectionMode) && (
                <button
                    onClick={onClose}
                    className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors z-20 ${isDarkMode
                            ? 'bg-black/20 hover:bg-black/40 text-white/50 hover:text-white'
                            : 'bg-slate-200 hover:bg-slate-300 text-slate-500 hover:text-slate-800'
                        }`}
                >
                    <X size={14} />
                </button>
            )}

            {/* 💎 M-COIN FORECAST BADGE (Puan Tahmini) - TOPLAM TUTAR ÜSTÜNE TAŞINDI */}
            {pointsForecast > 0 && (
                <div className="flex justify-right items-centergap-1.5 mb-0">
                    <div className="px-1.5 py-1.5 text-green-400 bg-green-500/5 border-green-500/30 shadow-[0_0_20px_rgba(168,85,247,0.1)] rounded-xl border-2 border-dashed flex items-center gap-1 relative z-10">
                        <Zap size={11} fill="currentColor" className="text-yellow-300" />
                        <span className="text-[12px] font-bold uppercase tracking-widest relative z-10">
                            +{pointsForecast} M
                        </span>
                        {/* Gold Üyelere Özel Parlama */}
                        {loyaltyCustomer?.tier === 'GOLD' && (
                            <div className="absolute inset-0 bg-white/20 blur-md animate-pulse rounded-full" />
                        )}
                    </div>
                </div>
            )}

            {/* ANA TUTAR BÖLÜMÜ */}
            <div className="flex justify-between items-end mt-2">
                <div className="flex flex-col">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${getLabelColor()}`}>
                        {getDisplayLabel()}
                    </span>
                    <span className={`text-4xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-800'
                        }`}>
                        {formatCurrency(currentPayable)}
                        <span className="text-xl font-bold opacity-30 ml-1">₺</span>
                    </span>
                </div>

                {/* DETAYLAR & TEŞVİK */}
                <div className="text-right flex flex-col gap-1">
                    {!loyaltyCustomer && currentPayable > 0 && (
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-indigo-400/60 uppercase tracking-tighter italic">
                            <Sparkles size={10} /> PUAN İÇİN GİRİŞ YAPIN
                        </div>
                    )}

                    {isPartialMode && paidSoFar > 0 && (
                        <div className="text-[10px] font-bold text-emerald-500">
                            Ödenen: {formatCurrency(paidSoFar)} ₺
                        </div>
                    )}

                    {isPartialMode && remainingDebt > 0 && (
                        <div className="text-[11px] font-bold text-pink-500">
                            Kalan: {formatCurrency(remainingDebt)} ₺
                        </div>
                    )}

                    {discountAmount > 0 && (
                        <div className="text-[11px] font-bold text-warning">
                            İndirim: -{formatCurrency(discountAmount)} ₺
                        </div>
                    )}

                    {splitCount > 1 && (
                        <div className="text-[11px] font-bold text-info">
                            Kişi Başı: {formatCurrency(currentPayable / splitCount)} ₺
                        </div>
                    )}

                    {loyaltyCustomer && loyaltyDiscount > 0 && <LoyaltyDiscountDisplay loyaltyDiscount={loyaltyDiscount} onCancelLoyaltyDiscount={onCancelLoyaltyDiscount} isDarkMode={isDarkMode} />}

                </div>
            </div>
        </div>
    );
};

export default memo(CartSummary);
