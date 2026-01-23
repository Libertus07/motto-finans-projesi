// components/pos/Modals/ChangeCalculatorModal.tsx
import React from 'react';
import { X, Calculator, RotateCcw } from 'lucide-react';
import { formatCurrency } from '../../../utils/helpers';
import Numpad from '../shared/Numpad';
import { QUICK_CASH_AMOUNTS } from '../../../constants/pos/config';

interface ChangeCalculatorModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPayable: number;
    originalPayable?: number;
    receivedAmount: string | number;
    onAmountChange: (value: string) => void;
    onResetRounding?: () => void;
}

const ChangeCalculatorModal: React.FC<ChangeCalculatorModalProps> = ({
    isOpen,
    onClose,
    currentPayable,    // Yuvarlanmış veya o anki tutar
    originalPayable,   // ✨ YENİ: Sepetin ham tutarı
    receivedAmount,
    onAmountChange,
    onResetRounding    // ✨ YENİ: Yuvarlamayı iptal eden fonksiyon
}) => {
    if (!isOpen) return null;

    const received = Number(receivedAmount) || 0;
    const isEnough = received >= currentPayable;
    const changeAmount = Math.abs(received - currentPayable);

    // ✨ Yuvarlama yapılmış mı kontrolü
    const isRounded = originalPayable && currentPayable !== originalPayable;

    const handleNumpadInput = (value: number | string) => {
        if (value === 'C') onAmountChange('');
        else if (value === 'BACK') onAmountChange(String(receivedAmount).slice(0, -1));
        else onAmountChange(String(receivedAmount) + value);
    };

    return (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300">
            <div className="w-[360px] bg-[#1e2330] rounded-[2.5rem] shadow-2xl border border-white/10 p-6 flex flex-col gap-5 relative overflow-hidden">

                {/* 🎨 Arkaplan Efekti (CartSummary stilinde) */}
                {isRounded && (
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 blur-[60px] rounded-full pointer-events-none" />
                )}

                {/* HEADER */}
                <div className="flex justify-between items-center relative z-10">
                    <div className="flex flex-col">
                        <h3 className="text-white font-black text-xl flex items-center gap-2">
                            <Calculator size={22} className={isRounded ? "text-amber-400" : "text-cyan-400"} />
                            Ödeme Paneli
                        </h3>
                        {isRounded && (
                            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest animate-pulse">
                                ⚠️ Tutar Yuvarlandı
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 bg-white/5 hover:bg-rose-500/20 rounded-full text-slate-400 hover:text-rose-500 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* DISPLAY PANEL (CartSummary Logic) */}
                <div className={`
                    relative overflow-hidden rounded-3xl p-5 border transition-all duration-500
                    ${isRounded
                        ? 'bg-amber-900/10 border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.05)]'
                        : 'bg-slate-900/80 border-white/5'}
                `}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${isRounded ? 'text-amber-500' : 'text-slate-500'}`}>
                                {isRounded ? 'YUVARLANMIŞ TUTAR' : 'TAHSİL EDİLECEK'}
                            </span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-white tracking-tighter">
                                    {formatCurrency(currentPayable)}
                                </span>
                                <span className="text-lg font-bold text-white/30">₺</span>
                            </div>
                        </div>

                        {/* ✨ İPTAL BUTONU (Yuvarlamayı Geri Al) */}
                        {isRounded && onResetRounding && (
                            <button
                                onClick={onResetRounding}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-black rounded-full text-[10px] font-black hover:scale-105 transition-transform active:scale-95"
                            >
                                <RotateCcw size={12} strokeWidth={3} />
                                İPTAL ET
                            </button>
                        )}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-cyan-400 uppercase">Alınan Para</span>
                            <span className="text-2xl font-mono font-black text-white">
                                {receivedAmount || '0.00'}
                            </span>
                        </div>
                        <div className="text-right flex flex-col">
                            <span className={`text-[10px] font-bold uppercase ${isEnough ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {isEnough ? 'Para Üstü' : 'Eksik'}
                            </span>
                            <span className={`text-2xl font-black ${isEnough ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {formatCurrency(changeAmount)} ₺
                            </span>
                        </div>
                    </div>
                </div>

                {/* AKSİYONLAR */}
                <div className="flex gap-2">
                    <button
                        onClick={() => onAmountChange(String(currentPayable))}
                        className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition-all"
                    >
                        TAM TUTAR
                    </button>
                    <button
                        onClick={() => onAmountChange('')}
                        className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-all"
                    >
                        TEMİZLE
                    </button>
                </div>

                <Numpad onInput={handleNumpadInput} showDot={true} isDarkMode={true} />

                <div className="grid grid-cols-4 gap-2">
                    {QUICK_CASH_AMOUNTS.map(amount => (
                        <button
                            key={amount}
                            onClick={() => onAmountChange(String(amount))}
                            className="h-11 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-cyan-400 font-bold text-sm hover:bg-cyan-500/20 transition-all"
                        >
                            {amount}
                        </button>
                    ))}
                </div>

                <button
                    onClick={onClose}
                    disabled={!isEnough && received > 0}
                    className={`w-full py-5 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-xl ${isEnough
                            ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                >
                    {isEnough ? 'İŞLEMİ ONAYLA' : 'TUTAR BEKLENİYOR'}
                </button>
            </div>
        </div>
    );
};

export default ChangeCalculatorModal;
