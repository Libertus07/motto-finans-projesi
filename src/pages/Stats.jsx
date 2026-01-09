// src/pages/Stats.jsx
import React, { useState, useMemo } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, Wallet,
  Calendar, PieChart as PieIcon, ArrowUpRight, ArrowDownRight,
  Activity, DollarSign
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, BarChart, Bar, Legend, Cell, PieChart, Pie
} from 'recharts';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { formatCurrency } from '../utils/helpers';
import { COLORS } from '../utils/constants';

// --- Sub-Components ---

const StatCard = ({ title, value, subValue, icon, colorClass, trend }) => {
  const Icon = icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 shadow-xl relative overflow-hidden group"
    >
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${colorClass}`}>
        <Icon size={64} />
      </div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-3xl font-black text-white tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-slate-700/50 ${colorClass}`}>
          <Icon size={24} />
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-2">
        {trend && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${trend > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
            {trend > 0 ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
        <p className="text-xs text-slate-500 font-medium">{subValue}</p>
      </div>
    </motion.div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-xl shadow-2xl backdrop-blur-sm">
        <p className="text-slate-400 text-xs font-bold mb-2 uppercase">{label}</p>
        {payload.map((pld, index) => (
          <div key={index} className="flex items-center gap-2 text-sm mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: pld.color }}></div>
            <span className="text-slate-300 font-medium">{pld.name}:</span>
            <span className="text-white font-bold">{formatCurrency(pld.value)} ₺</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// --- Main Component ---

const Stats = ({ transactions = [], products = [] }) => {
  const [dateRange, setDateRange] = useState('30'); // '7', '30', 'all'

  // --- SMART DATA LOGIC ---
  const analysis = useMemo(() => {
    if (!transactions.length) return null;

    const now = new Date();

    // Filter by Date Range
    const cutoffDate = new Date();
    if (dateRange === '7') cutoffDate.setDate(now.getDate() - 7);
    else if (dateRange === '30') cutoffDate.setDate(now.getDate() - 30);
    else cutoffDate.setFullYear(2000); // All time

    const currentPeriodTransactions = transactions.filter(t => new Date(t.date) >= cutoffDate);

    // Previous Period Calculation (for trends)
    const prevCutoffDate = new Date(cutoffDate);
    if (dateRange === '7') prevCutoffDate.setDate(cutoffDate.getDate() - 7);
    else if (dateRange === '30') prevCutoffDate.setDate(cutoffDate.getDate() - 30);

    const prevPeriodTransactions = transactions.filter(t => {
      const d = new Date(t.date);
      return d >= prevCutoffDate && d < cutoffDate;
    });

    // Helper to calc totals
    const calcTotals = (txs) => {
      const income = txs.filter(t => t.type === 'income').reduce((a, b) => a + Number(b.amount), 0);
      const expense = txs.filter(t => t.type === 'expense').reduce((a, b) => a + Number(b.amount), 0);
      const count = txs.filter(t => t.type === 'income').length;
      return { income, expense, profit: income - expense, count };
    };

    const current = calcTotals(currentPeriodTransactions);
    const prev = calcTotals(prevPeriodTransactions);

    // Trends
    const incomeTrend = prev.income ? ((current.income - prev.income) / prev.income) * 100 : 0;
    const expenseTrend = prev.expense ? ((current.expense - prev.expense) / prev.expense) * 100 : 0;
    const profitTrend = prev.profit ? ((current.profit - prev.profit) / Math.abs(prev.profit)) * 100 : 0;

    // Average Basket
    const avgBasket = current.count > 0 ? current.income / current.count : 0;
    const prevAvgBasket = prev.count > 0 ? prev.income / prev.count : 0;
    const basketTrend = prevAvgBasket ? ((avgBasket - prevAvgBasket) / prevAvgBasket) * 100 : 0;

    // Charts: Trend Area
    const daysMap = {};
    currentPeriodTransactions.forEach(t => {
      // Format: MM/DD
      const d = t.date.split('-').slice(1).join('/');
      if (!daysMap[d]) daysMap[d] = { date: d, Gelir: 0, Gider: 0 };
      if (t.type === 'income') daysMap[d].Gelir += Number(t.amount);
      else daysMap[d].Gider += Number(t.amount);
    });
    // Sort by date roughly (month/day string sort is okay for same year, better to use real dates but simple is fine for prototype)
    const trendChartData = Object.values(daysMap).sort((a, b) => a.date.localeCompare(b.date));

    // Charts: Expense Breakdown
    const expenseCats = {};
    currentPeriodTransactions.filter(t => t.type === 'expense').forEach(t => {
      const c = t.category || 'Diğer';
      expenseCats[c] = (expenseCats[c] || 0) + Number(t.amount);
    });
    const expenseChartData = Object.entries(expenseCats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return {
      current,
      trends: { income: incomeTrend, expense: expenseTrend, profit: profitTrend, basket: basketTrend },
      avgBasket,
      trendChartData,
      expenseChartData
    };

  }, [transactions, dateRange]);

  if (!analysis) {
     return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500 animate-in fade-in">
            <div className="bg-slate-800 p-6 rounded-full mb-4 ring-4 ring-slate-800/50">
                <BarChart3 size={48} className="opacity-50 text-indigo-400"/>
            </div>
            <h3 className="text-xl font-bold text-slate-300">Henüz Veri Yok</h3>
            <p className="text-sm">Analizleri görmek için işlem yapmaya başlayın.</p>
        </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-12 animate-in fade-in duration-700">

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-b border-slate-700/50 pb-6">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <Activity className="text-indigo-400" />
            Finansal Raporlar
          </h2>
          <p className="text-slate-400 mt-1 font-medium">İşletmenizin finansal sağlığını detaylı analiz edin.</p>
        </div>

        <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700">
          {[
            { id: '7', label: '7 Gün' },
            { id: '30', label: '30 Gün' },
            { id: 'all', label: 'Tümü' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setDateRange(opt.id)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                dateRange === opt.id
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- KPI CARDS (Symmetrical 4-Grid) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Toplam Ciro"
          value={`${formatCurrency(analysis.current.income)} ₺`}
          subValue="Geçen döneme göre"
          trend={analysis.trends.income}
          icon={TrendingUp}
          colorClass="text-emerald-400"
        />
        <StatCard
          title="Toplam Gider"
          value={`${formatCurrency(analysis.current.expense)} ₺`}
          subValue="Geçen döneme göre"
          trend={analysis.trends.expense}
          icon={TrendingDown}
          colorClass="text-red-400"
        />
        <StatCard
          title="Net Kâr"
          value={`${formatCurrency(analysis.current.profit)} ₺`}
          subValue="Dönem kârlılığı"
          trend={analysis.trends.profit}
          icon={Wallet}
          colorClass="text-indigo-400"
        />
        <StatCard
          title="Ort. Sepet Tutarı"
          value={`${formatCurrency(analysis.avgBasket)} ₺`}
          subValue="İşlem başına gelir"
          trend={analysis.trends.basket}
          icon={DollarSign}
          colorClass="text-amber-400"
        />
      </div>

      {/* --- MAIN CHARTS SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">

        {/* LEFT: Income/Expense Flow (Wide) */}
        <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 shadow-xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <Calendar className="text-blue-400" size={20}/>
              Nakit Akış Grafiği
            </h3>
            <div className="flex gap-4 text-xs font-bold">
               <span className="flex items-center gap-1 text-emerald-400"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Gelir</span>
               <span className="flex items-center gap-1 text-red-400"><div className="w-2 h-2 rounded-full bg-red-500"></div> Gider</span>
            </div>
          </div>

          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analysis.trendChartData}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} dx={-10}/>
                <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="Gelir" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIn)" />
                <Area type="monotone" dataKey="Gider" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorOut)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT: Expense Distribution (Donut) */}
        <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 shadow-xl flex flex-col">
          <h3 className="font-bold text-white text-lg mb-2 flex items-center gap-2">
            <PieIcon className="text-orange-400" size={20}/>
            Gider Dağılımı
          </h3>
          <p className="text-xs text-slate-500 mb-6">Harcamalarınızın kategorilere göre dağılımı.</p>

          <div className="flex-1 w-full min-h-0 relative">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={analysis.expenseChartData}
                        cx="50%" cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {analysis.expenseChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      iconType="circle"
                      wrapperStyle={{ fontSize: '12px', color: '#94a3b8', paddingTop: '20px' }}
                    />
                </PieChart>
            </ResponsiveContainer>

            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-12">
               <div className="text-center">
                  <span className="text-xs text-slate-500 font-bold block">TOPLAM</span>
                  <span className="text-lg font-black text-white">{formatCurrency(analysis.current.expense)}</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- BOTTOM SECTION: TOP PRODUCTS --- */}
      <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 shadow-xl">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <BarChart3 className="text-purple-400" size={20}/>
                En Çok Satan Ürünler
            </h3>
            <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">Detaylı Rapor &rarr;</button>
        </div>

        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={products.sort((a,b) => b.sold - a.sold).slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dx={-10}/>
                    <RechartsTooltip cursor={{fill: '#334155', opacity: 0.2}} content={<CustomTooltip />} />
                    <Bar dataKey="sold" name="Satış Adedi" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={50}>
                        {products.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index < 3 ? '#818cf8' : '#475569'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default Stats;
