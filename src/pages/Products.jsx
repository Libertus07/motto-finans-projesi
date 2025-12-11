// pages/Products.jsx (KESİN ÇÖZÜM - ADRES SABİTLENDİ)

import React, { useState, useMemo } from 'react';
import { Search, Plus, Trash2, Coffee, Tag, Eye, IceCream, CupSoda, Utensils, Grid, Save, Loader2 } from 'lucide-react';
import { addDoc, deleteDoc, updateDoc, doc, collection } from 'firebase/firestore';
import { db, appId, auth } from '../services/firebase'; 
import { CATEGORIES } from '../utils/constants';
import ConfirmationModal from '../components/ConfirmationModal';
import InfoModal from '../components/InfoModal';
import { formatCurrency } from '../utils/helpers';

// 👇 DİKKAT: useFinanceData.js İLE AYNI ADRESİ SABİTLEDİK
const CURRENT_SHOP_ID = 'motto_coffee_sube_01';

const Products = ({ products, isPatron, userRole, canEdit }) => {
    
    const [newProduct, setNewProduct] = useState({ name: '', price: '', category: CATEGORIES[0] });
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('Tümü');
    const [deleteId, setDeleteId] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    
    const [saving, setSaving] = useState(false);
    const [infoModal, setInfoModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });

    const getCategoryIcon = (cat) => {
        if (cat.includes('Sıcak')) return <Coffee className="text-amber-500" />;
        if (cat.includes('Soğuk')) return <CupSoda className="text-blue-400" />;
        if (cat.includes('Tatlı')) return <IceCream className="text-pink-400" />;
        if (cat.includes('Yiyecek') || cat.includes('Atıştırma')) return <Utensils className="text-orange-400" />;
        return <Tag className="text-slate-400" />;
    };

    // --- ORTAK HAVUZA ÜRÜN EKLEME ---
    const handleAddProduct = async () => {
        if (!canEdit) {
            setInfoModal({ isOpen: true, type: 'error', title: 'Yetkisiz', message: 'Yetkiniz yok.' });
            return;
        }

        if (!newProduct.name.trim() || newProduct.price === '') {
            setInfoModal({ isOpen: true, type: 'warning', title: 'Eksik Bilgi', message: 'Ürün adı ve fiyatı giriniz.' });
            return;
        }

        setSaving(true);
        try {
            // 👇 LOG EKLEDİM: Nereye yazmaya çalıştığını konsolda görebilirsiniz
            console.log("Yazılan Adres:", `artifacts/${appId}/shops/${CURRENT_SHOP_ID}/products`);

            await addDoc(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'products'), {
                name: newProduct.name,
                price: Number(newProduct.price),
                category: newProduct.category,
                sold: 0
            });
            
            setNewProduct({ name: '', price: '', category: CATEGORIES[0] });
            setIsFormOpen(false);
            setInfoModal({ isOpen: true, type: 'success', title: 'Başarılı', message: 'Ürün ortak menüye eklendi.' });

        } catch (error) {
            console.error("Ürün ekleme hatası:", error);
            setInfoModal({ isOpen: true, type: 'error', title: 'Hata', message: 'Kayıt yapılamadı.' });
        } finally {
            setSaving(false);
        }
    };

    // --- ORTAK HAVUZDAN GÜNCELLEME ---
    const handleUpdateProduct = async (id, field, value) => {
        if (!canEdit) return;
        
        const val = field === 'price' ? Number(value) : value;
        try {
            await updateDoc(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'products', id), { [field]: val });
        } catch (error) {
            console.error("Güncelleme hatası:", error);
        }
    };

    // --- ORTAK HAVUZDAN SİLME ---
    const confirmDelete = async () => {
        if (!canEdit || !deleteId) return;

        try {
            await deleteDoc(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'products', deleteId));
            setDeleteId(null);
        } catch (error) {
            setInfoModal({ isOpen: true, type: 'error', title: 'Hata', message: 'Silinemedi.' });
        }
    };

    const filteredProducts = useMemo(() => {
        // Eğer products null veya undefined ise boş dizi döndür
        if (!products) return [];
        return products.filter(p => 
            (activeCategory === 'Tümü' || p.category === activeCategory) &&
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, activeCategory, searchTerm]);

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
            <ConfirmationModal 
                isOpen={!!deleteId} 
                onClose={() => setDeleteId(null)} 
                onConfirm={confirmDelete}
                title="Ürünü Sil" 
                message="Bu ürünü HERKESİN menüsünden kaldırmak istediğinize emin misiniz?"
                type="danger"
            />
            
            <InfoModal
                isOpen={infoModal.isOpen}
                onClose={() => setInfoModal({ ...infoModal, isOpen: false })}
                type={infoModal.type}
                title={infoModal.title}
                message={infoModal.message}
            />

            {/* --- ÜST KISIM --- */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-800 pb-6">
                <div>
                    <h2 className="text-3xl font-black text-white flex items-center gap-3">
                        <Coffee className="text-indigo-500" size={32}/> Menü Yönetimi
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Toplam <span className="text-white font-bold">{products?.length || 0}</span> çeşit ürün listeleniyor.</p>
                </div>
                
                {!canEdit && (
                    <div className="bg-slate-800 border border-slate-700 text-slate-400 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm">
                        <Eye size={16} className="text-indigo-400"/> Sadece Görüntüleme Modu
                    </div>
                )}

                {canEdit && (
                    <button onClick={() => setIsFormOpen(!isFormOpen)} className={`px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg ${isFormOpen ? 'bg-slate-700 text-slate-300' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20'}`}>
                        {isFormOpen ? <Grid size={18}/> : <Plus size={18}/>}
                        {isFormOpen ? 'Listeye Dön' : 'Yeni Ürün Ekle'}
                    </button>
                )}
            </div>

            {/* --- EKLEME FORMU --- */}
            {isFormOpen && canEdit && (
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-indigo-500/30 shadow-2xl animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-lg">✨ Yeni Ürün Bilgileri</h3>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-4">
                            <label className="text-xs text-slate-400 ml-1 mb-1 block font-bold uppercase">Ürün Adı <span className="text-red-500">*</span></label>
                            <input type="text" placeholder="Örn: Iced Latte" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"/>
                        </div>
                        <div className="md:col-span-3">
                            <label className="text-xs text-slate-400 ml-1 mb-1 block font-bold uppercase">Kategori</label>
                            <select value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-all">
                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-3">
                            <label className="text-xs text-slate-400 ml-1 mb-1 block font-bold uppercase">Satış Fiyatı <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₺</span>
                                <input type="number" placeholder="0.00" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded-xl pl-8 pr-4 py-3 text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono font-bold"/>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <button onClick={handleAddProduct} disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 active:scale-95 transition-all disabled:opacity-50">
                                {saving ? <Loader2 className="animate-spin" size={18}/> : <><Save size={18}/> Kaydet</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- ARAMA VE FİLTRELEME --- */}
            <div className="space-y-4 sticky top-0 z-10 bg-[#0f172a]/95 backdrop-blur py-2">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative w-full md:w-64 shrink-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18}/>
                        <input type="text" placeholder="Menüde ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-indigo-500 transition-all"/>
                    </div>
                    <div className="flex-1 overflow-x-auto custom-scrollbar pb-2">
                        <div className="flex gap-2">
                            <button onClick={() => setActiveCategory('Tümü')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeCategory === 'Tümü' ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}>Tümü</button>
                            {CATEGORIES.map(cat => (
                                <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap flex items-center gap-2 transition-all ${activeCategory === cat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}>
                                    {getCategoryIcon(cat)} {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- LİSTELEME --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                    <div key={product.id} className="group bg-slate-800 rounded-2xl border border-slate-700 hover:border-indigo-500/50 p-4 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-900/10 hover:-translate-y-1 relative">
                        <div className="flex justify-between items-start mb-3">
                            <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-700/50 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 transition-colors">
                                {getCategoryIcon(product.category)}
                            </div>
                            {canEdit ? (
                                <select value={product.category} onChange={(e) => handleUpdateProduct(product.id, 'category', e.target.value)} className="bg-transparent text-[10px] text-slate-500 font-bold uppercase text-right outline-none cursor-pointer hover:text-indigo-400">
                                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            ) : (
                                <span className="text-[10px] text-slate-500 font-bold uppercase">{product.category}</span>
                            )}
                        </div>

                        <div className="mb-4 h-12">
                            {canEdit ? (
                                <input type="text" value={product.name} onChange={(e) => handleUpdateProduct(product.id, 'name', e.target.value)} className="bg-transparent w-full text-white font-bold text-lg outline-none border-b border-transparent focus:border-indigo-500 transition-all placeholder:text-slate-600"/>
                            ) : (
                                <h4 className="text-white font-bold text-lg line-clamp-2" title={product.name}>{product.name}</h4>
                            )}
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-700/50">
                            <div className="flex items-center gap-1 text-emerald-400">
                                <span className="text-sm font-bold">₺</span>
                                {canEdit ? (
                                    <input type="number" value={product.price} onChange={(e) => handleUpdateProduct(product.id, 'price', e.target.value)} className="bg-transparent w-20 text-xl font-bold outline-none border-b border-transparent focus:border-emerald-500 font-mono"/>
                                ) : (
                                    <span className="text-xl font-bold font-mono">{formatCurrency(product.price).replace('₺','')}</span>
                                )}
                            </div>
                            
                            {canEdit && (
                                <button onClick={() => setDeleteId(product.id)} className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100" title="Ürünü Sil">
                                    <Trash2 size={18}/>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {(!filteredProducts || filteredProducts.length === 0) && (
                <div className="text-center py-20 bg-slate-800/30 rounded-3xl border border-dashed border-slate-700">
                    <Coffee size={48} className="mx-auto mb-4 text-slate-600 opacity-50"/>
                    <h3 className="text-slate-400 font-bold text-lg">Menü henüz boş.</h3>
                    <p className="text-slate-600 text-sm mt-2">
                        {canEdit ? 'Eklediğiniz ürünler tüm personelde görünecektir.' : 'Ürünler yükleniyor veya henüz eklenmemiş.'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default Products;