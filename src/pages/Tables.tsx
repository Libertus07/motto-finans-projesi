import React, { useState, useEffect, useMemo } from 'react';
import { addDoc, doc, updateDoc, collection, writeBatch, increment } from 'firebase/firestore';
import { db, appId, auth } from '../services/firebase';

// @ts-ignore
import Receipt from '../components/Receipt';
// @ts-ignore
import ConfirmationModal from '../components/ConfirmationModal';
// @ts-ignore
import TableCloseModal from '../components/TableCloseModal';
// @ts-ignore
import ProductOptionsModal from '../components/ProductOptionsModal';
import { Toaster, toast } from 'react-hot-toast';
import { useTheme } from '../hooks/pos/useTheme';

import { SHOP_ID as CURRENT_SHOP_ID } from '../utils/constants';

import TableMapHeader from '../components/tables/TableMapHeader';
import TableCard from '../components/tables/TableCard';
import TransferModal from '../components/tables/TransferModal';
import ReservationModal from '../components/tables/ReservationModal';
import TableDetailPanel from '../components/tables/TableDetailPanel';

import { Table, Product, Staff } from '../types';

import { useOutletContext } from 'react-router-dom';
import { DashboardContextType } from '../types';
import { usePermissions } from '../hooks/usePermissions';
import { PERMISSIONS } from '../utils/roles';
import { bankOptions } from '../utils/pos/themes';

