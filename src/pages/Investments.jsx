import React, { useState } from 'react';
import { Coins, TrendingUp, PlusCircle, Trash2, PieChart as PieIcon, CheckCircle2, AlertOctagon } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { addDoc, deleteDoc, updateDoc, doc, collection, writeBatch } from 'firebase/firestore';
import { db, appId, auth } from '../services/firebase';
import { formatCurrency, formatDate } from '../utils/helpers';
import { INITIAL_MARKET_RATES, COLORS, THEME } from '../utils/constants';

const Investments = ({ investments, marketRates }) => {
    // Seçili kurun fiyatını otomatik getirmek için helper
    const getInitialPrice = (type) => marketRates?.[type] || '';

    const [newInvestment, setNewInvestment] = useState({ 
        date: new Date().toISOString().split('T')[0], 
        type: Object.keys(INITIAL_MARKET_RATES)[0], 
        quantity: '', 
        buyPrice: '', 
        currentPrice: getInitialPrice(Object.keys(INITIAL_MARKET_RATES)[0]) 
    });

    // --- HESAPLAMALAR ---
    const investmentStats = investments.reduce((acc, inv) => {
        const currentPrice = inv.currentPrice || inv.buyPrice;
        const totalCost = inv.quantity * inv.buyPrice;
        const currentValue = inv.quantity * currentPrice;
        const profit = currentValue - totalCost;
        acc.totalCost += totalCost;
        acc.currentValue += currentValue;
        acc.totalProfit += profit;
        return acc;
    }, { totalCost: 0, currentValue: 0, totalProfit: 0 });

    const chartData = investments.reduce((acc, inv) => {
        const val = inv.quantity * (inv.currentPrice || inv.buyPrice);
        const existing = acc.find(x => x.name === inv.type);
        if(existing) existing.value += val; else acc.push({ name: inv.type, value: val });
        return acc;
    }, []);

    // --- FIREBASE İŞLEMLERİ ---
    const handleAddInvestment = async () => {
        if (!newInvestment.quantity || !newInvestment.buyPrice) return;
        const user = auth.currentUser;
        
        const invData = {
            ...newInvestment,
            quantity: Number(newInvestment.quantity),
            buyPrice: Number(newInvestment.buyPrice),
            currentPrice: Number(newInvestment.currentPrice)
        };

        try {
            await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'investments'), invData);
            // Formu sıfırla ama tarihi bugünde tut
            setNewInvestment({ 
                date: new Date().toISOString().split('T')[0], 
                type: 'Gram Altın', 
                quantity: '', 
                buyPrice: '', 
                currentPrice: marketRates['Gram Altın'] || '' 
            });
        } catch (error) {
            console.error("Yatırım eklenemedi:", error);
        }
    };

    const handleDeleteInvestment = async (id) => {
        if(!window.confirm("Yatırımı silmek istiyor musunuz?")) return;
        await deleteDoc(doc(db, 'artifacts', appId, 'users', auth.currentUser.uid, 'investments', id));
    };

    const handleUpdateInvestment = async (id, field, value) => {
        const user = auth.currentUser;
        await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'investments', id), { [field]: Number(value) });
    };

    // --- YATIRIM BOZDURMA (SATMA) ---
    const handleLiquidateInvestment = async (inv) => {
        const sellQty = Number(prompt(`Kaç adet ${inv.type} bozdurulacak? (Mevcut: ${inv.quantity})`, inv.quantity));
        if (!sellQty || sellQty <= 0 || sellQty > inv.quantity) return;

        const sellPrice = Number(prompt(`Birim satış fiyatı nedir? (Güncel: ${inv.currentPrice})`, inv.currentPrice));
        if (!sellPrice || sellPrice <= 0) return;

        const totalIncome = sellQty * sellPrice;
        const profit = (sellPrice - inv.buyPrice) * sellQty;

        if(!window.confirm(`${sellQty} adet ${inv.type} bozdurulacak.\nKasaya Girecek: ${formatCurrency(totalIncome)} ₺\nBu işlemden Kârınız: ${formatCurrency(profit)} ₺\nOnaylıyor musunuz?`)) return;

        const user = auth.currentUser;
        const batch = writeBatch(db);

        // 1. Yatırımı Güncelle (Düş veya Sil)
        const invRef = doc(db, 'artifacts', appId, 'users', user.uid, 'investments', inv.id);
        if (sellQty === inv.quantity) {
            batch.delete(invRef);
        } else {
            batch.update(invRef, { quantity: inv.quantity - sellQty });
        }

        // 2. Kasaya Para Ekle
        const transRef = doc(collection(db, 'artifacts', appId, 'users', user.uid, 'transactions'));
        batch.set(transRef, {
            date: new Date().toISOString().split('T')[0],
            type: 'income',
            amount: totalIncome,
            desc: `Yatırım Bozdurma: ${inv.type} (${sellQty} Adet)`,
            method: 'cash',
            category: 'Yatırım Getirisi',
            subMethod: 'Nakit'
        });

        await batch.commit();
        alert(`İşlem başarılı. ${formatCurrency(totalIncome)} ₺ kasaya eklendi.`);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
             
             {/* ÜST BİLGİ KARTLARI */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Coins size={64} className="text-slate-400"/></div>
                    <div className="text-xs text-slate-500 font-bold uppercase mb-2">Toplam Yatırım Maliyeti</div>
                    <div className="text-3xl font-extrabold text-slate-300">{formatCurrency(investmentStats.totalCost)} ₺</div>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 relative overflow-hidden border-yellow-500/30">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp size={64} className="text-yellow-500"/></div>
                    <div className="text-xs text-yellow-500 font-bold uppercase mb-2">Güncel Portföy Değeri</div>
                    <div className="text-3xl font-extrabold text-yellow-400">{formatCurrency(investmentStats.currentValue)} ₺</div>
                </div>
                <div className={`p-6 rounded-2xl border relative overflow-hidden ${investmentStats.totalProfit >= 0 ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
                    <div className="text-xs text-slate-400 font-bold uppercase mb-2">Toplam Kâr / Zarar</div>
                    <div className={`text-3xl font-extrabold ${investmentStats.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {investmentStats.totalProfit >= 0 ? '+' : ''}{formatCurrency(investmentStats.totalProfit)} ₺
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Anlık piyasa farkı</div>
                </div>
             </div>

             {/* ORTA BÖLÜM: GRAFİK VE FORM */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* SOL: PORTFÖY DAĞILIMI (PASTA GRAFİK) */}
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col items-center justify-center">
                    <h3 className="font-bold text-white mb-4 w-full text-left flex items-center gap-2"><PieIcon size={18} className="text-purple-400"/> Portföy Dağılımı</h3>
                    {investments.length > 0 ? (
                        <div className="h-64 w-full text-xs">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px'}} formatter={(val) => formatCurrency(val) + ' ₺'} />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="text-slate-500 py-10 text-center text-sm">Henüz yatırım verisi yok.</div>
                    )}
                </div>

                {/* SAĞ: YENİ YATIRIM EKLEME FORMU */}
                <div className="lg:col-span-2 bg-slate-800 p-6 rounded-2xl border border-slate-700">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2"><PlusCircle size={18} className="text-emerald-400"/> Yeni Yatırım Ekle</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-slate-500 block mb-1">Tarih</label>
                                <input type="date" value={newInvestment.date} onChange={(e) => setNewInvestment({...newInvestment, date: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white outline-none focus:border-emerald-500 transition-all"/>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 block mb-1">Varlık Türü</label>
                                <select 
                                    value={newInvestment.type} 
                                    onChange={(e) => setNewInvestment({...newInvestment, type: e.target.value, currentPrice: marketRates[e.target.value] || ''})} 
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white outline-none focus:border-emerald-500 transition-all">
                                    {Object.keys(INITIAL_MARKET_RATES).map(rate => <option key={rate} value={rate}>{rate}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="text-xs text-slate-500 block mb-1">Adet/Miktar</label>
                                <input type="number" placeholder="0" value={newInvestment.quantity} onChange={(e) => setNewInvestment({...newInvestment, quantity: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white outline-none focus:border-emerald-500"/>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 block mb-1">Alış Fiyatı (Birim)</label>
                                <input type="number" placeholder="0" value={newInvestment.buyPrice} onChange={(e) => setNewInvestment({...newInvestment, buyPrice: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white outline-none focus:border-emerald-500"/>
                            </div>
                            <div>
                                <label className="text-xs text-yellow-500 block mb-1 font-bold">Güncel Fiyat (Birim)</label>
                                <input 
                                    type="number" 
                                    placeholder="0" 
                                    value={newInvestment.currentPrice} 
                                    onChange={(e) => setNewInvestment({...newInvestment, currentPrice: e.target.value})} 
                                    className="w-full bg-slate-900 border border-yellow-600/50 rounded-lg p-3 text-yellow-400 font-bold outline-none focus:border-yellow-500"/>
                            </div>
                        </div>
                        <button onClick={handleAddInvestment} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-emerald-900/20">Yatırımı Portföye Ekle</button>
                    </div>
                </div>
             </div>

             {/* ALT BÖLÜM: YATIRIM LİSTESİ */}
             <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                <h3 className="font-bold text-white mb-4">Varlıklarım</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-400">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-900/50">
                            <tr>
                                <th className="px-4 py-3 rounded-l-lg">Tarih</th>
                                <th className="px-4 py-3">Tür</th>
                                <th className="px-4 py-3">Adet</th>
                                <th className="px-4 py-3">Alış (Birim)</th>
                                <th className="px-4 py-3">Güncel Fiyat (Birim)</th>
                                <th className="px-4 py-3">Toplam Değer</th>
                                <th className="px-4 py-3">Kâr/Zarar</th>
                                <th className="px-4 py-3 text-right rounded-r-lg">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">{investments.map(inv => { 
                                const currentPrice = inv.currentPrice; 
                                const totalVal = inv.quantity * currentPrice; 
                                const costVal = inv.quantity * inv.buyPrice; 
                                const profit = totalVal - costVal; 
                                return (
                                    <tr key={inv.id} className="hover:bg-slate-700/50 group transition-colors">
                                        <td className="px-4 py-3">{formatDate(inv.date)}</td>
                                        <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-yellow-500"></span> {inv.type}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-slate-300">{inv.quantity}</td>
                                        <td className="px-4 py-3">{formatCurrency(inv.buyPrice)} ₺</td>
                                        <td className="px-4 py-3">
                                            <input 
                                                type="number"
                                                value={currentPrice}
                                                onChange={(e) => handleUpdateInvestment(inv.id, 'currentPrice', e.target.value)}
                                                className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-yellow-400 font-bold w-24 text-right outline-none focus:border-yellow-500 transition-all text-xs"
                                            />
                                        </td>
                                        <td className="px-4 py-3 font-bold text-white">{formatCurrency(totalVal)} ₺</td>
                                        <td className={`px-4 py-3 font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {profit >= 0 ? '+' : ''}{formatCurrency(profit)} ₺
                                        </td>
                                        <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => handleLiquidateInvestment(inv)}
                                                className="text-xs bg-indigo-900/50 text-indigo-300 px-3 py-1.5 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors border border-indigo-500/30"
                                                title="Nakite Çevir (Bozdur)"
                                            >
                                                Bozdur
                                            </button>
                                            <button onClick={() => handleDeleteInvestment(inv.id)} className="text-slate-500 hover:text-red-500 p-1.5 hover:bg-slate-700 rounded transition-colors">
                                                <Trash2 size={16}/>
                                            </button>
                                        </td>
                                    </tr>
                                ) 
                            })}
                        </tbody>
                    </table>
                    {investments.length === 0 && <div className="text-center py-8 text-slate-500 italic">Portföyünüz boş. Yeni bir yatırım ekleyerek başlayın.</div>}
                </div>
             </div>
        </div>
    );
};

export default Investments;