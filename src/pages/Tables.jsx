// pages/Tables.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
    Table as TableIcon, Coffee, Trash2, Printer, CheckCircle2, CreditCard, Banknote, 
    X, Sun, Cloud, Home, ArrowUp, Move, CalendarClock, User, Clock, 
    FileText, Grid, Armchair, Plus, RefreshCw, ChevronLeft, Receipt as ReceiptIcon, Utensils, Search,
    ArrowDownAZ, ArrowDownWideNarrow, ArrowUpNarrowWide, TrendingUp, AlertCircle, Scissors, ShoppingCart,
    History, Sparkles, PlusCircle, Lock, Moon, LayoutGrid, Wallet, CreditCard as CardIcon, LogOut,
    ArrowRightLeft, ArrowRight, Merge, Brush, Activity
} from 'lucide-react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { addDoc, doc, updateDoc, collection, writeBatch, increment } from 'firebase/firestore';
import { db, appId, auth } from '../services/firebase';
import { formatCurrency } from '../utils/helpers';
import { THEME } from '../utils/constants';
import Receipt from '../components/Receipt';
import ConfirmationModal from '../components/ConfirmationModal';
import TableCloseModal from '../components/TableCloseModal';
import ProductOptionsModal from '../components/ProductOptionsModal'; 
import { Toaster, toast } from 'react-hot-toast';

const CURRENT_SHOP_ID = 'motto_coffee_sube_01';

