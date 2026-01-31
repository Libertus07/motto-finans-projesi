import React from 'react';
import Header from '../components/Transactions/Header';
import QuickActions from '../components/Transactions/QuickActions';
import TransactionForm from '../components/Transactions/TransactionForm';
import TransactionHistory from '../components/Transactions/TransactionHistory';
import { useTransactionLogic } from '../hooks/useTransactionLogic';
import { formatCurrency } from '../utils/helpers';
import { Transaction } from '../types';

import { useOutletContext } from 'react-router-dom';
import { DashboardContextType } from '../types';
import { usePermissions } from '../hooks/usePermissions';
import { PERMISSIONS } from '../utils/roles';

const Transactions: React.FC = () => {
    const { transactions, quickActions } = useOutletContext<DashboardContextType>();

    // 🔥 PERMISSION CHECK
    const { hasPermission } = usePermissions();
    const canManage = hasPermission(PERMISSIONS.TRANSACTION_MANAGE);
    // Backward compatibility: 'isPatron' prop in children might expect boolean, passing permission result
    const isPatron = canManage;

    // Pagination State
    const [archives, setArchives] = React.useState<Transaction[]>([]);
    const [isLoadingMore, setIsLoadingMore] = React.useState(false);

    // Merge live transactions with loaded archives
    // Use Map to ensure uniqueness by ID in case of overlap
    const allTransactions = React.useMemo(() => {
        const map = new Map();
        transactions.forEach(t => map.set(t.id, t));
        archives.forEach(t => map.set(t.id, t));
        return Array.from(map.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, archives]);

    const handleLoadMore = async () => {
        if (isLoadingMore) return;
        setIsLoadingMore(true);
        try {
            const { TransactionService } = await import('../services/transaction.service');
            const lastTransaction = allTransactions[allTransactions.length - 1];
            if (!lastTransaction) return;

            const more = await TransactionService.fetchHistory(lastTransaction.date, 50);
            if (more.length > 0) {
                setArchives(prev => [...prev, ...more]);
            } else {
                alert("Daha fazla kayıt bulunamadı.");
            }
        } catch (error) {
            console.error("Geçmiş yüklenirken hata:", error);
        } finally {
            setIsLoadingMore(false);
        }
    };

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
    } = useTransactionLogic(allTransactions) as any;

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
                    onLoadMore={handleLoadMore}
                    isLoadingMore={isLoadingMore}
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
