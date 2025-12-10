// components/PaymentModal.jsx

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, Loader2, Wallet } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { THEME } from '../utils/constants';

const PaymentModal = ({ isOpen, onClose, debtData, onConfirm, loading }) => {
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');

    // Modal her açıldığında inputu temizle
    useEffect(() => {
        if (isOpen) {
            setAmount('');
            setError('');
        }
    }, [isOpen]);

    if (!isOpen || !debtData) return null;

    const handleSubmit = () => {
        const val = Number(amount);
        
        // Validasyonlar
        if (!val || val <= 0) {
            setError('Lütfen geçerli bir tutar girin.');
            return;
        }
        
        // Uyarı: Borçtan fazla ödeme
        if (val > debtData.currentBalance) {
            if (!window.confirm(`Dikkat: Ödeme tutarı (${formatCurrency(val)} ₺), kalan borçtan (${formatCurrency(debtData.currentBalance)} ₺) daha büyük. Devam etmek istiyor musunuz?`)) {
                return;
            }
        }
        
        onConfirm(val);
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-200 backdrop-blur-sm" onClick={onClose}>
            <div className={`${THEME.card} p-6 rounded-3xl w-full max-w-md border ${THEME.border} shadow-2xl relative overflow-hidden ring-1 ring-white/10`} onClick={e => e.stopPropagation()}>
                
                {/* Arka plan efekti */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                {/* Başlık */}
                <div className="flex justify-between items-start border-b border-slate-700/50 pb-4 mb-5 relative z-10">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400"><Wallet size={20}/></div>
                            Ödeme Yap
                        </h3>
                        <p className="text-slate-400 text-xs mt-2 ml-1">Tedarikçi: <span className="text-white font-bold">{debtData.supplier}</span></p>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors bg-slate-800/50 p-2 rounded-full hover:bg-slate-700">
                        <X size={20}/>
                    </button>
                </div>

                {/* Bilgi Kartı */}
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 mb-6 flex justify-between items-center relative z-10">
                    <span className="text-sm text-slate-400 font-medium">Kalan Toplam Borç</span>
                    <span className="text-2xl font-mono font-bold text-red-400 tracking-tight">{formatCurrency(debtData.currentBalance)} ₺</span>
                </div>

                {/* Input Alanı */}
                <div className="space-y-2 mb-8 relative z-10">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Ödenecek Tutar</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="text-slate-500 font-bold group-focus-within:text-emerald-500 transition-colors">₺</span>
                        </div>
                        <input 
                            type="number" 
                            placeholder="0.00" 
                            value={amount}
                            onChange={(e) => {setAmount(e.target.value); setError('');}}
                            className="w-full bg-slate-900 border border-slate-600 rounded-xl py-4 pl-10 pr-4 text-white text-xl font-bold outline-none focus:border-emerald-500 transition-all focus:ring-1 focus:ring-emerald-500/20"
                            autoFocus
                        />
                    </div>
                    {error && <p className="text-red-400 text-xs flex items-center gap-1 pl-1 mt-2 animate-in slide-in-from-left-2"><AlertTriangle size={12}/> {error}</p>}
                </div>

                {/* Butonlar */}
                <div className="flex gap-3 relative z-10">
                    <button onClick={onClose} className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors border border-slate-700 text-sm">
                        İPTAL
                    </button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={loading}
                        className="flex-[2] py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm active:scale-[0.98]"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18}/> : <CheckCircle2 size={18}/>}
                        ÖDEMEYİ ONAYLA
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;