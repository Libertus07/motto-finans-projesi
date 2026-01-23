// components/pos/Modals/LoyaltyModal.tsx
import React from 'react';
import { X, Phone, Search, Zap, Gift, RotateCcw, Check, UserPlus, Star, ArrowRight } from 'lucide-react';
import Numpad from '../shared/Numpad';
import { LoyaltyCustomer } from '../../../types';

interface LoyaltyModalProps {
    isOpen: boolean;
    onClose: () => void;
    loyaltyPhone?: string;
    loyaltyCustomer: LoyaltyCustomer | null;
    processing: boolean;
    isDarkMode: boolean;
    onPhoneChange: (phone: string) => void;
    onSearch: (phone: string) => void;
    onRedeemPoints: (points: number) => void;
    onResetCustomer: () => void;
    onNewCustomer: () => void;
}

const LoyaltyModal: React.FC<LoyaltyModalProps> = ({
    isOpen,
    onClose,
    loyaltyPhone = '', // Default değer
    loyaltyCustomer,
    processing,
    isDarkMode,
    onPhoneChange,
    onSearch,
    onRedeemPoints,
    onResetCustomer, // Yeni: Müşteriyi temizleme fonksiyonu
    onNewCustomer // Yeni: Yeni müşteri kayıt fonksiyonu
}) => {
    if (!isOpen) return null;

    const handleNumpadInput = (value: number | string) => {
        const current = String(loyaltyPhone || '');
        if (value === 'C') {
            onPhoneChange('');
        } else if (value === 'BACK') {
            onPhoneChange(current.slice(0, -1));
        } else {
            // ✨ LIMIT GÜNCELLENDİ: 10 hane sınırı
            if (current.length < 10) {
                onPhoneChange(current + value);
            }
        }
    };

    return (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300">
            <div className={`
                w-[360px] md:w-[420px] rounded-[32px] shadow-2xl overflow-hidden 
                transition-all duration-500 relative
                ${isDarkMode
                    ? 'bg-[#1e2330] border border-white/10'
                    : 'bg-white border border-slate-200 shadow-xl'}
            `}>

                {/* KAPAT BUTONU */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 rounded-full transition-colors bg-black/10 hover:bg-black/20 dark:text-white/50 text-slate-500"
                >
                    <X size={20} />
                </button>

                {!loyaltyCustomer ? (
                    <div className="p-6 flex flex-col items-center gap-6">
                        <div className="flex flex-col items-center gap-2 mt-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                                <Phone size={32} className="text-white" />
                            </div>
                            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                Müşteri Tanıma
                            </h2>
                        </div>

                        {/* --- AKILLI VE PREMIUM NUMARA EKRANI --- */}
                        <div className="w-full flex flex-col items-center gap-4 mb-2">
                            {/* Üst Bilgi: Daha zarif bir çizgi */}
                            <div className="flex items-center gap-2 opacity-30">
                                <span className={`text-[9px] font-black uppercase tracking-[0.4em] ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                    VOLT ÜYE GİRİŞİ
                                </span>
                            </div>

                            {/* Segmented Display: Daha dar ve mobil uyumlu [3 + 3 + 4] Düzeni */}
                            <div className={`
        flex gap-1 md:gap-1.5 py-5 px-4 rounded-[24px] transition-all duration-500 border
        ${isDarkMode ? 'bg-black/20 border-white/5 shadow-inner' : 'bg-slate-50 border-slate-100'}
    `}>
                                {[...Array(10)].map((_, i) => {
                                    const isActive = loyaltyPhone.length === i;
                                    const isFilled = loyaltyPhone.length > i;

                                    return (
                                        <React.Fragment key={i}>
                                            {/* Sadece 2 ana ayırıcı kullanarak yer kazandık */}
                                            {(i === 3 || i === 6) && (
                                                <div className="w-0.5 flex items-center justify-center opacity-10 text-indigo-500">-</div>
                                            )}

                                            <div className={`
                        relative w-6 h-9 md:w-8 md:h-11 flex items-center justify-center 
                        rounded-xl border-[1.5px] transition-all duration-300
                        ${isFilled
                                                    ? (isDarkMode ? 'border-indigo-500/50 bg-indigo-500/10 text-white' : 'border-indigo-600 bg-indigo-50 text-indigo-600')
                                                    : (isActive
                                                        ? 'border-indigo-400 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                                                        : 'border-slate-700/10 text-slate-500/20')
                                                }
                    `}>
                                                <span className={`text-lg md:text-xl font-black font-mono ${isFilled ? 'scale-100' : 'opacity-20 text-[10px]'}`}>
                                                    {loyaltyPhone[i] || '•'}
                                                </span>

                                                {/* Aktif hane alt çizgisi */}
                                                {isActive && (
                                                    <div className="absolute -bottom-1 w-1.5 h-0.5 bg-indigo-500 rounded-full"></div>
                                                )}
                                            </div>
                                        </React.Fragment>
                                    );
                                })}
                            </div>

                            {/* Bilgi Mesajı: Alanı daraltmak için küçültüldü */}
                            <div className="h-3 flex items-center">
                                {loyaltyPhone.length > 0 && loyaltyPhone.length < 10 && (
                                    <span className="text-[9px] font-bold text-slate-500/60 uppercase tracking-widest">
                                        {10 - loyaltyPhone.length} Hane Kaldı
                                    </span>
                                )}
                                {loyaltyPhone.length === 10 && (
                                    <div className="flex items-center gap-1.5 text-emerald-500 animate-in fade-in">
                                        <Check size={12} className="stroke-[3]" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">HAZIR</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* NUMPAD */}
                        <div className="w-full scale-90 origin-top">
                            <Numpad onInput={handleNumpadInput} showDot={false} isDarkMode={isDarkMode} />
                        </div>
                        {/* AKSİYON BUTONLARI GRUBU */}
                        <div className="w-full grid grid-cols-12 gap-3 mt-4">
                            {/* ÜYEYİ GETİR (ANA BUTON) */}
                            <button
                                onClick={() => onSearch(loyaltyPhone)}
                                disabled={loyaltyPhone.length < 10 || processing}
                                className={`
                                    col-span-8 h-16 rounded-[24px] font-black text-[11px] tracking-[2px]
                                    flex items-center justify-center gap-3 transition-all duration-500
                                    ${loyaltyPhone.length === 10
                                        ? 'bg-indigo-600 text-white shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] hover:bg-indigo-500 active:scale-95'
                                        : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'}
                                `}
                            >
                                {processing ? <Zap className="animate-spin" size={18} /> : <Search size={18} />}
                                ÜYEYİ GETİR
                            </button>

                            {/* YENİ ÜYE KAYIT (YARDIMCI BUTON) */}
                            <button
                                onClick={() => onNewCustomer()} // Yeni kayıt modalını açar
                                className={`
                                    col-span-4 h-16 rounded-[24px] font-black text-[11px] flex flex-col items-center justify-center gap-1
                                    transition-all duration-300 border-2
                                    ${isDarkMode
                                        ? 'bg-slate-900 border-white/5 text-slate-400 hover:text-white hover:border-indigo-500/50'
                                        : 'bg-slate-50 border-slate-100 text-slate-500 hover:text-indigo-600 hover:border-indigo-200'}
                                `}
                            >
                                <UserPlus size={20} />
                                <span>YENİ ÜYE</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="relative">
                        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600" />

                        <div className="relative z-10 flex flex-col items-center pt-8 px-6 pb-6 gap-6">
                            {/* GERİ DÖN BUTONU */}
                            <button
                                onClick={onResetCustomer}
                                className="absolute top-0 left-0 p-2 text-white/70 hover:text-white transition-colors"
                                title="Farklı Müşteri Ara"
                            >
                                <RotateCcw size={18} />
                            </button>

                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-slate-900 border-4 border-[#1e2330] flex items-center justify-center shadow-2xl">
                                    <span className="text-3xl font-black text-white">
                                        {loyaltyCustomer.name?.[0]}
                                    </span>
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] font-black px-2 py-1 rounded-full border-2 border-[#1e2330]">
                                    {loyaltyCustomer.tier || 'Müşteri'}
                                </div>
                            </div>

                            <div className="text-center">
                                <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                    {loyaltyCustomer.name} {loyaltyCustomer.surname}
                                </h2>
                                <p className="text-xs text-slate-400">Son Ziyaret: {loyaltyCustomer.lastVisit || 'Yeni'}</p>
                            </div>

                            {/* GELİŞMİŞ ÜYE İSTATİSTİKLERİ  */}
                            <div className="w-full grid grid-cols-3 gap-2">
                                <div className={`p-3 rounded-2xl flex flex-col items-center justify-center border ${isDarkMode ? 'bg-slate-800/30 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase">Üyelik</span>
                                    <span className={`text-xs font-black mt-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                        {loyaltyCustomer.createdAt ? new Date(loyaltyCustomer.createdAt).getFullYear() : '2024'}
                                    </span>
                                </div>
                                <div className={`p-3 rounded-2xl flex flex-col items-center justify-center border ${isDarkMode ? 'bg-slate-800/30 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase">Sıklık</span>
                                    <span className={`text-xs font-black mt-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                        {loyaltyCustomer.totalOrders || 0} Kez
                                    </span>
                                </div>
                                <div className={`p-3 rounded-2xl flex flex-col items-center justify-center border ${isDarkMode ? 'bg-slate-800/30 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase">Volt</span>
                                    <span className="text-xs font-black mt-1 text-yellow-500">
                                        {loyaltyCustomer.points || 0}
                                    </span>
                                </div>
                            </div>

                            {/* PUAN KARTI */}
                            <div className={`w-full p-4 rounded-2xl border flex items-center justify-between ${isDarkMode ? 'bg-slate-800/50 border-white/5' : 'bg-slate-50 border-slate-200'
                                }`}>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Mevcut Volt</span>
                                    <span className="text-3xl font-black text-yellow-500">{loyaltyCustomer.points || 0} V</span>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">
                                    <Star size={24} fill="currentColor" />
                                </div>
                            </div>

                            {/* HIZLI İŞLEMLER */}
                            <div className="w-full grid grid-cols-2 gap-3">
                                {[
                                    { p: 100, d: 10, color: 'purple', icon: Gift },
                                    { p: 250, d: 25, color: 'pink', icon: Zap }
                                ].map((promo) => (
                                    <button
                                        key={promo.p}
                                        onClick={() => { onRedeemPoints(promo.p); onClose(); }}
                                        disabled={loyaltyCustomer.points < promo.p}
                                        className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all active:scale-95 disabled:opacity-30 ${isDarkMode ? 'bg-slate-800 border-white/5' : 'bg-white border-slate-200'
                                            }`}
                                    >
                                        <promo.icon size={18} className={`text-${promo.color}-500`} />
                                        <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{promo.d} TL İndirim</span>
                                        <span className="text-[10px] text-slate-500">{promo.p} Volt</span>
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => { /* Özel miktar logic */ }}
                                className={`w-full h-12 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 ${isDarkMode ? 'border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10' : 'border-indigo-200 text-indigo-600 hover:bg-indigo-50'
                                    }`}
                            >
                                <ArrowRight size={16} />
                                <span className="text-sm font-bold">Özel Miktar Kullan</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoyaltyModal;
