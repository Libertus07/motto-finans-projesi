import { collection, query, orderBy, limit, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db, appId } from './firebase';
import { SHOP_ID } from '../utils/constants';
import { Transaction } from '../types';

export const TransactionService = {
    subscribeToRecent: (limitCount: number, onUpdate: (data: Transaction[]) => void, onError?: (error: Error) => void): Unsubscribe => {
        const q = query(
            collection(db, 'artifacts', appId, 'shops', SHOP_ID, 'transactions'),
            orderBy('date', 'desc'),
            limit(limitCount)
        );

        return onSnapshot(q, (snapshot) => {
            const transactions = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Transaction));
            onUpdate(transactions);
        }, onError);
    },

    fetchHistory: async (lastDate: string, limitCount: number = 50): Promise<Transaction[]> => {
        const { getDocs, startAfter } = await import('firebase/firestore');
        // Note: For simple pagination by date string, startAfter works if we order by date.
        // Ideally we pass the actual DocumentSnapshot, but date string is easier to pass around.
        // Warning: If multiple transactions have exact same date string (down to ms), this might skip some.
        // Better to use DocumentSnapshot if possible, or ensure unique sort key.

        const q = query(
            collection(db, 'artifacts', appId, 'shops', SHOP_ID, 'transactions'),
            orderBy('date', 'desc'),
            startAfter(lastDate),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
    }
};
