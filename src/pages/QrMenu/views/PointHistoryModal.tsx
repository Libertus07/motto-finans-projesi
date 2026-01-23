import React from 'react';
import { X, History, Loader2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { PointHistoryItem } from '../../../types';

interface PointHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    pointHistory: PointHistoryItem[];
    isLoadingHistory: boolean;
}

const PointHistoryModal: React.FC<PointHistoryModalProps> = ({ isOpen, onClose, pointHistory, isLoadingHistory }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose} />
            <div className="bg-[#0a0a0a] w-full max-w-md rounded-[2.5rem] relative shadow-[0_0_50px_rgba(212,175,55,0.15)] animate-in zoom-in-95 duration-300 border border-[#D4AF37]/30 flex flex-col max-h-[85vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-[#D4AF37]/20 flex justify-between items-center bg-gradient-to-r from-[#D4AF37]/5 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#D4AF37]/10 rounded-xl">
                            <History size={20} className="text-[#D4AF37]" />
                        </div>
                        <h2 className="text-xl font-black text-[#FDFBF7] font-cinzel tracking-wide">Puan Geçmişi</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[#D4AF37]/10 rounded-full text-[#FDFBF7]/60 hover:text-[#D4AF37] transition-all"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-3">
                    {isLoadingHistory ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-2">
                            <Loader2 className="animate-spin text-[#D4AF37]" size={32} />
                            <span className="text-xs font-bold text-[#D4AF37]">Yükleniyor...</span>
                        </div>
                    ) : pointHistory.length === 0 ? (
                        <div className="text-center py-12">
                            <History size={40} className="mx-auto text-[#FDFBF7]/10 mb-3" />
                            <p className="text-[#FDFBF7]/40 font-bold text-sm">İşlem kaydı bulunamadı.</p>
                        </div>
                    ) : (
                        pointHistory.map((item) => {
                            const isEarned = ((item.earnedPoints || 0) > 0) || (item.points > 0 && item.type === 'gift');
                            const points = item.earnedPoints || item.points || 0;
                            const date = (item.timestamp && typeof item.timestamp === 'object' && 'toDate' in item.timestamp)
                                ? (item.timestamp as any).toDate()
                                : new Date((item.timestamp as string | Date) || item.createdAt);

                            return (
                                <div key={item.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between shadow-sm hover:border-[#D4AF37]/30 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isEarned ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {isEarned ? <ArrowUpRight size={20} className="stroke-[2.5]" /> : <ArrowDownLeft size={20} className="stroke-[2.5]" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#FDFBF7] text-sm mb-0.5">
                                                {item.type === 'order' ? 'Sipariş Kazanımı' :
                                                    item.type === 'usage' ? 'Puan Harcama' :
                                                        item.type === 'gift' ? (item.description || 'Hediye Puan') :
                                                            item.type === 'referral' ? 'Davet Kazancı' :
                                                                item.type === 'welcome_bonus' ? 'Hoşgeldin Bonusu' : 'İşlem'}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[10px] font-bold text-[#FDFBF7]/40">
                                                    {date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                {item.orderId && (
                                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-[#FDFBF7]/60">#{item.orderId.slice(-4)}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`font-black text-base tabular-nums ${isEarned ? 'text-green-400' : 'text-red-400'}`}>
                                            {isEarned ? '+' : '-'}{points}
                                        </span>
                                        <p className="text-[9px] font-bold text-[#FDFBF7]/30 uppercase">VOLT</p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default PointHistoryModal;