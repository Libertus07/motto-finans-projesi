import React, { useState, useEffect } from 'react';
import { X, Plus, GripVertical, Trash2, LayoutList, CheckCircle2 } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { doc, updateDoc } from 'firebase/firestore';
import { db, appId } from '../services/firebase';

import { SHOP_ID as CURRENT_SHOP_ID } from '../utils/constants';

interface Category {
    id: string;
    name: string;
    image?: string;
}

interface SortableCategoryItemProps {
    category: Category;
    onDelete: (id: string) => void;
    onUpdate: (id: string, image: string) => void;
}

// Sürüklenebilir Liste Elemanı
const SortableCategoryItem: React.FC<SortableCategoryItemProps> = ({ category, onDelete, onUpdate }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: category.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 'auto',
    };

    return (
        <div ref={setNodeRef} style={style} className={`flex flex-col gap-2 p-3 bg-slate-800 rounded-xl border ${isDragging ? 'border-indigo-500 shadow-xl' : 'border-slate-700'} group relative`}>
            <div className="flex items-center gap-3">
                <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-white p-1">
                    <GripVertical size={20} />
                </div>
                <span className="flex-1 font-bold text-white text-sm">{category.name}</span>

                {/* Silme Butonu (Onaysız, direkt siler) */}
                <button
                    onClick={() => onDelete(category.id)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                    title="Kategoriyi Sil"
                >
                    <Trash2 size={16} />
                </button>
            </div>
            <div className="pl-10 pr-2">
                <input
                    type="text"
                    placeholder="Görsel URL (İsteğe bağlı)"
                    value={category.image || ''}
                    onChange={(e) => onUpdate(category.id, e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-indigo-500 transition-colors"
                />
            </div>
        </div>
    );
};

interface CategoryManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentCategories: Category[];
}

const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({ isOpen, onClose, currentCategories }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCatName, setNewCatName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // 👇 YENİ: TOAST BİLDİRİM STATE'İ
    const [toast, setToast] = useState<string | null>(null);

    // Modal açılınca mevcut kategorileri yükle
    useEffect(() => {
        if (currentCategories) {
            setCategories(currentCategories);
        }
    }, [currentCategories, isOpen]);

    // Toast mesajını 2 saniye sonra otomatik kapat
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 2000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // --- FIREBASE GÜNCELLEME ---
    const saveToFirebase = async (updatedList: Category[]) => {
        try {
            setIsSaving(true);
            await updateDoc(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'settings', 'categories'), {
                list: updatedList
            });
        } catch (error) {
            console.error("Kategori kaydetme hatası:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = categories.findIndex((c) => c.id === active.id);
            const newIndex = categories.findIndex((c) => c.id === over.id);
            const newItems = arrayMove(categories, oldIndex, newIndex);

            setCategories(newItems);
            saveToFirebase(newItems);
        }
    };

    // --- EKLEME ---
    const handleAdd = () => {
        if (!newCatName.trim()) return;
        const newItem = { id: `cat-${Date.now()}`, name: newCatName.trim() };
        const newList = [...categories, newItem];

        setCategories(newList);
        setNewCatName('');
        saveToFirebase(newList);
        setToast('Kategori eklendi'); // Ekleme bildirimi
    };

    // --- 👇 GÜNCELLENDİ: SİLME (ONAYSIZ & TOAST MESAJLI) ---
    const handleDelete = (id: string) => {
        // ⚠️ ONAY PENCERESİ KALDIRILDI
        const newList = categories.filter(c => c.id !== id);
        setCategories(newList);
        saveToFirebase(newList);

        // ✅ NON-BLOCKING TOAST BİLDİRİMİ
        setToast('Kategori silindi');
    };

    const handleUpdateImage = (id: string, imageUrl: string) => {
        const newList = categories.map(c => c.id === id ? { ...c, image: imageUrl } : c);
        setCategories(newList);
        saveToFirebase(newList);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[85vh] relative overflow-hidden">

                {/* Header */}
                <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/50 rounded-t-2xl">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <LayoutList className="text-indigo-400" /> Kategori Yönetimi
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar relative">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={categories} strategy={verticalListSortingStrategy}>
                            <div className="space-y-2">
                                {categories.map((cat) => (
                                    <SortableCategoryItem key={cat.id} category={cat} onDelete={handleDelete} onUpdate={handleUpdateImage} />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>

                    {categories.length === 0 && (
                        <div className="text-center py-10 text-slate-500 border border-dashed border-slate-700 rounded-xl">
                            Henüz kategori yok.
                        </div>
                    )}
                </div>

                {/* 👇 TOAST BİLDİRİMİ (MODAL İÇİNDE) */}
                {toast && (
                    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur text-white px-4 py-2 rounded-full shadow-xl border border-emerald-500/30 flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom-2 fade-in duration-300 z-50 whitespace-nowrap">
                        <CheckCircle2 size={14} className="text-emerald-400" />
                        {toast}
                    </div>
                )}

                {/* Footer (Ekleme) */}
                <div className="p-5 border-t border-slate-800 bg-slate-800/30 rounded-b-2xl">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Yeni Kategori Adı..."
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-all"
                        />
                        <button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl transition-colors shadow-lg shadow-indigo-900/20 active:scale-95">
                            <Plus size={20} />
                        </button>
                    </div>
                    {isSaving && <p className="text-xs text-indigo-400 mt-2 flex items-center gap-1"><Loader2 className="animate-spin" size={10} /> Kaydediliyor...</p>}
                </div>
            </div>
        </div>
    );
};

// Loader ikonu
const Loader2 = ({ className, size }: { className: string, size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
);

export default CategoryManagerModal;
