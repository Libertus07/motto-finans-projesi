// pages/Products.jsx (PREMIUM & MODERN DESIGN ✨)

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Trash2, Coffee, Tag, Eye, IceCream, CupSoda, Utensils, Grid, Save, Loader2, ListPlus, Settings, X, CheckCircle2, GripVertical, LayoutList, Sparkles, TrendingUp, Package } from 'lucide-react';
import { addDoc, deleteDoc, updateDoc, doc, collection, arrayUnion, arrayRemove, writeBatch } from 'firebase/firestore'; 
import { db, appId } from '../services/firebase'; 
import ConfirmationModal from '../components/ConfirmationModal';
import InfoModal from '../components/InfoModal';
import CategoryManagerModal from '../components/CategoryManagerModal';
import { formatCurrency } from '../utils/helpers';

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const CURRENT_SHOP_ID = 'motto_coffee_sube_01';

// --- SORTABLE PRODUCT COMPONENT (PREMIUM DESIGN) ---
const SortableProductItem = ({ product, canEdit, getCategoryIcon, handleUpdateProduct, handleDeleteOption, setDeleteId, categories }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: product.id, disabled: !canEdit });
    const style = { 
        transform: CSS.Transform.toString(transform), 
        transition, 
        zIndex: isDragging ? 50 : 'auto', 
        opacity: isDragging ? 0.7 : 1 
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            className={`group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl border transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 ${
                isDragging 
                    ? 'border-indigo-500 shadow-2xl scale-105 ring-2 ring-indigo-500/50' 
                    : 'border-slate-700/50 hover:border-indigo-500/40'
            }`}
        >
            {/* Drag Handle */}
            {canEdit && (
                <div 
                    {...attributes} 
                    {...listeners} 
                    className="absolute top-3 right-3 p-2 text-slate-600 hover:text-indigo-400 cursor-grab active:cursor-grabbing hover:bg-slate-700/50 rounded-lg touch-none z-10 transition-all"
                >
                    <GripVertical size={18} />
                </div>
            )}

            <div className="p-5 space-y-4">
                {/* Header: Icon + Category */}
                <div className="flex justify-between items-start pr-8">
                    <div className="relative">
                        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 p-3 rounded-xl border border-slate-700/50 group-hover:border-indigo-500/30 transition-all duration-300">
                            {getCategoryIcon(product.category)}
                        </div>
                        {product.sold > 0 && (
                            <div className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                                {product.sold}
                            </div>
                        )}
                    </div>
                    
                    {canEdit ? (
                        <select 
                            value={product.category} 
                            onChange={(e) => handleUpdateProduct(product.id, 'category', e.target.value)} 
                            className="bg-slate-900/50 text-[10px] text-slate-400 font-bold uppercase px-2 py-1 rounded-lg outline-none cursor-pointer hover:text-indigo-400 hover:bg-slate-800/50 border border-slate-700/50 transition-all"
                        >
                            {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                        </select>
                    ) : (
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider bg-slate-900/30 px-2 py-1 rounded-lg">
                            {product.category}
                        </span>
                    )}
                </div>

                {/* Product Name */}
                <div className="min-h-[3rem]">
                    {canEdit ? (
                        <input 
                            type="text" 
                            value={product.name} 
                            onChange={(e) => handleUpdateProduct(product.id, 'name', e.target.value)} 
                            className="bg-transparent w-full text-white font-bold text-base leading-tight outline-none border-b-2 border-transparent focus:border-indigo-500 transition-all placeholder:text-slate-600 py-1"
                            placeholder="Ürün adı"
                        />
                    ) : (
                        <h4 className="text-white font-bold text-base leading-tight line-clamp-2 group-hover:text-indigo-300 transition-colors">
                            {product.name}
                        </h4>
                    )}
                </div>

                {/* Options */}
                {product.options && product.options.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {product.options.map((opt, i) => (
                            <span 
                                key={i} 
                                className="text-[10px] bg-slate-700/50 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-600/50 flex items-center gap-1.5 group/opt hover:bg-slate-700 transition-all"
                            >
                                <span className="font-semibold">{opt.name}</span>
                                <span className="text-emerald-400 font-bold">
                                    {opt.priceDiff > 0 ? '+' : ''}{opt.priceDiff}₺
                                </span>
                                {canEdit && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDeleteOption(product.id, opt); }} 
                                        className="text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-full p-0.5 transition-colors ml-1"
                                    >
                                        <X size={10} strokeWidth={3} />
                                    </button>
                                )}
                            </span>
                        ))}
                    </div>
                )}

                {/* Price & Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-700/30">
                    <div className="flex items-baseline gap-1">
                        {canEdit ? (
                            <div className="flex items-baseline gap-1">
                                <span className="text-emerald-400 text-sm font-bold">₺</span>
                                <input 
                                    type="number" 
                                    value={product.price} 
                                    onChange={(e) => handleUpdateProduct(product.id, 'price', e.target.value)} 
                                    className="bg-transparent w-20 text-emerald-400 text-xl font-black outline-none border-b-2 border-transparent focus:border-emerald-500 font-mono"
                                    step="0.01"
                                />
                            </div>
                        ) : (
                            <div className="flex items-baseline gap-1">
                                <span className="text-emerald-400 text-sm font-bold">₺</span>
                                <span className="text-emerald-400 text-2xl font-black font-mono">
                                    {formatCurrency(product.price).replace('₺','')}
                                </span>
                            </div>
                        )}
                    </div>
                    
                    {canEdit && (
                        <button 
                            onClick={() => setDeleteId(product.id)} 
                            className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100" 
                            title="Ürünü Sil"
                        >
                            <Trash2 size={16}/>
                        </button>
                    )}
                </div>
            </div>

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all duration-500 pointer-events-none" />
        </div>
    );
};

// --- ANA COMPONENT ---
const Products = ({ products, userRole, canEdit, categories }) => {
    
    const activeCats = categories && categories.length > 0 ? categories : [{id:'def', name:'Tümü'}];
    
    const [localProducts, setLocalProducts] = useState([]);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', category: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('Tümü');
    const [deleteId, setDeleteId] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isCatManagerOpen, setIsCatManagerOpen] = useState(false);
    const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
    const [optionData, setOptionData] = useState({ productId: '', name: '', priceDiff: '' });
    const [saving, setSaving] = useState(false);
    const [infoModal, setInfoModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if(categories && categories.length > 0 && !newProduct.category) {
            setNewProduct(prev => ({...prev, category: categories[0].name}));
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

    const getCategoryIcon = (cat) => {
        if (!cat) return <Tag className="text-slate-400" />;
        if (cat.includes('Sıcak')) return <Coffee className="text-amber-500" />;
        if (cat.includes('Soğuk')) return <CupSoda className="text-blue-400" />;
        if (cat.includes('Tatlı')) return <IceCream className="text-pink-400" />;
        if (cat.includes('Yiyecek') || cat.includes('Atıştırma')) return <Utensils className="text-orange-400" />;
        return <Tag className="text-slate-400" />;
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setLocalProducts((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);
                const newOrderList = arrayMove(items, oldIndex, newIndex);
                saveNewOrder(newOrderList);
                return newOrderList;
            });
        }
    };

    const saveNewOrder = async (items) => {
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
                sold: 0, 
                options: [], 
                order: maxOrder + 1
            });
            setNewProduct({ name: '', price: '', category: activeCats[0]?.name || '' });
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

    const handleDeleteOption = async (productId, optionObj) => {
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

    const handleUpdateProduct = async (id, field, value) => {
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
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
                
                {/* Modals */}
                <ConfirmationModal 
                    isOpen={!!deleteId} 
                    onClose={() => setDeleteId(null)} 
                    onConfirm={confirmDelete} 
                    title="Ürünü Sil" 
                    message="Bu ürünü silmek istediğinize emin misiniz?" 
                    type="danger"
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
                            <X size={16}/>
                        </button>
                    </div>
                )}

                {/* Header Section */}
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-3xl -z-10" />
                    
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 pb-6 border-b border-slate-800/50">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-lg shadow-indigo-500/20">
                                    <Coffee size={32} className="text-white"/>
                                </div>
                                <div>
                                    <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
                                        Menü Yönetimi
                                    </h2>
                                    <div className="flex items-center gap-3 mt-1">
                                        <p className="text-slate-400 text-sm">
                                            <span className="text-white font-bold">{localProducts?.length || 0}</span> ürün
                                        </p>
                                        {localProducts?.length > 0 && (
                                            <>
                                                <span className="text-slate-700">•</span>
                                                <p className="text-slate-400 text-sm flex items-center gap-1.5">
                                                    <TrendingUp size={14} className="text-emerald-400"/>
                                                    <span className="text-emerald-400 font-bold">
                                                        {localProducts.reduce((sum, p) => sum + (p.sold || 0), 0)}
                                                    </span> satış
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                            {!canEdit && (
                                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 text-slate-400 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg">
                                    <Eye size={16} className="text-indigo-400"/> 
                                    Görüntüleme Modu
                                </div>
                            )}
                            {canEdit && (
                                <>
                                    <button 
                                        onClick={() => setIsCatManagerOpen(true)} 
                                        className="px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 border border-slate-700/50 hover:border-indigo-500/30 transition-all shadow-lg backdrop-blur-sm text-sm group"
                                    >
                                        <LayoutList size={18} className="group-hover:scale-110 transition-transform"/> 
                                        Kategori
                                    </button>

                                    <button 
                                        onClick={() => setIsOptionModalOpen(true)} 
                                        className="px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 bg-slate-800/50 hover:bg-slate-800 text-indigo-400 border border-slate-700/50 hover:border-indigo-500/50 transition-all shadow-lg backdrop-blur-sm text-sm group"
                                    >
                                        <ListPlus size={18} className="group-hover:scale-110 transition-transform"/> 
                                        Seçenek
                                    </button>

                                    <button 
                                        onClick={() => setIsFormOpen(!isFormOpen)} 
                                        className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg text-sm group ${
                                            isFormOpen 
                                                ? 'bg-slate-700/50 text-slate-300 border border-slate-600/50' 
                                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-900/30 border border-indigo-500/20'
                                        }`}
                                    >
                                        {isFormOpen ? (
                                            <>
                                                <Grid size={18} className="group-hover:scale-110 transition-transform"/> 
                                                Listeye Dön
                                            </>
                                        ) : (
                                            <>
                                                <Plus size={18} className="group-hover:scale-110 transition-transform"/> 
                                                Yeni Ürün
                                            </>
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Option Modal */}
                {isOptionModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-xl">
                                        <Settings className="text-white" size={20}/>
                                    </div>
                                    Seçenek Ekle
                                </h3>
                                <button 
                                    onClick={() => setIsOptionModalOpen(false)}
                                    className="p-2 hover:bg-slate-700/50 rounded-lg text-slate-400 hover:text-white transition-all"
                                >
                                    <X size={20}/>
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-slate-400 font-bold block mb-2 uppercase tracking-wider">Hangi Ürüne?</label>
                                    <select 
                                        value={optionData.productId} 
                                        onChange={(e) => setOptionData({...optionData, productId: e.target.value})} 
                                        className="w-full bg-slate-800/50 border border-slate-600/50 rounded-xl p-3.5 text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all custom-scrollbar"
                                    >
                                        <option value="">Ürün Seçiniz...</option>
                                        {localProducts.map(p => ( <option key={p.id} value={p.id}>{p.name}</option> ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 font-bold block mb-2 uppercase tracking-wider">Seçenek Adı</label>
                                    <input 
                                        type="text" 
                                        placeholder="Ör: Ekstra Shot"
                                        value={optionData.name} 
                                        onChange={(e) => setOptionData({...optionData, name: e.target.value})} 
                                        className="w-full bg-slate-800/50 border border-slate-600/50 rounded-xl p-3.5 text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 font-bold block mb-2 uppercase tracking-wider">Fiyat Farkı (₺)</label>
                                    <input 
                                        type="number" 
                                        placeholder="0" 
                                        value={optionData.priceDiff} 
                                        onChange={(e) => setOptionData({...optionData, priceDiff: e.target.value})} 
                                        className="w-full bg-slate-800/50 border border-slate-600/50 rounded-xl p-3.5 text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono"
                                        step="0.01"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button 
                                        onClick={() => setIsOptionModalOpen(false)} 
                                        className="flex-1 py-3.5 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-xl font-bold transition-all border border-slate-700/50"
                                    >
                                        İptal
                                    </button>
                                    <button 
                                        onClick={handleAddOption} 
                                        disabled={saving} 
                                        className="flex-1 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-bold shadow-lg shadow-purple-900/30 flex justify-center items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {saving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} 
                                        Kaydet
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Product Form */}
                {isFormOpen && canEdit && (
                    <div className="relative bg-gradient-to-br from-slate-800/40 via-slate-800/30 to-slate-900/40 backdrop-blur-sm p-6 rounded-3xl border border-indigo-500/20 shadow-2xl shadow-indigo-500/5 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-3xl" />
                        
                        <div className="relative">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl">
                                    <Sparkles className="text-white" size={20}/>
                                </div>
                                <h3 className="font-bold text-white text-lg">Yeni Ürün Bilgileri</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                <div className="md:col-span-4">
                                    <label className="text-xs text-slate-400 ml-1 mb-2 block font-bold uppercase tracking-wider">
                                        Ürün Adı <span className="text-red-400">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder="Ör: Iced Latte" 
                                        value={newProduct.name} 
                                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} 
                                        className="w-full bg-slate-900/50 border border-slate-600/50 rounded-xl px-4 py-3.5 text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-600"
                                    />
                                </div>
                                
                                <div className="md:col-span-3">
                                    <label className="text-xs text-slate-400 ml-1 mb-2 block font-bold uppercase tracking-wider">
                                        Kategori
                                    </label>
                                    <select 
                                        value={newProduct.category} 
                                        onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} 
                                        className="w-full bg-slate-900/50 border border-slate-600/50 rounded-xl px-4 py-3.5 text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                    >
                                        {activeCats.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                                    </select>
                                </div>
                                
                                <div className="md:col-span-3">
                                    <label className="text-xs text-slate-400 ml-1 mb-2 block font-bold uppercase tracking-wider">
                                        Satış Fiyatı <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-bold text-lg">₺</span>
                                        <input 
                                            type="number" 
                                            placeholder="0.00" 
                                            value={newProduct.price} 
                                            onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} 
                                            className="w-full bg-slate-900/50 border border-slate-600/50 rounded-xl pl-9 pr-4 py-3.5 text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono font-bold"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                                
                                <div className="md:col-span-2">
                                    <button 
                                        onClick={handleAddProduct} 
                                        disabled={saving} 
                                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {saving ? (
                                            <Loader2 className="animate-spin" size={18}/>
                                        ) : (
                                            <>
                                                <Save size={18}/> Kaydet
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search & Filter Section */}
                <div className="space-y-4 sticky top-0 z-20 bg-gradient-to-b from-slate-950 via-slate-950 to-transparent pt-4 pb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search Bar */}
                        <div className="relative w-full sm:w-72 shrink-0">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18}/>
                            <input 
                                type="text" 
                                placeholder="Menüde ara..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                className="w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl pl-11 pr-4 py-3.5 text-white text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-500"
                            />
                        </div>
                        
                        {/* Category Tabs */}
                        <div className="flex-1 overflow-x-auto custom-scrollbar pb-2 -mb-2">
                            <div className="flex gap-2 min-w-max">
                                <button 
                                    onClick={() => setActiveCategory('Tümü')} 
                                    className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                                        activeCategory === 'Tümü' 
                                            ? 'bg-white text-slate-900 shadow-lg' 
                                            : 'bg-slate-800/50 backdrop-blur-sm text-slate-400 hover:bg-slate-700/50 hover:text-white border border-slate-700/50'
                                    }`}
                                >
                                    Tümü
                                </button>
                                {activeCats.map(cat => (
                                    <button 
                                        key={cat.id} 
                                        onClick={() => setActiveCategory(cat.name)} 
                                        className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap flex items-center gap-2.5 transition-all duration-200 ${
                                            activeCategory === cat.name 
                                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-900/30 scale-105' 
                                                : 'bg-slate-800/50 backdrop-blur-sm text-slate-400 hover:bg-slate-700/50 hover:text-white border border-slate-700/50'
                                        }`}
                                    >
                                        {getCategoryIcon(cat.name)} 
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
                                <Package size={40} className="text-slate-600"/>
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
                                    <Plus size={18}/> İlk Ürünü Ekle
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