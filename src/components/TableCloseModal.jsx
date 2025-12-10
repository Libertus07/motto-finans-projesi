// components/TableCloseModal.jsx

import React from 'react';
import { X, CheckCircle2, CreditCard, Banknote, Receipt, Loader2 } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { THEME } from '../utils/constants';

const TableCloseModal = ({ isOpen, onClose, onConfirm, tableName, amount, method, bank, loading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-200 backdrop-blur-sm" onClick={onClose}>
            <div className={`${THEME.card} p-6 rounded-3xl w-full max-w-sm border ${THEME.border} shadow-2xl relative overflow-hidden ring-1 ring-white/10`} onClick={e => e.stopPropagation()}>
                
                {/* Arka plan efekti */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                <div className="flex justify-between items-start mb-6 relative z-10">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Receipt className="text-emerald-400" size={24}/>
                            Hesabı Kapat
                        </h3>
                        <p className="text-slate-400 text-xs mt-1">{tableName}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white p-1 rounded-full"><X size={20}/></button>
                </div>

                <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800 mb-6 relative z-10 text-center">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Tahsil Edilecek Tutar</span>
                    <div className="text-4xl font-black text-white mt-2 tracking-tight">
                        {formatCurrency(amount)} <span className="text-lg text-emerald-500 font-medium">₺</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800 mb-6">
                    <div className={`p-2 rounded-lg ${method === 'cash' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {method === 'cash' ? <Banknote size={20}/> : <CreditCard size={20}/>}
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-bold uppercase">Ödeme Yöntemi</p>
                        <p className="text-sm font-bold text-white">
                            {method === 'cash' ? 'Nakit Ödeme' : `Kart / ${bank?.toUpperCase() || 'POS'}`}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 relative z-10">
                    <button onClick={onClose} className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors text-sm border border-slate-700">
                        İPTAL
                    </button>
                    <button 
                        onClick={onConfirm} 
                        disabled={loading}
                        className="flex-[2] py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 disabled:opacity-70 text-sm"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18}/> : <CheckCircle2 size={18}/>}
                        ÖDEMEYİ AL
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TableCloseModal;