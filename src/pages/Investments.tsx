// pages/Investments.tsx (ORTAK HAVUZ ENTEGRASYONU ✅)

import React, { useState } from 'react';
import {
    Coins, TrendingUp, PlusCircle, Trash2, PieChart as PieIcon,
    ArrowUpRight, ArrowDownRight, Wallet, DollarSign, Euro,
    Hexagon, CircleDollarSign, Landmark, History, Briefcase,
    LucideIcon
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { addDoc, deleteDoc, updateDoc, doc, collection, writeBatch } from 'firebase/firestore';
import { db, appId } from '../services/firebase';
import { formatCurrency, formatDate } from '../utils/helpers';
import { INITIAL_MARKET_RATES, COLORS } from '../utils/constants';
import LiquidationModal from '../components/LiquidationModal';
import ConfirmationModal from '../components/ConfirmationModal';

// 👇 MAĞAZA ID
import { SHOP_ID as CURRENT_SHOP_ID } from '../utils/constants';
import { Investment } from '../types';

import { useOutletContext } from 'react-router-dom';
import { DashboardContextType } from '../types';

interface StatCardProps {
    title: string;
    value: string;
    subValue?: string;
    icon: LucideIcon;
    color: string;
    trend?: 'up' | 'down';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subValue, icon: Icon, color, trend }) => (
    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden group hover:border-slate-600 transition-all shadow-lg">
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
            <Icon size={64} />
        </div>
        <div className="relative z-10">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                {title}
            </div>
            <div className="text-3xl font-extrabold text-white mb-1 tracking-tight">
                {value}
            </div>
            {subValue && (
                <div className={`text-sm font-medium flex items-center gap-1 ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-500'}`}>
                    {trend === 'up' ? <ArrowUpRight size={16} /> : trend === 'down' ? <ArrowDownRight size={16} /> : null}
                    {subValue}
                </div>
            )}
        </div>
    </div>
);

interface AssetCardProps {
    type: string;
    quantity: number;
    avgCost: number;
    currentValue: number;
    profit: number;
    profitPercent: string | number;
    icon: LucideIcon;
    colorClass: string;
}

