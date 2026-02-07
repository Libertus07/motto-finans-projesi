// Basic Types
export type ID = string;
export type Price = number;
export type ISODateString = string; // e.g., "2023-01-01T12:00:00.000Z"

// Enums / Unions
export type TableStatus = 'empty' | 'occupied' | 'ordered' | 'reserved' | 'needs_cleaning';
export type PaymentMethod = 'cash' | 'card' | 'iban';
export type BankName = 'ziraat' | 'halk' | 'iban';
export type TransactionType = 'income' | 'expense' | 'redeem';

// --- INTERFACES ---

// User / Staff
export interface User {
    uid: ID;
    email: string | null;
    isAnonymous: boolean;
}

export interface Staff {
    id: ID;
    name: string;
    role: string; // 'Garson' | 'Kasiyer' | ...
    pin?: string;
    salary: number;
    salaryDay: number;
    phone?: string;
    startDate?: ISODateString;
    lastSeen?: ISODateString;
    advances?: StaffFinanceItem[];
    payments?: StaffFinanceItem[];
}

export interface StaffFinanceItem {
    id: number;
    amount: number;
    date: ISODateString;
    method?: string;
    transactionId?: string;
    type?: 'salary' | 'advance';
}

// Product Option (for customizable products)
export interface ProductOption {
    id?: string | number;
    name: string;
    price: number;
    priceDiff?: number; // Price difference from base product
    category?: string;
}

// Breakdown Item (for financial stats)
export interface BreakdownItem {
    category: string;
    amount: number;
    percentage: number;
}

// Payment Item (for transaction payments)
export interface PaymentItem {
    method: 'cash' | 'card' | 'iban';
    amount: number;
    bank?: string;
    timestamp?: string;
}

// Firebase Timestamp (union type for Firebase timestamp formats)
export type FirebaseTimestamp = {
    seconds: number;
    nanoseconds: number;
    toDate?: () => Date; // Firestore Timestamp method
} | string | Date;

// QR Menu Cart Item (different from POS OrderItem)
export interface QrCartItem {
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    options?: ProductOption[];
    note?: string;
    image?: string;
}

// Order (for QR Menu orders)
export interface Order {
    id: string;
    items: QrCartItem[];
    total: number;
    status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
    createdAt: FirebaseTimestamp;
    tableId?: string;
    customerPhone?: string;
    notes?: string;
}

// Product
export interface Product {
    id: ID;
    name: string;
    price: Price;
    cost: Price;
    category: string;
    description?: string;
    image?: string;
    stock?: number;
    isFavorite?: boolean;
    order?: number;
    sold?: number;
    salesCount?: number; // Usage found in dashboard logic, seemingly alias for sold
    minStock?: number;
    // Diet & Allergens
    isVegan?: boolean;
    isGlutenFree?: boolean;
    isSpicy?: boolean;
    calories?: number;
    allergens?: string[];
    // Options/Variants could be added here
    options?: ProductOption[];
}

// Order Item (in a table or cart)
export interface OrderItem {
    id: ID;
    productId: ID;
    name: string;
    price: Price;
    quantity: number;
    note?: string;
    createdAt?: ISODateString;
    status?: 'pending' | 'preparing' | 'served' | 'cancelled';
}

// Table
export interface Table {
    id: ID;
    name: string;
    number: number;
    zone: 'Bahçe' | 'Teras' | 'Salon' | 'Üst Kat' | string;
    status: TableStatus;
    orders: OrderItem[];
    total: Price;
    paid?: number; // Store partial payments persistence

    // Ownership & Timing
    staffId?: ID | null;
    startTime?: ISODateString | null;
    lastOrderTime?: ISODateString | null;
    lastActivity?: ISODateString | null;
    isVIP?: boolean;

    // Reservation
    reservation?: {
        customerName: string;
        time: string; // "19:30"
        note?: string;
        isVIP?: boolean;
    } | null;

    // Service Requests
    requests?: {
        id: string;
        type: 'waiter' | 'bill' | 'ashtray' | 'other' | 'special';
        time: string;
        status: 'pending' | 'completed';
    }[];
}

// Transaction (Income/Expense)
export interface Transaction {
    id: ID;
    date: ISODateString; // YYYY-MM-DD
    type: TransactionType;
    amount: Price;

    // Details
    category?: string; // for expenses: 'Stok', 'Kira', etc.
    method: PaymentMethod | 'mix';
    subMethod?: string; // 'Z Raporu', 'Nakit'

    cardBank?: BankName | null;

    desc?: string;
    staffId?: ID; // if related to a staff payment/advance
    user?: string; // 'Sistem', 'Admin', etc.
    timestamp?: { seconds: number; nanoseconds: number } | string | Date; // timestamp strictly typed
    createdAt?: string;
    discount?: number;
    loyaltyDiscount?: number;
    // Loyalty & Shopping details
    customerPhone?: string;
    items?: OrderItem[]; // For sales with details
    pointsSpent?: number;
    earnedPoints?: number;
    status?: 'valid' | 'void' | 'deleted' | 'refunded';
}

export type CartItem = OrderItem; // Alias for CartItem

// Financial Stats (Dashboard)
export interface FinancialStats {
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
    netNetProfit: number; // after fixed costs

    currentBalance: number;

    assets: {
        cash: number;
        ziraat: number;
        halk: number;
        iban: number;
        gold: number;
        mix: number;
    };

