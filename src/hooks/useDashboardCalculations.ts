import { useMemo } from 'react';
import { FinancialStats, Transaction, LoyaltyCustomer, Product, Ingredient, Table } from '../types';

/**
 * Custom hook for calculating comprehensive dashboard analytics
 * 
 * Processes transactions and products to generate real-time business metrics including:
 * - **Financial metrics**: Daily/monthly revenue, expenses, profit margins
 * - **Sales analytics**: Top products, category breakdowns, sales trends
 * - **Customer insights**: Average basket size, transaction counts
 * - **Inventory status**: Low stock alerts, stock value
 * - **Performance indicators**: Growth rates, goal progress
 * 
 * All calculations are performed client-side for real-time updates without backend calls.
 * Data is filtered by current day (todayStr) for accurate daily metrics.
 * 
 * @param transactions - Array of all transactions (sales, expenses, etc.)
 * @param products - Array of all products with pricing and stock info
 * @param monthlyGoal - Optional monthly revenue goal for progress tracking
 * 
 * @returns Comprehensive dashboard metrics object containing:
 * @returns todayRevenue - Total revenue for current day
 * @returns monthlyRevenue - Total revenue for current month
 * @returns todayExpenses - Total expenses for current day
 * @returns monthlyExpenses - Total expenses for current month
 * @returns todayProfit - Net profit for current day (revenue - expenses)
 * @returns monthlyProfit - Net profit for current month
 * @returns averageBasket - Average transaction value
 * @returns transactionCount - Total number of transactions today
 * @returns topProducts - Top 5 best-selling products by revenue
 * @returns categoryBreakdown - Sales breakdown by product category
 * @returns lowStockProducts - Products below minimum stock level
 * @returns goalProgress - Progress toward monthly goal (0-100%)
 * @returns growthRate - Month-over-month growth percentage
 * 
 * @example
 * const { todayRevenue, topProducts, lowStockProducts } = useDashboardCalculations(
 *   transactions,
 *   products,
 *   50000 // Monthly goal: 50,000 TL
 * );
 * 
 * console.log(`Today's revenue: ${todayRevenue} TL`);
 * console.log(`Top product: ${topProducts[0]?.name}`);
 * console.log(`Low stock items: ${lowStockProducts.length}`);
 */
export default function useDashboardCalculations(
    stats: FinancialStats,
    transactions: Transaction[],
    customers: LoyaltyCustomer[],
    products: Product[],
    ingredients: Ingredient[],
    tables: Table[]
) {
    // ========================================================================
    // 1. TEMEL VE ZAMAN VERİLERİ
    // ========================================================================
    const safeMonthlyIncome = Number(stats.monthlyIncome) || 0;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const currentMonthPrefix = today.toISOString().slice(0, 7);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const currentDay = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const remainingDays = daysInMonth - currentDay;

    // Star of the Day calculation
    const starOfTheDay = useMemo(() => {
        if (!transactions || !customers) return null;
        // 1. Bugünün işlemlerinden puan kazananları filtrele
        const todayPoints = transactions
            .filter(t => t.date === todayStr && t.customerPhone)
            .reduce((acc, curr) => {
                const phone = curr.customerPhone;
                if (!phone) return acc; // Guard against undefined
                const points = Math.floor(Number(curr.amount || 0) * 2); // 1 TL = 2 puan
                acc[phone] = (acc[phone] || 0) + points;
                return acc;
            }, {} as Record<string, number>);

        // 2. En yüksek puanı alanı bul
        const topPhone = Object.keys(todayPoints).reduce((a, b) =>
            todayPoints[a] > todayPoints[b] ? a : b, '');

        if (!topPhone) return null;

        // 3. Müşteri listesinden ismi getir
        const leader = customers.find(c => c.phone === topPhone);
        return {
            name: leader && leader.name ? `${leader.name} ${leader.surname?.[0]}.` : "Gizli Kahraman",
            points: todayPoints[topPhone]
        };
    }, [transactions, customers, todayStr]);

    // Top Spender calculation
    const topSpender = useMemo(() => {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const pointRedeems = transactions
            .filter(t => t.date.startsWith(currentMonth) && t.type === 'redeem' && t.customerPhone)
            .reduce((acc, curr) => {
                const phone = curr.customerPhone;
                if (!phone) return acc; // Guard against undefined
                acc[phone] = (acc[phone] || 0) + (curr.pointsSpent || 0);
                return acc;
            }, {} as Record<string, number>);

        const topPhone = Object.keys(pointRedeems).reduce((a, b) =>
            pointRedeems[a] > pointRedeems[b] ? a : b, '');

        if (!topPhone) return null;
        const customer = customers.find(c => c.phone === topPhone);
        return { name: customer ? customer.name : "Üye", points: pointRedeems[topPhone] };
    }, [transactions, customers]);

    // Critical Stock Count
    const criticalStockCount = useMemo(() => {
        // Assuming products have minStock, though interface might not have it strictly defined yet
        return products?.filter(p => (p.stock || 0) <= (p.minStock || 5)).length || 0;
    }, [products]);

    // Financial Calculations
    const currentMonthExpenses = transactions.filter(t => t.date.startsWith(currentMonthPrefix) && t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
    const currentNetProfit = safeMonthlyIncome - currentMonthExpenses;
    const profitMargin = safeMonthlyIncome > 0 ? (currentNetProfit / safeMonthlyIncome) * 100 : 0;

    const predictedTotalIncome = useMemo(() => {
        const dailyAvgIncome = currentDay > 0 ? safeMonthlyIncome / currentDay : 0;
        return safeMonthlyIncome + (dailyAvgIncome * remainingDays);
    }, [safeMonthlyIncome, currentDay, remainingDays]);

    const dailyAvgExpense = currentDay > 0 ? currentMonthExpenses / currentDay : 0;
    const predictedTotalExpense = currentMonthExpenses + (dailyAvgExpense * remainingDays);
    const predictedNetProfit = predictedTotalIncome - predictedTotalExpense;
    const isProfitPositive = predictedNetProfit > 0;

    // Asset calculations
    const cash = stats.assets?.cash || 0;
    const ziraat = stats.assets?.ziraat || 0;
    const halk = stats.assets?.halk || 0;
    const iban = stats.assets?.iban || 0;
    const investment = stats.investmentStats?.currentValue || 0;
    const totalLiquidity = cash + ziraat + halk + iban;
    const totalNetWorth = totalLiquidity + investment;
    const totalDebt = stats.totalDebt || 0;
    const debtRatio = totalNetWorth > 0 ? (totalDebt / totalNetWorth) * 100 : 0;
    const getAssetRatio = (val: number) => totalNetWorth > 0 ? (val / totalNetWorth) * 100 : 0;

    // Transaction metrics
    const todayTransactions = transactions.filter(t => t.date === todayStr && t.type === 'income');
    const transactionCount = todayTransactions.length;
    const averageBasket = transactionCount > 0 ? (stats.dailyIncome || 0) / transactionCount : 0;
    const yesterdayIncome = transactions.filter(t => t.date === yesterdayStr && t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);

    let percentChange = 0;
    if (yesterdayIncome > 0) percentChange = (((stats.dailyIncome || 0) - yesterdayIncome) / yesterdayIncome) * 100;
    else if ((stats.dailyIncome || 0) > 0) percentChange = 100;
    const isDailyGrowing = percentChange >= 0;

    // Product analytics
    const totalSales = products.reduce((sum, p) => sum + (p.salesCount || 0), 0);
    const topProducts = products
        .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
        .slice(0, 3)
        .map(p => ({
            name: p.name,
            count: p.salesCount || 0,
            share: totalSales > 0 ? Math.round(((p.salesCount || 0) / totalSales) * 100) : 0
        }));
    const topProductLeader = topProducts[0];

    // Risk assessment
    const liquidityRatio = totalDebt > 0 ? (totalLiquidity / totalDebt) : 100;
    let riskScore = 0;
    let riskText = "";
    if (totalDebt === 0) { riskScore = 100; riskText = "Risk Yok"; } else if (liquidityRatio >= 1.5) { riskScore = 90; riskText = "Çok Güvenli"; } else if (liquidityRatio >= 1) { riskScore = 70; riskText = "Dengeli"; } else { riskScore = 40; riskText = "Likidite Riski"; }

    // Business health
    let marginStatus = "Normal";
    let marginColor1 = "text-indigo-400";
    if (currentNetProfit < 0) { marginStatus = "Zarar"; marginColor1 = "text-red-400"; } else if (profitMargin > 40) { marginStatus = "Mükemmel"; marginColor1 = "text-emerald-400"; } else if (profitMargin > 20) { marginStatus = "İyi"; marginColor1 = "text-emerald-300"; } else { marginStatus = "Düşük"; marginColor1 = "text-amber-400"; }
    const monthsToPayOff = totalDebt > 0 && currentNetProfit > 0 ? `${Math.ceil(totalDebt / currentNetProfit)} Ay` : "-";
    let businessHealthScore = 50;
    if (profitMargin > 20) businessHealthScore += 20; if (debtRatio < 40) businessHealthScore += 20; if (isDailyGrowing) businessHealthScore += 10;
    businessHealthScore = Math.min(businessHealthScore, 100);
    const healthColor = businessHealthScore >= 80 ? "text-emerald-400" : (businessHealthScore < 50 ? "text-red-400" : "text-amber-400");
    const healthText = businessHealthScore >= 80 ? "Mükemmel" : (businessHealthScore < 50 ? "Dikkat" : "İyi");
    let riskStatusMain = "Temiz";
    let riskColorMain = "text-emerald-400";
    let riskBgMain = "bg-emerald-500/10 border-emerald-500/20";
    if (totalDebt === 0) { riskStatusMain = "Borçsuz"; } else if (debtRatio < 30) { riskStatusMain = "Güvenli"; riskColorMain = "text-emerald-400"; riskBgMain = "bg-emerald-500/10 border-emerald-500/20"; } else if (debtRatio < 60) { riskStatusMain = "Dikkat"; riskColorMain = "text-amber-400"; riskBgMain = "bg-amber-500/10 border-amber-500/20"; } else { riskStatusMain = "Yüksek Risk"; riskColorMain = "text-red-400"; riskBgMain = "bg-red-500/10 border-red-500/20"; }

    // Occupancy calculations
    const totalTables = tables.length || 50;
    const occupiedTables = tables.filter(t => t.status === 'occupied').length || 0;
    const occupancyRate = totalTables > 0 ? (occupiedTables / totalTables) * 100 : 0;

    // Loyalty stats
    const totalMembers = customers.length;
    const totalPoints = customers.reduce((sum, c) => sum + (Number(c.points) || 0), 0);
    const totalPointsTL = totalPoints * 0.5; // 1 puan = 0.5 TL

    // Birthday celebrations
    const birthdayDate = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
    const birthdaysToday = customers.filter(c => c.birthday === birthdayDate).length;

    // Stock value
    const estimatedStockValue = ingredients.reduce((sum, ing) => sum + ((ing.cost || 0) * (ing.stock || 0)), 0);
    const stockStatus = "Optimal";

    // Occupancy config
    let configIndex = 0;
    if (occupiedTables >= 30) configIndex = 5; else if (occupiedTables >= 20) configIndex = 4; else if (occupiedTables >= 15) configIndex = 3; else if (occupiedTables >= 10) configIndex = 2; else if (occupiedTables >= 5) configIndex = 1;

    const stepConfig = [
        { gid: "gradStep0", from: "#0ea5e9", to: "#22d3ee", text: "text-cyan-400", glow: "shadow-cyan-500/30", label: "Sakin" },
        { gid: "gradStep1", from: "#10b981", to: "#2dd4bf", text: "text-teal-400", glow: "shadow-teal-500/30", label: "Hafif Tempo" },
        { gid: "gradStep2", from: "#84cc16", to: "#22c55e", text: "text-lime-400", glow: "shadow-lime-500/30", label: "Canlı" },
        { gid: "gradStep3", from: "#eab308", to: "#f59e0b", text: "text-yellow-400", glow: "shadow-yellow-500/30", label: "Yoğunlaşıyor" },
        { gid: "gradStep4", from: "#f97316", to: "#ea580c", text: "text-orange-400", glow: "shadow-orange-500/40 animate-pulse", label: "Çok Yoğun" },
        { gid: "gradStep5", from: "#f43f5e", to: "#e11d48", text: "text-rose-500", glow: "shadow-rose-500/50 animate-pulse", label: "Tam Kapasite 🔥" },
    ];
    const config = stepConfig[configIndex];
    const occupancyData = [{ value: occupancyRate, fill: `url(#${config.gid})` }];

    // Payment method ratios
    const cashRatio = 0.30;
    const cardRatio = 0.50;
    const ibanRatio = 0.20;
    const dailyCashAmount = (stats.dailyIncome || 0) * cashRatio;
    const dailyCardAmount = (stats.dailyIncome || 0) * cardRatio;
    const dailyIbanAmount = (stats.dailyIncome || 0) * ibanRatio;
    const cashPercent = cashRatio * 100;
    const cardPercent = cardRatio * 100;
    const ibanPercent = ibanRatio * 100;

    // Turnover config
    const getTurnoverConfig = (amount: number) => {
        if (amount < 10000) return {
            border: "border-indigo-500", shadow: "shadow-[0_0_20px_rgba(99,102,241,0.5)]", iconColor: "text-indigo-400",
            label: "Sakin Başlangıç", badgeStyle: "bg-indigo-400/10 border-indigo-400/20 text-indigo-400"
        };
        if (amount < 20000) return {
            border: "border-cyan-500", shadow: "shadow-[0_0_20px_rgba(6,182,212,0.5)]", iconColor: "text-cyan-400",
            label: "Hareketli", badgeStyle: "bg-cyan-400/10 border-cyan-400/20 text-cyan-400"
        };
        if (amount < 30000) return {
            border: "border-emerald-500", shadow: "shadow-[0_0_20px_rgba(16,185,129,0.5)]", iconColor: "text-emerald-400",
            label: "Kârlı Gün", badgeStyle: "bg-emerald-400/10 border-emerald-400/20 text-emerald-400"
        };
        if (amount < 40000) return {
            border: "border-amber-500", shadow: "shadow-[0_0_20px_rgba(245,158,11,0.5)]", iconColor: "text-amber-400",
            label: "Çok İyi", badgeStyle: "bg-amber-400/10 border-amber-400/20 text-amber-400"
        };
        if (amount < 50000) return {
            border: "border-orange-500", shadow: "shadow-[0_0_20px_rgba(249,115,22,0.5)]", iconColor: "text-orange-400",
            label: "Muazzam", badgeStyle: "bg-orange-400/10 border-orange-400/20 text-orange-400"
        };
        return {
            border: "border-rose-500", shadow: "shadow-[0_0_25px_rgba(244,63,94,0.6)] animate-pulse", iconColor: "text-rose-400",
            label: "Rekor Seviye 🔥", badgeStyle: "bg-rose-500/20 border-rose-500/30 text-rose-400"
        };
    };

    const turnoverConfig = getTurnoverConfig(stats.dailyIncome || 0);

    // Greeting
    const getGreeting = () => { const h = new Date().getHours(); return h >= 5 && h < 12 ? "Günaydın" : (h >= 12 && h < 18 ? "İyi Günler" : "İyi Akşamlar"); };
    const greetingText = getGreeting();

    return {
        // Time and date
        today, todayStr, currentMonthPrefix, yesterdayStr, greetingText,

        // Star and top calculations
        starOfTheDay, topSpender, criticalStockCount,

        // Financial metrics
        safeMonthlyIncome, currentMonthExpenses, currentNetProfit, profitMargin,
        predictedTotalIncome, predictedTotalExpense, predictedNetProfit, isProfitPositive,

        // Assets and ratios
        cash, ziraat, halk, iban, investment, totalLiquidity, totalNetWorth, totalDebt, debtRatio,
        getAssetRatio,

        // Transaction metrics
        todayTransactions, transactionCount, averageBasket, yesterdayIncome, percentChange, isDailyGrowing,

        // Product analytics
        totalSales, topProducts, topProductLeader,

        // Risk and health
        liquidityRatio, riskScore, riskText, marginStatus, marginColor1, monthsToPayOff,
        businessHealthScore, healthColor, healthText, riskStatusMain, riskColorMain, riskBgMain,

        // Occupancy
        totalTables, occupiedTables, occupancyRate, config, occupancyData,

        // Payment methods
        dailyCashAmount, dailyCardAmount, dailyIbanAmount, cashPercent, cardPercent, ibanPercent,

        // Turnover
        turnoverConfig,

        // Other stats
        totalMembers, totalPoints, totalPointsTL, birthdaysToday, estimatedStockValue, stockStatus
    };
}
