import React from 'react';
import { 
    Wallet, Activity, Clock, Zap, ArrowUpRight, 
    Building2, CreditCard, Landmark, Coins, Banknote, Users,
    Sparkles, TrendingDown, ArrowDownRight, PieChart,
    Receipt, ShoppingBag, Scale, Percent, ShieldAlert, Hourglass,
    BarChart3, Calendar, Trophy, Lock, Store, Crown, ShieldCheck, 
    Package, Boxes, TrendingUp, AlertTriangle, CheckCircle2,
    BrainCircuit, AlertOctagon, Armchair, LayoutGrid, Smartphone, Target
} from 'lucide-react';
import { 
    AreaChart, Area, ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis, Cell, BarChart, Bar, Tooltip, CartesianGrid, XAxis, YAxis
} from 'recharts';
import { formatCurrency } from '../utils/helpers';
import AssetCard from '../components/AssetCard';

const Dashboard = ({ stats, transactions, monthlyGoal, calculateFutureCashflow, tables = [] }) => {
    if (!stats || !transactions) return <div className="p-10 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div></div>;

    // ========================================================================
    // 1. TEMEL VE ZAMAN VERİLERİ
    // ========================================================================
    const safeMonthlyIncome = Number(stats.monthlyIncome) || 0;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const currentMonthPrefix = today.toISOString().slice(0, 7);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const currentDay = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const remainingDays = daysInMonth - currentDay;
    const currentMonthExpenses = transactions.filter(t => t.date.startsWith(currentMonthPrefix) && t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
    const currentNetProfit = safeMonthlyIncome - currentMonthExpenses;
    const profitMargin = safeMonthlyIncome > 0 ? (currentNetProfit / safeMonthlyIncome) * 100 : 0;
    
    let predictedTotalIncome = Number(calculateFutureCashflow);
    if (!predictedTotalIncome || predictedTotalIncome === 0) {
        const dailyAvgIncome = currentDay > 0 ? safeMonthlyIncome / currentDay : 0;
        predictedTotalIncome = safeMonthlyIncome + (dailyAvgIncome * remainingDays);
    }
    const dailyAvgExpense = currentDay > 0 ? currentMonthExpenses / currentDay : 0;
    const predictedTotalExpense = currentMonthExpenses + (dailyAvgExpense * remainingDays);
    const predictedNetProfit = predictedTotalIncome - predictedTotalExpense;
    const isProfitPositive = predictedNetProfit > 0;
    const predictionMessage = isProfitPositive ? `Mevcut tempoda ay sonu kârlı kapanacak.` : `Dikkat: Giderler gelirden hızlı artıyor!`;
    const cash = stats.assets?.cash || 0;
    const ziraat = stats.assets?.ziraat || 0;
    const halk = stats.assets?.halk || 0;
    const iban = stats.assets?.iban || 0;
    const investment = stats.investmentStats?.currentValue || 0;
    const totalLiquidity = cash + ziraat + halk + iban;
    const totalNetWorth = totalLiquidity + investment;
    const totalDebt = stats.totalDebt || 0;
    const debtRatio = totalNetWorth > 0 ? (totalDebt / totalNetWorth) * 100 : 0;
    const getAssetRatio = (val) => totalNetWorth > 0 ? (val / totalNetWorth) * 100 : 0;
    const todayTransactions = transactions.filter(t => t.date === todayStr && t.type === 'income');
    const transactionCount = todayTransactions.length;
    const averageBasket = transactionCount > 0 ? stats.dailyIncome / transactionCount : 0;
    const yesterdayIncome = transactions.filter(t => t.date === yesterdayStr && t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    let percentChange = 0;
    if (yesterdayIncome > 0) percentChange = ((stats.dailyIncome - yesterdayIncome) / yesterdayIncome) * 100;
    else if (stats.dailyIncome > 0) percentChange = 100;
    const isDailyGrowing = percentChange >= 0;
    const topProducts = [{ name: "Latte", count: 145, share: 35 }, { name: "San Sebastian", count: 89, share: 25 }, { name: "Çay", count: 320, share: 15 }];
    const topProductLeader = topProducts[0];
    const cashFlowStatus = currentNetProfit >= 0 ? "Pozitif Akış" : "Negatif Akış";
    const cashFlowColor = currentNetProfit >= 0 ? "text-emerald-400" : "text-rose-400";
    const liquidityRatio = totalDebt > 0 ? (totalLiquidity / totalDebt) : 100; 
    let riskScore = 0; let riskText = "";
    if (totalDebt === 0) { riskScore = 100; riskText = "Risk Yok"; } else if (liquidityRatio >= 1.5) { riskScore = 90; riskText = "Çok Güvenli"; } else if (liquidityRatio >= 1) { riskScore = 70; riskText = "Dengeli"; } else { riskScore = 40; riskText = "Likidite Riski"; }
    const estimatedStockValue = totalNetWorth * 0.15; 
    const stockStatus = "Optimum";
    const getGreeting = () => { const h = new Date().getHours(); return h>=5 && h<12 ? "Günaydın" : (h>=12 && h<18 ? "İyi Günler" : "İyi Akşamlar"); };
    const greetingText = getGreeting();
    const safeDivisor = monthlyGoal > 0 ? monthlyGoal : 1; 
    const rawGoalPercent = currentNetProfit > 0 ? (currentNetProfit / safeDivisor) * 100 : 0;
    const goalPercent = Math.min(rawGoalPercent, 100); 
    let goalMessage = "Başlangıç";
    let messageColor = "text-slate-400";
    if (currentNetProfit < 0) { goalMessage = "ZARARDASINIZ ⚠️"; messageColor = "text-red-500 animate-pulse"; } else if (rawGoalPercent >= 100) { goalMessage = "HEDEF AŞILDI! 🚀"; messageColor = "text-emerald-400"; } else if (rawGoalPercent >= 75) { goalMessage = "Harika Gidiyor 🔥"; messageColor = "text-emerald-400"; } else if (rawGoalPercent >= 50) { goalMessage = "Yarılandı 👍"; messageColor = "text-indigo-400"; } else if (rawGoalPercent >= 25) { goalMessage = "İlerliyor 📈"; messageColor = "text-blue-400"; }
    let marginStatus = "Normal"; let marginColor1 = "text-indigo-400";
    if (currentNetProfit < 0) { marginStatus = "Zarar"; marginColor1 = "text-red-400"; } else if (profitMargin > 40) { marginStatus = "Mükemmel"; marginColor1 = "text-emerald-400"; } else if (profitMargin > 20) { marginStatus = "İyi"; marginColor1 = "text-emerald-300"; } else { marginStatus = "Düşük"; marginColor1 = "text-amber-400"; }
    let monthsToPayOff = totalDebt > 0 && currentNetProfit > 0 ? `${Math.ceil(totalDebt / currentNetProfit)} Ay` : "-";
    let businessHealthScore = 50; 
    if (profitMargin > 20) businessHealthScore += 20; if (debtRatio < 40) businessHealthScore += 20; if (isDailyGrowing) businessHealthScore += 10; 
    businessHealthScore = Math.min(businessHealthScore, 100);
    let healthColor = businessHealthScore >= 80 ? "text-emerald-400" : (businessHealthScore < 50 ? "text-red-400" : "text-amber-400");
    let healthText = businessHealthScore >= 80 ? "Mükemmel" : (businessHealthScore < 50 ? "Dikkat" : "İyi");
    let riskStatusMain = "Temiz"; let riskColorMain = "text-emerald-400"; let riskBgMain = "bg-emerald-500/10 border-emerald-500/20";
    if (totalDebt === 0) { riskStatusMain = "Borçsuz"; } else if (debtRatio < 30) { riskStatusMain = "Güvenli"; riskColorMain = "text-emerald-400"; riskBgMain = "bg-emerald-500/10 border-emerald-500/20"; } else if (debtRatio < 60) { riskStatusMain = "Dikkat"; riskColorMain = "text-amber-400"; riskBgMain = "bg-amber-500/10 border-amber-500/20"; } else { riskStatusMain = "Yüksek Risk"; riskColorMain = "text-red-400"; riskBgMain = "bg-red-500/10 border-red-500/20"; }

    // --- DOLULUK HESAPLARI ---
    const totalTables = tables.length || 50; 
    const occupiedTables = tables.filter(t => t.status === 'occupied').length || 0;
    const occupancyRate = totalTables > 0 ? (occupiedTables / totalTables) * 100 : 0;

    let configIndex = 0; 
    if (occupiedTables >= 30) configIndex = 5; else if (occupiedTables >= 20) configIndex = 4; else if (occupiedTables >= 15) configIndex = 3; else if (occupiedTables >= 10) configIndex = 2; else if (occupiedTables >= 5) configIndex = 1; 
    
    const stepConfig = [
        { gid: "gradStep0", from: "#0ea5e9", to: "#22d3ee", text: "text-cyan-400", glow: "shadow-cyan-500/30", label: "Sakin" },
        { gid: "gradStep1", from: "#10b981", to: "#2dd4bf", text: "text-teal-400", glow: "shadow-teal-500/30", label: "Hafif Tempo" },
        { gid: "gradStep2", from: "#84cc16", to: "#22c55e", text: "text-lime-400", glow: "shadow-lime-500/30", label: "Canlı" },
        { gid: "gradStep3", from: "#eab308", to: "#f59e0b", text: "text-yellow-400", glow: "shadow-yellow-500/30", label: "Yoğunlaşıyor" },
        { gid: "gradStep4", from: "#f97316", to: "#ea580c", text: "text-orange-400", glow: "shadow-orange-500/40 animate-pulse", label: "Çok Yoğun" },
        { gid: "gradStep5", from: "#f43f5e", to: "#e11d48", text: "text-rose-500", glow: "shadow-rose-500/50 animate-pulse", label: "Tam Kapasite 🔥" },
    ];
    const config = stepConfig[configIndex];
    const occupancyData = [{ value: occupancyRate, fill: `url(#${config.gid})` }];

    // --- ÖDEME YÖNTEMİ ---
    const cashRatio = 0.30;
    const cardRatio = 0.50;
    const ibanRatio = 0.20;
    const dailyCashAmount = stats.dailyIncome * cashRatio;
    const dailyCardAmount = stats.dailyIncome * cardRatio;
    const dailyIbanAmount = stats.dailyIncome * ibanRatio;
    const cashPercent = cashRatio * 100;
    const cardPercent = cardRatio * 100;
    const ibanPercent = ibanRatio * 100;

    // --- 👇 YENİ: CİRO CONFIG (DURUM ETİKETLİ) 👇 ---
    const getTurnoverConfig = (amount) => {
        if (amount < 10000) return { 
            border: "border-indigo-500", shadow: "shadow-[0_0_20px_rgba(99,102,241,0.5)]", iconColor: "text-indigo-400",
            label: "Sakin Başlangıç", badgeStyle: "bg-indigo-400/10 border-indigo-400/20 text-indigo-400"
        };
        if (amount < 20000) return { 
            border: "border-cyan-500", shadow: "shadow-[0_0_20px_rgba(6,182,212,0.5)]", iconColor: "text-cyan-400",
            label: "Hareketli", badgeStyle: "bg-cyan-400/10 border-cyan-400/20 text-cyan-400"
        };
        if (amount < 30000) return { 
            border: "border-emerald-500", shadow: "shadow-[0_0_20px_rgba(16,185,129,0.5)]", iconColor: "text-emerald-400",
            label: "Kârlı Gün", badgeStyle: "bg-emerald-400/10 border-emerald-400/20 text-emerald-400"
        };
        if (amount < 40000) return { 
            border: "border-amber-500", shadow: "shadow-[0_0_20px_rgba(245,158,11,0.5)]", iconColor: "text-amber-400",
            label: "Çok İyi", badgeStyle: "bg-amber-400/10 border-amber-400/20 text-amber-400"
        };
        if (amount < 50000) return { 
            border: "border-orange-500", shadow: "shadow-[0_0_20px_rgba(249,115,22,0.5)]", iconColor: "text-orange-400",
            label: "Muazzam", badgeStyle: "bg-orange-400/10 border-orange-400/20 text-orange-400"
        };
        return { 
            border: "border-rose-500", shadow: "shadow-[0_0_25px_rgba(244,63,94,0.6)] animate-pulse", iconColor: "text-rose-400",
            label: "Rekor Seviye 🔥", badgeStyle: "bg-rose-500/20 border-rose-500/30 text-rose-400"
        };
    };

    const turnoverConfig = getTurnoverConfig(stats.dailyIncome);

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-20 overflow-x-hidden">
            
            {/* HERO KARTI (AYNI) */}
            <div className="relative overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-8 border border-indigo-500/20 shadow-2xl bg-slate-900">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 z-0"></div>
                <div className="hidden md:block absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[100px] rounded-full z-0"></div>
                <div className="hidden md:block absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600/10 blur-[80px] rounded-full z-0"></div>
                <div className="absolute inset-0 z-0 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-end">
                    <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3 md:space-y-4 order-2 md:order-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[10px] md:text-xs font-bold text-slate-300"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>Sistem Aktif • {new Date().toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</div>
                        <div><p className="text-indigo-400 font-bold uppercase tracking-widest text-xs md:text-sm mb-1">{greetingText} Patron</p><h2 className="text-2xl md:text-3xl font-black text-white leading-tight">Emrullah Göksal</h2><p className="text-slate-400 text-[10px] md:text-xs mt-1 flex items-center gap-1 justify-center md:justify-start"><Calendar size={12}/> {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}</p></div>
                    </div>
                    <div className="flex flex-col items-center justify-center -mb-2 order-1 md:order-2"><div className="relative group cursor-pointer"><div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div><div className="relative p-2 md:p-4 bg-slate-900 rounded-full border border-slate-700 shadow-xl"><Crown size={24} className="md:w-8 md:h-8 text-amber-400 fill-amber-400/20"/></div></div><h1 className="mt-2 md:mt-4 text-lg md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-white tracking-tight">MOTTO COFFEE</h1><p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Collection</p></div>
                    <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-2 md:space-y-4 order-3"><div className="flex items-center gap-3"><div className="text-right hidden md:block"><p className="text-[10px] font-bold text-slate-400 uppercase">İşletme Sağlığı</p><p className={`text-sm font-bold ${healthColor}`}>{healthText} (%{businessHealthScore})</p></div><div className="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center"><svg className="transform -rotate-90 w-10 h-10 md:w-12 md:h-12"><circle cx="50%" cy="50%" r="40%" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-800" /><circle cx="50%" cy="50%" r="40%" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={125} strokeDashoffset={125 - (125 * businessHealthScore) / 100} className={`${healthColor} transition-all duration-1000`} /></svg><ShieldCheck size={14} className={`absolute md:w-4 md:h-4 ${healthColor}`} /></div></div><div><p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">TOPLAM NET VARLIK</p><h2 className="text-2xl md:text-3xl font-black text-amber-400 tracking-tighter drop-shadow-lg flex items-center gap-1">{formatCurrency(totalNetWorth)} <span className="text-lg md:text-xl text-amber-600">₺</span></h2></div></div>
                </div>
            </div>

            {/* ÜST KPI GRID */}
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
                         <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2 mt-4"><Wallet size={14} className={turnoverConfig.iconColor}/> GÜNLÜK CİRO</h4>
                         <h3 className="text-2xl font-black text-white drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">{formatCurrency(stats.dailyIncome)} ₺</h3>
                         
                         {/* ORTA KISIM: Büyüme ve Sepet Tutarı */}
                         <div className="flex items-center gap-2 mt-2">
                             <div className={`px-2 py-0.5 rounded-md border text-[10px] font-bold flex items-center gap-1 ${isDailyGrowing ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                {isDailyGrowing ? <TrendingUp size={10}/> : <TrendingDown size={10}/>}<span>{percentChange > 0 ? '+' : ''}{percentChange.toFixed(0)}%</span>
                             </div>
                             {/* Ortalama Sepet Buraya Taşındı */}
                             <div className="px-2 py-0.5 rounded-md bg-slate-700/30 border border-slate-600/30 text-[10px] font-bold text-indigo-300 flex items-center gap-1">
                                <ShoppingBag size={10}/><span>{formatCurrency(averageBasket)} ₺</span>
                             </div>
                         </div>
                    </div>

                    {/* 3'LÜ FOOTER */}
                    <div className="bg-slate-900/50 border-t border-slate-700/50 p-2 text-[10px] relative z-20">
                        <div className="grid grid-cols-3 gap-1 mb-2 text-center">
                            <div className="flex flex-col items-center"><span className="text-slate-500 font-bold uppercase mb-0.5 flex items-center gap-1"><Banknote size={10} className="text-emerald-500"/> Nakit</span><span className="text-white font-bold">{formatCurrency(dailyCashAmount)}</span></div>
                            <div className="flex flex-col items-center border-l border-r border-slate-700/50"><span className="text-slate-500 font-bold uppercase mb-0.5 flex items-center gap-1"><CreditCard size={10} className="text-orange-500"/> K.Kartı</span><span className="text-white font-bold">{formatCurrency(dailyCardAmount)}</span></div>
                            <div className="flex flex-col items-center"><span className="text-slate-500 font-bold uppercase mb-0.5 flex items-center gap-1"><Smartphone size={10} className="text-purple-500"/> IBAN</span><span className="text-white font-bold">{formatCurrency(dailyIbanAmount)}</span></div>
                        </div>
                        <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden flex"><div className="h-full bg-emerald-500" style={{width: `${cashPercent}%`}}></div><div className="h-full bg-orange-500" style={{width: `${cardPercent}%`}}></div><div className="h-full bg-purple-500" style={{width: `${ibanPercent}%`}}></div></div>
                    </div>
                </div>

                {/* 2. NET KÂR (AYNI) */}
                <div className="group bg-slate-800/80 backdrop-blur-xl p-0 rounded-2xl border border-emerald-500/30 hover:border-emerald-400 transition-all duration-300 relative overflow-hidden flex flex-col shrink-0 w-[85vw] md:w-auto snap-center">
                    <div className="p-5 flex-1 flex flex-col items-center justify-center relative z-10"><div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div><div className="absolute inset-0 bg-emerald-500/5 blur-xl rounded-full"></div><h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Scale size={14} className="text-emerald-400"/> AYLIK NET KÂR</h4><h3 className={`text-2xl font-black drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] ${currentNetProfit >= 0 ? 'text-white' : 'text-red-400'}`}>{formatCurrency(currentNetProfit)} ₺</h3><div className="mt-2 flex items-center gap-2"><div className="px-2 py-0.5 rounded-md border border-slate-700 bg-slate-900/50 text-[10px] font-bold text-slate-300 flex items-center gap-1"><Percent size={10} /> Marj: %{profitMargin.toFixed(0)}</div><span className={`text-[10px] font-bold uppercase ${marginColor1}`}>{marginStatus}</span></div></div>
                    <div className="grid grid-cols-2 border-t border-slate-700/50 bg-slate-900/30"><div className="p-3 text-center border-r border-slate-700/50 hover:bg-white/5 transition-colors group"><div className="flex items-center justify-center gap-1 text-slate-500 mb-0.5 group-hover:text-emerald-400 transition-colors"><ArrowUpRight size={12}/> <span className="text-[9px] font-bold uppercase">Giren</span></div><p className="text-sm font-bold text-emerald-400">+{formatCurrency(safeMonthlyIncome)}</p></div><div className="p-3 text-center hover:bg-white/5 transition-colors group"><div className="flex items-center justify-center gap-1 text-slate-500 mb-0.5 group-hover:text-red-400 transition-colors"><ArrowDownRight size={12}/> <span className="text-[9px] font-bold uppercase">Çıkan</span></div><p className="text-sm font-bold text-red-400">-{formatCurrency(currentMonthExpenses)}</p></div></div>
                </div>
                
                {/* 3. AY SONU TAHMİN (AYNI) */}
                <div className="group bg-gradient-to-br from-purple-900/80 to-indigo-900/80 backdrop-blur-xl p-5 rounded-2xl border border-purple-500/30 hover:border-purple-400 transition-all duration-500 relative overflow-hidden shadow-[0_0_20px_rgba(168,85,247,0.15)] shrink-0 w-[85vw] md:w-auto snap-center">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 blur-[60px] rounded-full group-hover:bg-purple-500/30 transition-all duration-500"></div><div className="flex justify-between items-start relative z-10"><div><p className="text-xs font-bold text-purple-200 uppercase flex items-center gap-1"><Sparkles size={12} className="text-purple-300 animate-pulse"/> Ay Sonu Tahmini Net</p><h3 className={`text-2xl font-black mt-2 drop-shadow-[0_0_10px_rgba(192,132,252,0.5)] ${predictedNetProfit >= 0 ? 'text-white' : 'text-red-300'}`}>{formatCurrency(predictedNetProfit)} ₺</h3></div><div className="relative"><div className="absolute inset-0 bg-purple-500/40 blur-xl rounded-full animate-pulse"></div><div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl text-white shadow-lg relative z-10"><Zap size={22} className="fill-white"/></div></div></div><div className="mt-4 pt-3 border-t border-purple-400/20 flex flex-col gap-2 relative z-10"><div className="flex justify-between items-center text-[11px] font-medium opacity-90"><span className="text-purple-200 flex items-center gap-1"><ArrowUpRight size={10} className="text-emerald-400"/> Tah. Ciro:</span><span className="text-white">{formatCurrency(predictedTotalIncome)} ₺</span></div><div className="flex justify-between items-center text-[11px] font-medium opacity-90"><span className="text-purple-200 flex items-center gap-1"><ArrowDownRight size={10} className="text-red-400"/> Tah. Gider:</span><span className="text-white">-{formatCurrency(predictedTotalExpense)} ₺</span></div><div className="flex items-start gap-2 text-[10px] text-purple-200 leading-tight opacity-70 mt-1"><BrainCircuit size={12} className="text-purple-300 shrink-0 mt-0.5"/> <span>{predictionMessage}</span></div></div>
                </div>

                {/* 4. BORÇ ANALİZ (AYNI) */}
                <div className="group bg-slate-800/80 backdrop-blur-xl p-0 rounded-2xl border border-rose-500/30 hover:border-rose-400 transition-all duration-300 relative overflow-hidden flex flex-col shrink-0 w-[85vw] md:w-auto snap-center">
                    <div className="p-5 flex-1 flex flex-col items-center justify-center relative z-10"><div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-50"></div><div className="absolute inset-0 bg-rose-500/5 blur-xl rounded-full"></div><h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><AlertOctagon size={14} className="text-rose-400"/> TOPLAM BORÇ YÜKÜ</h4><h3 className="text-2xl font-black text-white drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]">{formatCurrency(totalDebt)} ₺</h3><div className={`mt-2 px-2 py-0.5 rounded-md border text-[10px] font-bold flex items-center gap-1 ${riskBgMain} ${riskColorMain}`}><ShieldAlert size={12}/><span>Risk Durumu: {riskStatusMain}</span></div></div><div className="grid grid-cols-2 border-t border-slate-700/50 bg-slate-900/30"><div className="p-3 text-center border-r border-slate-700/50 hover:bg-white/5 transition-colors"><div className="flex items-center justify-center gap-1 text-slate-500 mb-0.5"><Landmark size={12}/> <span className="text-[9px] font-bold uppercase">Varlık/Borç</span></div><p className={`text-sm font-bold ${debtRatio > 50 ? 'text-red-400' : 'text-slate-200'}`}>% {debtRatio.toFixed(0)}</p></div><div className="p-3 text-center hover:bg-white/5 transition-colors"><div className="flex items-center justify-center gap-1 text-slate-500 mb-0.5"><Hourglass size={12}/> <span className="text-[9px] font-bold uppercase">Tah. Bitirme</span></div><p className="text-sm font-bold text-rose-300">{monthsToPayOff}</p></div></div>
                </div>
            </div>

            {/* 4'LÜ POWER GRID (YATAY KAYDIRMALI - AYNI) */}
            <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar w-full">
                
                {/* 1. En Çok Satanlar */}
                <div className="bg-slate-800 p-5 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden flex flex-col justify-between h-[260px] md:h-full group shrink-0 w-[85vw] md:w-auto snap-center">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-[40px] rounded-full group-hover:bg-amber-500/20 transition-all"></div>
                    <div className="flex justify-between items-start z-10"><div><h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">En Çok Satanlar</h4><p className="text-[10px] text-slate-500 font-medium mt-0.5">Haftanın Yıldızları</p></div><div className="p-2 bg-amber-500/20 rounded-xl text-amber-400"><Trophy size={18}/></div></div>
                    <div className="flex-1 mt-4 space-y-3 relative z-10">{topProducts.map((p, i) => (<div key={i} className="flex items-center justify-between"><div className="flex items-center gap-3"><div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-amber-400 text-black' : 'bg-slate-700 text-slate-400'}`}>#{i+1}</div><span className="text-xs text-white font-medium">{p.name}</span></div><div className="text-right"><p className="text-xs font-bold text-slate-200">{p.count}</p><div className="w-16 h-1 bg-slate-700 rounded-full mt-1 overflow-hidden"><div className="h-full bg-amber-400 rounded-full" style={{width: `${p.share}%`}}></div></div></div></div>))}</div>
                    <div className="mt-2 pt-2 border-t border-slate-700/50 text-[10px] text-amber-400/80 font-bold flex items-center gap-1"><CheckCircle2 size={10}/> Lider Ürün Cironun %{topProductLeader.share}'ini oluşturuyor.</div>
                </div>

                {/* 2. Net Nakit */}
                <div className="bg-slate-800 p-5 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden flex flex-col justify-between h-[260px] md:h-full group shrink-0 w-[85vw] md:w-auto snap-center">
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full group-hover:bg-emerald-500/20 transition-all"></div>
                    <div className="flex justify-between items-start z-10"><div><h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Net Nakit Akışı</h4><p className="text-[10px] text-slate-500 font-medium mt-0.5">Gelir - Gider Dengesi</p></div><div className={`p-2 rounded-xl bg-emerald-500/20 text-emerald-400`}><Activity size={18}/></div></div>
                    <div className="flex-1 flex flex-col justify-center items-center relative z-10"><div className="relative"><div className={`absolute inset-0 blur-lg opacity-30 ${currentNetProfit >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></div><h3 className={`text-2xl font-black relative z-10 drop-shadow-md ${cashFlowColor}`}>{formatCurrency(currentNetProfit)} ₺</h3></div><div className={`mt-2 px-2 py-0.5 rounded-md border text-[10px] font-bold ${currentNetProfit >= 0 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>{cashFlowStatus}</div></div>
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-700/50 text-center z-10"><div><p className="text-[9px] text-slate-500 uppercase">Giren</p><p className="text-xs font-bold text-emerald-400">+{formatCurrency(safeMonthlyIncome)}</p></div><div><p className="text-[9px] text-slate-500 uppercase">Çıkan</p><p className="text-xs font-bold text-rose-400">-{formatCurrency(currentMonthExpenses)}</p></div></div>
                </div>

                {/* 3. Risk Motoru */}
                <div className="bg-slate-800 p-5 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden flex flex-col justify-between h-[260px] md:h-full group shrink-0 w-[85vw] md:w-auto snap-center">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full group-hover:bg-purple-500/20 transition-all"></div>
                    <div className="flex justify-between items-start z-10"><div><h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Risk Motoru</h4><p className="text-[10px] text-slate-500 font-medium mt-0.5">Finansal Sağlık Analizi</p></div><div className="p-2 bg-purple-500/20 rounded-xl text-purple-400"><ShieldCheck size={18}/></div></div>
                    <div className="flex-1 flex flex-col justify-center items-center relative z-10"><div className="relative w-24 h-12 overflow-hidden mb-2"><div className="absolute top-0 left-0 w-full h-24 rounded-full border-8 border-slate-700 box-border"></div><div className="absolute top-0 left-0 w-full h-24 rounded-full border-8 border-transparent border-t-purple-500 box-border transition-all duration-1000" style={{transform: `rotate(${riskScore * 1.8 - 180}deg)`}}></div></div><h3 className="text-2xl font-black text-white">{riskScore}/100</h3><p className="text-xs font-bold text-purple-400 uppercase tracking-wider">{riskText}</p></div>
                    <div className="mt-2 pt-2 border-t border-slate-700/50 text-[10px] text-slate-400 text-center z-10">Likidite Oranı: <span className="text-white font-bold">{liquidityRatio.toFixed(2)}x</span> (Güvenli: 1.5x)</div>
                </div>

                {/* 4. Stok Değeri */}
                <div className="bg-slate-800 p-5 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden flex flex-col justify-between h-[260px] md:h-full group shrink-0 w-[85vw] md:w-auto snap-center">
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full group-hover:bg-blue-500/20 transition-all"></div>
                    <div className="flex justify-between items-start z-10"><div><h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Stok Değeri</h4><p className="text-[10px] text-slate-500 font-medium mt-0.5">Tahmini Envanter</p></div><div className="p-2 bg-blue-500/20 rounded-xl text-blue-400"><Package size={18}/></div></div>
                    <div className="flex-1 flex flex-col justify-center relative z-10 mt-2"><div className="flex items-end gap-2 mb-1"><h3 className="text-2xl font-black text-white">{formatCurrency(estimatedStockValue)}</h3><span className="text-sm text-blue-400 font-bold mb-1">₺</span></div><div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full w-[65%]"></div></div><div className="flex justify-between text-[10px] text-slate-400 mt-1"><span>Kullanım</span><span className="text-white font-bold">%65</span></div></div>
                    <div className="mt-auto pt-2 border-t border-slate-700/50 z-10"><div className="flex items-center justify-between"><div className="flex items-center gap-1.5"><Boxes size={12} className="text-blue-400"/><span className="text-[10px] font-bold text-slate-300">Durum:</span></div><span className="text-[10px] font-bold bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded border border-blue-500/20">{stockStatus}</span></div></div>
                </div>
            </div>

            {/* CÜZDAN / VARLIKLAR ALANI (YATAY KAYDIRMALI) */}
            <div className="mt-8">
                <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2 tracking-tight"><Building2 className="text-indigo-400"/> Varlık Yönetimi & Hesaplar</h3>
                <div className="flex lg:grid lg:grid-cols-5 gap-4 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar w-full">
                    <AssetCard title="Kasa (Nakit)" amount={cash} icon={Banknote} colorClass="text-emerald-400" bgClass="bg-gradient-to-br from-emerald-900/40 to-slate-800 border-emerald-500/20 hover:border-emerald-500/50 shrink-0 w-[85vw] lg:w-auto snap-center" ratio={getAssetRatio(cash)}/>
                    <AssetCard title="Ziraat Bankası" amount={ziraat} icon={Landmark} colorClass="text-red-500" bgClass="bg-gradient-to-br from-red-900/40 to-slate-800 border-red-500/20 hover:border-red-500/50 shrink-0 w-[85vw] lg:w-auto snap-center" ratio={getAssetRatio(ziraat)}/>
                    <AssetCard title="Halk Bankası" amount={halk} icon={Building2} colorClass="text-blue-400" bgClass="bg-gradient-to-br from-blue-900/40 to-slate-800 border-blue-500/20 hover:border-blue-500/50 shrink-0 w-[85vw] lg:w-auto snap-center" ratio={getAssetRatio(halk)}/>
                    <AssetCard title="Diğer Hesaplar" amount={iban} icon={CreditCard} colorClass="text-purple-400" bgClass="bg-gradient-to-br from-purple-900/40 to-slate-800 border-purple-500/20 hover:border-purple-500/50 shrink-0 w-[85vw] lg:w-auto snap-center" ratio={getAssetRatio(iban)}/>
                    <AssetCard title="Altın / Döviz" amount={investment} icon={Coins} colorClass="text-amber-400" bgClass="bg-gradient-to-br from-amber-900/40 to-slate-800 border-amber-500/20 hover:border-amber-500/50 shrink-0 w-[85vw] lg:w-auto snap-center" ratio={getAssetRatio(investment)} subLabel="Portföy Payı"/>
                </div>
            </div>

            {/* DOLULUK GÖSTERGESİ (AYNI) */}
            <div className={`mt-6 p-6 md:p-8 rounded-[2rem] bg-slate-800/60 backdrop-blur-xl border border-slate-700 relative overflow-hidden group ${config.glow} transition-all duration-500`}>
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                    <div className="flex-1 text-center md:text-left">
                         <div className="flex items-center justify-center md:justify-start gap-2 mb-2"><div className={`p-2 rounded-xl bg-slate-900/50 border border-slate-700/50 ${config.text}`}><LayoutGrid size={20} /></div><h3 className="text-white font-bold text-lg">Anlık Mekan Doluluğu</h3></div>
                         <p className="text-slate-400 text-sm">Canlı masa ve kapasite durumu.</p>
                         <div className={`inline-flex items-center gap-1.5 mt-4 px-3 py-1 rounded-full border border-slate-700/50 ${config.text} font-bold text-xs uppercase tracking-wider transition-all duration-300 bg-slate-900/50`}><Users size={12} /> {config.label}</div>
                    </div>
                    <div className="relative flex items-center justify-center">
                        <div className="w-64 h-32 relative overflow-hidden"><ResponsiveContainer width="100%" height="200%"><RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={20} data={occupancyData} startAngle={180} endAngle={0}><PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} /><RadialBar minAngle={15} background={{ fill: '#1e293b' }} clockWise dataKey="value" cornerRadius={10} fill={`url(#${config.gid})`}></RadialBar><defs><linearGradient id="gradStep0" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#0ea5e9" /><stop offset="100%" stopColor="#22d3ee" /></linearGradient><linearGradient id="gradStep1" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#2dd4bf" /></linearGradient><linearGradient id="gradStep2" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#84cc16" /><stop offset="100%" stopColor="#22c55e" /></linearGradient><linearGradient id="gradStep3" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#eab308" /><stop offset="100%" stopColor="#f59e0b" /></linearGradient><linearGradient id="gradStep4" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#f97316" /><stop offset="100%" stopColor="#ea580c" /></linearGradient><linearGradient id="gradStep5" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#f43f5e" /><stop offset="100%" stopColor="#e11d48" /></linearGradient></defs></RadialBarChart></ResponsiveContainer></div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center mb-4"><span className={`block text-3xl font-black tracking-tighter drop-shadow-lg leading-none ${config.text}`} style={{textShadow: "0 0 20px currentColor"}}>{occupiedTables}/{totalTables}</span><span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dolu Masa</span></div>
                    </div>
                    <div className="flex-1 text-center md:text-right flex flex-col items-center md:items-end justify-center"><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Doluluk Oranı</p><div className={`text-5xl font-black ${config.text} tracking-tighter drop-shadow-xl`}>%{occupancyRate.toFixed(0)}</div></div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;