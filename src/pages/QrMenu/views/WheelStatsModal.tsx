import React from 'react';
import { X, Loader2, BarChart3 } from 'lucide-react';

interface WheelStatsModalProps {
    isOpen: boolean;
    onClose: () => void;
    wheelStats: { totalSpins: number; totalPoints: number; prizeDistribution: Record<string, number> };
    isLoadingStats: boolean;
}

const WheelStatsModal: React.FC<WheelStatsModalProps> = ({ isOpen, onClose, wheelStats, isLoadingStats }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose} />
            <div className="bg-[#0a0a0a] w-full max-w-md rounded-[2.5rem] relative shadow-[0_0_50px_rgba(212,175,55,0.15)] animate-in zoom-in-95 duration-300 border border-[#D4AF37]/30 flex flex-col max-h-[85vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-[#D4AF37]/20 flex justify-between items-center bg-gradient-to-r from-[#D4AF37]/5 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#D4AF37]/10 rounded-xl">
                            <BarChart3 size={20} className="text-[#D4AF37]" />
                        </div>
                        <h2 className="text-xl font-black text-[#FDFBF7] font-cinzel tracking-wide">Çark İstatistikleri</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[#D4AF37]/10 rounded-full text-[#FDFBF7]/60 hover:text-[#D4AF37] transition-all"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                    {isLoadingStats ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-2">
                            <Loader2 className="animate-spin text-[#D4AF37]" size={32} />
                            <span className="text-xs font-bold text-[#D4AF37]">Yükleniyor...</span>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 text-center shadow-sm">
                                    <div className="text-3xl font-black text-[#FDFBF7] tabular-nums leading-none mb-1">{wheelStats.totalSpins}</div>
                                    <div className="text-[10px] font-bold text-[#FDFBF7]/30 uppercase tracking-[0.2em]">ÇEVİRME</div>
                                </div>
                                <div className="bg-[#D4AF37]/10 p-6 rounded-3xl border border-[#D4AF37]/20 text-center shadow-lg relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/10 to-transparent"></div>
                                    <div className="text-3xl font-black text-[#D4AF37] tabular-nums leading-none mb-1 drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">{wheelStats.totalPoints}</div>
                                    <div className="text-[10px] font-bold text-[#D4AF37]/60 uppercase tracking-[0.2em] relative z-10">DAĞITILAN VOLT</div>
                                </div>
                            </div>

                            <div className="bg-white/5 p-6 rounded-3xl border border-white/5 shadow-sm">
                                <h3 className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em] mb-8 border-b border-white/5 pb-3">Ödül Dağılımı</h3>
                                <div className="space-y-6">
                                    {Object.entries(wheelStats.prizeDistribution)
                                        .sort(([, a], [, b]) => b - a)
                                        .map(([label, count]) => (
                                            <div key={label} className="group">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-bold text-[#FDFBF7] group-hover:text-[#D4AF37] transition-colors">{label}</span>
                                                    <span className="text-[10px] font-black tabular-nums text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-1 rounded-lg">{count} ADET</span>
                                                </div>
                                                <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-[#D4AF37] to-[#8A6E2F] rounded-full shadow-[0_0_10px_rgba(212,175,55,0.4)] transition-all duration-1000 ease-out"
                                                        style={{ width: `${Math.max(2, (count / wheelStats.totalSpins) * 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WheelStatsModal;