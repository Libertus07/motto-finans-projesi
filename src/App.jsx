// App.jsx (3 ROLLÜ YETKİLENDİRME VE YÖNLENDİRME DÜZELTİLDİ)

import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { Loader2, Menu, Coffee } from 'lucide-react';

import { auth } from './services/firebase';
import { THEME } from './utils/constants';

import Sidebar from './components/Sidebar';
import AuthScreen from './components/AuthScreen';
import useFinanceData from './hooks/useFinanceData';

// Sayfalar dinamik yukleniyor (Lazy Loading)
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

export default function PatronFinancePro() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [activeTab, setActiveTab] = useState('pos'); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Verileri Hook'tan Çek
  const {
    transactions, products, investments, debts, ingredients, quickActions, tables,
    fixedCosts, setFixedCosts, monthlyGoal, setMonthlyGoal, marketRates,
    stats, calculateFutureCashflow, getProfitabilityWarnings,
  } = useFinanceData(user); 

  // Auth ve Yönlendirme
  useEffect(() => {
    if (userRole === null) { setLoading(false); return; }
    
    // 👇 YÖNLENDİRME MANTIĞI GÜNCELLENDİ
    if (userRole === 'kasiyer') setActiveTab('pos');
    else if (userRole === 'garson') setActiveTab('tables'); // Garson direkt masalara
    else setActiveTab('dashboard'); // Patron dashboard'a

    const initAuth = async () => { 
        try { await signInAnonymously(auth); } 
        catch (e) { console.error("Anonim giriş hatası:", e); } 
    };
    initAuth();

    return onAuthStateChanged(auth, (currentUser) => { 
        if (currentUser) {
            localStorage.setItem('motto_anon_uid', currentUser.uid);
        } else {
             localStorage.removeItem('motto_anon_uid');
        }
        setUser(currentUser); 
        setLoading(false); 
    });
  }, [userRole]);
  
  const renderContent = () => {
    // 👇 YETKİ KONTROLÜ (Kasiyer ve Garson)
    if (userRole === 'kasiyer' || userRole === 'garson') {
        // İzin verilen sekmeler listesi
        const allowedTabs = userRole === 'garson' 
            ? ['tables', 'products'] // Garson sadece Masa ve Menü
            : ['pos', 'tables', 'transactions', 'debts', 'products', 'settings']; // Kasiyer
        
        if (!allowedTabs.includes(activeTab)) {
             return (
                <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500 space-y-4">
                    <div className="p-4 bg-slate-800 rounded-full"><Coffee size={40} className="text-slate-600"/></div>
                    <p>Bu alana erişim yetkiniz yok.</p>
                    <button onClick={() => setActiveTab(userRole === 'garson' ? 'tables' : 'pos')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">Ana Ekrana Dön</button>
                </div>
             );
        }
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard stats={stats} transactions={transactions} monthlyGoal={monthlyGoal} calculateFutureCashflow={calculateFutureCashflow} getProfitabilityWarnings={() => getProfitabilityWarnings(products)} tables={tables}/>;
      
      case 'zreport':
        return <ZReport transactions={transactions} />;
      
      case 'pos': 
        return <CashierPOS products={products} ingredients={ingredients} />; 

      case 'tables':
        // 👇 userRole prop'u eklendi (Garsonun ödeme alamaması için)
        return <Tables tables={tables} products={products} ingredients={ingredients} userRole={userRole} />;

      case 'transactions':
        return <Transactions transactions={transactions} quickActions={quickActions} isPatron={userRole === 'patron'}/>;
      
      case 'debts':
        return <Debts debts={debts} stats={stats} />;

      case 'products':
          // 👇 userRole prop'u eklendi
          return <Products products={products} isPatron={userRole === 'patron'} userRole={userRole} />;

      case 'inventory': 
          return <Inventory ingredients={ingredients} debts={debts} />;

      case 'recipe':
          return <Recipe ingredients={ingredients} products={products} />;
          
      case 'investments':
          return <Investments investments={investments} marketRates={marketRates} />;
      
      case 'stats':
          return <Stats transactions={transactions} products={products} />;

      case 'assistant':
          return <Assistant stats={stats} />;

      case 'settings':
          if (userRole === 'patron') {
              return <Settings monthlyGoal={monthlyGoal} setMonthlyGoal={setMonthlyGoal} fixedCosts={fixedCosts} setFixedCosts={setFixedCosts} />;
          }
          return <CashierSettings />;

      default:
        return <div className="text-center py-20 text-slate-500">Sayfa Bulunamadi.</div>;
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-indigo-500"><Loader2 className="animate-spin" size={40}/></div>;
  if (userRole === null) return <AuthScreen setUserRole={setUserRole} />;

  return (
    <div className={`min-h-screen ${THEME.bg} text-slate-200 font-sans flex`}>
      <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 rounded-lg text-white shadow-lg border border-slate-700"><Menu size={24} /></button>
      <div className={`fixed inset-0 bg-black/50 z-40 md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`} onClick={() => setIsMobileMenuOpen(false)}></div>
      
      {/* 👇 userRole prop'u eklendi */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isMobile={!isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} userRole={userRole} />

      <main className={`flex-1 h-screen overflow-y-auto w-full relative ${isMobileMenuOpen ? 'overflow-hidden' : ''}`}>
        <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto">
          <Suspense fallback={<div className="text-center py-20 text-indigo-400"><Loader2 className="animate-spin inline-block mr-2"/> Sayfa Yukleniyor...</div>}>
            {renderContent()}
          </Suspense>
        </div>
      </main>
    </div>
  );
}