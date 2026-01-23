import React from 'react';
import { Coffee, PlusCircle, Sparkles, User, Lock, RefreshCw, Clock, Bell, Receipt } from 'lucide-react';
import { getTableTheme } from '../../utils/tableTheme';
import { formatCurrency, getElapsedString } from '../../utils/helpers';
import { Table } from '../../types';

interface TableCardProps {
    table: Table;
    activeMode: 'default' | 'transfer' | 'clean' | 'reserve';
    transferSource: Table | null;
    isDarkMode: boolean;
    isSelected: boolean;
    onClick: (table: Table) => void;
}

const TableCard: React.FC<TableCardProps> = ({
    table,
    activeMode,
    transferSource,
    isDarkMode,
    isSelected,
    onClick
}) => {
    const isSource = transferSource?.id === table.id;
    const theme = getTableTheme(table.status, isDarkMode, activeMode === 'default' ? null : activeMode, isSource);
    const totalElapsedTime = getElapsedString(table.startTime);
    const idleTime = getElapsedString(table.lastOrderTime);

    const isDisabledForTransfer = activeMode === 'transfer' && table.status === 'empty' && !transferSource;

    return (
        <button
            onClick={() => onClick(table)}
            className={`${theme.card} group h-32 md:h-36 flex flex-col p-3 md:p-4 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] ${isSelected ? 'ring-2 ring-indigo-500' : ''} ${isDisabledForTransfer ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
            {/* GLOW EFFECT */}
            <div className={`absolute inset-0 bg-gradient-to-br ${theme.glow} opacity-60 pointer-events-none`}></div>

            {/* SHIMMER FOR OCCUPIED */}
            {(table.status === 'occupied' || table.status === 'ordered') && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_3s_infinite]"></div>
                </div>
            )}

            {/* EMPTY STATE ICONS */}
            {table.status === 'empty' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="flex flex-col items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <Coffee size={32} className={`${theme.ghostIcon} mb-2 opacity-50`} />
                        <span className={`text-[9px] font-bold uppercase tracking-[0.4em] ml-[0.4em] ${theme.ghostText} opacity-40`}>BOŞ</span>
                    </div>
                </div>
            )}

            {/* HEADER: NAME & ICONS */}
            {table.requests && table.requests.length > 0 && (
                <div className="absolute -top-1 -right-1 flex flex-col gap-1 z-20">
                    {table.requests.some((r: any) => r.type === 'waiter' && r.status === 'pending') && (
                        <div className="w-7 h-7 rounded-full bg-red-500 ring-2 ring-white text-white flex items-center justify-center shadow-lg animate-bounce">
                            <Bell size={12} fill="currentColor" />
                        </div>
                    )}
                    {table.requests.some((r: any) => r.type === 'bill' && r.status === 'pending') && (
                        <div className="w-7 h-7 rounded-full bg-emerald-500 ring-2 ring-white text-white flex items-center justify-center shadow-lg animate-pulse">
                            <Receipt size={12} />
                        </div>
                    )}
                </div>
            )}

            <div className="flex justify-between items-start w-full relative z-10">
                <div className="flex flex-col">
                    <span className={`text-sm md:text-lg font-black ${theme.textColor} tracking-tight leading-tight`}>{table.name}</span>
                    <span className={`text-[8px] font-bold opacity-50 uppercase tracking-widest ${theme.textColor}`}>{table.zone}</span>
                </div>
                {table.status === 'empty' && (
                    <div className="relative">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
                        <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75"></div>
                    </div>
                )}
                {table.status === 'occupied' && <User size={18} className={`${theme.iconColor} drop-shadow-sm`} />}
                {table.status === 'reserved' && <Lock size={18} className={`${theme.iconColor} drop-shadow-sm`} />}
            </div>

            {/* MIDDLE: TIMES / RESERVATION INFO */}
            <div className="flex-1 flex items-center justify-center relative z-10 w-full my-2">
                {table.status === 'occupied' && (
                    <div className={`backdrop-blur-md px-2 py-1 rounded-xl ring-1 flex items-center gap-3 shadow-sm min-w-0 max-w-full ${isDarkMode ? 'bg-black/40 ring-white/10' : 'bg-white/40 ring-black/5'}`}>
                        {totalElapsedTime && (
                            <div className="flex flex-col items-center leading-none min-w-[28px]">
                                <span className="text-[7px] text-slate-400 uppercase font-black mb-1 opacity-70">Süre</span>
                                <span className="text-[10px] md:text-[11px] font-black tabular-nums tracking-tighter text-rose-500">{totalElapsedTime}</span>
                            </div>
                        )}
                        <div className="w-px h-5 bg-black/10 dark:bg-white/10"></div>
                        <div className="flex flex-col items-center leading-none min-w-[28px]">
                            <span className="text-[7px] text-slate-400 uppercase font-black mb-1 opacity-70">Sipariş</span>
                            <span className="text-[10px] md:text-[11px] font-black tabular-nums tracking-tighter text-amber-500">{idleTime || '-'}</span>
                        </div>
                    </div>
                )}
                {table.status === 'reserved' && (
                    <div className="flex flex-col items-center justify-center w-full">
                        <div className={`px-3 py-1 rounded-full ring-1 bg-purple-500/10 ring-purple-500/20 flex items-center gap-2 mb-1.5`}>
                            <Clock size={12} className="text-purple-400" />
                            <span className={`text-xs font-black tabular-nums ${isDarkMode ? 'text-purple-200' : 'text-purple-700'}`}>{table.reservation?.time}</span>
                        </div>
                        <div className={`text-[10px] font-bold truncate max-w-full opacity-70 ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>{table.reservation?.customerName}</div>
                    </div>
                )}
            </div>

            {/* FOOTER: BADGES / AMOUNT */}
            <div className="relative z-10 w-full flex justify-between items-end mt-auto">
                {table.status === 'needs_cleaning' && (
                    <div className="w-full flex justify-center">
                        <span className={`${theme.badge} text-[10px] font-black uppercase tracking-widest flex items-center gap-2 px-3 py-1.5 rounded-full shadow-lg`}>
                            <RefreshCw size={10} className="animate-spin" /> TEMİZLENECEK
                        </span>
                    </div>
                )}
                {(table.status === 'occupied' || table.status === 'ordered') && table.total > 0 && (
                    <div className="w-full text-right leading-none group-hover:scale-105 transition-transform duration-500">
                        <span className={`text-sm md:text-2xl font-black tracking-tighter drop-shadow-sm ${theme.amountColor}`}>{formatCurrency(table.total)}</span>
                        <span className={`text-[10px] ml-1 font-black opacity-60 ${theme.amountColor}`}>₺</span>
                    </div>
                )}
            </div>
        </button>
    );
};

export default TableCard;
