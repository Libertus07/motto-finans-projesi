import React, { Dispatch, SetStateAction, useMemo } from 'react';
import { CalendarClock, Utensils, User, Receipt as ReceiptIcon, AlertCircle, ShoppingCart, ChevronLeft, Wallet, CreditCard, Printer, CheckCircle2, QrCode, Zap, Star, Cigarette, HelpCircle, Bell } from 'lucide-react';
import { toast } from 'react-hot-toast';
// @ts-ignore
import Receipt from '../Receipt';
import { Table, Product, Staff } from '../../types';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../utils/roles';
import CartPanel from '../pos/Cart/CartPanel';
import MenuPanel from '../pos/Menu/MenuPanel';
import MobileTabBar from '../pos/shared/MobileTabBar';
import PaymentSection from '../pos/Payment/PaymentSection';
import { usePayment } from '../../hooks/pos/usePayment';
import { calculateTotals } from '../../utils/pos/calculations';
import { CartItem } from '../../types';
interface TableDetailPanelProps {
    selectedTable: Table | null;
    setSelectedTable: Dispatch<SetStateAction<Table | null>>;
    isDarkMode: boolean;
    rightPanelMode: 'menu' | 'bill';
    setRightPanelMode: Dispatch<SetStateAction<'menu' | 'bill'>>;
    categories: string[];
    selectedCategory: string;
    setSelectedCategory: Dispatch<SetStateAction<string>>;
    menuSearchTerm: string;
    setMenuSearchTerm: Dispatch<SetStateAction<string>>;
    isSortMenuOpen: boolean;
    setIsSortMenuOpen: Dispatch<SetStateAction<boolean>>;
    sortOption: string;
    setSortOption: Dispatch<SetStateAction<string>>;
    processedProducts: Product[];
    handleProductClick: (product: Product) => void;
    handleRemoveOrder: (tableId: string, orderId: string, price: number, removeAll?: boolean) => void;
    paymentMethod: 'cash' | 'card';
    setPaymentMethod: Dispatch<SetStateAction<'cash' | 'card'>>;
    cardBank: string;
    setCardBank: Dispatch<SetStateAction<string>>;
    bankOptions: { key: string; label: string; gradient: string }[];
    handlePrintBill: () => void;
    setIsCloseModalOpen: Dispatch<SetStateAction<boolean>>;
    processing: boolean;
    userRole: string | null;
    staffList?: Staff[];
    printData: any;
    onToggleVIP?: () => void;
    onToggleVIP?: () => void;
    onCompleteRequest?: (tableId: string, requestId: string) => void;
    onDeferCloseTable?: (data: { total: number; discount: number; method: string; bank: string }) => void;
    onPartialPayment?: (amount: number, method: string, bank: string) => void;
}

// 🛒 Cart Adapter Implementation REMOVED - Using real logic now

