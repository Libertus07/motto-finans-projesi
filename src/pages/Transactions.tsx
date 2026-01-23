import React from 'react';
import Header from '../components/Transactions/Header';
import QuickActions from '../components/Transactions/QuickActions';
import TransactionForm from '../components/Transactions/TransactionForm';
import TransactionHistory from '../components/Transactions/TransactionHistory';
import { useTransactionLogic } from '../hooks/useTransactionLogic';
import { formatCurrency } from '../utils/helpers';
import { Transaction } from '../types';

interface TransactionsProps {
    transactions: Transaction[];
    quickActions: any[]; // Define properly if possible, but any is acceptable for now
    isPatron: boolean;
}

const Transactions: React.FC<TransactionsProps> = ({ transactions, quickActions, isPatron }) => {
    // Explicitly casting the hook return to any to avoid complex typing for now, or assume it matches.
    // Ideally we type the hook, but for this migration step focusing on the page is key.
    const {
        // State
        isEditingShortcuts,
        filterPeriod,
        filterType,
        newTrans,
        newShortcut,
        transferData,
        filteredAndSortedTransactions,
        filteredTotals,
        groupedTransactions,

        // Setters
        setIsEditingShortcuts,
        setFilterPeriod,
        setFilterType,
        setNewTrans,
        setNewShortcut,
        setTransferData,

        // Handlers
        exportToPDF,
        exportToExcel,
        sendWhatsAppSummary,
        handleDeleteTransaction,
        handleAddTransaction,
        handleAssetTransfer,
        applyQuickAction,
        handleDeleteQuickAction,
        handleAddQuickAction,
    } = useTransactionLogic(transactions) as any;

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-right duration-500 pb-24 px-2">
            <Header
                exportToPDF={exportToPDF}
                exportToExcel={exportToExcel}
                sendWhatsAppSummary={sendWhatsAppSummary}
            />

            <QuickActions
                isPatron={isPatron}
                isEditingShortcuts={isEditingShortcuts}
                setIsEditingShortcuts={setIsEditingShortcuts}
                newShortcut={newShortcut}
                setNewShortcut={setNewShortcut}
                handleAddQuickAction={handleAddQuickAction}
                quickActions={quickActions}
                applyQuickAction={applyQuickAction}
                handleDeleteQuickAction={handleDeleteQuickAction}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TransactionForm
                    newTrans={newTrans}
                    setNewTrans={setNewTrans}
                    transferData={transferData}
                    setTransferData={setTransferData}
                    handleAddTransaction={handleAddTransaction}
                    handleAssetTransfer={handleAssetTransfer}
                />

                <TransactionHistory
                    filteredAndSortedTransactions={filteredAndSortedTransactions}
                    groupedTransactions={groupedTransactions}
                    filterPeriod={filterPeriod}
                    setFilterPeriod={setFilterPeriod}
                    filterType={filterType}
                    setFilterType={setFilterType}
                    filteredTotals={filteredTotals}
                    handleDeleteTransaction={handleDeleteTransaction}
                    isPatron={isPatron}
                />
            </div>

            {/* Arayüzdeki (UI) Özet Şeridi */}
            <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-2xl text-center">
                    <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">NET HASILAT</p>
                    <p className="text-sm font-black text-white">{formatCurrency(filteredTotals.income)} ₺</p>
                </div>
                <div className="bg-rose-500/5 border border-rose-500/10 p-3 rounded-2xl text-center">
                    <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest">GİDERLER</p>
                    <p className="text-sm font-black text-white">{formatCurrency(filteredTotals.expense)} ₺</p>
                </div>
                <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-2xl text-center">
                    <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">PUAN MALİYETİ</p>
                    <p className="text-sm font-black text-white">{formatCurrency(filteredTotals.totalDiscountTL)} ₺</p>
                </div>
            </div>
        </div>
    );
};

export default Transactions;
