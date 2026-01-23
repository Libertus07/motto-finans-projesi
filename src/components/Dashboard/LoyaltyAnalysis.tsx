import React from 'react';
import { BrainCircuit, Coffee, Crown, TrendingUp, Zap } from 'lucide-react';

interface LoyaltyAnalysisProps {
    topLoyaltyProductReal: {
        name?: string;
        share: number;
    };
    loyaltyAnalytics: {
        growthRate: number | string;
        redemptionRate: number | string;
    };
}

const LoyaltyAnalysis: React.FC<LoyaltyAnalysisProps> = ({
    topLoyaltyProductReal,
    loyaltyAnalytics
}) => {
    return (
        <div className="mt-8">
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2 tracking-tight">
                <BrainCircuit className="text-purple-400" /> Stratejik Sadakat Analizi
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* LOKOMOTİF ÜRÜN KARTI */}
                <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-[2.5rem] border border-indigo-500/30 p-8 relative overflow-hidden group">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/20 blur-[80px] rounded-full group-hover:bg-indigo-500/40 transition-all duration-700"></div>

                    <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                        <div className="w-24 h-24 bg-slate-900/80 rounded-[32px] border border-indigo-500/30 flex items-center justify-center shadow-2xl relative">
                            <Coffee size={40} className="text-indigo-400" />
                            <div className="absolute -top-2 -right-2 bg-amber-500 text-black p-1.5 rounded-xl shadow-lg animate-bounce">
                                <Crown size={14} />
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-500/30">
                                M-Coin Lokomotifi
                            </span>
                            <h4 className="text-2xl font-black text-white mt-3 mb-1">
                                {topLoyaltyProductReal?.name || "Veri Bekleniyor..."}
                            </h4>
                            <p className="text-slate-400 text-xs leading-relaxed">
                                Bu ürün, toplam dağıtılan puanların <span className="text-indigo-400 font-bold">%{topLoyaltyProductReal.share}</span>'ini tek başına karşılıyor.
                            </p>
                        </div>

                        <div className="flex flex-col items-center justify-center bg-slate-900/50 p-6 rounded-[2rem] border border-white/5">
                            <span className="text-[9px] font-black text-slate-500 uppercase mb-1">Katkı Payı</span>
                            <span className="text-2xl font-black text-emerald-400">%{topLoyaltyProductReal?.share || 0}</span>
                        </div>
                    </div>
                </div>

                {/* MÜŞTERİ SEGMENTASYON ÖZETİ (Küçük Bilgi Kartı) */}
                <div className="bg-slate-800/50 rounded-[2.5rem] border border-slate-700 p-8 flex flex-col justify-center">
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                    <TrendingUp size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white">Müdavim Artış Hızı</p>
                                </div>
                            </div>
                            <span className={`text-lg font-black ${Number(loyaltyAnalytics.growthRate) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {Number(loyaltyAnalytics.growthRate) >= 0 ? '+' : ''}%{loyaltyAnalytics.growthRate}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                                    <Zap size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white">Aktif Puan Kullanımı</p>
                                </div>
                            </div>
                            <span className="text-lg font-black text-purple-400">%{loyaltyAnalytics.redemptionRate}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoyaltyAnalysis;
