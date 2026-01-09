// hooks/pos/useLoyalty.js
import { useState, useCallback } from 'react';
import { db, appId } from '../../services/firebase';
import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { CURRENT_SHOP_ID } from '../../constants/pos/config';
import { getLocalISODate } from '../../utils/pos/calculations';

export const useLoyalty = () => {
    const [loyaltyCustomer, setLoyaltyCustomer] = useState(null);
    const [showLoyaltyModal, setShowLoyaltyModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingPhone, setPendingPhone] = useState('');
    const [loyaltyPhone, setLoyaltyPhone] = useState('');
    const [processing, setProcessing] = useState(false);

    // Modal açma/kapatma fonksiyonları
    const openLoyaltyModal = useCallback(() => setShowLoyaltyModal(true), []);
    const closeLoyaltyModal = useCallback(() => setShowLoyaltyModal(false), []);

    // Müşteri yönetimi
    const resetCustomer = useCallback(() => {
        setLoyaltyCustomer(null);
        setLoyaltyPhone('');
    }, []);

    const logoutCustomer = useCallback(() => {
        setLoyaltyCustomer(null);
        setLoyaltyPhone('');
        setShowLoyaltyModal(false);
    }, []);

    const searchCustomer = useCallback(async (phone) => {
        if (!phone) return;
        setProcessing(true);

        try {
            const customerRef = doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'customers', phone);
            const docSnap = await getDoc(customerRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                const today = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
                const currentYear = new Date().getFullYear();

                // ✨ TAM OTOMATİK DOĞUM GÜNÜ HEDİYESİ KONTROLÜ
                if (data.birthday === today && data.lastBirthdayGiftYear !== currentYear) {
                    const BIRTHDAY_BONUS = 100; // Ayarlardan çekilebilir

                    await updateDoc(customerRef, {
                        points: increment(BIRTHDAY_BONUS),
                        lastBirthdayGiftYear: currentYear // Aynı yıl tekrar hediye verilmesini engeller
                    });

                    // İşlem geçmişine (Drawer) hediye kaydı ekle
                    await addDoc(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'transactions'), {
                        customerPhone: phone,
                        type: 'gift',
                        amount: 0,
                        points: BIRTHDAY_BONUS,
                        desc: 'Otomatik Doğum Günü Hediyesi 🎂',
                        date: getLocalISODate(),
                        timestamp: serverTimestamp()
                    });

                    alert(`🎉 Bugün müşterimizin doğum günü! ${BIRTHDAY_BONUS} M-Coin otomatik tanımlandı.`);
                }

                setLoyaltyCustomer({ id: docSnap.id, ...data });
            } else {
                setPendingPhone(phone);
                setShowConfirmDialog(true);
            }
        } catch (error) {
            console.error("Sorgulama Hatası:", error);
        } finally {
            setProcessing(false);
        }
    }, []); // Removed appId from dependencies

    // Puan harca
    const redeemPoints = useCallback(async (points, onApplyDiscount) => {
        if (!loyaltyCustomer || loyaltyCustomer.points < points) {
            return;
        }

        const discountValue = points * 0.5; // 1 puan = 0.5 TL

        // 🔥 KRİTİK: Firebase'de puanları ŞİMDİ güncelleme!
        // Sadece local state'i güncelle (ödeme sırasında transaction hook'u handle edecek)
        // Bu, double deduction (çift düşürme) hatasını önler

        // Local state'i güncelle (UI'da anında göster)
        setLoyaltyCustomer({ ...loyaltyCustomer, points: loyaltyCustomer.points - points });

        // İndirimi uygula (callback ile ana componente bildir)
        onApplyDiscount(discountValue, points);

        // Modal kapanır, success mesajı ana componentte gösterilir
        closeLoyaltyModal();
    }, [loyaltyCustomer, closeLoyaltyModal]);

    // Puan geri yükle (iptal durumunda)
    const restorePoints = useCallback(async (points) => {
        if (!loyaltyCustomer) {
            throw new Error('Müşteri bulunamadı');
        }

        const newPoints = loyaltyCustomer.points + points;

        try {
            const customerRef = doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'customers', loyaltyCustomer.phone || loyaltyCustomer.id);
            await setDoc(customerRef, { ...loyaltyCustomer, points: newPoints }, { merge: true });

            // Local state'i güncelle
            setLoyaltyCustomer({ ...loyaltyCustomer, points: newPoints });
        } catch (error) {
            console.error("Puan geri yükleme hatası:", error);
            throw error;
        }
    }, [loyaltyCustomer]);

    // ✨ YENİ: Firebase'e Kayıt Fonksiyonu
    const registerCustomer = async (customerData) => {
        setProcessing(true);
        try {
            const phone = customerData.phone;
            const customerRef = doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'customers', phone);

            // ✨ HOŞGELDİN HEDİYESİ TANIMLAMASI
            const WELCOME_BONUS = 50; // 50 Puan = 5 TL

            const newCustomer = {
                name: customerData.name.toUpperCase(),
                surname: customerData.surname.toUpperCase(),
                phone: phone,
                birthday: customerData.birthday || "", // Yeni alan
                points: WELCOME_BONUS, // ✨ 0 yerine 50 puanla başlar
                tier: 'BRONZE',
                createdAt: new Date().toISOString(),
                totalOrders: 0,
                totalSpent: 0,
                lastVisit: 'Yeni Kayıt'
            };

            await setDoc(customerRef, newCustomer);

            // ✨ İŞLEM GEÇMİŞİNE HEDİYE KAYDI (Drawer'da görünmesi için)
            const transactionsRef = collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'transactions');
            await addDoc(transactionsRef, {
                customerPhone: phone,
                type: 'gift',
                amount: 0,
                points: WELCOME_BONUS,
                desc: 'Hoşgeldin Hediyesi 🎉',
                date: new Date().toLocaleDateString('tr-TR'),
                timestamp: serverTimestamp()
            });

            setLoyaltyCustomer({ id: phone, ...newCustomer });
            setShowRegisterModal(false);
            alert(`Hoşgeldin Hediyesi! ${WELCOME_BONUS} M-Coin hesabınıza tanımlandı. ✨`);
        } catch (error) {
            console.error("Kayıt Hatası:", error);
        } finally {
            setProcessing(false);
        }
    };

    return {
        loyaltyCustomer,
        showLoyaltyModal,
        setShowLoyaltyModal,
        showRegisterModal, // Dışarıya açtık
        setShowRegisterModal,
        showConfirmDialog,
        setShowConfirmDialog,
        pendingPhone,
        loyaltyPhone,
        processing,
        setLoyaltyPhone,
        openLoyaltyModal,
        closeLoyaltyModal,
        resetCustomer,
        logoutCustomer,
        searchCustomer,
        redeemPoints,
        restorePoints,
        registerCustomer, // Dışarıya açtık
        // ... diğerleri
    };
};