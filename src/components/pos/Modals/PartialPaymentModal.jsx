// components/pos/Modals/PartialPaymentModal.jsx
import React from 'react';
import { X, PieChart, Percent } from 'lucide-react';
import { formatCurrency } from '../../../utils/helpers';
import Numpad from '../shared/Numpad';
import { PARTIAL_SPLIT_OPTIONS } from '../../../constants/pos/config';

const PartialPaymentModal = ({ 
    isOpen, 
    onClose, 
    finalTotal,
    paidSoFar,
    customTotal,
    discountRate,
    onCustomTotalChange,
    onDiscountToggle,
    onApply
}) => {
    if (!isOpen) return null;

    const remainingDebt = finalTotal - paidSoFar;
    const inputAmount = Number(customTotal) || 0;
    const newRemaining = Math.max(0, remainingDebt - inputAmount);

    const handleNumpadInput = (value) => {
        if (value === 'C') {
            onCustomTotalChange('');
        } else if (value === 'BACK') {
            onCustomTotalChange(String(customTotal).slice(0, -1));
        } else {
            onCustomTotalChange(String(customTotal) + value);
        }
    };

    const handleQuickSplit = (divisor) => {
        const amount = Math.ceil(remainingDebt / divisor);
        onCustomTotalChange(String(amount));
    };

    const handlePayAll = () => {
        onCustomTotalChange(String(Math.max(0, remainingDebt)));
    };

    return (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
            <div className="w-[340px] bg-[#1e2330] rounded-3xl shadow-2xl border border-white/10 p-5 flex flex-col gap-4">
                
                {/* HEADER */}
                <div className="flex justify-between items-center">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <PieChart size={20} className="text-pink-400"/> 
                        Parçalı Ödeme
                    </h3>
                    <button 
                        onClick={() => {
                            onClose();
                            onCustomTotalChange('');
                        }} 
                        className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"
                    >
                        <X size={18}/>
                    </button>
                </div>

                {/* DISPLAY PANEL */}
                <div className={`
                    relative overflow-hidden rounded-2xl border p-4 flex flex-col gap-3 
                    transition-colors duration-300
                    ${customTotal ? 'bg-pink-900/20 border-pink-500/50' : 'bg-slate-900/50 border-white/5'}
                `}>
                    {customTotal && (
                        <button 
                            onClick={() => onCustomTotalChange('')} 
                            className="absolute top-2 right-2 p-1.5 bg-black/20 hover:bg-black/40 rounded-full text-white/50 hover:text-white transition-colors z-20"
                        >
                            <X size={14}/>
                        </button>
                    )}

                    {/* ÖZET BİLGİLER */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-800/50 p-2 rounded-xl">
                            <span className="text-[10px] text-slate-400 block">Toplam</span>
                            <span className="text-sm font-bold text-white">
                                {formatCurrency(finalTotal)} ₺
                            </span>
                        </div>
                        <div className="bg-emerald-900/20 border border-emerald-500/20 p-2 rounded-xl">
                            <span className="text-[10px] text-emerald-400 block">Ödenen</span>
                            <span className="text-sm font-bold text-emerald-300">
                                {formatCurrency(paidSoFar)} ₺
                            </span>
                        </div>
                    </div>

                    {/* HIZLI BÖLME BUTONLARI */}
                    <div className="flex gap-1 pt-1 pb-1">
                        {PARTIAL_SPLIT_OPTIONS.map(split => (
                            <button 
                                key={split}
                                onClick={() => handleQuickSplit(split)}
                                className="flex-1 py-1 rounded bg-slate-800 text-[10px] font-bold text-slate-400 hover:bg-slate-700 hover:text-white"
                            >
                                1/{split}
                            </button>
                        ))}
                        <button 
                            onClick={handlePayAll}
                            className="flex-1 py-1 rounded bg-pink-900/30 text-[10px] font-bold text-pink-400 hover:bg-pink-900/50"
                        >
                            HEPSİ
                        </button>
                    </div>

                    {/* ŞUAN ÖDENECEK */}
                    <div className="flex justify-between items-center border-b border-white/10 pb-3 pt-1">
                        <span className="text-pink-400 font-bold">ŞİMDİ ÖDENEN</span>
                        <span className="text-3xl font-mono font-black text-white tracking-widest">
                            {customTotal || '0'}
                        </span>
                    </div>

                    {/* YENİ KALAN */}
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold uppercase text-slate-500">
                            YENİ KALAN
                        </span>
                        <span className="text-xl font-black text-slate-300">
                            {formatCurrency(newRemaining)} ₺
                        </span>
                    </div>
                </div>

                {/* NUMPAD */}
                <Numpad onInput={handleNumpadInput} showDot={true} isDarkMode={true} />

                {/* İNDİRİM & UYGULA BUTONLARI */}
                <div className="flex gap-2">
                    <button 
                        onClick={onDiscountToggle}
                        className={`
                            flex-1 h-12 rounded-xl border flex items-center justify-center gap-1 
                            font-bold text-xs transition-all
                            ${discountRate > 0 
                                ? 'bg-orange-600/20 border-orange-500 text-orange-400' 
                                : 'bg-slate-800 border-slate-700 text-slate-400'}
                        `}
                    >
                        <Percent size={14}/> 
                        {discountRate > 0 ? `%${discountRate} İnd.` : 'İndirim'}
                    </button>
                    <button 
                        onClick={onApply}
                        className="flex-[2] h-12 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all"
                    >
                        UYGULA
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PartialPaymentModal;