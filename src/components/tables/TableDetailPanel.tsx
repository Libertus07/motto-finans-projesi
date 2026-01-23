import React, { Dispatch, SetStateAction } from 'react';
import { CalendarClock, User, X, Utensils, Receipt as ReceiptIcon, Search, TrendingUp, ArrowUpNarrowWide, ArrowDownWideNarrow, ArrowDownAZ, AlertCircle, Plus, ShoppingCart, ChevronLeft, Trash2, Wallet, CreditCard, Printer, CheckCircle2, Coffee, QrCode } from 'lucide-react';
import { getCategoryTheme } from '../../utils/tableTheme';
import { formatCurrency } from '../../utils/helpers';
// @ts-ignore
import Receipt from '../Receipt';
import { Table, Product, Staff } from '../../types';

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
    printData: any; // Complex object structure, can be typed later or 'any' for now
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
    printData
}) => {
    if (!selectedTable) return null;

    const SortIcon = (() => { switch (sortOption) { case 'price-asc': return ArrowUpNarrowWide; case 'price-desc': return ArrowDownWideNarrow; case 'name': return ArrowDownAZ; default: return TrendingUp; } })();

    return (
        <div className={`w-full lg:w-[600px] shrink-0 border-l flex flex-col absolute lg:static inset-0 z-20 shadow-2xl transition-all ${isDarkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200'}`}>
            {/* Header */}
            <div className={`p-4 border-b shrink-0 backdrop-blur-md ${isDarkMode ? 'bg-slate-950/95 border-white/5' : 'bg-white/95 border-slate-100'}`}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{selectedTable.name}</h3>
                        {selectedTable.status === 'reserved' && <span className="text-xs text-purple-500 font-bold flex items-center gap-1"><CalendarClock size={12} /> {selectedTable.reservation?.customerName}</span>}
                        {/* ✨ PERSONEL BİLGİSİ */}
                        {selectedTable.staffId && (
                            <div className="flex items-center gap-1.5 mt-1">
                                <div className={`p-1 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}><User size={10} className={isDarkMode ? 'text-slate-400' : 'text-slate-500'} /></div>
                                <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{staffList?.find(s => s.id === selectedTable.staffId)?.name || 'Personel'}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => window.open(`/qr-menu?table=${selectedTable.id}`, '_blank')}
                            className={`p-2 rounded-lg border transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white border-white/5' : 'bg-slate-100 text-slate-500 hover:text-slate-800 border-slate-200'}`}
                            title="QR Menü Linki"
                        >
                            <QrCode size={20} />
                        </button>
                        <button onClick={() => setSelectedTable(null)} className={`p-2 rounded-lg border transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white border-white/5' : 'bg-slate-100 text-slate-500 hover:text-slate-800 border-slate-200'}`}><X size={20} /></button>
                    </div>
                </div>
                <div className={`p-1 rounded-xl flex border ${isDarkMode ? 'bg-slate-900/50 border-white/5' : 'bg-slate-100 border-slate-200'}`}><button onClick={() => setRightPanelMode('menu')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${rightPanelMode === 'menu' ? (isDarkMode ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-indigo-600 shadow-md') : 'text-slate-400 hover:text-slate-600'}`}><Utensils size={16} /> MENÜ</button><button onClick={() => setRightPanelMode('bill')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${rightPanelMode === 'bill' ? (isDarkMode ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-emerald-600 shadow-md') : 'text-slate-400 hover:text-slate-600'}`}><ReceiptIcon size={16} /> ADİSYON</button></div>
            </div>

            {/* Content: Menu Mode */}
            {rightPanelMode === 'menu' && (
                <div className="flex-1 flex overflow-hidden">
                    <div className={`w-24 border-r flex flex-col gap-2 p-2 overflow-y-auto custom-scrollbar shrink-0 pb-20 ${isDarkMode ? 'bg-slate-900/50 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                        {categories.map(cat => { const theme = getCategoryTheme(cat, isDarkMode); const isSelected = selectedCategory === cat; return (<button key={cat} onClick={() => setSelectedCategory(cat)} className={`relative w-full text-center py-4 rounded-xl text-[10px] font-bold transition-all duration-300 group overflow-hidden border ${isSelected ? `${theme.bg} ${theme.border} ${isDarkMode ? 'text-white' : 'text-white'} shadow-lg` : 'bg-transparent border-transparent text-slate-500 hover:text-slate-600'}`}>{isSelected && <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full shadow-sm ${theme.indicator}`}></div>}<span className={`relative z-10 block truncate leading-tight ${isSelected ? theme.text : ''}`}>{cat}</span></button>); })}
                    </div>
                    <div className={`flex-1 flex flex-col overflow-hidden ${isDarkMode ? 'bg-slate-950 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)]' : 'bg-slate-50'} bg-[size:2rem_2rem]`}>
                        <div className={`p-4 border-b flex gap-3 shrink-0 ${isDarkMode ? 'border-white/5' : 'border-slate-200 bg-white'}`}><div className="relative group flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" /><input type="text" placeholder="Ürün ara..." value={menuSearchTerm} onChange={(e) => setMenuSearchTerm(e.target.value)} className={`block w-full pl-10 pr-3 py-3 border rounded-xl text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all ${isDarkMode ? 'bg-slate-900 border-white/5 text-white focus:bg-slate-800' : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white'}`} /></div><div className="relative"><button onClick={() => setIsSortMenuOpen(!isSortMenuOpen)} className={`w-12 h-full rounded-xl border flex items-center justify-center transition-colors ${isDarkMode ? 'bg-slate-800/50 border-white/5 text-slate-400 hover:text-white hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-white'}`}><SortIcon size={18} /></button>{isSortMenuOpen && (<><div className="fixed inset-0 z-40" onClick={() => setIsSortMenuOpen(false)}></div><div className={`absolute right-0 top-12 w-48 rounded-xl border shadow-2xl p-1 z-50 flex flex-col gap-1 animate-in fade-in zoom-in-95 ${isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}><button onClick={() => { setSortOption('popularity'); setIsSortMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold ${isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'}`}><TrendingUp size={14} /> En Çok Satan</button><button onClick={() => { setSortOption('price-asc'); setIsSortMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold ${isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'}`}><ArrowUpNarrowWide size={14} /> Fiyat Artan</button><button onClick={() => { setSortOption('price-desc'); setIsSortMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold ${isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'}`}><ArrowDownWideNarrow size={14} /> Fiyat Azalan</button><button onClick={() => { setSortOption('name'); setIsSortMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold ${isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'}`}><ArrowDownAZ size={14} /> İsim (A-Z)</button></div></>)}</div></div>
                        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar"><div className="grid grid-cols-3 gap-2"> {processedProducts.map(product => { const theme = getCategoryTheme(product.category, isDarkMode); return (<button key={product.id} onClick={() => handleProductClick(product)} className={`group relative h-24 p-2 rounded-xl border ${theme.bg} ${theme.border} ${theme.hoverBg} ${theme.hoverBorder} hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden hover:-translate-y-1`}>{product.stock !== undefined && product.stock <= 5 && <span className="absolute top-1 left-1 bg-red-600/90 text-white text-[7px] font-bold px-1 py-0.5 rounded-md z-20 shadow-sm animate-pulse flex items-center gap-1"><AlertCircle size={6} /> Son {product.stock}</span>}{product.options && product.options.length > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse shadow-sm z-20"></span>}<div className="relative z-10 w-full text-left mt-2"><span className={`text-[7px] font-bold uppercase tracking-widest block truncate opacity-70 ${theme.text}`}>{product.category}</span><h3 className={`text-[10px] md:text-xs font-bold leading-tight transition-colors line-clamp-2 pr-1 mt-0.5 ${theme.titleColor}`}>{product.name}</h3></div><div className="relative z-10 flex items-end justify-between w-full mt-auto"><div className="flex items-baseline gap-0.5"><span className={`font-bold text-xs tracking-tight ${theme.priceColor}`}>{formatCurrency(product.price)}</span><span className={`text-[8px] font-bold ${theme.currencyColor}`}>₺</span></div><div className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-300 shadow-sm ${theme.iconBtn}`}><Plus size={10} strokeWidth={3} /></div></div></button>); })}</div></div>
                        <div className={`p-4 border-t z-20 ${isDarkMode ? 'border-white/5 bg-slate-950' : 'border-slate-200 bg-white'}`}><button onClick={() => setRightPanelMode('bill')} className={`w-full border p-2 rounded-2xl shadow-xl flex items-center justify-between group active:scale-[0.98] transition-all duration-300 relative overflow-hidden ${isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200 hover:border-indigo-200'}`}><div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" /><div className="flex items-center gap-3 relative z-10"><div className={`w-12 h-12 rounded-xl flex items-center justify-center relative shadow-inner border group-hover:bg-slate-700 transition-colors ${isDarkMode ? 'bg-slate-800 border-white/5' : 'bg-slate-100 border-slate-200 group-hover:bg-white'}`}><ShoppingCart size={20} className="text-slate-500" />{selectedTable.orders.reduce((a, b) => a + b.quantity, 0) > 0 && <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 border-[3px] border-[#141824] flex items-center justify-center"><span className="text-[9px] font-bold text-white">{selectedTable.orders.reduce((a, b) => a + b.quantity, 0)}</span></div>}</div><div className="flex flex-col items-start"><span className={`text-xs font-bold tracking-wide ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Siparişi Tamamla</span><span className="text-[10px] text-slate-400 group-hover:text-indigo-400 transition-colors">Ödemeye Geç</span></div></div><div className="bg-indigo-600 px-4 py-3 rounded-xl shadow-lg shadow-indigo-900/40 flex items-center gap-1 group-hover:bg-indigo-500 transition-colors relative z-10"><span className="font-black text-sm text-white tracking-tight">{formatCurrency(selectedTable.total)}</span><span className="text-[10px] font-bold text-indigo-200">₺</span><ChevronLeft size={14} className="text-indigo-200 ml-1 rotate-180 opacity-60" /></div></button></div>
                    </div>
                </div>
            )}

            {/* Content: Bill Mode */}
            {rightPanelMode === 'bill' && (
                <div className={`flex-1 flex flex-col overflow-hidden ${isDarkMode ? '' : 'bg-slate-50'}`}>
                    <div className={`flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
                        {selectedTable.orders.length > 0 ? (selectedTable.orders.map((order: any) => (<div key={order.id} className={`flex justify-between items-center p-3 rounded-xl border group transition-colors shadow-sm ${isDarkMode ? 'bg-slate-800 border-white/5 hover:border-white/10' : 'bg-white border-slate-200 hover:border-indigo-200'}`}><div className="flex-1 min-w-0 pr-2"><div className="flex flex-col"><span className={`text-sm font-bold block truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{order.name}</span>{order.note && <span className="text-[10px] text-orange-500 italic truncate">Not: {order.note}</span>}</div><span className="text-[10px] text-slate-500 font-bold tracking-wider">x{order.quantity} Adet</span></div><div className="flex items-center gap-3 shrink-0"><span className="font-bold text-sm text-emerald-500">{formatCurrency(order.price * order.quantity)} ₺</span><button onClick={() => handleRemoveOrder(selectedTable.id, order.id, order.price)} className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'text-slate-600 hover:text-rose-500 hover:bg-rose-500/10' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'}`}><Trash2 size={16} /></button></div></div>))) : <div className="h-full flex flex-col items-center justify-center text-slate-400"><Coffee size={48} className="opacity-20 mb-4" /><p className="text-sm font-bold">Henüz sipariş yok.</p></div>}
                    </div>
                    <div className={`p-5 border-t ${isDarkMode ? 'bg-slate-950 border-white/5' : 'bg-white border-slate-200'}`}>
                        <div className="flex justify-between items-end mb-5"><span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Toplam Tutar</span><span className={`text-4xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{formatCurrency(selectedTable.total)} <span className="text-lg text-slate-500 font-normal">₺</span></span></div>
                        {userRole !== 'garson' ? (<><div className="grid grid-cols-2 gap-3 mb-4"><button onClick={() => setPaymentMethod('cash')} className={`py-4 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 border-2 ${paymentMethod === 'cash' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-500/20' : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100')}`}><Wallet size={24} className={paymentMethod === 'cash' ? 'text-white' : 'opacity-50'} /><span className="text-xs font-black tracking-wide">NAKİT</span></button><button onClick={() => setPaymentMethod('card')} className={`py-4 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 border-2 ${paymentMethod === 'card' ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/20' : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100')}`}><CreditCard size={24} className={paymentMethod === 'card' ? 'text-white' : 'opacity-50'} /><span className="text-xs font-black tracking-wide">KART</span></button></div>{paymentMethod === 'card' && (<div className="grid grid-cols-3 gap-2 mb-4 animate-in fade-in slide-in-from-top-2">{bankOptions.map(opt => (<button key={opt.key} onClick={() => setCardBank(opt.key)} className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 transition-all ${cardBank === opt.key ? `bg-gradient-to-r ${opt.gradient} border-white/20 text-white shadow-md` : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100')}`}>{opt.label}</button>))}</div>)}<div className="flex gap-3"><button onClick={handlePrintBill} disabled={selectedTable.total <= 0} className={`w-16 h-16 border-2 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'}`}><Printer size={28} /></button><button onClick={() => setIsCloseModalOpen(true)} disabled={selectedTable.total <= 0 || processing} className={`flex-1 h-16 rounded-2xl font-black text-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg text-white ${paymentMethod === 'cash' ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-emerald-500/20' : 'bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-indigo-500/20'}`}>{processing ? 'İşleniyor...' : 'HESABI KAPAT'} <CheckCircle2 size={24} /></button></div></>) : (<div className={`p-3 border rounded-xl text-center ${isDarkMode ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-50 border-rose-200'}`}><p className="text-xs text-rose-500 font-bold mb-2">Ödeme yetkiniz yok.</p><button onClick={handlePrintBill} disabled={selectedTable.total <= 0} className={`w-full py-3 rounded-xl font-bold transition-all border flex items-center justify-center gap-2 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'}`}><Printer size={18} /> ADİSYON YAZDIR</button></div>)}
                    </div>
                    <Receipt data={printData} />
                </div>
            )}
        </div>
    );
};

export default TableDetailPanel;
