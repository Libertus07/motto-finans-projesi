// components/AuthScreen.jsx (FINAL: NO EYE ICON + REMEMBER ME + BRANCH INFO)

import React, { useState, useEffect } from 'react';
import { 
    User, ShieldCheck, ArrowRight, Delete, KeyRound, 
    ChevronLeft, UtensilsCrossed, Loader2,
    Store, MonitorCheck, Wifi, WifiOff, MapPin
} from 'lucide-react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';

const AuthScreen = ({ setUserRole }) => {
    const [step, setStep] = useState('select'); 
    const [selectedRole, setSelectedRole] = useState(null);
    const [pin, setPin] = useState('');
    
    // Patron Login State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // 👇 YENİ: Beni Hatırla State'i
    const [rememberMe, setRememberMe] = useState(false);
    
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);

    // Canlı Saat & Network
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // 🔐 ŞİFRELER
    const PINS = {
        'kasiyer': '178600', 
        'garson': '325200'   
    };

    // ROL AYARLARI
    const ROLE_CONFIG = {
        patron: {
            id: 'patron',
            label: 'Yönetici',
            desc: 'Tam Yetki & Finans',
            icon: ShieldCheck,
            color: 'text-amber-400',
            bg: 'bg-amber-500',
            border: 'border-amber-500',
            glow: 'shadow-amber-500/20',
            gradient: 'from-amber-400 to-orange-500'
        },
        kasiyer: {
            id: 'kasiyer',
            label: 'Kasiyer',
            desc: 'Satış & Kasa',
            icon: Store,
            color: 'text-cyan-400',
            bg: 'bg-cyan-500',
            border: 'border-cyan-500',
            glow: 'shadow-cyan-500/20',
            gradient: 'from-cyan-400 to-blue-500'
        },
        garson: {
            id: 'garson',
            label: 'Garson',
            desc: 'Sipariş & Servis',
            icon: UtensilsCrossed,
            color: 'text-rose-400',
            bg: 'bg-rose-500',
            border: 'border-rose-500',
            glow: 'shadow-rose-500/20',
            gradient: 'from-rose-400 to-pink-600'
        }
    };

    // 👇 EFEKT: Kayıtlı E-postayı Getir
    useEffect(() => {
        const savedEmail = localStorage.getItem('motto_saved_email');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    // Saat ve Network Dinleyicisi
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            clearInterval(timer);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleRoleSelect = (roleKey) => {
        setSelectedRole(ROLE_CONFIG[roleKey]);
        setStep('input');
        setPin('');
        // E-posta kayıtlıysa parola sıfırla, değilse ikisini de sıfırla
        if (!localStorage.getItem('motto_saved_email')) setEmail('');
        setPassword('');
        setError('');
        setSuccessMsg('');
    };

    const handlePinInput = (num) => {
        if (!selectedRole) return;
        if (selectedRole.id !== 'patron' && pin.length < 6) {
            const newPin = pin + num;
            setPin(newPin);
            if (newPin.length === 6) {
                setLoading(true);
                setTimeout(() => {
                    if (newPin === PINS[selectedRole.id]) {
                        setUserRole(selectedRole.id);
                    } else {
                        setError('Geçersiz Erişim Kodu');
                        setPin('');
                        setLoading(false);
                        setTimeout(() => setError(''), 2000);
                    }
                }, 400); 
            }
        }
    };

    const handleDelete = () => setPin(prev => prev.slice(0, -1));

    const handleAdminLogin = async (e) => {
        if (e) e.preventDefault();
        if (!email || !password) return setError('Lütfen tüm alanları doldurun.');
        setLoading(true);
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            
            // 👇 "Beni Hatırla" Mantığı
            if (rememberMe) {
                localStorage.setItem('motto_saved_email', email);
            } else {
                localStorage.removeItem('motto_saved_email');
            }

            setUserRole('patron');
        } catch (err) {
            setError('Giriş başarısız. Bilgileri kontrol edin.');
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        if (e) e.preventDefault();
        if (!email) return setError('Lütfen e-posta adresinizi yazın.');
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setSuccessMsg('Sıfırlama bağlantısı e-postanıza gönderildi.');
            setError('');
        } catch (err) {
            setError('İşlem başarısız. E-postayı kontrol edin.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if (step === 'input' && selectedRole && selectedRole.id !== 'patron') {
                if (/^\d$/.test(e.key)) handlePinInput(e.key);
                else if (e.key === 'Backspace') handleDelete();
            }
        };
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [step, selectedRole, pin]);

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-indigo-500/30">
            
            {/* --- ARKA PLAN --- */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 transition-colors duration-1000 ${selectedRole ? selectedRole.bg : 'bg-indigo-600'}`}></div>
                <div className={`absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-20 transition-colors duration-1000 ${selectedRole ? selectedRole.bg : 'bg-purple-600'}`}></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            </div>

            {/* SAAT VE TARİH */}
            <div className="absolute top-6 right-6 md:top-8 md:right-8 text-right z-20 opacity-80">
                <div className="text-3xl font-black text-white tracking-tighter leading-none">
                    {currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {currentTime.toLocaleDateString('tr-TR', { weekday: 'long', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* SİSTEM DURUMU */}
            <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 z-20 flex items-center gap-2">
                <div className={`px-3 py-1.5 rounded-full border backdrop-blur-md flex items-center gap-2 transition-colors ${isOnline ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
                    <span className="text-[10px] font-bold uppercase tracking-wider">{isOnline ? 'Sistem Online' : 'Bağlantı Yok'}</span>
                </div>
            </div>

            {/* ✨ YENİ: ŞUBE VE VERSİYON BİLGİSİ */}
            <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 z-20 flex flex-col items-end gap-1 text-slate-600">
                <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-slate-500">
                    <MapPin size={12} /> Merkez Şube
                </div>
                <div className="text-[9px] font-bold tracking-widest uppercase opacity-60">
                    v1.0.4
                </div>
            </div>

            <div className="relative z-10 w-full max-w-[400px]">
                
                {/* --- LOGO --- */}
                <div className={`text-center mb-8 space-y-4 transition-all duration-700 ${step === 'input' ? 'scale-90 opacity-80' : 'scale-100'}`}>
                    <div className="relative inline-block group">
                        <div className={`absolute -inset-1 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 bg-gradient-to-r ${selectedRole ? selectedRole.gradient : 'from-indigo-500 to-purple-600'}`}></div>
                        <div className="relative w-20 h-20 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center shadow-2xl">
                            {selectedRole ? (
                                <selectedRole.icon size={36} className={`${selectedRole.color} transition-all duration-500`} />
                            ) : (
                                <MonitorCheck size={36} className="text-white transition-all duration-500" />
                            )}
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-1">
                            MOTTO <span className={`text-transparent bg-clip-text bg-gradient-to-r transition-all duration-500 ${selectedRole ? selectedRole.gradient : 'from-white via-indigo-200 to-white'}`}>POS</span>
                        </h1>
                        <p className="text-slate-500 text-[10px] tracking-[0.4em] uppercase font-bold">Automation System</p>
                    </div>
                </div>

                {/* --- ROL SEÇİMİ --- */}
                {step === 'select' && (
                    <div className="space-y-3 animate-in fade-in zoom-in-95 duration-500">
                        {Object.values(ROLE_CONFIG).map((role) => (
                            <button 
                                key={role.id} 
                                onClick={() => handleRoleSelect(role.id)}
                                className={`w-full group relative overflow-hidden bg-slate-800/40 backdrop-blur-md border border-slate-700/50 hover:border-${role.color.split('-')[1]}/50 p-1 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${role.glow}`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/40 group-hover:bg-slate-900/60 transition-colors">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-white/5 bg-white/5 ${role.color} group-hover:scale-110 transition-transform duration-300`}>
                                        <role.icon size={22} />
                                    </div>
                                    <div className="text-left flex-1">
                                        <h3 className="font-bold text-white text-lg tracking-tight group-hover:translate-x-1 transition-transform">{role.label}</h3>
                                        <p className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">{role.desc}</p>
                                    </div>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-slate-800 group-hover:${role.bg} transition-colors duration-300`}>
                                        <ArrowRight size={14} className={`text-slate-500 group-hover:text-white`} />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* --- GİRİŞ FORMU --- */}
                {step === 'input' && selectedRole && (
                    <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-1 rounded-[2rem] shadow-2xl animate-in slide-in-from-right-8 duration-500">
                        <div className="bg-slate-950/50 rounded-[1.8rem] p-6 border border-white/5">
                            
                            <div className="flex items-center justify-between mb-6">
                                <button onClick={() => setStep('select')} className="text-slate-500 hover:text-white flex items-center gap-1 text-xs font-bold transition-colors group">
                                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> GERİ
                                </button>
                                <div className={`px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wider ${selectedRole.color}`}>
                                    {selectedRole.label} Girişi
                                </div>
                            </div>

                            {/* --- PATRON GİRİŞİ --- */}
                            {selectedRole.id === 'patron' && step !== 'forgot' && (
                                <form onSubmit={handleAdminLogin} className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="relative group">
                                            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors"/>
                                            <input type="email" placeholder="E-posta Adresi" value={email} onChange={(e) => setEmail(e.target.value)} 
                                                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all placeholder:text-slate-600"/>
                                        </div>
                                        <div className="relative group">
                                            <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors"/>
                                            <input 
                                                type="password"
                                                placeholder="Parola" 
                                                value={password} 
                                                onChange={(e) => setPassword(e.target.value)} 
                                                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all placeholder:text-slate-600"
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* 👇 "Beni Hatırla" Kutucuğu */}
                                    <div className="flex items-center gap-2">
                                        <button 
                                            type="button" 
                                            onClick={() => setRememberMe(!rememberMe)} 
                                            className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${rememberMe ? 'bg-amber-500 border-amber-500' : 'bg-transparent border-slate-600'}`}
                                        >
                                            {rememberMe && <ArrowRight size={10} className="text-black rotate-[-45deg]" />}
                                        </button>
                                        <span onClick={() => setRememberMe(!rememberMe)} className="text-xs text-slate-400 cursor-pointer select-none">Beni Hatırla</span>
                                    </div>

                                    {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-medium animate-pulse">{error}</div>}
                                    
                                    <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                                        {loading ? <Loader2 className="animate-spin"/> : 'GÜVENLİ GİRİŞ'}
                                    </button>
                                    
                                    <button type="button" onClick={() => { setStep('forgot'); setSuccessMsg(''); setError(''); }} className="text-xs text-slate-500 w-full text-center hover:text-amber-400 transition-colors pt-2">
                                        Şifremi Unuttum
                                    </button>
                                </form>
                            )}

                            {/* --- KASİYER & GARSON PIN --- */}
                            {selectedRole.id !== 'patron' && (
                                <div className="flex flex-col items-center">
                                    <div className="mb-8 relative w-full flex justify-center">
                                        <div className="flex gap-3">
                                            {[...Array(6)].map((_, i) => (
                                                <div key={i} className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${i < pin.length ? `${selectedRole.bg} border-transparent scale-125 shadow-[0_0_10px_currentColor]` : 'border-slate-700 bg-slate-800'}`}/>
                                            ))}
                                        </div>
                                        {error && <p className="absolute -bottom-8 left-0 right-0 text-center text-red-400 text-xs font-bold animate-pulse">{error}</p>}
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                            <button key={num} onClick={() => handlePinInput(num.toString())} 
                                                className={`h-16 rounded-2xl bg-slate-800/50 hover:bg-slate-700/80 text-white text-xl font-medium border border-slate-700/50 hover:border-${selectedRole.color.split('-')[1]}/30 transition-all active:scale-90 flex items-center justify-center shadow-lg`}>
                                                {num}
                                            </button>
                                        ))}
                                        <div className="col-start-2">
                                            <button onClick={() => handlePinInput('0')} className="w-full h-16 rounded-2xl bg-slate-800/50 hover:bg-slate-700/80 text-white text-xl font-medium border border-slate-700/50 transition-all active:scale-90 flex items-center justify-center shadow-lg">0</button>
                                        </div>
                                        <div className="col-start-3">
                                            <button onClick={handleDelete} className="w-full h-16 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all active:scale-90 flex items-center justify-center shadow-lg">
                                                <Delete size={20} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-6 text-[10px] text-slate-500 font-medium tracking-wide">6 HANELİ KODU GİRİN</div>
                                </div>
                            )}

                            {/* --- ŞİFRE SIFIRLAMA --- */}
                            {step === 'forgot' && (
                                <div className="space-y-4">
                                    <div className="text-center mb-4"><h3 className="text-white font-bold">Şifre Sıfırlama</h3><p className="text-xs text-slate-400">E-posta adresinize link gönderilecek.</p></div>
                                    <input type="email" placeholder="Kayıtlı E-posta" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-blue-500 outline-none"/>
                                    {successMsg && <p className="text-emerald-400 text-xs text-center p-2 bg-emerald-500/10 rounded-lg">{successMsg}</p>}
                                    {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                                    <button onClick={handleForgotPassword} disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2">{loading ? <Loader2 className="animate-spin"/> : 'SIFIRLAMA LİNKİ GÖNDER'}</button>
                                    <button onClick={() => { setStep('input'); setError(''); }} className="w-full text-xs text-slate-500 hover:text-white py-2">Giriş Ekranına Dön</button>
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