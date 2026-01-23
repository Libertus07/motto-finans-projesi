import { Transaction } from '../types';

// Para birimi formatla (1.250,00 ₺ gibi)
export const formatCurrency = (amount: number | undefined | null): string =>
    new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount || 0);

// Tarih formatla (12 Ara gibi)
export const formatDate = (dateStr: string | number | Date): string =>
    new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });

// Ödeme yöntemini güzel gösteren fonksiyon
export const getSubMethod = (trans: Transaction): string => {
    if (trans.type === 'expense') return trans.method === 'cash' ? 'Nakit Kasa' : (trans.cardBank || 'Banka/Kart');

    // Income Logic
    if (trans.method === 'mix') return 'Z Raporu';
    if (trans.method === 'cash') return 'Nakit Kasa';
    if (trans.method === 'card') {
        return trans.cardBank === 'ziraat' ? 'Ziraat Kart' : trans.cardBank === 'halk' ? 'Halk Kart' : 'Diğer Banka';
    }
    return 'Bilinmiyor';
};

// Geçen süreyi hesapla (5 dk, 1 sa 20 dk vb.)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getElapsedString = (startTime: any): string | null => {
    if (!startTime) return null;
    // Handle Firestore Timestamp or Date string/object
    const start = typeof startTime === 'string' ? new Date(startTime) : (startTime.toDate ? startTime.toDate() : new Date(startTime));
    const diff = Math.floor((new Date().getTime() - start.getTime()) / 60000);
    if (diff < 1) return 'Yeni';
    if (diff < 60) return `${diff} dk`;
    return `${Math.floor(diff / 60)} sa ${diff % 60} dk`;
};

// Returns today's date in YYYY-MM-DD format (Local Time)
export const getTodayString = (): string => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