// 🎨 DİNAMİK RENK MOTORU (KATEGORİLER İÇİN)
const getCategoryTheme = (categoryName, isDark) => {
    const name = (categoryName || '').toLowerCase();
    const base = isDark 
        ? { bg: 'bg-[#1e2330]', hoverBg: 'group-hover:bg-[#252a3a]', hoverBorder: 'group-hover:border-slate-500/50', border: 'border-white/5', textBase: 'text-slate-400', groupText: 'group-hover:text-white' }
        : { bg: 'bg-white', hoverBg: 'group-hover:bg-slate-50', hoverBorder: 'group-hover:border-slate-300', border: 'border-slate-200', textBase: 'text-slate-500', groupText: 'group-hover:text-slate-800' };

    if (name.includes('kahve') || name.includes('latte') || name.includes('espresso')) return { ...base, text: isDark ? 'text-amber-400' : 'text-amber-600', border: isDark ? 'border-amber-900/20 group-hover:border-amber-500/50' : 'border-amber-200 group-hover:border-amber-400', iconBg: isDark ? 'bg-amber-500/10' : 'bg-amber-100', iconText: isDark ? 'text-amber-400' : 'text-amber-600', indicator: 'text-amber-500' };
    if (name.includes('soğuk') || name.includes('su') || name.includes('frozen') || name.includes('milkshake')) return { ...base, text: isDark ? 'text-cyan-400' : 'text-cyan-600', border: isDark ? 'border-cyan-900/20 group-hover:border-cyan-500/50' : 'border-cyan-200 group-hover:border-cyan-400', iconBg: isDark ? 'bg-cyan-500/10' : 'bg-cyan-100', iconText: isDark ? 'text-cyan-400' : 'text-cyan-600', indicator: 'text-cyan-500' };
    if (name.includes('tatlı') || name.includes('pasta') || name.includes('kek') || name.includes('waffle')) return { ...base, text: isDark ? 'text-pink-400' : 'text-pink-600', border: isDark ? 'border-pink-900/20 group-hover:border-pink-500/50' : 'border-pink-200 group-hover:border-pink-400', iconBg: isDark ? 'bg-pink-500/10' : 'bg-pink-100', iconText: isDark ? 'text-pink-400' : 'text-pink-600', indicator: 'text-pink-500' };
    if (name.includes('yiyecek') || name.includes('tost') || name.includes('sandviç') || name.includes('kahvaltı')) return { ...base, text: isDark ? 'text-emerald-400' : 'text-emerald-600', border: isDark ? 'border-emerald-900/20 group-hover:border-emerald-500/50' : 'border-emerald-200 group-hover:border-emerald-400', iconBg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-100', iconText: isDark ? 'text-emerald-400' : 'text-emerald-600', indicator: 'text-emerald-500' };
    
    return { ...base, text: isDark ? 'text-indigo-400' : 'text-indigo-600', border: isDark ? 'border-indigo-900/20 group-hover:border-indigo-500/50' : 'border-indigo-200 group-hover:border-indigo-400', iconBg: isDark ? 'bg-indigo-500/10' : 'bg-indigo-100', iconText: isDark ? 'text-indigo-400' : 'text-indigo-600', indicator: 'text-indigo-500' };
};

// 📊 DETAYLI DOLULUK KONFİGÜRASYONU (GÜNCELLENDİ: KART ARKAPLANI İÇİN)
const getDetailedOccupancyConfig = (rate, isDark) => {
    // Ortak (Common) Özellikler
    const common = { 
        fillBg: isDark ? '#334155' : '#e2e8f0' 
    };

    if (rate < 20) return { 
        ...common, label: "SAKİN", fill: "#06b6d4", text: "text-cyan-400", 
        badgeBg: "bg-cyan-500/10", badgeBorder: "border-cyan-500/20", glow: "from-cyan-500/20",
        cardBg: isDark ? "bg-cyan-900/10" : "bg-cyan-50", cardBorder: isDark ? "border-cyan-500/20" : "border-cyan-200"
    };
    if (rate < 40) return { 
        ...common, label: "HAFİF TEMPO", fill: "#10b981", text: "text-emerald-400", 
        badgeBg: "bg-emerald-500/10", badgeBorder: "border-emerald-500/20", glow: "from-emerald-500/20",
        cardBg: isDark ? "bg-emerald-900/10" : "bg-emerald-50", cardBorder: isDark ? "border-emerald-500/20" : "border-emerald-200"
    };
    if (rate < 60) return { 
        ...common, label: "CANLI", fill: "#f59e0b", text: "text-amber-400", 
        badgeBg: "bg-amber-500/10", badgeBorder: "border-amber-500/20", glow: "from-amber-500/20",
        cardBg: isDark ? "bg-amber-900/10" : "bg-amber-50", cardBorder: isDark ? "border-amber-500/20" : "border-amber-200"
    };
    if (rate < 80) return { 
        ...common, label: "YOĞUN", fill: "#f97316", text: "text-orange-400", 
        badgeBg: "bg-orange-500/10", badgeBorder: "border-orange-500/20", glow: "from-orange-500/20",
        cardBg: isDark ? "bg-orange-900/10" : "bg-orange-50", cardBorder: isDark ? "border-orange-500/20" : "border-orange-200"
    };
    return { 
        ...common, label: "TAM KAPASİTE", fill: "#ef4444", text: "text-rose-500", 
        badgeBg: "bg-rose-500/10", badgeBorder: "border-rose-500/20", glow: "from-rose-500/20", animate: "animate-pulse",
        cardBg: isDark ? "bg-rose-900/10" : "bg-rose-50", cardBorder: isDark ? "border-rose-500/20" : "border-rose-200"
    };
};

// 💎 PREMIUM MASA TEMASI
const getTableTheme = (status, isDark, activeMode, isSource) => {
    const base = "transition-all duration-300 relative overflow-hidden backdrop-blur-md shadow-sm";
    
    if (activeMode === 'transfer' && isSource) {
        return {
            card: `${base} bg-blue-500/20 border-2 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.5)] scale-105 z-10`,
            textColor: "text-white",
            iconColor: "text-blue-300",
            badge: "bg-blue-500 text-white",
            glow: "from-blue-600/20 to-transparent",
            ghostIcon: "text-blue-400/20",
            ghostText: "text-blue-400"
        };
    }

    const isDimmed = (activeMode === 'clean' && status !== 'needs_cleaning') || 
                     (activeMode === 'reserve' && status !== 'empty') ||
                     (activeMode === 'transfer' && !isSource && status === 'reserved');

    const opacityClass = isDimmed ? "opacity-40 grayscale-[0.5]" : "opacity-100";

    switch (status) {
        case 'occupied': 
            return { 
                card: `${base} ${opacityClass} ` + (isDark 
                    ? `bg-rose-950/30 border border-rose-500/40 hover:border-rose-500/60 shadow-[0_0_30px_-10px_rgba(244,63,94,0.2)]`
                    : `bg-rose-100 border border-rose-300 hover:border-rose-400 shadow-md shadow-rose-200/50`), 
                textColor: isDark ? "text-rose-100" : "text-rose-900",
                iconColor: "text-rose-600",
                badge: isDark ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : "bg-white/60 border-rose-300 text-rose-700 backdrop-blur-sm",
                glow: isDark ? "from-rose-600/10 to-transparent" : "from-white/40 to-transparent"
            };
        case 'ordered': 
            return { 
                card: `${base} ${opacityClass} ` + (isDark 
                    ? `bg-amber-950/30 border border-amber-500/30 hover:border-amber-500/50 shadow-[0_0_30px_-10px_rgba(245,158,11,0.15)]`
                    : `bg-amber-50 border border-amber-200 hover:border-amber-300 shadow-amber-100/50`),
                iconColor: "text-amber-500",
                textColor: isDark ? "text-amber-100" : "text-amber-900",
                badge: isDark ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "bg-white border-amber-200 text-amber-600 shadow-sm",
                glow: isDark ? "from-amber-600/10 to-transparent" : "from-amber-100/50 to-transparent"
            };
        case 'reserved': 
            return { 
                card: `${base} ${opacityClass} ` + (isDark 
                    ? `bg-[#2e1a47] border border-purple-500/40 hover:border-purple-400/60 shadow-[0_0_25px_-5px_rgba(168,85,247,0.25)]`
                    : `bg-purple-100 border border-purple-300 hover:border-purple-400 shadow-md shadow-purple-200/50`),
                textColor: isDark ? "text-purple-100" : "text-purple-900",
                iconColor: "text-purple-600",
                badge: isDark ? "bg-purple-500/10 border-purple-500/20 text-purple-400" : "bg-white/60 border-purple-300 text-purple-700 backdrop-blur-sm",
                glow: isDark ? "from-purple-600/10 to-transparent" : "from-white/40 to-transparent"
            };
        case 'needs_cleaning': 
            return { 
                card: `${base} ${opacityClass} ` + (isDark 
                    ? `bg-cyan-950/30 border border-dashed border-cyan-500/40 hover:border-cyan-400/60`
                    : `bg-cyan-50 border-2 border-dashed border-cyan-300 hover:border-cyan-400`),
                textColor: isDark ? "text-cyan-100" : "text-cyan-900",
                iconColor: "text-cyan-500",
                badge: isDark ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-300" : "bg-white border-cyan-200 text-cyan-600",
                glow: "from-cyan-600/10 to-transparent"
            };
        case 'empty': 
        default: 
            return { 
                card: `${base} ${opacityClass} ` + (isDark 
                    ? `bg-[#161b26] border border-white/5 hover:border-emerald-500/50 hover:bg-[#1a202e] hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)] group`
                    : `bg-emerald-50 border border-emerald-200 hover:border-emerald-400 hover:shadow-lg hover:bg-emerald-100 group`), 
                textColor: isDark ? "text-slate-400 group-hover:text-emerald-300 transition-colors" : "text-emerald-900 group-hover:text-emerald-950 transition-colors",
                iconColor: isDark ? "text-emerald-600/70 group-hover:text-emerald-400 transition-colors" : "text-emerald-400 group-hover:text-emerald-600 transition-colors",
                badge: isDark ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/60 border-emerald-200 text-emerald-600",
                glow: isDark ? "from-emerald-600/5 group-hover:from-emerald-500/10 to-transparent" : "from-white/40 to-transparent",
                ghostIcon: isDark ? "text-white/10" : "text-emerald-200",
                ghostText: isDark ? "text-emerald-500/50" : "text-emerald-300"
            };
    }
};

const Tables = ({ tables, products, userRole }) => { 
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('pos_theme');
        return savedTheme ? JSON.parse(savedTheme) : true;
    });

    const [selectedTable, setSelectedTable] = useState(null);
    const [rightPanelMode, setRightPanelMode] = useState('menu'); 
    
    // 🔥 ACTIVE MODE STATE
    const [activeMode, setActiveMode] = useState('default');
    const [transferSource, setTransferSource] = useState(null);
    const [pendingTransfer, setPendingTransfer] = useState(null); 

    const [selectedCategory, setSelectedCategory] = useState('Tümü');
    const [activeZone, setActiveZone] = useState('Tümü');
    const [processing, setProcessing] = useState(false);
    const [printData, setPrintData] = useState(null);
    
    const [menuSearchTerm, setMenuSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('popularity');
    const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

    const [currentTime, setCurrentTime] = useState(new Date());

    const [isEmptyConfirmOpen, setIsEmptyConfirmOpen] = useState(false);
    const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
    const [isRezModalOpen, setIsRezModalOpen] = useState(false);
    const [rezForm, setRezForm] = useState({ name: '', time: '', note: '' });

    const [productToCustomize, setProductToCustomize] = useState(null); 
    const [paymentMethod, setPaymentMethod] = useState('cash'); 
    const [cardBank, setCardBank] = useState('ziraat');
    
    const bankOptions = [
        { key: 'ziraat', label: 'Ziraat', gradient: 'from-red-600 to-red-900', border: 'border-red-500', shadow: 'shadow-red-500/40' },
        { key: 'halk', label: 'Halk', gradient: 'from-blue-600 to-blue-900', border: 'border-blue-500', shadow: 'shadow-blue-500/40' },
        { key: 'iban', label: 'Diğer', gradient: 'from-purple-600 to-purple-900', border: 'border-purple-500', shadow: 'shadow-purple-500/40' }
    ];

    const toggleTheme = () => {
        setIsDarkMode(prev => {
            const newMode = !prev;
            localStorage.setItem('pos_theme', JSON.stringify(newMode));
            return newMode;
        });
    };

    const handleTableClickWrapper = (table) => {
        if (activeMode === 'transfer') {
            handleTransferSelection(table);
        } else if (activeMode === 'clean') {
            handleQuickClean(table);
        } else if (activeMode === 'reserve') {
            handleQuickReserve(table);
        } else {
            setSelectedTable(table);
        }
    };

    const handleQuickClean = async (table) => {
        if (table.status !== 'needs_cleaning') {
            return toast.error("Bu masa kirlenmemiş!", { icon: '✨' });
        }
        try {
            await updateDoc(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'tables', table.id), { status: 'empty', orders: [], total: 0, startTime: null, lastOrderTime: null });
            toast.success(`${table.name} Temizlendi`, { icon: '🧹' });
        } catch (error) { toast.error("Hata oluştu"); }
    };

    const handleQuickReserve = (table) => {
        if (table.status !== 'empty') {
            return toast.error("Sadece boş masalar rezerve edilebilir.");
        }
        setSelectedTable(table); 
        setIsRezModalOpen(true);
    };

    const handleTransferSelection = async (targetTable) => {
        if (!transferSource) {
            if (targetTable.status !== 'occupied' && targetTable.status !== 'ordered') {
                return toast.error("Sadece dolu masaları taşıyabilirsiniz.");
            }
            setTransferSource(targetTable);
            return;
        }
        if (transferSource.id === targetTable.id) {
            setTransferSource(null);
            toast("Seçim iptal edildi.");
            return;
        }
        if (targetTable.status === 'empty' || targetTable.status === 'needs_cleaning') {
            await executeTransfer(transferSource, targetTable, false);
        } else if (targetTable.status === 'occupied' || targetTable.status === 'ordered') {
            setPendingTransfer({ source: transferSource, target: targetTable, type: 'merge' });
        } else {
            toast.error("Bu masaya işlem yapılamaz.");
        }
    };

    const executeTransfer = async (source, target, isMerge) => {
        setProcessing(true);
        const batch = writeBatch(db);
        const sourceRef = doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'tables', source.id);
        const targetRef = doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'tables', target.id);
        try {
            let newOrders = [...target.orders];
            let newTotal = target.total;
            if (isMerge) {
                newOrders = [...newOrders, ...source.orders];
                newTotal += source.total;
            } else {
                newOrders = source.orders;
                newTotal = source.total;
            }
            batch.update(targetRef, { orders: newOrders, total: newTotal, status: 'occupied', startTime: isMerge ? target.startTime : (source.startTime || new Date().toISOString()), lastOrderTime: new Date().toISOString() });
            batch.update(sourceRef, { orders: [], total: 0, status: 'empty', startTime: null, lastOrderTime: null });
            await batch.commit();
            
            if (isMerge) {
                toast.success(`${source.name} ➔ ${target.name} Birleştirildi`, { icon: '🔀' });
            } else {
                toast.success(`${source.name} ➔ ${target.name} Taşındı`, { icon: '🚚' });
            }
            setTransferSource(null);
            setActiveMode('default');
            setPendingTransfer(null);
            setSelectedTable(null);
        } catch (error) { toast.error("İşlem başarısız."); } finally { setProcessing(false); }
    };

    const confirmTransferAction = async () => {
        if (!pendingTransfer) return;
        await executeTransfer(pendingTransfer.source, pendingTransfer.target, true);
    };

    // ... Diğer handlerlar
    useEffect(() => { const timer = setInterval(() => setCurrentTime(new Date()), 30000); return () => clearInterval(timer); }, []);
    const getElapsedString = (startTime) => { if (!startTime) return null; const start = typeof startTime === 'string' ? new Date(startTime) : startTime.toDate(); const diff = Math.floor((new Date() - start) / 60000); if (diff < 1) return 'Yeni'; if (diff < 60) return `${diff} dk`; return `${Math.floor(diff / 60)} sa ${diff % 60} dk`; };
    useEffect(() => { if (selectedTable) { setRightPanelMode('menu'); setMenuSearchTerm(''); } }, [selectedTable?.id]);
    useEffect(() => { if (!selectedTable || !tables || tables.length === 0) return; const latestTable = tables.find(t => t.id === selectedTable.id); if (latestTable && (JSON.stringify(latestTable) !== JSON.stringify(selectedTable))) { setSelectedTable(latestTable); } }, [tables, selectedTable]);
    const getZoneIcon = (zoneName) => { if (zoneName.includes('Bahçe')) return <Sun size={16}/>; if (zoneName.includes('Teras')) return <Cloud size={16}/>; if (zoneName.includes('Üst')) return <ArrowUp size={16}/>; return <Home size={16}/>; };
    const handleSaveReservation = async () => { if (!rezForm.name || !rezForm.time) return toast.error("İsim ve saat giriniz."); setProcessing(true); try { const tableRef = doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'tables', selectedTable.id); await updateDoc(tableRef, { status: 'reserved', reservation: { customerName: rezForm.name, time: rezForm.time, note: rezForm.note || '' } }); setIsRezModalOpen(false); setRezForm({ name: '', time: '', note: '' }); setSelectedTable(null); toast.success("Rezervasyon kaydedildi"); } catch (error) { console.error(error); toast.error("Hata oluştu"); } finally { setProcessing(false); } };
    const handleCancelReservation = async () => { if (!window.confirm("Rezervasyonu iptal etmek istediğinize emin misiniz?")) return; setProcessing(true); try { const tableRef = doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'tables', selectedTable.id); await updateDoc(tableRef, { status: 'empty', reservation: null }); setSelectedTable(prev => ({ ...prev, status: 'empty', reservation: null })); toast.success("Rezervasyon iptal edildi"); } catch (error) { console.error(error); toast.error("Hata oluştu"); } finally { setProcessing(false); } };
    const handleCustomerArrived = async () => { setProcessing(true); try { const tableRef = doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'tables', selectedTable.id); await updateDoc(tableRef, { status: 'occupied', reservation: null, startTime: new Date().toISOString(), lastOrderTime: null }); setSelectedTable(prev => ({ ...prev, status: 'occupied', reservation: null })); toast.success("Masa açıldı"); } catch (error) { console.error(error); } finally { setProcessing(false); } };
    const handleProductClick = (product) => { if (product.options && product.options.length > 0) { setProductToCustomize(product); } else { handleConfirmOrder({ ...product, quantity: 1 }); } };
    const handleConfirmOrder = async (customizedProduct) => { const user = auth.currentUser; if (!user || processing || !selectedTable) return; setProductToCustomize(null); setProcessing(true); const tableRef = doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'tables', selectedTable.id); try { const currentTable = tables.find(t => t.id === selectedTable.id); if (!currentTable) return; const qty = customizedProduct.quantity || 1; const unitPrice = customizedProduct.price; let newOrders = [...currentTable.orders]; let found = false; newOrders = newOrders.map(order => { if (order.name === customizedProduct.name && order.price === unitPrice && !order.isServed) { found = true; return { ...order, quantity: order.quantity + qty }; } return order; }); if (!found) { newOrders.push({ id: customizedProduct.id + '-' + Date.now(), productId: customizedProduct.id, name: customizedProduct.name, price: unitPrice, quantity: qty }); } const newTotal = currentTable.total + (unitPrice * qty); const updateData = { orders: newOrders, total: newTotal, status: currentTable.status === 'empty' ? 'occupied' : currentTable.status, lastOrderTime: new Date().toISOString() }; if (currentTable.status === 'empty') { updateData.startTime = new Date().toISOString(); } await updateDoc(tableRef, updateData); toast.success("Ürün eklendi"); } catch (error) { console.error(error); toast.error("Eklenemedi"); } finally { setProcessing(false); } };
    const handleRemoveOrder = async (tableId, orderId, price) => { if (processing) return; setProcessing(true); const tableRef = doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'tables', tableId); try { const currentTable = tables.find(t => t.id === tableId); if (!currentTable) return; const existingOrderIndex = currentTable.orders.findIndex(o => o.id === orderId); if (existingOrderIndex === -1) return; let newOrders = [...currentTable.orders]; const newTotal = currentTable.total - price; if (newOrders[existingOrderIndex].quantity > 1) { newOrders[existingOrderIndex].quantity -= 1; } else { newOrders.splice(existingOrderIndex, 1); } const newStatus = newOrders.length === 0 ? 'empty' : currentTable.status; const updateData = { orders: newOrders, total: newTotal, status: newStatus }; if (newStatus === 'empty') { updateData.startTime = null; updateData.lastOrderTime = null; } await updateDoc(tableRef, updateData); } catch (error) { console.error(error); toast.error("Silinemedi"); } finally { setProcessing(false); } };
    const confirmMarkAsEmpty = async () => { if (!selectedTable) return; await updateDoc(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'tables', selectedTable.id), { status: 'empty', orders: [], total: 0, startTime: null, lastOrderTime: null }); setSelectedTable(prev => ({...prev, status: 'empty', orders: [], total: 0})); setIsEmptyConfirmOpen(false); toast.success("Masa temizlendi"); };
    const confirmCloseTable = async () => {
        if (!selectedTable) return;
        setProcessing(true);
        try {
            const transMethod = paymentMethod === 'cash' ? 'cash' : 'card';
            const transCardBank = paymentMethod === 'card' ? cardBank : null;
            const subMethodDisplay = paymentMethod === 'cash' ? 'Nakit' : `Kart (${cardBank.toUpperCase()})`;
            await addDoc(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'transactions'), {
                date: new Date().toISOString().split('T')[0],
                type: 'income',
                amount: selectedTable.total,
                desc: `${selectedTable.name} (${selectedTable.zone}) Satışı`,
                method: transMethod,
                cardBank: transCardBank,
                category: 'Masa Satışı',
                subMethod: subMethodDisplay
            });
            // Update product sales counts
            const productUpdates = selectedTable.orders.map(async (order) => {
                const productRef = doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'products', order.productId);
                await updateDoc(productRef, {
                    salesCount: increment(order.quantity)
                });
            });
            await Promise.all(productUpdates);
            await updateDoc(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'tables', selectedTable.id), {
                orders: [],
                total: 0,
                status: 'needs_cleaning',
                startTime: null,
                lastOrderTime: null
            });
            setIsCloseModalOpen(false);
            setSelectedTable(null);
            setPaymentMethod('cash');
            setCardBank('ziraat');
            toast.success("Hesap kapatıldı");
        } catch (error) {
            console.error(error);
            toast.error("Hata oluştu");
        } finally {
            setProcessing(false);
        }
    };
    const handlePrintBill = () => { if (!selectedTable || selectedTable.orders.length === 0) return; setPrintData({ title: selectedTable.name, type: 'Masa Hesabı', items: selectedTable.orders.map(o => ({name: o.name, quantity: o.quantity, price: o.price})), total: selectedTable.total, date: new Date().toLocaleString('tr-TR') }); setTimeout(() => window.print(), 100); };
    const filteredTables = tables.filter(t => activeZone === 'Tümü' || t.zone === activeZone);
    const processedProducts = useMemo(() => { let result = products.filter(p => (selectedCategory === 'Tümü' || p.category === selectedCategory) && p.name.toLowerCase().includes(menuSearchTerm.toLowerCase())); return result.sort((a, b) => { switch(sortOption) { case 'price-asc': return a.price - b.price; case 'price-desc': return b.price - a.price; case 'name': return a.name.localeCompare(b.name); case 'popularity': default: return (b.sales || 0) - (a.sales || 0); } }); }, [products, selectedCategory, menuSearchTerm, sortOption]);
    const zones = [...new Set(tables.map(t => t.zone))].filter(z => z); 
    const categories = useMemo(() => ['Tümü', ...new Set(products.map(p => p.category))], [products]);
    const SortIcon = useMemo(() => { switch(sortOption) { case 'price-asc': return ArrowUpNarrowWide; case 'price-desc': return ArrowDownWideNarrow; case 'name': return ArrowDownAZ; default: return TrendingUp; } }, [sortOption]);

    // 🔥 HESAPLAMALAR
    const totalTables = tables.length || 50; 
    const occupiedTables = tables.filter(t => t.status === 'occupied').length || 0;
    const occupancyRate = totalTables > 0 ? (occupiedTables / totalTables) * 100 : 0;
    const occupancyConfig = getDetailedOccupancyConfig(occupancyRate, isDarkMode);

    // Radial Chart Data
    const chartData = [
        { name: 'Total', value: 100, fill: occupancyConfig.fillBg }, // Track background
        { name: 'Occupied', value: occupancyRate, fill: occupancyConfig.fill } // Value bar
    ];

    return (
        <div className={`flex flex-col md:flex-row h-[calc(100vh-100px)] overflow-hidden relative font-sans transition-colors duration-500 ${isDarkMode ? 'text-slate-200 bg-[#0F131C]' : 'text-slate-800 bg-slate-50'}`}>
            <Toaster position="bottom-center" reverseOrder={false} gutter={8} toastOptions={{ duration: 2000, style: { background: isDarkMode ? 'rgba(30, 35, 48, 0.9)' : 'rgba(255, 255, 255, 0.9)', color: isDarkMode ? '#fff' : '#1e293b', backdropFilter: 'blur(10px)', border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.3)', borderRadius: '16px', padding: '12px 24px', fontSize: '13px', fontWeight: '600' }, success: { iconTheme: { primary: '#10b981', secondary: 'white' } }, error: { iconTheme: { primary: '#ef4444', secondary: 'white' } } }} />
            <ConfirmationModal isOpen={isEmptyConfirmOpen} onClose={() => setIsEmptyConfirmOpen(false)} onConfirm={confirmMarkAsEmpty} title="Masayı Temizle" message="Bu masayı boş ve temiz olarak işaretlemek istediğinize emin misiniz? (Siparişler silinir)" type="warning" confirmText="TEMİZLE"/>
            <TableCloseModal isOpen={isCloseModalOpen} onClose={() => setIsCloseModalOpen(false)} onConfirm={confirmCloseTable} tableName={selectedTable?.name} amount={selectedTable?.total} method={paymentMethod} bank={cardBank} loading={processing}/>
            <ProductOptionsModal isOpen={!!productToCustomize} onClose={() => setProductToCustomize(null)} product={productToCustomize} onConfirm={handleConfirmOrder}/>

            {/* BİRLEŞTİRME ONAY PENCERESİ */}
            {pendingTransfer && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className={`w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden transform transition-all ${isDarkMode ? 'bg-[#1e2330] border border-white/10' : 'bg-white border border-slate-200'}`}>
                        <div className={`p-6 border-b text-center ${isDarkMode ? 'border-white/5 bg-[#141824]' : 'border-slate-100 bg-slate-50'}`}>
                            <h3 className={`text-xl font-black uppercase tracking-wider mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>MASA BİRLEŞTİRME</h3>
                            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Bu iki masayı birleştirmek istiyor musunuz?</p>
                        </div>
                        <div className="p-8 flex items-center justify-center gap-6 md:gap-10">
                            <div className="flex flex-col items-center gap-3">
                                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg border-2 ${isDarkMode ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'bg-rose-100 border-rose-400 text-rose-600'}`}><span className="font-black text-xl text-center leading-tight">{pendingTransfer.source.name}</span></div>
                                <span className={`text-xs font-bold uppercase tracking-wide ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>MEVCUT</span>
                            </div>
                            <div className={`flex flex-col items-center gap-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}><Merge size={32} /><span className="text-[9px] font-black uppercase tracking-widest">BİRLEŞTİR</span></div>
                            <div className="flex flex-col items-center gap-3">
                                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg border-2 ${isDarkMode ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-emerald-100 border-emerald-400 text-emerald-600'}`}><span className="font-black text-xl text-center leading-tight">{pendingTransfer.target.name}</span></div>
                                <span className={`text-xs font-bold uppercase tracking-wide ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>HEDEF</span>
                            </div>
                        </div>
                        <div className={`p-4 flex gap-3 ${isDarkMode ? 'bg-[#141824]' : 'bg-slate-50'}`}>
                            <button onClick={() => { setPendingTransfer(null); setActiveMode('default'); setTransferSource(null); }} className={`flex-1 py-3.5 rounded-xl font-bold transition-all ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}>İPTAL ET</button>
                            <button onClick={confirmTransferAction} disabled={processing} className="flex-1 py-3.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2">{processing ? <RefreshCw className="animate-spin" /> : <CheckCircle2 />}{processing ? 'İŞLENİYOR...' : 'ONAYLA'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* PREMIUM REZERVASYON MODAL */}
            {isRezModalOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className={`w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden transform transition-all scale-100 ${isDarkMode ? 'bg-[#1e2330] border border-white/10' : 'bg-white border border-slate-200'}`}>
                        <div className={`relative p-6 pb-0 flex flex-col items-center text-center z-10`}>
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30 ${isDarkMode ? 'bg-[#2e1a47] text-purple-400 ring-1 ring-purple-500/50' : 'bg-purple-100 text-purple-600'}`}><CalendarClock size={32} /></div>
                            <h3 className={`text-2xl font-black tracking-tight mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Rezervasyon</h3>
                            <p className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>{selectedTable?.name || 'Masa Seçilmedi'}</p>
                            <button onClick={() => { setIsRezModalOpen(false); setSelectedTable(null); }} className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${isDarkMode ? 'text-slate-500 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'}`}><X size={20}/></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className={`text-[10px] font-bold uppercase tracking-wider ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Müşteri Adı</label>
                                <div className={`relative group flex items-center rounded-xl border transition-all focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 ${isDarkMode ? 'bg-[#0B0F17] border-white/10' : 'bg-slate-50 border-slate-200'}`}><div className={`pl-4 ${isDarkMode ? 'text-slate-500 group-focus-within:text-purple-400' : 'text-slate-400 group-focus-within:text-purple-600'}`}><User size={18} /></div><input type="text" value={rezForm.name} onChange={e => setRezForm({...rezForm, name: e.target.value})} placeholder="Örn: Ahmet Yılmaz" className={`w-full bg-transparent py-3.5 px-3 outline-none text-sm font-medium ${isDarkMode ? 'text-white placeholder-slate-600' : 'text-slate-800 placeholder-slate-400'}`}/></div>
                            </div>
                            <div className="space-y-1.5">
                                <label className={`text-[10px] font-bold uppercase tracking-wider ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Rezervasyon Saati</label>
                                <div className={`relative group flex items-center rounded-xl border transition-all focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 ${isDarkMode ? 'bg-[#0B0F17] border-white/10' : 'bg-slate-50 border-slate-200'}`}><div className={`pl-4 ${isDarkMode ? 'text-slate-500 group-focus-within:text-purple-400' : 'text-slate-400 group-focus-within:text-purple-600'}`}><Clock size={18} /></div><input type="time" value={rezForm.time} onChange={e => setRezForm({...rezForm, time: e.target.value})} className={`w-full bg-transparent py-3.5 px-3 outline-none text-sm font-medium appearance-none ${isDarkMode ? 'text-white' : 'text-slate-800'}`}/></div>
                            </div>
                            <div className="space-y-1.5">
                                <label className={`text-[10px] font-bold uppercase tracking-wider ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Not (Opsiyonel)</label>
                                <div className={`relative group flex items-start rounded-xl border transition-all focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 ${isDarkMode ? 'bg-[#0B0F17] border-white/10' : 'bg-slate-50 border-slate-200'}`}><div className={`pl-4 pt-3.5 ${isDarkMode ? 'text-slate-500 group-focus-within:text-purple-400' : 'text-slate-400 group-focus-within:text-purple-600'}`}><FileText size={18} /></div><textarea rows="2" value={rezForm.note} onChange={e => setRezForm({...rezForm, note: e.target.value})} placeholder="Özel istekler..." className={`w-full bg-transparent py-3 px-3 outline-none text-sm font-medium resize-none ${isDarkMode ? 'text-white placeholder-slate-600' : 'text-slate-800 placeholder-slate-400'}`}/></div>
                            </div>
                        </div>
                        <div className={`p-6 pt-2 flex gap-3 ${isDarkMode ? 'bg-[#1e2330]' : 'bg-white'}`}>
                            <button onClick={() => { setIsRezModalOpen(false); setSelectedTable(null); }} className={`flex-1 py-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border ${isDarkMode ? 'bg-slate-800 text-slate-400 border-white/5 hover:bg-slate-700 hover:text-white' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-800'}`}>Vazgeç</button>
                            <button onClick={handleSaveReservation} disabled={processing} className={`flex-1 py-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-lg shadow-purple-500/30 transition-all flex items-center justify-center gap-2 active:scale-95 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500`}>{processing ? <RefreshCw className="animate-spin" size={16}/> : <CheckCircle2 size={16}/>}{processing ? 'Kaydediliyor...' : 'Kaydet'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- SOL PANEL: MASA HARİTASI --- */}
            <div className={`flex-1 overflow-y-auto p-4 md:p-6 transition-colors duration-300 ${selectedTable ? 'hidden lg:block' : 'block'} ${isDarkMode ? 'bg-[#0F131C]' : 'bg-slate-50'}`}>
                <div className="flex flex-col gap-4 mb-6"> 
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${isDarkMode ? 'bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/30' : 'bg-white text-indigo-600 shadow-indigo-100'}`}><LayoutGrid size={24} /></div>
                            <div><h2 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Masalar</h2><p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Anlık Salon Durumu</p></div>
                        </div>
                        <button onClick={toggleTheme} className={`p-3 rounded-xl border transition-all active:scale-95 ${isDarkMode ? 'bg-slate-800 border-white/5 text-yellow-400' : 'bg-white border-slate-200 text-slate-600'}`}>{isDarkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3">
                         <div className="flex gap-2">
                             <button onClick={() => { setActiveMode(activeMode === 'transfer' ? 'default' : 'transfer'); setTransferSource(null); }} className={`flex-1 md:flex-none p-3 rounded-xl border transition-all active:scale-95 flex justify-center items-center ${activeMode === 'transfer' ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30 animate-pulse' : (isDarkMode ? 'bg-slate-800 border-white/5 text-blue-400' : 'bg-white border-slate-200 text-blue-600')}`}><ArrowRightLeft size={20} /></button>
                             <button onClick={() => { setActiveMode(activeMode === 'clean' ? 'default' : 'clean'); setTransferSource(null); }} className={`flex-1 md:flex-none p-3 rounded-xl border transition-all active:scale-95 flex justify-center items-center ${activeMode === 'clean' ? 'bg-cyan-600 border-cyan-500 text-white shadow-lg shadow-cyan-500/30' : (isDarkMode ? 'bg-slate-800 border-white/5 text-cyan-400' : 'bg-white border-slate-200 text-cyan-600')}`}><Brush size={20} /></button>
                             <button onClick={() => { setActiveMode(activeMode === 'reserve' ? 'default' : 'reserve'); setTransferSource(null); }} className={`flex-1 md:flex-none p-3 rounded-xl border transition-all active:scale-95 flex justify-center items-center ${activeMode === 'reserve' ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/30' : (isDarkMode ? 'bg-slate-800 border-white/5 text-purple-400' : 'bg-white border-slate-200 text-purple-600')}`}><CalendarClock size={20} /></button>
                        </div>

                        {/* 🔥 YENİ PREMIUM RADIAL CHART (RENKLİ & GLOWLU) */}
                        <div className={`flex-1 px-4 py-2 rounded-2xl border flex items-center justify-between gap-2 shadow-sm transition-all duration-300 overflow-hidden relative group 
                            ${activeMode !== 'default' 
                                ? (isDarkMode ? 'bg-[#161b26] border-white/5' : 'bg-white border-slate-200') 
                                : `${occupancyConfig.cardBg} ${occupancyConfig.cardBorder}`
                            }
                        `}>
                            
                            {activeMode !== 'default' ? (
                                <div className="flex items-center gap-3 w-full animate-in fade-in slide-in-from-top-2 relative z-10">
                                    <div className={`p-1.5 rounded-full text-white ${activeMode === 'transfer' ? 'bg-blue-500' : activeMode === 'clean' ? 'bg-cyan-500' : 'bg-purple-500'}`}>{activeMode === 'transfer' && <ArrowRightLeft size={14}/>}{activeMode === 'clean' && <Brush size={14}/>}{activeMode === 'reserve' && <CalendarClock size={14}/>}</div>
                                    <div className="flex flex-col overflow-hidden"><span className={`text-[10px] font-black uppercase tracking-wider truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{activeMode === 'transfer' && (transferSource ? "HEDEF SEÇİN" : "MASA SEÇİN")}{activeMode === 'clean' && "TEMİZLİK"}{activeMode === 'reserve' && "REZERVASYON"}</span><span className={`text-[9px] font-bold truncate ${activeMode === 'transfer' ? 'text-blue-400' : activeMode === 'clean' ? 'text-cyan-400' : 'text-purple-400'}`}>{activeMode === 'transfer' && (transferSource ? `${transferSource.name} > ?` : "Taşınacak masa?")}{activeMode === 'clean' && "Temizlenecek masa?"}{activeMode === 'reserve' && "Hangi masa?"}</span></div>
                                    <button onClick={() => { setActiveMode('default'); setTransferSource(null); }} className="ml-auto p-1.5 rounded-full hover:bg-white/10 text-slate-400"><X size={16}/></button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between w-full h-full relative">
                                    {/* Arkaplan Efekti */}
                                    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${occupancyConfig.glow} blur-[40px] opacity-40 rounded-full pointer-events-none`}></div>

                                    {/* Sol: Durum Etiketi */}
                                    <div className="flex flex-col justify-center z-10">
                                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-widest mb-1 w-fit ${isDarkMode ? 'bg-[#1e293b]' : 'bg-white'} ${occupancyConfig.text} border-current opacity-90`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${occupancyConfig.text.replace('text-', 'bg-')} animate-pulse`}></div>
                                            {occupancyConfig.label}
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'} tracking-tighter`}>{occupiedTables}</span>
                                            <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>/ {totalTables} Masa</span>
                                        </div>
                                    </div>

                                    {/* Sağ: Radial Chart */}
                                    <div className="w-16 h-16 relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadialBarChart 
                                                cx="50%" cy="50%" 
                                                innerRadius="60%" outerRadius="100%" 
                                                barSize={6} 
                                                data={chartData} 
                                                startAngle={90} endAngle={-270}
                                            >
                                                <defs>
                                                    <linearGradient id="gradStep0" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#0ea5e9" /><stop offset="100%" stopColor="#22d3ee" /></linearGradient>
                                                    <linearGradient id="gradStep1" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#2dd4bf" /></linearGradient>
                                                    <linearGradient id="gradStep2" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#84cc16" /><stop offset="100%" stopColor="#22c55e" /></linearGradient>
                                                    <linearGradient id="gradStep3" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#eab308" /><stop offset="100%" stopColor="#f59e0b" /></linearGradient>
                                                    <linearGradient id="gradStep4" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#f97316" /><stop offset="100%" stopColor="#ea580c" /></linearGradient>
                                                    <linearGradient id="gradStep5" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#f43f5e" /><stop offset="100%" stopColor="#e11d48" /></linearGradient>
                                                </defs>
                                                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                                <RadialBar background={{ fill: occupancyConfig.fillBg }} clockWise dataKey="value" cornerRadius={10} />
                                            </RadialBarChart>
                                        </ResponsiveContainer>
                                        {/* Ortadaki Yüzde */}
                                        <div className={`absolute inset-0 flex items-center justify-center text-xs font-black ${occupancyConfig.text}`}>
                                            %{occupancyRate.toFixed(0)}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar pb-1">
                        <div className="flex gap-2">
                            <button onClick={() => setActiveZone('Tümü')} className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all whitespace-nowrap ${activeZone === 'Tümü' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50')}`}>Tümü</button>
                            {zones.map(zone => ( <button key={zone} onClick={() => setActiveZone(zone)} className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 whitespace-nowrap ${activeZone === zone ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50')}`}>{getZoneIcon(zone)} {zone}</button> ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                    {filteredTables.map(table => {
                        const isSource = transferSource?.id === table.id;
                        const theme = getTableTheme(table.status, isDarkMode, activeMode, isSource);
                        const totalElapsedTime = getElapsedString(table.startTime); 
                        const idleTime = getElapsedString(table.lastOrderTime);

                        return (
                            <button key={table.id} onClick={() => handleTableClickWrapper(table)} className={theme.card + ` h-28 md:h-32 rounded-2xl flex flex-col p-2 md:p-4 ${selectedTable?.id === table.id ? 'ring-2 ring-indigo-500 scale-[1.02]' : 'hover:scale-[1.01]'} ${activeMode === 'transfer' && table.status === 'empty' && !transferSource ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}>
                                <div className={`absolute inset-0 bg-gradient-to-br ${theme.glow} opacity-40`}></div>
                                {table.status === 'empty' && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="flex flex-col items-center justify-center group-hover:hidden transition-all duration-300"><Coffee size={32} className={`${theme.ghostIcon} mb-2`} /><span className={`text-[9px] font-bold uppercase tracking-[0.3em] ml-[0.3em] ${theme.ghostText}`}>BOŞ</span></div>
                                        <PlusCircle size={40} className="text-emerald-500 hidden group-hover:block drop-shadow-md animate-in zoom-in duration-200 absolute" />
                                    </div>
                                )}
                                {table.status === 'needs_cleaning' && (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none"><Sparkles size={40} className="text-cyan-500" /></div>
                                )}
                                <div className="flex justify-between items-start w-full relative z-10">
                                    <span className={`text-xs md:text-base font-black ${theme.textColor} tracking-tight`}>{table.name}</span>
                                    {table.status === 'empty' && <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse"></div>}
                                    {table.status === 'occupied' && <User size={16} className="text-rose-500"/>}
                                    {table.status === 'reserved' && <Lock size={16} className="text-purple-500"/>}
                                </div>
                                <div className="flex-1 flex items-center justify-center relative z-10 w-full">
                                    {table.status === 'occupied' && (
                                        <div className={`backdrop-blur-md px-1.5 py-1 rounded-lg border flex items-center gap-2 shadow-sm min-w-0 max-w-full ${isDarkMode ? 'bg-[#0B0F17]/90 border-white/10' : 'bg-white/80 border-slate-200'}`}>
                                            {totalElapsedTime && (<div className="flex flex-col items-center leading-none min-w-[20px]"><span className="text-[6px] text-slate-400 uppercase font-bold mb-0.5 tracking-tight">Süre</span><span className="text-[9px] md:text-[10px] font-bold text-rose-500 tabular-nums">{totalElapsedTime}</span></div>)}
                                            <div className={`w-px h-4 ${isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`}></div>
                                            <div className="flex flex-col items-center leading-none min-w-[20px]"><span className="text-[6px] text-slate-400 uppercase font-bold mb-0.5 tracking-tight">Son Sip.</span><span className="text-[9px] md:text-[10px] font-bold text-amber-500 tabular-nums">{idleTime || '-'}</span></div>
                                        </div>
                                    )}
                                    {table.status === 'reserved' && (<div className="flex flex-col items-center justify-center w-full"><div className="flex items-center gap-1.5 mb-1"><Clock size={12} className="text-purple-500" /><span className={`text-sm font-black tracking-wider tabular-nums ${isDarkMode ? 'text-purple-200' : 'text-purple-700'}`}>{table.reservation?.time}</span></div><div className={`text-[9px] font-bold truncate max-w-full opacity-80 ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>{table.reservation?.customerName}</div></div>)}
                                </div>
                                <div className="relative z-10 w-full flex justify-between items-end mt-auto">
                                    {(table.status === 'reserved' || table.status === 'needs_cleaning') && (<div className="w-full flex justify-center">{table.status === 'reserved' && <span className={`text-[9px] font-bold uppercase tracking-[0.25em] px-3 py-1 rounded border ${isDarkMode ? 'text-purple-300 bg-purple-500/20 border-purple-500/30' : 'text-purple-600 bg-purple-50 border-purple-100'}`}>REZERVE</span>}{table.status === 'needs_cleaning' && <span className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 px-2 py-1 rounded border animate-pulse ${isDarkMode ? 'text-cyan-300 bg-cyan-500/20 border-cyan-500/30' : 'text-cyan-600 bg-cyan-50 border-cyan-100'}`}><RefreshCw size={8} className="animate-spin"/> TEMİZLE</span>}</div>)}
                                    {table.status === 'occupied' && table.total > 0 && (<div className="w-full text-right leading-none"><span className={`text-sm md:text-xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{formatCurrency(table.total)}</span><span className="text-[9px] text-slate-400 ml-0.5 font-bold">₺</span></div>)}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {selectedTable && (
                <div className={`w-full lg:w-[600px] shrink-0 border-l flex flex-col absolute lg:static inset-0 z-20 shadow-2xl transition-all ${isDarkMode ? 'bg-[#0B0F17] border-white/5' : 'bg-white border-slate-200'}`}>
                    <div className={`p-4 border-b shrink-0 backdrop-blur-md ${isDarkMode ? 'bg-[#141824]/95 border-white/5' : 'bg-white/95 border-slate-100'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div><h3 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{selectedTable.name}</h3>{selectedTable.status === 'reserved' && <span className="text-xs text-purple-500 font-bold flex items-center gap-1"><CalendarClock size={12}/> {selectedTable.reservation?.customerName}</span>}</div>
                            <div className="flex items-center gap-2"><button onClick={() => setSelectedTable(null)} className={`p-2 rounded-lg border transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white border-white/5' : 'bg-slate-100 text-slate-500 hover:text-slate-800 border-slate-200'}`}><X size={20}/></button></div>
                        </div>
                        <div className={`p-1 rounded-xl flex border ${isDarkMode ? 'bg-slate-900/50 border-white/5' : 'bg-slate-100 border-slate-200'}`}><button onClick={() => setRightPanelMode('menu')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${rightPanelMode === 'menu' ? (isDarkMode ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-indigo-600 shadow-md') : 'text-slate-400 hover:text-slate-600'}`}><Utensils size={16}/> MENÜ</button><button onClick={() => setRightPanelMode('bill')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${rightPanelMode === 'bill' ? (isDarkMode ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-emerald-600 shadow-md') : 'text-slate-400 hover:text-slate-600'}`}><ReceiptIcon size={16}/> ADİSYON</button></div>
                    </div>
                    {rightPanelMode === 'menu' && (
                        <div className="flex-1 flex overflow-hidden">
                            <div className={`w-24 border-r flex flex-col gap-2 p-2 overflow-y-auto custom-scrollbar shrink-0 pb-20 ${isDarkMode ? 'bg-[#11151f]/50 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                                {categories.map(cat => { const theme = getCategoryTheme(cat, isDarkMode); const isSelected = selectedCategory === cat; return ( <button key={cat} onClick={() => setSelectedCategory(cat)} className={`relative w-full text-center py-4 rounded-xl text-[10px] font-bold transition-all duration-300 group overflow-hidden border ${isSelected ? `${theme.bg} ${theme.border} ${isDarkMode ? 'text-white' : 'text-slate-800'} shadow-lg` : 'bg-transparent border-transparent text-slate-500 hover:text-slate-600'}`}>{isSelected && <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full shadow-sm ${theme.indicator.replace('text-', 'bg-')}`}></div>}<span className={`relative z-10 block truncate leading-tight ${isSelected ? theme.text : ''}`}>{cat}</span></button> ); })}
                            </div>
                            <div className={`flex-1 flex flex-col overflow-hidden ${isDarkMode ? 'bg-[#0F131C] bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)]' : 'bg-slate-50'} bg-[size:2rem_2rem]`}>
                                <div className={`p-4 border-b flex gap-3 shrink-0 ${isDarkMode ? 'border-white/5' : 'border-slate-200 bg-white'}`}><div className="relative group flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors"/><input type="text" placeholder="Ürün ara..." value={menuSearchTerm} onChange={(e) => setMenuSearchTerm(e.target.value)} className={`block w-full pl-10 pr-3 py-3 border rounded-xl text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all ${isDarkMode ? 'bg-slate-900 border-white/5 text-white focus:bg-slate-800' : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white'}`}/></div><div className="relative"><button onClick={() => setIsSortMenuOpen(!isSortMenuOpen)} className={`w-12 h-full rounded-xl border flex items-center justify-center transition-colors ${isDarkMode ? 'bg-slate-800/50 border-white/5 text-slate-400 hover:text-white hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-white'}`}><SortIcon size={18} /></button>{isSortMenuOpen && (<><div className="fixed inset-0 z-40" onClick={() => setIsSortMenuOpen(false)}></div><div className={`absolute right-0 top-12 w-48 rounded-xl border shadow-2xl p-1 z-50 flex flex-col gap-1 animate-in fade-in zoom-in-95 ${isDarkMode ? 'bg-[#1e2330] border-white/10' : 'bg-white border-slate-200'}`}><button onClick={() => { setSortOption('popularity'); setIsSortMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold ${isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'}`}><TrendingUp size={14}/> En Çok Satan</button><button onClick={() => { setSortOption('price-asc'); setIsSortMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold ${isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'}`}><ArrowUpNarrowWide size={14}/> Fiyat Artan</button><button onClick={() => { setSortOption('price-desc'); setIsSortMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold ${isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'}`}><ArrowDownWideNarrow size={14}/> Fiyat Azalan</button><button onClick={() => { setSortOption('name'); setIsSortMenuOpen(false); }} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold ${isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'}`}><ArrowDownAZ size={14}/> İsim (A-Z)</button></div></>)}</div></div>
                                <div className="flex-1 overflow-y-auto p-3 custom-scrollbar"><div className="grid grid-cols-3 gap-2"> {processedProducts.map(product => { const theme = getCategoryTheme(product.category, isDarkMode); return ( <button key={product.id} onClick={() => handleProductClick(product)} className={`group relative h-24 p-2 rounded-xl border ${theme.bg} ${theme.border} ${theme.hoverBg} ${theme.hoverBorder} hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden hover:-translate-y-1`}>{product.stock !== undefined && product.stock <= 5 && <span className="absolute top-1 left-1 bg-red-600/90 text-white text-[7px] font-bold px-1 py-0.5 rounded-md z-20 shadow-sm animate-pulse flex items-center gap-1"><AlertCircle size={6} /> Son {product.stock}</span>}{product.options && product.options.length > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse shadow-sm z-20"></span>}<div className="relative z-10 w-full text-left mt-2"><span className={`text-[7px] font-bold uppercase tracking-widest block truncate opacity-70 ${theme.text}`}>{product.category}</span><h3 className={`text-[10px] md:text-xs font-bold leading-tight transition-colors line-clamp-2 pr-1 mt-0.5 ${isDarkMode ? 'text-slate-200 group-hover:text-white' : 'text-slate-800 group-hover:text-indigo-600'}`}>{product.name}</h3></div><div className="relative z-10 flex items-end justify-between w-full mt-auto"><div className="flex items-baseline gap-0.5"><span className={`font-bold text-xs tracking-tight ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{formatCurrency(product.price)}</span><span className={`text-[8px] font-bold ${isDarkMode ? 'text-emerald-500/70' : 'text-emerald-500'}`}>₺</span></div><div className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-300 shadow-sm ${isDarkMode ? 'bg-slate-800 border-white/10 text-slate-400 group-hover:bg-emerald-600 group-hover:border-emerald-500 group-hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-400 group-hover:bg-emerald-500 group-hover:text-white'}`}><Plus size={10} strokeWidth={3}/></div></div></button> ); })}</div></div>
                                <div className={`p-4 border-t z-20 ${isDarkMode ? 'border-white/5 bg-[#141824]' : 'border-slate-200 bg-white'}`}><button onClick={() => setRightPanelMode('bill')} className={`w-full border p-2 rounded-2xl shadow-xl flex items-center justify-between group active:scale-[0.98] transition-all duration-300 relative overflow-hidden ${isDarkMode ? 'bg-[#141824] border-white/10' : 'bg-white border-slate-200 hover:border-indigo-200'}`}><div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"/><div className="flex items-center gap-3 relative z-10"><div className={`w-12 h-12 rounded-xl flex items-center justify-center relative shadow-inner border group-hover:bg-slate-700 transition-colors ${isDarkMode ? 'bg-slate-800 border-white/5' : 'bg-slate-100 border-slate-200 group-hover:bg-white'}`}><ShoppingCart size={20} className="text-slate-500" />{selectedTable.orders.reduce((a,b)=>a+b.quantity,0) > 0 && <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 border-[3px] border-[#141824] flex items-center justify-center"><span className="text-[9px] font-bold text-white">{selectedTable.orders.reduce((a,b)=>a+b.quantity,0)}</span></div>}</div><div className="flex flex-col items-start"><span className={`text-xs font-bold tracking-wide ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Siparişi Tamamla</span><span className="text-[10px] text-slate-400 group-hover:text-indigo-400 transition-colors">Ödemeye Geç</span></div></div><div className="bg-indigo-600 px-4 py-3 rounded-xl shadow-lg shadow-indigo-900/40 flex items-center gap-1 group-hover:bg-indigo-500 transition-colors relative z-10"><span className="font-black text-sm text-white tracking-tight">{formatCurrency(selectedTable.total)}</span><span className="text-[10px] font-bold text-indigo-200">₺</span><ChevronLeft size={14} className="text-indigo-200 ml-1 rotate-180 opacity-60"/></div></button></div>
                            </div>
                        </div>
                    )}
                    {rightPanelMode === 'bill' && (
                        <div className={`flex-1 flex flex-col overflow-hidden ${isDarkMode ? '' : 'bg-slate-50'}`}>
                            <div className={`flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar ${isDarkMode ? 'bg-[#0B0F17]' : 'bg-slate-50'}`}>
                                {selectedTable.orders.length > 0 ? ( selectedTable.orders.map(order => ( <div key={order.id} className={`flex justify-between items-center p-3 rounded-xl border group transition-colors shadow-sm ${isDarkMode ? 'bg-[#1e2330] border-white/5 hover:border-white/10' : 'bg-white border-slate-200 hover:border-indigo-200'}`}><div className="flex-1 min-w-0 pr-2"><span className={`text-sm font-bold block truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{order.name}</span><span className="text-[10px] text-slate-500 font-bold tracking-wider">x{order.quantity} Adet</span></div><div className="flex items-center gap-3 shrink-0"><span className="font-bold text-sm text-emerald-500">{formatCurrency(order.price * order.quantity)} ₺</span><button onClick={() => handleRemoveOrder(selectedTable.id, order.id, order.price)} className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'text-slate-600 hover:text-rose-500 hover:bg-rose-500/10' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'}`}><Trash2 size={16}/></button></div></div> )) ) : <div className="h-full flex flex-col items-center justify-center text-slate-400"><Coffee size={48} className="opacity-20 mb-4"/><p className="text-sm font-bold">Henüz sipariş yok.</p></div>}
                            </div>
                            <div className={`p-5 border-t ${isDarkMode ? 'bg-[#141824] border-white/5' : 'bg-white border-slate-200'}`}>
                                <div className="flex justify-between items-end mb-5"><span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Toplam Tutar</span><span className={`text-4xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{formatCurrency(selectedTable.total)} <span className="text-lg text-slate-500 font-normal">₺</span></span></div>
                                {userRole !== 'garson' ? ( <><div className="grid grid-cols-2 gap-3 mb-4"><button onClick={() => setPaymentMethod('cash')} className={`py-4 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 border-2 ${paymentMethod === 'cash' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-500/20' : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100')}`}><Wallet size={24} className={paymentMethod === 'cash' ? 'text-white' : 'opacity-50'}/><span className="text-xs font-black tracking-wide">NAKİT</span></button><button onClick={() => setPaymentMethod('card')} className={`py-4 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 border-2 ${paymentMethod === 'card' ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/20' : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100')}`}><CardIcon size={24} className={paymentMethod === 'card' ? 'text-white' : 'opacity-50'}/><span className="text-xs font-black tracking-wide">KART</span></button></div>{paymentMethod === 'card' && (<div className="grid grid-cols-3 gap-2 mb-4 animate-in fade-in slide-in-from-top-2">{bankOptions.map(opt => ( <button key={opt.key} onClick={() => setCardBank(opt.key)} className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 transition-all ${cardBank === opt.key ? `bg-gradient-to-r ${opt.gradient} border-white/20 text-white shadow-md` : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100')}`}>{opt.label}</button> ))}</div>)}<div className="flex gap-3"><button onClick={handlePrintBill} disabled={selectedTable.total <= 0} className={`w-16 h-16 border-2 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'}`}><Printer size={28}/></button><button onClick={() => setIsCloseModalOpen(true)} disabled={selectedTable.total <= 0 || processing} className={`flex-1 h-16 rounded-2xl font-black text-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg text-white ${paymentMethod === 'cash' ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-emerald-500/20' : 'bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-indigo-500/20'}`}>{processing ? 'İşleniyor...' : 'HESABI KAPAT'} <CheckCircle2 size={24}/></button></div></> ) : ( <div className={`p-3 border rounded-xl text-center ${isDarkMode ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-50 border-rose-200'}`}><p className="text-xs text-rose-500 font-bold mb-2">Ödeme yetkiniz yok.</p><button onClick={handlePrintBill} disabled={selectedTable.total <= 0} className={`w-full py-3 rounded-xl font-bold transition-all border flex items-center justify-center gap-2 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'}`}><Printer size={18}/> ADİSYON YAZDIR</button></div> )}
                            </div>
                            <Receipt data={printData} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Tables;