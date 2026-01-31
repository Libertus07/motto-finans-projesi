import React from 'react';
import { LayoutGrid, Sun, Moon, ArrowRightLeft, Brush, CalendarClock, Home, Cloud, ArrowUp } from 'lucide-react';
// @ts-ignore
import OccupancyChart from './OccupancyChart';
import LiveQRCard from './LiveQRCard';
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
    tables: Table[];
    gridLayout: 'normal' | 'compact' | 'comfort';
    setGridLayout: (layout: 'normal' | 'compact' | 'comfort') => void;
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
    zones,
    tables,
    gridLayout,
    setGridLayout
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
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${isDarkMode ? 'bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/30' : 'bg-slate-50 text-indigo-600 shadow-indigo-100/50'}`}><LayoutGrid size={24} /></div>
                    <div><h2 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Masalar</h2><p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Anlık Salon Durumu</p></div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            const next: any = gridLayout === 'normal' ? 'compact' : gridLayout === 'compact' ? 'comfort' : 'normal';
                            setGridLayout(next);
                        }}
                        className={`group flex items-center gap-2 px-4 py-3 rounded-xl border transition-all active:scale-95 ${isDarkMode ? 'bg-slate-800 border-white/5 text-indigo-400' : 'bg-slate-50 border-slate-200/60 text-slate-600 hover:bg-white'}`}
                    >
                        <LayoutGrid size={20} className={gridLayout !== 'normal' ? 'animate-pulse' : ''} />
                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">
                            {gridLayout === 'normal' ? 'Standart' : gridLayout === 'compact' ? 'Sıkışık' : 'Geniş'}
                        </span>
                    </button>
                    <button onClick={toggleTheme} className={`p-3 rounded-xl border transition-all active:scale-95 ${isDarkMode ? 'bg-slate-800 border-white/5 text-yellow-400' : 'bg-slate-50 border-slate-200/60 text-slate-600 hover:bg-white transition-colors'}`}>{isDarkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
                </div>
            </div>

            {/* 2. Controls & Chart */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="flex gap-2 md:gap-3">
                    <button
                        onClick={() => { setActiveMode(activeMode === 'transfer' ? 'default' : 'transfer'); setTransferSource(null); }}
                        className={`flex-1 md:flex-none p-3 md:p-4 rounded-xl border transition-all active:scale-95 flex justify-center items-center 
                            ${activeMode === 'transfer'
                                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30 animate-pulse'
                                : (isDarkMode
                                    ? 'bg-slate-800 border-white/5 text-blue-400'
                                    : 'bg-blue-50 border-blue-200/60 text-blue-600 hover:bg-white transition-colors')}`}
                    >
                        <ArrowRightLeft className="size-5 md:size-6" />
                    </button>

                    <button
                        onClick={() => { setActiveMode(activeMode === 'clean' ? 'default' : 'clean'); setTransferSource(null); }}
                        className={`flex-1 md:flex-none p-3 md:p-4 rounded-xl border transition-all active:scale-95 flex justify-center items-center 
                            ${activeMode === 'clean'
                                ? 'bg-cyan-600 border-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                                : (isDarkMode
                                    ? 'bg-slate-800 border-white/5 text-cyan-400'
                                    : 'bg-cyan-50 border-cyan-200/60 text-cyan-600 hover:bg-white transition-colors')}`}
                    >
                        <Brush className="size-5 md:size-6" />
                    </button>

                    <button
                        onClick={() => { setActiveMode(activeMode === 'reserve' ? 'default' : 'reserve'); setTransferSource(null); }}
                        className={`flex-1 md:flex-none p-3 md:p-4 rounded-xl border transition-all active:scale-95 flex justify-center items-center 
                            ${activeMode === 'reserve'
                                ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/30'
                                : (isDarkMode
                                    ? 'bg-slate-800 border-white/5 text-purple-400'
                                    : 'bg-purple-50 border-purple-200/60 text-purple-600 hover:bg-white transition-colors')}`}
                    >
                        <CalendarClock className="size-5 md:size-6" />
                    </button>
                </div>

                <div className="flex-1 flex flex-row gap-2 md:gap-3">
                    {/* 🔥 Occupancy Chart */}
                    <OccupancyChart
                        activeMode={activeMode}
                        setActiveMode={setActiveMode}
                        transferSource={transferSource}
                        setTransferSource={setTransferSource}
                        isDarkMode={isDarkMode}
                        occupiedTables={occupiedTables}
                        totalTables={totalTables}
                    />

                    {/* 🔥 Live QR Access Card */}
                    {activeMode === 'default' && (
                        <LiveQRCard
                            tables={tables}
                            isDarkMode={isDarkMode}
                        />
                    )}
                </div>
            </div>

            {/* 3. Zone Filters */}
            <div className="overflow-x-auto custom-scrollbar pb-1">
                <div className="flex gap-2">
                    <button onClick={() => setActiveZone('Tümü')} className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all whitespace-nowrap ${activeZone === 'Tümü' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white' : 'bg-slate-50 border-slate-200/60 text-slate-600 hover:bg-white hover:border-slate-300')}`}>Tümü</button>
                    {zones.map(zone => (<button key={zone} onClick={() => setActiveZone(zone)} className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 whitespace-nowrap ${activeZone === zone ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white' : 'bg-slate-50 border-slate-200/60 text-slate-600 hover:bg-white hover:border-slate-300')}`}>{getZoneIcon(zone)} {zone}</button>))}
                </div>
            </div>
        </div>
    );
};

export default TableMapHeader;
