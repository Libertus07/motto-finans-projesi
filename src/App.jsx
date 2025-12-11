// src/App.jsx (GÜNCELLENDİ: Kasiyer'e Ürün Ekleme Yetkisi Tanımlandı)

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { Loader2, Menu } from 'lucide-react'; 

import { auth } from './services/firebase';
import { THEME } from './utils/constants';

import Sidebar from './components/Sidebar';
import AuthScreen from './components/AuthScreen';
import useFinanceData from './hooks/useFinanceData';
import InfoModal from './components/InfoModal';
import MaintenancePage from './components/MaintenancePage';

const MAINTENANCE_MODE = false;

// Sayfalar dinamik yukleniyor
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Debts = lazy(() => import('./pages/Debts'));
const Products = lazy(() => import('./pages/Products'));
const Recipe = lazy(() => import('./pages/Recipe'));
const Investments = lazy(() => import('./pages/Investments'));
const Stats = lazy(() => import('./pages/Stats'));
const Assistant = lazy(() => import('./pages/Assistant'));
const Settings = lazy(() => import('./pages/Settings'));
const CashierPOS = lazy(() => import('./pages/CashierPOS'));
const Tables = lazy(() => import('./pages/Tables'));
const CashierSettings = lazy(() => import('./pages/CashierSettings'));
const ZReport = lazy(() => import('./pages/ZReport'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Staff = lazy(() => import('./pages/Staff'));

export default function PatronFinancePro() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [activeTab, setActiveTab] = useState('pos'); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [salaryNotification, setSalaryNotification] = useState({ isOpen: false, names: '' });

  const {
    transactions, products, investments, debts, ingredients, quickActions, tables,
    fixedCosts, setFixedCosts, monthlyGoal, setMonthlyGoal, marketRates,
    stats, calculateFutureCashflow, getProfitabilityWarnings,
    staff, 
  } = useFinanceData(user); 

  useEffect(() => {
    // localStorage kontrolü kapalı (her seferinde giriş ekranı)
    const initAuth = async () => { 
        try { await signInAnonymously(auth); } 
        catch (e) { console.error("Anonim giriş hatası:", e); } 
    };
    initAuth();

    return onAuthStateChanged(auth, (currentUser) => { 
        if (currentUser) {
            setUser(currentUser);
        }
        setLoading(false); 
    });
  }, []);

  useEffect(() => {
    if (userRole) {
        localStorage.setItem('motto_user_role', userRole);
        if (activeTab === 'pos' && userRole === 'patron') setActiveTab('dashboard');
        if (userRole === 'kasiyer') setActiveTab('pos');
        if (userRole === 'garson') setActiveTab('tables');
    }
  }, [userRole]);

  useEffect(() => {
    if (userRole === 'patron' && staff && staff.length > 0) {
        const today = new Date().getDate();
        const pendingPayments = staff.filter(p => Number(p.salaryDay) === today);
        if (pendingPayments.length > 0) {
            const notificationKey = `salary_notified_${new Date().toDateString()}`;
            if (!sessionStorage.getItem(notificationKey)) {
                setSalaryNotification({ isOpen: true, names: pendingPayments.map(p => p.name).join(', ') });
                sessionStorage.setItem(notificationKey, 'true');
            }
        }
    }
  }, [staff, userRole]);
  
  if (MAINTENANCE_MODE) return <MaintenancePage />;

  const renderContent = () => {
    // 1. Yetki Kontrolü: Garson ve Kasiyerin görebileceği sayfalar
    if (userRole === 'kasiyer' || userRole === 'garson') {
        const allowedTabs = userRole === 'garson' 
            ? ['tables', 'products'] // Garson sadece Masalar ve Ürünleri görür
            : ['pos', 'tables', 'transactions', 'debts', 'products', 'settings']; // Kasiyer yetkileri
        
        if (!allowedTabs.includes(activeTab)) return <div className="text-center py-20 text-slate-500">Yetkisiz Alan</div>;
    }

    // 2. Sayfa Yönlendirmeleri
    switch (activeTab) {
      case 'dashboard': return <Dashboard stats={stats} transactions={transactions} monthlyGoal={monthlyGoal} calculateFutureCashflow={calculateFutureCashflow} getProfitabilityWarnings={() => getProfitabilityWarnings(products)} tables={tables}/>;
      case 'zreport': return <ZReport transactions={transactions} />;
      case 'pos': return <CashierPOS products={products} ingredients={ingredients} />; 
      case 'tables': return <Tables tables={tables} products={products} ingredients={ingredients} userRole={userRole} />;
      case 'transactions': return <Transactions transactions={transactions} quickActions={quickActions} isPatron={userRole === 'patron'}/>;
      case 'debts': return <Debts debts={debts} stats={stats} />;
      
      // 👇 BURASI GÜNCELLENDİ: 'canEdit' yetkisi eklendi (Patron VEYA Kasiyer düzenleyebilir)
      case 'products': return (
          <Products 
            products={products} 
            isPatron={userRole === 'patron'} // Patron maliyetleri görür
            canEdit={userRole === 'patron' || userRole === 'kasiyer'} // Kasiyer ve Patron ekleme/silme yapabilir
            userRole={userRole} 
          />
      );
      
      case 'inventory': return <Inventory ingredients={ingredients} debts={debts} />;
      case 'recipe': return <Recipe ingredients={ingredients} products={products} />;
      case 'investments': return <Investments investments={investments} marketRates={marketRates} />;
      case 'stats': return <Stats transactions={transactions} products={products} />;
      case 'assistant': return <Assistant stats={stats} />;
      case 'staff': return <Staff staff={staff} />;
      case 'settings': return userRole === 'patron' ? <Settings monthlyGoal={monthlyGoal} setMonthlyGoal={setMonthlyGoal} fixedCosts={fixedCosts} setFixedCosts={setFixedCosts} /> : <CashierSettings />;
      default: return <div className="text-center py-20 text-slate-500">Sayfa Bulunamadi.</div>;
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-indigo-500"><Loader2 className="animate-spin" size={40}/></div>;
  if (!userRole) return <AuthScreen setUserRole={setUserRole} />;

  return (
    <div className={`min-h-screen ${THEME.bg} text-slate-200 font-sans flex`}>
      <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 rounded-lg text-white shadow-lg border border-slate-700"><Menu size={24} /></button>
      <div className={`fixed inset-0 bg-black/50 z-40 md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`} onClick={() => setIsMobileMenuOpen(false)}></div>
      
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isMobile={!isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} userRole={userRole} />

      <main className={`flex-1 h-screen overflow-y-auto w-full relative ${isMobileMenuOpen ? 'overflow-hidden' : ''}`}>
        <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto">
          <Suspense fallback={<div className="text-center py-20 text-indigo-400"><Loader2 className="animate-spin inline-block mr-2"/> Sayfa Yukleniyor...</div>}>
            {renderContent()}
          </Suspense>
        </div>
      </main>

      <InfoModal isOpen={salaryNotification.isOpen} onClose={() => setSalaryNotification({ ...salaryNotification, isOpen: false })} type="info" title="🔔 Maaş Günü Hatırlatması" message={`Bugün maaş günü:\n\n${salaryNotification.names}`} />
    </div>
  );
}