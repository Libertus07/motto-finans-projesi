import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, FileText, Coffee, ChefHat, Coins,
    BarChart3, MessageSquare, Settings,
    LayoutGrid, Package, Users, LogOut, ScrollText,
    MonitorCheck, Wallet, X, Zap
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { THEME } from '../utils/constants';

import { usePermissions } from '../hooks/usePermissions';
import { PERMISSIONS, ROLE_LABELS } from '../utils/roles';

interface SidebarProps {
    isMobile: boolean;
    setIsMobileMenuOpen: (isOpen: boolean) => void;
    userRole?: string; // Made optional as we use hook now
}

const Sidebar: React.FC<SidebarProps> = ({ isMobile, setIsMobileMenuOpen, userRole }) => {

    // Çıkış Modalı State'i
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // 🔥 GÜNCELLENMİŞ GÜVENLİ ÇIKIŞ FONKSİYONU
    const confirmLogout = async () => {
        try {
            // 1. Firebase oturumunu kapat
            await signOut(auth);

            // 2. Yerel hafızadaki rol bilgisini sil (Çok Önemli!)
            localStorage.removeItem('motto_user_role');

            // 3. Sayfayı yenile (AuthScreen'e düşmesi için en temiz yol)
            window.location.reload();
        } catch (error) {
            console.error("Çıkış hatası:", error);
            alert("Çıkış yapılırken bir hata oluştu.");
        }
    };

    const { hasPermission, userRole: currentRole } = usePermissions(userRole);

    const menuItems = [
        { id: 'dashboard', label: 'Genel Bakış', icon: LayoutDashboard, permission: PERMISSIONS.VIEW_FINANCIALS },
        { id: 'zreport', label: 'Z Raporu', icon: FileText, permission: PERMISSIONS.VIEW_FINANCIALS },
        { id: 'pos', label: 'Satış Terminali', icon: MonitorCheck, permission: PERMISSIONS.POS_ACCESS },
        { id: 'tables', label: 'Masa Yönetimi', icon: LayoutGrid, permission: PERMISSIONS.TABLE_VIEW },
        { id: 'transactions', label: 'Kasa Hareketleri', icon: Wallet, permission: PERMISSIONS.TRANSACTION_MANAGE }, // Kasiyer/Patron
        { id: 'debts', label: 'Veresiye Defteri', icon: ScrollText, permission: PERMISSIONS.TRANSACTION_MANAGE },
        { id: 'customerDirectory', label: 'Müşteri Rehberi', icon: Users, permission: PERMISSIONS.MANAGE_CUSTOMERS },
        { id: 'products', label: 'Menü & Ürün', icon: Coffee, permission: PERMISSIONS.ORDER_CREATE }, // Everyone
        { id: 'inventory', label: 'Stok & Tedarikçi', icon: Package, permission: PERMISSIONS.INVENTORY_MANAGE },
        { id: 'staff', label: 'Personel Yönetimi', icon: Users, permission: PERMISSIONS.STAFF_MANAGE },
        { id: 'recipe', label: 'Maliyet & Reçete', icon: ChefHat, permission: PERMISSIONS.RECIPE_MANAGE },
        { id: 'investments', label: 'Varlıklar', icon: Coins, permission: PERMISSIONS.VIEW_FINANCIALS },
        { id: 'stats', label: 'Raporlar', icon: BarChart3, permission: PERMISSIONS.REPORT_VIEW },
        { id: 'assistant', label: 'Asistan (AI)', icon: MessageSquare, permission: PERMISSIONS.VIEW_FINANCIALS },
        { id: 'settings', label: 'Ayarlar', icon: Settings, permission: PERMISSIONS.ORDER_CREATE }, // Everyone creates orders so everyone accesses basic settings
    ];

    const visibleItems = menuItems.filter(item => hasPermission(item.permission));

    return (
        <>
            {/* --- SIDEBAR --- */}
            <div className={`
            fixed inset-y-0 left-0 z-50 
            w-72 ${THEME.bg} border-r border-slate-800 
            transition-transform duration-300 transform 
            ${isMobile ? '-translate-x-full' : 'translate-x-0'} 
            md:translate-x-0 md:static flex flex-col
        `}>
                {/* LOGO */}
                <div className="p-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                            MOTTO <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">POS</span>
                        </h1>
                        <p className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase">
                            {ROLE_LABELS[currentRole] || 'Kullanıcı'}
                        </p>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* MENÜ */}
                <div className="flex-1 overflow-y-auto py-4 space-y-1 px-3 custom-scrollbar">
                    {visibleItems.map(item => (
                        <NavLink
                            key={item.id}
                            to={item.id}
                            onClick={() => isMobile && setIsMobileMenuOpen(false)}
                            className={({ isActive }) => `
                        w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-sm font-medium
                        ${isActive
                                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/20'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                }
                    `}
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-500'} />
                                    <span>{item.label}</span>
                                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>

                {/* ALT ÇIKIŞ ALANI */}
                <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                    <button
                        onClick={() => setShowLogoutModal(true)} // Modalı aç
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-sm border border-red-500/10 transition-all active:scale-95 group"
                    >
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                        GÜVENLİ ÇIKIŞ
                    </button>
                    <div className="mt-3 text-center">
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                            <Zap size={10} className="fill-slate-700" /> Sistem Online
                        </p>
                    </div>
                </div>
            </div>

            {/* --- ÖZEL ÇIKIŞ MODALI (PREMIUM UI) --- */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Arka Plan Blur */}
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setShowLogoutModal(false)}
                    ></div>

                    {/* Modal Kutusu */}
                    <div className="relative bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl w-full max-w-sm animate-in zoom-in-95 duration-300">
                        <div className="flex flex-col items-center text-center">
                            {/* İkon */}
                            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                                <LogOut size={32} className="text-red-500 ml-1" />
                            </div>

                            {/* Başlık ve Metin */}
                            <h3 className="text-xl font-bold text-white mb-2">Oturumu Kapat</h3>
                            <p className="text-sm text-slate-400 mb-6">
                                MottoPOS sisteminden çıkış yapmak üzeresiniz.<br />Onaylıyor musunuz?
                            </p>

                            {/* Butonlar */}
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setShowLogoutModal(false)}
                                    className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors border border-slate-700"
                                >
                                    Vazgeç
                                </button>
                                <button
                                    onClick={confirmLogout}
                                    className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-colors shadow-lg shadow-red-500/20"
                                >
                                    ÇIKIŞ YAP
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;
