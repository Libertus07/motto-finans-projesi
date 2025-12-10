// App.jsx (BAKIM MODU EKLENMİŞ VERSİYON)

import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { Loader2, Menu, Coffee, Construction } from 'lucide-react'; // Construction ikonu eklendi

import { auth } from './services/firebase';
import { THEME } from './utils/constants';

import Sidebar from './components/Sidebar';
import AuthScreen from './components/AuthScreen';
import useFinanceData from './hooks/useFinanceData';

// 👇 BAKIM MODU AYARI (Açmak için true, kapatmak için false yapın)
const MAINTENANCE_MODE = true;

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
    
    // Yönlendirme Mantığı
    if (userRole === 'kasiyer') setActiveTab('pos');
    else if (userRole === 'garson') setActiveTab('tables'); 
    else setActiveTab('dashboard'); 

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
  
  // 👇 BAKIM MODU EKRANI
  if (MAINTENANCE_MODE) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl max-w-md w-full animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Construction size={40} className="text-amber-500 animate-pulse" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Sistem Bakımda</h1>
          <p className="text-slate-400 mb-6">
            Motto Coffee sistemi şu anda güncelleniyor. Daha iyi bir deneyim için kısa bir mola verdik.
          </p>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-xs text-slate-500 font-mono">Status: System Upgrade in Progress...</p>
            <div className="w-full bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-amber-500 h-full w-2/3 animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-6">Lütfen daha sonra tekrar deneyiniz.</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    // Yetki Kontrolü
    if (userRole === 'kasiyer' || userRole === 'garson') {
        const allowedTabs = userRole === 'garson' 
            ? ['tables', 'products'] 
            : ['pos', 'tables', 'transactions', 'debts', 'products', 'settings']; 
        
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
        return <Tables tables={tables} products={products} ingredients={ingredients} userRole={userRole} />;

      case 'transactions':
        return <Transactions transactions={transactions} quickActions={quickActions} isPatron={userRole === 'patron'}/>;
      
      case 'debts':
        return <Debts debts={debts} stats={stats} />;

      case 'products':
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