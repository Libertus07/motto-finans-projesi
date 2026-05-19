import React, { useState } from 'react';
import {
    X,
    Bell,
    Receipt,
    CheckCircle2,
    HelpCircle,
    Utensils,
    Send,
    ArrowLeft
} from 'lucide-react';
import { db } from '../../../services/firebase';
import { COLLECTIONS } from '../../../utils/firebasePaths';
import {
    addDoc,
    collection,
    serverTimestamp,
    doc,
    updateDoc,
    arrayUnion,
    onSnapshot
} from 'firebase/firestore';

interface ServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    tableId: string | undefined;
    t?: (key: string) => string;
}

const ServiceModal: React.FC<ServiceModalProps> = ({ isOpen, onClose, tableId }) => {
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [sentLabel, setSentLabel] = useState('');
    const [hasActiveRequest, setHasActiveRequest] = useState(false);
    const [otherMode, setOtherMode] = useState(false);
    const [otherNote, setOtherNote] = useState('');

    React.useEffect(() => {
        if (!tableId) return;

        const tableRef = doc(db, COLLECTIONS.TABLES, tableId);

        const unsubscribe = onSnapshot(tableRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const pending = data.requests?.some((request: any) => request.status === 'pending');
                setHasActiveRequest(!!pending);
            }
        });

        return () => unsubscribe();
    }, [tableId]);

    React.useEffect(() => {
        if (!isOpen) {
            setOtherMode(false);
            setOtherNote('');
            setSent(false);
        }
    }, [isOpen]);

    const serviceOptions = [
        {
            id: 'waiter',
            label: 'Garson Çağır',
            sub: 'Personel yardımı',
            icon: Bell
        },
        {
            id: 'bill',
            label: 'Hesabı İste',
            sub: 'Ödeme hazırlığı',
            icon: Receipt
        },
        {
            id: 'cutlery',
            label: 'Peçete / Çatal',
            sub: 'Eksik servis',
            icon: Utensils
        },
        {
            id: 'other',
            label: 'Diğer Konular',
            sub: 'Açıklama yaz',
            icon: HelpCircle
        }
    ];

    const closeModal = () => {
        setOtherMode(false);
        setOtherNote('');
        setSent(false);
        onClose();
    };

    const handleCallService = async (type: string, label: string, note?: string) => {
        if (!tableId || hasActiveRequest) return;

        setSending(true);

        try {
            const cleanNote = note?.trim();

            const notificationsRef = collection(db, COLLECTIONS.NOTIFICATIONS);

            await addDoc(notificationsRef, {
                type: 'service_call',
                subType: type,
                title: label,
                message: cleanNote
                    ? `Masa ${tableId} servis bekliyor: ${label} - Not: ${cleanNote}`
                    : `Masa ${tableId} servis bekliyor: ${label}`,
                tableId,
                note: cleanNote || '',
                status: 'pending',
                timestamp: serverTimestamp()
            });

            const tableRef = doc(db, COLLECTIONS.TABLES, tableId);

            await updateDoc(tableRef, {
                requests: arrayUnion({
                    id: Date.now().toString(),
                    type,
                    label,
                    note: cleanNote || '',
                    status: 'pending',
                    time: new Date().toISOString()
                })
            });

            setSentLabel(label);
            setSent(true);
            setOtherMode(false);
            setOtherNote('');

            setTimeout(() => {
                setSent(false);
            }, 2200);
        } catch (error) {
            console.error('Service call error:', error);
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/55 backdrop-blur-sm px-4 py-6">
            <button
                onClick={closeModal}
                className="absolute inset-0 w-full h-full cursor-default"
                aria-label="Garson penceresini kapat"
            />

            <article className="relative w-full max-w-md max-h-[calc(100dvh-48px)] overflow-y-auto rounded-[2rem] bg-[#FDFBF7] border border-[#432818]/10 shadow-[0_30px_90px_rgba(0,0,0,0.35)] animate-in zoom-in-95 duration-300">
                <button
                    onClick={closeModal}
                    className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-white text-[#432818] flex items-center justify-center shadow-lg active:scale-95"
                    aria-label="Kapat"
                >
                    <X size={22} />
                </button>

                <header className="px-6 pt-7 pb-5 text-center">
                    <div className="mx-auto w-16 h-16 rounded-[1.5rem] bg-[#432818] text-[#D4AF37] flex items-center justify-center shadow-[0_14px_35px_rgba(67,40,24,0.22)] mb-4">
                        <Bell size={30} />
                    </div>

                    <p className="text-[#D4AF37] text-[10px] font-black tracking-[0.28em] uppercase mb-2">
                        Garson
                    </p>

                    <h2 className="text-2xl font-black text-[#432818] leading-tight">
                        Size nasıl yardımcı olalım?
                    </h2>

                    <p className="text-[#432818]/55 font-semibold text-sm mt-2">
                        {tableId ? `Masa: ${tableId}` : 'Masa bilgisi bulunamadı'}
                    </p>
                </header>

                <section className="px-5 pb-6">
                    {!tableId ? (
                        <div className="rounded-[1.8rem] bg-white border border-red-500/10 p-5 text-center">
                            <h3 className="font-black text-[#432818] mb-2">
                                Masa numarası bulunamadı
                            </h3>
                            <p className="text-[#432818]/55 text-sm leading-relaxed">
                                Garson çağırma özelliğinin çalışması için QR linkinde masa numarası olmalı.
                            </p>
                        </div>
                    ) : sent ? (
                        <div className="py-8 flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-[#432818] rounded-full flex items-center justify-center mb-5 shadow-xl shadow-[#432818]/20 ring-4 ring-[#D4AF37]/20">
                                <CheckCircle2 size={50} className="text-[#D4AF37]" />
                            </div>

                            <h3 className="text-xl font-black text-[#432818] mb-2">
                                Talebiniz iletildi
                            </h3>

                            <p className="text-[#432818]/60 text-sm font-semibold">
                                {sentLabel} isteğiniz personelimize bildirildi.
                            </p>
                        </div>
                    ) : hasActiveRequest ? (
                        <div className="py-8 flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-[#432818]/5 rounded-full flex items-center justify-center mb-5 border-2 border-dashed border-[#432818]/20 animate-pulse">
                                <Bell size={42} className="text-[#432818]/45" />
                            </div>

                            <h3 className="text-lg font-black text-[#432818] mb-2">
                                Talebiniz alındı
                            </h3>

                            <p className="text-[#432818]/60 text-sm font-semibold leading-relaxed px-3">
                                Personeliniz talebinizi onaylayana kadar yeni bir istek gönderilemez.
                            </p>
                        </div>
                    ) : otherMode ? (
                        <div className="space-y-4">
                            <button
                                onClick={() => {
                                    setOtherMode(false);
                                    setOtherNote('');
                                }}
                                className="inline-flex items-center gap-2 text-[#432818]/60 font-black text-sm active:scale-95"
                            >
                                <ArrowLeft size={18} />
                                Geri dön
                            </button>

                            <div className="rounded-[1.8rem] bg-white border border-[#432818]/10 p-5 shadow-[0_10px_28px_rgba(67,40,24,0.05)]">
                                <div className="w-12 h-12 rounded-[1.2rem] bg-[#432818]/5 text-[#432818] flex items-center justify-center mb-4">
                                    <HelpCircle size={24} />
                                </div>

                                <h3 className="font-black text-[#432818] text-xl mb-2">
                                    Diğer Konular
                                </h3>

                                <p className="text-[#432818]/55 text-sm font-semibold leading-relaxed mb-4">
                                    Personelimize iletmek istediğiniz konuyu kısa bir şekilde yazabilirsiniz.
                                </p>

                                <textarea
                                    value={otherNote}
                                    onChange={(event) => setOtherNote(event.target.value)}
                                    placeholder="Örn: Masamızla ilgilenebilir misiniz?"
                                    className="w-full min-h-[120px] rounded-[1.4rem] bg-[#F7EFE6] border border-[#432818]/10 p-4 text-[#432818] font-semibold outline-none focus:border-[#D4AF37] resize-none"
                                />

                                <button
                                    disabled={sending || otherNote.trim().length < 3}
                                    onClick={() => handleCallService('other', 'Diğer Konular', otherNote)}
                                    className="mt-4 w-full h-14 rounded-[1.4rem] bg-[#432818] text-[#D4AF37] font-black flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
                                >
                                    <Send size={19} />
                                    Talebi Gönder
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {serviceOptions.map((option) => (
                                <button
                                    key={option.id}
                                    disabled={sending}
                                    onClick={() => {
                                        if (option.id === 'other') {
                                            setOtherMode(true);
                                            return;
                                        }

                                        handleCallService(option.id, option.label);
                                    }}
                                    className="w-full rounded-[1.6rem] bg-white border border-[#432818]/10 p-4 flex items-center gap-4 text-left shadow-[0_10px_28px_rgba(67,40,24,0.05)] active:scale-[0.98] transition-all disabled:opacity-60"
                                >
                                    <div className="w-12 h-12 rounded-[1.2rem] bg-[#432818]/5 text-[#432818] flex items-center justify-center shrink-0">
                                        <option.icon size={23} />
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="font-black text-[#432818]">
                                            {option.label}
                                        </h3>
                                        <p className="text-[#432818]/50 text-sm font-semibold">
                                            {option.sub}
                                        </p>
                                    </div>

                                    <div className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                                </button>
                            ))}
                        </div>
                    )}

                    <p className="mt-5 text-[11px] text-center text-[#432818]/45 font-semibold leading-relaxed">
                        Lütfen butonları gereksiz yere kullanmayınız. Talebiniz personele bildirim olarak düşecektir.
                    </p>
                </section>
            </article>
        </div>
    );
};

export default ServiceModal;