    investmentStats: {
        totalCost: number;
        currentValue: number;
        totalProfit: number;
    };
    dailyIncome: number;
    monthlyIncome: number;
    monthlyExpense: number;
    breakdown: BreakdownItem[];
    totalDebt: number;
    totalMonthlyFixedCosts: number;
}

// Settings
export interface FixedCosts {
    rent: number;
    staff: number;
    bills: number;
    other: number;
    [key: string]: number;
}

export interface LoyaltySettings {
    welcomeBonus: number;
    birthdayBonus: number;
    [key: string]: number;
}

// Debts
export interface Debt {
    id: ID;
    supplier: string;
    amount: number;
    remaining: number;
    note?: string;
    dueDate?: ISODateString;
    contact?: string;
    status: 'pending' | 'paid' | 'partial';
    createdAt: ISODateString;
    type: 'debt' | 'payment';
    payments: PaymentItem[];
    lastPaymentDate?: ISODateString;
}

// Investments
export interface Investment {
    id: ID;
    type: string;
    quantity: number;
    buyPrice: number;
    currentPrice: number;
    date: ISODateString;
}

// Unified Customer (POS and QR Menu)
export interface LoyaltyCustomer {
    id: string;
    phone: string;
    points: number;
    name?: string;
    surname?: string;
    birthday?: string;
    createdAt?: string;
    lastBirthdayGiftYear?: number;
    tier?: string;
    // QR Menu fields
    email?: string;
    favorites?: string[];
    coffeeStamps?: number;
    lastSpinDate?: string;
    // Allow additional dynamic properties for flexibility
    [key: string]: string | number | string[] | undefined;
}

export type LoyaltyTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export interface Challenge {
    id: string;
    title: string;
    description: string;
    reward: number;
    target: number;
    progress: number;
    status: 'active' | 'completed' | 'claimed';
    icon: string;
    type: 'profile' | 'order_count' | 'spend_amount' | 'referral' | 'social' | 'custom';
    criteria?: string;
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    condition: 'first_order' | 'order_count_10' | 'order_count_50' | 'spend_1000' | 'coffee_lover' | 'night_owl' | 'early_bird' | 'social_star' | 'profile_master' | 'vip' | 'legend';
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    earnedDate?: string;
}

export interface CustomerProfile {
    uid: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    isVIP?: boolean;
    birthday: string;
    points: number;
    favorites: string[];
    createdAt: string;
    role?: string;
    isAdmin?: boolean;
    lastSpinDate?: string; // YYYY-MM-DD
    coffeeStamps?: number;
    photoURL?: string;
    personalInviteCode?: string;
    referredBy?: string; // ID or Code of referrer
    badges?: string[]; // IDs of earned badges
    claimedChallenges?: string[];
    totalOrders?: number;
    totalSpend?: number;
    referralCount?: number;
}

// Settings Categories
export interface Category {
    id: string;
    name: string;
}

export interface Deal {
    id: string;
    title: string;
    description: string;
    code: string;
    expiresAt?: string;
    image?: string;
    isActive?: boolean;
    discountValue: number;
    discountType: 'percentage' | 'fixed';
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    createdAt: string;
    read: boolean;
    type?: string;
}

export interface PointHistoryItem {
    id: string;
    type: 'earned' | 'spent' | 'game' | 'gift' | 'order' | 'usage' | 'referral' | 'welcome_bonus';
    points: number;
    earnedPoints?: number;
    desc?: string;
    description?: string;
    orderId?: string;
    createdAt: string;
    timestamp?: FirebaseTimestamp;
}

export interface Card {
    id: string;
    holderName: string;
    number: string;
    maskedNumber?: string;
    expiry: string;
    cvc?: string;
    createdAt: string;
    type?: string;
}

// Ingredients
// Ingredients
export interface Ingredient {
    id: string;
    name: string;
    unit: string;
    stock: number;
    price: number;
    cost?: number;
    alertThreshold?: number;
    order?: number;
}

// Quick Actions (Predefined buttons)
export interface QuickAction {
    id: string;
    label: string;
    type: TransactionType;
    desc: string;
    method: PaymentMethod;
    cardBank?: BankName;
    category?: string;
    icon?: string;
    createdAt?: FirebaseTimestamp;
}

export interface HeldOrder {
    id: string;
    items: CartItem[];
    total: number;
    time: string;
}

export interface ReceiptData {
    title: string;
    type: string;
    items: {
        name: string;
        quantity: number;
        price: number;
        option?: string;
        note?: string;
    }[];
    total: number;
    date: string;
    rawTotal?: number;
    discount?: number;
    paid?: number;
    remaining?: number;
    orderNo?: number;
}

export interface DashboardContextType {
    transactions: Transaction[];
    products: Product[];
    investments: Investment[];
    debts: Debt[];
    ingredients: Ingredient[];
    quickActions: QuickAction[];
    tables: Table[];
    fixedCosts: FixedCosts;
    setFixedCosts: (val: FixedCosts) => void;
    monthlyGoal: number;
    setMonthlyGoal: (val: number) => void;
    marketRates: Record<string, number>;
    stats: FinancialStats;
    staff: Staff[];
    categories: Category[];
    loading: boolean;
    userRole: string | null;
    customers: LoyaltyCustomer[];
    loyaltySettings: LoyaltySettings;
    setLoyaltySettings: (val: LoyaltySettings) => void;
    currentStaff: Staff | null;
}
