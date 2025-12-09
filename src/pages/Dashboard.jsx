import React from 'react';
import { 
    Wallet, TrendingUp, Activity, AlertOctagon, 
    Target, Clock, Zap, ArrowUpRight, 
    DollarSign, Star, Building2, CreditCard, Landmark, Coins, Banknote, Users 
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    RadialBarChart, RadialBar, PolarAngleAxis 
} from 'recharts';
import { formatCurrency } from '../utils/helpers';

const Dashboard = ({ stats, transactions, monthlyGoal, calculateFutureCashflow, tables = [] }) => {
    // Veri yüklenmediyse koruma (Loading ekranı)
    if (!stats || !transactions) return <div className="p-10 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div></div>;

    // --- HELPER FONKSİYONLAR ---
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) {
            return "Günaydın";
        } else if (hour >= 12 && hour < 18) {
            return "İyi Günler";
        } else {
            return "İyi Akşamlar";
        }
    };
    
    const greetingText = getGreeting();

    // --- HESAPLAMALAR ---
    const totalLiquidity = stats.assets.cash + stats.assets.ziraat + stats.assets.halk + stats.assets.iban;
    const totalNetWorth = totalLiquidity + stats.investmentStats.currentValue;

    // Hedef Yüzdesi
    const safeDivisor = monthlyGoal > 0 ? monthlyGoal : 1; 
    const goalPercent = Math.min((stats.monthlyIncome / safeDivisor) * 100, 100);
    const goalData = [{ name: 'Hedef', value: goalPercent, fill: '#8b5cf6' }];

    // Masa Doluluk
    const totalTables = tables.length || 50; 
    const occupiedTables = tables.filter(t => t.status === 'occupied').length || 0;
    const occupancyRate = (occupiedTables / totalTables) * 100;

    // Grafik Verisi (Son 7 Gün)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayIncome = transactions.filter(t => t.date === dateStr && t.type === 'income').reduce((a,b) => a + Number(b.amount), 0);
        chartData.push({ name: d.toLocaleDateString('tr-TR', { weekday: 'short' }), income: dayIncome });
    }

    const recentSales = transactions.slice(0, 5);

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-10">
            
            {/* --- BAŞLIK (COMMAND CENTER) --- */}
            <div className="flex flex-col md:flex-row justify-between items-end bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 rounded-[2rem] border border-indigo-500/20 shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-indigo-400 mb-1 text-sm font-bold uppercase tracking-widest">
                        <Activity size={14} className="animate-pulse"/> {greetingText} PATRON
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight">
                        Motto <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Yönetim Paneli</span>
                    </h1>
                    <p className="text-slate-400 mt-2 flex items-center gap-2">
                        <Clock size={16}/> {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}
                    </p>
                </div>
                <div className="relative z-10 text-right mt-4 md:mt-0">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">TOPLAM NET VARLIK</p>
                    <h2 className="text-3xl font-black text-emerald-400 tracking-tight">{formatCurrency(totalNetWorth)} <span className="text-lg text-emerald-600">₺</span></h2>
                </div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] -mr-20 -mt-20"></div>
            </div>

            {/* --- 4 KPI KARTLARI --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Ciro */}
                <div className="group bg-slate-800/60 backdrop-blur-xl p-5 rounded-2xl border border-slate-700 hover:border-indigo-500 transition-all duration-300">
                    <div className="flex justify-between items-start"><div><p className="text-xs font-bold text-slate-400 uppercase">Günlük Ciro</p><h3 className="text-2xl font-extrabold text-white mt-1">{formatCurrency(stats.dailyIncome)} ₺</h3></div><div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400"><Wallet size={20}/></div></div>
                    <div className="mt-4 w-full h-1 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 w-[65%] shadow-[0_0_10px_#6366f1]"></div></div>
                </div>
                {/* Net Kâr */}
                <div className="group bg-slate-800/60 backdrop-blur-xl p-5 rounded-2xl border border-slate-700 hover:border-emerald-500 transition-all duration-300">
                    <div className="flex justify-between items-start"><div><p className="text-xs font-bold text-slate-400 uppercase">Aylık Net Kâr</p><h3 className="text-2xl font-extrabold text-white mt-1">{formatCurrency(stats.netProfit)} ₺</h3></div><div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400"><TrendingUp size={20}/></div></div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400"><ArrowUpRight size={12}/> <span>Kârlılık Yüksek</span></div>
                </div>
                {/* Tahmin */}
                <div className="group bg-slate-800/60 backdrop-blur-xl p-5 rounded-2xl border border-slate-700 hover:border-purple-500 transition-all duration-300">
                    <div className="flex justify-between items-start"><div><p className="text-xs font-bold text-slate-400 uppercase">Ay Sonu Tahmini</p><h3 className="text-2xl font-extrabold text-white mt-1">{formatCurrency(calculateFutureCashflow.estimatedNetProfit)} ₺</h3></div><div className="p-3 bg-purple-500/20 rounded-xl text-purple-400"><Zap size={20}/></div></div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-purple-400"><Star size={12}/> <span>AI Öngörüsü</span></div>
                </div>
                {/* Borçlar */}
                <div className="group bg-slate-800/60 backdrop-blur-xl p-5 rounded-2xl border border-slate-700 hover:border-red-500 transition-all duration-300">
                    <div className="flex justify-between items-start"><div><p className="text-xs font-bold text-slate-400 uppercase">Toplam Borç</p><h3 className="text-2xl font-extrabold text-white mt-1">{formatCurrency(stats.totalDebt)} ₺</h3></div><div className="p-3 bg-red-500/20 rounded-xl text-red-400"><AlertOctagon size={20}/></div></div>
                    <div className="mt-4 w-full h-1 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-red-500 w-[100%] shadow-[0_0_10px_#ef4444]"></div></div>
                </div>
            </div>
            
            {/* --- MASA DOLULUK BARI --- */}
            <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700 flex items-center justify-between gap-6">
                <div className="flex items-center gap-4 min-w-fit">
                    <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400"><Users size={20}/></div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Anlık Doluluk</p>
                        <p className="text-white font-bold">{occupiedTables} / {totalTables} Masa</p>
                    </div>
                </div>
                <div className="flex-1">
                    <div className="flex justify-between mb-1 text-xs text-slate-400">
                        <span>Doluluk Oranı</span>
                        <span className="text-amber-400 font-bold">% {occupancyRate.toFixed(0)}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden relative">
                        {/* Çizgili Arka Plan Efekti */}
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_25%,rgba(255,255,255,0.05)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.05)_75%,transparent)] bg-[length:10px_10px]"></div>
                        <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-1000" style={{width: `${occupancyRate}%`}}></div>
                    </div>
                </div>
            </div>

            {/* --- YENİLENMİŞ VARLIK BÖLÜMÜ (HESAP KARTLARI) --- */}
            <div>
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><Building2 className="text-indigo-400"/> Hesaplar ve Varlıklar</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    
                    {/* 1. Nakit Kasa */}
                    <div className="bg-gradient-to-br from-emerald-900/40 to-slate-800 p-5 rounded-2xl border border-emerald-500/20 hover:border-emerald-500/50 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400"><Banknote size={20}/></div>
                            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">NAKİT</span>
                        </div>
                        <p className="text-slate-400 text-xs uppercase mb-1">Kasa Bakiyesi</p>
                        <h4 className="text-xl font-bold text-white">{formatCurrency(stats.assets.cash)} ₺</h4>
                    </div>

                    {/* 2. Ziraat */}
                    <div className="bg-gradient-to-br from-red-900/40 to-slate-800 p-5 rounded-2xl border border-red-500/20 hover:border-red-500/50 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-red-500/20 rounded-lg text-red-400"><Landmark size={20}/></div>
                            <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded">BANKA</span>
                        </div>
                        <p className="text-slate-400 text-xs uppercase mb-1">Ziraat Bankası</p>
                        <h4 className="text-xl font-bold text-white">{formatCurrency(stats.assets.ziraat)} ₺</h4>
                    </div>

                    {/* 3. Halkbank */}
                    <div className="bg-gradient-to-br from-blue-900/40 to-slate-800 p-5 rounded-2xl border border-blue-500/20 hover:border-blue-500/50 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><Building2 size={20}/></div>
                            <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded">BANKA</span>
                        </div>
                        <p className="text-slate-400 text-xs uppercase mb-1">Halk Bankası</p>
                        <h4 className="text-xl font-bold text-white">{formatCurrency(stats.assets.halk)} ₺</h4>
                    </div>

                    {/* 4. Diğer */}
                    <div className="bg-gradient-to-br from-purple-900/40 to-slate-800 p-5 rounded-2xl border border-purple-500/20 hover:border-purple-500/50 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><CreditCard size={20}/></div>
                            <span className="text-xs font-bold text-purple-500 bg-purple-500/10 px-2 py-1 rounded">DİĞER</span>
                        </div>
                        <p className="text-slate-400 text-xs uppercase mb-1">Diğer Hesaplar</p>
                        <h4 className="text-xl font-bold text-white">{formatCurrency(stats.assets.iban)} ₺</h4>
                    </div>

                    {/* 5. Yatırım */}
                    <div className="bg-gradient-to-br from-amber-900/40 to-slate-800 p-5 rounded-2xl border border-amber-500/20 hover:border-amber-500/50 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400"><Coins size={20}/></div>
                            <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded">YATIRIM</span>
                        </div>
                        <p className="text-slate-400 text-xs uppercase mb-1">Altın / Döviz</p>
                        <h4 className="text-xl font-bold text-white">{formatCurrency(stats.investmentStats.currentValue)} ₺</h4>
                    </div>

                </div>
            </div>

            {/* --- GRAFİKLER VE HEDEFLER --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Performans Grafiği (SOL - Geniş) */}
                <div className="lg:col-span-2 bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl h-[400px] flex flex-col">
                    <h3 className="font-bold text-white mb-6 flex items-center gap-2"><Activity className="text-indigo-400"/> Haftalık Ciro Trendi</h3>
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3}/>
                                <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 12}} axisLine={false} tickLine={false} dy={10}/>
                                <YAxis stroke="#94a3b8" tick={{fontSize: 12}} tickFormatter={(val)=>`${val/1000}k`} axisLine={false} tickLine={false}/>
                                <Tooltip contentStyle={{backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px'}} formatter={(val) => formatCurrency(val) + ' ₺'}/>
                                <Area type="monotone" dataKey="income" stroke="#6366f1" strokeWidth={4} fill="url(#colorInc)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Hedef Göstergesi & Son İşlemler (SAĞ) */}
                <div className="flex flex-col gap-6">
                    
                    {/* Hedef */}
                    <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden flex flex-col items-center justify-center h-[200px]">
                        <h4 className="text-sm font-bold text-slate-400 uppercase absolute top-6 left-6">Aylık Hedef</h4>
                        <div className="absolute top-6 right-6 p-2 bg-indigo-500/20 rounded-lg text-indigo-400"><Target size={18}/></div>
                        <div className="w-full h-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart cx="50%" cy="50%" innerRadius="80%" outerRadius="100%" barSize={15} data={goalData} startAngle={180} endAngle={0}>
                                    <RadialBar minAngle={15} background clockWise dataKey="value" cornerRadius={30} fill="#8b5cf6"/>
                                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                </RadialBarChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pt-6">
                                <span className="text-xs text-slate-400 mb-1">PROGRES</span>
                                <span className="text-2xl font-black text-white tracking-tight">{formatCurrency(stats.monthlyIncome)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Son İşlemler */}
                    <div className="flex-1 bg-slate-800 p-5 rounded-3xl border border-slate-700 shadow-xl overflow-hidden flex flex-col h-[180px]">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> Akış</h4>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                            {recentSales.map((t, idx) => (
                                <div key={t.id || idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 border border-slate-700/50 hover:bg-slate-700/50 transition-colors">
                                    <span className="text-xs text-white truncate w-24">{t.desc}</span>
                                    <span className={`text-xs font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;