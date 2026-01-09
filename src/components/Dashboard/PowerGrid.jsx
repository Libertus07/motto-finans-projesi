import React from 'react';
import {
    Trophy, Award, ShieldCheck, Package,
    Users, CheckCircle2, AlertTriangle, TrendingUp,
    Star, Heart, Users2, BrainCircuit
} from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const PowerGrid = ({
    topProducts,
    topProductLeader,
    totalMembers,
    totalPoints,
    birthdaysToday,
    riskScore,
    riskText,
    liquidityRatio,
    estimatedStockValue,
    criticalStockCount,
    stockStatus
}) => {
    return (
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar w-full">

            {/* 1. En Çok Satanlar */}
            <div className="bg-slate-800 p-5 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden flex flex-col justify-between h-[260px] md:h-full group shrink-0 w-[85vw] md:w-auto snap-center">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-[40px] rounded-full group-hover:bg-amber-500/20 transition-all"></div>
                <div className="flex justify-between items-start z-10">
                    <div>
                        <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">En Çok Satanlar</h4>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">Haftanın Yıldızları</p>
                    </div>
                    <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400">
                        <Trophy size={18}/>
                    </div>
                </div>
                <div className="flex-1 mt-4 space-y-3 relative z-10">
                    {topProducts.map((p, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-amber-400 text-black' : 'bg-slate-700 text-slate-400'}`}>
                                    #{i+1}
                                </div>
                                <span className="text-xs text-white font-medium">{p.name}</span>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-slate-200">{p.count}</p>
                                <div className="w-16 h-1 bg-slate-700 rounded-full mt-1 overflow-hidden">
                                    <div className="h-full bg-amber-400 rounded-full" style={{width: `${p.share}%`}}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-2 pt-2 border-t border-slate-700/50 text-[10px] text-amber-400/80 font-bold flex items-center gap-1">
                    <CheckCircle2 size={10}/>
                    Lider Ürün Cironun %{topProductLeader.share}'ini oluşturuyor.
                </div>
            </div>

            {/* 2. MÜŞTERİ SADAKATİ - YENİ NESİL TASARIM */}
            <div className="bg-slate-800 p-5 rounded-3xl border border-indigo-500/30 shadow-xl relative overflow-hidden flex flex-col justify-between h-[260px] md:h-full group shrink-0 w-[85vw] md:w-auto snap-center transition-all duration-300 hover:border-indigo-500/50">
                {/* Arka Plan Dekorasyonu */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] rounded-full"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 blur-[60px] rounded-full"></div>

                {/* ÜST BÖLÜM: Başlık ve Aktif Rozet */}
                <div className="flex justify-between items-start z-10">
                    <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Müşteri Sadakati</h4>
                        {/* ✨ GÖRÜNÜR ROZET (Sistem Durumu) */}
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/30">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></div>
                            <span className="text-[9px] font-black text-indigo-300 uppercase">M-Coin Aktif</span>
                        </div>
                    </div>
                    <div className="p-2.5 bg-indigo-500/20 rounded-2xl text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
                        <Award size={20} />
                    </div>
                </div>

                {/* ORTA BÖLÜM: Ana Değer ve TL Karşılığı */}
                <div className="flex-1 flex flex-col justify-center items-center relative z-10 py-4">
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Dağıtılan Toplam</p>
                        <h3 className="text-4xl font-black text-white tracking-tighter drop-shadow-lg">
                            {totalPoints.toLocaleString()}
                            <span className="text-lg text-indigo-400 ml-1">P</span>
                        </h3>
                        {/* TL Değeri Şeridi */}
                        <div className="mt-2 inline-block px-4 py-1 rounded-full bg-slate-900/50 border border-slate-700 backdrop-blur-sm">
                            <span className="text-[11px] font-black text-emerald-400 italic">
                                ≈ {formatCurrency(totalPoints / 10)} ₺
                            </span>
                        </div>
                    </div>
                </div>

                {/* ALT BÖLÜM: İstatistik ve Özel Gün Bildirimi */}
                <div className="mt-auto pt-4 border-t border-slate-700/50 z-10 space-y-3">
                    {/* Üye Sayısı */}
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        <div className="flex items-center gap-2">
                            <Users size={14} className="text-indigo-500" />
                            <span>Kayıtlı Üye</span>
                        </div>
                        <span className="text-white text-xs">{totalMembers}</span>
                    </div>

                    {/* ✨ ÖZEL GÜN ROZETİ (Sadece varsa görünür ama tasarımı bozmaz) */}
                    {birthdaysToday > 0 && (
                        <div className="flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-rose-500/20 to-purple-500/20 border border-rose-500/30 animate-in fade-in slide-in-from-bottom-2">
                            <Heart size={12} className="text-rose-400 animate-bounce" />
                            <span className="text-[9px] font-black text-rose-300 uppercase">
                                Bugün {birthdaysToday} Doğum Günü Var!
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Risk Motoru */}
            <div className="bg-slate-800 p-5 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden flex flex-col justify-between h-[260px] md:h-full group shrink-0 w-[85vw] md:w-auto snap-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full group-hover:bg-purple-500/20 transition-all"></div>
                <div className="flex justify-between items-start z-10">
                    <div>
                        <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Risk Motoru</h4>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">Finansal Sağlık Analizi</p>
                    </div>
                    <div className="p-2 bg-purple-500/20 rounded-xl text-purple-400">
                        <ShieldCheck size={18}/>
                    </div>
                </div>
                <div className="flex-1 flex flex-col justify-center items-center relative z-10">
                    <div className="relative w-24 h-12 overflow-hidden mb-2">
                        <div className="absolute top-0 left-0 w-full h-24 rounded-full border-8 border-slate-700 box-border"></div>
                        <div className="absolute top-0 left-0 w-full h-24 rounded-full border-8 border-transparent border-t-purple-500 box-border transition-all duration-1000" style={{transform: `rotate(${riskScore * 1.8 - 180}deg)`}}></div>
                    </div>
                    <h3 className="text-2xl font-black text-white">{riskScore}/100</h3>
                    <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">{riskText}</p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-700/50 text-[10px] text-slate-400 text-center z-10">
                    Likidite Oranı: <span className="text-white font-bold">{liquidityRatio.toFixed(2)}x</span> (Güvenli: 1.5x)
                </div>
            </div>

            {/* 4. Stok Değeri */}
            <div className="bg-slate-800 p-5 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden flex flex-col justify-between h-[260px] md:h-full group shrink-0 w-[85vw] md:w-auto snap-center">
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full group-hover:bg-blue-500/20 transition-all"></div>
                <div className="flex justify-between items-start z-10">
                    <div>
                        <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Stok Değeri</h4>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">Toplam Stok Maliyeti</p>
                    </div>
                    <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400">
                        <Package size={18}/>
                    </div>
                </div>
                <div className="flex-1 flex flex-col justify-center relative z-10 mt-2">
                    <h3 className="text-2xl font-black text-white">{formatCurrency(estimatedStockValue)} ₺</h3>
                    {/* ✨ YENİ ROZET: Kritik Stok Uyarısı */}
                    {criticalStockCount > 0 ? (
                        <div className="mt-3 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center gap-2">
                            <AlertTriangle size={10} className="text-rose-500 animate-bounce"/>
                            <span className="text-[9px] font-black text-rose-400 uppercase tracking-tighter">
                                {criticalStockCount} ÜRÜN KRİTİK SEVİYEDE!
                            </span>
                        </div>
                    ) : (
                        <div className="mt-3 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                            <CheckCircle2 size={10} className="text-emerald-500"/>
                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-tighter">STOKLAR GÜVENDE</span>
                        </div>
                    )}
                </div>
                <div className="mt-auto pt-2 border-t border-slate-700/50 z-10 flex justify-between">
                    <span className="text-[10px] font-bold text-slate-300 uppercase">Durum:</span>
                    <span className="text-[10px] font-bold text-blue-300">{stockStatus}</span>
                </div>
            </div>
        </div>
    );
};

export default PowerGrid;