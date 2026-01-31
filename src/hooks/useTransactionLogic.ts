import { useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { addDoc, deleteDoc, doc, collection, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db, appId } from '../services/firebase';
import { formatCurrency, formatDate, getSubMethod } from '../utils/helpers';
import { SHOP_ID as CURRENT_SHOP_ID } from '../utils/constants';
import { Transaction, QuickAction } from '../types';

// Extend jsPDF for autotable
interface jsPDFWithAutoTable extends jsPDF {
    autoTable: (options: unknown) => void;
}

export const useTransactionLogic = (transactions: Transaction[]) => {
    const [isEditingShortcuts, setIsEditingShortcuts] = useState(false);
    const [filterPeriod, setFilterPeriod] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [newTrans, setNewTrans] = useState({
        date: new Date().toISOString().split('T')[0],
        type: 'income',
        method: 'cash',
        cardBank: 'ziraat',
        category: 'Günlük',
        amount: '',
        desc: ''
    });
    const [newShortcut, setNewShortcut] = useState({
        label: '',
        type: 'expense',
        method: 'cash',
        cardBank: 'ziraat',
        category: 'Günlük',
        desc: '',
        icon: '⚡'
    });
    const [transferData, setTransferData] = useState({
        from: 'ziraat',
        to: 'cash',
        amount: '',
        desc: ''
    });

    // ✨ AKILLI FİLTRELEME VE SIRALAMA
    const filteredAndSortedTransactions = useMemo(() => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];

        return [...transactions].filter(t => {
            const matchesPeriod = filterPeriod === 'today' ? t.date === todayStr : filterPeriod === 'week' ? t.date >= oneWeekAgoStr : true;
            const matchesType = filterType === 'all' ? true : t.type === filterType;
            return matchesPeriod && matchesType;
        }).sort((a, b) => {
            // ✨ timestamp varsa ona göre, yoksa date'e göre saniye bazlı sırala
            const getTimestamp = (t: Transaction) => {
                if (t.timestamp && typeof t.timestamp === 'object' && 'seconds' in t.timestamp) {
                    return t.timestamp.seconds * 1000;
                }
                return new Date(t.date).getTime();
            };
            return getTimestamp(b) - getTimestamp(a);
        });
    }, [transactions, filterPeriod, filterType]);

    // ✨ FİLTREYE ÖZEL TOPLAMLAR
    const filteredTotals = useMemo(() => {
        return filteredAndSortedTransactions.reduce((acc, t) => {
            const val = Number(t.amount || 0);
            const lDisc = Number(t.loyaltyDiscount || 0);
            const pSpent = Number(t.pointsSpent || 0);
            const pEarned = Number(t.earnedPoints || 0); // ✨ Kazanılan puanı al

            if (t.type === 'income') acc.income += val;
            else if (t.type === 'expense') acc.expense += val;

            acc.totalDiscountTL += lDisc;
            acc.totalPointsUsed += pSpent;
            acc.totalPointsEarned += pEarned; // ✨ Topla
            return acc;
        }, { income: 0, expense: 0, totalDiscountTL: 0, totalPointsUsed: 0, totalPointsEarned: 0 });
    }, [filteredAndSortedTransactions]);

    // ✨ GRUPLANMIŞ LİSTE
    const groupedTransactions = useMemo(() => {
        const groups: Record<string, Transaction[]> = {};
        const today = new Date().toISOString().split('T')[0];
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = yesterdayDate.toISOString().split('T')[0];

        filteredAndSortedTransactions.forEach(t => {
            let dateLabel = formatDate(t.date);
            if (t.date === today) dateLabel = "BUGÜN";
            else if (t.date === yesterday) dateLabel = "DÜN";
            if (!groups[dateLabel]) groups[dateLabel] = [];
            groups[dateLabel].push(t);
        });
        return groups;
    }, [filteredAndSortedTransactions]);

    // 📄 PDF RAPORU
    const exportToPDF = () => {
        if (filteredAndSortedTransactions.length === 0) return alert("Raporlanacak veri bulunamadı.");
        const doc = new jsPDF() as jsPDFWithAutoTable;
        doc.setFontSize(18);
        doc.text("MOTTO COFFEE COLLECTION - FINANSAL RAPOR", 14, 20);
        doc.setFontSize(10);
        doc.text(`Tarih Araligi: ${filterPeriod.toUpperCase()} | Tip: ${filterType.toUpperCase()}`, 14, 28);

        const tableRows = filteredAndSortedTransactions.map(t => [
            formatDate(t.date), t.desc || '', t.type === 'income' ? 'GELIR' : 'GIDER', `${t.amount} TL`
        ]);

        doc.autoTable({
            startY: 35,
            head: [['TARIH', 'ACIKLAMA', 'TIP', 'TUTAR']],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] }
        });
        doc.save(`Motto_Finans_Raporu_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    // 📊 EXCEL RAPORU
    const exportToExcel = () => {
        const excelData = filteredAndSortedTransactions.map(t => ({
            "TARİH": formatDate(t.date),
            "AÇIKLAMA": (t.desc || '').toUpperCase(),
            "NET TUTAR": t.amount,
            "PUAN İNDİRİMİ": t.loyaltyDiscount || 0,
            "HARCANAN M-COIN": t.pointsSpent || 0,
            "KAZANILAN M-COIN": t.earnedPoints || 0, // ✨ Kazanılan puan sayısı
            "ÖDEME TİPİ": getSubMethod(t).toUpperCase()
        }));
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "İşlemler");
        XLSX.writeFile(workbook, `Motto_Finans_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    // 📱 WHATSAPP ÖZET
    const sendWhatsAppSummary = () => {
        const msg = `*☕ MOTTO COFFEE - GÜNLÜK RAPOR*
-----------------------------------
✅ *TOPLAM SATIŞ:* ${formatCurrency(filteredTotals.income)} TL
❌ *TOPLAM GİDER:* ${formatCurrency(filteredTotals.expense)} TL
-----------------------------------
💎 *LOYALTY ANALİZİ*
📈 *KAZANILAN PUAN:* +${filteredTotals.totalPointsEarned} M-Coin
📉 *HARCANAN PUAN:* -${filteredTotals.totalPointsUsed} M-Coin
📉 *TOPLAM İNDİRİM:* -${formatCurrency(filteredTotals.totalDiscountTL)} TL
-----------------------------------
💰 *KASA NET:* ${formatCurrency(filteredTotals.income - filteredTotals.expense)} TL
-----------------------------------
📱 _Motto Finans Takip_`;

        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
    };

    const handleDeleteTransaction = async (id: string) => {
        await deleteDoc(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'transactions', id));
    };

    const handleAddTransaction = async () => {
        // ... (diğer kontroller)
        if (!newTrans.amount || !newTrans.desc) return alert('Tutar ve açıklama zorunludur.');

        const newItem = {
            ...newTrans,
            amount: Number(newTrans.amount),
            // ✨ Saniye bazlı saat bilgisi ekleniyor
            createdAt: new Date().toISOString(),
            // Filtreleme için sadece tarih
            date: new Date().toISOString().split('T')[0]
        };

        await addDoc(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'transactions'), {
            ...newItem,
            timestamp: serverTimestamp() // ✨ Saat gösterimi için gerekli
        });

        setNewTrans({
            date: new Date().toISOString().split('T')[0],
            type: 'income',
            method: 'cash',
            cardBank: 'ziraat',
            category: 'Günlük',
            amount: '',
            desc: ''
        });
    };

    const handleAssetTransfer = async () => {
        if (!transferData.amount || !transferData.desc) return alert('Tutar ve açıklama zorunludur.');
        const batch = writeBatch(db);
        const expenseRef = doc(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'transactions'));
        batch.set(expenseRef, {
            type: 'expense',
            amount: Number(transferData.amount),
            desc: `Transfer: ${transferData.desc} (${transferData.from} -> ${transferData.to})`,
            method: transferData.from === 'cash' ? 'cash' : 'card',
            cardBank: transferData.from !== 'cash' ? transferData.from : null,
            category: 'Transfer',
            date: new Date().toISOString().split('T')[0],
            timestamp: serverTimestamp(), // ✨ Saat gösterimi için gerekli
            createdAt: new Date().toISOString()
        });
        const incomeRef = doc(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'transactions'));
        batch.set(incomeRef, {
            type: 'income',
            amount: Number(transferData.amount),
            desc: `Transfer: ${transferData.desc} (${transferData.from} -> ${transferData.to})`,
            method: transferData.to === 'cash' ? 'cash' : 'card',
            cardBank: transferData.to !== 'cash' ? transferData.to : null,
            category: 'Transfer',
            date: new Date().toISOString().split('T')[0],
            timestamp: serverTimestamp(), // ✨ Saat gösterimi için gerekli
            createdAt: new Date().toISOString()
        });
        await batch.commit();
        setTransferData({ from: 'ziraat', to: 'cash', amount: '', desc: '' });
    };

    const applyQuickAction = (action: QuickAction) => {
        setNewTrans({
            // ...newTrans, // Use spread if needed, but here we overwrite
            date: new Date().toISOString().split('T')[0],
            type: action.type,
            method: action.method,
            cardBank: action.cardBank || 'ziraat',
            category: action.category || 'Günlük',
            desc: action.desc,
            amount: ''
        });
    };

    const handleDeleteQuickAction = async (id: string) => {
        await deleteDoc(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'quickActions', id));
    };

    const handleAddQuickAction = async () => {
        if (!newShortcut.label || !newShortcut.desc) return alert('İşlem adı ve açıklama zorunludur.');
        await addDoc(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'quickActions'), {
            ...newShortcut,
            createdAt: new Date()
        });
        setNewShortcut({
            label: '',
            type: 'expense',
            method: 'cash',
            cardBank: 'ziraat',
            category: 'Günlük',
            desc: '',
            icon: '⚡'
        });
        setIsEditingShortcuts(false);
    };

    return {
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
    };
};
