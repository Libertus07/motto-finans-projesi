import { useState, useEffect } from 'react';
import { Transaction, Investment, Debt, Ingredient, QuickAction, User } from '../../types';
import { TransactionService } from '../../services/transaction.service';
import { FinanceService } from '../../services/finance.service';

export function useFinancials(user: User | null | undefined) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [debts, setDebts] = useState<Debt[]>([]);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            // Already false? or just ensure it is false
            const t = setTimeout(() => setLoading(false), 0);
            return () => clearTimeout(t);
        }

        const unsubscribers: (() => void)[] = [];

        // 1. TRANSACTIONS
        unsubscribers.push(
            TransactionService.subscribeToRecent(500, (data) => setTransactions(data))
        );

        // 2. INVESTMENTS
        unsubscribers.push(
            FinanceService.subscribeToInvestments((data) => setInvestments(data))
        );

        // 3. DEBTS
        unsubscribers.push(
            FinanceService.subscribeToDebts((data) => setDebts(data))
        );

        // 4. INGREDIENTS
        unsubscribers.push(
            FinanceService.subscribeToIngredients((data) => setIngredients(data))
        );

        // 5. QUICK ACTIONS
        unsubscribers.push(
            FinanceService.subscribeToQuickActions((data) => setQuickActions(data))
        );

        // Initial loading done (listeners registered)
        const t = setTimeout(() => setLoading(false), 0);

        return () => {
            clearTimeout(t);
            unsubscribers.forEach(unsub => unsub());
        };
    }, [user]);

    return { transactions, investments, debts, ingredients, quickActions, loading };
}
