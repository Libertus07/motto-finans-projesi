// App.jsx (GÜNCELLEŞTİRİLMİŞ TAM İÇERİK)

import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
// Firebase veri çekme importları hook'a taşındı, sadece auth kaldı
import { Loader2, Menu, Coffee } from 'lucide-react';

import { auth } from './services/firebase';
import { THEME } from './utils/constants';

import Sidebar from './components/Sidebar';
import AuthScreen from './components/AuthScreen';
// 👇 Yeni Hook'u import et
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
  
  // 👇 TÜM VERİ DURUMLARI, LISTENER'LAR VE STATS HESAPLAMALARI HOOK'A TAŞINDI
  const {
    transactions, products, investments, debts, ingredients, quickActions, tables,
    fixedCosts, setFixedCosts, monthlyGoal, setMonthlyGoal, marketRates,
    stats, calculateFutureCashflow, getProfitabilityWarnings,
  } = useFinanceData(user); // Hook'u kullan

  // 1. Auth (Anonim Kullanıcıyı Kalıcı Hale Getirme Düzeltmesi)
  useEffect(() => {
    if (userRole === null) { setLoading(false); return; }
    
    if (userRole === 'kasiyer') setActiveTab('pos');
    else setActiveTab('dashboard');

    const initAuth = async () => { 
        try { 
            // KRİTİK: Firebase'i anonim olarak başlatıyoruz.
            // onAuthStateChanged içerisine persistence logic'i ekliyoruz.
            await signInAnonymously(auth); 
        } catch (e) { 
            console.error("Anonim giriş hatası:", e); 
        } 
    };
    initAuth();

    // KRİTİK DÜZELTME: onAuthStateChanged içinde UID'yi Local Storage'a kaydetme
    return onAuthStateChanged(auth, (currentUser) => { 
        if (currentUser) {
            // Mevcut veya yeni anonim UID'yi Local Storage'a kaydet
            localStorage.setItem('motto_anon_uid', currentUser.uid);
        } else {
             // Oturum kapandıysa UID'yi temizle (gerekirse)
             localStorage.removeItem('motto_anon_uid');
        }
        setUser(currentUser); 
        setLoading(false); 
    });
  }, [userRole]);

  // 2. Veri Çekme (TÜMÜ HOOK'A TAŞINDI, BU BÖLÜM SİLİNDİ)

  // 3. Istatistikler (TÜMÜ HOOK'A TAŞINDI, BU BÖLÜM SİLİNDİ)

  // 4. Diğer Hesaplamalar (TÜMÜ HOOK'A TAŞINDI, BU BÖLÜM SİLİNDİ)
  
  const renderContent = () => {
    // KASİYER YETKİ KONTROLÜ
    if (userRole === 'kasiyer') {
        const restrictedTabs = ['dashboard', 'recipe', 'investments', 'stats', 'assistant', 'zreport']; 
        
        if (restrictedTabs.includes(activeTab)) {
             return (
                <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500 space-y-4">
                    <div className="p-4 bg-slate-800 rounded-full"><Coffee size={40} className="text-slate-600"/></div>
                    <p>Bu alana sadece Patron erisebilir.</p>
                    <button onClick={() => setActiveTab('pos')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">Satis Ekranina Don</button>
                </div>
             );
        }
    }

    switch (activeTab) {
      case 'dashboard':
        // getProfitabilityWarnings fonksiyonunu hook'tan alıp Products'ı parametre olarak gönderiyoruz.
        return <Dashboard stats={stats} transactions={transactions} monthlyGoal={monthlyGoal} calculateFutureCashflow={calculateFutureCashflow} getProfitabilityWarnings={() => getProfitabilityWarnings(products)} tables={tables}/>;
      
      case 'zreport':
        return <ZReport transactions={transactions} />;
      
      case 'pos': 
        return <CashierPOS products={products} ingredients={ingredients} />; 

      case 'tables':
        return <Tables tables={tables} products={products} ingredients={ingredients} />;

      case 'transactions':
        return <Transactions transactions={transactions} quickActions={quickActions} isPatron={userRole === 'patron'}/>;
      
      case 'debts':
        return <Debts debts={debts} stats={stats} />;

      case 'products':
          return <Products products={products} isPatron={userRole === 'patron'} />;

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