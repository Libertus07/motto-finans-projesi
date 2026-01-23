import React from 'react';
import { DollarSign, TrendingUp, Building2, Wallet } from 'lucide-react';

interface SettingsFinancialProps {
    monthlyGoal: number | string;
    handleUpdateGoal: (value: string) => void;
    fixedCosts: Record<string, number>;
    handleUpdateFixedCost: (id: string, value: string) => void;
}

const SettingsFinancial: React.FC<SettingsFinancialProps> = ({
    monthlyGoal,
    handleUpdateGoal,
    fixedCosts,
    handleUpdateFixedCost
}) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Ciro Hedefi */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[32px] p-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl" />
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center shadow-2xl shadow-emerald-600/30">
                            <TrendingUp size={32} className="text-white" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white">Finansal Hedefler</h3>
                            <p className="text-xs text-slate-400 mt-1">Aylık ciro ve büyüme hedefleri</p>
                        </div>
                    </div>

                    <div className="bg-white/5 border-2 border-white/10 hover:border-emerald-500/30 rounded-[24px] p-6 transition-all group">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-[20px] bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <DollarSign size={24} />
                            </div>
                            <div>
                                <h4 className="text-base font-black text-white">Aylık Ciro Hedefi</h4>
                                <p className="text-[10px] text-slate-400 font-medium">Bu ay ulaşılması hedeflenen toplam satış</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                value={monthlyGoal}
                                onChange={(e) => handleUpdateGoal(e.target.value)}
                                className="flex-1 bg-white/5 border-2 border-white/10 rounded-2xl px-4 py-3 text-white text-xl font-black outline-none focus:border-emerald-500 transition-all"
                            />
                            <span className="text-sm text-slate-400 font-bold">TL</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sabit Giderler */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[32px] p-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-500/10 to-transparent rounded-full blur-3xl" />
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-rose-600 to-red-700 flex items-center justify-center shadow-2xl shadow-rose-600/30">
                            <Wallet size={32} className="text-white" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white">Sabit Giderler</h3>
                            <p className="text-xs text-slate-400 mt-1">Aylık düzenli ödemeler ve maliyetler</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { id: 'rent', label: 'Kira Gideri', icon: Building2 },
                            { id: 'staff', label: 'Personel Maaşları', icon: Wallet },
                            { id: 'bills', label: 'Faturalar', icon: DollarSign },
                            { id: 'other', label: 'Diğer Giderler', icon: DollarSign }
                        ].map(item => (
                            <div key={item.id} className="bg-white/5 border border-white/10 rounded-[20px] p-4 hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-3 mb-3">
                                    <item.icon size={18} className="text-rose-400" />
                                    <span className="text-sm font-bold text-slate-200">{item.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={fixedCosts[item.id] || 0}
                                        onChange={(e) => handleUpdateFixedCost(item.id, e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-rose-500 transition-all"
                                    />
                                    <span className="text-xs text-slate-500 font-bold">TL</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsFinancial;
