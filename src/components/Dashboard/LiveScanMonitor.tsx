import React from 'react';
import { Radio, Users, Clock } from 'lucide-react';
import { Table } from '../../types';

interface LiveScanMonitorProps {
    tables: Table[];
}

const LiveScanMonitor: React.FC<LiveScanMonitorProps> = ({ tables }) => {
    // 5 dakika içinde aktif olan masaları "Canlı" kabul et
    const now = new Date();
    const liveTables = tables.filter(t => {
        if (!t.lastActivity) return false;
        const lastActive = new Date(t.lastActivity);
        const diffMinutes = (now.getTime() - lastActive.getTime()) / 1000 / 60;
        return diffMinutes < 5;
    });

    const sortedLiveTables = [...liveTables].sort((a, b) => {
        return new Date(b.lastActivity || 0).getTime() - new Date(a.lastActivity || 0).getTime();
    });

    return (
        <div className="mt-6 p-6 md:p-8 rounded-[2rem] bg-slate-800/60 backdrop-blur-xl border border-slate-700 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-500">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Radio size={120} className="text-emerald-500" />
            </div>

            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400 animate-pulse">
                    <Radio size={24} />
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg">Canlı QR Erişimi</h3>
                    <p className="text-slate-400 text-xs font-medium">Şu an menüyü inceleyenler</p>
                </div>
                <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-emerald-400 text-xs font-bold">{liveTables.length} Aktif</span>
                </div>
            </div>

            <div className="relative z-10">
                {sortedLiveTables.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {sortedLiveTables.map(table => (
                            <div key={table.id} className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50 flex items-center justify-between group/card hover:border-emerald-500/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 font-bold border border-slate-700">
                                        {table.name}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-white text-xs font-bold">Masa {table.name}</span>
                                        <span className="text-emerald-400 text-[10px] flex items-center gap-1">
                                            <Clock size={10} />
                                            {getTimeAgo(table.lastActivity)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-8 text-center text-slate-500 text-sm bg-slate-900/30 rounded-2xl border border-slate-700/30 border-dashed">
                        Henüz aktif bir görüntüleme yok.
                    </div>
                )}
            </div>
        </div>
    );
};

function getTimeAgo(dateString?: string | null) {
    if (!dateString) return '';
    const diff = (new Date().getTime() - new Date(dateString).getTime()) / 1000;
    if (diff < 60) return 'Az önce';
    return `${Math.floor(diff / 60)} dk önce`;
}

export default LiveScanMonitor;
