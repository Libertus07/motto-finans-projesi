import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Coffee, Tag, Eye, IceCream, CupSoda, Utensils, Grid, Save, Loader2, ListPlus, Settings, X, CheckCircle2, LayoutList, Sparkles, TrendingUp, Package } from 'lucide-react';
import { addDoc, deleteDoc, updateDoc, doc, collection, arrayUnion, arrayRemove, writeBatch } from 'firebase/firestore';
import { db, appId } from '../services/firebase';
// @ts-ignore
import ConfirmationModal from '../components/ConfirmationModal';
// @ts-ignore
import InfoModal from '../components/InfoModal';
// @ts-ignore
import CategoryManagerModal from '../components/CategoryManagerModal';

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';

import { SHOP_ID as CURRENT_SHOP_ID } from '../utils/constants';

import SortableProductItem from '../components/products/SortableProductItem';
import { Product } from '../types';

import { useOutletContext } from 'react-router-dom';
import { DashboardContextType } from '../types';
import { usePermissions } from '../hooks/usePermissions';
import { PERMISSIONS } from '../utils/roles';

const Products: React.FC = () => {
    const { products, categories } = useOutletContext<DashboardContextType>();

    // 🔥 PERMISSION CHECK
    const { hasPermission } = usePermissions();
    const canEdit = hasPermission(PERMISSIONS.PRODUCT_MANAGE);

    const activeCats = categories && categories.length > 0 ? categories : [{ id: 'def', name: 'Tümü' }];

    const [localProducts, setLocalProducts] = useState<Product[]>([]);
    const [newProduct, setNewProduct] = useState<{ name: string; price: string; category: string; image: string }>({ name: '', price: '', category: '', image: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('Tümü');
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isCatManagerOpen, setIsCatManagerOpen] = useState(false);
    const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
    const [optionData, setOptionData] = useState({ productId: '', name: '', priceDiff: '' });
    const [saving, setSaving] = useState(false);
    const [infoModal, setInfoModal] = useState<{
        isOpen: boolean;
        type: 'success' | 'error' | 'warning' | 'info';
        title: string;
        message: string;
    }>({
        isOpen: false,
        type: 'success',
        title: '',
        message: ''
    });
    const [toast, setToast] = useState<string | null>(null);
    const [gridCols, setGridCols] = useState(4);

    useEffect(() => {
        if (categories && categories.length > 0 && !newProduct.category) {
            setNewProduct(prev => ({ ...prev, category: categories[0].name }));
        }
    }, [categories]);

    useEffect(() => {
        if (products) {
            const sorted = [...products].sort((a, b) => (a.order || 9999) - (b.order || 9999));
            setLocalProducts(sorted);
        }
    }, [products]);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const getCategoryIcon = (cat: string) => {
        if (!cat) return <Tag className="text-slate-400" />;
        if (cat.includes('Sıcak')) return <Coffee className="text-amber-500" />;
        if (cat.includes('Soğuk')) return <CupSoda className="text-blue-400" />;
        if (cat.includes('Tatlı')) return <IceCream className="text-pink-400" />;
        if (cat.includes('Yiyecek') || cat.includes('Atıştırma')) return <Utensils className="text-orange-400" />;
        return <Tag className="text-slate-400" />;
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setLocalProducts((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);
                const newOrderList = arrayMove(items, oldIndex, newIndex);
                saveNewOrder(newOrderList);
                return newOrderList;
            });
        }
    };

    const saveNewOrder = async (items: Product[]) => {
        try {
            const batch = writeBatch(db);
            items.forEach((item, index) => {
                const ref = doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'products', item.id);
                batch.update(ref, { order: index + 1 });
            });
            await batch.commit();
        } catch (error) {
            console.error("Sıralama hatası:", error);
            setToast('Sıralama kaydedilemedi!');
        }
    };

    const handleAddProduct = async () => {
        if (!canEdit) return;
        if (!newProduct.name.trim() || newProduct.price === '') {
            return setInfoModal({ isOpen: true, type: 'warning', title: 'Eksik Bilgi', message: 'Bilgileri doldurunuz.' });
        }
        setSaving(true);
        try {
            const maxOrder = localProducts.length > 0 ? Math.max(...localProducts.map(p => p.order || 0)) : 0;
            await addDoc(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'products'), {
                name: newProduct.name,
                price: Number(newProduct.price),
                category: newProduct.category || activeCats[0]?.name,
                image: newProduct.image || '',
                sold: 0,
                options: [],
                order: maxOrder + 1
            });
            setNewProduct({ name: '', price: '', category: activeCats[0]?.name || '', image: '' });
            setIsFormOpen(false);
            setToast('Ürün eklendi');
        } catch (error) {
            console.error(error);
            setInfoModal({ isOpen: true, type: 'error', title: 'Hata', message: 'Kayıt yapılamadı.' });
        } finally {
            setSaving(false);
        }
    };

    const handleAddOption = async () => {
        if (!canEdit) return;
        if (!optionData.productId || !optionData.name || optionData.priceDiff === '') {
            return setInfoModal({ isOpen: true, type: 'warning', title: 'Eksik Bilgi', message: 'Bilgileri doldurunuz.' });
        }
        setSaving(true);
        try {
            const productRef = doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'products', optionData.productId);
            await updateDoc(productRef, {
                options: arrayUnion({
                    id: Date.now().toString(),
                    name: optionData.name,
                    priceDiff: Number(optionData.priceDiff)
                })
            });
            setOptionData({ productId: '', name: '', priceDiff: '' });
            setIsOptionModalOpen(false);
            setToast('Özel seçenek eklendi');
        } catch (error) {
            console.error(error);
            setInfoModal({ isOpen: true, type: 'error', title: 'Hata', message: 'Hata oluştu.' });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteOption = async (productId: string, optionObj: any) => {
        if (!canEdit) return;
        try {
            await updateDoc(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'products', productId), {
                options: arrayRemove(optionObj)
            });
            setToast('Özel seçenek silindi');
        } catch (error) {
            console.error(error);
            setInfoModal({ isOpen: true, type: 'error', title: 'Hata', message: 'Silinemedi.' });
        }
    };

    const handleUpdateProduct = async (id: string, field: string, value: any) => {
        if (!canEdit) return;
        const val = field === 'price' ? Number(value) : value;
        try {
            await updateDoc(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'products', id), { [field]: val });
        } catch (error) {
            console.error(error);
        }
    };

    const confirmDelete = async () => {
        if (!canEdit || !deleteId) return;
        try {
            await deleteDoc(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'products', deleteId));
            setDeleteId(null);
        } catch (error) {
            setInfoModal({ isOpen: true, type: 'error', title: 'Hata', message: 'Silinemedi.' });
        }
    };

    const filteredAndSortedProducts = useMemo(() => {
        return localProducts.filter(p =>
            (activeCategory === 'Tümü' || p.category === activeCategory) &&
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [localProducts, activeCategory, searchTerm]);

    return (
        <div className="min-h-screen bg-[#020617] relative overflow-hidden text-slate-200">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 pb-32 relative z-10">

                {/* Modals */}
                <ConfirmationModal
                    isOpen={!!deleteId}
                    onClose={() => setDeleteId(null)}
                    onConfirm={confirmDelete}
                    title="Ürünü Sil"
                    message="Bu ürünü silmek istediğinize emin misiniz?"
                    type="danger"
                    confirmText="Sil"
                    loading={false}
                />
                <InfoModal
                    isOpen={infoModal.isOpen}
                    onClose={() => setInfoModal({ ...infoModal, isOpen: false })}
                    type={infoModal.type}
                    title={infoModal.title}
                    message={infoModal.message}
                />
                <CategoryManagerModal
                    isOpen={isCatManagerOpen}
                    onClose={() => setIsCatManagerOpen(false)}
                    currentCategories={categories}
                />

                {/* Toast Notification */}
                {toast && (
                    <div className="fixed bottom-6 right-6 z-[100] bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-slate-700/50 flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 backdrop-blur-xl">
                        <div className="bg-emerald-500/20 p-2 rounded-full">
                            <CheckCircle2 className="text-emerald-400" size={20} />
                        </div>
                        <span className="font-bold text-sm">{toast}</span>
                        <button
                            onClick={() => setToast(null)}
                            className="ml-2 text-slate-500 hover:text-white transition-colors p-1 hover:bg-slate-700/50 rounded-lg"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pb-8 border-b border-white/5">
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                                <div className="relative bg-slate-900 p-3.5 rounded-2xl border border-white/10 shadow-xl">
                                    <Package size={28} className="text-indigo-400" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                                    Menü Yönetimi
                                </h1>
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="flex items-center gap-2 bg-slate-900/50 backdrop-blur-sm px-3 py-1 rounded-full border border-white/5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                        <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                                            {localProducts?.length || 0} Ürün
                                        </span>
                                    </div>
                                    {localProducts?.length > 0 && (
                                        <div className="flex items-center gap-2 bg-emerald-500/10 backdrop-blur-sm px-3 py-1 rounded-full border border-emerald-500/20">
                                            <TrendingUp size={12} className="text-emerald-400" />
                                            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                                {localProducts.reduce((sum, p) => sum + (p.sold || 0), 0)} Satış
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        {!canEdit && (
                            <div className="flex-1 md:flex-none bg-slate-900/40 backdrop-blur-md border border-white/10 text-slate-400 px-5 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-3">
                                <Eye size={16} className="text-indigo-400" />
                                SADECE GÖRÜNTÜLEME
                            </div>
                        )}
                        {canEdit && (
                            <>
                                <button
                                    onClick={() => setIsCatManagerOpen(true)}
                                    className="flex-1 md:flex-none px-5 py-3 rounded-2xl font-bold text-sm bg-slate-900/40 hover:bg-slate-800/60 text-slate-300 border border-white/5 hover:border-white/10 transition-all flex items-center justify-center gap-2.5 shadow-lg group"
                                >
                                    <LayoutList size={18} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                                    Kategoriler
                                </button>

                                <button
                                    onClick={() => setIsOptionModalOpen(true)}
                                    className="flex-1 md:flex-none px-5 py-3 rounded-2xl font-bold text-sm bg-slate-900/40 hover:bg-slate-800/60 text-slate-300 border border-white/5 hover:border-white/10 transition-all flex items-center justify-center gap-2.5 shadow-lg group"
                                >
                                    <ListPlus size={18} className="text-violet-400 group-hover:scale-110 transition-transform" />
                                    Seçenekler
                                </button>

                                <button
                                    onClick={() => setIsFormOpen(!isFormOpen)}
                                    className={`w-full md:w-auto px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-xl flex items-center justify-center gap-2.5 relative overflow-hidden group ${isFormOpen
                                        ? 'bg-slate-800 text-slate-400 border border-white/5'
                                        : 'bg-gradient-to-r from-indigo-600 to-violet-700 text-white border border-white/10 hover:shadow-indigo-500/20'
                                        }`}
                                >
                                    {!isFormOpen && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    )}
                                    <span className="relative flex items-center gap-2.5">
                                        {isFormOpen ? (
                                            <>
                                                <X size={18} /> Vazgeç
                                            </>
                                        ) : (
                                            <>
                                                <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" /> Yeni Ürün
                                            </>
                                        )}
                                    </span>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Option Modal */}
                {isOptionModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/80 backdrop-blur-xl animate-in fade-in duration-300">
                        <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                            <div className="p-8 space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-violet-500/10 p-2.5 rounded-2xl border border-violet-500/20">
                                            <Settings className="text-violet-400" size={24} />
                                        </div>
                                        <h3 className="text-xl font-bold text-white tracking-tight">Yeni Seçenek</h3>
                                    </div>
                                    <button
                                        onClick={() => setIsOptionModalOpen(false)}
                                        className="p-2.5 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all border border-transparent hover:border-white/10"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] ml-1">Hedef Ürün</label>
                                        <select
                                            value={optionData.productId}
                                            onChange={(e) => setOptionData({ ...optionData, productId: e.target.value })}
                                            className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-white outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all cursor-pointer"
                                        >
                                            <option value="">Ürün Seçiniz...</option>
                                            {localProducts.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] ml-1">Seçenek İsmi</label>
                                        <input
                                            type="text"
                                            placeholder="Ör: Ekstra Shot"
                                            value={optionData.name}
                                            onChange={(e) => setOptionData({ ...optionData, name: e.target.value })}
                                            className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-white outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all placeholder:text-slate-700"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] ml-1">Fiyat Farkı (₺)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">₺</span>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                value={optionData.priceDiff}
                                                onChange={(e) => setOptionData({ ...optionData, priceDiff: e.target.value })}
                                                className="w-full bg-slate-950 border border-white/5 rounded-2xl pl-10 pr-4 py-4 text-white outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-mono"
                                                step="0.01"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => setIsOptionModalOpen(false)}
                                        className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-[1.25rem] font-bold transition-all border border-white/5"
                                    >
                                        Vazgeç
                                    </button>
                                    <button
                                        onClick={handleAddOption}
                                        disabled={saving}
                                        className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-violet-700 hover:from-indigo-500 hover:to-violet-600 text-white rounded-[1.25rem] font-bold shadow-xl shadow-indigo-500/10 flex justify-center items-center gap-3 transition-all disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                        Kaydet
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Product Form */}
                {isFormOpen && canEdit && (
                    <div className="relative group/form">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-[2.5rem] blur opacity-10 group-hover/form:opacity-20 transition duration-1000"></div>
                        <div className="relative bg-slate-900/40 backdrop-blur-md border border-white/5 p-8 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-top-4 duration-500">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="bg-indigo-500/10 p-2.5 rounded-2xl border border-indigo-500/20">
                                    <Sparkles className="text-indigo-400" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-xl tracking-tight">Yeni Ürün Ekle</h3>
                                    <p className="text-slate-500 text-xs mt-0.5">Lütfen ürün detaylarını giriniz</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                                <div className="md:col-span-4 space-y-2">
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] ml-1">Ürün İsmi</label>
                                    <input
                                        type="text"
                                        placeholder="Ör: Iced Americano"
                                        value={newProduct.name}
                                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                        className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-700"
                                    />
                                </div>

                                <div className="md:col-span-3 space-y-2">
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] ml-1">Kategori</label>
                                    <select
                                        value={newProduct.category}
                                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                        className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer"
                                    >
                                        {activeCats.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                                    </select>
                                </div>

                                <div className="md:col-span-3 space-y-2">
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] ml-1">Satış Fiyatı</label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">₺</span>
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={newProduct.price}
                                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                            className="w-full bg-slate-950/50 border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-white outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-mono font-bold"
                                            step="0.01"
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-12 space-y-2 mt-4">
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] ml-1">Görsel (Image URL)</label>
                                    <input
                                        type="text"
                                        placeholder="https://... (İsteğe bağlı)"
                                        value={newProduct.image}
                                        onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                                        className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-700"
                                    />
                                </div>

                                <div className="md:col-span-12 mt-4">
                                    <button
                                        onClick={handleAddProduct}
                                        disabled={saving}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/10 active:scale-[0.98] transition-all disabled:opacity-50"
                                    >
                                        {saving ? (
                                            <Loader2 className="animate-spin" size={20} />
                                        ) : (
                                            <>
                                                <Save size={20} /> Kaydet
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search & Filter Section */}
                <div className="space-y-6 sticky top-0 z-20 bg-[#020617]/80 backdrop-blur-xl -mx-4 px-4 py-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Search Bar */}
                        <div className="relative w-full lg:w-96 shrink-0 group">
                            <div className="absolute inset-0 bg-indigo-500/10 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity" />
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Ürünlerde veya kategorilerde ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-900 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-white text-sm outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600 relative z-10"
                            />
                        </div>

                        {/* Grid View Switcher */}
                        <div className="flex items-center gap-1 bg-slate-900 border border-white/5 p-1 rounded-2xl w-full lg:w-auto">
                            {[2, 3, 4].map((num) => (
                                <button
                                    key={num}
                                    onClick={() => setGridCols(num)}
                                    className={`flex-1 lg:flex-none px-4 py-3 rounded-xl text-xs font-black transition-all ${gridCols === num
                                        ? 'bg-indigo-600 text-white shadow-lg'
                                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                        }`}
                                >
                                    {num}'lü
                                </button>
                            ))}
                        </div>

                        {/* Category Tabs */}
                        <div className="flex-1 overflow-x-auto custom-scrollbar-hide pb-2">
                            <div className="flex gap-3 min-w-max pr-4">
                                <button
                                    onClick={() => setActiveCategory('Tümü')}
                                    className={`px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.15em] transition-all duration-300 border ${activeCategory === 'Tümü'
                                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                                        : 'bg-slate-900/40 border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/10'
                                        }`}
                                >
                                    Tümü
                                </button>
                                {activeCats.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveCategory(cat.name)}
                                        className={`px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.15em] flex items-center gap-3 transition-all duration-300 border ${activeCategory === cat.name
                                            ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-600/20'
                                            : 'bg-slate-900/40 border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/10'
                                            }`}
                                    >
                                        <span className={activeCategory === cat.name ? 'text-white' : 'text-slate-600'}>
                                            {getCategoryIcon(cat.name)}
                                        </span>
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={filteredAndSortedProducts} strategy={rectSortingStrategy}>
                        <div className={`grid gap-4 md:gap-8 ${gridCols === 2
                                ? 'grid-cols-2'
                                : gridCols === 3
                                    ? 'grid-cols-2 md:grid-cols-3'
                                    : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                            }`}>
                            {filteredAndSortedProducts.map((product) => (
                                <SortableProductItem
                                    key={product.id}
                                    product={product}
                                    canEdit={canEdit}
                                    getCategoryIcon={getCategoryIcon}
                                    handleUpdateProduct={handleUpdateProduct}
                                    handleDeleteOption={handleDeleteOption}
                                    setDeleteId={setDeleteId}
                                    categories={activeCats}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

                {/* Empty State */}
                {(!filteredAndSortedProducts || filteredAndSortedProducts.length === 0) && (
                    <div className="relative text-center py-24 bg-gradient-to-br from-slate-800/20 via-slate-800/10 to-slate-900/20 rounded-3xl border border-dashed border-slate-700/50 backdrop-blur-sm overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5" />
                        <div className="relative">
                            <div className="mx-auto w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-6">
                                <Package size={40} className="text-slate-600" />
                            </div>
                            <h3 className="text-slate-300 font-bold text-xl mb-2">Henüz ürün yok</h3>
                            <p className="text-slate-600 text-sm max-w-sm mx-auto">
                                {canEdit
                                    ? 'Eklediğiniz ürünler tüm personelde görünecektir.'
                                    : 'Ürünler yükleniyor veya henüz eklenmemiş.'}
                            </p>
                            {canEdit && !isFormOpen && (
                                <button
                                    onClick={() => setIsFormOpen(true)}
                                    className="mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold flex items-center gap-2 mx-auto shadow-lg shadow-indigo-900/30 transition-all"
                                >
                                    <Plus size={18} /> İlk Ürünü Ekle
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
