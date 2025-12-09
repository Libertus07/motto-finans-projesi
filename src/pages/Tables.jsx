import React, { useState, useEffect } from 'react';
import { Table as TableIcon, Coffee, PlusCircle, Trash2, Printer, CheckCircle2, CreditCard, Banknote, RefreshCw, X, ArrowRight, Armchair, Sun, Cloud, Home, ArrowUp, Move } from 'lucide-react';
import { addDoc, doc, updateDoc, deleteField, collection, writeBatch } from 'firebase/firestore';
import { db, appId, auth } from '../services/firebase';
import { formatCurrency } from '../utils/helpers';
import { THEME } from '../utils/constants';
import Receipt from '../components/Receipt';

// 👇 MASA TRANSFERİ MODALI
const TableTransferModal = ({ isOpen, onClose, tables, selectedTableId, handleTransfer }) => {
    const [targetTableId, setTargetTableId] = useState('');
    const availableTables = tables.filter(t => t.status === 'empty' && t.id !== selectedTableId);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-slate-800 p-6 rounded-xl w-full max-w-md border border-slate-700 shadow-2xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Move size={20}/> Masa Taşı</h3>
                <p className="text-sm text-slate-400 mb-4">{tables.find(t => t.id === selectedTableId)?.name} masasını hangi boş masaya taşımak istersiniz?</p>
                
                <select 
                    value={targetTableId} 
                    onChange={(e) => setTargetTableId(e.target.value)} 
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white outline-none focus:border-indigo-500 mb-4"
                >
                    <option value="">Hedef Masa Seçiniz</option>
                    {availableTables.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.zone})</option>
                    ))}
                </select>

                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg">İptal</button>
                    <button 
                        onClick={() => handleTransfer(selectedTableId, targetTableId)} 
                        disabled={!targetTableId}
                        className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50"
                    >
                        Taşı
                    </button>
                </div>
            </div>
        </div>
    );
};

