// pages/CashierSettings.jsx - PREMIUM VERSION
import React, { useState } from 'react';
import { 
    User, Shield, Info, LogOut, RefreshCw, Loader2,
    CheckCircle2, XCircle, Coffee, Clock, TrendingUp,
    Award, Zap, Settings, Bell, Eye, Lock, Unlock,
    Activity, BarChart3, Package, Users
} from 'lucide-react';
import { writeBatch, doc } from 'firebase/firestore';
import { db, appId } from '../services/firebase'; 
import { INITIAL_TABLES } from '../utils/constants'; 
import ConfirmationModal from '../components/ConfirmationModal';
import InfoModal from '../components/InfoModal';

const CURRENT_SHOP_ID = 'motto_coffee_sube_01';

const CashierSettings = () => {
    const [loading, setLoading] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [infoModal, setInfoModal] = useState({ 
        isOpen: false, type: 'success', title: '', message: '' 
    });
    const [activeSection, setActiveSection] = useState('profile');
    
    const handleLogout = () => {
        window.location.reload();
    };

    const handleRefreshTables = async () => {
        setLoading(true);
        
        try {
            const batch = writeBatch(db);
            INITIAL_TABLES.forEach(t => {
                batch.set(
                    doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'tables', t.id), 
                    t
                );
            });
            await batch.commit();
            setInfoModal({ 
                isOpen: true, 
                type: 'success', 
                title: 'Başarılı', 
                message: 'Masalar varsayılan ayarlara döndürüldü ve güncellendi.' 
            });
        } catch (error) {
            console.error(error);
            setInfoModal({ 
                isOpen: true, 
                type: 'error', 
                title: 'Hata', 
                message: error.message 
            });
        } finally {
            setLoading(false);
            setIsConfirmOpen(false);
        }
    };

    // MOCK DATA - Gerçek uygulamada backend'den gelecek
    const employeeStats = {
        todaySales: 12,
        totalRevenue: 4850,
        avgTransaction: 404,
        hoursWorked: 6.5
    };

    const permissions = [
        { id: 'pos', label: 'POS Satış Yapabilir', icon: Coffee, granted: true, color: 'emerald' },
        { id: 'tables', label: 'Masa Yönetimi', icon: Package, granted: true, color: 'blue' },
        { id: 'credit', label: 'Veresiye İşleyebilir', icon: TrendingUp, granted: true, color: 'violet' },
        { id: 'reports', label: 'Rapor Görüntüleme', icon: BarChart3, granted: false, color: 'amber' },
        { id: 'settings', label: 'Ciro Hedefi Değiştirme', icon: Settings, granted: false, color: 'rose' },
        { id: 'admin', label: 'Yönetici Paneli', icon: Shield, granted: false, color: 'red' }
    ];

    const sections = [
        { id: 'profile', label: 'Profil', icon: User },
        { id: 'permissions', label: 'Yetkiler', icon: Shield },
        { id: 'tools', label: 'Araçlar', icon: Settings }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#05070a] via-[#0a0d14] to-[#05070a] pb-20">
            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleRefreshTables}
                title="Masaları Yenile"
                message="Masalar yeniden yapılandırılacak (Mevcut siparişler silinebilir). Onaylıyor musunuz?"
                type="warning"
                loading={loading}
            />
            
            <InfoModal 
                isOpen={infoModal.isOpen} 
                onClose={() => setInfoModal({ ...infoModal, isOpen: false })} 
                type={infoModal.type} 
                title={infoModal.title} 
                message={infoModal.message}
            />

            {/* 🎨 HEADER */}
            <div className="sticky top-0 z-40 backdrop-blur-2xl bg-[#05070a]/90 border-b border-white/5">
                <div className="max-w-6xl mx-auto px-6 py-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-[24px] bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center shadow-2xl shadow-emerald-600/30">
                                <User size={28} className="text-white" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-white tracking-tight">
                                    Personel Ayarları
                                </h1>
                                <p className="text-xs text-slate-400 font-medium mt-1">
                                    Kasiyer paneli ve yetkilendirme
                                </p>
                            </div>
                        </div>

                        {/* STATUS */}
                        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <div>
                                <p className="text-xs font-bold text-emerald-400 leading-none">
                                    ÇEVRİMİÇİ
                                </p>
                                <p className="text-[10px] text-slate-500 leading-none mt-0.5">
                                    Aktif vardiya
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* TAB NAVIGATION */}
                    <div className="flex gap-2 mt-6">
                        {sections.map(section => {
                            const Icon = section.icon;
                            const isActive = activeSection === section.id;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`
                                        relative flex items-center gap-2 px-6 py-3 rounded-2xl
                                        font-bold text-sm transition-all
                                        ${isActive 
                                            ? 'bg-white text-black shadow-xl' 
                                            : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                                        }
                                    `}
                                >
                                    <Icon size={16} />
                                    {section.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* 📄 CONTENT */}
            <div className="max-w-6xl mx-auto px-6 py-8">
                
                {/* 👤 PROFILE SECTION */}
                {activeSection === 'profile' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        
                        {/* PROFILE CARD */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[32px] p-8">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl" />
                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-8">
                                    <div className="flex items-center gap-6">
                                        <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center shadow-2xl shadow-emerald-600/30 border-4 border-white/10">
                                            <User size={44} className="text-white" strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-white">
                                                Kasiyer
                                            </h2>
                                            <div className="flex items-center gap-3 mt-2">
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span className="text-xs font-bold text-emerald-400">
                                                        Çevrimiçi
                                                    </span>
                                                </div>
                                                <span className="text-xs text-slate-400 font-medium">
                                                    Motto Coffee • Vardiya 1
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-400 uppercase font-bold">
                                            Personel ID
                                        </p>
                                        <p className="text-lg font-black text-white mt-1 font-mono">
                                            #CSH001
                                        </p>
                                    </div>
                                </div>

                                {/* STATS GRID */}
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 text-center">
                                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                            <Coffee size={24} className="text-blue-400" />
                                        </div>
                                        <p className="text-2xl font-black text-white">
                                            {employeeStats.todaySales}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Bugün Satış
                                        </p>
                                    </div>

                                    <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 text-center">
                                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                            <TrendingUp size={24} className="text-emerald-400" />
                                        </div>
                                        <p className="text-2xl font-black text-white">
                                            {employeeStats.totalRevenue}₺
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Toplam Ciro
                                        </p>
                                    </div>

                                    <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 text-center">
                                        <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                            <BarChart3 size={24} className="text-violet-400" />
                                        </div>
                                        <p className="text-2xl font-black text-white">
                                            {employeeStats.avgTransaction}₺
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Ort. İşlem
                                        </p>
                                    </div>

                                    <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 text-center">
                                        <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                            <Clock size={24} className="text-amber-400" />
                                        </div>
                                        <p className="text-2xl font-black text-white">
                                            {employeeStats.hoursWorked}h
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Çalışma Saati
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* QUICK INFO */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white/5 border border-white/10 rounded-[28px] p-6">
                                <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
                                    <Activity size={16} className="text-indigo-400" />
                                    Vardiya Bilgileri
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Başlangıç</span>
                                        <span className="text-white font-bold">09:00</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Mola</span>
                                        <span className="text-white font-bold">13:00 - 14:00</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Bitiş</span>
                                        <span className="text-white font-bold">18:00</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-[28px] p-6">
                                <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
                                    <Award size={16} className="text-amber-400" />
                                    Performans
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Müşteri Memnuniyeti</span>
                                        <span className="text-emerald-400 font-bold">98%</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Hız Skoru</span>
                                        <span className="text-blue-400 font-bold">Mükemmel</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Haftalık Hedef</span>
                                        <span className="text-amber-400 font-bold">75/100</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 🛡️ PERMISSIONS SECTION */}
                {activeSection === 'permissions' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[32px] p-8">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-blue-600 to-cyan-700 flex items-center justify-center shadow-2xl shadow-blue-600/30">
                                        <Shield size={32} className="text-white" strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white">
                                            Yetki Durumu
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Kasiyer rolü için verilen yetkiler
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {permissions.map(perm => {
                                        const Icon = perm.icon;
                                        const StatusIcon = perm.granted ? Unlock : Lock;
                                        return (
                                            <div 
                                                key={perm.id}
                                                className={`
                                                    bg-white/5 border-2 rounded-[24px] p-5
                                                    transition-all
                                                    ${perm.granted 
                                                        ? 'border-emerald-500/30 hover:border-emerald-500/50' 
                                                        : 'border-rose-500/20 hover:border-rose-500/30'}
                                                `}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-12 h-12 rounded-2xl bg-${perm.color}-500/10 flex items-center justify-center`}>
                                                            <Icon size={22} className={`text-${perm.color}-400`} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white">
                                                                {perm.label}
                                                            </p>
                                                            <p className={`text-xs font-bold mt-0.5 ${
                                                                perm.granted ? 'text-emerald-400' : 'text-rose-400'
                                                            }`}>
                                                                {perm.granted ? 'Aktif' : 'Kısıtlı'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <StatusIcon 
                                                        size={20} 
                                                        className={perm.granted ? 'text-emerald-400' : 'text-rose-400'} 
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 🔧 TOOLS SECTION */}
                {activeSection === 'tools' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        
                        {/* INFO BANNER */}
                        <div className="bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border-2 border-indigo-500/30 rounded-[32px] p-6 flex items-start gap-4">
                            <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center shrink-0">
                                <Info size={24} className="text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-indigo-400">
                                    Sistem Araçları
                                </h3>
                                <p className="text-xs text-slate-300 mt-2">
                                    Eğer masalar ekranda görünmüyorsa veya hatalıysa, yenileme aracını kullanarak sistemi güncelleyebilirsiniz.
                                </p>
                            </div>
                        </div>

                        {/* TOOLS CARD */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[32px] p-8">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-500/10 to-transparent rounded-full blur-3xl" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-2xl shadow-violet-600/30">
                                        <RefreshCw size={32} className="text-white" strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white">
                                            Masa Yenileme
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Masaları varsayılan ayarlara döndür
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-white/5 border border-white/10 rounded-[24px] p-6 mb-6">
                                    <h4 className="text-sm font-bold text-white mb-3">
                                        Bu işlem ne yapar?
                                    </h4>
                                    <ul className="space-y-2 text-xs text-slate-400">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                                            Tüm masalar varsayılan duruma döner
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                                            Aktif siparişler korunur
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <XCircle size={14} className="text-amber-400 shrink-0" />
                                            Masa düzenlemeleri sıfırlanır
                                        </li>
                                    </ul>
                                </div>

                                <button
                                    onClick={() => setIsConfirmOpen(true)}
                                    disabled={loading}
                                    className="w-full h-16 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-[24px] font-black text-base flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 shadow-2xl shadow-violet-600/30"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin" size={24} />
                                    ) : (
                                        <>
                                            <RefreshCw size={24} />
                                            MASALARI YENİLE
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 🚪 LOGOUT BUTTON - Always visible */}
                <button
                    onClick={handleLogout}
                    className="w-full h-16 bg-gradient-to-r from-rose-600/20 to-red-600/20 hover:from-rose-600 hover:to-red-600 border-2 border-rose-500/30 hover:border-rose-500 text-rose-400 hover:text-white rounded-[24px] font-black text-base flex items-center justify-center gap-3 transition-all group mt-8"
                >
                    <LogOut size={24} className="group-hover:-translate-x-1 transition-transform" />
                    SİSTEMDEN ÇIKIŞ YAP
                </button>
            </div>
        </div>
    );
};

export default CashierSettings;