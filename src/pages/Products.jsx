// pages/Products.jsx (PROFESYONEL, MOBİL UYUMLU, DND VE DİNAMİK KATEGORİLİ ✅)

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Trash2, Coffee, Tag, Eye, IceCream, CupSoda, Utensils, Grid, Save, Loader2, ListPlus, Settings, X, CheckCircle2, GripVertical, LayoutList, MoreVertical } from 'lucide-react';
import { addDoc, deleteDoc, updateDoc, doc, collection, arrayUnion, arrayRemove, writeBatch } from 'firebase/firestore'; 
import { db, appId } from '../services/firebase'; 
import ConfirmationModal from '../components/ConfirmationModal';
import InfoModal from '../components/InfoModal';
import CategoryManagerModal from '../components/CategoryManagerModal'; 
import { formatCurrency } from '../utils/helpers';

// DnD Kit
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const CURRENT_SHOP_ID = 'motto_coffee_sube_01';

// --- SÜRÜKLENEBİLİR KART BİLEŞENİ ---
const SortableProductItem = ({ product, canEdit, getCategoryIcon, handleUpdateProduct, handleDeleteOption, setDeleteId, categories }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: product.id, disabled: !canEdit });
    
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.8 : 1,
        scale: isDragging ? 1.05 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className={`group bg-slate-800 rounded-2xl border ${isDragging ? 'border-indigo-500 shadow-2xl bg-slate-800/90' : 'border-slate-700'} p-4 relative flex flex-col justify-between h-full touch-manipulation`}>
            
            {/* Sürükleme Tutamacı */}
            {canEdit && (
                <div {...attributes} {...listeners} className="absolute top-3 right-3 p-2 text-slate-600 hover:text-indigo-400 cursor-grab active:cursor-grabbing hover:bg-slate-700/50 rounded-lg touch-none z-10">
                    <GripVertical size={20} />
                </div>
            )}

            {/* Üst Kısım: İkon ve Kategori */}
            <div className="flex items-start gap-3 mb-3 pr-8">
                <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-700/50 text-indigo-400 shrink-0">
                    {getCategoryIcon(product.category)}
                </div>
                <div className="min-w-0 flex-1">
                    {canEdit ? (
                        <select 
                            value={product.category} 
                            onChange={(e) => handleUpdateProduct(product.id, 'category', e.target.value)} 
                            className="bg-transparent text-[10px] text-slate-500 font-bold uppercase w-full outline-none cursor-pointer hover:text-indigo-400 -ml-1 py-1"
                        >
                            {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                        </select>
                    ) : (
                        <p className="text-[10px] text-slate-500 font-bold uppercase truncate">{product.category}</p>
                    )}
                    
                    {/* Ürün İsmi */}
                    {canEdit ? (
                        <input type="text" value={product.name} onChange={(e) => handleUpdateProduct(product.id, 'name', e.target.value)} className="bg-transparent w-full text-white font-bold text-sm outline-none border-b border-transparent focus:border-indigo-500 transition-all placeholder:text-slate-600"/>
                    ) : (
                        <h4 className="text-white font-bold text-sm line-clamp-2 leading-tight">{product.name}</h4>
                    )}
                </div>
            </div>

            {/* Seçenekler (Chips) */}
            {product.options && product.options.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                    {product.options.map((opt, i) => (
                        <span key={i} className="text-[10px] bg-slate-700/50 text-slate-300 px-2 py-1 rounded-lg border border-slate-600/50 flex items-center gap-1">
                            {opt.name}
                            {canEdit && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteOption(product.id, opt); }} 
                                    className="text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-full p-0.5 transition-colors"
                                >
                                    <X size={10} strokeWidth={3} />
                                </button>
                            )}
                        </span>
                    ))}
                </div>
            )}

            {/* Alt Kısım: Fiyat ve Silme */}
            <div className="mt-auto pt-3 border-t border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-1 text-emerald-400">
                    {canEdit ? (
                        <>
                            <span className="text-xs font-bold">₺</span>
                            <input type="number" value={product.price} onChange={(e) => handleUpdateProduct(product.id, 'price', e.target.value)} className="bg-transparent w-20 text-lg font-bold outline-none border-b border-transparent focus:border-emerald-500 font-mono"/>
                        </>
                    ) : (
                        <span className="text-lg font-bold font-mono">{formatCurrency(product.price)} ₺</span>
                    )}
                </div>
                
                {canEdit && (
                    <button onClick={() => setDeleteId(product.id)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-colors" title="Ürünü Sil">
                        <Trash2 size={18}/>
                    </button>
                )}
            </div>
        </div>
    );
};

