import { useState, useEffect, Suspense, useRef } from 'react';
import { Outlet, useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { Loader2, Menu, MonitorCheck, BellRing } from 'lucide-react';
import { doc, getDoc, updateDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { Toaster, toast } from 'react-hot-toast';

import { db, appId, auth } from '../services/firebase';
import { THEME, SHOP_ID } from '../utils/constants';
import { COLLECTIONS } from '../utils/firebasePaths';

import Sidebar from '../components/Sidebar';
import AuthScreen from '../components/AuthScreen';
import useFinanceData from '../hooks/useFinanceData';
import InfoModal from '../components/InfoModal';
import MaintenancePage from '../components/MaintenancePage';
import NetworkStatus from '../components/NetworkStatus';
import { DashboardContextType, LoyaltySettings, LoyaltyCustomer, Staff } from '../types';

const MAINTENANCE_MODE = false;

// Yükleme Ekranı (Copied from App.tsx)
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

export default function DashboardLayout() {
    const [user, setUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [salaryNotification, setSalaryNotification] = useState<{ isOpen: boolean; names: string }>({ isOpen: false, names: '' });
    const [loyaltySettings, setLoyaltySettings] = useState<LoyaltySettings>({ welcomeBonus: 50, birthdayBonus: 100 });
    const [customers, setCustomers] = useState<LoyaltyCustomer[]>([]);

    // Notification Sound Ref
    const audioRef = useRef<HTMLAudioElement | null>(null);
    // Timestamp check ref to prevent spam on reload
    const checkTime = useRef(Date.now());

    const navigate = useNavigate();
    const location = useLocation();

    const [currentStaff, setCurrentStaff] = useState<Staff | null>(() => {
        const saved = localStorage.getItem('motto_current_staff');
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    }, []);

    // Listen for Service Calls (Garson İstekleri)
    useEffect(() => {
        if (!user) return;

        try {
            const q = query(
                collection(db, COLLECTIONS.NOTIFICATIONS),
                where("status", "==", "pending")
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === "added") {
                        const data = change.doc.data();

                        // Ignore notifications older than the time this component mounted
                        // This prevents spamming old notifications on page reload
                        const createdAt = data.timestamp?.toMillis ? data.timestamp.toMillis() : Date.now();
                        if (createdAt < checkTime.current) return;

                        // Play sound
                        audioRef.current?.play().catch(() => { });

                        // Show Toast
                        toast((t) => (
                            <div className="flex items-start gap-4 min-w-[200px] relative pr-2">
                                <div
                                    onClick={() => { toast.dismiss(t.id); navigate('tables'); }}
                                    className="flex items-center gap-4 cursor-pointer flex-1"
                                >
                                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 animate-pulse shrink-0">
                                        <BellRing size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-800 dark:text-white text-sm">Yeni İstek!</h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-tight">{data.message}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); toast.dismiss(t.id); }}
                                    className="p-1 hover:bg-white/10 rounded-full text-slate-500 hover:text-white transition-colors absolute -top-1 -right-2"
                                >
                                    <span className="text-xl">&times;</span>
                                </button>
                            </div>
                        ), {
                            duration: 4000,
                            position: 'top-right',
                            style: {
                                background: '#1e293b',
                                color: '#fff',
                                padding: '12px',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
                            }
                        });
                    }
                });
            });
            return () => unsubscribe();
        } catch (error) {
            console.error("Bildirim dinleme hatası:", error);
        }
    }, [user, navigate]);


    useEffect(() => {
        if (!currentStaff?.id) return;
        if (currentStaff.id === 'admin') return;

        const updatePresence = async () => {
            try {
                const staffRef = doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'staff', currentStaff.id);
                await updateDoc(staffRef, { lastSeen: new Date().toISOString() });
            } catch (e) { console.error("Presence update failed", e); }
        };
        updatePresence();
        const interval = setInterval(updatePresence, 60000);
        return () => clearInterval(interval);
    }, [currentStaff]);

    const {
        transactions, products, investments, debts, ingredients, quickActions, tables,
        fixedCosts, setFixedCosts, monthlyGoal, setMonthlyGoal, marketRates,
        stats,
        staff, categories, loading
    } = useFinanceData(user);

    useEffect(() => {
        const initAuth = async () => { try { await signInAnonymously(auth); } catch (e) { console.error(e); } };
        initAuth();
        return onAuthStateChanged(auth, (currentUser) => { if (currentUser) setUser(currentUser); });
    }, []);

    // Role Based Redirect - Only on initial load or role change
    useEffect(() => {
        if (userRole) {
            localStorage.setItem('motto_user_role', userRole);
            // We only redirect if we are at the root /pos
            if (location.pathname === '/pos' || location.pathname === '/pos/') {
                if (userRole === 'patron') navigate('dashboard', { replace: true });
                if (userRole === 'kasiyer') navigate('pos', { replace: true });
                if (userRole === 'garson') navigate('tables', { replace: true });
            }
        }
    }, [userRole, location.pathname, navigate]);

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

    useEffect(() => {
        const fetchLoyaltySettings = async () => {
            try {
                const docRef = doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'settings', 'loyalty');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setLoyaltySettings(docSnap.data() as LoyaltySettings);
                }
            } catch (error) {
                console.error("Sadakat ayarları yükleme hatası:", error);
            }
        };
        if (user) fetchLoyaltySettings();
    }, [user]);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
                const customersRef = collection(db, 'artifacts', appId, 'shops', SHOP_ID, 'customers');
                const q = query(customersRef, orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);

                const customerList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as LoyaltyCustomer[];
                setCustomers(customerList);
            } catch (error) {
                console.error("Müşteriler yüklenirken hata:", error);
            }
        };
        if (user) fetchCustomers();
    }, [user]);

    if (MAINTENANCE_MODE) return <MaintenancePage />;
    if (loading && userRole) return <LoadingScreen />;
    if (!userRole) return <AuthScreen setUserRole={setUserRole} staffList={staff} setCurrentStaff={setCurrentStaff as any} />;

    const ctx: DashboardContextType = {
        transactions, products, investments, debts, ingredients, quickActions, tables,
        fixedCosts: fixedCosts || { rent: 0, staff: 0, bills: 0, other: 0 }, setFixedCosts, monthlyGoal, setMonthlyGoal, marketRates,
        stats,
        staff, categories, loading,
        userRole,
        customers,
        loyaltySettings,
        setLoyaltySettings,
        currentStaff
    };

    return (
        <div className={`min-h-screen ${THEME.bg} text-slate-200 font-sans flex`}>
            <Toaster position="top-right" />
            <NetworkStatus />
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800/90 backdrop-blur-md rounded-xl text-white shadow-lg border border-slate-700 active:scale-95 transition-transform"><Menu size={24} /></button>
            {isMobileMenuOpen && <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm md:hidden animate-in fade-in duration-200" onClick={() => setIsMobileMenuOpen(false)}></div>}

            <Sidebar
                isMobile={!isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
                userRole={userRole || ''}
            />

            <main className={`flex-1 h-screen overflow-y-auto w-full relative ${isMobileMenuOpen ? 'overflow-hidden' : ''}`}>
                <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8 max-w-[1600px] mx-auto">
                    <Suspense fallback={<div className="flex flex-col items-center justify-center h-64 text-indigo-400 gap-3"><Loader2 className="animate-spin" size={32} /><span className="text-xs font-medium uppercase tracking-wider opacity-70">Sayfa Yükleniyor...</span></div>}>
                        <Outlet context={ctx} />
                    </Suspense>
                </div>
            </main>
            <InfoModal isOpen={salaryNotification.isOpen} onClose={() => setSalaryNotification({ ...salaryNotification, isOpen: false })} type="info" title="🔔 Maaş Günü" message={`Bugün maaş günü:\n\n${salaryNotification.names}`} />
        </div>
    );
};

export function useDashboardContext() {
    return useOutletContext<DashboardContextType>();
}
