import React, { Dispatch, SetStateAction, useMemo } from 'react';
import { CalendarClock, User, X, Utensils, Receipt as ReceiptIcon, Search, TrendingUp, ArrowUpNarrowWide, ArrowDownWideNarrow, ArrowDownAZ, AlertCircle, Plus, ShoppingCart, ChevronLeft, Trash2, Wallet, CreditCard, Printer, CheckCircle2, Coffee, QrCode, Zap, Star, Cigarette, HelpCircle, Bell } from 'lucide-react';
import { getCategoryTheme } from '../../utils/pos/themes';
import { formatCurrency } from '../../utils/helpers';
// @ts-ignore
import Receipt from '../Receipt';
import { Table, Product, Staff } from '../../types';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../utils/roles';
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
    handleRemoveOrder: (tableId: string, orderId: string, price: number) => void;
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
    onCompleteRequest?: (tableId: string, requestId: string) => void;
}

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
    onCompleteRequest
}) => {
    const { hasPermission } = usePermissions();
    const totalOrders = useMemo(() => selectedTable?.orders.reduce((a, b) => a + b.quantity, 0) || 0, [selectedTable?.orders]);
    const SortIcon = useMemo(() => {
        switch (sortOption) {
            case 'price-asc': return ArrowUpNarrowWide;
            case 'price-desc': return ArrowDownWideNarrow;
            case 'name': return ArrowDownAZ;
            default: return TrendingUp;
        }
    }, [sortOption]);

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

            {/* Header / Toolbar Area */}
            <div className={`mb-4 flex justify-between items-center bg-transparent`}>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSelectedTable(null)}
                        className={`group flex items-center gap-2 px-5 py-3 rounded-2xl border font-bold text-sm transition-all active:scale-95 ${isDarkMode ? 'bg-slate-900 text-slate-300 border-white/5 hover:text-white hover:bg-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:shadow-md'}`}
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        MASALARA DÖN
                    </button>
                    <div>
                        <h3 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{selectedTable.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            {selectedTable.status === 'reserved' && <span className="text-[10px] text-purple-500 font-bold flex items-center gap-1 uppercase tracking-wider bg-purple-500/10 px-2 py-0.5 rounded-full"><CalendarClock size={12} /> {selectedTable.reservation?.customerName}</span>}
                            {selectedTable.staffId && (
                                <div className="flex items-center gap-1">
                                    <div className={`p-1 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}><User size={10} className={isDarkMode ? 'text-slate-500' : 'text-slate-400'} /></div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{staffList?.find(s => s.id === selectedTable.staffId)?.name || 'Personel'}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onToggleVIP}
                        className={`p-3 rounded-2xl border transition-all hover:scale-105 active:scale-95 ${selectedTable.isVIP ? 'bg-amber-500 text-white border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] animate-pulse' : (isDarkMode ? 'bg-slate-900 text-slate-400 hover:text-amber-400 border-white/5' : 'bg-white text-slate-500 hover:text-amber-500 border-slate-200 shadow-sm')}`}
                        title="VIP Durumu"
                    >
                        <Star size={20} fill={selectedTable.isVIP ? "currentColor" : "none"} />
                    </button>

                    <button
                        onClick={() => window.open(`/qr-menu?table=${selectedTable.id}`, '_blank')}
                        className={`p-3 rounded-2xl border transition-all hover:scale-105 active:scale-95 ${isDarkMode ? 'bg-slate-900 text-slate-400 hover:text-white border-white/5' : 'bg-white text-slate-500 hover:text-indigo-600 border-slate-200 shadow-sm'}`}
                        title="QR Menü Linki"
                    >
                        <QrCode size={20} />
                    </button>

                    {/* Mobile Only Tab Switcher */}
                    <div className={`lg:hidden p-1 rounded-2xl flex border ${isDarkMode ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                        <button onClick={() => setRightPanelMode('menu')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black flex items-center gap-2 transition-all ${rightPanelMode === 'menu' ? (isDarkMode ? 'bg-indigo-600 text-white shadow-lg' : 'bg-indigo-600 text-white shadow-md') : 'text-slate-500'}`}><Utensils size={14} /> MENÜ</button>
                        <button onClick={() => setRightPanelMode('bill')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black flex items-center gap-2 transition-all ${rightPanelMode === 'bill' ? (isDarkMode ? 'bg-emerald-600 text-white shadow-lg' : 'bg-emerald-600 text-white shadow-md') : 'text-slate-500'}`}><ReceiptIcon size={14} /> ADİSYON {totalOrders > 0 && <span className="ml-1 bg-white text-emerald-600 w-4 h-4 rounded-full flex items-center justify-center text-[8px]">{totalOrders}</span>}</button>
                    </div>
                </div>
            </div>

            {/* Main POS Interface */}
            <div className="flex-1 flex gap-4 overflow-hidden relative">

                {/* MENU PANEL (Matches MenuPanel structure) */}
                <div className={`
                    flex-1 flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all duration-500
                    ${rightPanelMode === 'bill' ? 'hidden lg:flex' : 'flex'}
                    ${isDarkMode ? 'bg-[#0F131C] border-white/5' : 'bg-white border-slate-200'}
                `}>
                    {/* MENU HEADER */}
                    <div className={`p-4 border-b flex items-center justify-between gap-4 ${isDarkMode ? 'border-white/5' : 'border-slate-100 bg-slate-50/50'}`}>
                        <div className="relative group flex-1 max-w-md">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Ürün ara..."
                                value={menuSearchTerm}
                                onChange={(e) => setMenuSearchTerm(e.target.value)}
                                className={`block w-full pl-12 pr-4 py-3 border rounded-2xl text-xs font-medium placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${isDarkMode ? 'bg-slate-950 border-white/5 text-white focus:bg-[#141824]' : 'bg-white border-slate-200 text-slate-800'}`}
                            />
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                                className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${isDarkMode ? 'bg-slate-900 border-white/5 text-slate-400 hover:text-white hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-500 hover:text-indigo-600 hover:shadow-md'}`}
                            >
                                <SortIcon size={20} />
                            </button>
                            {isSortMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsSortMenuOpen(false)}></div>
                                    <div className={`absolute right-0 top-14 w-48 rounded-2xl border shadow-2xl p-1 z-50 flex flex-col gap-1 animate-in fade-in zoom-in-95 ${isDarkMode ? 'bg-[#141824] border-white/10' : 'bg-white border-slate-200'}`}>
                                        <button onClick={() => { setSortOption('popularity'); setIsSortMenuOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'}`}><TrendingUp size={16} /> En Çok Satan</button>
                                        <button onClick={() => { setSortOption('price-asc'); setIsSortMenuOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'}`}><ArrowUpNarrowWide size={16} /> Fiyat Artan</button>
                                        <button onClick={() => { setSortOption('price-desc'); setIsSortMenuOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'}`}><ArrowDownWideNarrow size={16} /> Fiyat Azalan</button>
                                        <button onClick={() => { setSortOption('name'); setIsSortMenuOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'}`}><ArrowDownAZ size={16} /> İsim (A-Z)</button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 flex overflow-hidden">
                        {/* CATEGORY SIDEBAR (Matches CategorySidebar structure) */}
                        <div className={`
                            w-24 lg:w-28 flex flex-col gap-2 p-2 border-r overflow-y-auto custom-scrollbar shrink-0 pb-20
                            ${isDarkMode ? 'bg-[#11151f]/50 border-white/5' : 'bg-slate-50/50 border-slate-100'}
                        `}>
                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] pl-2 mb-1 mt-2">KATEGORİ</div>
                            {categories.map(cat => {
                                const theme = getCategoryTheme(cat, isDarkMode);
                                const isSelected = selectedCategory === cat;
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`
                                            relative w-full text-left px-3 py-4 rounded-xl text-[10px] font-black transition-all duration-300 group overflow-hidden border
                                            ${isSelected
                                                ? `${theme.bg} ${theme.text} ${theme.border} shadow-lg`
                                                : `bg-transparent border-transparent ${isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'}`
                                            }
                                        `}
                                    >
                                        {isSelected && isDarkMode && <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full shadow-[0_0_10px] ${theme.indicator} bg-current opacity-80`}></div>}
                                        <span className="relative z-10 block truncate leading-tight">{cat}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* PRODUCT GRID (Matches ProductGrid and ProductCard) */}
                        <div className={`
                            flex-1 overflow-y-auto p-4 custom-scrollbar
                            ${isDarkMode
                                ? 'bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:2rem_2rem]'
                                : 'bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:16px_16px] bg-slate-50/50'}
                        `}>
                            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 content-start pb-20">
                                {processedProducts.map(product => {
                                    const theme = getCategoryTheme(product.category, isDarkMode);
                                    const hasLowStock = product.stock !== undefined && product.stock <= 5;
                                    const hasOptions = product.options && product.options.length > 0;
                                    return (
                                        <button
                                            key={product.id}
                                            onClick={() => handleProductClick(product)}
                                            className={`
                                                group relative h-28 md:h-32 p-3 rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1 hover:shadow-xl active:scale-95
                                                ${theme.bg} ${theme.hoverBg} border-transparent ${theme.hoverBorder}
                                            `}
                                        >
                                            {hasLowStock && (
                                                <span className="absolute top-1 left-1 bg-white text-red-600 border border-red-200 text-[9px] font-black px-1.5 py-0.5 rounded-md z-20 shadow-sm animate-pulse flex items-center gap-1">
                                                    <AlertCircle size={8} /> Son {product.stock}
                                                </span>
                                            )}
                                            {hasOptions && <span className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full animate-pulse shadow-sm z-20 opacity-80"></span>}

                                            <div className="relative z-10 w-full text-left">
                                                <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest block truncate opacity-80 mb-1 ${theme.text}`}>{product.category}</span>
                                                <h3 className={`text-[10px] md:text-xs font-black leading-tight transition-colors line-clamp-2 pr-4 ${isDarkMode ? 'text-slate-200 group-hover:text-white' : 'text-white'}`}>{product.name}</h3>
                                            </div>

                                            <div className="relative z-10 flex items-end justify-between w-full mt-auto">
                                                <div className="flex items-baseline gap-0.5">
                                                    <span className={`font-black text-sm tracking-tight ${theme.priceColor}`}>{formatCurrency(product.price)}</span>
                                                    <span className={`text-[10px] font-bold ${theme.priceColor}`}>₺</span>
                                                </div>
                                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 shadow-md ${theme.iconStyle}`}><Plus size={12} strokeWidth={3} /></div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Only Floating Cart Link */}
                    <div className={`lg:hidden p-4 border-t z-20 ${isDarkMode ? 'border-white/5 bg-slate-950/80 backdrop-blur-md' : 'border-slate-100 bg-white/80 backdrop-blur-md shadow-[0_-5px_20px_rgba(0,0,0,0.05)]'}`}>
                        <button onClick={() => setRightPanelMode('bill')} className={`w-full p-4 rounded-2xl shadow-xl flex items-center justify-between group active:scale-[0.98] transition-all duration-300 relative overflow-hidden bg-indigo-600 text-white`}>
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 relative">
                                    <ShoppingCart size={20} />
                                    {totalOrders > 0 && <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 border-2 border-indigo-600 flex items-center justify-center text-[9px] font-bold">{totalOrders}</div>}
                                </div>
                                <div className="flex flex-col items-start text-left">
                                    <span className="text-xs font-black tracking-wide uppercase">Siparişe Dön</span>
                                    <span className="text-[10px] text-indigo-100">Ödeme & Adisyon Detayı</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-black text-lg">{formatCurrency(selectedTable.total)} ₺</span>
                                <ChevronLeft size={18} className="rotate-180" />
                            </div>
                        </button>
                    </div>
                </div>

                {/* CART PANEL (Matches CartPanel structure) */}
                <div className={`
                    w-full lg:w-[460px] flex flex-col rounded-3xl border shadow-2xl overflow-hidden shrink-0 h-full transition-all duration-500
                    ${rightPanelMode === 'menu' ? 'hidden lg:flex' : 'flex'}
                    ${isDarkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200'}
                `}>
                    {/* CART HEADER */}
                    <div className={`p-5 border-b flex items-center justify-between ${isDarkMode ? 'bg-[#141824] border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <div className="flex items-center gap-3">
                            <span className={`text-sm font-black tracking-widest uppercase ${isDarkMode ? 'text-white/50' : 'text-slate-400'}`}>GÜNCEL ADİSYON</span>
                        </div>
                        <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            AKTİF MASA
                        </div>
                    </div>

                    {/* CART LIST AREA */}
                    <div className={`flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
                        {selectedTable.orders.length > 0 ? (
                            selectedTable.orders.map((order: any) => (
                                <div key={order.id} className={`flex justify-between items-center p-4 rounded-2xl border group transition-all shadow-sm ${isDarkMode ? 'bg-slate-800 border-white/5 hover:border-white/10' : 'bg-white border-slate-100 hover:border-indigo-200'}`}>
                                    <div className="flex-1 min-w-0 pr-3">
                                        <div className="flex flex-col">
                                            <span className={`text-sm font-black block truncate mb-0.5 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{order.name}</span>
                                            {order.note && <span className="text-[10px] text-orange-500 italic font-medium px-2 py-0.5 bg-orange-500/5 rounded-md inline-block w-fit mt-1">Not: {order.note}</span>}
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>x{order.quantity} Adet</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 shrink-0">
                                        <span className="font-black text-sm text-emerald-500">{formatCurrency(order.price * order.quantity)} ₺</span>
                                        <button onClick={() => handleRemoveOrder(selectedTable.id, order.id, order.price)} className={`p-2.5 rounded-xl transition-all active:scale-90 ${isDarkMode ? 'text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-200'}`}><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 opacity-30">
                                <Coffee size={64} strokeWidth={1} />
                                <p className="text-sm font-black tracking-widest uppercase">Henüz sipariş yok</p>
                            </div>
                        )}
                    </div>

                    {/* CART SUMMARY & CHECKOUT */}
                    <div className={`p-5 border-t shrink-0 z-30 flex flex-col gap-4 ${isDarkMode ? 'bg-slate-950 border-white/5 shadow-[0_-5px_30px_rgba(0,0,0,0.5)]' : 'bg-slate-50 border-slate-200 shadow-[0_-5px_30px_rgba(0,0,0,0.05)]'}`}>
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">TOPLAM TUTAR</span>
                            <span className={`text-4xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{formatCurrency(selectedTable.total)} <span className="text-lg text-slate-500 font-normal">₺</span></span>
                        </div>

                        {hasPermission(PERMISSIONS.TABLE_CLOSE) ? (
                            <>
                                {/* ÖDEME YÖNTEMİ SEÇİCİ (POS Style) */}
                                <div className={`p-1 rounded-2xl flex border relative ${isDarkMode ? 'bg-slate-900/50 border-white/5' : 'bg-slate-200/40 border-slate-200'}`}>
                                    <button
                                        onClick={() => setPaymentMethod('cash')}
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 transition-all relative z-10 ${paymentMethod === 'cash' ? 'text-white shadow-lg' : (isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')}`}
                                    >
                                        {paymentMethod === 'cash' && <div className="absolute inset-0 bg-emerald-600 rounded-xl -z-10 animate-in fade-in zoom-in-95 duration-200" />}
                                        <Wallet size={16} /> NAKİT
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('card')}
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 transition-all relative z-10 ${paymentMethod === 'card' ? 'text-white shadow-lg' : (isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')}`}
                                    >
                                        {paymentMethod === 'card' && <div className="absolute inset-0 bg-indigo-600 rounded-xl -z-10 animate-in fade-in zoom-in-95 duration-200" />}
                                        <CreditCard size={16} /> KART
                                    </button>
                                </div>

                                {/* BANKA SEÇİCİ (POS Style) */}
                                {paymentMethod === 'card' && (
                                    <div className="flex gap-2 animate-in slide-in-from-top-2 fade-in">
                                        {bankOptions.map(opt => {
                                            const isActive = cardBank === opt.key;
                                            return (
                                                <button
                                                    key={opt.key}
                                                    onClick={() => setCardBank(opt.key)}
                                                    className={`flex-1 h-14 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-200 overflow-hidden relative group ${isActive ? `border-white/20 text-white shadow-lg scale-105` : (isDarkMode ? 'bg-slate-800 border-white/5 hover:bg-slate-700 text-slate-500' : 'bg-slate-100/80 border-slate-200 hover:bg-slate-200 text-slate-600')}`}
                                                >
                                                    {isActive && <div className={`absolute inset-0 bg-gradient-to-br ${opt.gradient} -z-10`} />}
                                                    <span className={`text-[9px] font-black uppercase tracking-wider ${isActive ? 'text-white' : (isDarkMode ? 'text-slate-400' : 'text-slate-500')}`}>{opt.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={handlePrintBill}
                                        disabled={selectedTable.total <= 0}
                                        className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all shadow-lg active:scale-95 ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-400 hover:text-white' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800'}`}
                                    >
                                        <Printer size={24} />
                                    </button>
                                    <button
                                        onClick={() => setIsCloseModalOpen(true)}
                                        disabled={selectedTable.total <= 0 || processing}
                                        className={`flex-1 h-14 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white ${processing ? 'bg-slate-600' : (paymentMethod === 'cash' ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-emerald-500/30 hover:shadow-emerald-500/50' : `bg-gradient-to-r ${(bankOptions.find(b => b.key === cardBank) || bankOptions[0]).gradient} shadow-indigo-500/30`)}`}
                                    >
                                        {processing ? <Zap className="animate-spin" size={24} /> : <CheckCircle2 size={24} />}
                                        {processing ? 'İŞLENİYOR...' : 'HESABI KAPAT'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className={`p-4 border rounded-2xl text-center shadow-inner ${isDarkMode ? 'bg-rose-500/5 border-rose-500/20' : 'bg-rose-50 border-rose-100'}`}>
                                <p className="text-xs text-rose-500 font-black tracking-widest mb-3 uppercase">ÖDEME YETKİNİZ YOK</p>
                                <button onClick={handlePrintBill} disabled={selectedTable.total <= 0} className={`w-full py-4 rounded-xl font-black transition-all border flex items-center justify-center gap-3 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700 shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 shadow-sm'}`}><Printer size={20} /> ADİSYON YAZDIR</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Hidden Receipt Component */}
            <Receipt data={printData} />
        </div>
    );
};

export default TableDetailPanel;
