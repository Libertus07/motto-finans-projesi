// components/NetworkStatus.jsx

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, CloudOff } from 'lucide-react';

const NetworkStatus = () => {
    const [status, setStatus] = useState('online'); // online, offline, syncing
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleOffline = () => {
            setStatus('offline');
            setIsVisible(true);
        };

        const handleOnline = () => {
            setStatus('syncing');
            setIsVisible(true);
            
            // 2 saniye "Senkronize ediliyor" göster, sonra "Başarılı" yap
            setTimeout(() => {
                setStatus('restored');
                // 3 saniye sonra gizle
                setTimeout(() => {
                    setIsVisible(false);
                    setStatus('online');
                }, 3000);
            }, 2000);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isVisible && status === 'online') return null;

    // Duruma göre renk ve ikon ayarları
    const config = {
        offline: {
            bg: 'bg-slate-900/90',
            border: 'border-red-500/50',
            icon: <WifiOff size={18} className="text-red-500 animate-pulse" />,
            title: 'Bağlantı Koptu',
            desc: 'Çevrimdışı moddasınız. Veriler cihazda saklanıyor.',
            indicator: 'bg-red-500'
        },
        syncing: {
            bg: 'bg-slate-900/90',
            border: 'border-amber-500/50',
            icon: <RefreshCw size={18} className="text-amber-500 animate-spin" />,
            title: 'Bağlanıyor...',
            desc: 'Veriler sunucuyla eşleştiriliyor.',
            indicator: 'bg-amber-500'
        },
        restored: {
            bg: 'bg-emerald-900/90',
            border: 'border-emerald-500/50',
            icon: <CheckCircle2 size={18} className="text-emerald-400" />,
            title: 'Tekrar Çevrimiçi',
            desc: 'Sistem başarıyla senkronize edildi.',
            indicator: 'bg-emerald-500'
        }
    };

    const current = config[status] || config.offline;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className={`
                flex items-center gap-4 px-5 py-3 rounded-2xl backdrop-blur-md border shadow-2xl transition-all duration-500
                ${current.bg} ${current.border} min-w-[320px] md:min-w-[400px]
            `}>
                {/* İkon Kutusu */}
                <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                        {current.icon}
                    </div>
                    {/* Durum Noktası */}
                    <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${current.indicator} animate-pulse`}></div>
                </div>

                {/* Metinler */}
                <div className="flex-1">
                    <h4 className="text-sm font-bold text-white leading-tight mb-0.5">{current.title}</h4>
                    <p className="text-[10px] font-medium text-slate-400">{current.desc}</p>
                </div>

                {/* Bulut İkonu (Dekoratif) */}
                <div className="opacity-20">
                    <CloudOff size={24} className="text-white" />
                </div>
            </div>
        </div>
    );
};

export default NetworkStatus;