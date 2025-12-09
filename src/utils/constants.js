// ✅ DÜZELTME: Gemini API Key artık .env'den VITE_ önekiyle çekiliyor.
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "API Anahtarı Yüklenemedi";
export const ADMIN_PASSWORD = 'Motto1786';

export const THEME = {
  bg: "bg-slate-950",
  card: "bg-slate-900",
  border: "border-slate-800",
  text: "text-slate-200",
  textMuted: "text-slate-400",
  primary: "indigo",
  accent: "emerald",
  danger: "red"
};

export const CATEGORIES = ['Kahveler', 'Sıcak İçecekler', 'Tatlılar', 'Yemek', 'Diğer'];
export const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const COLOR_MAP = {
  indigo: { bg: 'bg-indigo-500', text: 'text-indigo-500', hoverBorder: 'hover:border-indigo-500/50' },
  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-500', hoverBorder: 'hover:border-emerald-500/50' },
  amber: { bg: 'bg-amber-500', text: 'text-amber-500', hoverBorder: 'hover:border-amber-500/50' },
  red: { bg: 'bg-red-500', text: 'text-red-500', hoverBorder: 'hover:border-red-500/50' },
  blue: { bg: 'bg-blue-500', text: 'text-blue-500', hoverBorder: 'hover:border-blue-500/50' },
  purple: { bg: 'bg-purple-500', text: 'text-purple-500', hoverBorder: 'hover:border-purple-500/50' },
};

export const INITIAL_MARKET_RATES = { 'Gram Altın': 5746.23, 'Dolar': 42.53, 'Euro': 49.56, 'Çeyrek Altın': 9192.59, 'Gümüş': 63.33 };
export const INITIAL_MONTHLY_GOAL = 1200000;

export const INITIAL_TRANSACTIONS = [
  { id: 't1', date: '2025-12-01', type: 'income', method: 'mix', subMethod: 'Z Raporu', amount: 38846, desc: 'Pazartesi Ciro' },
  { id: 't2', date: '2025-12-01', type: 'expense', category: 'Günlük', method: 'cash', amount: 1390, desc: 'Eren Süt + Yemek' },
  { id: 't3', date: '2025-12-06', type: 'income', method: 'mix', subMethod: 'Z Raporu', amount: 60059, desc: 'Cumartesi Ciro' },
  { id: 't4', date: '2025-12-07', type: 'expense', category: 'Fatura/Kira', method: 'card', cardBank: 'ziraat', amount: 4500, desc: 'Kira Ödemesi' },
  { id: 't5', date: '2025-12-07', type: 'income', method: 'cash', subMethod: 'Nakit', amount: 12000, desc: 'Nakit Satış' },
  { id: 't6', date: '2025-12-07', type: 'expense', category: 'Stok', method: 'cash', amount: 2500, desc: 'Süt Alımı' },
  { id: 't7', date: '2025-12-08', type: 'income', method: 'mix', subMethod: 'Z Raporu', amount: 72000, desc: 'Pazar Ciro' },
];

export const INITIAL_PRODUCTS = [
  { id: 'p1', name: 'Çay', price: 25, cost: 3.5, category: 'Sıcak İçecekler', sold: 1543, order: 1 },
  { id: 'p2', name: 'Türk Kahvesi', price: 95, cost: 8.0, category: 'Kahveler', sold: 145, order: 2 },
  { id: 'p3', name: 'Tiramisu', price: 180, cost: 101.0, category: 'Tatlılar', sold: 12, order: 3 },
];

export const INITIAL_DEBTS = [
  { id: 'd1', supplier: 'Sütçü Ahmet', amount: 4500, dueDate: '2025-12-15', note: 'Haftalık süt ödemesi', type: 'debt' },
  { id: 'd2', supplier: 'Toptancı Mehmet', amount: 12000, dueDate: '2025-12-20', note: 'Kahve çekirdekleri', type: 'debt' }
];

export const INITIAL_QUICK_ACTIONS = [
  { id: 'q1', order: 1, label: 'Ciro (Z)', type: 'income', method: 'mix', cardBank: null, category: null, desc: 'Günlük Ciro', icon: '💰' },
  { id: 'q2', order: 2, label: 'Yemek', type: 'expense', method: 'cash', cardBank: null, category: 'Günlük', desc: 'Personel Yemek', icon: '🍔' },
  { id: 'q3', order: 3, label: 'Süt', type: 'expense', method: 'card', cardBank: 'ziraat', category: 'Stok', desc: 'Süt Alımı', icon: '🥛' },
];

export const INITIAL_INVESTMENTS = [
  { id: 'i1', date: '2025-12-06', type: 'Çeyrek Altın', quantity: 5, buyPrice: 4900, currentPrice: 9192.59 },
  { id: 'i2', date: '2025-12-01', type: 'Dolar', quantity: 200, buyPrice: 34.50, currentPrice: 42.53 },
];

export const INITIAL_INGREDIENTS = [
    { id: 'ing1', name: 'Süt', unit: 'Litre', price: 25, order: 1 },
    { id: 'ing2', name: 'Mascarpone', unit: 'kg', price: 450, order: 2 },
];

export const INITIAL_NOTES = [
  { id: 'n1', text: 'Vergi ödemesi ayın 26\'sında unutma!', done: false, createdAt: Date.now() },
];

// 50 MASA, BÖLGELER VE SIRALAMA NUMARASI
export const INITIAL_TABLES = Array.from({ length: 50 }, (_, i) => {
    const num = i + 1;
    let zone = 'Bahçe';

    if (num <= 13) zone = 'Teras';        // 1-13
    else if (num <= 26) zone = 'Salon';   // 14-26
    else if (num <= 35) zone = 'Üst Kat'; // 27-35
    else zone = 'Bahçe';                  // 36-50

    return {
        id: `table-${num}`,
        name: `Masa ${num}`,
        number: num, // <--- YENİ EKLENEN SIRALAMA ANAHTARI
        zone: zone,
        status: 'empty',
        orders: [],
        total: 0
    };
});