import React from 'react';
import { Merge, RefreshCw, CheckCircle2, ArrowRightLeft } from 'lucide-react';
import { Table } from '../../types';
import { formatCurrency } from '../../utils/helpers';

interface TransferModalProps {
    pendingTransfer: { source: Table; target: Table } | null;
    setPendingTransfer: (val: { source: Table; target: Table } | null) => void;
    setActiveMode: (mode: 'default' | 'transfer' | 'clean' | 'reserve') => void;
    setTransferSource: (table: Table | null) => void;
    confirmTransferAction: () => void;
    processing: boolean;
    isDarkMode: boolean;
}

const TransferModal: React.FC<TransferModalProps> = ({
    pendingTransfer,
    setPendingTransfer,
    setActiveMode,
    setTransferSource,
    confirmTransferAction,
    processing,
    isDarkMode
}) => {
    if (!pendingTransfer) return null;

    const sourceOrderCount = pendingTransfer.source.orders?.length || 0;
    const targetOrderCount = pendingTransfer.target.orders?.length || 0;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className={`w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-[#0F131C] border border-white/10' : 'bg-white border border-slate-200'}`}>
                {/* PREMIUM HEADER */}
                <div className={`p-8 border-b relative overflow-hidden ${isDarkMode ? 'border-white/5 bg-slate-950/50' : 'border-slate-100 bg-slate-50'}`}>
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Merge size={80} />
                    </div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className={`mb-4 w-12 h-12 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                            <ArrowRightLeft size={24} className="animate-pulse" />
                        </div>
                        <h3 className={`text-2xl font-black uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Masa Birleştirme</h3>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Adisyonlar tek bir masada toplanacak</p>
                    </div>
                </div>

                {/* VISUAL FLOW AREA */}
                <div className="p-8 md:p-12 relative">
                    <div className="flex items-center justify-between gap-4 md:gap-8 relative z-10">
                        {/* SOURCE TABLE */}
                        <div className="flex flex-col items-center gap-4 flex-1">
                            <div className={`w-28 h-28 rounded-3xl flex flex-col items-center justify-center shadow-2xl border-2 transition-transform hover:scale-105 duration-500
                                ${isDarkMode ? 'bg-rose-500/10 border-rose-500/40 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-600'}`}>
                                <span className="font-black text-2xl mb-1">{pendingTransfer.source.name}</span>
                                <div className="flex flex-col items-center opacity-80">
                                    <span className="text-[10px] font-black uppercase tracking-widest">{sourceOrderCount} Ürün</span>
                                    <span className="text-sm font-black">{formatCurrency(pendingTransfer.source.total)}₺</span>
                                </div>
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Kaynak</span>
                        </div>

                        {/* ANIMATED CONNECTOR */}
                        <div className="flex flex-col items-center gap-2">
                            <div className={`w-12 h-px bg-gradient-to-r from-rose-500/50 via-indigo-500 to-emerald-500/50 relative overflow-hidden`}>
                                <div className="absolute inset-0 bg-white/40 animate-[shimmer_1.5s_infinite]"></div>
                            </div>
                            <div className={`${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'} animate-bounce`}>
                                <Merge size={32} />
                            </div>
                            <div className={`w-12 h-px bg-gradient-to-r from-rose-500/50 via-indigo-500 to-emerald-500/50 relative overflow-hidden`}>
                                <div className="absolute inset-0 bg-white/40 animate-[shimmer_1.5s_infinite] [animation-delay:0.5s]"></div>
                            </div>
                        </div>

                        {/* TARGET TABLE */}
                        <div className="flex flex-col items-center gap-4 flex-1">
                            <div className={`w-28 h-28 rounded-3xl flex flex-col items-center justify-center shadow-2xl border-2 transition-transform hover:scale-105 duration-500
                                ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
                                <span className="font-black text-2xl mb-1">{pendingTransfer.target.name}</span>
                                <div className="flex flex-col items-center opacity-80">
                                    <span className="text-[10px] font-black uppercase tracking-widest">{targetOrderCount} Ürün</span>
                                    <span className="text-sm font-black">{formatCurrency(pendingTransfer.target.total)}₺</span>
                                </div>
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Hedef</span>
                        </div>
                    </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className={`p-6 md:p-8 flex flex-col sm:flex-row gap-4 ${isDarkMode ? 'bg-slate-950/80' : 'bg-slate-50/80'}`}>
                    <button
                        onClick={() => { setPendingTransfer(null); setActiveMode('default'); setTransferSource(null); }}
                        className={`flex-1 py-5 rounded-[1.25rem] font-black tracking-widest text-xs transition-all duration-300
                            ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white border-2 border-slate-100 text-slate-500 hover:bg-slate-100'}`}>
                        VAZGEÇ
                    </button>
                    <button
                        onClick={confirmTransferAction}
                        disabled={processing}
                        className="flex-[1.5] py-5 rounded-[1.25rem] font-black tracking-widest text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xl shadow-indigo-500/40 transition-all duration-300 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
                        {processing ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                        {processing ? 'İŞLENİYOR...' : 'ONAYLA VE BİRLEŞTİR'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransferModal;
