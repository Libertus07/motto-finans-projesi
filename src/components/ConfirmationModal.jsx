// components/ConfirmationModal.jsx

import React from 'react';
import { X, AlertTriangle, CheckCircle2, Trash2, Info } from 'lucide-react';
import { THEME } from '../utils/constants';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = 'danger', confirmText = 'ONAYLA', loading }) => {
    if (!isOpen) return null;

    const isDanger = type === 'danger';
    const Icon = isDanger ? Trash2 : (type === 'warning' ? AlertTriangle : Info);
    const colorClass = isDanger ? 'text-red-400' : (type === 'warning' ? 'text-yellow-400' : 'text-blue-400');
    const bgClass = isDanger ? 'bg-red-500/20' : (type === 'warning' ? 'bg-yellow-500/20' : 'bg-blue-500/20');
    const btnClass = isDanger ? 'bg-red-600 hover:bg-red-700' : (type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700');

    return (
        <div className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-200 backdrop-blur-sm" onClick={onClose}>
            <div className={`${THEME.card} p-6 rounded-3xl w-full max-w-sm border ${THEME.border} shadow-2xl relative overflow-hidden`} onClick={e => e.stopPropagation()}>
                
                <div className="flex flex-col items-center text-center">
                    <div className={`p-4 rounded-full ${bgClass} ${colorClass} mb-4`}>
                        <Icon size={32} />
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                    <p className="text-slate-400 text-sm mb-6">{message}</p>
                    
                    <div className="flex gap-3 w-full">
                        <button onClick={onClose} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors">
                            İPTAL
                        </button>
                        <button 
                            onClick={onConfirm} 
                            disabled={loading}
                            className={`flex-1 py-3 ${btnClass} text-white font-bold rounded-xl transition-colors shadow-lg disabled:opacity-50`}
                        >
                            {loading ? 'İşleniyor...' : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;