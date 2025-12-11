// pages/Stats.jsx (GRAFİK SORUNLARI GİDERİLDİ ✅)

import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell, PieChart, Pie } from 'recharts';
import { formatCurrency } from '../utils/helpers';
import { THEME, COLORS } from '../utils/constants';

const Stats = ({ transactions = [], products = [] }) => {
    
    // --- GÜVENLİ VERİ HESAPLAMALARI ---
    const statsData = useMemo(() => {
        if (!transactions || transactions.length === 0) return null;

        const incomes = transactions.filter(t => t.type === 'income');
        const expenses = transactions.filter(t => t.type === 'expense');

        const totalIncome = incomes.reduce((acc, t) => acc + Number(t.amount), 0);
        const totalExpense = expenses.reduce((acc, t) => acc + Number(t.amount), 0);
        const netProfit = totalIncome - totalExpense;
        const margin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

        // Kategori Bazlı Gider Analizi
        const expenseByCategory = expenses.reduce((acc, t) => {
            const cat = t.category || 'Diğer';
            acc[cat] = (acc[cat] || 0) + Number(t.amount);
            return acc;
        }, {});

        const expenseChartData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

        // Son 7 Günlük Trend
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        const trendData = last7Days.map(date => {
            const dayIn = transactions.filter(t => t.date === date && t.type === 'income').reduce((a, b) => a + Number(b.amount), 0);
            const dayOut = transactions.filter(t => t.date === date && t.type === 'expense').reduce((a, b) => a + Number(b.amount), 0);
            return {
                date: date.split('-').slice(1).join('/'), // Sadece Ay/Gün
                Gelir: dayIn,
                Gider: dayOut
            };
        });

        return { totalIncome, totalExpense, netProfit, margin, expenseChartData, trendData };
    }, [transactions]);

    // --- BOŞ DURUM KONTROLÜ ---
    if (!transactions || transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500 animate-in fade-in">
                <div className="bg-slate-800 p-6 rounded-full mb-4">
                    <BarChart3 size={48} className="opacity-50"/>
                </div>
                <h3 className="text-xl font-bold text-slate-300">Henüz Veri Yok</h3>
                <p className="text-sm">Raporları görmek için kasa hareketleri girmeye başlayın.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-10">
            
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2"><BarChart3 className="text-indigo-400"/> Finansal Raporlar</h2>
                <div className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">Son 30 Gün ve Genel Bakış</div>
            </div>

            {/* ÖZET KARTLARI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Toplam Gelir</p>
                            <h3 className="text-3xl font-extrabold text-emerald-400">{formatCurrency(statsData.totalIncome)} ₺</h3>
                        </div>
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400"><TrendingUp size={24}/></div>
                    </div>
                    <div className="w-full bg-slate-700 h-1 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-full"></div></div>
                </div>

                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Toplam Gider</p>
                            <h3 className="text-3xl font-extrabold text-red-400">{formatCurrency(statsData.totalExpense)} ₺</h3>
                        </div>
                        <div className="p-3 bg-red-500/10 rounded-xl text-red-400"><TrendingDown size={24}/></div>
                    </div>
                    <div className="w-full bg-slate-700 h-1 rounded-full overflow-hidden"><div className="h-full bg-red-500" style={{ width: `${Math.min((statsData.totalExpense / statsData.totalIncome) * 100, 100)}%` }}></div></div>
                </div>

                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Net Kâr</p>
                            <h3 className={`text-3xl font-extrabold ${statsData.netProfit >= 0 ? 'text-indigo-400' : 'text-orange-400'}`}>{formatCurrency(statsData.netProfit)} ₺</h3>
                        </div>
                        <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400"><Wallet size={24}/></div>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1">Kâr Marjı: <span className="text-white font-bold">%{statsData.margin.toFixed(1)}</span></p>
                </div>
            </div>

            {/* GRAFİKLER */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. GELİR GİDER TRENDİ */}
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Calendar size={18} className="text-blue-400"/> 7 Günlük Nakit Akışı</h3>
                    {/* 👇 Yükseklik hatasını çözen h-80 sınıfı */}
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={statsData.trendData}>
                                <defs>
                                    <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                                    <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
                                <Tooltip contentStyle={{backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color:'#fff'}} />
                                <Legend />
                                <Area type="monotone" dataKey="Gelir" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIn)" />
                                <Area type="monotone" dataKey="Gider" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorOut)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. GİDER DAĞILIMI PASTA GRAFİĞİ */}
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><ArrowDownRight size={18} className="text-red-400"/> Gider Dağılımı</h3>
                    {/* 👇 Yükseklik hatasını çözen h-80 sınıfı */}
                    <div className="h-80 w-full text-xs">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={statsData.expenseChartData} 
                                    cx="50%" cy="50%" 
                                    innerRadius={60} 
                                    outerRadius={100} 
                                    paddingAngle={5} 
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {statsData.expenseChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatCurrency(value) + ' ₺'} contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px'}} />
                                <Legend layout="vertical" verticalAlign="middle" align="right" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. EN ÇOK SATAN ÜRÜNLER (Eğer products prop'u doluysa) */}
                {products && products.length > 0 && (
                    <div className="lg:col-span-2 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><ArrowUpRight size={18} className="text-emerald-400"/> En Çok Satan Ürünler</h3>
                        {/* 👇 Yükseklik hatasını çözen h-72 sınıfı */}
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={products.sort((a,b) => b.sold - a.sold).slice(0, 10)}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{fill: '#334155', opacity: 0.4}} contentStyle={{backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px'}} />
                                    <Bar dataKey="sold" name="Satış Adedi" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Stats;