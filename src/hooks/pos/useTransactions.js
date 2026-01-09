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

export const useTransactions = () => {
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

    // İşlem Koleksiyon Yolu (Merkezi Yönetim)
    const transactionsRef = collection(db, 'transactions');

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
                .map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        // Convert Firestore timestamp to string for display
                        timestamp: data.timestamp?.toDate?.() ? data.timestamp.toDate().toISOString() : data.timestamp
                    };
                })
                // Client-side filtering for deleted transactions
                .filter(t => t.status !== 'deleted');

            console.log('Fetched transactions:', transactions.length, transactions);
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


    const saveTransaction = useCallback(async (data, customer) => {
    // 💡 TIER ÇARPANI ENTEGRASYONU
    let multiplier = 1;
    if (customer?.tier === 'SILVER') multiplier = 1.25;
    if (customer?.tier === 'GOLD') multiplier = 1.5;
    if (customer?.tier === 'PLATINUM') multiplier = 2.0;

    // Kazanılan puanı çarpanla hesapla
    const earnedPoints = Math.floor((data.amount / 10) * multiplier); 
    const spentPoints = data.pointsSpent || 0;

    const finalData = {
        ...data,
        earnedPoints,
        multiplierApplied: multiplier, // Hangi çarpan uygulandı kaydet
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString()
    };

        // 1. İşlemi kaydet
        const docRef = await addDoc(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'transactions'), finalData);

        // 2. Müşteri Puan Güncelleme (Net Değişim: Kazanılan - Harcanan)
        if (customer) {
            const customerRef = doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'customers', customer.phone);
            await setDoc(customerRef, {
                points: increment(earnedPoints - spentPoints), // ✨ Puan bakiyesini güncelle
                lastVisit: new Date().toISOString()
            }, { merge: true });
        }
        return { success: true, id: docRef.id };
    }, [appId]);

    /**
     * [v2 GÜNCELLEME] İşlemi İptal Et (Voiding)
     * Veriyi silmez, durumunu 'void' olarak günceller. Audit trail (Denetim izi) sağlar.
     */
    const voidTransaction = useCallback(async (transactionId, reason = "Kullanıcı İptali") => {
        if (!window.confirm("Bu işlem İPTAL edilecek (Kayıtlarda kalacaktır). Emin misiniz?")) {
            return;
        }

        try {
            const transactionDoc = doc(db, 'transactions', transactionId);
            
            await updateDoc(transactionDoc, {
                status: 'void',
                voidReason: reason,
                voidTimestamp: serverTimestamp()
            });

            // Local state güncelleme
            setRecentTransactions(prev => 
                prev.map(t => t.id === transactionId ? { ...t, status: 'void' } : t)
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