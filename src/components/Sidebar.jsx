import React from 'react';
import { LayoutDashboard, Wallet, FileText, Coffee, ChefHat, Coins, BarChart3, MessageSquare, Settings, User, Calculator, LayoutGrid } from 'lucide-react';
import { THEME } from '../utils/constants';

const Sidebar = ({ activeTab, setActiveTab, isMobile, setIsMobileMenuOpen, userRole }) => {
  const menuItems = [
    // 1. PATRON ÖZEL
    { id: 'dashboard', label: 'Genel Bakış', icon: LayoutDashboard, roles: ['patron'] },

    // 2. YENİ EKLENEN RAPOR (SADECE PATRON)
    { id: 'zreport', label: 'Z Raporu', icon: FileText, roles: ['patron'] },
    
    // 3. SATIŞ EKRANI (AYRI)
    { id: 'pos', label: 'Satış Terminali (POS)', icon: Calculator, roles: ['patron', 'kasiyer'] },

    // 4. MASA YÖNETİMİ EKRANI (AYRI)
    { id: 'tables', label: 'Masa Yönetimi', icon: LayoutGrid, roles: ['patron', 'kasiyer'] },
    
    // 5. GELİR-GİDER EKRANI (AYRI)
    { id: 'transactions', label: 'Kasa Hareketleri', icon: Wallet, roles: ['patron', 'kasiyer'] },

    // 6. BORÇ EKRANI (AYRI)
    { id: 'debts', label: 'Veresiye Defteri', icon: FileText, roles: ['patron', 'kasiyer'] }, 
    
    // Diğerleri...
    { id: 'products', label: 'Menü & Ürün', icon: Coffee, roles: ['patron', 'kasiyer'] },
    { id: 'recipe', label: 'Maliyet', icon: ChefHat, roles: ['patron'] },
    { id: 'investments', label: 'Yatırımlar', icon: Coins, roles: ['patron'] },
    { id: 'stats', label: 'Raporlar', icon: BarChart3, roles: ['patron'] },
    { id: 'assistant', label: 'Asistan (AI)', icon: MessageSquare, roles: ['patron'] },
    { id: 'settings', label: 'Ayarlar', icon: Settings, roles: ['patron', 'kasiyer'] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(userRole));

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
        <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 flex items-center gap-3">
          <div className={`p-2 rounded-full ${userRole === 'patron' ? 'bg-indigo-700' : 'bg-emerald-700'}`}><User size={16} className="text-white"/></div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{userRole === 'patron' ? 'Patron' : 'Kasiyer'}</p>
            <p className="text-[10px] text-slate-500 truncate">{userRole === 'patron' ? 'Tam Yetki' : 'Satış & Kasa'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;