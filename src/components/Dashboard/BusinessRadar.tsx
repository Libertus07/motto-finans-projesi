import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RadarData {
    subject: string;
    A: number;
    B: number;
    value: string;
    fullMark: number;
}

interface BusinessRadarProps {
    data: RadarData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const currentData = payload[0].payload;
        return (
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-3 rounded-xl shadow-xl z-50">
                <p className="text-xs font-black text-slate-300 uppercase mb-1">{label}</p>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <p className="text-xs text-amber-400 font-bold">Güncel: <span className="text-white">{currentData.value}</span></p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                    <p className="text-xs text-slate-400 font-medium">Geçen Hafta: <span className="text-slate-300">%{Math.round(currentData.B)} Score</span></p>
                </div>
            </div>
        );
    }
    return null;
};

const BusinessRadar: React.FC<BusinessRadarProps> = ({ data }) => {
    const navigate = useNavigate();

    const handleNavigation = (subject: string) => {
        switch (subject) {
            case 'Ciro':
            case 'Kârlılık':
            case 'Sağlık':
                navigate('/pos/stats');
                break;
            case 'Sadakat':
                navigate('/pos/customerDirectory');
                break;
            case 'Stok':
                navigate('/pos/inventory');
                break;
            default:
                break;
        }
    };

    return (
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/50 shadow-2xl relative overflow-hidden flex flex-col h-[380px] group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[60px] rounded-full"></div>

            <div className="flex justify-between items-start mb-2 z-10">
                <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-wider">Business Radar</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Karşılaştırmalı Performans Analizi</p>
                </div>
                <div className="p-2 bg-amber-500/20 rounded-xl border border-amber-500/30 text-amber-500 shadow-lg shadow-amber-500/10">
                    <Target size={18} />
                </div>
            </div>

            <div className="flex-1 w-full relative z-10 -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={({ payload, x, y, textAnchor }) => (
                                <g className="cursor-pointer hover:font-bold" onClick={() => handleNavigation(payload.value)}>
                                    <text
                                        x={x}
                                        y={y}
                                        textAnchor={textAnchor}
                                        fill="#94a3b8"
                                        fontSize={10}
                                        fontWeight={700}
                                        className="hover:fill-amber-400 transition-colors uppercase tracking-widest"
                                    >
                                        {payload.value}
                                    </text>
                                </g>
                            )}
                        />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />

                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#64748b', strokeWidth: 1 }} />

                        <Radar
                            name="Geçen Dönem"
                            dataKey="B"
                            stroke="#64748b"
                            strokeWidth={2}
                            fill="#64748b"
                            fillOpacity={0.1}
                        />
                        <Radar
                            name="Güncel"
                            dataKey="A"
                            stroke="#f59e0b"
                            strokeWidth={3}
                            fill="#f59e0b"
                            fillOpacity={0.4}
                        />
                        <Legend
                            wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', paddingTop: '10px' }}
                            iconSize={8}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default BusinessRadar;
