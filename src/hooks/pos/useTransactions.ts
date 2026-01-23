import { useState, useCallback } from 'react';
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    addDoc,
    updateDoc,
    setDoc,
    doc,
    serverTimestamp,
    increment
} from 'firebase/firestore';
import { db, appId } from '../../services/firebase';
import { getLocalISODate } from '../../utils/pos/calculations';
import { CURRENT_SHOP_ID } from '../../constants/pos/config';
import { LoyaltyCustomer, Transaction } from '../../types';

export const useTransactions = () => {
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);

    // İşlem Koleksiyon Yolu (Merkezi Yönetim)
    const transactionsRef = collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'transactions');

    // Bugünün İşlemlerini Getir
    const fetchRecentTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const today = getLocalISODate();
            // Basitleştirilmiş query - karmaşık index gerektirmeyen
            const q = query(
                transactionsRef,
                where('date', '==', today),
                orderBy('timestamp', 'desc'),
                limit(15)
            );

            const snapshot = await getDocs(q);
            const transactions = snapshot.docs
                .map(docSnap => {
                    const data = docSnap.data();
                    return {
                        id: docSnap.id,
                        ...data,
                        // Convert Firestore timestamp to string for display
                        timestamp: data.timestamp?.toDate?.() ? data.timestamp.toDate().toISOString() : data.timestamp
                    } as Transaction;
                })
                // Client-side filtering for deleted transactions
                .filter(t => (t as any).status !== 'deleted');


            setRecentTransactions(transactions);
        } catch (error) {
            console.error("İşlem geçmişi yükleme hatası:", error);
        } finally {
            setLoading(false);
        }
    }, [transactionsRef]);

    /**
     * [v2 YENİ] Gelişmiş İşlem Kaydı
     * Sadakat puan güncellemesi ile birlikte tek bir transaction içinde kayıt yapar.
     */
    const saveTransaction = useCallback(async (data: Partial<Transaction> & { pointsSpent?: number }, customer?: LoyaltyCustomer | null) => {
        // 💡 TIER ÇARPANI ENTEGRASYONU
        let multiplier = 1;
        if (customer?.tier === 'SILVER') multiplier = 1.25;
        if (customer?.tier === 'GOLD') multiplier = 1.5;
        if (customer?.tier === 'PLATINUM') multiplier = 2.0;

        // Kazanılan puanı çarpanla hesapla
        // Use default 0 if amount is undefined
        const earnedPoints = Math.floor(((data.amount || 0) / 10) * multiplier);
        const _spentPoints = data.pointsSpent || 0;

        // ✨ YENİ: Aktif personeli al
        const currentStaff = JSON.parse(localStorage.getItem('motto_current_staff') || '{}');

        const finalData = {
            ...data,
            earnedPoints,
            multiplierApplied: multiplier, // Hangi çarpan uygulandı kaydet
            timestamp: serverTimestamp(),
            staffId: currentStaff.id || 'unknown', // ✨ Personel ID
            staffName: currentStaff.name || 'Bilinmiyor', // ✨ Personel Adı
            createdAt: new Date().toISOString()
        };

        // 1. İşlemi kaydet
        const docRef = await addDoc(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'transactions'), finalData);

        // 2. Müşteri Puan Güncelleme (Net Değişim: Kazanılan - Harcanan)
        if (customer) {
            const customerRef = doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'customers', customer.phone);

            const updates = {
                // ⚠️ DEĞİŞİKLİK: Harcanan puanlar (spentPoints) artık Cloud Function ile anında düşülüyor.
                // Bu yüzden burada sadece kazanılan puanları (earnedPoints) ekliyoruz.
                points: increment(earnedPoints),
                lastVisit: new Date().toISOString()
            };

            await setDoc(customerRef, updates, { merge: true });
        }
        return { success: true, id: docRef.id };
    }, []);

    /**
     * [v2 GÜNCELLEME] İşlemi İptal Et (Voiding)
     * Veriyi silmez, durumunu 'void' olarak günceller. Audit trail (Denetim izi) sağlar.
     */
    const voidTransaction = useCallback(async (transactionId: string, reason = "Kullanıcı İptali") => {
        if (!window.confirm("Bu işlem İPTAL edilecek (Kayıtlarda kalacaktır). Emin misiniz?")) {
            return;
        }

        try {
            const transactionDoc = doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'transactions', transactionId);

            await updateDoc(transactionDoc, {
                status: 'void',
                voidReason: reason,
                voidTimestamp: serverTimestamp()
            });

            // Local state güncelleme
            setRecentTransactions(prev =>
                prev.map(t => t.id === transactionId ? { ...t, status: 'void' } as any as Transaction : t)
            );

            return { success: true };
        } catch (error) {
            console.error("İptal işlemi hatası:", error);
            return { success: false };
        }
    }, []);

    return {
        recentTransactions,
        loading,
        fetchRecentTransactions,
        saveTransaction,
        voidTransaction
    };
};
