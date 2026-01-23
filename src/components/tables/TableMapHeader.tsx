import React from 'react';
import { LayoutGrid, Sun, Moon, ArrowRightLeft, Brush, CalendarClock, Home, Cloud, ArrowUp } from 'lucide-react';
// @ts-ignore
import OccupancyChart from './OccupancyChart';
import { Table } from '../../types';

interface TableMapHeaderProps {
    isDarkMode: boolean;
    toggleTheme: () => void;
    activeMode: 'default' | 'transfer' | 'clean' | 'reserve';
    setActiveMode: (mode: 'default' | 'transfer' | 'clean' | 'reserve') => void;
    setTransferSource: (table: Table | null) => void;
    transferSource: Table | null;
    occupiedTables: number;
    totalTables: number;
    activeZone: string;
    setActiveZone: (zone: string) => void;
    zones: string[];
}

const TableMapHeader: React.FC<TableMapHeaderProps> = ({
    isDarkMode,
    toggleTheme,
    activeMode,
    setActiveMode,
    setTransferSource,
    transferSource,
    occupiedTables,
    totalTables,
    activeZone,
    setActiveZone,
    zones
}) => {

    const getZoneIcon = (zoneName: string) => {
        if (zoneName.includes('Bahçe')) return <Sun size={16} />;
        if (zoneName.includes('Teras')) return <Cloud size={16} />;
        if (zoneName.includes('Üst')) return <ArrowUp size={16} />;
        return <Home size={16} />;
    };

    return (
        <div className="flex flex-col gap-4 mb-6">
            {/* 1. Header & Theme Switch */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${isDarkMode ? 'bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/30' : 'bg-white text-indigo-600 shadow-indigo-100'}`}><LayoutGrid size={24} /></div>
                    <div><h2 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Masalar</h2><p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Anlık Salon Durumu</p></div>
                </div>
                <button onClick={toggleTheme} className={`p-3 rounded-xl border transition-all active:scale-95 ${isDarkMode ? 'bg-slate-800 border-white/5 text-yellow-400' : 'bg-white border-slate-200 text-slate-600'}`}>{isDarkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
            </div>

            {/* 2. Controls & Chart */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="flex gap-2">
                    <button onClick={() => { setActiveMode(activeMode === 'transfer' ? 'default' : 'transfer'); setTransferSource(null); }} className={`flex-1 md:flex-none p-3 rounded-xl border transition-all active:scale-95 flex justify-center items-center ${activeMode === 'transfer' ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30 animate-pulse' : (isDarkMode ? 'bg-slate-800 border-white/5 text-blue-400' : 'bg-white border-slate-200 text-blue-600')}`}><ArrowRightLeft size={20} /></button>
                    <button onClick={() => { setActiveMode(activeMode === 'clean' ? 'default' : 'clean'); setTransferSource(null); }} className={`flex-1 md:flex-none p-3 rounded-xl border transition-all active:scale-95 flex justify-center items-center ${activeMode === 'clean' ? 'bg-cyan-600 border-cyan-500 text-white shadow-lg shadow-cyan-500/30' : (isDarkMode ? 'bg-slate-800 border-white/5 text-cyan-400' : 'bg-white border-slate-200 text-cyan-600')}`}><Brush size={20} /></button>
                    <button onClick={() => { setActiveMode(activeMode === 'reserve' ? 'default' : 'reserve'); setTransferSource(null); }} className={`flex-1 md:flex-none p-3 rounded-xl border transition-all active:scale-95 flex justify-center items-center ${activeMode === 'reserve' ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/30' : (isDarkMode ? 'bg-slate-800 border-white/5 text-purple-400' : 'bg-white border-slate-200 text-purple-600')}`}><CalendarClock size={20} /></button>
                </div>

                {/* 🔥 Occupancy Chart (Or Active Mode Banner) */}
                <OccupancyChart
                    activeMode={activeMode}
                    setActiveMode={setActiveMode}
                    transferSource={transferSource}
                    setTransferSource={setTransferSource}
                    isDarkMode={isDarkMode}
                    occupiedTables={occupiedTables}
                    totalTables={totalTables}
                />
            </div>

            {/* 3. Zone Filters */}
            <div className="overflow-x-auto custom-scrollbar pb-1">
                <div className="flex gap-2">
                    <button onClick={() => setActiveZone('Tümü')} className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all whitespace-nowrap ${activeZone === 'Tümü' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50')}`}>Tümü</button>
                    {zones.map(zone => (<button key={zone} onClick={() => setActiveZone(zone)} className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 whitespace-nowrap ${activeZone === zone ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50')}`}>{getZoneIcon(zone)} {zone}</button>))}
                </div>
            </div>
        </div>
    );
};

export default TableMapHeader;