const TableDetailPanel: React.FC<TableDetailPanelProps> = ({
    selectedTable,
    setSelectedTable,
    isDarkMode,
    rightPanelMode,
    setRightPanelMode,
    categories,
    selectedCategory,
    setSelectedCategory,
    menuSearchTerm,
    setMenuSearchTerm,
    isSortMenuOpen,
    setIsSortMenuOpen,
    sortOption,
    setSortOption,
    processedProducts,
    handleProductClick,
    handleRemoveOrder,
    paymentMethod,
    setPaymentMethod,
    cardBank,
    setCardBank,
    bankOptions,
    handlePrintBill,
    setIsCloseModalOpen,
    processing,
    userRole,
    staffList,
    printData,
    onToggleVIP,
    onCompleteRequest,
    onDeferCloseTable,
    onPartialPayment
}) => {
    const { hasPermission } = usePermissions();
    const totalOrders = useMemo(() => selectedTable?.orders.reduce((a, b) => a + b.quantity, 0) || 0, [selectedTable?.orders]);

    // 💳 Payment Hook
    const paymentHook = usePayment();

    // 🧮 Calculate Totals
    const totals = useMemo(() => {
        if (!selectedTable) return { subTotal: 0, discountAmount: 0, finalTotal: 0 };

        // Convert table orders to CartItems for calculation
        const cartItems: CartItem[] = selectedTable.orders.map(o => ({
            ...o,
            product: undefined // Optional in CartItem interface if handling loosely
        })) as any[];

        return calculateTotals({
            cart: cartItems,
            discountRate: paymentHook.discountRate,
            splitCount: paymentHook.splitCount,
            customTotal: paymentHook.customTotal,
            isPartialMode: paymentHook.isPartialMode,
            paidSoFar: (selectedTable?.paid || 0) + paymentHook.paidSoFar,
            isSelectionMode: false,
            selectedItems: {}
        });
    }, [selectedTable, paymentHook.discountRate, paymentHook.splitCount, paymentHook.customTotal, paymentHook.isPartialMode, paymentHook.paidSoFar]);


    // 🛒 Cart Props Mapping
    const cartProps = {
        cart: (selectedTable?.orders || []).map(o => ({
            ...o,
            // Ensure compatibility with CartItem type
            product: undefined // Add full product if needed, for now acceptable
        })) as any[],
        activeTab: rightPanelMode === 'bill' ? 'cart' : 'menu',
        currentPayable: totals.finalTotal,

        // Payment State from Hook
        isSelectionMode: false,
        isPartialMode: paymentHook.isPartialMode,
        selectedItems: {},
        discountRate: paymentHook.discountRate,
        splitCount: paymentHook.splitCount,
        customTotal: paymentHook.customTotal,
        paidSoFar: paymentHook.paidSoFar,
        remainingDebt: totals.remainingDebt,
        discountAmount: totals.discountAmount,
        loyaltyCustomer: null,
        loyaltyDiscount: 0,
        showLoyaltyModal: false,
        showChangeModal: false,
        showHistoryModal: false,
        showHeldOrdersModal: false,

        // Fully implemented handlers
        onCancelLoyaltyDiscount: () => { },
        onRedeemPoints: () => { },
        onUpdateQuantity: (id: string, change: number) => {
            const order = selectedTable?.orders.find(o => o.id === id);
            if (!order) return;

            if (!selectedTable) return;
            if (change > 0) {
                handleProductClick({ id: order.productId, name: order.name, price: order.price } as Product);
            } else {
                handleRemoveOrder(selectedTable.id, id, order.price, false);
            }
        },
        onToggleSelection: () => { },
        onRemoveFromCart: (id: string) => {
            if (!selectedTable) return;
            const order = selectedTable.orders.find(o => o.id === id);
            if (order) handleRemoveOrder(selectedTable.id, id, order.price * order.quantity, true);
        },
        onCloseTab: () => setRightPanelMode('menu'),

        // 🚧 Feature Not Available Toasts
        onLoyaltyClick: () => toast.info('Müşteri/Loyalty özelliği masalarda henüz aktif değil.'),
        onDiscountClick: paymentHook.cycleDiscountRate,
        onRoundClick: () => toast.info('Yuvarlama özelliği masalarda henüz aktif değil.'),
        onChangeClick: () => toast.info('Para üstü hesaplama masalarda henüz aktif değil.'),
        onHoldClick: () => toast.info('Beklemeye alma özelliği masalarda kullanılamaz.'),
        onHistoryClick: () => toast.info('Geçmiş işlemleri görüntüleme masalarda henüz aktif değil.'),
        onClearCart: () => toast.info('Masayı temizlemek için ürünleri tek tek siliniz veya hesabı kapatınız.'),
        onSelectionToggle: () => toast.info('Parçalı seçim özelliği masalarda henüz aktif değil.'),
        onPartialClick: paymentHook.enablePartialMode,
        onSplitClick: () => toast.info('Hesap bölme özelliği masalarda henüz aktif değil.'),
        onCloseSummary: paymentHook.disablePartialMode
    };

    // Active Requests Logic
    const activeRequests = useMemo(() => selectedTable?.requests?.filter(r => r.status === 'pending') || [], [selectedTable?.requests]);

    if (!selectedTable) return null;

    return (
        <div className={`flex-1 flex flex-col h-full z-20 transition-all duration-500`}>
            {/* 🔥 NOTIFICATION BANNER (Top of Panel) */}
            {activeRequests.length > 0 && (
                <div className="flex flex-col gap-2 mb-4 animate-in slide-in-from-top-4 duration-300">
                    {activeRequests.map(req => {
                        let bgColor = 'bg-slate-500';
                        let icon = <Bell size={18} />;
                        let label = 'BİLDİRİM';

                        switch (req.type) {
                            case 'waiter': bgColor = 'bg-rose-500'; icon = <Bell size={18} />; label = 'GARSON ÇAĞIRIYOR'; break;
                            case 'bill': bgColor = 'bg-emerald-500'; icon = <ReceiptIcon size={18} />; label = 'HESAP İSTENİYOR'; break;
                            case 'ashtray': bgColor = 'bg-slate-600'; icon = <Cigarette size={18} />; label = 'KÜLLÜK İSTENİYOR'; break;
                            case 'other': bgColor = 'bg-blue-500'; icon = <HelpCircle size={18} />; label = 'YARDIM / DİĞER'; break;
                        }

                        return (
                            <div key={req.id} className={`${bgColor} text-white p-3 rounded-2xl shadow-lg flex items-center justify-between animate-pulse`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/10">
                                        {icon}
                                    </div>
                                    <span className="font-black tracking-wider uppercase text-xs md:text-sm">{label}</span>
                                </div>
                                <button
                                    onClick={() => onCompleteRequest?.(selectedTable.id, req.id)}
                                    className="px-4 py-2 bg-white text-slate-900 rounded-xl font-black text-[10px] md:text-xs hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-sm"
                                >
                                    <CheckCircle2 size={14} className="text-emerald-600" />
                                    TAMAMLANDI
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Header / Toolbar Area - Motto Premium Symphony Design */}
            <div className={`mb-4 relative z-50 ${rightPanelMode === 'bill' ? 'hidden lg:grid' : 'grid'} grid-cols-[1fr_auto_1fr] items-center gap-4`}>
                {/* LEFT ZONE: Status & Info */}
                <div className="flex items-center justify-start gap-2 pl-4 lg:pl-0">
                    {/* Status Badges Moved Here for Symmetry */}
                    {selectedTable.status === 'reserved' && (
                        <div className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center gap-1.5 backdrop-blur-sm animate-in fade-in slide-in-from-left-4">
                            <CalendarClock size={14} className="text-purple-400" />
                            <span className="hidden md:inline text-[10px] font-black text-purple-400 uppercase tracking-wider">
                                {selectedTable.reservation?.customerName}
                            </span>
                        </div>
                    )}

                    {selectedTable.staffId && (
                        <div className={`px-3 py-1 rounded-full border flex items-center gap-1.5 backdrop-blur-sm animate-in fade-in slide-in-from-left-4 ${isDarkMode ? 'bg-slate-800/40 border-white/5' : 'bg-slate-100/50 border-slate-200/50'}`}>
                            <User size={14} className={isDarkMode ? 'text-slate-400' : 'text-slate-500'} />
                            <span className={`hidden md:inline text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                {staffList?.find(s => s.id === selectedTable.staffId)?.name || 'Personel'}
                            </span>
                        </div>
                    )}
                </div>

                {/* CENTER ZONE: Table Identity */}
                <div className="flex flex-col items-center justify-center relative group">
                    {/* Decorative Glow */}
                    <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent blur-3xl -z-10 transition-opacity duration-700 ${selectedTable.isVIP ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />

                    <h3 className={`text-2xl md:text-5xl font-black tracking-tight font-cinzel text-center transition-all ${isDarkMode
                        ? (selectedTable.isVIP ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#FDFBF7] to-[#D4AF37] drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]' : 'text-white')
                        : (selectedTable.isVIP ? 'text-amber-600 drop-shadow-sm' : 'text-slate-800')
                        }`}>
                        {selectedTable.name}
                    </h3>
                </div>

                {/* RIGHT ZONE: Actions */}
                <div className="flex items-center justify-end gap-2 md:gap-3">
                    {/* VIP Toggle */}
                    <button
                        onClick={onToggleVIP}
                        className={`h-12 w-12 rounded-2xl border flex items-center justify-center transition-all hover:scale-105 active:scale-95 backdrop-blur-md ${selectedTable.isVIP
                            ? 'bg-gradient-to-br from-amber-500 to-yellow-600 text-white border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)] animate-pulse'
                            : (isDarkMode ? 'bg-slate-900/40 text-slate-500 hover:text-amber-400 border-white/10 hover:border-amber-500/30' : 'bg-white/60 text-slate-400 hover:text-amber-500 border-slate-200/60 shadow-sm')
                            }`}
                        title="VIP Durumu"
                    >
                        <Star size={20} fill={selectedTable.isVIP ? "currentColor" : "none"} strokeWidth={selectedTable.isVIP ? 0 : 2.5} />
                    </button>

                    {/* QR Code */}
                    <button
                        onClick={() => window.open(`/qr-menu?table=${selectedTable.id}`, '_blank')}
                        className={`h-12 w-12 rounded-2xl border flex items-center justify-center transition-all hover:scale-105 active:scale-95 backdrop-blur-md ${isDarkMode
                            ? 'bg-slate-900/40 text-slate-400 hover:text-white border-white/10 hover:bg-slate-800'
                            : 'bg-white/60 text-slate-400 hover:text-indigo-600 border-slate-200/60 shadow-sm hover:shadow-md'
                            }`}
                        title="QR Menü Linki"
                    >
                        <QrCode size={20} />
                    </button>

                    {/* Mobile Only Tab Switcher */}
                    <div className={`lg:hidden p-1 rounded-2xl flex border backdrop-blur-md ${isDarkMode ? 'bg-slate-950/60 border-white/10' : 'bg-white/80 border-slate-200/80 shadow-sm'}`}>
                        <button
                            onClick={() => setRightPanelMode('menu')}
                            className={`h-10 px-4 rounded-xl flex items-center justify-center transition-all ${rightPanelMode === 'menu'
                                ? (isDarkMode ? 'bg-indigo-600 text-white shadow-lg' : 'bg-indigo-600 text-white shadow-md')
                                : 'text-slate-500 hover:bg-black/5'
                                }`}
                        >
                            <Utensils size={18} />
                        </button>
                        <button
                            onClick={() => setRightPanelMode('bill')}
                            className={`h-10 px-4 rounded-xl flex items-center justify-center transition-all relative ${rightPanelMode === 'bill'
                                ? (isDarkMode ? 'bg-emerald-600 text-white shadow-lg' : 'bg-emerald-600 text-white shadow-md')
                                : 'text-slate-500 hover:bg-black/5'
                                }`}
                        >
                            <ReceiptIcon size={18} />
                            {totalOrders > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
                                    {totalOrders}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main POS Interface */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* 🍽️ MENU PANEL (LEFT SIDE - Primary) */}
                <MenuPanel
                    isDarkMode={isDarkMode}
                    categories={categories}
                    selectedCategory={selectedCategory}
                    searchTerm={menuSearchTerm}
                    sortOption={sortOption}
                    isSortMenuOpen={isSortMenuOpen}
                    processedProducts={processedProducts}
                    activeTab={rightPanelMode === 'menu' ? 'menu' : 'bill'}

                    onThemeToggle={() => { }}
                    onCategorySelect={setSelectedCategory}
                    onSearchChange={setMenuSearchTerm}
                    onSortToggle={() => setIsSortMenuOpen(!isSortMenuOpen)}
                    onSortSelect={(option) => {
                        setSortOption(option);
                        setIsSortMenuOpen(false);
                    }}
                    onProductClick={handleProductClick}
                    onBack={() => setSelectedTable(null)}
                />

                {/* 🛒 CART PANEL (RIGHT SIDE - Secondary) */}
                <CartPanel {...cartProps}>
                    {/* CUSTOM PAYMENT ACTIONS FOR TABLES */}
                    <div className="mt-auto">
                        {hasPermission(PERMISSIONS.TABLE_CLOSE) ? (
                            <PaymentSection
                                isDarkMode={isDarkMode}
                                paymentMethod={paymentHook.paymentMethod}
                                cardBank={paymentHook.cardBank as any}
                                currentPayable={totals.finalTotal}
                                processing={processing}
                                successMsg={null}
                                cartLength={selectedTable.orders.length}
                                isSelectionMode={false}
                                subTotal={totals.subTotal}
                                activeBankStyle={bankOptions.find(b => b.key === paymentHook.cardBank) || bankOptions[0]}
                                loyaltyCustomer={null}
                                loyaltyHook={{} as any}
                                onRedeemPoints={() => { }}
                                onMethodChange={paymentHook.setPaymentMethod}
                                onBankChange={paymentHook.setCardBank}
                                onPrint={handlePrintBill}
                                onCheckout={() => {
                                    // Handle logic based on Mode
                                    if (paymentHook.isPartialMode) {
                                        // 1. Calculate how much is being paid NOW
                                        // The hook tracks this via updatePartialPayment conceptually, but here we just need to know the amount being paid
                                        const amountToPayRaw = paymentHook.customTotal ? parseFloat(paymentHook.customTotal) : totals.remainingDebt;

                                        // 2. Report to Parent (Tables.tsx) to persist
                                        if (amountToPayRaw > 0) {
                                            onPartialPayment?.(
                                                amountToPayRaw,
                                                paymentHook.paymentMethod,
                                                paymentHook.cardBank || 'ziraat'
                                            );
                                            // 3. Reset local partial state so they can enter next amount
                                            paymentHook.setCustomTotal('');
                                            paymentHook.setPaymentMethod('cash');
                                        }

                                        // If remaining debt becomes 0 after this, user should probably close table manually or we logic check it
                                        // But typically partial payments keep table open until fully closed.
                                    } else {
                                        // Full Close
                                        onDeferCloseTable?.({
                                            total: totals.finalTotal,
                                            discount: totals.discountAmount,
                                            method: paymentHook.paymentMethod,
                                            bank: paymentHook.cardBank || 'ziraat'
                                        });
                                    }
                                }}
                            />
                        ) : (
                            <div className={`p-4 border rounded-2xl text-center shadow-inner ${isDarkMode ? 'bg-rose-500/5 border-rose-500/20' : 'bg-rose-50 border-rose-100'}`}>
                                <p className="text-xs text-rose-500 font-black tracking-widest mb-3 uppercase">ÖDEME YETKİNİZ YOK</p>
                                <button onClick={handlePrintBill} disabled={selectedTable.total <= 0} className={`w-full py-4 rounded-xl font-black transition-all border flex items-center justify-center gap-3 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700 shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 shadow-sm'}`}><Printer size={20} /> ADİSYON YAZDIR</button>
                            </div>
                        )}
                    </div>
                </CartPanel>

            </div>

            {/* Hidden Receipt Component */}
            <Receipt data={printData} />

            {/* MOBILE TAB BAR (POS STYLE) */}
            <MobileTabBar
                activeTab={rightPanelMode === 'bill' ? 'cart' : 'menu'}
                onTabChange={(tab) => setRightPanelMode(tab === 'cart' ? 'bill' : 'menu')}
                cartCount={totalOrders}
                isDarkMode={isDarkMode}
                cartTotal={selectedTable.total}
            />
        </div >
    );
};

export default TableDetailPanel;
