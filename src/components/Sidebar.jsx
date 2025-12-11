// components/Sidebar.jsx

import React from 'react';
import { LayoutDashboard, Wallet, FileText, Coffee, ChefHat, Coins, BarChart3, MessageSquare, Settings, User, Calculator, LayoutGrid, Package, Users, LogOut } from 'lucide-react'; // LogOut eklendi
import { THEME } from '../utils/constants';

const Sidebar = ({ activeTab, setActiveTab, isMobile, setIsMobileMenuOpen, userRole }) => {
  const menuItems = [
    // 1. PATRON ÖZEL
    { id: 'dashboard', label: 'Genel Bakış', icon: LayoutDashboard, roles: ['patron'] },
    { id: 'zreport', label: 'Z Raporu', icon: FileText, roles: ['patron'] },
    
    // 2. SATIŞ EKRANI
    { id: 'pos', label: 'Satış Terminali (POS)', icon: Calculator, roles: ['patron', 'kasiyer'] },

    // 3. MASA YÖNETİMİ
    { id: 'tables', label: 'Masa Yönetimi', icon: LayoutGrid, roles: ['patron', 'kasiyer', 'garson'] },
    
    // 4. FİNANSAL İŞLEMLER
    { id: 'transactions', label: 'Kasa Hareketleri', icon: Wallet, roles: ['patron', 'kasiyer'] },
    { id: 'debts', label: 'Veresiye Defteri', icon: FileText, roles: ['patron', 'kasiyer'] }, 
    
    // 5. ÜRÜN VE STOK
    { id: 'products', label: 'Menü & Ürün', icon: Coffee, roles: ['patron', 'kasiyer', 'garson'] },
    
    // 6. YÖNETİMSEL (SADECE PATRON)
    { id: 'inventory', label: 'Stok & Tedarikçi', icon: Package, roles: ['patron'] },
    { id: 'staff', label: 'Personel Yönetimi', icon: Users, roles: ['patron'] },
    
    { id: 'recipe', label: 'Maliyet & Reçete', icon: ChefHat, roles: ['patron'] },
    { id: 'investments', label: 'Yatırımlar', icon: Coins, roles: ['patron'] },
    { id: 'stats', label: 'Raporlar', icon: BarChart3, roles: ['patron'] },
    { id: 'assistant', label: 'Asistan (AI)', icon: MessageSquare, roles: ['patron'] },

    { id: 'settings', label: 'Ayarlar', icon: Settings, roles: ['patron', 'kasiyer'] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(userRole));

  // Rol Rengi ve Yazısını Belirleyen Yardımcı Fonksiyon
  const getRoleUI = () => {
      if (userRole === 'patron') return { color: 'bg-indigo-700', label: 'Patron', desc: 'Tam Yetki' };
      if (userRole === 'kasiyer') return { color: 'bg-emerald-700', label: 'Kasiyer', desc: 'Satış & Kasa' };
      // Varsayılan (Garson)
      return { color: 'bg-rose-700', label: 'Garson', desc: 'Sipariş & Servis' };
  };

  const roleUI = getRoleUI();

  // Çıkış Fonksiyonu
  const handleLogout = () => {
      localStorage.removeItem('motto_user_role'); // Hafızadan sil
      window.location.reload(); // Sayfayı yenile (Auth ekranı gelecek)
  };

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 ${THEME.bg} border-r ${THEME.border} transition-transform duration-300 transform ${isMobile ? '-translate-x-full' : 'translate-x-0'} md:translate-x-0 md:static flex flex-col`}>
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="bg-indigo-600 p-2 rounded-lg"><LayoutDashboard size={20} className="text-white"/></div>
        <div>
          <h1 className="font-bold text-white text-lg tracking-tight">Motto Coffee</h1>
          <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">Yönetim Paneli</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 space-y-1 px-3 custom-scrollbar">
        {visibleItems.map(item => (
          <button
            key={item.id}
            onClick={() => { setActiveTab(item.id); if(isMobile) setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === item.id ? 'bg-indigo-600/10 text-indigo-400 font-bold border border-indigo-600/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
          >
            <item.icon size={18} />
            <span className="text-sm">{item.label}</span>
            {activeTab === item.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>}
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-full ${roleUI.color}`}>
            <User size={16} className="text-white"/>
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{roleUI.label}</p>
            <p className="text-[10px] text-slate-500 truncate">{roleUI.desc}</p>
          </div>
        </div>

        {/* 👇 ÇIKIŞ BUTONU EKLENDİ 👇 */}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-red-900/20 text-red-400 hover:bg-red-900/40 hover:text-red-300 transition-colors border border-red-900/30 text-xs font-bold"
        >
          <LogOut size={14} />
          ÇIKIŞ YAP
        </button>
      </div>
    </div>
  );
};

export default Sidebar;