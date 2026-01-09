// src/App.jsx

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { Loader2, Menu, MonitorCheck } from 'lucide-react';
// 👇 YENİ: Navigate eklendi (Yönlendirme için)
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';

import { db, appId, auth } from './services/firebase';
import { THEME } from './utils/constants';

import Sidebar from './components/Sidebar';
import AuthScreen from './components/AuthScreen';
import useFinanceData from './hooks/useFinanceData';
import InfoModal from './components/InfoModal';
import MaintenancePage from './components/MaintenancePage';
import NetworkStatus from './components/NetworkStatus';

import CustomerLoyalty from './pages/CustomerLoyalty';

const MAINTENANCE_MODE = false;

// Sayfalar (Code Splitting)
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
const CustomerDirectory = lazy(() => import('./pages/CustomerDirectory'));

// Yükleme Ekranı
const LoadingScreen = () => (
  <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-700">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-2xl mb-4 animate-bounce">
              <MonitorCheck size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mb-2">MOTTO <span className="text-indigo-400">POS</span></h1>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
              <Loader2 className="animate-spin" size={14} />
              Sistem Hazırlanıyor...
          </div>
      </div>
  </div>
);

// -----------------------------------------------------------------------------
// 1. YÖNETİM PANELİ (Admin Dashboard)
// -----------------------------------------------------------------------------
function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [activeTab, setActiveTab] = useState('pos');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [salaryNotification, setSalaryNotification] = useState({ isOpen: false, names: '' });
  const [loyaltySettings, setLoyaltySettings] = useState({ welcomeBonus: 50, birthdayBonus: 100 });
  const [customers, setCustomers] = useState([]);

  const {
    transactions, products, investments, debts, ingredients, quickActions, tables,
    fixedCosts, setFixedCosts, monthlyGoal, setMonthlyGoal, marketRates,
    stats, calculateFutureCashflow,
    staff, categories, loading
  } = useFinanceData(user); 

  useEffect(() => {
    const initAuth = async () => { try { await signInAnonymously(auth); } catch (e) { console.error(e); } };
    initAuth();
    return onAuthStateChanged(auth, (currentUser) => { if (currentUser) setUser(currentUser); });
  }, []);

  useEffect(() => {
    if (userRole) {
        localStorage.setItem('motto_user_role', userRole);
        if (userRole === 'patron') setActiveTab('dashboard');
        if (userRole === 'kasiyer') setActiveTab('pos');
        if (userRole === 'garson') setActiveTab('tables');
    }
  }, [userRole]);

  useEffect(() => {
    if (userRole === 'patron' && staff.length > 0) {
        const today = new Date().getDate();
        const pendingPayments = staff.filter(p => Number(p.salaryDay) === today);
        if (pendingPayments.length > 0) {
            const key = `salary_notified_${new Date().toDateString()}`;
            if (!sessionStorage.getItem(key)) {
                setSalaryNotification({ isOpen: true, names: pendingPayments.map(p => p.name).join(', ') });
                sessionStorage.setItem(key, 'true');
            }
        }
    }
  }, [staff, userRole]);

  // Sayfa yüklendiğinde ayarları Firebase'den çek
  useEffect(() => {
      const fetchLoyaltySettings = async () => {
          try {
              const docRef = doc(db, 'artifacts', appId, 'shops', 'motto_coffee_sube_01', 'settings', 'loyalty');
              const docSnap = await getDoc(docRef);
              if (docSnap.exists()) {
                  setLoyaltySettings(docSnap.data());
              }
          } catch (error) {
              console.error("Sadakat ayarları yükleme hatası:", error);
          }
      };
      if (user) fetchLoyaltySettings();
  }, [user]);

  // Müşteri listesini çek
  useEffect(() => {
      const fetchCustomers = async () => {
          try {
              const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
              const customersRef = collection(db, 'artifacts', appId, 'shops', 'motto_coffee_sube_01', 'customers');
              const q = query(customersRef, orderBy("createdAt", "desc"));
              const querySnapshot = await getDocs(q);

              const customerList = querySnapshot.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data()
              }));
              setCustomers(customerList);
          } catch (error) {
              console.error("Müşteriler yüklenirken hata:", error);
          }
      };
      if (user) fetchCustomers();
  }, [user]);
  
  if (MAINTENANCE_MODE) return <MaintenancePage />;
  if (loading && userRole) return <LoadingScreen />;
  if (!userRole) return <AuthScreen setUserRole={setUserRole} />;

  const renderContent = () => {
    if (userRole === 'kasiyer' || userRole === 'garson') {
        const allowed = userRole === 'garson' ? ['tables', 'products'] : ['pos', 'tables', 'transactions', 'debts', 'products', 'settings'];
        if (!allowed.includes(activeTab)) return <div className="flex h-full items-center justify-center text-slate-500">Bu alana erişim yetkiniz yok.</div>;
    }

    switch (activeTab) {
      case 'dashboard':
        return (
            <Dashboard
                stats={stats}
                transactions={transactions}
                monthlyGoal={monthlyGoal}
                calculateFutureCashflow={calculateFutureCashflow}
                tables={tables}
                loyaltySettings={loyaltySettings} // ✨ Yeni: Ayarları gönder
                customers={customers}           // ✨ Yeni: Müşteri listesini gönder (State olarak tanımlanmalı)
                ingredients={ingredients}
                products={products}
            />
        );
      case 'pos': return <CashierPOS products={products} ingredients={ingredients} loyaltySettings={loyaltySettings} />; 
      case 'tables': return <Tables tables={tables} products={products} ingredients={ingredients} userRole={userRole} />;
      case 'transactions': return <Transactions transactions={transactions} quickActions={quickActions} isPatron={userRole === 'patron'}/>;
      case 'debts': return <Debts debts={debts} stats={stats} />;
      case 'customerDirectory': return <CustomerDirectory isDarkMode={true} />;
      case 'products': return <Products products={products} categories={categories} isPatron={userRole === 'patron'} canEdit={userRole !== 'garson'} userRole={userRole} />;
      case 'inventory': return <Inventory ingredients={ingredients} debts={debts} />;
      case 'recipe': return <Recipe ingredients={ingredients} products={products} />;
      case 'investments': return <Investments investments={investments} marketRates={marketRates} />;
      case 'stats': return <Stats transactions={transactions} products={products} />;
      case 'assistant': return <Assistant stats={stats} />;
      case 'staff': return <Staff staff={staff} />;
      case 'zreport': return <ZReport transactions={transactions} />;
      case 'settings': return userRole === 'patron' ? <Settings monthlyGoal={monthlyGoal} setMonthlyGoal={setMonthlyGoal} fixedCosts={fixedCosts} setFixedCosts={setFixedCosts} loyaltySettings={loyaltySettings} setLoyaltySettings={setLoyaltySettings} /> : <CashierSettings />;
      default: return <div className="text-center py-20 text-slate-500">Sayfa Bulunamadı</div>;
    }
  };

  return (
    <div className={`min-h-screen ${THEME.bg} text-slate-200 font-sans flex`}>
      <NetworkStatus />
      <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800/90 backdrop-blur-md rounded-xl text-white shadow-lg border border-slate-700 active:scale-95 transition-transform"><Menu size={24} /></button>
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm md:hidden animate-in fade-in duration-200" onClick={() => setIsMobileMenuOpen(false)}></div>}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isMobile={!isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} userRole={userRole} />
      <main className={`flex-1 h-screen overflow-y-auto w-full relative ${isMobileMenuOpen ? 'overflow-hidden' : ''}`}>
        <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8 max-w-[1600px] mx-auto">
          <Suspense fallback={<div className="flex flex-col items-center justify-center h-64 text-indigo-400 gap-3"><Loader2 className="animate-spin" size={32}/><span className="text-xs font-medium uppercase tracking-wider opacity-70">Sayfa Yükleniyor...</span></div>}>
            {renderContent()}
          </Suspense>
        </div>
      </main>
      <InfoModal isOpen={salaryNotification.isOpen} onClose={() => setSalaryNotification({ ...salaryNotification, isOpen: false })} type="info" title="🔔 Maaş Günü" message={`Bugün maaş günü:\n\n${salaryNotification.names}`} />
    </div>
  );
}

// -----------------------------------------------------------------------------
// 2. ANA UYGULAMA & ROTALAMA (ROUTING)
// -----------------------------------------------------------------------------
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🟢 Müşteri Sadakat Ekranı: /plus */}
        <Route path="/plus" element={<CustomerLoyalty />} />

        {/* 🔴 Yönetim Paneli: /pos ile başlar */}
        <Route path="/pos/*" element={<AdminDashboard />} />

        {/* ↩️ Ana Sayfa ('/') otomatik olarak '/pos'a yönlenir */}
        <Route path="/" element={<Navigate to="/pos" replace />} />
      </Routes>
    </BrowserRouter>
  );
}