const Tables: React.FC = () => {
    const { tables, products, userRole, currentStaff, staff: staffList } = useOutletContext<DashboardContextType>();
    const [isDarkMode, toggleTheme] = useTheme() as [boolean, () => void];

    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
    const [rightPanelMode, setRightPanelMode] = useState<'menu' | 'bill'>('menu');

    // 🔥 ACTIVE MODE STATE
    const [activeMode, setActiveMode] = useState<'default' | 'transfer' | 'clean' | 'reserve'>('default');
    const [transferSource, setTransferSource] = useState<Table | null>(null);
    const [pendingTransfer, setPendingTransfer] = useState<{ source: Table; target: Table; type?: string } | null>(null);

    const [selectedCategory, setSelectedCategory] = useState('Tümü');
    const [activeZone, setActiveZone] = useState('Tümü');
    const [processing, setProcessing] = useState(false);
    const [printData, setPrintData] = useState<any>(null);

    const [menuSearchTerm, setMenuSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('popularity');
    const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

    // 🔥 GRID LAYOUT STATE
    const [gridLayout, setGridLayout] = useState<'normal' | 'compact' | 'comfort'>(() => {
        const saved = localStorage.getItem('table_grid_layout');
        return (saved as any) || 'normal';
    });

    useEffect(() => {
        localStorage.setItem('table_grid_layout', gridLayout);
    }, [gridLayout]);

    const [isEmptyConfirmOpen, setIsEmptyConfirmOpen] = useState(false);
    const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
    // ... rest of state ...
    const [isRezModalOpen, setIsRezModalOpen] = useState(false);
    const [isRezCheckInOpen, setIsRezCheckInOpen] = useState(false);
    const [rezForm, setRezForm] = useState({ name: '', time: '', note: '', isVIP: false });
    const [pendingRezTable, setPendingRezTable] = useState<Table | null>(null);

    const [productToCustomize, setProductToCustomize] = useState<Product | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
    const [cardBank, setCardBank] = useState('ziraat');

    const handleTableClickWrapper = (table: Table) => {
        if (activeMode === 'transfer') {
            handleTransferSelection(table);
        } else if (activeMode === 'clean') {
            handleQuickClean(table);
        } else if (activeMode === 'reserve') {
            handleQuickReserve(table);
        } else {
            if (table.status === 'needs_cleaning') {
                return toast.error("Bu masa temizlenmeden işlem yapılamaz! Önce temizlik modunu açınız.", {
                    icon: '🧹',
                    duration: 3000
                });
            }
            if (table.status === 'reserved') {
                setPendingRezTable(table);
                setIsRezCheckInOpen(true);
                return;
            }
            setSelectedTable(table);
        }
    };

    const confirmRezCheckIn = async () => {
        if (!pendingRezTable) return;
        setProcessing(true);
        try {
            const tableRef = doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'tables', pendingRezTable.id);
            await updateDoc(tableRef, {
                status: 'occupied',
                startTime: new Date().toISOString(),
                lastOrderTime: new Date().toISOString(),
                staffId: currentStaff?.id || 'unknown',
                isVIP: pendingRezTable.reservation?.isVIP || false
            });
            setSelectedTable(pendingRezTable);
            setIsRezCheckInOpen(false);
            setPendingRezTable(null);
            toast.success("Rezervasyon girişi yapıldı", { icon: '✅' });
        } catch (error) {
            toast.error("Hata oluştu");
        } finally {
            setProcessing(false);
        }
    };

    const handleQuickClean = async (table: Table) => {
        if (table.status !== 'needs_cleaning') {
            return toast.error("Bu masa kirlenmemiş!", { icon: '✨' });
        }
        try {
            await updateDoc(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'tables', table.id), {
                status: 'empty',
                orders: [],
                total: 0,
                startTime: null,
                lastOrderTime: null,
                staffId: null
            });
            toast.success(`${table.name} Temizlendi`, { icon: '🧹' });
        } catch (error) { toast.error("Hata oluştu"); }
    };

    const handleQuickReserve = (table: Table) => {
        if (table.status !== 'empty') {
            return toast.error("Sadece boş masalar rezerve edilebilir.");
        }
        setSelectedTable(table);
        setIsRezModalOpen(true);
    };

    const handleTransferSelection = async (targetTable: Table) => {
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

    const executeTransfer = async (source: Table, target: Table, isMerge: boolean) => {
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
            batch.update(sourceRef, {
                orders: [],
                total: 0,
                status: 'empty',
                startTime: null,
                lastOrderTime: null,
                staffId: null
            });
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

    useEffect(() => { if (selectedTable) { setRightPanelMode('menu'); setMenuSearchTerm(''); } }, [selectedTable?.id]);
    useEffect(() => { if (!selectedTable || !tables || tables.length === 0) return; const latestTable = tables.find(t => t.id === selectedTable.id); if (latestTable && (JSON.stringify(latestTable) !== JSON.stringify(selectedTable))) { setSelectedTable(latestTable); } }, [tables, selectedTable]);

    // 🔥 Manual Request Completion Handler
    const handleCompleteRequest = async (tableId: string, requestId: string) => {
        try {
            const table = tables.find(t => t.id === tableId);
            if (!table || !table.requests) return;

            const updatedRequests = table.requests.map(r =>
                r.id === requestId ? { ...r, status: 'completed' } : r
            );

            const tableRef = doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'tables', tableId);
            await updateDoc(tableRef, { requests: updatedRequests });

            toast.success("Bildirim tamamlandı", { icon: '✅' });
        } catch (error) {
            console.error("Bildirim güncellenemedi:", error);
            toast.error("İşlem başarısız");
        }
    };

    const handleSaveReservation = async () => {
        if (!rezForm.name || !rezForm.time) return toast.error("İsim ve saat giriniz.");
        if (!selectedTable) return;
        setProcessing(true);
        try {
            const tableRef = doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'tables', selectedTable.id);
            await updateDoc(tableRef, {
                status: 'reserved',
                reservation: { customerName: rezForm.name, time: rezForm.time, note: rezForm.note || '', isVIP: rezForm.isVIP },
                staffId: currentStaff?.id || 'unknown'
            });
            setIsRezModalOpen(false); setRezForm({ name: '', time: '', note: '', isVIP: false }); setSelectedTable(null); toast.success("Rezervasyon kaydedildi");
        } catch (error) { console.error(error); toast.error("Hata oluştu"); } finally { setProcessing(false); }
    };

    const handleProductClick = (product: Product) => { if (product.options && product.options.length > 0) { setProductToCustomize(product); } else { handleConfirmOrder({ ...product, quantity: 1 }); } };

    const handleConfirmOrder = async (customizedProduct: Product & { quantity?: number; note?: string }) => {
        const user = auth.currentUser;
        if (!user || processing || !selectedTable) return;
        setProductToCustomize(null);
        setProcessing(true);
        const tableRef = doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'tables', selectedTable.id);
        try {
            const currentTable = tables.find(t => t.id === selectedTable.id);
            if (!currentTable) return;
            const qty = customizedProduct.quantity || 1;
            const unitPrice = customizedProduct.price;
            let newOrders = [...currentTable.orders];
            let found = false;
            newOrders = newOrders.map(order => {
                if (order.name === customizedProduct.name && order.price === unitPrice && order.note === customizedProduct.note) {
                    found = true;
                    return { ...order, quantity: order.quantity + qty };
                }
                return order;
            });
            if (!found) {
                newOrders.push({
                    id: customizedProduct.id + '-' + Date.now(),
                    productId: customizedProduct.id,
                    name: customizedProduct.name,
                    price: unitPrice,
                    quantity: qty,
                    note: customizedProduct.note || ''
                });
            }
            const newTotal = currentTable.total + (unitPrice * qty);
            const updateData: any = { orders: newOrders, total: newTotal, status: currentTable.status === 'empty' ? 'occupied' : currentTable.status, lastOrderTime: new Date().toISOString() };
            if (currentTable.status === 'empty') {
                updateData.startTime = new Date().toISOString();
                updateData.staffId = currentStaff?.id || 'unknown';
            }
            await updateDoc(tableRef, updateData);
            toast.success("Ürün eklendi");
        } catch (error) { console.error(error); toast.error("Eklenemedi"); } finally { setProcessing(false); }
    };

    const { hasPermission } = usePermissions();

    const handleRemoveOrder = async (tableId: string, orderId: string, price: number, removeAll: boolean = false) => {
        if (!hasPermission(PERMISSIONS.ORDER_DELETE)) {
            return toast.error("Ürün silme yetkiniz yok!", { icon: '🔒' });
        }
        if (processing) return; setProcessing(true); const tableRef = doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'tables', tableId); try { const currentTable = tables.find(t => t.id === tableId); if (!currentTable) return; const existingOrderIndex = currentTable.orders.findIndex(o => o.id === orderId); if (existingOrderIndex === -1) return; const newOrders = [...currentTable.orders]; const newTotal = currentTable.total - price; if (newOrders[existingOrderIndex].quantity > 1 && !removeAll) { newOrders[existingOrderIndex].quantity -= 1; } else { newOrders.splice(existingOrderIndex, 1); } const newStatus = newOrders.length === 0 ? 'empty' : currentTable.status; const updateData: any = { orders: newOrders, total: newTotal, status: newStatus }; if (newStatus === 'empty') { updateData.startTime = null; updateData.lastOrderTime = null; } await updateDoc(tableRef, updateData); } catch (error) { console.error(error); toast.error("Silinemedi"); } finally { setProcessing(false); }
    };

    const confirmMarkAsEmpty = async () => {
        if (!hasPermission(PERMISSIONS.TABLE_MANAGE)) {
            return toast.error("Masa sıfırlama yetkiniz yok!", { icon: '🔒' });
        }
        if (!selectedTable) return; await updateDoc(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'tables', selectedTable.id), { status: 'empty', orders: [], total: 0, startTime: null, lastOrderTime: null }); setSelectedTable(prev => prev ? ({ ...prev, status: 'empty', orders: [], total: 0 }) : null); setIsEmptyConfirmOpen(false); toast.success("Masa temizlendi");
    };

    const confirmCloseTable = async () => {
        if (!selectedTable) return;
        handleDeferCloseTable({
            total: selectedTable.total,
            discount: 0,
            method: paymentMethod,
            bank: cardBank
        });
    };

    const handleDeferCloseTable = async (data: { total: number; discount: number; method: string; bank: string }) => {
        if (!selectedTable) return;
        setProcessing(true);
        try {
            const transMethod = data.method;
            const transCardBank = data.method === 'card' ? data.bank : null;
            const subMethodDisplay = data.method === 'cash' ? 'Nakit' : `Kart (${data.bank.toUpperCase()})`;

            await addDoc(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'transactions'), {
                date: new Date().toISOString().split('T')[0],
                type: 'income',
                amount: data.total, // İndirimli Tutar
                discount: data.discount, // İndirim Tutarı
                desc: `${selectedTable.name} (${selectedTable.zone}) Satışı`,
                method: transMethod,
                cardBank: transCardBank,
                category: 'Masa Satışı',
                subMethod: subMethodDisplay
            });

            const productUpdates = selectedTable.orders.map(async (order) => {
                const productRef = doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'products', order.productId);
                await updateDoc(productRef, {
                    salesCount: increment(order.quantity)
                });
            });
            await Promise.all(productUpdates);

            try {
                const { StockService } = await import('../services/stock.service');
                await StockService.processOrderStockDeduction(selectedTable.orders);
            } catch (stockError) {
                console.error("Stok düşümü hatası:", stockError);
            }

            await updateDoc(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'tables', selectedTable.id), {
                orders: [],
                total: 0,
                paid: 0, // Reset paid amount
                status: 'needs_cleaning',
                startTime: null,
                lastOrderTime: null
            });

            setIsCloseModalOpen(false);
            setSelectedTable(null);
            toast.success(`Hesap Kapatıldı (${data.total.toFixed(2)} ₺)`, { icon: '✅' });
        } catch (error) {
            console.error(error);
            toast.error("Hata oluştu");
        } finally {
            setProcessing(false);
        }
    };

    const handlePartialPayment = async (amount: number, method: string, bank: string) => {
        if (!selectedTable) return;
        setProcessing(true);
        try {
            const transMethod = method;
            const transCardBank = method === 'card' ? bank : null;
            const subMethodDisplay = method === 'cash' ? 'Nakit' : `Kart (${bank.toUpperCase()})`;

            // 1. Transaction Log
            await addDoc(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'transactions'), {
                date: new Date().toISOString().split('T')[0],
                type: 'income',
                amount: amount,
                desc: `${selectedTable.name} Parçalı Ödeme`,
                method: transMethod,
                cardBank: transCardBank,
                category: 'Masa Satışı',
                subMethod: subMethodDisplay
            });

            // 2. Update Table "paid" field
            const newPaid = (selectedTable.paid || 0) + amount;
            const tableRef = doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'tables', selectedTable.id);
            await updateDoc(tableRef, {
                paid: newPaid
            });

            // 3. Update Local State
            setSelectedTable(prev => prev ? ({ ...prev, paid: newPaid }) : null);

            toast.success(`Parçalı Tahsilat: ${amount} ₺`, { icon: '💸' });
        } catch (error) {
            console.error(error);
            toast.error("İşlem Başarısız");
        } finally {
            setProcessing(false);
        }
    };

    const handlePrintBill = () => { if (!selectedTable || selectedTable.orders.length === 0) return; setPrintData({ title: selectedTable.name, type: 'Masa Hesabı', items: selectedTable.orders.map(o => ({ name: o.name, quantity: o.quantity, price: o.price, note: o.note })), total: selectedTable.total, date: new Date().toLocaleString('tr-TR') }); setTimeout(() => window.print(), 100); };

    const filteredTables = useMemo(() => tables.filter(t => {
        if (activeZone !== 'Tümü' && t.zone !== activeZone) return false;
        return true;
    }), [tables, activeZone]);

    const processedProducts = useMemo(() => { const result = products.filter(p => (selectedCategory === 'Tümü' || p.category === selectedCategory) && p.name.toLowerCase().includes(menuSearchTerm.toLowerCase())); return result.sort((a, b) => { switch (sortOption) { case 'price-asc': return a.price - b.price; case 'price-desc': return b.price - a.price; case 'name': return a.name.localeCompare(b.name); case 'popularity': default: return (b.sold || 0) - (a.sold || 0); } }); }, [products, selectedCategory, menuSearchTerm, sortOption]);
    const zones = useMemo(() => [...new Set(tables.map(t => t.zone))].filter(z => z), [tables]);
    const categories = useMemo(() => ['Tümü', ...new Set(products.map(p => p.category))], [products]);

    const totalTables = tables.length || 50;
    const occupiedTables = tables.filter(t => t.status === 'occupied').length || 0;

    return (
        <div className={`flex flex-col md:flex-row h-[calc(100vh-100px)] overflow-hidden relative font-sans transition-colors duration-500 ${isDarkMode ? 'text-slate-200 bg-[#0F131C]' : 'text-slate-800 bg-slate-100'}`}>
            <Toaster position="bottom-center" reverseOrder={false} gutter={8} toastOptions={{ duration: 2000, style: { background: isDarkMode ? 'rgba(30, 35, 48, 0.9)' : 'rgba(255, 255, 255, 0.9)', color: isDarkMode ? '#fff' : '#1e293b', backdropFilter: 'blur(10px)', border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.3)', borderRadius: '16px', padding: '12px 24px', fontSize: '13px', fontWeight: '600' }, success: { iconTheme: { primary: '#10b981', secondary: 'white' } }, error: { iconTheme: { primary: '#ef4444', secondary: 'white' } } }} />
            <ConfirmationModal isOpen={isEmptyConfirmOpen} onClose={() => setIsEmptyConfirmOpen(false)} onConfirm={confirmMarkAsEmpty} title="Masayı Temizle" message="Bu masayı boş ve temiz olarak işaretlemek istediğinize emin misiniz? (Siparişler silinir)" type="warning" confirmText="TEMİZLE" loading={false} />
            <ConfirmationModal
                isOpen={isRezCheckInOpen}
                onClose={() => { setIsRezCheckInOpen(false); setPendingRezTable(null); }}
                onConfirm={confirmRezCheckIn}
                title="Rezervasyon Girişi"
                message={`Bu masa ${pendingRezTable?.reservation?.customerName || 'Müşteri'} adına ${pendingRezTable?.reservation?.time || ''} için rezerve edilmiştir. Misafir girişi yapılsın mı?`}
                type="info"
                confirmText="GİRİŞ YAP"
                loading={processing}
            />
            <TableCloseModal isOpen={isCloseModalOpen} onClose={() => setIsCloseModalOpen(false)} onConfirm={confirmCloseTable} tableName={selectedTable?.name || ''} amount={selectedTable?.total || 0} method={paymentMethod} bank={cardBank} loading={processing} />
            <ProductOptionsModal isOpen={!!productToCustomize} onClose={() => setProductToCustomize(null)} product={productToCustomize} onConfirm={handleConfirmOrder} />

            <TransferModal
                pendingTransfer={pendingTransfer}
                setPendingTransfer={setPendingTransfer}
                setActiveMode={setActiveMode}
                setTransferSource={setTransferSource}
                confirmTransferAction={confirmTransferAction}
                processing={processing}
                isDarkMode={isDarkMode}
            />

            <ReservationModal
                isRezModalOpen={isRezModalOpen}
                setIsRezModalOpen={setIsRezModalOpen}
                selectedTable={selectedTable}
                setSelectedTable={setSelectedTable}
                rezForm={rezForm}
                setRezForm={setRezForm}
                handleSaveReservation={handleSaveReservation}
                processing={processing}
                isDarkMode={isDarkMode}
            />

            {!selectedTable ? (
                <div className={`flex-1 overflow-y-auto p-4 md:p-6 transition-all duration-500 ${isDarkMode ? 'bg-[#0F131C]' : 'bg-slate-100'}`}>
                    <TableMapHeader
                        isDarkMode={isDarkMode}
                        toggleTheme={toggleTheme}
                        activeMode={activeMode}
                        setActiveMode={setActiveMode}
                        setTransferSource={setTransferSource}
                        transferSource={transferSource}
                        occupiedTables={occupiedTables}
                        totalTables={totalTables}
                        activeZone={activeZone}
                        setActiveZone={setActiveZone}
                        zones={zones}
                        tables={tables}
                        gridLayout={gridLayout}
                        setGridLayout={setGridLayout}
                    />

                    <div className="max-w-[1600px] mx-auto">
                        <div className="flex flex-wrap justify-center gap-2 md:gap-4">
                            {filteredTables.map(table => (
                                <div
                                    key={table.id}
                                    className={`
                                        transition-all duration-500
                                        ${gridLayout === 'compact' ? 'w-[calc(25%-6px)] sm:w-[calc(20%-16px)] lg:w-[calc(14.28%-16px)] xl:w-[calc(11.11%-16px)] 2xl:w-[calc(10%-16px)] min-w-[70px]' :
                                            gridLayout === 'comfort' ? 'w-[calc(50%-6px)] sm:w-[calc(33.33%-16px)] lg:w-[calc(25%-16px)] xl:w-[calc(20%-16px)] 2xl:w-[calc(16.66%-16px)] min-w-[140px]' :
                                                'w-[calc(33.333%-6px)] sm:w-[calc(25%-16px)] lg:w-[calc(20%-16px)] xl:w-[calc(16.666%-16px)] 2xl:w-[calc(12.5%-16px)] min-w-[90px]'}
                                    `}
                                >
                                    <TableCard
                                        table={table}
                                        activeMode={activeMode}
                                        transferSource={transferSource}
                                        isDarkMode={isDarkMode}
                                        isSelected={(selectedTable as any)?.id === table.id}
                                        onClick={handleTableClickWrapper}
                                        gridLayout={gridLayout}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <TableDetailPanel
                    selectedTable={selectedTable}
                    setSelectedTable={setSelectedTable}
                    isDarkMode={isDarkMode}
                    rightPanelMode={rightPanelMode}
                    setRightPanelMode={setRightPanelMode}
                    categories={categories}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    menuSearchTerm={menuSearchTerm}
                    setMenuSearchTerm={setMenuSearchTerm}
                    isSortMenuOpen={isSortMenuOpen}
                    setIsSortMenuOpen={setIsSortMenuOpen}
                    sortOption={sortOption}
                    setSortOption={setSortOption}
                    processedProducts={processedProducts}
                    handleProductClick={handleProductClick}
                    handleRemoveOrder={handleRemoveOrder}
                    paymentMethod={'cash'} // Managed internally now
                    setPaymentMethod={() => { }} // Managed internally now
                    cardBank={'ziraat'} // Managed internally now
                    setCardBank={() => { }} // Managed internally now
                    bankOptions={bankOptions}
                    handlePrintBill={handlePrintBill}
                    setIsCloseModalOpen={setIsCloseModalOpen}
                    processing={processing}
                    userRole={userRole}
                    staffList={staffList}
                    printData={printData}
                    onCompleteRequest={handleCompleteRequest}
                    onToggleVIP={async () => {
                        if (!selectedTable) return;
                        const newStatus = !(selectedTable.isVIP || selectedTable.reservation?.isVIP);
                        await updateDoc(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'tables', selectedTable.id), {
                            isVIP: newStatus
                        });
                        setSelectedTable(prev => prev ? ({ ...prev, isVIP: newStatus }) : null);
                        toast.success(newStatus ? "Masa VIP olarak işaretlendi" : "VIP statüsü kaldırıldı", { icon: '✨' });
                    }}
                    onDeferCloseTable={handleDeferCloseTable}
                    onPartialPayment={handlePartialPayment}
                />
            )
            }
            <Receipt data={printData} />
        </div >
    );
};

export default Tables;
