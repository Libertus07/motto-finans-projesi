import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, limit } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';
import { SHOP_ID } from '../../utils/constants';
import { Transaction, Investment, Debt, Ingredient, QuickAction, User } from '../../types';

export function useFinancials(user: User | null | undefined) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [debts, setDebts] = useState<Debt[]>([]);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            // If no user, we are done loading (no data to fetch)
            setLoading(false);
            return;
        }

        const unsubscribers: (() => void)[] = [];

        // 1. TRANSACTIONS
        unsubscribers.push(onSnapshot(query(collection(db, 'artifacts', appId, 'shops', SHOP_ID, 'transactions'), limit(500)), (s) => {
            setTransactions(s.docs.map(d => ({ id: d.id, ...d.data() } as Transaction)).sort((a, b) => b.date.localeCompare(a.date)));
        }, (error) => {
            // console.error("❌ İŞLEM OKUMA HATASI:", error)
        }));

        // 2. INVESTMENTS
        unsubscribers.push(onSnapshot(collection(db, 'artifacts', appId, 'shops', SHOP_ID, 'investments'), s => setInvestments(s.docs.map(d => ({ id: d.id, ...d.data() } as Investment)))));

        // 3. DEBTS
        unsubscribers.push(onSnapshot(collection(db, 'artifacts', appId, 'shops', SHOP_ID, 'debts'), s => setDebts(s.docs.map(d => ({ id: d.id, ...d.data() } as Debt)))));

        // 4. INGREDIENTS
        unsubscribers.push(onSnapshot(collection(db, 'artifacts', appId, 'shops', SHOP_ID, 'ingredients'), s => setIngredients(s.docs.map(d => ({ id: d.id, ...d.data() } as Ingredient)))));

        // 5. QUICK ACTIONS
        unsubscribers.push(onSnapshot(collection(db, 'artifacts', appId, 'shops', SHOP_ID, 'quickActions'), s => setQuickActions(s.docs.map(d => ({ id: d.id, ...d.data() } as QuickAction)))));

        setLoading(false);

        return () => unsubscribers.forEach(unsub => unsub());
    }, [user]);

    return { transactions, investments, debts, ingredients, quickActions, loading };
}
