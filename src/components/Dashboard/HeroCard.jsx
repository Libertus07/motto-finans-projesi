import React from 'react';
import { Crown, Calendar, ShieldCheck, Trophy, Cake } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const HeroCard = ({
    greetingText,
    starOfTheDay,
    birthdaysToday,
    businessHealthScore,
    healthColor,
    healthText,
    totalNetWorth
}) => {
    return (
        <div className="relative overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-8 border border-indigo-500/20 shadow-2xl bg-slate-900">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 z-0"></div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-end">

                {/* SOL KOLON: YENİ DİKEY ROZET YAPISI */}
                <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4 order-2 md:order-1">

                    {/* ✨ ROZET KONTEYNERI (Dikey Dizilim) */}
                    <div className="flex flex-col gap-2 items-center md:items-start w-full">

                        {/* 1. GÜNÜN YILDIZI (En Üstte) */}
                        {starOfTheDay && (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[10px] md:text-xs font-black text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)] animate-in fade-in slide-in-from-left duration-500">
                                <Trophy size={14} className="animate-pulse" />
                                <span className="tracking-tight">GÜNÜN YILDIZI: {starOfTheDay.name} ({starOfTheDay.points} P)</span>
                            </div>
                        )}

                        {/* 2. DOĞUM GÜNÜ KUTLAMALARI */}
                        {birthdaysToday > 0 && (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-[10px] md:text-xs font-black text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.15)] animate-in fade-in slide-in-from-left duration-700">
                                <Cake size={14} className="animate-bounce" />
                                <span className="tracking-tight">BUGÜN {birthdaysToday} ÖZEL KUTLAMA VAR!</span>
                            </div>
                        )}

                        {/* 3. SİSTEM DURUMU (En Altta) */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Sistem Çevrimiçi
                        </div>
                    </div>

                    {/* SELAMLAMA VE TARİH */}
                    <div className="pt-2">
                        <p className="text-indigo-400 font-black uppercase tracking-[0.2em] text-xs md:text-sm mb-1">
                            {greetingText} Patron
                        </p>
                        <p className="text-slate-400 text-[10px] md:text-xs font-medium flex items-center gap-1.5 justify-center md:justify-start">
                            <Calendar size={12} className="text-slate-500"/>
                            {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}
                        </p>
                    </div>
                </div>

                {/* ORTA VE SAĞ KOLONLAR AYNI KALIYOR... */}
                <div className="flex flex-col items-center justify-center -mb-2 order-1 md:order-2">
                    <div className="relative group cursor-pointer">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative p-2 md:p-4 bg-slate-900 rounded-full border border-slate-700 shadow-xl">
                            <Crown size={24} className="md:w-8 md:h-8 text-amber-400 fill-amber-400/20"/>
                        </div>
                    </div>
                    <h1 className="mt-2 md:mt-4 text-lg md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-white tracking-tight">MOTTO COFFEE</h1>
                    <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Collection</p>
                </div>
                <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-2 md:space-y-4 order-3">
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden md:block">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">İşletme Sağlığı</p>
                            <p className={`text-sm font-bold ${healthColor}`}>{healthText} (%{businessHealthScore})</p>
                        </div>
                        <div className="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
                            <svg className="transform -rotate-90 w-10 h-10 md:w-12 md:h-12">
                                <circle cx="50%" cy="50%" r="40%" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-800" />
                                <circle cx="50%" cy="50%" r="40%" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={125} strokeDashoffset={125 - (125 * businessHealthScore) / 100} className={`${healthColor} transition-all duration-1000`} />
                            </svg>
                            <ShieldCheck size={14} className={`absolute md:w-4 md:h-4 ${healthColor}`} />
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">TOPLAM NET VARLIK</p>
                        <h2 className="text-2xl md:text-3xl font-black text-amber-400 tracking-tighter drop-shadow-lg flex items-center gap-1">
                            {formatCurrency(totalNetWorth)}
                            <span className="text-lg md:text-xl text-amber-600">₺</span>
                        </h2>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroCard;