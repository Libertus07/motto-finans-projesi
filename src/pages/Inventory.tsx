// pages/Inventory.tsx
import React, { useState, useMemo } from 'react';
import { Truck, PlusCircle, AlertTriangle, Trash2, Box, RefreshCw, Loader2, ChefHat, Database, TrendingUp, Search, ArrowRight, Package, DollarSign, Wallet } from 'lucide-react';
import { addDoc, doc, collection, writeBatch, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, appId } from '../services/firebase';
import { formatCurrency } from '../utils/helpers';
import ConfirmationModal from '../components/ConfirmationModal';
import InfoModal from '../components/InfoModal';
import { SHOP_ID as CURRENT_SHOP_ID } from '../utils/constants';
import { Ingredient, Debt } from '../types';
import { useOutletContext } from 'react-router-dom';
import { DashboardContextType } from '../types';

const Inventory: React.FC = () => {
    const { ingredients, debts } = useOutletContext<DashboardContextType>();

    // --- STATE ---
    // Purchase Wizard State
    interface NewPurchaseState {
        supplier: string;
        amount: string;
        quantity: string;
        ingredientId: string;
        isDebt: boolean;
    }
    const [newPurchase, setNewPurchase] = useState<NewPurchaseState>({ supplier: '', amount: '', quantity: '', ingredientId: '', isDebt: false });
    const [processing, setProcessing] = useState(false);

    // New Ingredient State
    interface NewIngredientState { name: string; unit: string; price: string; stock: string; }
    const [newIngredient, setNewIngredient] = useState<NewIngredientState>({ name: '', unit: 'kg', price: '', stock: '' });
    const [isCreatingIngredient, setIsCreatingIngredient] = useState(false);

    // Filter & Search
    const [searchTerm, setSearchTerm] = useState('');

    // System State
    const [deleteData, setDeleteData] = useState<Ingredient | null>(null);
    const [infoModal, setInfoModal] = useState<{ isOpen: boolean; type: 'success' | 'error' | 'warning' | 'info'; title: string; message: string }>({ isOpen: false, type: 'success', title: '', message: '' });

    // --- STATS ---
    const stockStats = useMemo(() => {
        const totalValue = ingredients.reduce((sum, ing) => sum + (ing.price * (ing.stock || 0)), 0);
        const lowStockCount = ingredients.filter(ing => (ing.stock || 0) < 5).length;
        const suppliers = [...new Set(debts.map(d => d.supplier).filter(s => s))];
        const supplierPurchaseCounts = suppliers.reduce((acc, supplier) => {
            // Mock calculation for demo purposes, in real app would aggregate form transactions
            acc[supplier] = Math.floor(Math.random() * 10) + 1;
            return acc;
        }, {} as Record<string, number>);

        return { totalValue, lowStockCount, suppliers, supplierPurchaseCounts };
    }, [ingredients, debts]);

    const filteredIngredients = ingredients
        .filter(ing => ing.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => (a.stock || 0) - (b.stock || 0)); // Sort by stock level (low to high) default

    // --- ACTIONS ---
    const handleAddIngredient = async () => {
        if (!newIngredient.name || !newIngredient.price) return;
        try {
            await addDoc(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'ingredients'), {
                name: newIngredient.name, unit: newIngredient.unit, price: Number(newIngredient.price) || 0, stock: Number(newIngredient.stock) || 0, order: ingredients.length + 1
            });
            setNewIngredient({ name: '', unit: 'kg', price: '', stock: '' });
            setIsCreatingIngredient(false);
            setInfoModal({ isOpen: true, type: 'success', title: 'Başarılı', message: 'Yeni hammadde kartı açıldı.' });
        } catch (error) { console.error(error); }
    };

    const handleUpdateIngredient = async (id: string, field: keyof Ingredient, value: string | number) => {
        const val = (field === 'price' || field === 'stock') ? Number(value) : value;
        if ((field === 'price' || field === 'stock') && (isNaN(val as number) || (val as number) < 0)) return;
        await updateDoc(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'ingredients', id), { [field]: val });
    };

    const confirmDelete = async () => {
        if (!deleteData) return;
        try {
            await deleteDoc(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'ingredients', deleteData.id));
            setDeleteData(null);
        } catch (error) {
            console.error(error);
            setInfoModal({ isOpen: true, type: 'error', title: 'Hata', message: 'Silme işlemi sırasında bir sorun oluştu.' });
        }
    };

    const handleRecordPurchase = async () => {
        if (!newPurchase.ingredientId || !newPurchase.amount || !newPurchase.quantity || !newPurchase.supplier) {
            setInfoModal({ isOpen: true, type: 'warning', title: 'Eksik Bilgi', message: 'Lütfen tüm alanları doldurunuz.' });
            return;
        }

        setProcessing(true);
        const ingredient = ingredients.find(i => i.id === newPurchase.ingredientId);
        if (!ingredient) { setProcessing(false); return; }

        const purchaseAmount = Number(newPurchase.amount);
        const purchaseQuantity = Number(newPurchase.quantity);
        const batch = writeBatch(db);

        try {
            const ingRef = doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'ingredients', newPurchase.ingredientId);
            const newStock = (ingredient.stock || 0) + purchaseQuantity;
            const newPrice = purchaseAmount / purchaseQuantity;

            batch.update(ingRef, { stock: newStock, price: newPrice });

            if (newPurchase.isDebt) {
                const debtData = {
                    supplier: newPurchase.supplier, amount: purchaseAmount, dueDate: new Date().toISOString().split('T')[0],
                    note: `${ingredient.name} alımı (${purchaseQuantity} ${ingredient.unit})`, type: 'debt', createdAt: Date.now(),
                };
                // @ts-ignore
                batch.set(doc(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'debts')), debtData);
            } else {
                const transactionData = {
                    date: new Date().toISOString().split('T')[0], type: 'expense', amount: purchaseAmount,
                    desc: `${newPurchase.supplier} - ${ingredient.name} alımı`, method: 'cash', category: 'Stok (Fatura)',
                };
                // @ts-ignore
                batch.set(doc(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'transactions')), transactionData);
            }
            await batch.commit();
            setNewPurchase({ supplier: '', amount: '', quantity: '', ingredientId: '', isDebt: false });
            setInfoModal({ isOpen: true, type: 'success', title: 'Alım Kaydedildi', message: `${purchaseQuantity} ${ingredient.unit} ${ingredient.name} stoğa eklendi.` });

        } catch (error) {
            console.error(error);
            setInfoModal({ isOpen: true, type: 'error', title: 'Hata', message: 'İşlem kaydedilirken bir sorun oluştu.' });
        } finally {
            setProcessing(false);
        }
    };

    // Helper: Stock Color
    const getStockColor = (stock: number) => {
        if (stock <= 0) return 'bg-red-500';
        if (stock < 5) return 'bg-orange-500';
        if (stock < 20) return 'bg-yellow-500';
        return 'bg-emerald-500';
    };

    const getStockWidth = (stock: number) => Math.min(100, Math.max(5, stock * 2)); // Dynamic width

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 md:p-8 font-sans">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-blue-900/10 to-transparent opacity-60" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-3xl opacity-40" />
            </div>

            <ConfirmationModal isOpen={!!deleteData} onClose={() => setDeleteData(null)} onConfirm={confirmDelete} title="Hammaddeyi Sil" message={`"${deleteData?.name}" adlı hammaddeyi silmek istediğinize emin misiniz?`} loading={false} />
            <InfoModal isOpen={infoModal.isOpen} onClose={() => setInfoModal({ ...infoModal, isOpen: false })} type={infoModal.type} title={infoModal.title} message={infoModal.message} />

            <div className="max-w-[1600px] mx-auto relative z-10">
                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-slate-800/60 pb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
                                <Box size={28} className="text-white" />
                            </div>
                            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">Stok Stüdyosu</h1>
                        </div>
                        <p className="text-slate-400 font-medium max-w-lg">
                            Hammadde akışını yönetin, alımları kaydedin ve depo değerinizi anlık takip edin.
                        </p>
                    </div>

                    <div className="flex gap-6">
                        <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 backdrop-blur-sm min-w-[200px]">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                                <Wallet size={14} className="text-emerald-400" />
                                Depo Değeri
                            </div>
                            <div className="text-3xl font-black text-white tracking-tight">{formatCurrency(stockStats.totalValue)} <span className="text-lg text-slate-500">₺</span></div>
                        </div>
                    </div>
                </div>

                {/* MAIN GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:h-[calc(100vh-220px)]">

                    {/* LEFT COLUMN: SUPPLY CHAIN (INPUT) */}
                    <div className="lg:col-span-5 flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar pr-2">

                        {/* 1. Supplier & Purchase Card */}
                        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10 transition-opacity group-hover:opacity-100 opacity-50" />

                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400"><Truck size={20} /></div>
                                Tedarik & Yeni Alım
                            </h3>

                            <div className="space-y-5">
                                {/* Ingredient Select */}
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block ml-1">Ne Alındı?</label>
                                    <div className="relative">
                                        <select
                                            value={newPurchase.ingredientId}
                                            onChange={(e) => setNewPurchase({ ...newPurchase, ingredientId: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-white outline-none focus:border-indigo-500 font-medium transition-all"
                                        >
                                            <option value="">Ürün Seçiniz...</option>
                                            {ingredients.map(ing => <option key={ing.id} value={ing.id}>{ing.name} ({ing.stock} {ing.unit})</option>)}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500"><ArrowRight size={16} /></div>
                                    </div>
                                    <button
                                        onClick={() => setIsCreatingIngredient(!isCreatingIngredient)}
                                        className="text-xs font-bold text-indigo-400 mt-2 ml-1 hover:text-indigo-300 transition-colors flex items-center gap-1"
                                    >
                                        <PlusCircle size={14} /> Listede yok mu? Yeni Kart Aç
                                    </button>
                                </div>

                                {/* New Ingredient Form (Collapsible) */}
                                {isCreatingIngredient && (
                                    <div className="bg-slate-800/50 p-4 rounded-xl border border-indigo-500/30 animate-in slide-in-from-top-4 space-y-3">
                                        <input type="text" placeholder="Ürün Adı" value={newIngredient.name} onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm outline-none focus:border-indigo-500" />
                                        <div className="flex gap-2">
                                            <input type="number" placeholder="Fiyat" value={newIngredient.price} onChange={(e) => setNewIngredient({ ...newIngredient, price: e.target.value })} className="w-1/3 bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm outline-none focus:border-indigo-500" />
                                            <select value={newIngredient.unit} onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })} className="w-1/3 bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-300 text-sm outline-none focus:border-indigo-500"><option>kg</option><option>Liter</option><option>Adet</option><option>Gram</option></select>
                                            <input type="number" placeholder="Stok" value={newIngredient.stock} onChange={(e) => setNewIngredient({ ...newIngredient, stock: e.target.value })} className="w-1/3 bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm outline-none focus:border-indigo-500" />
                                        </div>
                                        <button onClick={handleAddIngredient} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg text-xs">OLUŞTUR</button>
                                    </div>
                                )}

                                {/* Supplier Input with Datalist */}
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block ml-1">Kimden Alındı?</label>
                                    <input
                                        type="text"
                                        placeholder="Tedarikçi Ara veya Yaz..."
                                        list="supplier-list"
                                        value={newPurchase.supplier}
                                        onChange={(e) => setNewPurchase({ ...newPurchase, supplier: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-white outline-none focus:border-indigo-500 font-medium"
                                    />
                                    <datalist id="supplier-list">{stockStats.suppliers.map(s => <option key={s} value={s} />)}</datalist>
                                </div>

                                {/* Purchase Details */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block ml-1">Miktar</label>
                                        <div className="relative">
                                            <input type="number" placeholder="0" value={newPurchase.quantity} onChange={(e) => setNewPurchase({ ...newPurchase, quantity: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-white outline-none focus:border-indigo-500 font-bold font-mono text-lg" />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 pointer-events-none">Birim</div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block ml-1">Toplam Tutar</label>
                                        <div className="relative">
                                            <input type="number" placeholder="0.00" value={newPurchase.amount} onChange={(e) => setNewPurchase({ ...newPurchase, amount: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-white outline-none focus:border-indigo-500 font-bold font-mono text-lg" />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 pointer-events-none">₺</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Debt Calculation & Switch */}
                                <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700 transition-colors" onClick={() => setNewPurchase(prev => ({ ...prev, isDebt: !prev.isDebt }))}>
                                    <div>
                                        <div className="text-sm font-bold text-white flex items-center gap-2">
                                            <RefreshCw size={16} className={newPurchase.isDebt ? 'text-red-400' : 'text-slate-500'} />
                                            {newPurchase.isDebt ? 'Veresiye (Borç) İşlemi' : 'Nakit / Kasa İşlemi'}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">
                                            {newPurchase.isDebt ? 'Bu işlem "Borçlar" sayfasına yansıyacak.' : 'Ödeme kasadan düşülecek.'}
                                        </div>
                                    </div>
                                    <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${newPurchase.isDebt ? 'bg-red-500' : 'bg-slate-700'}`}>
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${newPurchase.isDebt ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </div>
                                </div>

                                <button
                                    onClick={handleRecordPurchase}
                                    disabled={processing}
                                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-900/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
                                >
                                    {processing ? <Loader2 className="animate-spin" /> : <Package size={20} />}
                                    STOKLARA İŞLE
                                </button>
                            </div>
                        </div>

                        {/* Recent Suppliers Quick View */}
                        <div className="grid grid-cols-2 gap-4">
                            {stockStats.suppliers.slice(0, 4).map(supplier => (
                                <div key={supplier} onClick={() => setNewPurchase(prev => ({ ...prev, supplier }))} className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 hover:bg-slate-800 hover:border-indigo-500/30 cursor-pointer transition-all">
                                    <div className="text-xs font-bold text-slate-500 mb-1">Tedarikçi</div>
                                    <div className="font-bold text-white truncate">{supplier}</div>
                                </div>
                            ))}
                        </div>

                    </div>


                    {/* RIGHT COLUMN: WAREHOUSE (STATE) */}
                    <div className="lg:col-span-7 flex flex-col bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl h-[800px] lg:h-full">

                        {/* Warehouse Header */}
                        <div className="p-6 border-b border-slate-700/50 bg-slate-900/80 sticky top-0 z-10">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-white flex items-center gap-2 text-lg">
                                    <Database className="text-emerald-400" size={20} />
                                    Depo Envanteri
                                </h3>
                                <div className="text-xs font-bold bg-slate-800 px-3 py-1.5 rounded-lg text-slate-400">
                                    {ingredients.length} Kalem Ürün
                                </div>
                            </div>

                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Envanterde ara..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                />
                            </div>
                        </div>

                        {/* Inventory List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {stockStats.lowStockCount > 0 && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4 flex items-center gap-3 animate-pulse">
                                    <div className="bg-red-500/20 p-2 rounded-lg text-red-500"><AlertTriangle size={20} /></div>
                                    <div>
                                        <div className="font-bold text-red-400">Kritik Stok Uyarısı</div>
                                        <div className="text-xs text-red-300/70">{stockStats.lowStockCount} ürün tükenmek üzere.</div>
                                    </div>
                                </div>
                            )}

                            {filteredIngredients.map(ing => (
                                <div key={ing.id} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 group hover:bg-slate-800/60 transition-all">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={ing.name}
                                                    onChange={(e) => handleUpdateIngredient(ing.id, 'name', e.target.value)}
                                                    className="bg-transparent font-bold text-white text-lg outline-none border-b border-transparent focus:border-indigo-500 w-full lg:w-auto"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <input
                                                    type="number"
                                                    value={ing.price}
                                                    onChange={(e) => handleUpdateIngredient(ing.id, 'price', e.target.value)}
                                                    className="bg-slate-950/50 text-xs font-mono text-orange-400 w-16 px-1 rounded border border-transparent focus:border-orange-500 outline-none"
                                                />
                                                <span className="text-xs text-slate-500">₺ / {ing.unit}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-black text-emerald-400">{formatCurrency((ing.stock || 0) * ing.price)} ₺</div>
                                            <button
                                                onClick={() => setDeleteData(ing)}
                                                className="text-slate-600 hover:text-red-400 transition-colors p-1"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Visual Stock Bar */}
                                    <div className="relative h-8 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 cursor-text group/bar">
                                        <div
                                            className={`absolute top-0 left-0 h-full transition-all duration-1000 ${getStockColor(ing.stock || 0)} opacity-20`}
                                            style={{ width: `${getStockWidth(ing.stock || 0)}%` }}
                                        />
                                        <div
                                            className={`absolute bottom-0 left-0 h-0.5 transition-all duration-1000 ${getStockColor(ing.stock || 0)}`}
                                            style={{ width: `${getStockWidth(ing.stock || 0)}%` }}
                                        />

                                        <div className="absolute inset-0 flex items-center justify-between px-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-500 uppercase">Stok:</span>
                                                <input
                                                    type="number"
                                                    value={ing.stock}
                                                    onChange={(e) => handleUpdateIngredient(ing.id, 'stock', e.target.value)}
                                                    className={`bg-transparent font-black text-sm outline-none w-20 ${ing.stock < 5 ? 'text-red-400' : 'text-white'}`}
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-slate-600">{ing.unit}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {filteredIngredients.length === 0 && (
                                <div className="text-center py-20 text-slate-500">
                                    <Package size={48} className="mx-auto mb-4 opacity-20" />
                                    <p>Ürün bulunamadı.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Inventory;
