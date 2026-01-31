import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, appId, storage } from '../../services/firebase';
import { SHOP_ID } from '../../utils/constants';
import { LayoutGrid, Plus, Save, Trash2, Image as ImageIcon, Link, Upload, Loader2 } from 'lucide-react';

interface CategoryConfig {
    id: string; // This is the category name
    image: string;
}

const SettingsMenu: React.FC = () => {
    const [categories, setCategories] = useState<CategoryConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryImage, setNewCategoryImage] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'artifacts', appId, 'shops', SHOP_ID, 'categories'), (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as CategoryConfig[];
            setCategories(data);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    const handleSave = async (category: CategoryConfig) => {
        if (!category.id) return;
        await setDoc(doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'categories', category.id), {
            image: category.image
        });
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Bu kategori görselini silmek istediğinize emin misiniz?')) {
            await deleteDoc(doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'categories', id));
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'new' | string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const storageRef = ref(storage, `shops/${SHOP_ID}/categories/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            if (target === 'new') {
                setNewCategoryImage(downloadURL);
            } else {
                const newCategories = categories.map(c => 
                    c.id === target ? { ...c, image: downloadURL } : c
                );
                setCategories(newCategories);
                // Auto save for existing
                await setDoc(doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'categories', target), {
                    image: downloadURL
                });
            }
        } catch (error) {
            console.error("Upload failed", error);
            alert("Resim yüklenirken bir hata oluştu.");
        } finally {
            setUploading(false);
        }
    };

    const handleAddNew = async () => {
        if (!newCategoryName || !newCategoryImage) return;
        await setDoc(doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'categories', newCategoryName), {
            image: newCategoryImage
        });
        setNewCategoryName('');
        setNewCategoryImage('');
        setIsAdding(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-[#0a0d14] border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-[100px] group-hover:bg-rose-500/20 transition-all duration-700" />
                <div className="relative z-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <LayoutGrid className="text-rose-500" />
                                Kategori Görselleri
                            </h2>
                            <p className="text-slate-400 text-sm mt-1">
                                QR Menüde gösterilecek kategori görsellerini buradan yönetebilirsiniz.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsAdding(!isAdding)}
                            className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                        >
                            <Plus size={16} />
                            Yeni Ekle
                        </button>
                    </div>
                </div>
            </div>

            {/* Add New Form */}
            {isAdding && (
                <div className="bg-[#0a0d14] border border-rose-500/30 rounded-3xl p-6 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-white font-bold mb-4">Yeni Kategori Görseli</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 ml-1 mb-1 block">Kategori Adı (Tam Eşleşmeli)</label>
                            <input
                                type="text"
                                placeholder="Örn: Kahveler ve Çaylar"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500/50"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 ml-1 mb-1 block">Görsel</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="https://..."
                                    value={newCategoryImage}
                                    onChange={(e) => setNewCategoryImage(e.target.value)}
                                    className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500/50"
                                />
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    ref={fileInputRef}
                                    onChange={(e) => handleFileUpload(e, 'new')}
                                />
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-colors"
                                >
                                    {uploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                                </button>
                                {newCategoryImage && (
                                    <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center shrink-0 border border-white/10 overflow-hidden">
                                        <img src={newCategoryImage} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setIsAdding(false)}
                            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                        >
                            İptal
                        </button>
                        <button
                            onClick={handleAddNew}
                            disabled={!newCategoryName || !newCategoryImage}
                            className="bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-xl font-bold transition-all"
                        >
                            Kaydet
                        </button>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat) => (
                    <div key={cat.id} className="bg-[#0a0d14] border border-white/5 rounded-2xl p-4 flex gap-4 group hover:border-white/10 transition-colors">
                        <div className="w-20 h-20 rounded-xl bg-black/40 border border-white/10 overflow-hidden shrink-0 relative group/img">
                            {cat.image ? (
                                <img src={cat.image} alt={cat.id} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-600">
                                    <ImageIcon size={24} />
                                </div>
                            )}
                            
                            {/* Upload Overlay */}
                            <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer">
                                {uploading ? <Loader2 className="animate-spin text-white" size={24} /> : <Upload className="text-white" size={24} />}
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={(e) => handleFileUpload(e, cat.id)}
                                />
                            </label>
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-1">
                            <div>
                                <h4 className="text-white font-bold">{cat.id}</h4>
                                <div className="flex items-center gap-2 mt-2">
                                    <Link size={12} className="text-slate-500" />
                                    <input
                                        type="text"
                                        value={cat.image}
                                        onChange={(e) => {
                                            const newCategories = categories.map(c => 
                                                c.id === cat.id ? { ...c, image: e.target.value } : c
                                            );
                                            setCategories(newCategories);
                                        }}
                                        className="bg-transparent border-b border-white/10 text-xs text-slate-400 w-full focus:outline-none focus:border-rose-500/50 py-1"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-2">
                                <button
                                    onClick={() => handleSave(cat)}
                                    className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors"
                                    title="Kaydet"
                                >
                                    <Save size={14} />
                                </button>
                                <button
                                    onClick={() => handleDelete(cat.id)}
                                    className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                    title="Sil"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {categories.length === 0 && !loading && (
                    <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-3xl">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                            <ImageIcon className="text-slate-500" />
                        </div>
                        <p className="text-slate-400 font-medium">Henüz hiç kategori görseli eklenmemiş.</p>
                        <p className="text-slate-600 text-sm mt-1">"Yeni Ekle" butonu ile başlayabilirsiniz.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingsMenu;
