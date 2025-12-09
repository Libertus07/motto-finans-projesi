import React, { useState } from 'react';
import { Lock, User, ArrowRight, Loader2, ShieldCheck, Coffee } from 'lucide-react';
import { ADMIN_PASSWORD } from '../utils/constants';

const AuthScreen = ({ setUserRole }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Gerçekçilik hissi için sunucu gecikmesi simülasyonu
        await new Promise(resolve => setTimeout(resolve, 800));

        if (password === ADMIN_PASSWORD) {
            setUserRole('patron');
        } else if (password === '') {
            setUserRole('kasiyer');
        } else {
            setError('Hatalı şifre! Lütfen tekrar deneyin.');
            setLoading(false);
        }
    };

    const handleCashierLogin = () => {
        setLoading(true);
        setTimeout(() => setUserRole('kasiyer'), 500);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[100] overflow-hidden bg-slate-950">
            
            {/* ARKA PLAN EFEKTLERİ */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
                <div className="absolute top-[20%] right-[20%] w-[300px] h-[300px] bg-emerald-600/10 rounded-full blur-[100px]"></div>
            </div>

            {/* GİRİŞ KARTI */}
            <div className="relative z-10 w-full max-w-md p-8 m-4 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-500">
                
                {/* LOGO ALANI */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30">
                        <Coffee size={32} className="text-white" />
                    </div>
                    {/* 👇 GÜNCELLENEN KISIM: Motto Coffee */}
                    <h1 className="text-3xl font-bold text-white tracking-tight">Motto Coffee</h1>
                    <p className="text-slate-400 text-sm mt-2">İşletme Yönetim Paneli</p>
                </div>

                {/* FORM */}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Yönetici Şifresi</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock size={18} className="text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                            </div>
                            
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                className="w-full py-4 pl-11 pr-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:bg-slate-800 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs animate-in slide-in-from-left-2">
                            <ShieldCheck size={14} />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <>Giriş Yap <ArrowRight size={18} /></>}
                    </button>
                </form>

                {/* AYIRAÇ */}
                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700/50"></div></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-900/50 backdrop-blur px-2 text-slate-500">veya</span></div>
                </div>

                {/* KASİYER GİRİŞİ */}
                <button
                    onClick={handleCashierLogin}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white rounded-xl transition-all flex items-center justify-center gap-3 group"
                >
                    <div className="p-1.5 bg-slate-700 rounded-lg group-hover:bg-slate-600 transition-colors"><User size={16} /></div>
                    <span className="text-sm font-medium">Personel / Kasiyer Girişi</span>
                </button>

                <p className="text-center text-[10px] text-slate-600 mt-8">
                    &copy; 2025 Motto Coffee Collection. Güvenli Sistem.
                </p>
            </div>
        </div>
    );
};

export default AuthScreen;