const Tables = ({ tables, products }) => {
    const [selectedTable, setSelectedTable] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('Tümü');
    const [activeZone, setActiveZone] = useState('Tümü');
    const [processing, setProcessing] = useState(false);
    const [printData, setPrintData] = useState(null);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false); // Transfer modal state'i
    
    // Ödeme state'leri
    const [paymentMethod, setPaymentMethod] = useState('cash'); 
    const [cardBank, setCardBank] = useState('ziraat');
    
    // Banka seçenekleri
    const bankOptions = [
        { key: 'ziraat', label: 'Ziraat Bankası' },
        { key: 'halk', label: 'Halk Bankası' },
        { key: 'iban', label: 'Diğer Banka / IBAN' }
    ];

    // KRİTİK DÜZELTME: Veritabanı ile Local State Senkronizasyonu
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
            case 'needs_cleaning': return 'bg-blue-600 hover:bg-blue-500'; // Yeni renk
            case 'empty': default: return 'bg-emerald-600 hover:bg-emerald-500';
        }
    };
    
    const getTableStatusLabel = (status) => { // Yeni etiket helper
        switch (status) {
            case 'occupied': return 'DOLU';
            case 'ordered': return 'SİPARİŞ VERİLDİ';
            case 'needs_cleaning': return 'TEMİZLİK GEREKLİ';
            case 'empty': default: return 'BOŞ & TEMİZ';
        }
    };
    
    const getZoneIcon = (zoneName) => { // App.jsx'ten taşınabilir, burada bırakıldı.
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

            if (existingOrderIndex !== -1) {
                newOrders[existingOrderIndex].quantity += 1;
            } else {
                newOrders.push({ ...product, quantity: 1 });
            }

            await updateDoc(tableRef, {
                orders: newOrders,
                total: newTotal,
                status: currentTable.status === 'empty' ? 'occupied' : currentTable.status,
            });
        } catch (error) {
            console.error("Sipariş ekleme hatası:", error);
        } finally {
            setProcessing(false);
        }
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

            if (newOrders[existingOrderIndex].quantity > 1) {
                newOrders[existingOrderIndex].quantity -= 1;
            } else {
                newOrders.splice(existingOrderIndex, 1);
            }
            
            const newStatus = newOrders.length === 0 ? 'empty' : currentTable.status;

            await updateDoc(tableRef, {
                orders: newOrders,
                total: newTotal,
                status: newStatus,
            });
        } catch (error) {
            console.error("Sipariş silme hatası:", error);
        } finally {
            setProcessing(false);
        }
    };
    
    // 👇 YENİ FONKSİYON: Masayı Temiz/Boş Olarak İşaretle
    const handleMarkAsEmpty = async (tableId) => {
        if(!window.confirm("Masayı temiz ve boş olarak işaretlemek istiyor musunuz?")) return;
        const user = auth.currentUser;
        if (!user) return;
        
        await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'tables', tableId), { 
            status: 'empty',
            orders: [],
            total: 0
        });
        setSelectedTable(prev => ({...prev, status: 'empty', orders: [], total: 0}));
    };

    // --- HESAP KAPATMA ---
    const handleCloseTable = async () => { 
        if (!selectedTable || selectedTable.total <= 0 || processing) return;
        
        const methodDisplay = paymentMethod === 'cash' ? 'Nakit' : `Kart (${cardBank.toUpperCase()})`;
        
        if (!window.confirm(`${selectedTable.name} hesabı kapatılacak: ${formatCurrency(selectedTable.total)} ₺.\nÖdeme Yöntemi: ${methodDisplay}.\nOnaylıyor musunuz?`)) return;
        
        setProcessing(true);
        const user = auth.currentUser;

        try {
            const transMethod = paymentMethod === 'cash' ? 'cash' : 'card';
            const transCardBank = paymentMethod === 'card' ? cardBank : null;
            const subMethodDisplay = paymentMethod === 'cash' ? 'Nakit' : `Kart (${cardBank.toUpperCase()})`;

            // 1. Transaction (Gelir) Kaydı
            await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'transactions'), {
                date: new Date().toISOString().split('T')[0],
                type: 'income',
                amount: selectedTable.total,
                desc: `${selectedTable.name} (${selectedTable.zone}) Satışı`,
                method: transMethod, 
                cardBank: transCardBank, 
                category: 'Masa Satışı',
                subMethod: subMethodDisplay 
            });

            // 2. Masa Durumu Güncelleme (TEMİZLİK GEREKLİ OLARAK AYARLA)
            await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'tables', selectedTable.id), { 
                orders: [], 
                total: 0, 
                status: 'needs_cleaning' // Hesap kapatıldıktan sonra temizliğe işaretle
            });

            // State'leri sıfırla
            setSelectedTable(null);
            setPaymentMethod('cash'); 
            setCardBank('ziraat'); 
        } catch (error) {
            console.error("Masa kapatma hatası:", error);
            alert("Masa kapatılırken bir hata oluştu.");
        } finally {
            setProcessing(false);
        }
    };

    // --- MASA TRANSFERİ İŞLEMLERİ ---
    const handleTransfer = async (fromTableId, toTableId) => {
        if (!fromTableId || !toTableId) return alert("Lütfen hem kaynak hem de hedef masayı seçin.");
        
        const fromTable = tables.find(t => t.id === fromTableId);
        const toTable = tables.find(t => t.id === toTableId);

        if (!fromTable || !toTable || toTable.orders.length > 0) return alert("Hedef masa dolu veya geçersiz işlem.");

        if(!window.confirm(`${fromTable.name} masasındaki ${formatCurrency(fromTable.total)} ₺ tutarındaki siparişler ${toTable.name} masasına taşınsın mı?`)) return;

        setProcessing(true);
        const user = auth.currentUser;
        const batch = writeBatch(db);
        const fromRef = doc(db, 'artifacts', appId, 'users', user.uid, 'tables', fromTableId);
        const toRef = doc(db, 'artifacts', appId, 'users', user.uid, 'tables', toTableId);

        try {
            // Eski masayı temizle ve boş yap
            batch.update(fromRef, { orders: [], total: 0, status: 'empty' });
            
            // Yeni masaya aktar ve dolu yap
            batch.update(toRef, { orders: fromTable.orders, total: fromTable.total, status: 'occupied' });
            
            await batch.commit();
            setIsTransferModalOpen(false);
            setSelectedTable(null);
            alert("Masa başarılı şekilde aktarıldı.");
        } catch (error) {
            console.error("Masa aktarma hatası:", error);
            alert("Masa aktarılırken bir hata oluştu.");
        } finally {
            setProcessing(false);
        }
    };
    
    const handlePrintBill = () => {
        if (!selectedTable || selectedTable.orders.length === 0) return;
        
        setPrintData({
            title: selectedTable.name,
            type: 'Masa Hesabı',
            items: selectedTable.orders.map(o => ({name: o.name, quantity: o.quantity, price: o.price})), // Receipt için formatlama
            total: selectedTable.total,
            date: new Date().toLocaleString('tr-TR')
        });

        setTimeout(() => window.print(), 100);
    };

    // --- FİLTRELEME ---
    const filteredTables = tables.filter(t => activeZone === 'Tümü' || t.zone === activeZone);
    const availableProducts = products.filter(p => selectedCategory === 'Tümü' || p.category === selectedCategory);
    const zones = [...new Set(tables.map(t => t.zone))].filter(z => z); // Boş zonları filtrele
    const categories = [...new Set(products.map(p => p.category))];


    return (
        <div className="flex h-[calc(100vh-100px)] overflow-hidden">
            
            {/* TRANSFER MODALI */}
            <TableTransferModal 
                isOpen={isTransferModalOpen} 
                onClose={() => setIsTransferModalOpen(false)} 
                tables={tables} 
                selectedTableId={selectedTable?.id}
                handleTransfer={handleTransfer}
            />

            {/* SOL KISIM: MASALAR VE ZONLAR */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3"><TableIcon size={28}/> Masalar</h2>
                
                {/* ZON FİLTRELERİ */}
                <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-800 pb-4">
                    <button onClick={() => setActiveZone('Tümü')} className={`px-4 py-2 text-sm rounded-full font-bold transition-colors flex items-center gap-1 ${activeZone === 'Tümü' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>Tümü ({tables.length})</button>
                    {zones.map(zone => (
                        <button key={zone} onClick={() => setActiveZone(zone)} className={`px-4 py-2 text-sm rounded-full font-bold transition-colors flex items-center gap-1 ${activeZone === zone ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>{getZoneIcon(zone)} {zone} ({tables.filter(t => t.zone === zone).length})</button>
                    ))}
                </div>

                {/* MASA IZGARASI */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                    {filteredTables.map(table => (
                        <button 
                            key={table.id} 
                            onClick={() => setSelectedTable(table)}
                            className={`flex flex-col items-center justify-center p-6 rounded-2xl shadow-xl transition-all h-32 ${getTableStatusColor(table.status)} text-white relative group`}
                        >
                            <span className="absolute top-2 left-3 text-xs opacity-70">No: {table.number}</span>
                            <span className="text-lg font-semibold">{table.name}</span>
                            <span className="text-xs opacity-80 mt-1 font-bold">{getTableStatusLabel(table.status)}</span>
                            {table.total > 0 && <span className="absolute bottom-3 text-xl font-bold">{formatCurrency(table.total)} ₺</span>}
                        </button>
                    ))}
                </div>
            </div>

            {/* SAĞ KISIM: MASA DETAYI / ÜRÜN EKLEME / HESAP KAPANIMI */}
            {selectedTable ? (
                <div className={`${THEME.card} w-full md:w-[420px] shrink-0 border-l ${THEME.border} flex flex-col`}>
                    
                    {/* MASA BAŞLIĞI */}
                    <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                        <h3 className="text-xl font-bold text-white">{selectedTable.name}</h3>
                        <button onClick={() => setSelectedTable(null)} className="text-slate-400 hover:text-white p-2 rounded-full"><X size={20}/></button>
                    </div>
                    
                    {/* 👇 MASA İŞLEMLERİ BUTONLARI */}
                    <div className="p-4 flex gap-2 border-b border-slate-800 shrink-0">
                        <button 
                            onClick={() => setIsTransferModalOpen(true)} 
                            disabled={selectedTable.status === 'empty' || selectedTable.status === 'needs_cleaning'}
                            className="flex-1 py-2 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 rounded-lg text-xs font-bold border border-purple-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Move size={14}/> Taşı
                        </button>
                        <button 
                            onClick={() => handleMarkAsEmpty(selectedTable.id)} 
                            disabled={selectedTable.status === 'empty'}
                            className="flex-1 py-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 rounded-lg text-xs font-bold border border-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <CheckCircle2 size={14}/> Temizle & Boşalt
                        </button>
                    </div>

                    {/* ÜRÜN KATEGORİLERİ */}
                    <div className="p-4 border-b border-slate-800 overflow-x-auto no-scrollbar flex gap-2 shrink-0">
                        <button onClick={() => setSelectedCategory('Tümü')} className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-colors ${selectedCategory === 'Tümü' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>Tümü</button>
                        {categories.map(cat => (
                            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-colors ${selectedCategory === cat ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>{cat}</button>
                        ))}
                    </div>

                    {/* ÜRÜN LİSTESİ */}
                    <div className="grid grid-cols-2 gap-3 p-4 border-b border-slate-800 overflow-y-auto shrink-0 max-h-52 custom-scrollbar">
                        {availableProducts.map(product => (
                            <button 
                                key={product.id} 
                                onClick={() => handleAddOrder(selectedTable.id, product)}
                                className="p-3 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-colors active:scale-[0.98] flex flex-col items-start"
                            >
                                <span className="text-sm font-semibold text-white truncate w-full text-left">{product.name}</span>
                                <span className="text-xs text-indigo-400 font-bold mt-1">{formatCurrency(product.price)} ₺</span>
                            </button>
                        ))}
                    </div>

                    {/* SİPARİŞ LİSTESİ */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {selectedTable.orders.length > 0 ? (
                            selectedTable.orders.map(order => (
                                <div key={order.id} className="flex justify-between items-center p-2 bg-slate-900/50 rounded-lg border border-slate-800">
                                    <div className="flex-1"><span className="text-sm font-medium">{order.name}</span><span className="text-xs text-slate-500 block">x{order.quantity}</span></div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm text-indigo-400">{formatCurrency(order.price * order.quantity)} ₺</span>
                                        <button onClick={() => handleRemoveOrder(selectedTable.id, order.id, order.price)} className="text-red-500 hover:text-red-400 p-1 rounded-full hover:bg-slate-800"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-slate-600"><Coffee size={32} className="mx-auto mb-2"/><p>Bu masada sipariş yok.</p></div>
                        )}
                    </div>

                    {/* ÖDEME VE KAPATMA BUTONLARI */}
                    <div className="p-5 bg-slate-900 border-t border-slate-800">
                        <div className="flex justify-between items-end mb-4">
                            <span className="text-slate-400 text-sm mb-1 block">Toplam Tutar</span>
                            <span className="text-4xl font-extrabold text-white tracking-tight">{formatCurrency(selectedTable.total)} <span className="text-lg text-slate-500 font-normal">₺</span></span>
                        </div>
                        
                        {/* 👇 Ödeme Yöntemi Seçenekleri */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <button 
                                onClick={() => setPaymentMethod('cash')} 
                                className={`py-3 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-colors ${paymentMethod === 'cash' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                            >
                                <Banknote size={24}/> <span className="text-xs">NAKİT</span>
                            </button>
                            <button 
                                onClick={() => setPaymentMethod('card')} 
                                className={`py-3 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-colors ${paymentMethod === 'card' ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                            >
                                <CreditCard size={24}/> <span className="text-xs">KART / BANKA</span>
                            </button>
                        </div>

                        {/* BANKA SEÇENEKLERİ (SADECE KART SEÇİLİNCE GÖRÜNÜR) */}
                        {paymentMethod === 'card' && (
                            <div className="grid grid-cols-3 gap-2 mb-3 animate-in fade-in slide-in-from-top-2">
                                {bankOptions.map(option => (
                                    <button 
                                        key={option.key} 
                                        onClick={() => setCardBank(option.key)} 
                                        className={`py-2 rounded-lg text-xs font-bold transition-colors ${cardBank === option.key ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        <button 
                            onClick={handlePrintBill} 
                            disabled={selectedTable.total <= 0}
                            className="w-full mb-3 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-slate-600"
                        >
                            <Printer size={20}/> ADİSYON YAZDIR
                        </button>

                        <button 
                            onClick={handleCloseTable} 
                            disabled={selectedTable.total <= 0 || processing} 
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${paymentMethod === 'cash' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/30'} text-white flex items-center justify-center gap-2`}
                        >
                            <CheckCircle2 size={20}/> {formatCurrency(selectedTable.total)} ₺ KAPAT
                        </button>
                    </div>

                    {/* GİZLİ FİŞ BİLEŞENİ */}
                    <Receipt data={printData} />
                </div>
            ) : (
                <div className={`${THEME.card} w-full md:w-96 shrink-0 border-l ${THEME.border} flex flex-col items-center justify-center text-slate-600`}>
                     <TableIcon size={48} className="mb-4"/>
                     <p>Detayları görmek için sol taraftan bir masa seçin.</p>
                </div>
            )}
        </div>
    );
};

export default Tables;