// components/pos/Payment/ChangeDisplay.jsx
import React from 'react';
import { X } from 'lucide-react';
import { formatCurrency } from '../../../utils/helpers';

const ChangeDisplay = ({ 
    receivedAmount, 
    currentPayable, 
    onClear,
    isDarkMode 
}) => {
    const received = Number(receivedAmount);
    const isEnough = received >= currentPayable;
    const changeAmount = Math.abs(received - currentPayable);

    return (
        <div className={`
            relative overflow-hidden rounded-xl border p-3 
            flex items-center justify-between 
            animate-in slide-in-from-bottom-2 fade-in
            ${isEnough 
                ? (isDarkMode 
                    ? 'bg-emerald-900/30 border-emerald-500/50' 
                    : 'bg-emerald-50 border-emerald-200') 
                : (isDarkMode 
                    ? 'bg-red-900/30 border-red-500/50' 
                    : 'bg-red-50 border-red-200')
            }
        `}>
            {/* ARKA PLAN GRADIENT */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-50" />

            {/* KAPAT BUTONU */}
            <button 
                onClick={onClear} 
                className="absolute top-1.5 right-1.5 p-1 bg-black/20 hover:bg-black/40 rounded-full text-white/50 hover:text-white transition-colors z-20"
            >
                <X size={12}/>
            </button>

            {/* ALINAN MİKTAR */}
            <div className="relative z-10 flex flex-col">
                <span className={`text-[10px] uppercase font-bold ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                    Alınan
                </span>
                <span className={`font-bold text-lg ${
                    isDarkMode ? 'text-white' : 'text-slate-800'
                }`}>
                    {formatCurrency(received)} ₺
                </span>
            </div>

            {/* PARA ÜSTÜ / EKSİK */}
            <div className="relative z-10 text-right pr-4">
                <span className={`text-[10px] uppercase font-bold ${
                    isEnough ? 'text-emerald-500' : 'text-red-500'
                }`}>
                    {isEnough ? 'PARA ÜSTÜ' : 'EKSİK'}
                </span>
                <span className={`block font-black text-2xl ${
                    isEnough ? 'text-emerald-500' : 'text-red-500'
                }`}>
                    {formatCurrency(changeAmount)} ₺
                </span>
            </div>
        </div>
    );
};

export default ChangeDisplay;