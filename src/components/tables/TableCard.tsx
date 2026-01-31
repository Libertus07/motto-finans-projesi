import React from 'react';
import { Coffee, PlusCircle, Sparkles, User, Lock, RefreshCw, Clock, Bell, Receipt, Brush, Star, Cigarette, HelpCircle } from 'lucide-react';
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
    gridLayout: 'normal' | 'compact' | 'comfort';
}

const TableCard: React.FC<TableCardProps> = ({
    table,
    activeMode,
    transferSource,
    isDarkMode,
    isSelected,
    onClick,
    gridLayout
}) => {
    const isSource = transferSource?.id === table.id;
    const theme = getTableTheme(table.status, isDarkMode, activeMode === 'default' ? null : activeMode, isSource);
    const totalElapsedTime = getElapsedString(table.startTime);
    const idleTime = getElapsedString(table.lastOrderTime);

    const isDisabledForTransfer = activeMode === 'transfer' && table.status === 'empty' && !transferSource;

    // Attention Pulse Logic (20+ minutes since last order or active bill request)
    const isIdleLong = table.lastOrderTime && (new Date().getTime() - new Date(table.lastOrderTime).getTime() > 20 * 60 * 1000);
    const hasBillRequest = table.requests?.some(r => r.type === 'bill' && r.status === 'pending');
    const needsAttention = (table.status === 'occupied' || table.status === 'ordered') && (isIdleLong || hasBillRequest);

    // VIP Status
    const isVIP = table.isVIP || table.reservation?.isVIP;

    // Grid-based Sizing Values
    const cardHeight = gridLayout === 'compact' ? 'h-24 md:h-28' : gridLayout === 'comfort' ? 'h-40 md:h-48' : 'h-28 md:h-32';
    const cardPadding = gridLayout === 'compact' ? 'p-1.5 md:p-2.5' : gridLayout === 'comfort' ? 'p-4 md:p-6' : 'p-2.5 md:p-4';
    const nameSize = gridLayout === 'compact' ? 'text-xs md:text-sm' : gridLayout === 'comfort' ? 'text-lg md:text-2xl' : 'text-sm md:text-lg';
    const amountSize = gridLayout === 'compact' ? 'text-sm md:text-lg' : gridLayout === 'comfort' ? 'text-xl md:text-3xl' : 'text-base md:text-2xl';
    const timerSize = gridLayout === 'compact' ? 'text-[8px] md:text-[9px]' : gridLayout === 'comfort' ? 'text-xs md:text-sm' : 'text-[9px] md:text-[11px]';
    const iconSize = gridLayout === 'compact' ? 14 : gridLayout === 'comfort' ? 24 : 18;

    return (
        <button
            onClick={() => onClick(table)}
            data-table-id={table.id}
            className={`${theme.card} group w-full ${cardHeight} flex flex-col ${cardPadding} transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] ${isSelected ? 'ring-2 ring-indigo-500' : ''} ${isDisabledForTransfer ? 'cursor-not-allowed' : 'cursor-pointer'} ${table.status === 'needs_cleaning' ? 'animate-pulse-subtle' : ''} ${needsAttention ? 'ring-2 ring-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-pulse-subtle' : ''}`}
        >
            {/* GLOW EFFECT */}
            <div className={`absolute inset-0 bg-gradient-to-br ${theme.glow} opacity-60 pointer-events-none`}></div>

            {/* CLEANING INDICATOR (Prominent but Symmetrical) */}
            {table.status === 'needs_cleaning' && (
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none p-4">
                    <div className={`flex flex-col items-center justify-center ${gridLayout === 'compact' ? 'translate-y-4' : 'translate-y-4'}`}>
                        <div className={`${gridLayout === 'compact' ? 'w-8 h-8' : 'w-12 h-12'} rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-1 ring-1 ring-white/30 shadow-xl`}>
                            <RefreshCw size={gridLayout === 'compact' ? 16 : 24} className="text-white animate-spin-slow" />
                        </div>
                        <span className={`${gridLayout === 'compact' ? 'text-[7px]' : 'text-[9px]'} font-black text-white uppercase tracking-[0.2em] drop-shadow-md`}>TEMİZLİK</span>
                    </div>
                </div>
            )}

            {/* RESERVED INDICATOR (Symmetrical) */}
            {table.status === 'reserved' && (
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none p-4">
                    <div className={`flex flex-col items-center justify-center ${gridLayout === 'compact' ? 'translate-y-10' : 'translate-y-12'}`}>
                        <span className={`${gridLayout === 'compact' ? 'text-[8px]' : 'text-[10px]'} font-black text-indigo-100 uppercase tracking-[0.2em] drop-shadow-sm`}>REZERVE</span>
                    </div>
                </div>
            )}

            {/* EMPTY INDICATOR */}
            {table.status === 'empty' && (
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none p-4">
                    <div className="flex flex-col items-center justify-center translate-y-4">
                        <PlusCircle size={gridLayout === 'comfort' ? 24 : 32} className={`${isDarkMode ? 'text-white/10' : 'text-slate-400/20'} mb-1.5`} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] ${isDarkMode ? 'text-white/20' : 'text-slate-400/30'}">BOŞ</span>
                    </div>
                </div>
            )}

            {/* SHIMMER FOR SPECIAL STATES */}
            {(table.status === 'occupied' || table.status === 'ordered' || table.status === 'needs_cleaning') && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                    <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full 
                        ${table.status === 'needs_cleaning' ? 'animate-[shimmer_2s_infinite]' : 'animate-[shimmer_3s_infinite]'}`}></div>
                </div>
            )}

            {/* ATTENTION GLOW */}
            {needsAttention && (
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-amber-500/5 to-transparent pointer-events-none animate-pulse"></div>
            )}

            {/* HEADER: NAME & ICONS */}
            {table.requests && table.requests.length > 0 && (
                <div className="absolute -top-1 -right-1 flex flex-col gap-1 z-30">
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
                    {table.requests.some((r: any) => r.type === 'ashtray' && r.status === 'pending') && (
                        <div className="w-7 h-7 rounded-full bg-slate-500 ring-2 ring-white text-white flex items-center justify-center shadow-lg animate-pulse">
                            <Cigarette size={12} />
                        </div>
                    )}
                    {table.requests.some((r: any) => (r.type === 'other' || r.type === 'special') && r.status === 'pending') && (
                        <div className="w-7 h-7 rounded-full bg-blue-500 ring-2 ring-white text-white flex items-center justify-center shadow-lg animate-pulse">
                            <HelpCircle size={12} />
                        </div>
                    )}
                </div>
            )}

            <div className="flex justify-between items-start w-full relative z-10">
                <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                        <span className={`${nameSize} font-black ${theme.textColor} tracking-tight leading-tight`}>{table.name}</span>
                        {isVIP && (
                            <div className="p-0.5 rounded-full bg-amber-500/20 ring-1 ring-amber-500/30">
                                <Star size={10} className="text-amber-400 fill-amber-400 animate-pulse" />
                            </div>
                        )}
                    </div>
                    <span className={`text-[8px] font-bold opacity-50 uppercase tracking-widest ${theme.textColor}`}>{table.zone}</span>
                </div>
                {table.status === 'empty' && (
                    <div className="relative">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
                        <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75"></div>
                    </div>
                )}
                {table.status === 'occupied' && <User size={iconSize} className={`${theme.iconColor} drop-shadow-sm`} />}
                {table.status === 'reserved' && <Lock size={iconSize} className={`${theme.iconColor} drop-shadow-sm`} />}
                {table.status === 'needs_cleaning' && <Brush size={iconSize} className={`${theme.iconColor} drop-shadow-sm animate-pulse`} />}
            </div>

            {/* MIDDLE: TIMES / RESERVATION INFO */}
            <div className="flex-1 flex items-center justify-center relative z-10 w-full my-0.5 md:my-1">
                {table.status === 'occupied' && (
                    <div className={`backdrop-blur-md px-1 md:px-1.5 py-0.5 rounded-lg ring-1 flex items-center gap-1 md:gap-1.5 shadow-sm min-w-0 max-w-full 
                        bg-black/80 ring-white/10`}>
                        {totalElapsedTime && (
                            <div className="flex flex-col items-center leading-none min-w-[20px] md:min-w-[24px]">
                                <span className={`${gridLayout === 'compact' ? 'text-[5px]' : 'text-[6px] md:text-[7px]'} text-slate-400 uppercase font-black mb-0.5 opacity-70`}>Süre</span>
                                <span className={`${timerSize} font-black tabular-nums tracking-tighter text-rose-500`}>{totalElapsedTime}</span>
                            </div>
                        )}
                        <div className="w-px h-3 md:h-4 bg-white/10"></div>
                        <div className="flex flex-col items-center leading-none min-w-[20px] md:min-w-[24px]">
                            <span className={`${gridLayout === 'compact' ? 'text-[5px]' : 'text-[6px] md:text-[7px]'} text-slate-400 uppercase font-black mb-0.5 opacity-70`}>Sipariş</span>
                            <span className={`${timerSize} font-black tabular-nums tracking-tighter text-amber-500`}>{idleTime || '-'}</span>
                        </div>
                    </div>
                )}
                {table.status === 'reserved' && (
                    <div className={`flex flex-col items-center justify-center w-full ${gridLayout === 'compact' ? 'mt-1' : ''}`}>
                        <div className={`${gridLayout === 'compact' ? 'px-1.5 py-0.5' : 'px-3 py-1'} rounded-full ring-1 bg-purple-500/10 ring-purple-500/20 flex items-center gap-1 mb-1`}>
                            <Clock size={gridLayout === 'compact' ? 8 : 12} className="text-purple-400" />
                            <span className={`${gridLayout === 'compact' ? 'text-[8px]' : 'text-xs'} font-black tabular-nums ${isDarkMode ? 'text-purple-200' : 'text-purple-700'}`}>{table.reservation?.time}</span>
                        </div>
                        <div className={`${gridLayout === 'compact' ? 'text-[7px]' : 'text-[10px]'} font-bold truncate max-w-full opacity-70 ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>{table.reservation?.customerName}</div>
                    </div>
                )}
            </div>

            {/* FOOTER: BADGES / AMOUNT */}
            <div className="relative z-10 w-full flex justify-between items-end mt-auto">
                <div className="w-full text-right leading-none group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                    {table.total > 0 && (
                        <>
                            <span className={`${amountSize} font-black tracking-tighter drop-shadow-sm ${theme.amountColor} truncate`}>{formatCurrency(table.total)}</span>
                            <span className={`text-[9px] md:text-xs ml-0.5 font-black opacity-60 ${theme.amountColor}`}>₺</span>
                        </>
                    )}
                </div>
            </div>
        </button>
    );
};

export default TableCard;
