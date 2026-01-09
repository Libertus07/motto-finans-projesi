import React from 'react';
import { Target, Building2, Users, Zap, FileText, Save } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const SettingsFinancial = ({
    monthlyGoal,
    setMonthlyGoal,
    setUnsavedChanges,
    handleUpdateGoal,
    fixedCosts,
    handleUpdateFixedCost
}) => {
    const totalFixedCosts = Object.values(fixedCosts).reduce((a, b) => a + Number(b), 0);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* MONTHLY GOAL */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[32px] p-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-500/10 to-transparent rounded-full blur-3xl" />
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-rose-600 to-red-700 flex items-center justify-center shadow-2xl shadow-rose-600/30">
                                <Target size={32} className="text-white" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white">
                                    Aylık Ciro Hedefi
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    Aylık olarak ulaşmak istediğiniz ciro hedefi
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-2xl">
                            ₺
                        </span>
                        <input
                            type="number"
                            value={monthlyGoal}
                            onChange={(e) => {
                                setMonthlyGoal(e.target.value);
                                setUnsavedChanges(true);
                            }}
                            onBlur={(e) => handleUpdateGoal(e.target.value)}
                            className="w-full bg-white/5 border-2 border-white/10 rounded-[24px] p-6 pl-16 text-white text-3xl font-black outline-none focus:border-rose-500 focus:bg-white/10 transition-all"
                        />
                        <button
                            onClick={() => handleUpdateGoal(monthlyGoal)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-rose-600 hover:bg-rose-500 rounded-2xl transition-all"
                        >
                            <Save size={20} className="text-white" />
                        </button>
                    </div>
                </div>
            </div>

            {/* FIXED COSTS */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[32px] p-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl" />
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-blue-600 to-cyan-700 flex items-center justify-center shadow-2xl shadow-blue-600/30">
                                <Building2 size={32} className="text-white" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white">
                                    Sabit Giderler
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    Aylık düzenli ödemeleriniz
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-400 font-bold uppercase">
                                Toplam
                            </p>
                            <p className="text-3xl font-black text-white mt-1">
                                {formatCurrency(totalFixedCosts)} ₺
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        {Object.entries({
                            rent: { label: 'Kira', icon: Building2, color: 'blue' },
                            staff: { label: 'Maaş', icon: Users, color: 'emerald' },
                            bills: { label: 'Faturalar', icon: Zap, color: 'amber' },
                            other: { label: 'Diğer', icon: FileText, color: 'slate' }
                        }).map(([key, config]) => {
                            const Icon = config.icon;
                            return (
                                <div
                                    key={key}
                                    className="group bg-white/5 border border-white/10 hover:border-white/20 rounded-[24px] p-5 transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-2xl bg-${config.color}-500/10 flex items-center justify-center text-${config.color}-400`}>
                                                <Icon size={24} />
                                            </div>
                                            <span className="text-sm font-bold text-white">
                                                {config.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={fixedCosts[key]}
                                                onChange={(e) => {
                                                    handleUpdateFixedCost(key, e.target.value);
                                                }}
                                                className="bg-transparent text-right text-white font-black outline-none w-28 border-b-2 border-transparent focus:border-blue-500 transition-all py-2"
                                            />
                                            <span className="text-slate-400 font-bold">₺</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsFinancial;