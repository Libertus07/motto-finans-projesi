// components/InfoModal.jsx

import React from 'react';
import { CheckCircle2, AlertCircle, XCircle, Info } from 'lucide-react';
import { THEME } from '../utils/constants';

const InfoModal = ({ isOpen, onClose, title, message, type = 'success' }) => {
    if (!isOpen) return null;

    let Icon = CheckCircle2;
    let colorClass = 'text-emerald-400';
    let bgClass = 'bg-emerald-500/20';
    let btnClass = 'bg-emerald-600 hover:bg-emerald-500';

    if (type === 'error') {
        Icon = XCircle;
        colorClass = 'text-red-400';
        bgClass = 'bg-red-500/20';
        btnClass = 'bg-red-600 hover:bg-red-500';
    } else if (type === 'warning') {
        Icon = AlertCircle;
        colorClass = 'text-yellow-400';
        bgClass = 'bg-yellow-500/20';
        btnClass = 'bg-yellow-600 hover:bg-yellow-500';
    } else if (type === 'info') {
        Icon = Info;
        colorClass = 'text-blue-400';
        bgClass = 'bg-blue-500/20';
        btnClass = 'bg-blue-600 hover:bg-blue-500';
    }

    return (
        <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-200 backdrop-blur-sm" onClick={onClose}>
            <div className={`${THEME.card} p-6 rounded-3xl w-full max-w-sm border ${THEME.border} shadow-2xl relative overflow-hidden ring-1 ring-white/10`} onClick={e => e.stopPropagation()}>
                <div className="flex flex-col items-center text-center">
                    <div className={`p-4 rounded-full ${bgClass} ${colorClass} mb-4 shadow-lg`}>
                        <Icon size={32} />
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">{message}</p>
                    
                    <button 
                        onClick={onClose} 
                        className={`w-full py-3 ${btnClass} text-white font-bold rounded-xl transition-all shadow-lg active:scale-[0.98]`}
                    >
                        TAMAM
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InfoModal;