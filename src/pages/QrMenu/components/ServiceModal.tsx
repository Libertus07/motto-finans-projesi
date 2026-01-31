import React, { useState } from 'react';
import { X, Bell, Receipt, CheckCircle2, Cigarette, HelpCircle } from 'lucide-react';
import { db } from '../../../services/firebase';
import { COLLECTIONS } from '../../../utils/firebasePaths';
import { addDoc, collection, serverTimestamp, doc, updateDoc, arrayUnion, onSnapshot } from 'firebase/firestore';

interface ServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    tableId: string | undefined;
    t: (key: string) => string;
}

const ServiceModal: React.FC<ServiceModalProps> = ({ isOpen, onClose, tableId, t }) => {
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [hasActiveRequest, setHasActiveRequest] = useState(false);

    // Listen for active requests
    React.useEffect(() => {
        if (!tableId) return;

        const tableRef = doc(db, COLLECTIONS.TABLES, tableId);
        const unsubscribe = onSnapshot(tableRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                const pending = data.requests?.some((r: any) => r.status === 'pending');
                setHasActiveRequest(!!pending);
            }
        });

        return () => unsubscribe();
    }, [tableId]);

    const serviceOptions = [
        { id: 'waiter', label: 'GARSON', sub: 'Servis', icon: Bell },
        { id: 'bill', label: 'HESAP', sub: 'Ödeme', icon: Receipt },
        { id: 'ashtray', label: 'KÜLLÜK', sub: 'Değişim', icon: Cigarette },
        { id: 'other', label: 'DİĞER', sub: 'Yardım', icon: HelpCircle },
    ];

    const handleCallService = async (type: string, label: string) => {
        if (!tableId || hasActiveRequest) return;
        setSending(true);
        try {
            // 1. Create Global Notification (For Toast/Sound)
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

            // 2. Update Table Document (For Card Icons)
            const tableRef = doc(db, COLLECTIONS.TABLES, tableId);
            await updateDoc(tableRef, {
                requests: arrayUnion({
                    id: Date.now().toString(),
                    type: type,
                    status: 'pending',
                    time: new Date().toISOString()
                })
            });

            setSent(true);
            // Don't auto-close if we want to show the "Active Request" state
            // But 'sent' state is for the 'Checkmark' animation. 
            // The listener will likely trigger fast enough to switch to 'hasActiveRequest' UI.
            setTimeout(() => {
                setSent(false);
                // onClose(); // Removed auto-close to show the status
            }, 2000);
        } catch (error) {
            console.error("Service call error:", error);
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-[#1a110d]/80 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-sm bg-[#FDFBF7] rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 border border-[#D4AF37]/20">
                {/* Decorative Background */}
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#432818]/5 to-transparent pointer-events-none" />

                {/* Header */}
                <div className="pt-8 pb-4 relative z-10 text-center">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <span className="h-[1px] w-8 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></span>
                        <div className="w-12 h-12 rounded-2xl bg-[#432818] shadow-lg shadow-[#432818]/20 flex items-center justify-center rotate-3 border border-[#D4AF37]/30">
                            <Bell size={24} className="text-[#D4AF37]" />
                        </div>
                        <span className="h-[1px] w-8 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></span>
                    </div>

                    <h2 className="text-2xl font-black text-[#432818] font-cinzel tracking-[0.2em] leading-none mb-1">
                        GARSON
                    </h2>
                    <p className="text-[#D4AF37] text-[10px] font-bold tracking-[0.3em] font-cinzel uppercase">
                        MASA {tableId}
                    </p>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#432818]/5 hover:bg-[#432818]/10 flex items-center justify-center text-[#432818] transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 pb-8 relative z-10">
                    {sent ? (
                        <div className="py-12 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                            <div className="w-24 h-24 bg-[#432818] rounded-full flex items-center justify-center mb-6 shadow-xl shadow-[#432818]/20 ring-4 ring-[#D4AF37]/20 relative">
                                <div className="absolute inset-0 rounded-full border border-[#D4AF37] animate-ping opacity-20"></div>
                                <CheckCircle2 size={48} className="text-[#D4AF37]" />
                            </div>
                            <h3 className="text-xl font-black text-[#432818] font-cinzel tracking-wide mb-2">İLETİLDİ</h3>
                            <p className="text-[#432818]/60 text-xs font-bold uppercase tracking-wider">Garsonunuz yolda</p>
                        </div>
                    ) : hasActiveRequest ? (
                        <div className="py-12 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                            <div className="w-24 h-24 bg-[#432818]/5 rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-[#432818]/20 animate-pulse">
                                <Bell size={40} className="text-[#432818]/40" />
                            </div>
                            <h3 className="text-lg font-black text-[#432818] font-cinzel tracking-wide mb-2">TALEBİNİZ ALINDI</h3>
                            <p className="text-[#432818]/60 text-xs font-bold uppercase tracking-wider px-4">
                                Personelimiz talebinizi onaylayana kadar yeni işlem yapılamaz.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            {serviceOptions.map((option) => (
                                <button
                                    key={option.id}
                                    disabled={sending}
                                    onClick={() => handleCallService(option.id, option.label)}
                                    className={`group relative flex flex-col items-center justify-center p-5 rounded-[2rem] border transition-all duration-300 active:scale-95 bg-white border-[#432818]/5 hover:border-[#D4AF37]/50 hover:shadow-lg hover:shadow-[#D4AF37]/10`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 shadow-sm bg-[#F9F7F5] text-[#432818] border border-[#432818]/5`}>
                                        <option.icon size={20} />
                                    </div>
                                    <div className="text-center">
                                        <span className="block font-black font-cinzel text-sm leading-tight text-[#432818]">
                                            {option.label}
                                        </span>
                                        <span className="text-[9px] font-bold uppercase tracking-wider opacity-60 text-[#432818]">
                                            {option.sub}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="mt-6 text-[9px] text-center text-[#432818]/40 font-bold px-4 leading-tight opacity-70">
                        Her işlemden sonra personelimiz talebinizi onaylayana kadar yeni çağrı yapılamaz. Lütfen butonları gereksiz yere kullanmayınız.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceModal;
