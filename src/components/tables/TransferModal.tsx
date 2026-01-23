import React from 'react';
import { Merge, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Table } from '../../types';

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

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className={`w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden transform transition-all ${isDarkMode ? 'bg-slate-900 border border-white/10' : 'bg-white border border-slate-200'}`}>
                <div className={`p-6 border-b text-center ${isDarkMode ? 'border-white/5 bg-slate-950' : 'border-slate-100 bg-slate-50'}`}>
                    <h3 className={`text-xl font-black uppercase tracking-wider mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>MASA BİRLEŞTİRME</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Bu iki masayı birleştirmek istiyor musunuz?</p>
                </div>
                <div className="p-8 flex items-center justify-center gap-6 md:gap-10">
                    <div className="flex flex-col items-center gap-3">
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg border-2 ${isDarkMode ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'bg-rose-100 border-rose-400 text-rose-600'}`}><span className="font-black text-xl text-center leading-tight">{pendingTransfer.source.name}</span></div>
                        <span className={`text-xs font-bold uppercase tracking-wide ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>MEVCUT</span>
                    </div>
                    <div className={`flex flex-col items-center gap-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}><Merge size={32} /><span className="text-[9px] font-black uppercase tracking-widest">BİRLEŞTİR</span></div>
                    <div className="flex flex-col items-center gap-3">
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg border-2 ${isDarkMode ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-emerald-100 border-emerald-400 text-emerald-600'}`}><span className="font-black text-xl text-center leading-tight">{pendingTransfer.target.name}</span></div>
                        <span className={`text-xs font-bold uppercase tracking-wide ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>HEDEF</span>
                    </div>
                </div>
                <div className={`p-4 flex gap-3 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
                    <button onClick={() => { setPendingTransfer(null); setActiveMode('default'); setTransferSource(null); }} className={`flex-1 py-3.5 rounded-xl font-bold transition-all ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}>İPTAL ET</button>
                    <button onClick={confirmTransferAction} disabled={processing} className="flex-1 py-3.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2">{processing ? <RefreshCw className="animate-spin" /> : <CheckCircle2 />}{processing ? 'İŞLENİYOR...' : 'ONAYLA'}</button>
                </div>
            </div>
        </div>
    );
};

export default TransferModal;
