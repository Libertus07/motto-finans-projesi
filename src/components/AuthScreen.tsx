import React, { useState, useEffect, memo } from 'react';
import {
    ShieldCheck, ArrowRight, Delete,
    ChevronLeft, UtensilsCrossed, Loader2,
    Store, MonitorCheck, Wifi, WifiOff, LucideIcon
} from 'lucide-react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';
import { Staff } from '../types';

interface RoleConfigItem {
    id: string;
    label: string;
    desc: string;
    icon: LucideIcon;
    color: string;
    bg: string;
    gradient: string;
}

interface AuthScreenProps {
    setUserRole: (role: string) => void;
    staffList: Staff[];
    setCurrentStaff: (staff: Staff | { id: string; name: string; role: string; loginTime?: string }) => void;
}

// Performans için Saat Bileşeni (Aynı kaldı)
const LiveClock = memo(() => {
    const [currentTime, setCurrentTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    return (
        <div className="absolute top-6 right-6 md:top-8 md:right-8 text-right z-20 opacity-80 pointer-events-none">
            <div className="text-3xl font-black text-white tracking-tighter leading-none">
                {currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                {currentTime.toLocaleDateString('tr-TR', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
        </div>
    );
});

const AuthScreen: React.FC<AuthScreenProps> = ({ setUserRole, staffList, setCurrentStaff }) => {
    const [step, setStep] = useState<'select' | 'input' | 'forgot'>('select');
    const [selectedRole, setSelectedRole] = useState<RoleConfigItem | null>(null);
    const [pin, setPin] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    const ROLE_CONFIG: Record<string, RoleConfigItem> = {
        patron: { id: 'patron', label: 'Yönetici', desc: 'Tam Yetki', icon: ShieldCheck, color: 'text-amber-400', bg: 'bg-amber-500', gradient: 'from-amber-400 to-orange-500' },
        kasiyer: { id: 'kasiyer', label: 'Kasiyer', desc: 'Satış & Kasa', icon: Store, color: 'text-cyan-400', bg: 'bg-cyan-500', gradient: 'from-cyan-400 to-blue-500' },
        garson: { id: 'garson', label: 'Garson', desc: 'Sipariş', icon: UtensilsCrossed, color: 'text-rose-400', bg: 'bg-rose-500', gradient: 'from-rose-400 to-pink-600' }
    };

    useEffect(() => {
        const savedEmail = localStorage.getItem('motto_saved_email');
        if (savedEmail) { setEmail(savedEmail); setRememberMe(true); }
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
    }, []);

    const handleRoleSelect = (roleKey: string) => {
        setSelectedRole(ROLE_CONFIG[roleKey]);
        setStep('input');
        setPin('');
        if (!localStorage.getItem('motto_saved_email')) setEmail('');
        setPassword('');
        setError('');
    };

    const handlePinInput = (num: string) => {
        if (!selectedRole || loading || pin.length >= 6) return;

        if (selectedRole.id !== 'patron') {
            const newPin = pin + num;
            setPin(newPin);

            if (newPin.length === 6) {
                setLoading(true);
                setTimeout(() => {
                    // ✨ YENİ MANTIK: Personel listesinden PIN kontrolü
                    const matchedStaff = staffList.find(s =>
                        s.role.toLowerCase() === selectedRole.label.toLowerCase() &&
                        s.pin === newPin
                    );

                    if (matchedStaff) {
                        // ✨ YENİ: Giriş saatini kaydet
                        const staffWithSession = { ...matchedStaff, loginTime: new Date().toISOString() };
                        setCurrentStaff(staffWithSession);
                        localStorage.setItem('motto_current_staff', JSON.stringify(staffWithSession));
                        setUserRole(selectedRole.id);
                    } else {
                        setError('Hatalı Kod');
                        setPin('');
                        setLoading(false);
                        setTimeout(() => setError(''), 1500);
                    }
                }, 100);
            }
        }
    };

    const handleDelete = () => { if (pin.length > 0) setPin(prev => prev.slice(0, -1)); };

    const handleAdminLogin = async (e: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!email || !password) return setError('Alanları doldurun.');
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            if (rememberMe) localStorage.setItem('motto_saved_email', email);
            else localStorage.removeItem('motto_saved_email');
            // Patron için dummy staff objesi
            setCurrentStaff({ id: 'admin', name: 'Yönetici', role: 'Patron' });
            setUserRole('patron');
        } catch { setError('Giriş başarısız.'); setLoading(false); }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!email) return setError('E-posta giriniz.');
        setLoading(true);
        try { await sendPasswordResetEmail(auth, email); setSuccessMsg('Link gönderildi.'); setError(''); }
        catch { setError('İşlem başarısız.'); } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-indigo-500/30">

            {/* Arkaplan */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-[#0B0F17] md:hidden"></div>
                <div className="hidden md:block">
                    <div className={`absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 transition-colors duration-1000 ${selectedRole ? selectedRole.bg : 'bg-indigo-600'}`}></div>
                    <div className={`absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-20 transition-colors duration-1000 ${selectedRole ? selectedRole.bg : 'bg-purple-600'}`}></div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                </div>
            </div>

            <LiveClock />

            <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 z-20 flex items-center gap-2">
                <div className={`px-3 py-1.5 rounded-full border backdrop-blur-md flex items-center gap-2 transition-colors ${isOnline ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
                    <span className="text-[10px] font-bold uppercase tracking-wider">{isOnline ? 'Online' : 'Offline'}</span>
                </div>
            </div>

            <div className="relative z-10 w-full max-w-[380px]">

                {/* Logo Area */}
                <div className={`text-center mb-6 space-y-3 transition-all duration-500 ${step !== 'select' ? 'scale-90 opacity-80' : 'scale-100'}`}>
                    <div className="relative inline-block group">
                        <div className={`absolute -inset-1 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 bg-gradient-to-r ${selectedRole ? selectedRole.gradient : 'from-indigo-500 to-purple-600'}`}></div>
                        <div className="relative w-20 h-20 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center shadow-2xl">
                            {selectedRole ? <selectedRole.icon size={36} className={`${selectedRole.color}`} /> : <MonitorCheck size={36} className="text-white" />}
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-1">
                            MOTTO <span className={`text-transparent bg-clip-text bg-gradient-to-r ${selectedRole ? selectedRole.gradient : 'from-white via-indigo-200 to-white'}`}>POS</span>
                        </h1>
                    </div>
                </div>

                {step === 'select' && (
                    <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                        {Object.values(ROLE_CONFIG).map((role) => (
                            <button
                                key={role.id}
                                onClick={() => handleRoleSelect(role.id)} // onClick'e geri döndük (Kaydırma sorunu için)
                                className={`w-full relative overflow-hidden bg-slate-800/60 backdrop-blur-md border border-slate-700/50 p-1 rounded-2xl transition-transform active:scale-95 touch-manipulation`} // touch-manipulation eklendi
                            >
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/40">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-white/5 bg-white/5 ${role.color}`}>
                                        <role.icon size={22} />
                                    </div>
                                    <div className="text-left flex-1">
                                        <h3 className="font-bold text-white text-lg tracking-tight">{role.label}</h3>
                                        <p className="text-xs text-slate-500">{role.desc}</p>
                                    </div>
                                    <ArrowRight size={14} className="text-slate-600" />
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {step !== 'select' && selectedRole && (
                    <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 p-1 rounded-[2rem] shadow-2xl animate-in slide-in-from-right-4 duration-300">
                        <div className="bg-slate-950/50 rounded-[1.8rem] p-6 border border-white/5">

                            <div className="flex items-center justify-between mb-6">
                                <button onClick={() => setStep('select')} className="text-slate-500 hover:text-white flex items-center gap-1 text-xs font-bold p-2 -ml-2">
                                    <ChevronLeft size={16} /> GERİ
                                </button>
                                <div className={`px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wider ${selectedRole.color}`}>
                                    {selectedRole.label}
                                </div>
                            </div>

                            {selectedRole.id === 'patron' && step !== 'forgot' && (
                                <form onSubmit={handleAdminLogin} className="space-y-4">
                                    <div className="space-y-3">
                                        <input aria-label="E-posta" type="email" placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3.5 px-4 text-sm text-white focus:border-amber-500 outline-none transition-colors placeholder:text-slate-600" />
                                        <input aria-label="Parola" type="password" placeholder="Parola" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3.5 px-4 text-sm text-white focus:border-amber-500 outline-none transition-colors placeholder:text-slate-600" />
                                    </div>
                                    <div
                                        className="flex items-center gap-2 py-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500/50 rounded-lg outline-none"
                                        onClick={() => setRememberMe(!rememberMe)}
                                        role="checkbox"
                                        aria-checked={rememberMe}
                                        aria-label="Beni Hatırla"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                setRememberMe(!rememberMe);
                                            }
                                        }}
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${rememberMe ? 'bg-amber-500 border-amber-500' : 'bg-transparent border-slate-600'}`}>
                                            {rememberMe && <ArrowRight size={10} className="text-black rotate-[-45deg]" />}
                                        </div>
                                        <span className="text-xs text-slate-400 select-none">Beni Hatırla</span>
                                    </div>
                                    {error && <div className="p-3 rounded-lg bg-red-500/10 text-red-400 text-xs text-center font-bold">{error}</div>}
                                    <button type="submit" disabled={loading} className="w-full py-4 bg-amber-600 text-white font-bold rounded-xl text-sm shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2">
                                        {loading ? <Loader2 className="animate-spin" /> : 'GİRİŞ YAP'}
                                    </button>
                                </form>
                            )}

                            {selectedRole.id !== 'patron' && (
                                <div className="flex flex-col items-center">
                                    {/* 👇 GÜNCELLENEN ŞİFRE GÖSTERGESİ (PARLAK & BEYAZ) */}
                                    <div className="mb-6 relative w-full flex justify-center h-8 items-center gap-4">
                                        {[...Array(6)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={`
                                                    rounded-full transition-all duration-200 
                                                    ${i < pin.length
                                                        ? 'w-4 h-4 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] scale-110' // Dolu: Parlak Beyaz & Neon
                                                        : 'w-3 h-3 bg-slate-800 border-2 border-slate-700' // Boş: Sönük Gri
                                                    }
                                                `}
                                            />
                                        ))}
                                        {error && <p className="absolute -bottom-8 left-0 right-0 text-center text-red-400 text-xs font-bold animate-pulse">{error}</p>}
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 w-full max-w-[260px]">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                            <button
                                                key={num}
                                                // 👇 TEKRAR onClick (Kaydırma sorununu çözer)
                                                // touch-manipulation: Tarayıcının zoom için beklemesini engeller, hızı artırır.
                                                onClick={() => handlePinInput(num.toString())}
                                                className={`h-16 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-2xl font-medium border border-slate-700 active:scale-90 active:bg-slate-600 transition-transform duration-75 flex items-center justify-center shadow-lg touch-manipulation select-none`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                        <div className="col-start-2">
                                            <button
                                                onClick={() => handlePinInput('0')}
                                                className="w-full h-16 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-2xl font-medium border border-slate-700 active:scale-90 active:bg-slate-600 transition-transform duration-75 flex items-center justify-center shadow-lg touch-manipulation select-none"
                                            >
                                                0
                                            </button>
                                        </div>
                                        <div className="col-start-3">
                                            <button
                                                onClick={handleDelete}
                                                aria-label="Sil"
                                                className="w-full h-16 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 active:scale-90 active:bg-red-500/20 transition-transform duration-75 flex items-center justify-center shadow-lg touch-manipulation select-none"
                                            >
                                                <Delete size={22} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 'forgot' && (
                                <div className="space-y-4">
                                    <div className="text-center mb-4"><h3 className="text-white font-bold">Şifre Sıfırlama</h3></div>
                                    <input type="email" placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white outline-none" />
                                    {successMsg && <p className="text-emerald-400 text-xs text-center">{successMsg}</p>}
                                    {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                                    <button onClick={handleForgotPassword} disabled={loading} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2">{loading ? <Loader2 className="animate-spin" /> : 'LİNK GÖNDER'}</button>
                                    <button onClick={() => { setStep('input'); setError(''); }} className="w-full text-xs text-slate-500 py-2">İptal</button>
                                </div>
                            )}

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthScreen;
