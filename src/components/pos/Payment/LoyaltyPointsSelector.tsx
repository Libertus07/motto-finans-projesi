// components/pos/Payment/LoyaltyPointsSelector.tsx
import React, { useState } from 'react';
import { Coins, X } from 'lucide-react';
import Numpad from '../shared/Numpad';
import { formatCurrency } from '../../../utils/helpers';
import { LoyaltyCustomer } from '../../../types';

interface LoyaltyPointsSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    loyaltyCustomer: LoyaltyCustomer | null;
    currentPayable: number;
    onConfirm: (points: number) => void;
    isDarkMode: boolean;
}

const LoyaltyPointsSelector: React.FC<LoyaltyPointsSelectorProps> = ({
    isOpen, onClose, loyaltyCustomer, currentPayable, onConfirm, isDarkMode
}) => {
    const [points, setPoints] = useState('');

    if (!isOpen || !loyaltyCustomer) return null;

    // 1 Puan = 0.5 TL Mantığı
    const maxUsePoints = Math.min(loyaltyCustomer.points, Math.ceil(currentPayable / 0.5));
    const discountValue = (Number(points) || 0) * 0.5;
    const canProceed = Number(points) > 0 && Number(points) <= maxUsePoints;

    const handleInput = (val: string | number) => {
        if (val === 'C') setPoints('');
        else if (val === 'BACK') setPoints(prev => prev.slice(0, -1));
        else {
            const next = points + val;
            if (Number(next) <= maxUsePoints) setPoints(next);
        }
    };

    return (
        <div className={`
            absolute inset-0 z-50 flex flex-col animate-in slide-in-from-bottom duration-300
            max-h-[100vh] overflow-y-auto
            ${isDarkMode ? 'bg-[#0B0F17]' : 'bg-white'}
        `}>
            {/* 🏆 COMPACT HEADER */}
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-indigo-600/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Coins size={16} className="text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-white leading-none mb-1">M-COIN KULLAN</p>
                        <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest">BAKİYE: {loyaltyCustomer.points} M</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500"><X size={20} /></button>
            </div>

            {/* 🎯 NUMERIC DISPLAY */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-2">
                <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-black text-white tracking-tighter">
                        {points || '0'}
                    </span>
                    <span className="text-sm font-bold text-indigo-500 uppercase">Coin</span>
                </div>
                <div className={`
                    px-4 py-1.5 rounded-full border transition-all duration-500
                    ${points ? 'bg-emerald-500/10 border-emerald-500/20 scale-110' : 'bg-transparent border-transparent'}
                `}>
                    <span className="text-xs font-black text-emerald-500">
                        {points ? `-${formatCurrency(discountValue)} ₺ İndirim` : 'Miktar Giriniz'}
                    </span>
                </div>
            </div>

            {/* ⌨️ INTEGRATED NUMPAD */}
            <div className="p-4 bg-slate-900/20 border-t border-white/5">
                <div className="max-w-[280px] mx-auto scale-95 lg:scale-100">
                    <Numpad onInput={handleInput} isDarkMode={isDarkMode} />
                </div>
            </div>

            {/* 🏁 ACTION BUTTON */}
            <div className="p-4 shrink-0">
                <button
                    onClick={() => { onConfirm(Number(points)); onClose(); }}
                    disabled={!canProceed}
                    className={`
                        w-full py-4 rounded-2xl font-black text-xs tracking-[0.2em] transition-all active:scale-95
                        ${canProceed ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/20' : 'bg-slate-800 text-slate-600'}
                    `}
                >
                    İNDİRİMİ UYGULA
                </button>
            </div>
        </div>
    );
};

export default LoyaltyPointsSelector;
