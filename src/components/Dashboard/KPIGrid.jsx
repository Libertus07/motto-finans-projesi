import React from 'react';
import {
    Wallet, Scale, Sparkles, AlertOctagon,
    Receipt, Target, TrendingUp, TrendingDown,
    ShoppingBag, Percent, ArrowUpRight, ArrowDownRight,
    BrainCircuit, Zap, ShieldAlert
} from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const KPIGrid = ({
    stats,
    transactionCount,
    percentChange,
    isDailyGrowing,
    averageBasket,
    currentNetProfit,
    profitMargin,
    safeMonthlyIncome,
    currentMonthExpenses,
    marginStatus,
    marginColor1,
    predictedNetProfit,
    isProfitPositive,
    predictedTotalIncome,
    predictedTotalExpense,
    totalDebt,
    debtRatio,
    monthsToPayOff,
    riskStatusMain,
    riskBgMain,
    riskColorMain,
    turnoverConfig,
    dailyCashAmount,
    dailyCardAmount,
    dailyIbanAmount,
    cashPercent,
    cardPercent,
    ibanPercent
}) => {
    const predictionMessage = isProfitPositive ? `Mevcut tempoda ay sonu kârlı kapanacak.` : `Dikkat: Giderler gelirden hızlı artıyor!`;

    return (
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar w-full">

            {/* 👇 1. GÜNLÜK CİRO (YENİ SİMETRİK YAPI) 👇 */}
            <div className={`group bg-slate-800/80 backdrop-blur-xl p-0 rounded-2xl border ${turnoverConfig.border} ${turnoverConfig.shadow} transition-all duration-700 relative overflow-hidden flex flex-col shrink-0 w-[85vw] md:w-auto snap-center`}>

                {/* ÜST ETİKETLER */}
                <div className="flex justify-between items-center px-4 pt-4 z-30 relative">
                    {/* Sol Üst: İşlem Sayısı (Amber) */}
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-400/10 border border-amber-400/20 backdrop-blur-sm">
                        <Receipt size={10} className="text-amber-400"/>
                        <span className="text-[9px] font-bold text-amber-400">{transactionCount} İşlem</span>
                    </div>
                    {/* Sağ Üst: Ciro Durumu (Dinamik) */}
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md backdrop-blur-sm ${turnoverConfig.badgeStyle}`}>
                        <Target size={10} />
                        <span className="text-[9px] font-bold">{turnoverConfig.label}</span>
                    </div>
                </div>

                <div className="p-5 pt-2 flex-1 flex flex-col items-center justify-center relative z-10">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
                    <div className="absolute inset-0 bg-indigo-500/5 blur-xl rounded-full"></div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2 mt-4">
                        <Wallet size={14} className={turnoverConfig.iconColor}/> GÜNLÜK CİRO
                    </h4>
                    <h3 className="text-2xl font-black text-white drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                        {formatCurrency(stats.dailyIncome)} ₺
                    </h3>

                    {/* ORTA KISIM: Büyüme ve Sepet Tutarı */}
                    <div className="flex items-center gap-2 mt-2">
                        <div className={`px-2 py-0.5 rounded-md border text-[10px] font-bold flex items-center gap-1 ${isDailyGrowing ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                            {isDailyGrowing ? <TrendingUp size={10}/> : <TrendingDown size={10}/>}
                            <span>{percentChange > 0 ? '+' : ''}{percentChange.toFixed(0)}%</span>
                        </div>
                        {/* Ortalama Sepet Buraya Taşındı */}
                        <div className="px-2 py-0.5 rounded-md bg-slate-700/30 border border-slate-600/30 text-[10px] font-bold text-indigo-300 flex items-center gap-1">
                            <ShoppingBag size={10}/>
                            <span>{formatCurrency(averageBasket)} ₺</span>
                        </div>
                    </div>
                </div>

                {/* 3'LÜ FOOTER */}
                <div className="bg-slate-900/50 border-t border-slate-700/50 p-2 text-[10px] relative z-20">
                    <div className="grid grid-cols-3 gap-1 mb-2 text-center">
                        <div className="flex flex-col items-center">
                            <span className="text-slate-500 font-bold uppercase mb-0.5 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Nakit</span>
                            <span className="text-white font-bold">{formatCurrency(dailyCashAmount)}</span>
                        </div>
                        <div className="flex flex-col items-center border-l border-r border-slate-700/50">
                            <span className="text-slate-500 font-bold uppercase mb-0.5 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500"></div> K.Kartı</span>
                            <span className="text-white font-bold">{formatCurrency(dailyCardAmount)}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-slate-500 font-bold uppercase mb-0.5 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500"></div> IBAN</span>
                            <span className="text-white font-bold">{formatCurrency(dailyIbanAmount)}</span>
                        </div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden flex">
                        <div className="h-full bg-emerald-500" style={{width: `${cashPercent}%`}}></div>
                        <div className="h-full bg-orange-500" style={{width: `${cardPercent}%`}}></div>
                        <div className="h-full bg-purple-500" style={{width: `${ibanPercent}%`}}></div>
                    </div>
                </div>
            </div>

            {/* 2. NET KÂR (AYNI) */}
            <div className="group bg-slate-800/80 backdrop-blur-xl p-0 rounded-2xl border border-emerald-500/30 hover:border-emerald-400 transition-all duration-300 relative overflow-hidden flex flex-col shrink-0 w-[85vw] md:w-auto snap-center">
                <div className="p-5 flex-1 flex flex-col items-center justify-center relative z-10">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>
                    <div className="absolute inset-0 bg-emerald-500/5 blur-xl rounded-full"></div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Scale size={14} className="text-emerald-400"/> AYLIK NET KÂR
                    </h4>
                    <h3 className={`text-2xl font-black drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] ${currentNetProfit >= 0 ? 'text-white' : 'text-red-400'}`}>
                        {formatCurrency(currentNetProfit)} ₺
                    </h3>
                    <div className="mt-2 flex items-center gap-2">
                        <div className="px-2 py-0.5 rounded-md border border-slate-700 bg-slate-900/50 text-[10px] font-bold text-slate-300 flex items-center gap-1">
                            <Percent size={10} /> Marj: %{profitMargin.toFixed(0)}
                        </div>
                        <span className={`text-[10px] font-bold uppercase ${marginColor1}`}>{marginStatus}</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 border-t border-slate-700/50 bg-slate-900/30">
                    <div className="p-3 text-center border-r border-slate-700/50 hover:bg-white/5 transition-colors group">
                        <div className="flex items-center justify-center gap-1 text-slate-500 mb-0.5 group-hover:text-emerald-400 transition-colors">
                            <ArrowUpRight size={12}/> <span className="text-[9px] font-bold uppercase">Giren</span>
                        </div>
                        <p className="text-sm font-bold text-emerald-400">+{formatCurrency(safeMonthlyIncome)}</p>
                    </div>
                    <div className="p-3 text-center hover:bg-white/5 transition-colors group">
                        <div className="flex items-center justify-center gap-1 text-slate-500 mb-0.5 group-hover:text-red-400 transition-colors">
                            <ArrowDownRight size={12}/> <span className="text-[9px] font-bold uppercase">Çıkan</span>
                        </div>
                        <p className="text-sm font-bold text-red-400">-{formatCurrency(currentMonthExpenses)}</p>
                    </div>
                </div>
            </div>

            {/* 3. AY SONU TAHMİN (AYNI) */}
            <div className="group bg-gradient-to-br from-purple-900/80 to-indigo-900/80 backdrop-blur-xl p-5 rounded-2xl border border-purple-500/30 hover:border-purple-400 transition-all duration-500 relative overflow-hidden shadow-[0_0_20px_rgba(168,85,247,0.15)] shrink-0 w-[85vw] md:w-auto snap-center">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 blur-[60px] rounded-full group-hover:bg-purple-500/30 transition-all duration-500"></div>
                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <p className="text-xs font-bold text-purple-200 uppercase flex items-center gap-1">
                            <Sparkles size={12} className="text-purple-300 animate-pulse"/> Ay Sonu Tahmini Net
                        </p>
                        <h3 className={`text-2xl font-black mt-2 drop-shadow-[0_0_10px_rgba(192,132,252,0.5)] ${predictedNetProfit >= 0 ? 'text-white' : 'text-red-300'}`}>
                            {formatCurrency(predictedNetProfit)} ₺
                        </h3>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-purple-500/40 blur-xl rounded-full animate-pulse"></div>
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl text-white shadow-lg relative z-10">
                            <Zap size={22} className="fill-white"/>
                        </div>
                    </div>
                </div>
                <div className="mt-4 pt-3 border-t border-purple-400/20 flex flex-col gap-2 relative z-10">
                    <div className="flex justify-between items-center text-[11px] font-medium opacity-90">
                        <span className="text-purple-200 flex items-center gap-1"><ArrowUpRight size={10} className="text-emerald-400"/> Tah. Ciro:</span>
                        <span className="text-white">{formatCurrency(predictedTotalIncome)} ₺</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-medium opacity-90">
                        <span className="text-purple-200 flex items-center gap-1"><ArrowDownRight size={10} className="text-red-400"/> Tah. Gider:</span>
                        <span className="text-white">-{formatCurrency(predictedTotalExpense)} ₺</span>
                    </div>
                    <div className="flex items-start gap-2 text-[10px] text-purple-200 leading-tight opacity-70 mt-1">
                        <BrainCircuit size={12} className="text-purple-300 shrink-0 mt-0.5"/> <span>{predictionMessage}</span>
                    </div>
                </div>
            </div>

            {/* 4. BORÇ ANALİZ (AYNI) */}
            <div className="group bg-slate-800/80 backdrop-blur-xl p-0 rounded-2xl border border-rose-500/30 hover:border-rose-400 transition-all duration-300 relative overflow-hidden flex flex-col shrink-0 w-[85vw] md:w-auto snap-center">
                <div className="p-5 flex-1 flex flex-col items-center justify-center relative z-10">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-50"></div>
                    <div className="absolute inset-0 bg-rose-500/5 blur-xl rounded-full"></div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <AlertOctagon size={14} className="text-rose-400"/> TOPLAM BORÇ YÜKÜ
                    </h4>
                    <h3 className="text-2xl font-black text-white drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]">{formatCurrency(totalDebt)} ₺</h3>
                    <div className={`mt-2 px-2 py-0.5 rounded-md border text-[10px] font-bold flex items-center gap-1 ${riskBgMain} ${riskColorMain}`}>
                        <ShieldAlert size={12}/>
                        <span>Risk Durumu: {riskStatusMain}</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 border-t border-slate-700/50 bg-slate-900/30">
                    <div className="p-3 text-center border-r border-slate-700/50 hover:bg-white/5 transition-colors">
                        <div className="flex items-center justify-center gap-1 text-slate-500 mb-0.5"><div className="w-3 h-3 rounded-full bg-slate-400"></div> <span className="text-[9px] font-bold uppercase">Varlık/Borç</span></div>
                        <p className={`text-sm font-bold ${debtRatio > 50 ? 'text-red-400' : 'text-slate-200'}`}>%{debtRatio.toFixed(0)}</p>
                    </div>
                    <div className="p-3 text-center hover:bg-white/5 transition-colors">
                        <div className="flex items-center justify-center gap-1 text-slate-500 mb-0.5"><div className="w-3 h-3 rounded-full bg-rose-400"></div> <span className="text-[9px] font-bold uppercase">Tah. Bitirme</span></div>
                        <p className="text-sm font-bold text-rose-300">{monthsToPayOff}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KPIGrid;