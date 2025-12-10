// components/AuthScreen.jsx (PREMIUM DESIGN VERSION)

import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, Lock, Delete, ArrowRight, X, KeyRound, LogIn, Coffee, ChevronLeft } from 'lucide-react';
import { THEME } from '../utils/constants';

const AuthScreen = ({ setUserRole }) => {
    const [step, setStep] = useState('select'); // 'select' | 'input'
    const [selectedRole, setSelectedRole] = useState(null);
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    // 🔐 ŞİFRELER
    const PASSWORDS = {
        'kasiyer': '1907',
        'patron': 'Motto1786'
    };

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setStep('input');
        setPin('');
        setError('');
    };

    const handlePinInput = (num) => {
        if (selectedRole === 'kasiyer' && pin.length < 4) {
            setPin(prev => prev + num);
            setError('');
        }
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
    };

    const handleLogin = () => {
        if (pin === PASSWORDS[selectedRole]) {
            setUserRole(selectedRole);
        } else {
            setError('Erişim Reddedildi: Hatalı Şifre');
            if (selectedRole === 'kasiyer') setPin('');
        }
    };

    useEffect(() => {
        if (selectedRole === 'kasiyer' && pin.length === 4) handleLogin();
    }, [pin, selectedRole]);

    // Fiziksel Klavye Desteği (Kasiyer)
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

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleLogin();
    };

    // Dinamik Tema Renkleri
    const isPatron = selectedRole === 'patron';
    const accentColor = isPatron ? 'text-amber-400' : 'text-cyan-400';
    const bgAccent = isPatron ? 'bg-amber-500' : 'bg-cyan-500';
    const borderAccent = isPatron ? 'border-amber-500/50' : 'border-cyan-500/50';
    const shadowAccent = isPatron ? 'shadow-amber-900/20' : 'shadow-cyan-900/20';

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden font-sans">
            
            {/* Arka Plan Efektleri (Premium Glow) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '2s'}}></div>
                <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] bg-cyan-600/5 rounded-full blur-[100px]"></div>
                {/* Izgara Deseni */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            </div>

            <div className="relative z-10 w-full max-w-[420px]">
                
                {/* LOGO VE BAŞLIK */}
                <div className="text-center mb-8 space-y-3 animate-in slide-in-from-top-4 duration-700">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 shadow-2xl mb-2">
                        <Coffee size={32} className="text-white drop-shadow-lg" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">
                            MOTTO <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">COFFEE</span>
                        </h1>
                        <p className="text-slate-500 text-[10px] tracking-[0.3em] uppercase font-bold mt-2">İŞLETME YÖNETİM PANELİ</p>
                    </div>
                </div>

                {/* --- ADIM 1: ROL SEÇİMİ --- */}
                {step === 'select' && (
                    <div className="space-y-4 animate-in zoom-in-95 duration-500">
                        
                        {/* PATRON KARTI */}
                        <button 
                            onClick={() => handleRoleSelect('patron')}
                            className="w-full group relative bg-gradient-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-md border border-slate-700 hover:border-amber-500/50 p-1 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-amber-900/10 hover:-translate-y-1"
                        >
                            <div className="flex items-center gap-5 p-5 rounded-xl bg-slate-900/50">
                                <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform duration-300">
                                    <ShieldCheck size={24} className="text-amber-400" />
                                </div>
                                <div className="text-left flex-1">
                                    <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">Yönetici Girişi</h3>
                                    <p className="text-xs text-slate-500 font-medium">Tam Yetkili Erişim</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-amber-500 group-hover:text-white transition-all">
                                    <ArrowRight size={14} />
                                </div>
                            </div>
                        </button>

                        {/* KASİYER KARTI */}
                        <button 
                            onClick={() => handleRoleSelect('kasiyer')}
                            className="w-full group relative bg-gradient-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-md border border-slate-700 hover:border-cyan-500/50 p-1 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-900/10 hover:-translate-y-1"
                        >
                            <div className="flex items-center gap-5 p-5 rounded-xl bg-slate-900/50">
                                <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 group-hover:scale-110 transition-transform duration-300">
                                    <User size={24} className="text-cyan-400" />
                                </div>
                                <div className="text-left flex-1">
                                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">Personel Girişi</h3>
                                    <p className="text-xs text-slate-500 font-medium">Satış & Operasyon</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                                    <ArrowRight size={14} />
                                </div>
                            </div>
                        </button>

                        <div className="pt-6 text-center">
                            <p className="text-[10px] text-slate-600 font-mono">Secure Access v3.5 • 256-bit Encrypted</p>
                        </div>
                    </div>
                )}

                {/* --- ADIM 2: GİRİŞ EKRANI --- */}
                {step === 'input' && (
                    <div className="relative bg-slate-900/60 backdrop-blur-2xl border border-slate-700/50 p-1 rounded-3xl shadow-2xl animate-in slide-in-from-right-8 duration-500 ring-1 ring-white/5">
                        <div className="bg-slate-950/50 p-8 rounded-[20px] relative overflow-hidden">
                            
                            {/* Geri Dön Butonu */}
                            <button onClick={() => setStep('select')} className="absolute top-4 left-4 text-slate-500 hover:text-white transition-colors flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg hover:bg-white/5">
                                <ChevronLeft size={14} /> GERİ
                            </button>

                            {/* Başlık */}
                            <div className="text-center mb-8 mt-4">
                                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-3 ${isPatron ? 'bg-amber-500/10 text-amber-400' : 'bg-cyan-500/10 text-cyan-400'} ring-1 ring-white/10`}>
                                    <Lock size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-white">
                                    {isPatron ? 'Hoşgeldiniz' : 'Personel Doğrulama'}
                                </h2>
                                <p className="text-xs text-slate-400 mt-1">
                                    {isPatron ? 'Devam etmek için şifrenizi girin' : '4 haneli personel kodunu tuşlayın'}
                                </p>
                            </div>

                            {/* --- KASİYER ARAYÜZÜ (NUMPAD) --- */}
                            {!isPatron && (
                                <>
                                    <div className="flex justify-center gap-4 mb-8">
                                        {[...Array(4)].map((_, i) => (
                                            <div key={i} className={`w-3 h-3 rounded-full transition-all duration-300 ${i < pin.length ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)] scale-125' : 'bg-slate-700'}`}/>
                                        ))}
                                    </div>
                                    
                                    {error && <div className="text-red-400 text-center text-xs font-bold mb-4 bg-red-500/10 py-2 rounded-lg border border-red-500/20 animate-shake">{error}</div>}

                                    <div className="grid grid-cols-3 gap-3">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                            <button key={num} onClick={() => handlePinInput(num.toString())} className="h-14 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xl font-bold transition-all active:scale-95 border border-slate-700 hover:border-slate-500 shadow-lg">{num}</button>
                                        ))}
                                        <div className="h-14"></div>
                                        <button onClick={() => handlePinInput('0')} className="h-14 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xl font-bold transition-all active:scale-95 border border-slate-700 hover:border-slate-500 shadow-lg">0</button>
                                        <button onClick={handleDelete} className="h-14 rounded-xl bg-red-900/20 hover:bg-red-900/40 text-red-400 flex items-center justify-center transition-all active:scale-95 border border-red-500/20 hover:border-red-500/40"><Delete size={20} /></button>
                                    </div>
                                </>
                            )}

                            {/* --- PATRON ARAYÜZÜ (INPUT) --- */}
                            {isPatron && (
                                <div className="space-y-6 pb-2">
                                    <div className="relative group">
                                        <div className={`absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl opacity-30 group-hover:opacity-70 transition duration-500 blur`}></div>
                                        <div className="relative flex items-center">
                                            <KeyRound className="absolute left-4 text-amber-500" size={18}/>
                                            <input 
                                                type="password" 
                                                autoFocus
                                                placeholder="Güvenli Şifre"
                                                value={pin}
                                                onChange={(e) => { setPin(e.target.value); setError(''); }}
                                                onKeyDown={handleKeyDown}
                                                className="w-full bg-slate-900 text-white pl-12 pr-4 py-4 rounded-xl outline-none border border-slate-700 focus:border-amber-500/50 placeholder:text-slate-600 font-bold tracking-widest transition-all"
                                            />
                                        </div>
                                    </div>
                                    
                                    {error && <div className="text-red-400 text-center text-xs font-bold bg-red-500/10 py-2 rounded-lg border border-red-500/20 animate-shake">{error}</div>}

                                    <button 
                                        onClick={handleLogin}
                                        className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-amber-900/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] group"
                                    >
                                        <LogIn size={18} className="group-hover:translate-x-1 transition-transform"/> GİRİŞ YAP
                                    </button>
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