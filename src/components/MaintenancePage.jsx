import React, { useEffect, useState } from 'react';
import { Wrench, Clock, AlertCircle, Coffee } from 'lucide-react';

const MaintenancePage = () => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    // 1. Bakım başlangıç zamanı hafızada var mı kontrol et
    const STORAGE_KEY = 'motto_maintenance_start_time';
    let storedStartTime = localStorage.getItem(STORAGE_KEY);

    if (!storedStartTime) {
      // Yoksa şu anki zamanı başlangıç olarak ayarla ve kaydet
      storedStartTime = Date.now();
      localStorage.setItem(STORAGE_KEY, storedStartTime);
    }

    // 2. Geçen süreyi hesaplayan fonksiyon
    const calculateElapsedTime = () => {
      const now = Date.now();
      // Farkı milisaniyeden saniyeye çeviriyoruz
      const diffInSeconds = Math.floor((now - parseInt(storedStartTime)) / 1000);
      setElapsedTime(diffInSeconds);
    };

    // İlk açılışta hemen hesapla (1 saniye beklememek için)
    calculateElapsedTime();

    // Her saniye güncelle
    const timer = setInterval(calculateElapsedTime, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    // Tek haneli sayıların önüne 0 ekleyelim (01:05:09 gibi görünmesi için)
    const h = hours > 0 ? `${hours}h ` : '';
    const m = minutes < 10 ? `0${minutes}` : minutes;
    const s = secs < 10 ? `0${secs}` : secs;
    
    return `${h}${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-md w-full">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl mb-4 animate-bounce">
              <Wrench className="text-indigo-400" size={32} />
            </div>
            
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
              Sistem Bakımda
            </h1>
            <p className="text-slate-400 text-sm">
              Daha iyi hizmet için güncelleniyor
            </p>
          </div>

          {/* Status cards */}
          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl border border-slate-600/30 hover:border-indigo-500/30 transition-colors">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-sm text-slate-300">Veritabanı: Optimize ediliyor</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl border border-slate-600/30 hover:border-indigo-500/30 transition-colors">
              <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
              <span className="text-sm text-slate-300">Yeni özellikler: Ekleniyor</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl border border-slate-600/30 hover:border-indigo-500/30 transition-colors">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-sm text-slate-300">Güvenlik: Kontrol edildi</span>
            </div>
          </div>

          {/* Timer */}
          <div className="bg-gradient-to-r from-indigo-600/10 to-purple-600/10 border border-indigo-500/20 rounded-xl p-4 mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="text-indigo-400" size={18} />
              <p className="text-xs text-slate-400 font-semibold uppercase">Geçen Süre</p>
            </div>
            <p className="text-2xl font-bold text-indigo-300 font-mono">
              {formatTime(elapsedTime)}
            </p>
          </div>

          {/* Info box */}
          <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-4 mb-8">
            <div className="flex gap-3">
              <AlertCircle className="text-amber-400 flex-shrink-0 mt-1" size={20} />
              <div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Sistem yakında çevrimiçi olacak. Lütfen kısa bir süre sonra tekrar deneyin.
                </p>
              </div>
            </div>
          </div>

          {/* Coffee tip */}
          <div className="bg-slate-700/20 border border-slate-600/30 rounded-xl p-3 flex items-center gap-3">
            <Coffee className="text-amber-500 flex-shrink-0" size={20} />
            <p className="text-xs text-slate-400">
              <span className="font-semibold text-slate-300">İpucu:</span> Bu sırada bir kahve alın ☕
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
            <p className="text-xs text-slate-500 mb-3">Motto Coffee • Yönetim Sistemi</p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs text-slate-400">Sistem bakımda</span>
            </div>
          </div>
        </div>

        {/* Decorative element */}
        <div className="mt-6 text-center">
          <p className="text-slate-600 text-xs">v1.0.2-maintenance</p>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;