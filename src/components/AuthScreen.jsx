// components/AuthScreen.jsx (3 ROLLÜ SİSTEM)

import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, Lock, Delete, ArrowRight, X, KeyRound, LogIn, Coffee, ChevronLeft, UtensilsCrossed, Loader2, Mail } from 'lucide-react'; // UtensilsCrossed eklendi
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';
import { THEME } from '../utils/constants';

const AuthScreen = ({ setUserRole }) => {
    const [step, setStep] = useState('select'); 
    const [selectedRole, setSelectedRole] = useState(null);
    const [pin, setPin] = useState('');
    
    // Patron Login State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);

    // 🔐 ŞİFRELER / PIN KODLARI
    const PINS = {
        'kasiyer': '1234',
        'garson': '1111'  // 👇 Garson Şifresi
    };

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setStep('input');
        setPin('');
        setEmail('');
        setPassword('');
        setError('');
        setSuccessMsg('');
    };

    // --- PIN GİRİŞİ (KASİYER VE GARSON) ---
    const handlePinInput = (num) => {
        if ((selectedRole === 'kasiyer' || selectedRole === 'garson') && pin.length < 4) {
            const newPin = pin + num;
            setPin(newPin);
            if (newPin.length === 4) {
                if (newPin === PINS[selectedRole]) {
                    setUserRole(selectedRole);
                } else {
                    setError('Hatalı Personel Kodu');
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
            setError('Giriş başarısız. Bilgileri kontrol edin.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        if (e) e.preventDefault();
        if (!email) return setError('Lütfen e-posta girin.');
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setSuccessMsg('Sıfırlama linki gönderildi.');
        } catch (err) {
            setError('Hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    // Klavye Dinleyicisi (Kasiyer ve Garson için)
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if (step === 'input' && (selectedRole === 'kasiyer' || selectedRole === 'garson')) {
                if (/^\d$/.test(e.key)) handlePinInput(e.key);
                else if (e.key === 'Backspace') handleDelete();
            }
        };
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [step, selectedRole, pin]);

    // Renk Temaları
    const getTheme = () => {
        if (selectedRole === 'patron') return { color: 'text-amber-400', bg: 'bg-amber-500', border: 'border-amber-500' };
        if (selectedRole === 'kasiyer') return { color: 'text-cyan-400', bg: 'bg-cyan-500', border: 'border-cyan-500' };
        return { color: 'text-rose-400', bg: 'bg-rose-500', border: 'border-rose-500' }; // Garson (Rose)
    };
    const theme = getTheme();

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden font-sans">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            </div>

            <div className="relative z-10 w-full max-w-[420px]">
                {/* LOGO */}
                <div className="text-center mb-6 space-y-2 animate-in slide-in-from-top-4 duration-700">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 shadow-2xl mb-1">
                        <Coffee size={28} className="text-white drop-shadow-lg" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight">MOTTO <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">COFFEE</span></h1>
                        <p className="text-slate-500 text-[10px] tracking-[0.3em] uppercase font-bold">Kurumsal Yönetim Sistemi</p>
                    </div>
                </div>

                {/* ADIM 1: ROL SEÇİMİ */}
                {step === 'select' && (
                    <div className="space-y-3 animate-in zoom-in-95 duration-500">
                        {/* Patron */}
                        <button onClick={() => handleRoleSelect('patron')} className="w-full group bg-slate-800/80 border border-slate-700 hover:border-amber-500/50 p-1 rounded-2xl transition-all hover:scale-[1.02]">
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/50">
                                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20"><ShieldCheck size={20} className="text-amber-400" /></div>
                                <div className="text-left flex-1"><h3 className="font-bold text-white group-hover:text-amber-400">Yönetici</h3><p className="text-[10px] text-slate-500">Tam Yetki</p></div>
                                <ArrowRight size={16} className="text-slate-600 group-hover:text-amber-400"/>
                            </div>
                        </button>

                        {/* Kasiyer */}
                        <button onClick={() => handleRoleSelect('kasiyer')} className="w-full group bg-slate-800/80 border border-slate-700 hover:border-cyan-500/50 p-1 rounded-2xl transition-all hover:scale-[1.02]">
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/50">
                                <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20"><User size={20} className="text-cyan-400" /></div>
                                <div className="text-left flex-1"><h3 className="font-bold text-white group-hover:text-cyan-400">Kasiyer</h3><p className="text-[10px] text-slate-500">Satış & Kasa</p></div>
                                <ArrowRight size={16} className="text-slate-600 group-hover:text-cyan-400"/>
                            </div>
                        </button>

                        {/* 👇 GARSON BUTONU (YENİ) */}
                        <button onClick={() => handleRoleSelect('garson')} className="w-full group bg-slate-800/80 border border-slate-700 hover:border-rose-500/50 p-1 rounded-2xl transition-all hover:scale-[1.02]">
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/50">
                                <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20"><UtensilsCrossed size={20} className="text-rose-400" /></div>
                                <div className="text-left flex-1"><h3 className="font-bold text-white group-hover:text-rose-400">Garson</h3><p className="text-[10px] text-slate-500">Sipariş & Servis</p></div>
                                <ArrowRight size={16} className="text-slate-600 group-hover:text-rose-400"/>
                            </div>
                        </button>
                    </div>
                )}

                {/* ADIM 2: GİRİŞ FORMU */}
                {step === 'input' && (
                    <div className="relative bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-6 rounded-3xl shadow-2xl animate-in slide-in-from-right-8 duration-500">
                        <button onClick={() => setStep('select')} className="mb-6 text-slate-500 hover:text-white flex items-center gap-1 text-xs font-bold"><ChevronLeft size={14} /> GERİ</button>

                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-white capitalize">{selectedRole} Girişi</h2>
                            <p className="text-xs text-slate-400">Giriş yapmak için doğrulama yapın</p>
                        </div>

                        {/* PIN GİRİŞİ (Kasiyer & Garson) */}
                        {(selectedRole === 'kasiyer' || selectedRole === 'garson') && (
                            <>
                                <div className="flex justify-center gap-3 mb-6">{[...Array(4)].map((_, i) => ( <div key={i} className={`w-3 h-3 rounded-full transition-all duration-300 ${i < pin.length ? `${theme.bg} shadow-lg scale-125` : 'bg-slate-700'}`}/> ))}</div>
                                {error && <div className="text-red-400 text-center text-xs font-bold mb-4 animate-pulse">{error}</div>}
                                <div className="grid grid-cols-3 gap-2">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                                        <button key={num} onClick={() => handlePinInput(num.toString())} className={`h-12 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-lg font-bold border border-slate-700 active:scale-95 ${num === 0 ? 'col-start-2' : ''}`}>{num}</button>
                                    ))}
                                    <button onClick={handleDelete} className="h-12 rounded-lg bg-red-900/20 text-red-400 flex items-center justify-center border border-red-500/20 col-start-3 row-start-4 active:scale-95"><Delete size={18} /></button>
                                </div>
                            </>
                        )}

                        {/* PATRON GİRİŞİ */}
                        {selectedRole === 'patron' && step !== 'forgot' && (
                            <form onSubmit={handleAdminLogin} className="space-y-3">
                                <input type="email" placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-amber-500 outline-none"/>
                                <input type="password" placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-amber-500 outline-none"/>
                                {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                                <button type="submit" disabled={loading} className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2">{loading ? <Loader2 className="animate-spin"/> : 'GİRİŞ YAP'}</button>
                                <button type="button" onClick={() => { setStep('forgot'); setSuccessMsg(''); setError(''); }} className="text-[10px] text-slate-500 w-full text-center hover:text-white mt-2">Şifremi Unuttum</button>
                            </form>
                        )}

                        {/* ŞİFRE SIFIRLAMA */}
                        {step === 'forgot' && (
                            <div className="space-y-3">
                                <input type="email" placeholder="Kayıtlı E-posta" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-blue-500 outline-none"/>
                                {successMsg && <p className="text-emerald-400 text-xs text-center">{successMsg}</p>}
                                {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                                <button onClick={handleForgotPassword} disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2">{loading ? <Loader2 className="animate-spin"/> : 'LİNK GÖNDER'}</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthScreen;