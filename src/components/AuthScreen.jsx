// components/AuthScreen.jsx (ŞİFRE SIFIRLAMA EKLENMİŞ SON HALİ)

import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, Lock, Delete, ArrowRight, X, KeyRound, LogIn, Coffee, ChevronLeft, Loader2, Mail, RefreshCw } from 'lucide-react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'; // 👇 sendPasswordResetEmail Eklendi
import { auth } from '../services/firebase';
import { THEME } from '../utils/constants';

const AuthScreen = ({ setUserRole }) => {
    const [step, setStep] = useState('select'); // 'select' | 'input' | 'forgot'
    const [selectedRole, setSelectedRole] = useState(null);
    
    // Kasiyer PIN State'i
    const [pin, setPin] = useState('');
    
    // Patron Giriş State'leri
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState(''); // Başarı mesajı için
    const [loading, setLoading] = useState(false);

    // Kasiyer için basit yerel şifre
    const CASHIER_PIN = '1234';

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setStep('input');
        setPin('');
        // setEmail(''); // E-postayı silmiyoruz, belki lazım olur
        setPassword('');
        setError('');
        setSuccessMsg('');
    };

    // --- KASİYER GİRİŞİ ---
    const handlePinInput = (num) => {
        if (selectedRole === 'kasiyer' && pin.length < 4) {
            const newPin = pin + num;
            setPin(newPin);
            if (newPin.length === 4) {
                if (newPin === CASHIER_PIN) {
                    setUserRole('kasiyer');
                } else {
                    setError('Hatalı Kasiyer Kodu');
                    setTimeout(() => { setPin(''); setError(''); }, 1000);
                }
            }
        }
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
    };

    // --- PATRON GİRİŞİ ---
    const handleAdminLogin = async (e) => {
        if (e) e.preventDefault();
        if (!email || !password) return setError('Lütfen bilgileri giriniz.');

        setLoading(true);
        setError('');

        try {
            await signInWithEmailAndPassword(auth, email, password);
            setUserRole('patron'); 
        } catch (err) {
            console.error("Giriş Hatası:", err.code);
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('E-posta veya Şifre Hatalı!');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Çok fazla deneme yaptınız. Biraz bekleyin.');
            } else {
                setError('Giriş başarısız. Bağlantınızı kontrol edin.');
            }
        } finally {
            setLoading(false);
        }
    };

    // 👇 ŞİFRE SIFIRLAMA FONKSİYONU
    const handleForgotPassword = async (e) => {
        if (e) e.preventDefault();
        if (!email) return setError('Lütfen e-posta adresinizi girin.');

        setLoading(true);
        setError('');
        setSuccessMsg('');

        try {
            await sendPasswordResetEmail(auth, email);
            setSuccessMsg('Sıfırlama bağlantısı e-postanıza gönderildi! Lütfen gelen kutunuzu (ve spam klasörünü) kontrol edin.');
        } catch (err) {
            console.error("Sıfırlama Hatası:", err);
            if (err.code === 'auth/user-not-found') setError('Bu e-posta ile kayıtlı kullanıcı bulunamadı.');
            else if (err.code === 'auth/invalid-email') setError('Geçersiz e-posta formatı.');
            else setError('Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    // Klavye Dinleyicileri
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if (step === 'input' && selectedRole === 'kasiyer') {
                if (/^\d$/.test(e.key)) handlePinInput(e.key);
                else if (e.key === 'Backspace') handleDelete();
            }
        };
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [step, selectedRole, pin]);

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden font-sans">
            
            {/* Arka Plan */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '2s'}}></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            </div>

            <div className="relative z-10 w-full max-w-[420px]">
                
                {/* LOGO */}
                <div className="text-center mb-8 space-y-3 animate-in slide-in-from-top-4 duration-700">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 shadow-2xl mb-2">
                        <Coffee size={32} className="text-white drop-shadow-lg" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">
                            MOTTO <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">COFFEE</span>
                        </h1>
                        <p className="text-slate-500 text-[10px] tracking-[0.3em] uppercase font-bold mt-2">Kurumsal Yönetim Sistemi</p>
                    </div>
                </div>

                {/* ADIM 1: ROL SEÇİMİ */}
                {step === 'select' && (
                    <div className="space-y-4 animate-in zoom-in-95 duration-500">
                        <button onClick={() => handleRoleSelect('patron')} className="w-full group relative bg-gradient-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-md border border-slate-700 hover:border-amber-500/50 p-1 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-amber-900/10 hover:-translate-y-1">
                            <div className="flex items-center gap-5 p-5 rounded-xl bg-slate-900/50">
                                <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform duration-300"><ShieldCheck size={24} className="text-amber-400" /></div>
                                <div className="text-left flex-1"><h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">Yönetici Girişi</h3><p className="text-xs text-slate-500 font-medium">Tam Yetkili Erişim (E-mail)</p></div>
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-amber-500 group-hover:text-white transition-all"><ArrowRight size={14} /></div>
                            </div>
                        </button>

                        <button onClick={() => handleRoleSelect('kasiyer')} className="w-full group relative bg-gradient-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-md border border-slate-700 hover:border-cyan-500/50 p-1 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-900/10 hover:-translate-y-1">
                            <div className="flex items-center gap-5 p-5 rounded-xl bg-slate-900/50">
                                <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 group-hover:scale-110 transition-transform duration-300"><User size={24} className="text-cyan-400" /></div>
                                <div className="text-left flex-1"><h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">Personel Girişi</h3><p className="text-xs text-slate-500 font-medium">Satış Terminali (PIN)</p></div>
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-cyan-500 group-hover:text-white transition-all"><ArrowRight size={14} /></div>
                            </div>
                        </button>
                    </div>
                )}

                {/* ADIM 2: GİRİŞ FORMLARI */}
                {step === 'input' && (
                    <div className="relative bg-slate-900/60 backdrop-blur-2xl border border-slate-700/50 p-1 rounded-3xl shadow-2xl animate-in slide-in-from-right-8 duration-500 ring-1 ring-white/5">
                        <div className="bg-slate-950/50 p-8 rounded-[20px] relative overflow-hidden">
                            <button onClick={() => setStep('select')} className="absolute top-4 left-4 text-slate-500 hover:text-white transition-colors flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg hover:bg-white/5"><ChevronLeft size={14} /> GERİ</button>

                            <div className="text-center mb-8 mt-4">
                                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-3 ${selectedRole === 'patron' ? 'bg-amber-500/10 text-amber-400' : 'bg-cyan-500/10 text-cyan-400'} ring-1 ring-white/10`}><Lock size={24} /></div>
                                <h2 className="text-xl font-bold text-white">{selectedRole === 'patron' ? 'Yönetici Doğrulama' : 'Personel Doğrulama'}</h2>
                            </div>

                            {/* KASİYER (PIN) */}
                            {selectedRole === 'kasiyer' && (
                                <>
                                    <div className="flex justify-center gap-4 mb-8">{[...Array(4)].map((_, i) => ( <div key={i} className={`w-3 h-3 rounded-full transition-all duration-300 ${i < pin.length ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)] scale-125' : 'bg-slate-700'}`}/> ))}</div>
                                    {error && <div className="text-red-400 text-center text-xs font-bold mb-4 bg-red-500/10 py-2 rounded-lg animate-shake">{error}</div>}
                                    <div className="grid grid-cols-3 gap-3">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                                            <button key={num} onClick={() => handlePinInput(num.toString())} className={`h-14 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xl font-bold transition-all active:scale-95 border border-slate-700 hover:border-slate-500 shadow-lg ${num === 0 ? 'col-start-2' : ''}`}>{num}</button>
                                        ))}
                                        <button onClick={handleDelete} className="h-14 rounded-xl bg-red-900/20 hover:bg-red-900/40 text-red-400 flex items-center justify-center transition-all active:scale-95 border border-red-500/20 col-start-3 row-start-4"><Delete size={20} /></button>
                                    </div>
                                </>
                            )}

                            {/* PATRON (E-POSTA & ŞİFRE) */}
                            {selectedRole === 'patron' && (
                                <form onSubmit={handleAdminLogin} className="space-y-4">
                                    <div className="space-y-4">
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={18}/>
                                            <input type="email" placeholder="Yönetici E-postası" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-900 text-white pl-12 pr-4 py-4 rounded-xl outline-none border border-slate-700 focus:border-amber-500/50 placeholder:text-slate-600 transition-all text-sm"/>
                                        </div>
                                        <div className="relative group">
                                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={18}/>
                                            <input type="password" placeholder="Güvenli Şifre" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-900 text-white pl-12 pr-4 py-4 rounded-xl outline-none border border-slate-700 focus:border-amber-500/50 placeholder:text-slate-600 transition-all text-sm"/>
                                        </div>
                                    </div>
                                    
                                    {error && <div className="text-red-400 text-center text-xs font-bold bg-red-500/10 py-3 rounded-lg border border-red-500/20 animate-shake">{error}</div>}

                                    <div className="flex flex-col gap-3">
                                        <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-amber-900/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group">
                                            {loading ? <Loader2 className="animate-spin" size={20}/> : <><LogIn size={18} className="group-hover:translate-x-1 transition-transform"/> GÜVENLİ GİRİŞ YAP</>}
                                        </button>
                                        
                                        {/* 👇 ŞİFREMİ UNUTTUM LİNKİ */}
                                        <button type="button" onClick={() => { setStep('forgot'); setError(''); setSuccessMsg(''); }} className="text-xs text-slate-500 hover:text-amber-400 transition-colors text-center py-2">
                                            Şifrenizi mi unuttunuz?
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}

                {/* ADIM 3: ŞİFRE SIFIRLAMA */}
                {step === 'forgot' && (
                    <div className="relative bg-slate-900/60 backdrop-blur-2xl border border-slate-700/50 p-1 rounded-3xl shadow-2xl animate-in slide-in-from-right-8 duration-500 ring-1 ring-white/5">
                        <div className="bg-slate-950/50 p-8 rounded-[20px] relative overflow-hidden">
                            <button onClick={() => setStep('input')} className="absolute top-4 left-4 text-slate-500 hover:text-white transition-colors flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg hover:bg-white/5"><ChevronLeft size={14} /> GİRİŞE DÖN</button>

                            <div className="text-center mb-6 mt-4">
                                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-3 bg-blue-500/10 text-blue-400 ring-1 ring-white/10"><RefreshCw size={24} /></div>
                                <h2 className="text-xl font-bold text-white">Şifre Sıfırlama</h2>
                                <p className="text-xs text-slate-400 mt-1">E-posta adresinize sıfırlama bağlantısı gönderilecek.</p>
                            </div>

                            <form onSubmit={handleForgotPassword} className="space-y-4">
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18}/>
                                    <input type="email" placeholder="Kayıtlı E-posta Adresi" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-900 text-white pl-12 pr-4 py-4 rounded-xl outline-none border border-slate-700 focus:border-blue-500/50 placeholder:text-slate-600 transition-all text-sm"/>
                                </div>

                                {error && <div className="text-red-400 text-center text-xs font-bold bg-red-500/10 py-3 rounded-lg border border-red-500/20">{error}</div>}
                                {successMsg && <div className="text-emerald-400 text-center text-xs font-bold bg-emerald-500/10 py-3 rounded-lg border border-emerald-500/20">{successMsg}</div>}

                                <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                                    {loading ? <Loader2 className="animate-spin" size={20}/> : 'SIFIRLAMA LİNKİ GÖNDER'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AuthScreen;