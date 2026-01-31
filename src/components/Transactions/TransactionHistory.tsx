import React, { useMemo } from 'react';
import { History, ArrowUpRight, ArrowDownRight, Trash2, Clock } from 'lucide-react';
import { formatCurrency, getSubMethod } from '../../utils/helpers';
import { THEME } from '../../utils/constants';
import { GroupedVirtuoso } from 'react-virtuoso';
import { Transaction } from '../../types';

interface TransactionHistoryProps {
    filteredAndSortedTransactions: Transaction[];
    groupedTransactions: Record<string, Transaction[]>;
    filterPeriod: string;
    setFilterPeriod: (period: string) => void;
    filterType: string;
    setFilterType: (type: string) => void;
    filteredTotals: { income: number; expense: number };
    handleDeleteTransaction: (id: string) => void;
    isPatron: boolean;
    onLoadMore?: () => void;
    isLoadingMore?: boolean;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
    filteredAndSortedTransactions,
    groupedTransactions,
    filterPeriod,
    setFilterPeriod,
    filterType,
    setFilterType,
    filteredTotals,
    handleDeleteTransaction,
    isPatron,
    onLoadMore,
    isLoadingMore
}) => {
    // 🚀 PERFORMANS: Sanallaştırma için veriyi hazırla
    const { groupCounts, groupLabels, flatTransactions } = useMemo(() => {
        const entries = Object.entries(groupedTransactions);
        const counts = entries.map(([, items]) => items.length);
        const labels = entries.map(([label]) => label);
        const flat = entries.flatMap(([, items]) => items);
        return { groupCounts: counts, groupLabels: labels, flatTransactions: flat };
    }, [groupedTransactions]);

    return (
        <div className={`${THEME.card} rounded-[2.5rem] border ${THEME.border} flex flex-col h-[750px] shadow-2xl overflow-hidden bg-slate-900/30 backdrop-blur-xl`}>
            {/* AKILLI FİLTRELEME VE ÖZET */}
            <div className="p-6 border-b border-slate-800/60 bg-slate-900/60">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20">
                            <History size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-white uppercase tracking-tighter">
                                İşlem Geçmişi
                            </h3>
                            <p className="text-[10px] text-slate-500 font-bold">
                                {filteredAndSortedTransactions.length} Kayıt
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-tighter">
                            Net Akış
                        </p>
                        <p className="text-sm font-black text-white">
                            {formatCurrency(filteredTotals.income - filteredTotals.expense)} ₺
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                        {['all', 'today', 'week'].map(p => (
                            <button
                                key={p}
                                onClick={() => setFilterPeriod(p)}
                                className={`flex-1 py-1.5 rounded-lg text-[9px] font-black transition-all ${filterPeriod === p ? 'bg-slate-700 text-white' : 'text-slate-500'
                                    }`}
                            >
                                {p === 'all' ? 'HEPSİ' : p === 'today' ? 'BUGÜN' : 'HAFTA'}
                            </button>
                        ))}
                    </div>
                    <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                        {['all', 'income', 'expense'].map(t => (
                            <button
                                key={t}
                                onClick={() => setFilterType(t)}
                                className={`flex-1 py-1.5 rounded-lg text-[9px] font-black transition-all ${filterType === t
                                    ? (t === 'income' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white')
                                    : 'text-slate-500'
                                    }`}
                            >
                                {t === 'all' ? 'TİP' : t === 'income' ? 'GELİR' : 'GİDER'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* GRUPLANMIŞ LİSTE ALANI */}
            <div className="flex-1 p-4 bg-slate-950/20">
                {flatTransactions.length > 0 ? (
                    <GroupedVirtuoso
                        style={{ height: '100%' }}
                        groupCounts={groupCounts}
                        groupContent={(index) => (
                            <div className="py-3 bg-slate-950/95 backdrop-blur-xl z-20 border-b border-slate-800/50 mb-2 -mx-2 px-2">
                                <div className="flex items-center gap-4">
                                    <span className="text-[9px] font-black text-slate-500 tracking-[0.3em] uppercase">
                                        {groupLabels[index]}
                                    </span>
                                    <div className="h-[1px] w-full bg-slate-800/30"></div>
                                </div>
                            </div>
                        )}
                        itemContent={(index) => {
                            const t = flatTransactions[index];
                            return (
                                <div className="pb-3 px-1">
                                    <div className="group relative flex items-center justify-between p-4 rounded-3xl bg-slate-900/40 border border-slate-800/50 hover:bg-slate-800/60 hover:border-indigo-500/30 transition-all duration-300">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-all group-hover:scale-110 ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                                                }`}>
                                                {t.type === 'income' ? (
                                                    <ArrowUpRight size={20} strokeWidth={3} />
                                                ) : (
                                                    <ArrowDownRight size={20} strokeWidth={3} />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-xs font-black text-slate-200 uppercase tracking-tight mb-1 truncate group-hover:text-white">
                                                    {t.desc}
                                                </h4>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500">
                                                        <Clock size={10} />
                                                        {(() => {
                                                            if (t.timestamp && typeof t.timestamp === 'object' && 'seconds' in t.timestamp) {
                                                                return new Date(t.timestamp.seconds * 1000).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                                                            }
                                                            if (t.createdAt) {
                                                                return new Date(t.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                                                            }
                                                            return '--:--';
                                                        })()}
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${t.method === 'cash' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-indigo-500/10 text-indigo-400'
                                                        }`}>
                                                        {getSubMethod(t)}
                                                    </span>
                                                    <span className="text-[8px] text-slate-600 font-bold uppercase">
                                                        {t.category || (t.type === 'income' ? 'Satış' : 'Harcama')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 pl-4 border-l border-slate-800/50">
                                            <div className="text-right">
                                                <p className={`text-sm font-black tracking-tighter leading-none ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                                                    }`}>
                                                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                                </p>
                                                <p className="text-[8px] text-slate-600 font-bold mt-1 uppercase">TL</p>
                                            </div>
                                            {isPatron && (
                                                <button
                                                    onClick={() => handleDeleteTransaction(t.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-2.5 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all transform translate-x-2 group-hover:translate-x-0"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        }}
                    />
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                        <History size={48} strokeWidth={1} className="mb-2" />
                        <p className="text-xs font-bold">İşlem bulunamadı</p>
                    </div>
                )}

                {/* Load More Button */}
                {onLoadMore && filteredAndSortedTransactions.length > 0 && filterPeriod === 'all' && (
                    <div className="p-4 border-t border-slate-800/50 bg-slate-900/40 text-center">
                        <button
                            onClick={onLoadMore}
                            disabled={isLoadingMore}
                            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 disabled:opacity-50 transition-colors"
                        >
                            {isLoadingMore ? "Yükleniyor..." : "Daha Fazla Göster"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionHistory;
