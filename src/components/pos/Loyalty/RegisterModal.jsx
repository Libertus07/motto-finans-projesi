// components/pos/Loyalty/RegisterModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { X, User, UserPlus, ShieldCheck, Phone, Calendar } from 'lucide-react';

const RegisterModal = ({ isOpen, onClose, phone: initialPhone, onRegister, isDarkMode }) => {
    // Form State'leri
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [birthday, setBirthday] = useState('');

    const initializedRef = useRef(false);

    // Modal açıldığında LoyaltyModal'dan gelen numarayı set et
    useEffect(() => {
        if (isOpen && !initializedRef.current) {
            setPhoneNumber(initialPhone || '');
            initializedRef.current = true;
        } else if (!isOpen) {
            initializedRef.current = false;
        }
    }, [isOpen, initialPhone]);

    if (!isOpen) return null;

    // Telefon numarasını yazarken formatla: 5XX XXX XX XX
    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Sadece rakamlar
        if (value.length <= 10) {
            setPhoneNumber(value);
        }
    };

    const isFormValid = name.length > 1 && surname.length > 1 && phoneNumber.length === 10;

    return (
        <div className="absolute inset-0 z-[110] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
            <div className={`
                w-full max-w-[420px] rounded-[48px] shadow-2xl overflow-hidden border
                ${isDarkMode ? 'bg-[#0F1219] border-white/5' : 'bg-white border-slate-200'}
            `}>

                {/* HEADER */}
                <div className="p-10 pb-6 flex justify-between items-start">
                    <div className="flex flex-col gap-2">
                        <div className="w-14 h-14 rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 mb-2">
                            <UserPlus size={28} />
                        </div>
                        <h2 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            Yeni Üye Kaydı
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-3 rounded-full hover:bg-white/5 text-slate-500 transition-colors">
                        <X size={24}/>
                    </button>
                </div>

                <div className="px-10 pb-10 flex flex-col gap-5">

                    {/* DÜZENLENEBİLİR TELEFON ALANI */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-indigo-500 uppercase ml-2 tracking-widest">Telefon Numarası</label>
                        <div className="relative">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500">
                                <Phone size={20} />
                            </div>
                            <input
                                type="text"
                                value={phoneNumber}
                                onChange={handlePhoneChange}
                                placeholder="5XX XXX XX XX"
                                className={`w-full h-16 pl-14 pr-6 rounded-3xl border-2 outline-none transition-all font-black text-lg tracking-widest ${
                                    isDarkMode
                                        ? 'bg-slate-900 border-white/5 text-indigo-400 focus:border-indigo-500/50'
                                        : 'bg-indigo-50/30 border-indigo-100 text-indigo-600 focus:border-indigo-200'
                                }`}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* AD GİRİŞİ */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Ad</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value.toUpperCase())}
                                placeholder="EMRULLAH"
                                className={`w-full h-16 px-6 rounded-3xl border-2 outline-none transition-all font-bold ${
                                    isDarkMode
                                        ? 'bg-slate-900 border-white/5 text-white focus:border-indigo-500/50'
                                        : 'bg-slate-50 border-slate-100 text-slate-800 focus:border-indigo-200'
                                }`}
                            />
                        </div>

                        {/* SOYAD GİRİŞİ */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Soyad</label>
                            <input
                                type="text"
                                value={surname}
                                onChange={(e) => setSurname(e.target.value.toUpperCase())}
                                placeholder="GÖKSAL"
                                className={`w-full h-16 px-6 rounded-3xl border-2 outline-none transition-all font-bold ${
                                    isDarkMode
                                        ? 'bg-slate-900 border-white/5 text-white focus:border-indigo-500/50'
                                        : 'bg-slate-50 border-slate-100 text-slate-800 focus:border-indigo-200'
                                }`}
                            />
                        </div>
                    </div>

                    {/* DOĞUM GÜNÜ GİRİŞİ */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Doğum Tarihi (Gün/Ay)</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <Calendar size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Örn: 15/05"
                                value={birthday}
                                onChange={(e) => setBirthday(e.target.value)}
                                className={`w-full h-14 pl-12 pr-4 rounded-2xl border-2 outline-none transition-all font-bold ${
                                    isDarkMode ? 'bg-slate-900 border-white/5 text-white' : 'bg-slate-50 border-slate-100'
                                }`}
                            />
                        </div>
                    </div>

                    {/* KAYIT BUTONU */}
                    <button
                        onClick={() => onRegister({ name, surname, phone: phoneNumber, birthday })}
                        disabled={!isFormValid}
                        className={`
                            w-full h-18 rounded-[32px] font-black text-sm tracking-[3px]
                            flex items-center justify-center gap-3 transition-all duration-500 mt-4
                            ${isFormValid
                                ? 'bg-indigo-600 text-white shadow-[0_24px_48px_-12px_rgba(79,70,229,0.5)] hover:bg-indigo-500 active:scale-95'
                                : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'}
                        `}
                    >
                        <ShieldCheck size={22} />
                        KAYDI TAMAMLA
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegisterModal;