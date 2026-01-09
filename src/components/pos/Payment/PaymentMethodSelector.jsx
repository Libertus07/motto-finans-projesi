// components/pos/Payment/PaymentMethodSelector.jsx
import React from 'react';
import { Banknote, CreditCard } from 'lucide-react';

const PaymentMethodSelector = ({ 
    paymentMethod, 
    onMethodChange,
    isDarkMode 
}) => {
    return (
        <div className={`
            p-1 rounded-2xl flex border relative 
            ${isDarkMode ? 'bg-slate-900/50 border-white/5' : 'bg-slate-100 border-slate-200'}
        `}>
            {/* NAKİT BUTONU */}
            <button 
                onClick={() => onMethodChange('cash')} 
                className={`
                    flex-1 py-3 rounded-xl text-xs font-bold 
                    flex items-center justify-center gap-2 
                    transition-all relative z-10 
                    ${paymentMethod === 'cash' 
                        ? 'text-white shadow-lg' 
                        : (isDarkMode 
                            ? 'text-slate-500 hover:text-slate-300' 
                            : 'text-slate-500 hover:text-slate-700')
                    }
                `}
            >
                {paymentMethod === 'cash' && (
                    <div className="absolute inset-0 bg-emerald-600 rounded-xl -z-10 animate-in fade-in zoom-in-95 duration-200" />
                )}
                <Banknote size={16}/> 
                NAKİT
            </button>

            {/* KART BUTONU */}
            <button 
                onClick={() => onMethodChange('card')} 
                className={`
                    flex-1 py-3 rounded-xl text-xs font-bold 
                    flex items-center justify-center gap-2 
                    transition-all relative z-10 
                    ${paymentMethod === 'card' 
                        ? 'text-white shadow-lg' 
                        : (isDarkMode 
                            ? 'text-slate-500 hover:text-slate-300' 
                            : 'text-slate-500 hover:text-slate-700')
                    }
                `}
            >
                {paymentMethod === 'card' && (
                    <div className="absolute inset-0 bg-indigo-600 rounded-xl -z-10 animate-in fade-in zoom-in-95 duration-200" />
                )}
                <CreditCard size={16}/> 
                KART
            </button>
        </div>
    );
};

export default PaymentMethodSelector;