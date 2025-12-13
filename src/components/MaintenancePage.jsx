// components/MaintenancePage.jsx (ULTRA PREMIUM & MINIMALIST)

import React from 'react';
import { 
    Wrench, Coffee, ShieldCheck, RefreshCw, Zap 
} from 'lucide-react';

const MaintenancePage = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-indigo-500/30">
      
      {/* --- SİNEMATİK ARKA PLAN --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Hareketli Işıklar */}
        <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '3s' }}></div>
        {/* Noise Efekti (Kalite Hissi) */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      {/* --- ANA KAPSAYICI --- */}
      <div className="relative z-10 w-full max-w-sm">
        
        {/* LOGO (Header) */}
        <div className="text-center mb-10 animate-in slide-in-from-top-4 duration-700">
            <h1 className="text-4xl font-black text-white tracking-tight flex items-center justify-center gap-2 mb-3">
                MOTTO <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">POS</span>
            </h1>
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-900/50 border border-slate-700/50 backdrop-blur-md">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Sistem Bakım Modu</span>
            </div>
        </div>

        {/* ORTA KART (Glassmorphism) */}
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-1 shadow-2xl relative overflow-hidden group hover:border-white/10 transition-colors duration-500">
            
            {/* Üst Işık Efekti */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>

            <div className="bg-slate-950/40 rounded-[1.8rem] p-8">
                
                {/* 1. HERO İKON (Animasyonlu) */}
                <div className="flex justify-center mb-8">
                    <div className="relative">
                        {/* Arkadaki Glow */}
                        <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 animate-pulse"></div>
                        
                        {/* Dönen Çember */}
                        <div className="w-28 h-28 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center relative shadow-2xl z-10">
                            <RefreshCw size={40} className="text-indigo-400/80 animate-[spin_6s_linear_infinite]" />
                            
                            {/* Ortadaki Sabit İkon */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Wrench size={24} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
                            </div>

                            {/* Sağ Alttaki Rozet */}
                            <div className="absolute bottom-0 right-0 bg-slate-800 border border-slate-600 p-2 rounded-full shadow-lg z-20">
                                <Zap size={14} className="text-amber-500 fill-amber-500" />
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* 2. METİN MESAJI */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-3">
                        Daha Güçlü Dönüyoruz
                    </h2>
                    <p className="text-sm text-slate-400 leading-relaxed font-medium">
                        MottoPOS altyapısında planlı bir güncelleme yapılıyor. Tüm verileriniz güvende.
                    </p>
                </div>

                {/* 3. ALT BİLGİ KARTI (Kahve) */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/10 flex-shrink-0">
                        <Coffee size={20} className="text-amber-500" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-slate-200 mb-0.5">Kısa bir mola</div>
                        <div className="text-[10px] text-slate-500 font-medium leading-tight">
                            Sistem açılana kadar kahvenizi yudumlayın.
                        </div>
                    </div>
                </div>

            </div>
        </div>
        
        {/* FOOTER (Güvenlik Rozeti) */}
        <div className="mt-8 text-center animate-in fade-in duration-1000 delay-300">
            <div className="inline-flex items-center gap-2 text-[10px] font-bold text-slate-600 tracking-widest uppercase opacity-60 hover:opacity-100 transition-opacity cursor-default">
                <ShieldCheck size={12} />
                <span>End-to-End Encrypted & Secure</span>
            </div>
            <div className="mt-2 text-[9px] text-slate-700 font-mono">v1.0.4 • Maintenance</div>
        </div>

      </div>
    </div>
  );
};

export default MaintenancePage;