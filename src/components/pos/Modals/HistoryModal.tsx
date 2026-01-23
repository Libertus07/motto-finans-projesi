// components/pos/Modals/HistoryModal.tsx
import React from 'react';
import { X, History } from 'lucide-react';
import { formatCurrency } from '../../../utils/helpers';
import { Transaction } from '../../../types';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    transactions: Transaction[];
    onVoidTransaction: (transactionId: string) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({
    isOpen,
    onClose,
    transactions,
    onVoidTransaction
}) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
            <div className="w-[400px] h-[500px] bg-[#1e2330] rounded-3xl shadow-2xl border border-white/10 p-5 flex flex-col">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <History size={20} className="text-slate-400" />
                        Son İşlemler (Bugün)
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* TRANSAKSİYON LİSTESİ */}
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                    {transactions.length === 0 ? (
                        <p className="text-slate-500 text-center mt-10">
                            Henüz işlem yok.
                        </p>
                    ) : (
                        transactions.map(transaction => (
                            <div
                                key={transaction.id}
                                className="bg-slate-800/50 p-3 rounded-xl border border-white/5 flex justify-between items-center group hover:bg-slate-800 transition-colors"
                            >
                                {/* SAĞDA BİLGİLER */}
                                <div>
                                    <div className="text-white font-bold">
                                        {formatCurrency(transaction.amount)} ₺
                                    </div>
                                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                        <span>
                                            {typeof transaction.timestamp === 'string'
                                                ? transaction.timestamp.split('T')[1]?.slice(0, 5)
                                                : (transaction.timestamp && typeof transaction.timestamp === 'object' && 'seconds' in transaction.timestamp)
                                                    ? new Date((transaction.timestamp as any).seconds * 1000).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
                                                    : ''}
                                        </span>
                                        •
                                        <span className="uppercase">
                                            {transaction.method === 'card' ? 'Kart' : 'Nakit'}
                                        </span>
                                    </div>
                                </div>

                                {/* İPTAL BUTONU */}
                                <button
                                    onClick={() => onVoidTransaction(transaction.id)}
                                    className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white text-xs font-bold rounded-lg transition-all"
                                >
                                    İPTAL
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryModal;
