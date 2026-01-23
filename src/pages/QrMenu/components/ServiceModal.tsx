import React, { useState } from 'react';
import { X, Bell, Receipt, Droplets, Utensils, Zap, Send, CheckCircle2 } from 'lucide-react';
import { db } from '../../../services/firebase';
import { COLLECTIONS } from '../../../utils/firebasePaths';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

interface ServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    tableId: string | undefined;
    t: (key: string) => string;
}

const ServiceModal: React.FC<ServiceModalProps> = ({ isOpen, onClose, tableId, t }) => {
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const serviceOptions = [
        { id: 'waiter', label: 'Garson Çağır', icon: Bell, color: 'bg-amber-500' },
        { id: 'bill', label: 'Hesap Lütfen', icon: Receipt, color: 'bg-emerald-500' },
        { id: 'water', label: 'Su Rica Ediyorum', icon: Droplets, color: 'bg-blue-500' },
        { id: 'napkin', label: 'Peçete/Tuz/Biber', icon: Utensils, color: 'bg-slate-500' },
        { id: 'special', label: 'Özel İstek', icon: Zap, color: 'bg-purple-500' },
    ];

    const handleCallService = async (type: string, label: string) => {
        if (!tableId) return;
        setSending(true);
        try {
            const notificationsRef = collection(db, COLLECTIONS.NOTIFICATIONS);
            await addDoc(notificationsRef, {
                type: 'service_call',
                subType: type,
                title: label,
                message: `Masa ${tableId} servis bekliyor: ${label}`,
                tableId,
                status: 'pending',
                timestamp: serverTimestamp(),
            });
            setSent(true);
            setTimeout(() => {
                setSent(false);
                onClose();
            }, 2000);
        } catch (error) {
            console.error("Service call error:", error);
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-500">
                {/* Header */}
                <div className="bg-[#432818] p-8 pb-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white/60 hover:bg-white/20 transition-all z-20"
                    >
                        <X size={20} />
                    </button>

                    <div className="relative z-10">
                        <h2 className="text-3xl font-black text-[#FDFBF7] font-cinzel tracking-wider">MASA SERVİSİ</h2>
                        <p className="text-[#D4AF37] text-xs font-bold tracking-[0.2em] uppercase mt-2">Masa {tableId}</p>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 -mt-8 relative z-10 pb-8">
                    <div className="bg-[#FDFBF7] rounded-[2rem] p-4 shadow-xl border border-[#432818]/5">
                        {sent ? (
                            <div className="py-12 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle2 size={48} className="text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-bold text-[#432818] font-cinzel">İSTEK GÖNDERİLDİ</h3>
                                <p className="text-[#432818]/60 text-sm mt-2 font-medium">Ekibimiz en kısa sürede masanızda olacak.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {serviceOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        disabled={sending}
                                        onClick={() => handleCallService(option.id, option.label)}
                                        className="group relative flex items-center gap-4 p-4 bg-white hover:bg-[#432818] rounded-2xl border border-[#432818]/5 transition-all duration-300 active:scale-[0.98]"
                                    >
                                        <div className={`w-12 h-12 ${option.color} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                            <option.icon size={24} />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <span className="block font-bold text-[#432818] group-hover:text-white transition-colors font-cinzel text-sm">{option.label}</span>
                                        </div>
                                        <Send size={18} className="text-[#432818]/20 group-hover:text-[#D4AF37] transition-colors" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Tip */}
                <div className="px-8 pb-8 text-center">
                    <p className="text-[#432818]/40 text-[10px] font-bold tracking-widest uppercase">
                        MOTTO PREMIUM EXPERIENCE
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ServiceModal;
