// components/TableTransferModal.jsx

import React, { useState, useEffect } from 'react';
import { X, Move, ArrowRight, LayoutGrid, CheckCircle2, Loader2 } from 'lucide-react';
import { THEME } from '../utils/constants';

const TableTransferModal = ({ isOpen, onClose, tables, selectedTableId, onConfirm, loading }) => {
    const [targetTableId, setTargetTableId] = useState('');
    
    // Modal açıldığında state'i sıfırla
    useEffect(() => {
        if (isOpen) setTargetTableId('');
    }, [isOpen]);

    if (!isOpen) return null;

    const sourceTable = tables.find(t => t.id === selectedTableId);
    const availableTables = tables.filter(t => t.status === 'empty' && t.id !== selectedTableId);

    const handleConfirm = () => {
        if (targetTableId) {
            onConfirm(selectedTableId, targetTableId);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-200 backdrop-blur-sm" onClick={onClose}>
            <div className={`${THEME.card} p-6 rounded-3xl w-full max-w-lg border ${THEME.border} shadow-2xl relative overflow-hidden ring-1 ring-white/10`} onClick={e => e.stopPropagation()}>
                
                {/* Arka plan efekti */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                {/* Başlık */}
                <div className="flex justify-between items-start border-b border-slate-700/50 pb-4 mb-6 relative z-10">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400"><Move size={20}/></div>
                            Masa Transferi
                        </h3>
                        <p className="text-slate-400 text-xs mt-1 ml-1">Siparişleri başka bir masaya taşıyın.</p>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors bg-slate-800/50 p-2 rounded-full hover:bg-slate-700">
                        <X size={20}/>
                    </button>
                </div>

                {/* Transfer Görselleştirmesi */}
                <div className="flex items-center justify-between bg-slate-950/50 p-4 rounded-2xl border border-slate-800 mb-6 relative z-10">
                    {/* Kaynak Masa */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 font-bold">
                            {sourceTable?.number}
                        </div>
                        <span className="text-xs text-slate-400 font-bold">{sourceTable?.name}</span>
                    </div>

                    {/* Ok */}
                    <div className="flex flex-col items-center text-slate-500">
                        <span className="text-[10px] uppercase font-bold mb-1">Taşınıyor</span>
                        <ArrowRight size={24} className="text-indigo-500 animate-pulse"/>
                    </div>

                    {/* Hedef Masa (Seçilen) */}
                    <div className="flex flex-col items-center gap-2">
                        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center font-bold transition-all ${targetTableId ? 'bg-emerald-600/20 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-600'}`}>
                            {targetTableId ? tables.find(t => t.id === targetTableId)?.number : '?'}
                        </div>
                        <span className="text-xs text-slate-400 font-bold">{targetTableId ? tables.find(t => t.id === targetTableId)?.name : 'Seçiniz'}</span>
                    </div>
                </div>

                {/* Hedef Masa Seçimi */}
                <div className="space-y-2 mb-8 relative z-10">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Hedef Boş Masa</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <LayoutGrid size={18} className="text-slate-500"/>
                        </div>
                        <select 
                            value={targetTableId} 
                            onChange={(e) => setTargetTableId(e.target.value)} 
                            className="w-full bg-slate-900 border border-slate-600 rounded-xl py-4 pl-12 pr-4 text-white text-sm font-bold outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer hover:bg-slate-800 focus:ring-1 focus:ring-indigo-500/20"
                        >
                            <option value="">Lütfen Bir Masa Seçiniz...</option>
                            {availableTables.map(t => (
                                <option key={t.id} value={t.id}>
                                    {t.name} (Bölge: {t.zone})
                                </option>
                            ))}
                        </select>
                        {/* Custom Arrow */}
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>

                {/* Butonlar */}
                <div className="flex gap-3 relative z-10">
                    <button onClick={onClose} className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors border border-slate-700 text-sm">
                        İPTAL
                    </button>
                    <button 
                        onClick={handleConfirm} 
                        disabled={!targetTableId || loading}
                        className="flex-[2] py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm active:scale-[0.98]"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18}/> : <CheckCircle2 size={18}/>}
                        TRANSFERİ ONAYLA
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TableTransferModal;