// components/LiquidationModal.jsx

import React, { useState, useEffect } from 'react';
import { X, Coins, ArrowRight, Loader2 } from 'lucide-react';
import { THEME } from '../utils/constants';
import { formatCurrency } from '../utils/helpers';

const LiquidationModal = ({ isOpen, onClose, investment, onConfirm, loading }) => {
    const [qty, setQty] = useState('');
    const [price, setPrice] = useState('');

    useEffect(() => {
        if (isOpen && investment) {
            setQty(investment.quantity); // Varsayılan olarak hepsini sat
            setPrice(investment.currentPrice || investment.buyPrice); // Varsayılan güncel fiyat
        }
    }, [isOpen, investment]);

    if (!isOpen || !investment) return null;

    const totalIncome = Number(qty) * Number(price);
    const profit = (Number(price) - investment.buyPrice) * Number(qty);

    const handleConfirm = () => {
        if (!qty || !price || qty <= 0 || price <= 0) return alert("Geçerli değerler giriniz.");
        if (qty > investment.quantity) return alert("Stoktan fazla satış yapılamaz.");
        onConfirm(Number(qty), Number(price));
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className={`${THEME.card} p-6 rounded-3xl w-full max-w-md border ${THEME.border} shadow-2xl relative`} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2"><Coins className="text-yellow-500"/> Yatırım Bozdur</h3>
                    <button onClick={onClose}><X className="text-slate-400"/></button>
                </div>

                <div className="space-y-4">
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 text-center mb-4">
                        <span className="text-yellow-500 font-bold block">{investment.type}</span>
                        <span className="text-slate-400 text-xs">Mevcut Stok: {investment.quantity} Adet</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-slate-400 block mb-1">Satılacak Adet</label>
                            <input type="number" value={qty} onChange={e => setQty(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white font-bold text-center"/>
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 block mb-1">Satış Fiyatı (Birim)</label>
                            <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-emerald-400 font-bold text-center"/>
                        </div>
                    </div>

                    <div className="bg-slate-900/50 p-4 rounded-xl space-y-2 border border-slate-800">
                        <div className="flex justify-between text-sm"><span className="text-slate-400">Toplam Gelir:</span><span className="text-white font-bold">{formatCurrency(totalIncome)} ₺</span></div>
                        <div className="flex justify-between text-sm"><span className="text-slate-400">Tahmini Kâr:</span><span className={`font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(profit)} ₺</span></div>
                    </div>

                    <button onClick={handleConfirm} disabled={loading} className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin"/> : <ArrowRight/>} BOZDUR VE KASAYA EKLE
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LiquidationModal;