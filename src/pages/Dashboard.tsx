import React, { useState } from 'react';
import useDashboardCalculations from '../hooks/useDashboardCalculations';
import HeroCard from '../components/Dashboard/HeroCard';
import KPIGrid from '../components/Dashboard/KPIGrid';
import PowerGrid from '../components/Dashboard/PowerGrid';
import AssetManagement from '../components/Dashboard/AssetManagement';
import LoyaltyAnalysis from '../components/Dashboard/LoyaltyAnalysis';
import OccupancyIndicator from '../components/Dashboard/OccupancyIndicator';
import LiveScanMonitor from '../components/Dashboard/LiveScanMonitor';
import AssetDetailModal from '../components/Dashboard/AssetDetailModal';
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
        <div className="space-y-6 animate-in fade-in duration-700 pb-20 overflow-x-hidden">
            <HeroCard
                greetingText={calculations.greetingText}
                starOfTheDay={calculations.starOfTheDay}
                birthdaysToday={calculations.birthdaysToday}
                businessHealthScore={calculations.businessHealthScore}
                healthColor={calculations.healthColor}
                healthText={calculations.healthText}
                totalNetWorth={calculations.totalNetWorth}
            />

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

            <AssetManagement
                cash={calculations.cash}
                ziraat={calculations.ziraat}
                halk={calculations.halk}
                iban={calculations.iban}
                investment={calculations.investment}
                getAssetRatio={calculations.getAssetRatio}
                setSelectedAssetInfo={setSelectedAssetInfo}
            />

            <LoyaltyAnalysis
                topLoyaltyProductReal={calculations.topLoyaltyProductReal ? {
                    name: calculations.topLoyaltyProductReal.name,
                    share: Number(calculations.topLoyaltyProductReal.share)
                } : { name: '', share: 0 }}
                loyaltyAnalytics={calculations.loyaltyAnalytics}
            />

            <OccupancyIndicator
                config={calculations.config}
                occupancyData={calculations.occupancyData}
                totalTables={calculations.totalTables}
                occupiedTables={calculations.occupiedTables}
                occupancyRate={calculations.occupancyRate}
            />

            <LiveScanMonitor tables={tables} />

            <AssetDetailModal
                selectedAssetInfo={selectedAssetInfo}
                setSelectedAssetInfo={setSelectedAssetInfo}
                transactions={transactions}
            />
        </div>
    );
};

export default Dashboard;
