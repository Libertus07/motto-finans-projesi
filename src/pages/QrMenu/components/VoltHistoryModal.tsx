import React from 'react';
import { X, Zap, Loader2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface VoltHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    history: any[];
    loadingHistory: boolean;
    historyFilter: 'all' | 'earned' | 'spent';
    setHistoryFilter: (filter: 'all' | 'earned' | 'spent') => void;
}

const VoltHistoryModal: React.FC<VoltHistoryModalProps> = ({
    isOpen, onClose, history, loadingHistory, historyFilter, setHistoryFilter
}) => {
    if (!isOpen) return null;

    const filteredHistory = history.filter(item => {
        const isEarned = (item.earnedPoints > 0) || (item.points > 0 && item.type === 'gift') || (item.points > 0 && item.type === 'game');
        if (historyFilter === 'earned') return isEarned;
        if (historyFilter === 'spent') return !isEarned;
        return true;
    });

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#FDFBF7] w-full max-w-sm rounded-[2.5rem] overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">

                {/* Header */}
                <div className="bg-gradient-to-br from-[#432818] to-[#2c1a0f] p-8 pb-10 relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <button
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-colors z-20"
                    >
                        <X size={18} />
                    </button>

                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20 shadow-lg">
                            <Zap size={28} className="text-[#D4AF37]" fill="currentColor" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-[#FDFBF7] font-cinzel tracking-wide">PUAN GEÇMİŞİ</h2>
                            <p className="text-[#D4AF37] text-xs font-bold tracking-widest uppercase mt-1">Hareketler</p>
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="px-6 -mt-6 relative z-10 pb-6 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="bg-white rounded-3xl p-4 shadow-xl border border-[#432818]/5 min-h-[200px]">
                        {loadingHistory ? (
                            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#432818]" /></div>
                        ) : history.length === 0 ? (
                            <div className="text-center py-12 text-[#432818]/40 text-sm">Henüz işlem geçmişi yok.</div>
                        ) : (
                            <>
                                <div className="flex p-1 bg-[#FDFBF7] rounded-xl mb-4 border border-[#432818]/5">
                                    {(['all', 'earned', 'spent'] as const).map((filter) => (
                                        <button
                                            key={filter}
                                            onClick={() => setHistoryFilter(filter)}
                                            className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all capitalize ${historyFilter === filter ? 'bg-[#432818] text-[#D4AF37] shadow-sm' : 'text-[#432818]/40 hover:text-[#432818]'}`}
                                        >
                                            {filter === 'all' ? 'Tümü' : filter === 'earned' ? 'Kazanılan' : 'Harcanan'}
                                        </button>
                                    ))}
                                </div>

                                {filteredHistory.length === 0 ? (
                                    <div className="text-center py-8 text-[#432818]/40 text-xs">Bu kategoride işlem bulunamadı.</div>
                                ) : (
                                    <div className="space-y-1">
                                        {filteredHistory.map((item) => {
                                            const isEarned = (item.earnedPoints > 0) || (item.points > 0 && item.type === 'gift') || (item.points > 0 && item.type === 'game');
                                            const points = item.earnedPoints || item.points || 0;
                                            const date = item.timestamp?.toDate ? item.timestamp.toDate() : new Date(item.timestamp || item.createdAt);

                                            return (
                                                <div key={item.id} className="p-3 rounded-2xl hover:bg-[#FDFBF7] transition-colors flex items-center justify-between group">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${isEarned ? 'bg-[#D4AF37]/10 border-[#D4AF37]/20 text-[#D4AF37]' : 'bg-[#432818]/5 border-[#432818]/10 text-[#432818]'}`}>
                                                            {isEarned ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-[#432818] text-xs font-cinzel line-clamp-1">{item.desc || (isEarned ? 'Puan Kazanımı' : 'Puan Harcama')}</p>
                                                            <p className="text-[9px] text-[#432818]/40 font-bold">{date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} • {date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`font-black text-sm font-cinzel ${isEarned ? 'text-[#D4AF37]' : 'text-[#432818]'}`}>
                                                        {isEarned ? '+' : '-'}{points}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoltHistoryModal;