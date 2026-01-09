import React, { useState, useEffect } from 'react';
import { 
    Gift, User, LogOut, Plus, Star, QrCode, Coffee, 
    ChevronRight, Lock, Sparkles, Edit3, Check, X, 
    ArrowRight, Trophy, Zap, Wallet, RefreshCw, UserPlus,
    TrendingUp, Calendar, Award, Crown, Flame, Target, 
    ShoppingBag, Package, Heart, Clock
} from 'lucide-react';
import QRCode from "react-qr-code";
import {
    collection, query, where, getDocs, addDoc,
    serverTimestamp, onSnapshot, doc, updateDoc
} from 'firebase/firestore';
import { db, appId } from '../services/firebase';
import { CURRENT_SHOP_ID } from '../constants/pos/config'; 

const CustomerLoyalty = () => {
    const [step, setStep] = useState('login');
    const [phone, setPhone] = useState('');
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('home');
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: '', surname: '' });
    const [loading, setLoading] = useState(false);
    const [showQR, setShowQR] = useState(false);

    // ✨ POS Sistemiyle uyumlu yol
    const customerPath = `artifacts/${appId}/shops/${CURRENT_SHOP_ID}/customers`;

    // 🔄 Canlı Veri Takibi
    useEffect(() => {
        if (user?.id) {
            const unsub = onSnapshot(doc(db, customerPath, user.id), (snap) => {
                if (snap.exists()) {
                    const data = snap.data();
                    setUser({ id: snap.id, ...data });
                    setEditData({ name: data.name, surname: data.surname });
                }
            });
            return () => unsub();
        }
    }, [user?.id]);

    const handleCheckPhone = async (e) => {
        e.preventDefault();
        setLoading(true);
        const cleanPhone = phone.replace(/\D/g, '').slice(-10);
        if (cleanPhone.length < 10) { setLoading(false); return; }

        try {
            const q = query(collection(db, customerPath), where("phone", "==", cleanPhone));
            const snap = await getDocs(q);

            if (!snap.empty) {
                const d = snap.docs[0];
                setUser({ id: d.id, ...d.data() });
                setStep('dashboard');
            } else {
                setStep('register');
            }
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const handleFinalRegister = async (e) => {
        e.preventDefault();
        if (!editData.name || !editData.surname) return;
        setLoading(true);
        const cleanPhone = phone.replace(/\D/g, '').slice(-10);

        try {
            const newUser = {
                phone: cleanPhone,
                name: editData.name,
                surname: editData.surname,
                points: 50,
                lifetimePoints: 50,
                tier: 'BRONZ',
                createdAt: serverTimestamp(),
                history: [{ 
                    action: 'Motto+ Ailesine Katılım', 
                    points: 50, 
                    date: new Date().toLocaleDateString('tr-TR') 
                }]
            };
            const ref = await addDoc(collection(db, customerPath), newUser);
            setUser({ id: ref.id, ...newUser });
            setStep('dashboard');
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const getTierInfo = () => {
        const lp = user?.lifetimePoints || 0;
        if (lp >= 3500) return { 
            current: 'GOLD', 
            next: 'MAX', 
            goal: 3500, 
            progress: 100,
            color: 'text-amber-400', 
            gradient: 'from-amber-400 via-yellow-500 to-amber-600',
            glow: 'shadow-amber-500/40',
            icon: Crown,
            benefit: '%20 Bonus Puan'
        };
        if (lp >= 1000) return { 
            current: 'SILVER', 
            next: 'GOLD', 
            goal: 3500,
            progress: (lp / 3500) * 100,
            color: 'text-slate-300', 
            gradient: 'from-slate-300 via-slate-400 to-slate-500',
            glow: 'shadow-slate-400/40',
            icon: Award,
            benefit: '%10 Bonus Puan'
        };
        return { 
            current: 'BRONZ', 
            next: 'SILVER', 
            goal: 1000,
            progress: (lp / 1000) * 100,
            color: 'text-orange-400', 
            gradient: 'from-orange-400 via-orange-500 to-amber-600',
            glow: 'shadow-orange-500/40',
            icon: Flame,
            benefit: '%5 Bonus Puan'
        };
    };

    // 🎨 AŞAMA 1: GİRİŞ
    if (step === 'login') return (
        <div className="min-h-screen bg-gradient-to-br from-[#05070a] via-[#0a0d14] to-[#05070a] flex items-center justify-center p-6 text-white relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/5 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-600/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="w-full max-w-[380px] z-10 space-y-12 animate-in fade-in zoom-in-95 duration-700">
                {/* Logo Section */}
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-[36px] bg-gradient-to-br from-indigo-600 to-violet-700 shadow-2xl shadow-indigo-600/30 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Zap size={44} className="text-white relative z-10" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-6xl font-black italic tracking-tighter bg-gradient-to-r from-white via-indigo-200 to-white bg-clip-text text-transparent">
                            MOTTO<span className="text-indigo-400">+</span>
                        </h1>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.6em] mt-3">
                            Exclusive Loyalty Club
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleCheckPhone} className="space-y-6">
                    <div className="relative">
                        <input 
                            type="tel" 
                            value={phone} 
                            onChange={e => setPhone(e.target.value)} 
                            placeholder="5XX XXX XX XX" 
                            className="w-full bg-white/5 border-2 border-white/10 rounded-3xl py-5 text-center text-2xl font-black outline-none focus:border-indigo-500 focus:bg-white/10 transition-all placeholder:text-slate-700"
                        />
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 opacity-0 focus-within:opacity-100 transition-opacity pointer-events-none" />
                    </div>

                    <button 
                        disabled={loading} 
                        className="relative w-full h-16 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-3xl font-black text-sm flex items-center justify-center gap-3 group overflow-hidden shadow-2xl shadow-indigo-600/30 active:scale-95 transition-all disabled:opacity-50"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        {loading ? (
                            <RefreshCw className="animate-spin" size={20} />
                        ) : (
                            <>
                                GİRİŞ YAP
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center text-xs text-slate-600">
                    Telefon numaranızla giriş yapın veya ücretsiz üye olun
                </p>
            </div>
        </div>
    );

    // 🎨 AŞAMA 2: KAYIT
    if (step === 'register') return (
        <div className="min-h-screen bg-gradient-to-br from-[#05070a] via-[#0a0d14] to-[#05070a] flex items-center justify-center p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/5 rounded-full blur-[150px] animate-pulse" />
            </div>

            <div className="w-full max-w-[400px] z-10 space-y-8 animate-in slide-in-from-bottom-12 fade-in duration-700">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[32px] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30">
                        <UserPlus size={36} strokeWidth={2.5} />
                    </div>
                    <h2 className="text-3xl font-black italic tracking-tight">
                        Aramıza Hoş Geldin!
                    </h2>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        <Sparkles size={14} className="text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-400">
                            İlk üyelik hediyesi: 50 M-Coin
                        </span>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleFinalRegister} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 ml-4 tracking-[0.3em] uppercase">
                            Adınız
                        </label>
                        <input 
                            required 
                            className="w-full h-16 bg-white/5 border-2 border-white/10 rounded-3xl px-6 outline-none focus:border-emerald-500 focus:bg-white/10 transition-all text-lg font-bold" 
                            value={editData.name} 
                            onChange={e => setEditData({ ...editData, name: e.target.value })} 
                            placeholder="Örn: Emrullah"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 ml-4 tracking-[0.3em] uppercase">
                            Soyadınız
                        </label>
                        <input 
                            required 
                            className="w-full h-16 bg-white/5 border-2 border-white/10 rounded-3xl px-6 outline-none focus:border-emerald-500 focus:bg-white/10 transition-all text-lg font-bold" 
                            value={editData.surname} 
                            onChange={e => setEditData({ ...editData, surname: e.target.value })} 
                            placeholder="Örn: Göksal"
                        />
                    </div>

                    <button 
                        disabled={loading}
                        className="w-full h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl font-black shadow-2xl shadow-emerald-500/30 active:scale-95 transition-all mt-6 disabled:opacity-50"
                    >
                        {loading ? <RefreshCw className="animate-spin mx-auto" /> : 'HEDİYEMİ AL VE KATIL'}
                    </button>

                    <button 
                        type="button" 
                        onClick={() => setStep('login')} 
                        className="w-full text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] pt-4 hover:text-slate-300 transition-colors"
                    >
                        ← Geri Dön
                    </button>
                </form>
            </div>
        </div>
    );

    // 🎨 AŞAMA 3: DASHBOARD
    const tier = getTierInfo();
    const TierIcon = tier.icon;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#05070a] via-[#0a0d14] to-[#05070a] text-slate-200 pb-20 font-sans relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/3 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/3 rounded-full blur-[120px]" />
            </div>

            {/* Header */}
            <div className="sticky top-0 z-50 backdrop-blur-2xl bg-[#05070a]/90 border-b border-white/5 px-6 py-5">
                <div className="max-w-2xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-[24px] bg-gradient-to-br ${tier.gradient} flex items-center justify-center font-black text-white text-2xl shadow-xl ${tier.glow} relative overflow-hidden`}>
                            <div className="absolute inset-0 bg-white/10" />
                            <span className="relative z-10">{user?.name?.[0].toUpperCase()}</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight text-white leading-none">
                                {user?.name} {user?.surname}
                            </h2>
                            <div className={`flex items-center gap-2 mt-2 ${tier.color}`}>
                                <TierIcon size={12} fill="currentColor" />
                                <span className="text-[10px] font-black uppercase tracking-[0.25em]">
                                    {tier.current} ÜYE
                                </span>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => setStep('login')} 
                        className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-[20px] text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-6 mt-8 space-y-8 relative z-10">
                {/* 💳 PREMIUM CARD */}
                <div className="relative">
                    <div className={`absolute inset-0 bg-gradient-to-br ${tier.gradient} opacity-20 blur-3xl rounded-[60px]`} />
                    <div className="relative w-full aspect-[1.618/1] rounded-[48px] border-2 border-white/10 p-10 flex flex-col justify-between overflow-hidden shadow-2xl bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-xl">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-5">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white to-transparent rounded-full blur-3xl" />
                        </div>

                        {/* Top Row */}
                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <h3 className="text-3xl font-black italic tracking-tighter text-white drop-shadow-lg">
                                    MOTTO<span className="text-indigo-400">+</span>
                                </h3>
                                <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.3em] mt-1">
                                    Loyalty Card
                                </p>
                            </div>
                            <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${tier.gradient} backdrop-blur-md text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg flex items-center gap-1.5`}>
                                <TierIcon size={12} fill="currentColor" />
                                {tier.current}
                            </div>
                        </div>

                        {/* Bottom Row */}
                        <div className="relative z-10 flex justify-between items-end">
                            <div className="space-y-5">
                                <div>
                                    <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">
                                        M-Coin Balance
                                    </p>
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-6xl font-black text-white tracking-tighter leading-none drop-shadow-lg">
                                            {user?.points}
                                        </span>
                                        <span className="text-lg font-black text-indigo-400 italic">M</span>
                                    </div>
                                </div>
                                <div className="text-[10px] font-bold text-white/60">
                                    #{user?.phone?.slice(-4)} • {new Date().toLocaleDateString('tr-TR')}
                                </div>
                            </div>

                            {/* QR Code */}
                            <button 
                                onClick={() => setShowQR(!showQR)}
                                className="bg-white p-4 rounded-[36px] shadow-2xl hover:scale-105 transition-transform active:scale-95"
                            >
                                <QRCode 
                                    value={user?.id || "motto"} 
                                    size={90} 
                                    level="H" 
                                    fgColor="#05070a"
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 📊 TIER PROGRESS */}
                {tier.next !== 'MAX' && (
                    <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-black text-white">
                                    {tier.next} Seviyesine Yüksel
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    {tier.goal - (user?.lifetimePoints || 0)} M-Coin daha kazanın
                                </p>
                            </div>
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center shadow-lg`}>
                                <Target size={24} className="text-white" />
                            </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
                            <div 
                                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${tier.gradient} rounded-full transition-all duration-1000`}
                                style={{ width: `${Math.min(tier.progress, 100)}%` }}
                            />
                        </div>
                        
                        <div className="flex justify-between text-xs">
                            <span className="font-bold text-slate-400">{user?.lifetimePoints || 0} M</span>
                            <span className="font-bold text-slate-400">{tier.goal} M</span>
                        </div>
                    </div>
                )}

                {/* 🎁 BENEFITS */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-[28px] p-5 text-center space-y-3">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto">
                            <TrendingUp size={24} className="text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-lg font-black text-white">{tier.benefit}</p>
                            <p className="text-[10px] text-slate-500 font-bold mt-1">Bonus Kazanç</p>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-[28px] p-5 text-center space-y-3">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto">
                            <Coffee size={24} className="text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-lg font-black text-white">{user?.history?.length || 0}</p>
                            <p className="text-[10px] text-slate-500 font-bold mt-1">İşlem</p>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-[28px] p-5 text-center space-y-3">
                        <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center mx-auto">
                            <Heart size={24} className="text-violet-400" />
                        </div>
                        <div>
                            <p className="text-lg font-black text-white">{user?.lifetimePoints || 0}</p>
                            <p className="text-[10px] text-slate-500 font-bold mt-1">Toplam Puan</p>
                        </div>
                    </div>
                </div>

                {/* TAB SWITCHER */}
                <div className="flex p-2 bg-white/5 border border-white/10 rounded-[28px]">
                    <button 
                        onClick={() => setActiveTab('home')} 
                        className={`flex-1 py-4 text-xs font-black rounded-[24px] transition-all ${
                            activeTab === 'home' 
                                ? 'bg-white text-black shadow-xl' 
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        🎁 HEDİYELER
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')} 
                        className={`flex-1 py-4 text-xs font-black rounded-[24px] transition-all ${
                            activeTab === 'history' 
                                ? 'bg-white text-black shadow-xl' 
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        📜 GEÇMİŞ
                    </button>
                </div>

                {/* CONTENT */}
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                    {activeTab === 'home' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {[
                                { name: 'Filtre Kahve', points: 120, icon: Coffee, color: 'from-orange-500 to-amber-600' },
                                { name: 'Latte Art', points: 130, icon: Coffee, color: 'from-indigo-500 to-violet-600' },
                                { name: 'Soğuk Kahve', points: 140, icon: Package, color: 'from-cyan-500 to-blue-600' },
                                { name: 'Tatlı Hediye', points: 150, icon: Gift, color: 'from-pink-500 to-rose-600' }
                            ].map((item, i) => {
                                const Icon = item.icon;
                                return (
                                    <button 
                                        key={i}
                                        className="group relative p-6 rounded-[32px] bg-white/5 border-2 border-white/10 hover:border-white/20 transition-all text-left overflow-hidden"
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                                        <div className="relative z-10 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-14 h-14 rounded-[22px] bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                                                    <Icon size={26} className="text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="text-base font-black text-white">
                                                        {item.name}
                                                    </h4>
                                                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                                        <Lock size={10} /> Kilidi Aç
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-white">
                                                    {item.points}
                                                </p>
                                                <p className="text-[10px] font-bold text-indigo-400">
                                                    M-Coin
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {user?.history?.slice().reverse().map((h, i) => (
                                <div 
                                    key={i} 
                                    className="p-6 bg-white/5 rounded-[32px] flex justify-between items-center border border-white/10 hover:bg-white/10 transition-all group"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-[22px] flex items-center justify-center ${
                                            h.points > 0 
                                                ? 'bg-emerald-500/10 text-emerald-400' 
                                                : 'bg-rose-500/10 text-rose-400'
                                        }`}>
                                            {h.points > 0 ? (
                                                <Plus size={24} strokeWidth={3} />
                                            ) : (
                                                <Star size={24} fill="currentColor" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-base font-black text-white">
                                                {h.action}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                                                <Clock size={10} />
                                                {h.date}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`text-2xl font-black ${
                                        h.points > 0 ? 'text-emerald-400' : 'text-rose-400'
                                    }`}>
                                        {h.points > 0 ? '+' : ''}{h.points}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 🔍 QR Modal */}
            {showQR && (
                <div 
                    className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-300"
                    onClick={() => setShowQR(false)}
                >
                    <div 
                        className="bg-white p-12 rounded-[48px] shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <QRCode 
                            value={user?.id || "motto"} 
                            size={280} 
                            level="H" 
                            fgColor="#05070a"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerLoyalty;