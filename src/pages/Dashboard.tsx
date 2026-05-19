import React, { useState } from 'react';
import useDashboardCalculations from '../hooks/useDashboardCalculations';
import HeroCard from '../components/Dashboard/HeroCard';
import KPIGrid from '../components/Dashboard/KPIGrid';
import PowerGrid from '../components/Dashboard/PowerGrid';
import AssetManagement from '../components/Dashboard/AssetManagement';
import OccupancyIndicator from '../components/Dashboard/OccupancyIndicator';
import LiveScanMonitor from '../components/Dashboard/LiveScanMonitor';
import AssetDetailModal from '../components/Dashboard/AssetDetailModal';

// NEW PREMIUM COMPONENTS
import MottoAIInsights from '../components/Dashboard/MottoAIInsights';
import BusinessRadar from '../components/Dashboard/BusinessRadar';
import QuickActionHub from '../components/Dashboard/QuickActionHub';

import { FinancialStats, Transaction, Table, LoyaltyCustomer, Ingredient, Product } from '../types';

import { useOutletContext } from 'react-router-dom';
import { DashboardContextType } from '../types';

const Dashboard: React.FC = () => {
    const { stats, transactions, tables, customers, ingredients, products } = useOutletContext<DashboardContextType>();
    const [selectedAssetInfo, setSelectedAssetInfo] = useState<{ title: string } | null>(null);

    // Use the calculation hook
    const calculations = useDashboardCalculations(stats, transactions, customers, products, ingredients, tables);

    if (!stats || !transactions) return <div className="p-10 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-24 overflow-x-hidden max-w-[1600px] mx-auto px-4">

            {/* 1. HERO & WELCOME */}
            <HeroCard
                greetingText={calculations.greetingText}
                starOfTheDay={calculations.starOfTheDay}
                birthdaysToday={calculations.birthdaysToday}
                businessHealthScore={calculations.businessHealthScore}
                healthColor={calculations.healthColor}
                healthText={calculations.healthText}
                totalNetWorth={calculations.totalNetWorth}
            />

            {/* 2. QUICK ACTIONS HUB */}
            <QuickActionHub />

            {/* 3. CORE PERFORMANCE KPIs */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 ml-2">
                    <div className="w-1 h-6 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                    <h3 className="text-lg font-black text-white uppercase tracking-wider">Performans Özeti</h3>
                </div>
                <KPIGrid
                    stats={stats}
                    transactionCount={calculations.transactionCount}
                    percentChange={calculations.percentChange}
                    isDailyGrowing={calculations.isDailyGrowing}
                    averageBasket={calculations.averageBasket}
                    currentNetProfit={calculations.currentNetProfit}
                    profitMargin={calculations.profitMargin}
                    safeMonthlyIncome={calculations.safeMonthlyIncome}
                    currentMonthExpenses={calculations.currentMonthExpenses}
                    marginStatus={calculations.marginStatus}
                    marginColor1={calculations.marginColor1}
                    predictedNetProfit={calculations.predictedNetProfit}
                    isProfitPositive={calculations.isProfitPositive}
                    predictedTotalIncome={calculations.predictedTotalIncome}
                    predictedTotalExpense={calculations.predictedTotalExpense}
                    totalDebt={calculations.totalDebt}
                    debtRatio={calculations.debtRatio}
                    monthsToPayOff={calculations.monthsToPayOff}
                    riskStatusMain={calculations.riskStatusMain}
                    riskBgMain={calculations.riskBgMain}
                    riskColorMain={calculations.riskColorMain}
                    turnoverConfig={calculations.turnoverConfig}
                    dailyCashAmount={calculations.dailyCashAmount}
                    dailyCardAmount={calculations.dailyCardAmount}
                    dailyIbanAmount={calculations.dailyIbanAmount}
                    cashPercent={calculations.cashPercent}
                    cardPercent={calculations.cardPercent}
                    ibanPercent={calculations.ibanPercent}
                />
            </div>

            {/* 4. SMART ANALYTICS LAYER (Symmetric Grid) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <MottoAIInsights insights={calculations.aiInsights} />
                <BusinessRadar data={calculations.radarData} />
            </div>

            {/* 5. EXTENDED POWER TOOLS */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 ml-2">
                    <div className="w-1 h-6 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                    <h3 className="text-lg font-black text-white uppercase tracking-wider">Derinlikli Analiz</h3>
                </div>
                <PowerGrid
                    topProducts={calculations.topProducts}
                    topProductLeader={calculations.topProductLeader}
                    totalMembers={calculations.totalMembers}
                    totalPoints={calculations.totalPoints}
                    birthdaysToday={calculations.birthdaysToday}
                    riskScore={calculations.riskScore}
                    riskText={calculations.riskText}
                    liquidityRatio={calculations.liquidityRatio}
                    estimatedStockValue={calculations.estimatedStockValue}
                    criticalStockCount={calculations.criticalStockCount}
                    stockStatus={calculations.stockStatus}
                />
            </div>

            {/* 7. ASSET & OCCUPANCY DETAILS */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2">
                    <AssetManagement
                        cash={calculations.cash}
                        ziraat={calculations.ziraat}
                        halk={calculations.halk}
                        iban={calculations.iban}
                        investment={calculations.investment}
                        getAssetRatio={calculations.getAssetRatio}
                        setSelectedAssetInfo={setSelectedAssetInfo}
                    />
                </div>
                <div className="h-full">
                    <OccupancyIndicator
                        config={calculations.config}
                        occupancyData={calculations.occupancyData}
                        totalTables={calculations.totalTables}
                        occupiedTables={calculations.occupiedTables}
                        occupancyRate={calculations.occupancyRate}
                    />
                </div>
            </div>

            {/* 8. MONITORING */}
            <LiveScanMonitor tables={tables} />

            {/* MODALS */}
            <AssetDetailModal
                selectedAssetInfo={selectedAssetInfo}
                setSelectedAssetInfo={setSelectedAssetInfo}
                transactions={transactions}
            />
        </div>
    );
};

export default Dashboard;
