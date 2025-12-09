import React, { useState } from 'react';
import { BarChart3, FileText, TrendingUp, PieChart as PieIcon, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency, formatDate } from '../utils/helpers';
import { COLORS } from '../utils/constants';
import { auth } from '../services/firebase'; // Auth'u kullanmak için import
import useFilteredTransactions from '../hooks/useFilteredTransactions'; // YENİ HOOK

// Artık sadece tüm işlemleri değil, sadece ürünleri props olarak alıyoruz
const Stats = ({ transactions: allTransactions, products }) => { // allTransactions'ı sadece Excel için tutuyoruz
    const [reportFilter, setReportFilter] = useState('month');
    const user = auth.currentUser; // Kullanıcıyı Auth'tan alıyoruz

    // 👇 YENİ: Filtrelenmiş veriyi hook'tan çekiyoruz. Yerel filtreleme kaldırıldı.
    const { filteredTransactions, loading } = useFilteredTransactions(user, reportFilter);

    // Excel İndirme (Tüm veriyi kullanmak daha uygun)
    const handleExportExcel = () => {
        // Excel için tüm işlemleri kullanabiliriz (Veya sadece filtrelenmişi)
        const dataToExport = filteredTransactions.length > 0 ? filteredTransactions : allTransactions;

        if (dataToExport.length === 0) return alert("İndirilecek veri yok.");
        
        const headers = ["Tarih", "İşlem Türü", "Kategori", "Ödeme Yöntemi", "Tutar", "Açıklama"];
        const rows = dataToExport.map(t => [t.date, t.type === 'income' ? 'GELİR' : 'GİDER', t.category || 'Genel', t.subMethod || t.method, t.amount, `"${t.desc}"`]);
        const csvContent = [headers.join(";"), ...rows.map(row => row.join(";"))].join("\n");
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Rapor_${reportFilter}_${new Date().toISOString().slice(0,10)}.csv`;
        link.click();
    };

    // --- GRAFİK VERİLERİ (Artık Filtreli Veri Kullanılıyor) ---
    const groupedData = {};
    filteredTransactions.forEach(t => {
       if(!groupedData[t.date]) groupedData[t.date] = { date: t.date, income: 0, expense: 0 };
       if(t.type === 'income') groupedData[t.date].income += Number(t.amount);
       else groupedData[t.date].expense += Number(t.amount);
    });
    const chartData = Object.values(groupedData).sort((a,b) => new Date(a.date) - new Date(b.date));

    const pieData = Object.values(filteredTransactions.filter(t => t.type === 'expense' && t.category).reduce((acc, t) => {
        if(!acc[t.category]) acc[t.category] = { name: t.category, value: 0 };
        acc[t.category].value += Number(t.amount);
        return acc;
    }, {}));

    const reportStats = {
        income: filteredTransactions.filter(t => t.type === 'income').reduce((a, b) => a + Number(b.amount), 0),
        expense: filteredTransactions.filter(t => t.type === 'expense').reduce((a, b) => a + Number(b.amount), 0),
    };
    reportStats.net = reportStats.income - reportStats.expense;
    reportStats.margin = reportStats.income > 0 ? ((reportStats.net / reportStats.income) * 100).toFixed(1) : 0;

    // Yükleniyor ekranı
    if (loading) {
        return <div className="min-h-[500px] bg-slate-900 rounded-2xl flex items-center justify-center text-indigo-400"><Loader2 className="animate-spin" size={32}/> <span className="ml-2">Veriler Yükleniyor...</span></div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
             <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700">
                <div className="flex items-center gap-4"><div className="bg-indigo-600 p-2 rounded-lg text-white"><BarChart3 size={24}/></div><div><h2 className="text-xl font-bold text-white">Finansal Raporlar</h2></div></div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="flex bg-slate-900 p-1 rounded-lg">
                        {['week', 'month', 'year'].map(f => <button key={f} onClick={() => setReportFilter(f)} className={`px-3 py-2 rounded-md text-xs font-bold capitalize transition-all ${reportFilter === f ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}>{f === 'week' ? 'Hafta' : f === 'month' ? 'Ay' : 'Yıl'}</button>)}
                    </div>
                    <button onClick={handleExportExcel} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg"><FileText size={16}/> Excel</button>
                </div>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700"><p className="text-xs text-slate-500 font-bold uppercase">Ciro</p><h3 className="text-xl font-bold text-white mt-1">{formatCurrency(reportStats.income)} ₺</h3></div>
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700"><p className="text-xs text-slate-500 font-bold uppercase">Gider</p><h3 className="text-xl font-bold text-red-400 mt-1">{formatCurrency(reportStats.expense)} ₺</h3></div>
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700"><p className="text-xs text-slate-500 font-bold uppercase">Net Kâr</p><h3 className={`text-xl font-bold mt-1 ${reportStats.net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(reportStats.net)} ₺</h3></div>
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700"><p className="text-xs text-slate-500 font-bold uppercase">Marj</p><h3 className="text-xl font-bold text-yellow-400 mt-1">%{reportStats.margin}</h3></div>
             </div>

             <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 h-80 shadow-xl">
                <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2"><TrendingUp size={16}/> Gelir / Gider Trendi</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                            <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false}/>
                        <XAxis dataKey="date" stroke="#64748b" tickFormatter={formatDate} fontSize={12} axisLine={false} tickLine={false} dy={10}/>
                        <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `${val/1000}k`} axisLine={false} tickLine={false}/>
                        <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155'}} formatter={(val) => formatCurrency(val) + ' ₺'}/>
                        <Legend verticalAlign="top"/>
                        <Area type="monotone" dataKey="income" name="Gelir" stroke="#10b981" fill="url(#colorInc)" strokeWidth={3}/>
                        <Area type="monotone" dataKey="expense" name="Gider" stroke="#ef4444" fill="url(#colorExp)" strokeWidth={3}/>
                    </AreaChart>
                </ResponsiveContainer>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col items-center">
                    <h3 className="font-bold text-white mb-4 w-full text-left flex items-center gap-2"><PieIcon size={18}/> Gider Dağılımı</h3>
                    <div className="h-64 w-full text-xs">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none'}} formatter={(val) => formatCurrency(val) + ' ₺'} />
                                <Legend layout="vertical" verticalAlign="middle" align="right"/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col">
                    <h3 className="font-bold text-white mb-4">En Çok Satanlar</h3>
                    <div className="flex-1 space-y-3 overflow-y-auto max-h-64 custom-scrollbar pr-2">
                        {products.sort((a,b) => b.sold - a.sold).slice(0, 5).map((p, idx) => (
                            <div key={p.id} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${idx === 0 ? 'bg-yellow-500 text-slate-900' : 'bg-slate-700 text-slate-400'}`}>{idx + 1}</div>
                                <div className="flex-1"><p className="text-sm font-bold text-slate-200">{p.name}</p></div>
                                <div className="text-right"><p className="text-sm font-bold text-white">{p.sold} Adet</p></div>
                            </div>
                        ))}
                    </div>
                </div>
             </div>
        </div>
    );
};

export default Stats;