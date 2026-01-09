// pages/CustomerDirectory.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
    Search, Download, Users, Star, TrendingUp,
    ChevronLeft, Coins, UserCheck, Zap, Award, X, ShoppingBag
} from 'lucide-react';
import { collection, getDocs, query, orderBy, where, limit } from 'firebase/firestore';
import { db, appId } from '../services/firebase';
import { CURRENT_SHOP_ID } from '../constants/pos/config';

const CustomerDirectory = ({ isDarkMode }) => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null); // ✨ Detay paneli için
    const [customerHistory, setCustomerHistory] = useState([]); // Müşteri sipariş geçmişi
    const [historyLoading, setHistoryLoading] = useState(false);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const customersRef = collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'customers');
                const q = query(customersRef, orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                
                const customerList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setCustomers(customerList);
            } catch (error) {
                console.error("Müşteriler yüklenirken hata:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCustomers();
    }, []);

    // ✨ Müşteri seçildiğinde geçmişini getir
    useEffect(() => {
        const fetchCustomerHistory = async () => {
            if (!selectedCustomer) {
                setCustomerHistory([]);
                return;
            }

            setHistoryLoading(true);
            try {
                // Müşterinin telefonuna göre işlemleri filtrele
                const transactionsRef = collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'transactions');
                const q = query(
                    transactionsRef,
                    where("customerPhone", "==", selectedCustomer.phone), // ✨ Önceki adımda eklediğimiz alan
                    orderBy("timestamp", "desc"),
                    limit(5)
                );

                const snapshot = await getDocs(q);
                const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCustomerHistory(history);
            } catch (error) {
                console.error("Geçmiş yükleme hatası:", error);
            } finally {
                setHistoryLoading(false);
            }
        };

        fetchCustomerHistory();
    }, [selectedCustomer]); // Sadece seçili müşteri değiştiğinde çalışır

    // 📊 DASHBOARD İSTATİSTİKLERİ (Otomatik Hesaplanır)
    const stats = useMemo(() => {
        const total = customers.length;
        const vips = customers.filter(c => c.tier === 'VIP').length;
        const totalPoints = customers.reduce((sum, c) => sum + (Number(c.points) || 0), 0);
        const avgPoints = total > 0 ? (totalPoints / total).toFixed(0) : 0;
        
        return [
            { label: 'Toplam Üye', value: total, icon: Users, color: 'indigo' },
            { label: 'VIP Müşteriler', value: vips, icon: Award, color: 'amber' },
            { label: 'Dağıtılan M-Coin', value: totalPoints, icon: Coins, color: 'purple' },
            { label: 'Puan Ortalaması', value: avgPoints, icon: TrendingUp, color: 'emerald' }
        ];
    }, [customers]);

    const filteredCustomers = customers.filter(c => 
        (c.name?.toLowerCase() + " " + c.surname?.toLowerCase()).includes(searchTerm.toLowerCase()) || 
        c.phone?.includes(searchTerm)
    );

    const exportToCSV = () => {
        const headers = "Ad,Soyad,Telefon,Puan,Seviye,Kayit Tarihi\n";
        const rows = filteredCustomers.map(c => 
            `${c.name},${c.surname},${c.phone},${c.points},${c.tier},${c.createdAt?.split('T')[0]}`
        ).join("\n");
        
        const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `Motto_Musteri_Listesi_${new Date().toLocaleDateString()}.csv`;
        link.click();
    };

    if (loading) return <div className="p-10 text-center font-bold">Veriler Hazırlanıyor...</div>;

    return (
        <div className={`p-6 min-h-screen relative overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-[#0F131C]' : 'bg-slate-100'}`}>
            <div className="max-w-7xl mx-auto flex flex-col gap-6">
                
                {/* 🚀 DASHBOARD STATS SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {stats.map((stat, index) => (
                        <div key={index} className={`p-6 rounded-[32px] border flex items-center gap-5 transition-all hover:scale-[1.02] ${
                            isDarkMode ? 'bg-[#151921] border-white/5' : 'bg-white border-slate-200 shadow-sm'
                        }`}>
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-${stat.color}-500/10 text-${stat.color}-500`}>
                                <stat.icon size={28} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                                <p className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 📋 MÜŞTERİ LİSTESİ PANELİ */}
                <div className={`rounded-[40px] shadow-2xl overflow-hidden border ${
                    isDarkMode ? 'bg-[#151921] border-white/5' : 'bg-white border-slate-200'
                }`}>
                    {/* ÜST ARAÇ ÇUBUĞU */}
                    <div className="p-8 border-b border-white/5 flex flex-col lg:flex-row justify-between items-center gap-6">
                        <div>
                            <h2 className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                Müşteri Rehberi
                            </h2>
                            <p className="text-xs text-slate-500 font-medium">Aktif sadakat programı üyeleri</p>
                        </div>
                        
                        <div className="flex gap-3 w-full lg:w-auto">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input 
                                    type="text"
                                    placeholder="İsim veya telefon ara..."
                                    className={`pl-12 pr-6 h-14 w-full lg:w-72 rounded-2xl border-none outline-none text-sm font-bold transition-all ${
                                        isDarkMode ? 'bg-slate-900 text-white focus:ring-2 ring-indigo-500/20' : 'bg-slate-50 text-slate-800 focus:ring-2 ring-indigo-200'
                                    }`}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button 
                                onClick={exportToCSV}
                                className="h-14 px-6 bg-indigo-600 text-white rounded-2xl font-black text-xs flex items-center gap-2 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                            >
                                <Download size={18} />
                                EXCEL'E AKTAR
                            </button>
                        </div>
                    </div>

                    {/* TABLO */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className={isDarkMode ? 'bg-black/20' : 'bg-slate-50'}>
                                <tr>
                                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Müşteri</th>
                                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Telefon</th>
                                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Seviye</th>
                                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">M-Coin</th>
                                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Kayıt</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredCustomers.map((customer) => (
                                    <tr key={customer.id} onClick={() => setSelectedCustomer(customer)} className="hover:bg-indigo-500/5 cursor-pointer transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black shadow-lg">
                                                    {customer.name?.[0]}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                                        {customer.name} {customer.surname}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 font-medium">Müşteri ID: #{customer.id.slice(-4)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 font-mono text-sm text-slate-500">{customer.phone}</td>
                                        <td className="p-6">
                                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black border ${
                                                customer.tier === 'VIP' 
                                                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' 
                                                    : 'bg-slate-500/10 border-slate-500/20 text-slate-500'
                                            }`}>
                                                {customer.tier || 'Üye'}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col items-end">
                                                <span className="text-3xl font-black text-yellow-500">{customer.points || 0} P</span>
                                                <span className="text-[11px] font-bold text-slate-400 mt-[-4px]">
                                                    Nakit Değeri: {((customer.points || 0) / 10).toFixed(2)} ₺
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-sm text-slate-500">
                                            {customer.createdAt?.split('T')[0] || '2024-01-01'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* 🛡️ MÜŞTERİ DETAY YAN PANELİ (DRAWER) */}
            {selectedCustomer && (
                <div className="absolute inset-y-0 right-0 w-[400px] z-50 animate-in slide-in-from-right duration-500 shadow-[-20px_0_60px_rgba(0,0,0,0.5)]">
                    <div className={`h-full flex flex-col ${isDarkMode ? 'bg-[#151921] border-l border-white/10' : 'bg-white border-l border-slate-200'}`}>

                        {/* Panel Header */}
                        <div className="p-8 border-b border-white/5 flex justify-between items-center">
                            <h3 className="font-black text-xl">Müşteri Profili</h3>
                            <button onClick={() => setSelectedCustomer(null)} className="p-2 hover:bg-white/5 rounded-full"><X/></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            {/* 👤 PROFİL ÖZETİ */}
                            <div className="flex flex-col items-center mb-10">
                                <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-black text-white mb-4 shadow-xl">
                                    {selectedCustomer.name[0]}
                                </div>
                                <h4 className="text-2xl font-black">{selectedCustomer.name} {selectedCustomer.surname}</h4>
                                <span className="px-4 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-widest mt-2 border border-indigo-500/20">
                                    {selectedCustomer.tier || 'Üye'}
                                </span>
                            </div>

                            {/* 💰 PUAN VE TL KARTI */}
                            <div className="p-6 rounded-[32px] bg-indigo-600 text-white mb-8 shadow-lg shadow-indigo-600/20 flex justify-between items-center relative overflow-hidden">
                                <div className="relative z-10">
                                    <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-1">M-COIN BAKİYESİ</p>
                                    <h5 className="text-3xl font-black">{selectedCustomer.points || 0} P</h5>
                                    <p className="text-xs font-bold opacity-90 mt-1">≈ {((selectedCustomer.points || 0) / 10).toFixed(2)} ₺ Değerinde</p>
                                </div>
                                <Coins size={48} className="absolute right-[-10px] bottom-[-10px] opacity-20 rotate-12" />
                            </div>

                            {/* 🕒 SİPARİŞ GEÇMİŞİ */}
                            <div className="space-y-4">
                                <h6 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <ShoppingBag size={14} /> SON SİPARİŞLER
                                </h6>

                                {historyLoading ? (
                                    <div className="py-10 text-center opacity-50 text-xs italic">Siparişler taranıyor...</div>
                                ) : customerHistory.length > 0 ? (
                                    customerHistory.map((order, idx) => (
                                        <div key={idx} className={`p-5 rounded-3xl border transition-all ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase">{order.date}</span>
                                                <span className="text-xs font-black text-emerald-500">+{Math.floor(order.amount / 10)} P</span>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div className="flex flex-col gap-1">
                                                    {order.items?.map((item, i) => (
                                                        <span key={i} className="text-[11px] font-bold opacity-80">{item.quantity}x {item.name}</span>
                                                    ))}
                                                </div>
                                                <span className="font-black text-md text-indigo-500">{order.amount.toFixed(2)} ₺</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-10 text-center opacity-30 text-xs">Henüz bir sipariş kaydı bulunmuyor.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerDirectory;