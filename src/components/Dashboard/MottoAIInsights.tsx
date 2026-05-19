import React from 'react';
import { Zap, TrendingUp, TrendingDown, Package, ShieldCheck, Award, Info } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

interface Insight {
    icon: string;
    text: string;
    type: 'success' | 'warning' | 'info';
    path?: string;
}

interface MottoAIInsightsProps {
    insights: Insight[];
}

const MottoAIInsights: React.FC<MottoAIInsightsProps> = ({ insights }) => {
    const navigate = useNavigate();

    const getIcon = (iconName: string, type: string) => {
        const props = { size: 20, className: type === 'success' ? 'text-emerald-400' : type === 'warning' ? 'text-amber-400' : 'text-indigo-400' };
        switch (iconName) {
            case 'Zap': return <Zap {...props} />;
            case 'TrendingUp': return <TrendingUp {...props} />;
            case 'TrendingDown': return <TrendingDown {...props} />;
            case 'Package': return <Package {...props} />;
            case 'ShieldCheck': return <ShieldCheck {...props} />;
            case 'Award': return <Award {...props} />;
            default: return <Info {...props} />;
        }
    };

    return (
        <div className="relative overflow-hidden rounded-3xl p-6 bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 shadow-2xl group">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 blur-[60px] rounded-full group-hover:bg-indigo-600/20 transition-all duration-700"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-purple-600/10 blur-[50px] rounded-full group-hover:bg-purple-600/20 transition-all duration-700"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                        <Zap size={20} className="text-indigo-400 fill-indigo-400/20 animate-pulse" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-wider">Motto Intelligence</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Akıllı İşletme Öngörüleri</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {insights.map((insight, index) => (
                        <div
                            key={index}
                            onClick={() => insight.path && navigate(insight.path)}
                            className={`flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${insight.type === 'success' ? 'bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/30' :
                                    insight.type === 'warning' ? 'bg-amber-500/5 border-amber-500/10 hover:border-amber-500/30' :
                                        'bg-indigo-500/5 border-indigo-500/10 hover:border-indigo-500/30'
                                } ${insight.path ? 'cursor-pointer hover:shadow-lg hover:shadow-indigo-500/10 active:scale-95' : ''}`}
                        >
                            <div className="mt-0.5">
                                {getIcon(insight.icon, insight.type)}
                            </div>
                            <div className="flex-1">
                                <p className="text-xs md:text-sm font-medium text-slate-300 leading-relaxed">
                                    {insight.text}
                                </p>
                                {insight.path && (
                                    <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider group-hover:text-indigo-400 transition-colors">
                                        Detayları İncele →
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Badge */}
                <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">AI Engine Active</span>
                    </div>
                    <button className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors">
                        Tüm Analizi Gör →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MottoAIInsights;
