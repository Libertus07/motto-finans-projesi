// components/pos/Modals/RoundPriceModal.jsx
import React from 'react';
import { X, Tag } from 'lucide-react';
import { formatCurrency } from '../../../utils/helpers';
import Numpad from '../shared/Numpad';

const RoundPriceModal = ({ 
    isOpen, 
    onClose, 
    subTotal, 
    customTotal, 
    onCustomTotalChange,
    onApply
}) => {
    if (!isOpen) return null;

    const discountAmount = customTotal && Number(customTotal) < subTotal 
        ? subTotal - Number(customTotal) 
        : 0;

    const handleNumpadInput = (value) => {
        if (value === 'C') {
            onCustomTotalChange('');
        } else if (value === 'BACK') {
            onCustomTotalChange(String(customTotal).slice(0, -1));
        } else {
            onCustomTotalChange(String(customTotal) + value);
        }
    };

    return (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
            <div className="w-[340px] bg-[#1e2330] rounded-3xl shadow-2xl border border-white/10 p-5 flex flex-col gap-4">
                
                {/* HEADER */}
                <div className="flex justify-between items-center">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <Tag size={20} className="text-emerald-400"/> 
                        Yuvarla
                    </h3>
                    <button 
                        onClick={() => {
                            onClose();
                            if (!customTotal) onCustomTotalChange('');
                        }} 
                        className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"
                    >
                        <X size={18}/>
                    </button>
                </div>

                {/* DISPLAY PANEL */}
                <div className="rounded-2xl p-4 border bg-slate-900/50 border-white/5 flex flex-col gap-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Mevcut Tutar</span>
                        <span className="text-slate-300 font-bold line-through decoration-rose-500/50">
                            {formatCurrency(subTotal)} ₺
                        </span>
                    </div>

                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                        <span className="text-emerald-400 font-bold">Yeni Tutar</span>
                        <span className="text-3xl font-mono font-black text-white tracking-widest">
                            {customTotal || '0'}
                        </span>
                    </div>

                    {customTotal && Number(customTotal) < subTotal && (
                        <div className="flex justify-between items-end">
                            <span className="text-xs font-bold uppercase text-orange-400">
                                İndirim
                            </span>
                            <span className="text-xl font-bold text-orange-400">
                                -{formatCurrency(discountAmount)} ₺
                            </span>
                        </div>
                    )}
                </div>

                {/* NUMPAD */}
                <Numpad onInput={handleNumpadInput} showDot={true} isDarkMode={true} />

                {/* UYGULA BUTONU */}
                <button 
                    onClick={() => {
                        onApply();
                        onClose();
                    }}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all"
                >
                    UYGULA
                </button>
            </div>
        </div>
    );
};

export default RoundPriceModal;