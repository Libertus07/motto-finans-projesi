import React from 'react';
import { Table } from '../../types';
import { MapPin, Users } from 'lucide-react';

interface TableMiniMapProps {
    tables: Table[];
}

const TableMiniMap: React.FC<TableMiniMapProps> = ({ tables }) => {
    // Top 20 tables for the mini-map to keep it clean
    const displayTables = tables.slice(0, 20);

    return (
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl p-6 border border-indigo-500/20 shadow-2xl relative overflow-hidden flex flex-col h-full group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full"></div>

            <div className="flex justify-between items-center mb-6 z-10">
                <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-wider">Yerleşim Planı</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Canlı Masa Durumu</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-[9px] font-bold text-slate-400">BOŞ</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                        <span className="text-[9px] font-bold text-slate-400">DOLU</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-4 sm:grid-cols-5 gap-3 z-10">
                {displayTables.map((table) => (
                    <div
                        key={table.id}
                        className={`relative aspect-square rounded-xl border flex flex-col items-center justify-center transition-all duration-500 group/item ${table.status === 'occupied'
                                ? 'bg-rose-500/10 border-rose-500/30 shadow-[inset_0_0_15px_rgba(244,63,94,0.1)]'
                                : 'bg-slate-800/50 border-slate-700/50 hover:border-emerald-500/30'
                            }`}
                    >
                        <span className={`text-[10px] font-black ${table.status === 'occupied' ? 'text-rose-400' : 'text-slate-500'}`}>
                            {table.name.replace('Masa ', '')}
                        </span>
                        {table.status === 'occupied' && (
                            <Users size={10} className="text-rose-500 mt-1 animate-pulse" />
                        )}

                        {/* Hover Detail */}
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-[10px] font-bold text-white whitespace-nowrap opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none z-20">
                            {table.name} - {table.status === 'occupied' ? 'Dolu' : 'Rezerve Edilebilir'}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-center z-10">
                <button className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors">
                    <MapPin size={12} />
                    Tam Kat Planını Görüntüle
                </button>
            </div>
        </div>
    );
};

export default TableMiniMap;
