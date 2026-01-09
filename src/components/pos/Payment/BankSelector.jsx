// components/pos/Payment/BankSelector.jsx
import React from 'react';
import { Building2 } from 'lucide-react';
import { bankOptions } from '../../../utils/pos/themes';

const BankSelector = ({ 
    selectedBank, 
    onBankChange,
    isDarkMode 
}) => {
    return (
        <div className="flex gap-2 animate-in slide-in-from-top-2 fade-in">
            {bankOptions.map(option => {
                const isActive = selectedBank === option.key;
                
                return (
                    <button 
                        key={option.key} 
                        onClick={() => onBankChange(option.key)} 
                        className={`
                            flex-1 h-14 rounded-xl border 
                            flex flex-col items-center justify-center gap-1 
                            transition-all duration-200 overflow-hidden group
                            ${isActive 
                                ? `${option.border} ${option.shadow} scale-105` 
                                : (isDarkMode 
                                    ? 'bg-slate-800 border-white/5 hover:bg-slate-700' 
                                    : 'bg-slate-100 border-slate-200 hover:bg-slate-200')
                            }
                        `}
                    >
                        {/* AKTIF ARKA PLAN */}
                        {isActive && (
                            <div className={`
                                absolute inset-0 bg-gradient-to-br ${option.gradient} opacity-20
                            `} />
                        )}

                        {/* İKON */}
                        <Building2 
                            size={16} 
                            className={
                                isActive 
                                    ? 'text-white' 
                                    : (isDarkMode ? 'text-slate-500' : 'text-slate-400')
                            }
                        />

                        {/* LABEL */}
                        <span className={`
                            text-[9px] font-bold uppercase tracking-wider 
                            ${isActive 
                                ? 'text-white' 
                                : (isDarkMode ? 'text-slate-400' : 'text-slate-500')
                            }
                        `}>
                            {option.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default BankSelector;