// --- ANA COMPONENT ---
const Products = ({ products, userRole, canEdit, categories }) => { 
    
    // Varsayılan kategori (Veri yüklenene kadar boş kalmasın diye)
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

    // Senkronizasyon
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

    // Toast Timer
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // DnD Sensors (Mobilde kaydırmayı engellememesi için ayarlandı)
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), 
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const getCategoryIcon = (cat) => {
        if (!cat) return <Tag size={20}/>;
        if (cat.includes('Sıcak')) return <Coffee size={20}/>;
        if (cat.includes('Soğuk')) return <CupSoda size={20}/>;
        if (cat.includes('Tatlı')) return <IceCream size={20}/>;
        if (cat.includes('Yiyecek')) return <Utensils size={20}/>;
        return <Tag size={20}/>;
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
        } catch (error) { console.error("Sıralama hatası:", error); setToast('Sıralama kaydedilemedi!'); }
    };

    const handleAddProduct = async () => {
        if (!canEdit) return;
        if (!newProduct.name.trim() || newProduct.price === '') return setInfoModal({ isOpen: true, type: 'warning', title: 'Eksik Bilgi', message: 'Bilgileri doldurunuz.' });
        setSaving(true);
        try {
            const maxOrder = localProducts.length > 0 ? Math.max(...localProducts.map(p => p.order || 0)) : 0;
            await addDoc(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'products'), {
                name: newProduct.name, price: Number(newProduct.price), category: newProduct.category || activeCats[0]?.name, sold: 0, options: [], order: maxOrder + 1
            });
            setNewProduct({ name: '', price: '', category: activeCats[0]?.name || '' });
            setIsFormOpen(false);
            setToast('Ürün başarıyla eklendi');
        } catch (error) { console.error(error); setInfoModal({ isOpen: true, type: 'error', title: 'Hata', message: 'Kayıt yapılamadı.' }); } finally { setSaving(false); }
    };

    const handleAddOption = async () => {
        if (!canEdit) return;
        if (!optionData.productId || !optionData.name || optionData.priceDiff === '') return setInfoModal({ isOpen: true, type: 'warning', title: 'Eksik Bilgi', message: 'Bilgileri doldurunuz.' });
        setSaving(true);
        try {
            const productRef = doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'products', optionData.productId);
            await updateDoc(productRef, { options: arrayUnion({ id: Date.now().toString(), name: optionData.name, priceDiff: Number(optionData.priceDiff) }) });
            setOptionData({ productId: '', name: '', priceDiff: '' });
            setIsOptionModalOpen(false);
            setToast('Özel seçenek eklendi');
        } catch (error) { console.error(error); setInfoModal({ isOpen: true, type: 'error', title: 'Hata', message: 'Hata oluştu.' }); } finally { setSaving(false); }
    };

    const handleDeleteOption = async (productId, optionObj) => {
        if (!canEdit) return;
        try {
            await updateDoc(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'products', productId), { options: arrayRemove(optionObj) });
            setToast('Seçenek silindi');
        } catch (error) { console.error(error); setInfoModal({ isOpen: true, type: 'error', title: 'Hata', message: 'Silinemedi.' }); }
    };

    const handleUpdateProduct = async (id, field, value) => {
        if (!canEdit) return;
        const val = field === 'price' ? Number(value) : value;
        try { await updateDoc(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'products', id), { [field]: val }); } catch (error) { console.error(error); }
    };

    const confirmDelete = async () => {
        if (!canEdit || !deleteId) return;
        try { await deleteDoc(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'products', deleteId)); setDeleteId(null); setToast('Ürün silindi'); } catch (error) { setInfoModal({ isOpen: true, type: 'error', title: 'Hata', message: 'Silinemedi.' }); }
    };

    const filteredAndSortedProducts = useMemo(() => {
        return localProducts.filter(p => 
            (activeCategory === 'Tümü' || p.category === activeCategory) &&
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [localProducts, activeCategory, searchTerm]);

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-24 relative">
            
            <ConfirmationModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={confirmDelete} title="Ürünü Sil" message="Bu ürünü silmek istediğinize emin misiniz?" type="danger"/>
            <InfoModal isOpen={infoModal.isOpen} onClose={() => setInfoModal({ ...infoModal, isOpen: false })} type={infoModal.type} title={infoModal.title} message={infoModal.message}/>
            <CategoryManagerModal isOpen={isCatManagerOpen} onClose={() => setIsCatManagerOpen(false)} currentCategories={categories} />

            {/* TOAST BİLDİRİM */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-[100] bg-slate-800 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <CheckCircle2 className="text-emerald-400" size={20} /><span className="font-bold text-sm">{toast}</span><button onClick={() => setToast(null)} className="ml-2 text-slate-500 hover:text-white"><X size={14}/></button>
                </div>
            )}

            {/* ÜST BAR: Başlık ve Butonlar */}
            <div className="flex flex-col lg:flex-row justify-between items-end gap-4 border-b border-slate-800 pb-6">
                <div>
                    <h2 className="text-3xl font-black text-white flex items-center gap-3"><Coffee className="text-indigo-500" size={32}/> Menü Yönetimi</h2>
                    <p className="text-slate-400 text-sm mt-1">Toplam <span className="text-white font-bold">{localProducts?.length || 0}</span> çeşit ürün.</p>
                </div>
                
                <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                    {!canEdit && ( <div className="bg-slate-800 border border-slate-700 text-slate-400 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm"><Eye size={16} className="text-indigo-400"/> Görüntüleme Modu</div> )}
                    {canEdit && (
                        <>
                            <button onClick={() => setIsCatManagerOpen(true)} className="flex-1 lg:flex-none px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-indigo-500/30 transition-all shadow-lg text-sm active:scale-95">
                                <LayoutList size={18}/> Kategori
                            </button>
                            <button onClick={() => setIsOptionModalOpen(true)} className="flex-1 lg:flex-none px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700 hover:border-indigo-500/50 transition-all shadow-lg text-sm active:scale-95">
                                <ListPlus size={18}/> Seçenek
                            </button>
                            <button onClick={() => setIsFormOpen(!isFormOpen)} className={`flex-1 lg:flex-none px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg text-sm active:scale-95 ${isFormOpen ? 'bg-slate-700 text-slate-300' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20'}`}>
                                {isFormOpen ? <Grid size={18}/> : <Plus size={18}/>} {isFormOpen ? 'Listeye Dön' : 'Yeni Ürün'}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* MODAL: SEÇENEK EKLE */}
            {isOptionModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2"><Settings className="text-purple-400"/> Seçenek Ekle</h3>
                            <button onClick={() => setIsOptionModalOpen(false)}><X className="text-slate-500 hover:text-white"/></button>
                        </div>
                        <div className="space-y-4">
                            <div><label className="text-xs text-slate-400 font-bold block mb-1">Hangi Ürüne?</label><select value={optionData.productId} onChange={(e) => setOptionData({...optionData, productId: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-purple-500"><option value="">Ürün Seçiniz...</option>{localProducts.map(p => ( <option key={p.id} value={p.id}>{p.name}</option> ))}</select></div>
                            <div><label className="text-xs text-slate-400 font-bold block mb-1">Seçenek Adı</label><input type="text" value={optionData.name} onChange={(e) => setOptionData({...optionData, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-purple-500"/></div>
                            <div><label className="text-xs text-slate-400 font-bold block mb-1">Fiyat Farkı (TL)</label><input type="number" placeholder="0" value={optionData.priceDiff} onChange={(e) => setOptionData({...optionData, priceDiff: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-purple-500"/></div>
                            <button onClick={handleAddOption} disabled={saving} className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-lg mt-2">{saving ? <Loader2 className="animate-spin mx-auto"/> : 'Kaydet'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* FORM: ÜRÜN EKLE */}
            {isFormOpen && canEdit && (
                <div className="bg-slate-800/60 p-6 rounded-2xl border border-indigo-500/30 shadow-2xl animate-in slide-in-from-top-4 backdrop-blur">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-lg">✨ Yeni Ürün Bilgileri</h3>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-4"><label className="text-xs text-slate-400 ml-1 mb-1 block font-bold uppercase">Ürün Adı <span className="text-red-500">*</span></label><input type="text" placeholder="Örn: Iced Latte" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"/></div>
                        <div className="md:col-span-3"><label className="text-xs text-slate-400 ml-1 mb-1 block font-bold uppercase">Kategori</label><select value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-all">{activeCats.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}</select></div>
                        <div className="md:col-span-3"><label className="text-xs text-slate-400 ml-1 mb-1 block font-bold uppercase">Satış Fiyatı <span className="text-red-500">*</span></label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₺</span><input type="number" placeholder="0.00" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-xl pl-8 pr-4 py-3 text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono font-bold"/></div></div>
                        <div className="md:col-span-2"><button onClick={handleAddProduct} disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 active:scale-95 transition-all disabled:opacity-50">{saving ? <Loader2 className="animate-spin" size={18}/> : <><Save size={18}/> Kaydet</>}</button></div>
                    </div>
                </div>
            )}

            {/* FİLTRELEME (MOBİL UYUMLU KAYDIRMA) */}
            <div className="space-y-4 sticky top-0 z-20 bg-[#0f172a]/95 backdrop-blur py-3 -mx-4 px-4 md:mx-0 md:px-0">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative w-full md:w-64 shrink-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18}/>
                        <input type="text" placeholder="Menüde ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-indigo-500 transition-all"/>
                    </div>
                    <div className="flex-1 overflow-x-auto custom-scrollbar pb-1">
                        <div className="flex gap-2">
                            <button onClick={() => setActiveCategory('Tümü')} className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeCategory === 'Tümü' ? 'bg-white text-slate-900 shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}>Tümü</button>
                            {activeCats.map(cat => (
                                <button key={cat.id} onClick={() => setActiveCategory(cat.name)} className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap flex items-center gap-2 transition-all ${activeCategory === cat.name ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}>
                                    {getCategoryIcon(cat.name)} {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ÜRÜN GRID (DND ILE) */}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={filteredAndSortedProducts} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
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

            {(!filteredAndSortedProducts || filteredAndSortedProducts.length === 0) && (
                <div className="text-center py-20 bg-slate-800/30 rounded-3xl border border-dashed border-slate-700">
                    <Coffee size={48} className="mx-auto mb-4 text-slate-600 opacity-50"/>
                    <h3 className="text-slate-400 font-bold text-lg">Menü henüz boş.</h3>
                    <p className="text-slate-600 text-sm mt-2">{canEdit ? 'Yeni ürün ekleyerek başlayın.' : 'Ürünler yükleniyor...'}</p>
                </div>
            )}
        </div>
    );
};

export default Products;