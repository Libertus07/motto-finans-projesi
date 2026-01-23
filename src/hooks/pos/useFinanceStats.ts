import { useMemo } from 'react';
import { Transaction, Debt, Investment, FixedCosts, FinancialStats, Product } from '../../types';

interface UseFinanceStatsProps {
    transactions: Transaction[];
    debts: Debt[];
    investments: Investment[];
    fixedCosts: FixedCosts;
    monthlyGoal: number;
}

export function useFinanceStats({ transactions, debts, investments, fixedCosts }: Omit<UseFinanceStatsProps, 'monthlyGoal'>) {

    const stats = useMemo<FinancialStats>(() => {
        const safeTransactions = Array.isArray(transactions) ? transactions : [];
        const safeDebts = Array.isArray(debts) ? debts : [];
        const safeInvestments = Array.isArray(investments) ? investments : [];

        const totalIncome = safeTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount || 0), 0);
        const totalExpense = safeTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount || 0), 0);
        const netProfit = totalIncome - totalExpense;
        const totalMonthlyFixedCosts = Object.values(fixedCosts || {}).reduce((sum, val) => sum + Number(val || 0), 0);
        const netNetProfit = netProfit - totalMonthlyFixedCosts;

        const totalDebt = safeDebts.filter(d => d.type === 'debt').reduce((acc, d) => acc + Number(d.amount || 0), 0) -
            safeDebts.filter(d => d.type === 'payment').reduce((acc, d) => acc + Number(d.amount || 0), 0);

        const today = new Date().toISOString().split('T')[0];
        const currentMonth = today.slice(0, 7);

        const dailyIncome = safeTransactions.filter(t => t.type === 'income' && t.date === today).reduce((acc, t) => acc + Number(t.amount || 0), 0);
        const monthlyIncome = safeTransactions.filter(t => t.type === 'income' && t.date.startsWith(currentMonth)).reduce((acc, t) => acc + Number(t.amount || 0), 0);
        const monthlyExpense = safeTransactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMonth)).reduce((acc, t) => acc + Number(t.amount || 0), 0);

        const breakdown: Record<string, { balance: number }> = { cash: { balance: 0 }, ziraat: { balance: 0 }, halk: { balance: 0 }, iban: { balance: 0 }, mix: { balance: 0 } };

        safeTransactions.forEach(t => {
            const val = Number(t.amount || 0);
            let key = 'cash';
            if (t.method === 'mix') key = 'mix';
            else if (t.cardBank) {
                if (t.cardBank === 'ziraat') key = 'ziraat';
                else if (t.cardBank === 'halk') key = 'halk';
                else key = 'iban';
            }
            if (!breakdown[key]) breakdown[key] = { balance: 0 }; // Safety check

            if (t.type === 'income') breakdown[key].balance += val;
            else breakdown[key].balance -= val;
        });

        const investmentStats = safeInvestments.filter(inv => inv.type === 'gold').reduce((acc, inv) => {
            const currentPrice = inv.currentPrice || inv.buyPrice || 0;
            const quantity = inv.quantity || 0;
            const buyPrice = inv.buyPrice || 0;
            acc.totalCost += quantity * buyPrice;
            acc.currentValue += quantity * currentPrice;
            acc.totalProfit += (quantity * currentPrice) - (quantity * buyPrice);
            return acc;
        }, { totalCost: 0, currentValue: 0, totalProfit: 0 });

        const assets = {
            cash: breakdown.cash.balance,
            ziraat: breakdown.ziraat.balance,
            halk: breakdown.halk.balance,
            iban: breakdown.iban.balance,
            mix: breakdown.mix.balance,
            gold: investmentStats.currentValue
        };

        return {
            totalIncome, totalExpense, netProfit, netNetProfit, totalMonthlyFixedCosts,
            dailyIncome, monthlyIncome, monthlyExpense,
            breakdown: breakdown as any, // Type mismatch: Record vs BreakdownItem[]
            totalDebt, investmentStats, assets,
            currentBalance: netProfit
        };
    }, [transactions, debts, investments, fixedCosts]);

    const calculateFutureCashflow = (days = 30) => {
        const dailyAvgIncome = stats.monthlyIncome / 30;
        const dailyAvgExpense = stats.monthlyExpense / 30;
        const dailyFixedCost = stats.totalMonthlyFixedCosts / 30;
        return stats.currentBalance + ((dailyAvgIncome - dailyAvgExpense - dailyFixedCost) * days);
    };

    const getProfitabilityWarnings = (productsList: Product[]) => {
        if (!Array.isArray(productsList)) return [];
        return productsList
            .filter(p => p.cost > 0 && p.price > 0)
            .map(p => ({ ...p, margin: ((p.price - p.cost) / p.price) * 100 }))
            .filter(p => p.margin < 30)
            .sort((a, b) => a.margin - b.margin);
    };

    return { stats, calculateFutureCashflow, getProfitabilityWarnings };
}
