// components/BulkUpdateModal.jsx

import React, { useState } from 'react';
import { X, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';
import { THEME } from '../utils/constants';

const BulkUpdateModal = ({ isOpen, onClose, selectedCategory, onUpdate, loading }) => {
    const [percent, setPercent] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleUpdate = () => {
        const p = Number(percent);
        if (isNaN(p) || p === 0 || p < -100) {
            return setError('Lütfen geçerli bir yüzde değeri girin (Örn: 10 veya -5). İndirim %100\'den fazla olamaz.');
        }
        if (p > 50 && !window.confirm(`%${p} gibi yüksek bir fiyat artışı yapılacak. Emin misiniz?`)) {
            return;
        }
        
        setError('');
        onUpdate(p); // Ana fonksiyona yüzde değerini gönder
        setPercent('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
            <div className={`${THEME.card} p-6 rounded-2xl w-full max-w-md border ${THEME.border} shadow-2xl animate-in zoom-in duration-300`} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start border-b border-slate-700 pb-3 mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2"><TrendingUp size={20}/> Toplu Fiyat Güncelleme</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-full"><X size={18}/></button>
                </div>

                <div className="mb-4 bg-slate-700/50 p-3 rounded-lg text-sm text-slate-300 flex items-center gap-2">
                    <AlertTriangle size={18} className="text-yellow-400"/>
                    <span>İşlem sadece **{selectedCategory === 'Tümü' ? 'TÜM' : selectedCategory}** kategorisindeki ürünlere uygulanacaktır.</span>
                </div>
                
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Yüzde Değişimi (Örn: 10 veya -5)</label>
                <div className="relative mb-4">
                    <input 
                        type="number"
                        placeholder="Örn: 10"
                        value={percent}
                        onChange={(e) => {setPercent(e.target.value); setError('');}}
                        className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 pl-4 pr-14 text-white text-3xl font-bold outline-none focus:border-indigo-500"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400 font-black text-3xl">%</span>
                </div>
                
                {error && <p className="text-red-400 text-sm mb-3 flex items-center gap-2"><X size={16}/> {error}</p>}

                <button 
                    onClick={handleUpdate} 
                    disabled={loading || !percent || isNaN(Number(percent))}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" size={20}/> : <TrendingUp size={20}/>}
                    {loading ? 'Güncelleniyor...' : 'FİYATLARI GÜNCELLE'}
                </button>
            </div>
        </div>
    );
};

export default BulkUpdateModal;