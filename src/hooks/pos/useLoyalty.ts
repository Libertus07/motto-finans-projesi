// hooks/pos/useLoyalty.ts
import { useState, useCallback } from 'react';
import { db, appId, functions, httpsCallable } from '../../services/firebase';
import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { CURRENT_SHOP_ID } from '../../constants/pos/config';
import { getLocalISODate } from '../../utils/pos/calculations';
import { LoyaltyCustomer } from '../../types';

/**
 * Custom hook for managing customer loyalty program operations
 * 
 * Handles all loyalty-related functionality including:
 * - Customer search by phone number
 * - New customer registration
 * - Points redemption and earning
 * - Birthday bonus management
 * - Tier-based point multipliers
 * - Modal state management
 * 
 * Features:
 * - Automatic birthday bonus (once per year)
 * - Point multipliers based on tier (Bronze 1x, Silver 1.25x, Gold 1.5x, Platinum 2x)
 * - Firebase Cloud Functions integration for point operations
 * - Real-time customer data synchronization
 * 
 * @returns Loyalty state and operations
 * @returns loyaltyCustomer - Current loyalty customer data (null if none)
 * @returns showLoyaltyModal - Whether loyalty modal is visible
 * @returns showRegisterModal - Whether registration modal is visible
 * @returns showConfirmDialog - Whether confirmation dialog is visible
 * @returns loyaltyPhone - Current phone number input
 * @returns processing - Whether an async operation is in progress
 * @returns openLoyaltyModal - Open loyalty search modal
 * @returns closeLoyaltyModal - Close loyalty modal
 * @returns searchCustomer - Search for customer by phone number
 * @returns registerCustomer - Register new customer with details
 * @returns redeemPoints - Redeem customer points for discount
 * @returns restorePoints - Restore points (undo redemption)
 * @returns awardPoints - Award points to customer after purchase
 * @returns resetCustomer - Clear current customer
 * @returns logoutCustomer - Logout customer and close modal
 * 
 * @example
 * const { searchCustomer, loyaltyCustomer, awardPoints } = useLoyalty();
 * 
 * // Search for customer
 * await searchCustomer('5551234567');
 * 
 * // Award points after purchase
 * if (loyaltyCustomer) {
 *   await awardPoints(150); // Award 150 points
 * }
 * 
 * @example
 * // Redeem points for discount
 * const { redeemPoints, loyaltyCustomer } = useLoyalty();
 * 
 * if (loyaltyCustomer && loyaltyCustomer.points >= 100) {
 *   await redeemPoints(100, (discount, points) => {
 *     console.log(`Applied ${discount} TL discount using ${points} points`);
 *   });
 * }
 */
export const useLoyalty = () => {
    const [loyaltyCustomer, setLoyaltyCustomer] = useState<LoyaltyCustomer | null>(null);
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

    const searchCustomer = useCallback(async (phone: string) => {
        if (!phone) return;
        setProcessing(true);

        try {
            const customerRef = doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'customers', phone);
            const docSnap = await getDoc(customerRef);

            if (docSnap.exists()) {
                const data = docSnap.data() as LoyaltyCustomer;
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

                    alert(`🎉 Bugün müşterimizin doğum günü! ${BIRTHDAY_BONUS} Volt otomatik tanımlandı.`);
                }

                setLoyaltyCustomer({ ...data, id: docSnap.id } as LoyaltyCustomer);
            } else {
                setPendingPhone(phone);
                setShowConfirmDialog(true);
            }
        } catch (error) {
            console.error("Sorgulama Hatası:", error);
        } finally {
            setProcessing(false);
        }
    }, []);

    // Puan harca
    const redeemPoints = useCallback(async (points: number, onApplyDiscount: (val: number, pts: number) => void) => {
        if (!loyaltyCustomer) return;

        setProcessing(true);

        try {
            // ☁️ CLOUD FUNCTION ÇAĞRISI (Güvenli Backend)
            const redeemFn = httpsCallable(functions, 'redeemPoints');

            const result = await redeemFn({
                customerId: loyaltyCustomer.phone,
                pointsToRedeem: Number(points),
                appId: appId,
                shopId: CURRENT_SHOP_ID
            }) as { data: { success: boolean; newPoints: number } };

            if (result.data.success) {
                // Başarılı ise yerel state'i güncelle
                setLoyaltyCustomer(prev => prev ? ({ ...prev, points: result.data.newPoints }) : null);

                const discountValue = points * 0.5; // 1 puan = 0.5 TL
                onApplyDiscount(discountValue, points);
                closeLoyaltyModal();
            }

        } catch (error: unknown) {
            console.error("Puan harcama hatası:", error);
            alert("İşlem başarısız: " + (error as Error).message);
        } finally {
            setProcessing(false);
        }
    }, [loyaltyCustomer, closeLoyaltyModal]);

    // Puan geri yükle (iptal durumunda)
    const restorePoints = useCallback(async (points: number) => {
        if (!loyaltyCustomer) {
            throw new Error('Müşteri bulunamadı');
        }

        try {
            // ☁️ CLOUD FUNCTION ÇAĞRISI (Güvenli İade)
            const restoreFn = httpsCallable(functions, 'restorePoints');
            const result = await restoreFn({
                customerId: loyaltyCustomer.phone || loyaltyCustomer.id,
                pointsToRestore: Number(points),
                appId: appId,
                shopId: CURRENT_SHOP_ID
            }) as { data: { success: boolean; newPoints: number } };

            if (result.data.success) {
                // Local state'i güncelle
                setLoyaltyCustomer(prev => prev ? ({ ...prev, points: result.data.newPoints }) : null);
            }
        } catch (error) {
            console.error("Puan geri yükleme hatası:", error);
            throw error;
        }
    }, [loyaltyCustomer]);

    // ✨ YENİ: Firebase'e Kayıt Fonksiyonu
    const registerCustomer = async (customerData: { name: string; surname: string; phone: string; birthday?: string }) => {
        setProcessing(true);
        try {
            const phone = customerData.phone;
            const customerRef = doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'customers', phone);

            // ✨ HOŞGELDİN HEDİYESİ TANIMLAMASI (Dinamik)
            let WELCOME_BONUS = 50;
            try {
                const settingsSnap = await getDoc(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'settings', 'loyalty'));
                if (settingsSnap.exists()) {
                    const s = settingsSnap.data();
                    WELCOME_BONUS = s.refereeReward || s.welcomeBonus || 50;
                }
            } catch (_) { console.error("Bonus ayarı çekilemedi, varsayılan kullanılıyor."); }

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
            alert(`Hoşgeldin Hediyesi! ${WELCOME_BONUS} Volt hesabınıza tanımlandı. ✨`);
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
    };
};
