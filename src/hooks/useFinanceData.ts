import { useState } from 'react';
import { useProducts } from './pos/useProducts';
import { useTables } from './pos/useTables';
import { useStaff } from './pos/useStaff';
import { useSettings } from './pos/useSettings';
import { useFinancials } from './pos/useFinancials';
import { useFinanceStats } from './pos/useFinanceStats';
import { User, FixedCosts } from '../types';

export default function useFinanceData(user: User | null | undefined) {
    // 1. Data Hooks
    const { products, loading: loadingProducts } = useProducts(user);
    const { tables, loading: loadingTables } = useTables(user);
    const { staff, loading: loadingStaff } = useStaff(user);
    const { categories, fixedCosts, setFixedCosts, monthlyGoal, setMonthlyGoal, loading: loadingSettings } = useSettings(user);
    const { transactions, investments, debts, ingredients, quickActions, loading: loadingFinancials } = useFinancials(user);

    // 2. Local State
    const [marketRates, setMarketRates] = useState({ gold: 2950, dollar: 34.50, euro: 37.20 });

    // 3. Stats Calculation (Pure Logic)
    const { stats, calculateFutureCashflow, getProfitabilityWarnings } = useFinanceStats({
        transactions,
        debts,
        investments,
        fixedCosts: fixedCosts as FixedCosts // Ensure type match
    });

    const loading = loadingProducts || loadingTables || loadingStaff || loadingSettings || loadingFinancials;

    return {
        transactions, products, investments, debts, ingredients, quickActions, tables,
        staff,
        categories,
        fixedCosts, setFixedCosts, monthlyGoal, setMonthlyGoal, marketRates, setMarketRates,
        stats, calculateFutureCashflow, getProfitabilityWarnings, loading
    };
}
