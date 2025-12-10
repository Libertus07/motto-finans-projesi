// pages/Tables.jsx (GARSON YETKİ KISITLAMASI VE MOBİL UYUM EKLENMİŞ HALİ)

import React, { useState, useEffect } from 'react';
import { Table as TableIcon, Coffee, Trash2, Printer, CheckCircle2, CreditCard, Banknote, X, Sun, Cloud, Home, ArrowUp, Move, AlertTriangle } from 'lucide-react';
import { addDoc, doc, updateDoc, collection, writeBatch } from 'firebase/firestore';
import { db, appId, auth } from '../services/firebase';
import { formatCurrency } from '../utils/helpers';
import { THEME } from '../utils/constants';
import Receipt from '../components/Receipt';
import TableTransferModal from '../components/TableTransferModal';
import ConfirmationModal from '../components/ConfirmationModal';
import TableCloseModal from '../components/TableCloseModal';

const Tables = ({ tables, products, userRole }) => { // 👇 userRole eklendi
    const [selectedTable, setSelectedTable] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('Tümü');
    const [activeZone, setActiveZone] = useState('Tümü');
    const [processing, setProcessing] = useState(false);
    const [printData, setPrintData] = useState(null);
    
    // Modal State'leri
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isEmptyConfirmOpen, setIsEmptyConfirmOpen] = useState(false);
    const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
    
    // Ödeme state'leri
    const [paymentMethod, setPaymentMethod] = useState('cash'); 
    const [cardBank, setCardBank] = useState('ziraat');
    
    const bankOptions = [
        { key: 'ziraat', label: 'Ziraat Bankası' },
        { key: 'halk', label: 'Halk Bankası' },
        { key: 'iban', label: 'Diğer Banka / IBAN' }
    ];

    useEffect(() => {
        if (!selectedTable || !tables || tables.length === 0) return;
        const latestTable = tables.find(t => t.id === selectedTable.id);
        if (latestTable && (latestTable.total !== selectedTable.total || latestTable.status !== selectedTable.status || latestTable.orders.length !== selectedTable.orders.length)) {
            setSelectedTable(latestTable);
        }
    }, [tables, selectedTable]);

    // --- HELPER'LAR ---
    const getTableStatusColor = (status) => {
        switch (status) {
            case 'occupied': return 'bg-red-600 hover:bg-red-500';
            case 'ordered': return 'bg-yellow-600 hover:bg-yellow-500';
            case 'needs_cleaning': return 'bg-blue-600 hover:bg-blue-500'; 
            case 'empty': default: return 'bg-emerald-600 hover:bg-emerald-500';
        }
    };
    
    const getTableStatusLabel = (status) => { 
        switch (status) {
            case 'occupied': return 'DOLU';
            case 'ordered': return 'SİPARİŞ VERİLDİ';
            case 'needs_cleaning': return 'TEMİZLİK GEREKLİ';
            case 'empty': default: return 'BOŞ & TEMİZ';
        }
    };
    
    const getZoneIcon = (zoneName) => { 
        if (zoneName.includes('Bahçe')) return <Sun size={16}/>;
        if (zoneName.includes('Teras')) return <Cloud size={16}/>;
        if (zoneName.includes('Üst')) return <ArrowUp size={16}/>;
        return <Home size={16}/>;
    };

    // --- FIREBASE İŞLEMLERİ ---
    const handleAddOrder = async (tableId, product) => {
        const user = auth.currentUser;
        if (!user || processing) return;
        setProcessing(true);
        const tableRef = doc(db, 'artifacts', appId, 'users', user.uid, 'tables', tableId);
        try {
            const currentTable = tables.find(t => t.id === tableId);
            if (!currentTable) return;
            const existingOrderIndex = currentTable.orders.findIndex(o => o.id === product.id);
            const newTotal = currentTable.total + product.price;
            let newOrders = [...currentTable.orders];
            if (existingOrderIndex !== -1) newOrders[existingOrderIndex].quantity += 1;
            else newOrders.push({ ...product, quantity: 1 });
            await updateDoc(tableRef, { orders: newOrders, total: newTotal, status: currentTable.status === 'empty' ? 'occupied' : currentTable.status });
        } catch (error) { console.error(error); } finally { setProcessing(false); }
    };

    const handleRemoveOrder = async (tableId, orderId, price) => {
        const user = auth.currentUser;
        if (!user || processing) return;
        setProcessing(true);
        const tableRef = doc(db, 'artifacts', appId, 'users', user.uid, 'tables', tableId);
        try {
            const currentTable = tables.find(t => t.id === tableId);
            if (!currentTable) return;
            const existingOrderIndex = currentTable.orders.findIndex(o => o.id === orderId);
            if (existingOrderIndex === -1) return;
            let newOrders = [...currentTable.orders];
            const newTotal = currentTable.total - price;
            if (newOrders[existingOrderIndex].quantity > 1) newOrders[existingOrderIndex].quantity -= 1;
            else newOrders.splice(existingOrderIndex, 1);
            const newStatus = newOrders.length === 0 ? 'empty' : currentTable.status;
            await updateDoc(tableRef, { orders: newOrders, total: newTotal, status: newStatus });
        } catch (error) { console.error(error); } finally { setProcessing(false); }
    };
    
    const confirmMarkAsEmpty = async () => {
        if (!selectedTable) return;
        const user = auth.currentUser;
        await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'tables', selectedTable.id), { status: 'empty', orders: [], total: 0 });
        setSelectedTable(prev => ({...prev, status: 'empty', orders: [], total: 0}));
        setIsEmptyConfirmOpen(false);
    };

    const confirmCloseTable = async () => { 
        if (!selectedTable) return;
        setProcessing(true);
        const user = auth.currentUser;
        try {
            const transMethod = paymentMethod === 'cash' ? 'cash' : 'card';
            const transCardBank = paymentMethod === 'card' ? cardBank : null;
            const subMethodDisplay = paymentMethod === 'cash' ? 'Nakit' : `Kart (${cardBank.toUpperCase()})`;

            await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'transactions'), {
                date: new Date().toISOString().split('T')[0], type: 'income', amount: selectedTable.total,
                desc: `${selectedTable.name} (${selectedTable.zone}) Satışı`, method: transMethod, cardBank: transCardBank, category: 'Masa Satışı', subMethod: subMethodDisplay 
            });

            await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'tables', selectedTable.id), { orders: [], total: 0, status: 'needs_cleaning' });
            
            setIsCloseModalOpen(false);
            setSelectedTable(null);
            setPaymentMethod('cash'); 
            setCardBank('ziraat'); 
        } catch (error) { console.error(error); alert("Hata oluştu."); } finally { setProcessing(false); }
    };

    const handleTransfer = async (fromTableId, toTableId) => {
        setProcessing(true);
        const user = auth.currentUser;
        const batch = writeBatch(db);
        const fromTable = tables.find(t => t.id === fromTableId);
        try {
            batch.update(doc(db, 'artifacts', appId, 'users', user.uid, 'tables', fromTableId), { orders: [], total: 0, status: 'empty' });
            batch.update(doc(db, 'artifacts', appId, 'users', user.uid, 'tables', toTableId), { orders: fromTable.orders, total: fromTable.total, status: 'occupied' });
            await batch.commit();
            setIsTransferModalOpen(false);
            setSelectedTable(null);
            alert("✅ Masa başarıyla taşındı.");
        } catch (error) { console.error(error); alert("Transfer hatası."); } finally { setProcessing(false); }
    };
    
    const handlePrintBill = () => {
        if (!selectedTable || selectedTable.orders.length === 0) return;
        setPrintData({
            title: selectedTable.name, type: 'Masa Hesabı', items: selectedTable.orders.map(o => ({name: o.name, quantity: o.quantity, price: o.price})), total: selectedTable.total, date: new Date().toLocaleString('tr-TR')
        });
        setTimeout(() => window.print(), 100);
    };

    const filteredTables = tables.filter(t => activeZone === 'Tümü' || t.zone === activeZone);
    const availableProducts = products.filter(p => selectedCategory === 'Tümü' || p.category === selectedCategory);
    const zones = [...new Set(tables.map(t => t.zone))].filter(z => z); 
    const categories = [...new Set(products.map(p => p.category))];

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-100px)] overflow-hidden relative">
            
            <TableTransferModal isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} tables={tables} selectedTableId={selectedTable?.id} onConfirm={handleTransfer} loading={processing}/>
            <ConfirmationModal isOpen={isEmptyConfirmOpen} onClose={() => setIsEmptyConfirmOpen(false)} onConfirm={confirmMarkAsEmpty} title="Masayı Temizle" message="Bu masayı boş ve temiz olarak işaretlemek istediğinize emin misiniz? (Siparişler silinir)" type="warning" confirmText="TEMİZLE"/>
            <TableCloseModal isOpen={isCloseModalOpen} onClose={() => setIsCloseModalOpen(false)} onConfirm={confirmCloseTable} tableName={selectedTable?.name} amount={selectedTable?.total} method={paymentMethod} bank={cardBank} loading={processing}/>

            {/* SOL KISIM: MASA LİSTESİ */}
            <div className={`flex-1 overflow-y-auto p-4 md:p-8 ${selectedTable ? 'hidden md:block' : 'block'}`}>
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3"><TableIcon size={28}/> Masalar</h2>
                <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-800 pb-4">
                    <button onClick={() => setActiveZone('Tümü')} className={`px-4 py-2 text-sm rounded-full font-bold transition-colors flex items-center gap-1 ${activeZone === 'Tümü' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>Tümü ({tables.length})</button>
                    {zones.map(zone => ( <button key={zone} onClick={() => setActiveZone(zone)} className={`px-4 py-2 text-sm rounded-full font-bold transition-colors flex items-center gap-1 ${activeZone === zone ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>{getZoneIcon(zone)} {zone} ({tables.filter(t => t.zone === zone).length})</button> ))}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 pb-20 md:pb-0">
                    {filteredTables.map(table => (
                        <button key={table.id} onClick={() => setSelectedTable(table)} className={`flex flex-col items-center justify-center p-6 rounded-2xl shadow-xl transition-all h-32 ${getTableStatusColor(table.status)} text-white relative group active:scale-95`}>
                            <span className="absolute top-2 left-3 text-xs opacity-70">No: {table.number}</span>
                            <span className="text-lg font-semibold">{table.name}</span>
                            <span className="text-xs opacity-80 mt-1 font-bold">{getTableStatusLabel(table.status)}</span>
                            {table.total > 0 && <span className="absolute bottom-3 text-xl font-bold">{formatCurrency(table.total)} ₺</span>}
                        </button>
                    ))}
                </div>
            </div>

            {/* SAĞ KISIM: DETAY VE İŞLEM */}
            {selectedTable ? (
                <div className={`${THEME.card} w-full md:w-[420px] shrink-0 border-l ${THEME.border} flex flex-col absolute md:static inset-0 z-20`}>
                    <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                        <h3 className="text-xl font-bold text-white">{selectedTable.name}</h3>
                        <button onClick={() => setSelectedTable(null)} className="text-slate-400 hover:text-white p-2 rounded-full bg-slate-800"><X size={20}/></button>
                    </div>
                    <div className="p-4 flex gap-2 border-b border-slate-800 shrink-0">
                        <button onClick={() => setIsTransferModalOpen(true)} disabled={selectedTable.status === 'empty' || selectedTable.status === 'needs_cleaning'} className="flex-1 py-2 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 rounded-lg text-xs font-bold border border-purple-500/20 flex items-center justify-center gap-2 disabled:opacity-50"><Move size={14}/> Taşı</button>
                        <button onClick={() => setIsEmptyConfirmOpen(true)} disabled={selectedTable.status === 'empty'} className="flex-1 py-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 rounded-lg text-xs font-bold border border-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"><CheckCircle2 size={14}/> Temizle & Boşalt</button>
                    </div>
                    <div className="p-4 border-b border-slate-800 overflow-x-auto no-scrollbar flex gap-2 shrink-0">
                        <button onClick={() => setSelectedCategory('Tümü')} className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-colors ${selectedCategory === 'Tümü' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>Tümü</button>
                        {categories.map(cat => ( <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-colors ${selectedCategory === cat ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>{cat}</button> ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3 p-4 border-b border-slate-800 overflow-y-auto shrink-0 max-h-52 custom-scrollbar">
                        {availableProducts.map(product => (
                            <button key={product.id} onClick={() => handleAddOrder(selectedTable.id, product)} className="p-3 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-colors active:scale-[0.98] flex flex-col items-start">
                                <span className="text-sm font-semibold text-white truncate w-full text-left">{product.name}</span>
                                <span className="text-xs text-indigo-400 font-bold mt-1">{formatCurrency(product.price)} ₺</span>
                            </button>
                        ))}
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {selectedTable.orders.length > 0 ? ( selectedTable.orders.map(order => (
                                <div key={order.id} className="flex justify-between items-center p-2 bg-slate-900/50 rounded-lg border border-slate-800">
                                    <div className="flex-1"><span className="text-sm font-medium">{order.name}</span><span className="text-xs text-slate-500 block">x{order.quantity}</span></div>
                                    <div className="flex items-center gap-2"><span className="font-bold text-sm text-indigo-400">{formatCurrency(order.price * order.quantity)} ₺</span><button onClick={() => handleRemoveOrder(selectedTable.id, order.id, order.price)} className="text-red-500 hover:text-red-400 p-1 rounded-full hover:bg-slate-800"><Trash2 size={16}/></button></div>
                                </div>
                            ))
                        ) : <div className="text-center py-10 text-slate-600"><Coffee size={32} className="mx-auto mb-2"/><p>Bu masada sipariş yok.</p></div>}
                    </div>
                    
                    {/* 👇 ÖDEME KISMI (GARSON KONTROLÜ) */}
                    <div className="p-5 bg-slate-900 border-t border-slate-800">
                        <div className="flex justify-between items-end mb-4"><span className="text-slate-400 text-sm mb-1 block">Toplam Tutar</span><span className="text-4xl font-extrabold text-white tracking-tight">{formatCurrency(selectedTable.total)} <span className="text-lg text-slate-500 font-normal">₺</span></span></div>
                        
                        {userRole !== 'garson' ? (
                            <>
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <button onClick={() => setPaymentMethod('cash')} className={`py-3 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-colors ${paymentMethod === 'cash' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}><Banknote size={24}/> <span className="text-xs">NAKİT</span></button>
                                    <button onClick={() => setPaymentMethod('card')} className={`py-3 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-colors ${paymentMethod === 'card' ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}><CreditCard size={24}/> <span className="text-xs">KART / BANKA</span></button>
                                </div>
                                {paymentMethod === 'card' && (
                                    <div className="grid grid-cols-3 gap-2 mb-3 animate-in fade-in slide-in-from-top-2">{bankOptions.map(option => ( <button key={option.key} onClick={() => setCardBank(option.key)} className={`py-2 rounded-lg text-xs font-bold transition-colors ${cardBank === option.key ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>{option.label}</button> ))}</div>
                                )}
                                <button onClick={handlePrintBill} disabled={selectedTable.total <= 0} className="w-full mb-3 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-slate-600"><Printer size={20}/> ADİSYON YAZDIR</button>
                                <button onClick={() => setIsCloseModalOpen(true)} disabled={selectedTable.total <= 0 || processing} className={`w-full py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${paymentMethod === 'cash' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/30'} text-white flex items-center justify-center gap-2`}><CheckCircle2 size={20}/> {formatCurrency(selectedTable.total)} ₺ KAPAT</button>
                            </>
                        ) : (
                            <div className="space-y-3 animate-in fade-in">
                                <div className="p-3 bg-rose-900/20 border border-rose-500/30 rounded-xl text-center flex flex-col items-center gap-1">
                                    <AlertTriangle size={20} className="text-rose-400 mb-1"/>
                                    <p className="text-xs text-rose-400 font-bold">Ödeme Alma Yetkiniz Yok</p>
                                    <p className="text-[10px] text-slate-500">Lütfen ödeme işlemleri için kasayı çağırın.</p>
                                </div>
                                <button onClick={handlePrintBill} disabled={selectedTable.total <= 0} className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-slate-600"><Printer size={20}/> ADİSYON YAZDIR</button>
                            </div>
                        )}
                    </div>
                    <Receipt data={printData} />
                </div>
            ) : (
                <div className="hidden md:flex w-full md:w-96 shrink-0 border-l border-slate-800 flex-col items-center justify-center text-slate-600 bg-slate-900/30">
                     <TableIcon size={48} className="mb-4 opacity-50"/>
                     <p className="text-sm font-medium">Detayları görmek için sol taraftan bir masa seçin.</p>
                </div>
            )}
        </div>
    );
};

export default Tables;