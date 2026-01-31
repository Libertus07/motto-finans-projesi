import React from 'react';
import { Radio } from 'lucide-react';
import { Table } from '../../types';

interface LiveQRCardProps {
    tables: Table[];
    isDarkMode: boolean;
}

const LiveQRCard: React.FC<LiveQRCardProps> = ({ tables, isDarkMode }) => {
    // 5 dakika içinde aktif olan masaları "Canlı" kabul et
    const now = new Date();
    const liveTables = tables.filter(t => {
        if (!t.lastActivity) return false;
        const lastActive = new Date(t.lastActivity);
        const diffMinutes = (now.getTime() - lastActive.getTime()) / 1000 / 60;
        return diffMinutes < 5;
    });

    return (
        <div className={`flex-1 px-4 py-2 rounded-2xl border flex items-center justify-between gap-2 shadow-sm transition-all duration-300 overflow-hidden relative group 
            ${isDarkMode
                ? 'bg-slate-800/40 border-emerald-500/20 shadow-emerald-500/5'
                : 'bg-emerald-50/80 border-emerald-200/60 shadow-emerald-500/5'}
        `}>
            {/* Background Glow */}
            <div className={`absolute top-0 right-0 w-20 h-20 bg-emerald-400/10 blur-[30px] rounded-full pointer-events-none group-hover:bg-emerald-400/20 transition-all`} />

            <div className="flex flex-col justify-center z-10">
                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-widest mb-1 w-fit 
                    ${isDarkMode ? 'bg-slate-900 border-emerald-500/30 text-emerald-400' : 'bg-white border-emerald-300 text-emerald-700 shadow-sm'}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    CANLI QR
                </div>
                <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} tracking-tighter`}>
                        {liveTables.length}
                    </span>
                    <span className={`text-[10px] font-black ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} uppercase tracking-tight`}>
                        Aktif Erişim
                    </span>
                </div>
            </div>

            <div className={`p-2.5 rounded-xl border transition-all duration-500 
                ${isDarkMode
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:scale-110'
                    : 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110'}`}>
                <Radio size={20} className="animate-pulse" />
            </div>
        </div>
    );
};

export default LiveQRCard;
