import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Coffee, Flame } from 'lucide-react';

const LiveTrends: React.FC = () => {
    const [trends, setTrends] = useState([
        { id: 1, name: 'Flat White', count: 12, icon: Coffee, color: 'text-orange-500' },
        { id: 2, name: 'San Sebastian', count: 8, icon: Flame, color: 'text-red-500' },
        { id: 3, name: 'Motto Özel Blend', count: 15, icon: TrendingUp, color: 'text-emerald-500' }
    ]);

    // Mock real-time update
    useEffect(() => {
        const interval = setInterval(() => {
            setTrends(prev => prev.map(t => ({
                ...t,
                count: t.count + (Math.random() > 0.7 ? 1 : 0)
            })));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="px-4 mt-6">
            <div className="bg-white/40 backdrop-blur-md rounded-3xl p-5 border border-white/20 shadow-sm overflow-hidden relative group">
                {/* Background Decoration */}
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#432818]/5 rounded-full blur-2xl group-hover:bg-[#D4AF37]/10 transition-colors"></div>

                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#432818] rounded-xl flex items-center justify-center text-[#D4AF37] shadow-lg">
                            <TrendingUp size={16} />
                        </div>
                        <h3 className="font-black text-[#432818] font-cinzel text-sm tracking-wider">CANLI TRENDLER</h3>
                    </div>
                    <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-full">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Canlı</span>
                    </div>
                </div>

                <div className="space-y-3">
                    {trends.map((trend) => (
                        <div key={trend.id} className="flex items-center justify-between bg-white/50 p-3 rounded-2xl border border-white/50 group-hover:border-[#432818]/10 transition-all">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-[#432818]/5 ${trend.color}`}>
                                    <trend.icon size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-[#432818] text-xs font-cinzel">{trend.name}</p>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <Users size={10} className="text-[#432818]/30" />
                                        <span className="text-[10px] font-bold text-[#432818]/40 uppercase tracking-widest">Şu An Tercih Ediliyor</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block font-black text-lg text-[#432818] leading-none">{trend.count}</span>
                                <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-tighter">Kişi</span>
                            </div>
                        </div>
                    ))}
                </div>

                <p className="text-center text-[9px] text-[#432818]/30 font-bold mt-4 tracking-widest uppercase">
                    Motto'da her an taze, her an popüler.
                </p>
            </div>
        </div>
    );
};

export default LiveTrends;
