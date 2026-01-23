import React from 'react';
import { LayoutGrid, Users } from 'lucide-react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface OccupancyIndicatorProps {
    config: {
        glow: string;
        text: string;
        label: string;
        gid: string;
    };
    occupancyData: any[];
    totalTables: number;
    occupiedTables: number;
    occupancyRate: number;
}

const OccupancyIndicator: React.FC<OccupancyIndicatorProps> = ({
    config,
    occupancyData,
    totalTables,
    occupiedTables,
    occupancyRate
}) => {
    return (
        <div className={`mt-6 p-6 md:p-8 rounded-[2rem] bg-slate-800/60 backdrop-blur-xl border border-slate-700 relative overflow-hidden group ${config.glow} transition-all duration-500`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                        <div className={`p-2 rounded-xl bg-slate-900/50 border border-slate-700/50 ${config.text}`}>
                            <LayoutGrid size={20} />
                        </div>
                        <h3 className="text-white font-bold text-lg">Anlık Mekan Doluluğu</h3>
                    </div>
                    <p className="text-slate-400 text-sm">Canlı masa ve kapasite durumu.</p>
                    <div className={`inline-flex items-center gap-1.5 mt-4 px-3 py-1 rounded-full border border-slate-700/50 ${config.text} font-bold text-xs uppercase tracking-wider transition-all duration-300 bg-slate-900/50`}>
                        <Users size={12} />
                        {config.label}
                    </div>
                </div>
                <div className="relative flex items-center justify-center">
                    <div className="w-64 h-32 relative">
                        <ResponsiveContainer width="100%" height={128}>
                            <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={20} data={occupancyData} startAngle={180} endAngle={0}>
                                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                {/* @ts-ignore */}
                                <RadialBar minAngle={15} background={{ fill: '#1e293b' }} clockWise dataKey="value" cornerRadius={10} fill={`url(#${config.gid})`}></RadialBar>
                                <defs>
                                    <linearGradient id="gradStep0" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#0ea5e9" />
                                        <stop offset="100%" stopColor="#22d3ee" />
                                    </linearGradient>
                                    <linearGradient id="gradStep1" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#10b981" />
                                        <stop offset="100%" stopColor="#2dd4bf" />
                                    </linearGradient>
                                    <linearGradient id="gradStep2" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#84cc16" />
                                        <stop offset="100%" stopColor="#22c55e" />
                                    </linearGradient>
                                    <linearGradient id="gradStep3" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#eab308" />
                                        <stop offset="100%" stopColor="#f59e0b" />
                                    </linearGradient>
                                    <linearGradient id="gradStep4" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#f97316" />
                                        <stop offset="100%" stopColor="#ea580c" />
                                    </linearGradient>
                                    <linearGradient id="gradStep5" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#f43f5e" />
                                        <stop offset="100%" stopColor="#e11d48" />
                                    </linearGradient>
                                </defs>
                            </RadialBarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center mb-4">
                        <span className={`block text-3xl font-black tracking-tighter drop-shadow-lg leading-none ${config.text}`} style={{ textShadow: "0 0 20px currentColor" }}>
                            {occupiedTables}/{totalTables}
                        </span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dolu Masa</span>
                    </div>
                </div>
                <div className="flex-1 text-center md:text-right flex flex-col items-center md:items-end justify-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Doluluk Oranı</p>
                    <div className={`text-5xl font-black ${config.text} tracking-tighter drop-shadow-xl`}>
                        %{occupancyRate.toFixed(0)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OccupancyIndicator;