const AssetCard: React.FC<AssetCardProps> = ({ type, quantity, avgCost, currentValue, profit, profitPercent, icon: Icon, colorClass }) => (
    <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-all flex flex-col justify-between group">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl bg-slate-900 ${colorClass} group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
            </div>
            <div className={`text-xs font-bold px-2 py-1 rounded-lg ${profit >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {profit >= 0 ? '+' : ''}%{profitPercent}
            </div>
        </div>
        <div>
            <h4 className="text-slate-400 text-xs font-bold uppercase mb-1">{type}</h4>
            <div className="text-xl font-bold text-white mb-2">{formatCurrency(currentValue)} ₺</div>
            <div className="flex justify-between items-end text-xs text-slate-500 border-t border-slate-700/50 pt-3 mt-1">
                <div>
                    <div className="mb-0.5">Miktar: <span className="text-slate-300 font-medium">{quantity}</span></div>
                    <div>Ort. Maliyet: <span className="text-slate-300 font-medium">{formatCurrency(avgCost)}</span></div>
                </div>
                <div className={`font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
                </div>
            </div>
        </div>
    </div>
);

const Investments: React.FC = () => {
    const { investments, marketRates } = useOutletContext<DashboardContextType>();
    const getInitialPrice = (type: string) => marketRates?.[type] || '';

    const [newInvestment, setNewInvestment] = useState({
        date: new Date().toISOString().split('T')[0],
        type: Object.keys(INITIAL_MARKET_RATES)[0],
        quantity: '',
        buyPrice: '',
        currentPrice: getInitialPrice(Object.keys(INITIAL_MARKET_RATES)[0])
    });

    const [liquidationData, setLiquidationData] = useState<Investment | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

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

    const profitMargin = investmentStats.totalCost > 0
        ? ((investmentStats.currentValue - investmentStats.totalCost) / investmentStats.totalCost) * 100
        : 0;

    // Varlık Bazlı Gruplama
    const assetsGrouped = investments.reduce((acc, inv) => {
        if (!acc[inv.type]) {
            acc[inv.type] = { type: inv.type, quantity: 0, totalCost: 0, currentValue: 0 };
        }
        const currentPrice = inv.currentPrice || inv.buyPrice;
        acc[inv.type].quantity += Number(inv.quantity);
        acc[inv.type].totalCost += Number(inv.quantity) * Number(inv.buyPrice);
        acc[inv.type].currentValue += Number(inv.quantity) * currentPrice;
        return acc;
    }, {} as Record<string, { type: string; quantity: number; totalCost: number; currentValue: number; }>);

    const chartData = Object.values(assetsGrouped).map(asset => ({
        name: asset.type,
        value: asset.currentValue
    }));

    // --- İKON SEÇİCİ ---
    const getAssetIconInfo = (type: string) => {
        switch (type) {
            case 'Gram Altın': return { icon: Coins, color: 'text-yellow-400' };
            case 'Çeyrek Altın': return { icon: CircleDollarSign, color: 'text-orange-400' };
            case 'Dolar': return { icon: DollarSign, color: 'text-emerald-400' };
            case 'Euro': return { icon: Euro, color: 'text-blue-400' };
            case 'Gümüş': return { icon: Hexagon, color: 'text-slate-400' };
            default: return { icon: Wallet, color: 'text-purple-400' };
        }
    };

    // --- İŞLEMLER (ORTAK HAVUZ) ---
    const handleAddInvestment = async () => {
        if (!newInvestment.quantity || !newInvestment.buyPrice) return;
        const invData = {
            ...newInvestment,
            quantity: Number(newInvestment.quantity),
            buyPrice: Number(newInvestment.buyPrice),
            currentPrice: Number(newInvestment.currentPrice)
        };
        try {
            await addDoc(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'investments'), invData);
            // Formu sıfırla ama tarihi koru
            setNewInvestment(prev => ({ ...prev, quantity: '', buyPrice: '', currentPrice: marketRates[prev.type] || '' }));
        } catch (e) { console.error(e); }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteId) return;
        setLoading(true);
        try {
            await deleteDoc(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'investments', deleteId));
        } catch (e) { console.error(e); }
        setLoading(false);
        setDeleteId(null);
    };

    const handleLiquidateConfirm = async (sellQty: number, sellPrice: number) => {
        if (!liquidationData) return;
        setLoading(true);
        const inv = liquidationData;
        const totalIncome = sellQty * sellPrice;
        const batch = writeBatch(db);

        try {
            // 1. YATIRIMI GÜNCELLE/SİL
            const invRef = doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'investments', inv.id);
            if (sellQty === inv.quantity) batch.delete(invRef);
            else batch.update(invRef, { quantity: inv.quantity - sellQty });

            // 2. KASAYA PARA EKLE
            const transRef = doc(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'transactions'));
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
            alert(`✅ İşlem başarılı. ${formatCurrency(totalIncome)} ₺ kasaya eklendi.`);
        } catch (e) { console.error(e); }

        setLoading(false);
        setLiquidationData(null);
    };

    const handleUpdateInvestment = async (id: string, field: string, value: string | number) => {
        try {
            await updateDoc(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'investments', id), { [field]: Number(value) });
        } catch (e) { console.error(e); }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
            <ConfirmationModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDeleteConfirm} title="Yatırımı Sil" message="Bu yatırımı portföyden silmek istediğinize emin misiniz? Bu işlem geri alınamaz." loading={loading} />
            {liquidationData && (
                <LiquidationModal
                    isOpen={!!liquidationData}
                    onClose={() => setLiquidationData(null)}
                    investment={liquidationData}
                    onConfirm={handleLiquidateConfirm}
                    loading={loading}
                />
            )}

            {/* ÜST BİLGİ KARTLARI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Toplam Portföy Değeri"
                    value={`${formatCurrency(investmentStats.currentValue)} ₺`}
                    icon={Landmark}
                    color="text-yellow-500"
                    subValue={`Maliyet: ${formatCurrency(investmentStats.totalCost)} ₺`}
                />
                <StatCard
                    title="Toplam Kâr / Zarar"
                    value={`${investmentStats.totalProfit >= 0 ? '+' : ''}${formatCurrency(investmentStats.totalProfit)} ₺`}
                    icon={TrendingUp}
                    color={investmentStats.totalProfit >= 0 ? "text-emerald-500" : "text-red-500"}
                    subValue={`%${profitMargin.toFixed(2)} Getiri`}
                    trend={investmentStats.totalProfit >= 0 ? 'up' : 'down'}
                />
                <StatCard
                    title="Varlık Çeşitliliği"
                    value={`${Object.keys(assetsGrouped).length} Adet`}
                    subValue="Farklı Yatırım Aracı"
                    icon={Briefcase}
                    color="text-purple-500"
                />
            </div>

            {/* VARLIK KARTLARI GRID */}
            <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Wallet className="text-emerald-400" size={24} /> Varlık Dağılımı
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.values(assetsGrouped).map(asset => {
                        const info = getAssetIconInfo(asset.type);
                        const avgCost = asset.quantity > 0 ? asset.totalCost / asset.quantity : 0;
                        const profit = asset.currentValue - asset.totalCost;
                        const profitPercent = asset.totalCost > 0 ? ((profit / asset.totalCost) * 100).toFixed(1) : 0;

                        return (
                            <AssetCard
                                key={asset.type}
                                type={asset.type}
                                quantity={asset.quantity}
                                avgCost={avgCost}
                                currentValue={asset.currentValue}
                                profit={profit}
                                profitPercent={profitPercent}
                                icon={info.icon}
                                colorClass={info.color}
                            />
                        );
                    })}
                    {Object.keys(assetsGrouped).length === 0 && (
                        <div className="col-span-full bg-slate-800/50 border border-slate-700 border-dashed rounded-xl p-8 text-center text-slate-500">
                            Henüz portföyünüzde bir varlık bulunmuyor.
                        </div>
                    )}
                </div>
            </div>

            {/* ANA İÇERİK: GRAFİK & FORM & TABLO */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* SOL KOLON: GRAFİK + FORM */}
                <div className="space-y-6">
                    {/* GRAFİK */}
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-sm">
                        <h3 className="font-bold text-white mb-6 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <PieIcon size={16} className="text-purple-400" /> Portföy Pastası
                        </h3>
                        {investments.length > 0 ? (
                            <div className="h-64 w-full text-xs relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%" cy="50%"
                                            innerRadius={60} outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' }}
                                            itemStyle={{ color: '#cbd5e1' }}
                                            formatter={(val: number) => formatCurrency(val) + ' ₺'}
                                        />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                    <div className="text-xs text-slate-500 font-bold">TOPLAM</div>
                                    <div className="text-sm font-bold text-white">{formatCurrency(investmentStats.currentValue)}</div>
                                </div>
                            </div>
                        ) : <div className="text-slate-500 py-10 text-center text-sm italic">Veri yok.</div>}
                    </div>

                    {/* YENİ YATIRIM FORMU */}
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-sm">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <PlusCircle size={16} className="text-emerald-400" /> Hızlı İşlem
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-500 font-bold ml-1 mb-1 block">YATIRIM TÜRÜ</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {Object.keys(INITIAL_MARKET_RATES).slice(0, 3).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setNewInvestment({ ...newInvestment, type, currentPrice: (marketRates[type] || '') })}
                                            className={`text-xs p-2 rounded-lg border transition-all ${newInvestment.type === type ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                                <select
                                    value={newInvestment.type}
                                    onChange={(e) => setNewInvestment({ ...newInvestment, type: e.target.value, currentPrice: (marketRates[e.target.value] || '') })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-emerald-500 transition-all mt-2 text-sm"
                                >
                                    {Object.keys(INITIAL_MARKET_RATES).map(rate => <option key={rate} value={rate}>{rate}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-500 font-bold ml-1 mb-1 block">TARİH</label>
                                    <input type="date" value={newInvestment.date} onChange={(e) => setNewInvestment({ ...newInvestment, date: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-emerald-500 outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 font-bold ml-1 mb-1 block">MİKTAR</label>
                                    <input type="number" placeholder="0.00" value={newInvestment.quantity} onChange={(e) => setNewInvestment({ ...newInvestment, quantity: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-emerald-500 outline-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-500 font-bold ml-1 mb-1 block">ALIŞ FİYATI</label>
                                    <input type="number" placeholder="0.00" value={newInvestment.buyPrice} onChange={(e) => setNewInvestment({ ...newInvestment, buyPrice: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-emerald-500 outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs text-yellow-600 font-bold ml-1 mb-1 block">PİYASA FİYATI</label>
                                    <input type="number" placeholder="0.00" value={newInvestment.currentPrice} onChange={(e) => setNewInvestment({ ...newInvestment, currentPrice: e.target.value })} className="w-full bg-slate-900 border border-yellow-600/30 rounded-lg p-2.5 text-yellow-500 text-sm focus:border-yellow-500 outline-none" />
                                </div>
                            </div>

                            <button onClick={handleAddInvestment} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 mt-2">
                                <PlusCircle size={18} /> Portföye Ekle
                            </button>
                        </div>
                    </div>
                </div>

                {/* SAĞ KOLON: İŞLEM GEÇMİŞİ TABLOSU */}
                <div className="lg:col-span-2 bg-slate-800 rounded-2xl border border-slate-700 shadow-sm flex flex-col h-full">
                    <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                        <h3 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                            <History size={16} className="text-blue-400" /> Yatırım Hareketleri
                        </h3>
                        <span className="text-xs text-slate-500 font-mono bg-slate-900 px-2 py-1 rounded">Toplam {investments.length} Kayıt</span>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-sm text-left text-slate-400">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-900/50 sticky top-0 z-10 backdrop-blur-sm">
                                <tr>
                                    <th className="px-4 py-3">Tarih</th>
                                    <th className="px-4 py-3">Varlık</th>
                                    <th className="px-4 py-3 text-right">Miktar</th>
                                    <th className="px-4 py-3 text-right">Alış</th>
                                    <th className="px-4 py-3 text-right">Güncel</th>
                                    <th className="px-4 py-3 text-right">Değer</th>
                                    <th className="px-4 py-3 text-center">K/Z</th>
                                    <th className="px-4 py-3 text-right">İşlem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {investments.map(inv => {
                                    const currentPrice = inv.currentPrice;
                                    const totalVal = inv.quantity * currentPrice;
                                    const costVal = inv.quantity * inv.buyPrice;
                                    const profit = totalVal - costVal;
                                    const info = getAssetIconInfo(inv.type);
                                    const Icon = info.icon;

                                    return (
                                        <tr key={inv.id} className="hover:bg-slate-700/30 group transition-colors">
                                            <td className="px-4 py-3 font-mono text-xs">{formatDate(inv.date)}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-1.5 rounded-lg bg-slate-900 ${info.color}`}>
                                                        <Icon size={14} />
                                                    </div>
                                                    <span className="font-bold text-slate-200">{inv.type}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono text-slate-300">{inv.quantity}</td>
                                            <td className="px-4 py-3 text-right font-mono text-xs">{formatCurrency(inv.buyPrice)}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1 group-hover:bg-slate-900 rounded py-1 px-2 -mr-2 transition-colors">
                                                    <input
                                                        type="number"
                                                        value={currentPrice}
                                                        onChange={(e) => handleUpdateInvestment(inv.id, 'currentPrice', e.target.value)}
                                                        className="bg-transparent text-yellow-400 font-bold w-16 text-right outline-none text-xs p-0 border-none focus:ring-0"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-slate-200">{formatCurrency(totalVal)}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${profit >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                                    {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => setLiquidationData(inv)} title="Bozdur" className="p-1.5 text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500 hover:text-white rounded-lg transition-colors">
                                                        <ArrowUpRight size={14} />
                                                    </button>
                                                    <button onClick={() => setDeleteId(inv.id)} title="Sil" className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                        {investments.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                                <Wallet size={48} className="mb-4 opacity-20" />
                                <p>Henüz yatırım işlemi bulunmuyor.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Investments;
