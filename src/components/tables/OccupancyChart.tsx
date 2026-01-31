import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { ArrowRightLeft, Brush, CalendarClock, X } from 'lucide-react';
import { getDetailedOccupancyConfig } from '../../utils/tableTheme';
import { Table } from '../../types';

interface OccupancyChartProps {
    activeMode: 'default' | 'transfer' | 'clean' | 'reserve';
    setActiveMode: (mode: 'default' | 'transfer' | 'clean' | 'reserve') => void;
    transferSource: Table | null;
    setTransferSource: (table: Table | null) => void;
    isDarkMode: boolean;
    occupiedTables: number;
    totalTables: number;
}

const OccupancyChart: React.FC<OccupancyChartProps> = ({
    activeMode,
    setActiveMode,
    transferSource,
    setTransferSource,
    isDarkMode,
    occupiedTables,
    totalTables
}) => {
    // 🔥 HESAPLAMALAR
    const occupancyRate = totalTables > 0 ? (occupiedTables / totalTables) * 100 : 0;
    const occupancyConfig = getDetailedOccupancyConfig(occupancyRate, isDarkMode);

    // Radial Chart Data
    const chartData = [
        { name: 'Total', value: 100, fill: occupancyConfig.fillBg }, // Track background
        { name: 'Occupied', value: occupancyRate, fill: occupancyConfig.fill } // Value bar
    ];

    return (
        <div className={`flex-1 px-4 py-2 rounded-2xl border flex items-center justify-between gap-2 shadow-sm transition-all duration-300 overflow-hidden relative group 
            ${activeMode !== 'default'
                ? (isDarkMode ? 'bg-slate-800 border-white/5' : 'bg-white border-slate-200')
                : `${occupancyConfig.cardBg} ${occupancyConfig.cardBorder}`
            }
        `}>

            {activeMode !== 'default' ? (
                <div className="flex items-center gap-3 w-full animate-in fade-in slide-in-from-top-2 relative z-10">
                    <div className={`p-1.5 rounded-full text-white ${activeMode === 'transfer' ? 'bg-blue-500' : activeMode === 'clean' ? 'bg-cyan-500' : 'bg-purple-500'}`}>{activeMode === 'transfer' && <ArrowRightLeft size={14} />}{activeMode === 'clean' && <Brush size={14} />}{activeMode === 'reserve' && <CalendarClock size={14} />}</div>
                    <div className="flex flex-col overflow-hidden"><span className={`text-[10px] font-black uppercase tracking-wider truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{activeMode === 'transfer' && (transferSource ? "HEDEF SEÇİN" : "MASA SEÇİN")}{activeMode === 'clean' && "TEMİZLİK"}{activeMode === 'reserve' && "REZERVASYON"}</span><span className={`text-[9px] font-bold truncate ${activeMode === 'transfer' ? 'text-blue-400' : activeMode === 'clean' ? 'text-cyan-400' : 'text-purple-400'}`}>{activeMode === 'transfer' && (transferSource ? `${transferSource.name} > ?` : "Taşınacak masa?")}{activeMode === 'clean' && "Temizlenecek masa?"}{activeMode === 'reserve' && "Hangi masa?"}</span></div>
                    <button onClick={() => { setActiveMode('default'); setTransferSource(null); }} className="ml-auto p-1.5 rounded-full hover:bg-white/10 text-slate-400"><X size={16} /></button>
                </div>
            ) : (
                <div className="flex items-center justify-between w-full h-full relative">
                    {/* Arkaplan Efekti */}
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${occupancyConfig.glow} blur-[40px] opacity-40 rounded-full pointer-events-none`}></div>

                    {/* Sol: Durum Etiketi */}
                    <div className="flex flex-col justify-center z-10">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-widest mb-1 w-fit shadow-sm 
                            ${isDarkMode ? 'bg-slate-900 border-current/30' : 'bg-white border-current/50'} ${occupancyConfig.text} opacity-100`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${occupancyConfig.text.replace('text-', 'bg-')} animate-pulse shadow-sm`} />
                            {occupancyConfig.label}
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'} tracking-tighter`}>{occupiedTables}</span>
                            <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>/ {totalTables} Masa</span>
                        </div>
                    </div>

                    {/* Sağ: Radial Chart */}
                    <div className="w-16 h-16 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart
                                cx="50%" cy="50%"
                                innerRadius="60%" outerRadius="100%"
                                barSize={6}
                                data={chartData}
                                startAngle={90} endAngle={-270}
                            >
                                <defs>
                                    <linearGradient id="gradStep0" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#0ea5e9" /><stop offset="100%" stopColor="#22d3ee" /></linearGradient>
                                    <linearGradient id="gradStep1" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#2dd4bf" /></linearGradient>
                                    <linearGradient id="gradStep2" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#84cc16" /><stop offset="100%" stopColor="#22c55e" /></linearGradient>
                                    <linearGradient id="gradStep3" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#eab308" /><stop offset="100%" stopColor="#f59e0b" /></linearGradient>
                                    <linearGradient id="gradStep4" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#f97316" /><stop offset="100%" stopColor="#ea580c" /></linearGradient>
                                    <linearGradient id="gradStep5" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#f43f5e" /><stop offset="100%" stopColor="#e11d48" /></linearGradient>
                                </defs>
                                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                <RadialBar background={{ fill: occupancyConfig.fillBg }} dataKey="value" cornerRadius={10} />
                            </RadialBarChart>
                        </ResponsiveContainer>
                        {/* Ortadaki Yüzde */}
                        <div className={`absolute inset-0 flex items-center justify-center text-xs font-black ${occupancyConfig.text}`}>
                            %{occupancyRate.toFixed(0)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OccupancyChart;
