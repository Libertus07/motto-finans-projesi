// pages/Recipe.jsx (ORTAK HAVUZ ENTEGRASYONU ✅)

import React, { useState, useEffect } from 'react';
import { ChefHat, Package, Settings, Move, PlusCircle, AlertTriangle, Scale, X, Loader2, Wand2, Sparkles, Trash2, Save } from 'lucide-react';
import { addDoc, deleteDoc, updateDoc, setDoc, doc, collection, getDoc } from 'firebase/firestore'; 
import { db, appId, auth } from '../services/firebase';
import { formatCurrency } from '../utils/helpers';
import ConfirmationModal from '../components/ConfirmationModal';
import InfoModal from '../components/InfoModal'; 

// 👇 MAĞAZA ID
const CURRENT_SHOP_ID = 'motto_coffee_sube_01';

const Recipe = ({ ingredients, products }) => { 
    const [isEditingIngredients, setIsEditingIngredients] = useState(false);
    const [newIngredient, setNewIngredient] = useState({ name: '', unit: 'kg', price: '', stock: '' });
    
    // Recipe Builder State
    const [selectedProductId, setSelectedProductId] = useState(''); 
    const [recipeBuilder, setRecipeBuilder] = useState({ yieldAmount: 1, items: [] });
    
    const [aiLoading, setAiLoading] = useState(false);
    const [aiRecipeAdvice, setAiRecipeAdvice] = useState("");
    
    const [deleteId, setDeleteId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [infoModal, setInfoModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });

    // Seçilen ürün değiştiğinde reçeteyi getir (ORTAK HAVUZDAN)
    useEffect(() => {
        const fetchRecipe = async () => {
            if (!selectedProductId) {
                setRecipeBuilder({ yieldAmount: 1, items: [] });
                return;
            }
            
            // 👇 ORTAK HAVUZDAN OKUMA
            const docRef = doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'recipes', selectedProductId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setRecipeBuilder(docSnap.data());
            } else {
                setRecipeBuilder({ yieldAmount: 1, items: [] });
            }
        };
        fetchRecipe();
    }, [selectedProductId]);

    // --- HAMMADDE YÖNETİMİ (ORTAK HAVUZ) ---
    const handleAddIngredient = async () => {
        if (!newIngredient.name || !newIngredient.price) return;
        const ingData = {
            name: newIngredient.name, unit: newIngredient.unit, price: Number(newIngredient.price) || 0, stock: Number(newIngredient.stock) || 0, order: ingredients.length + 1
        };
        // 👇 ORTAK HAVUZA EKLEME
        await addDoc(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'ingredients'), ingData);
        setNewIngredient({ name: '', unit: 'kg', price: '', stock: '' });
    };

    const handleUpdateIngredient = async (id, field, value) => {
        const val = (field === 'price' || field === 'stock') ? Number(value) : value;
        // 👇 ORTAK HAVUZ GÜNCELLEME
        await updateDoc(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'ingredients', id), { [field]: val });
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        // 👇 ORTAK HAVUZ SİLME
        await deleteDoc(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'ingredients', deleteId));
        setDeleteId(null);
    };

    // --- REÇETE MANTIĞI (Aynı kalıyor) ---
    const addIngredientToRecipe = (id) => {
        const ing = ingredients.find(i => i.id === id);
        if (!ing) return;
        const existing = recipeBuilder.items.find(item => item.id === id);
        if (!existing) {
            setRecipeBuilder(prev => ({ ...prev, items: [...prev.items, { id: ing.id, name: ing.name, price: ing.price, unit: ing.unit, quantity: 1 }] }));
        } else {
            updateRecipeItemQuantity(id, existing.quantity + 1);
        }
    };

    const updateRecipeItemQuantity = (id, quantity) => {
        setRecipeBuilder(prev => ({ ...prev, items: prev.items.map(item => item.id === id ? { ...item, quantity: Number(quantity) } : item) }));
    };

    const removeRecipeItem = (id) => {
        setRecipeBuilder(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));
    };

    // --- REÇETEYİ KAYDETME (ORTAK HAVUZ) ---
    const handleSaveRecipe = async () => {
        if (!selectedProductId) {
            setInfoModal({ isOpen: true, type: 'warning', title: 'Ürün Seçilmedi', message: 'Lütfen reçeteyi kaydetmek için önce bir ürün seçin.' });
            return;
        }
        
        setSaving(true);
        try {
            // 👇 ORTAK HAVUZA KAYDETME
            await setDoc(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'recipes', selectedProductId), recipeBuilder);
            setInfoModal({ isOpen: true, type: 'success', title: 'Reçete Kaydedildi', message: 'Reçete başarıyla sisteme işlendi.' });
        } catch (error) {
            console.error(error);
            setInfoModal({ isOpen: true, type: 'error', title: 'Hata', message: 'Reçete kaydedilirken bir sorun oluştu.' });
        } finally {
            setSaving(false);
        }
    };

    const calculateRecipeCost = () => {
        const totalCost = recipeBuilder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return { totalCost, unitCost: totalCost / (recipeBuilder.yieldAmount || 1) };
    };

    const recipeCost = calculateRecipeCost();

    const generateRecipeAdvice = async () => {
        if(recipeBuilder.items.length === 0) {
            setInfoModal({ isOpen: true, type: 'warning', title: 'Malzeme Eksik', message: 'Yapay zeka analizi için lütfen önce reçeteye malzeme ekleyin.' });
            return;
        }
        setAiLoading(true);
        setTimeout(() => {
            let advice = `Birim maliyetiniz: ${formatCurrency(recipeCost.unitCost)} ₺. `;
            if(recipeCost.unitCost > 50) advice += "Maliyet yüksek görünüyor, porsiyonu küçültmeyi düşünebilirsiniz.";
            else advice += "Maliyet gayet makul. Yüksek kâr marjı koyabilirsiniz.";
            setAiRecipeAdvice(advice);
            setAiLoading(false);
        }, 1500);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
             <ConfirmationModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={confirmDelete} title="Malzeme Silinsin mi?" message="Bu malzemeyi silmek istediğinize emin misiniz? Reçeteler etkilenebilir." />
             <InfoModal isOpen={infoModal.isOpen} onClose={() => setInfoModal({ ...infoModal, isOpen: false })} type={infoModal.type} title={infoModal.title} message={infoModal.message}/>

             <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-white flex items-center gap-2"><ChefHat className="text-orange-500"/> Reçete & Maliyet</h2></div>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* SOL: HAMMADDE DEPOSU */}
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 h-fit">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-300 flex items-center gap-2"><Package size={18}/> Depo</h3>
                        <button onClick={() => setIsEditingIngredients(!isEditingIngredients)} className={`text-xs p-1.5 rounded transition-colors ${isEditingIngredients ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-400'}`}><Settings size={14}/></button>
                    </div>
                    
                    {!isEditingIngredients && (
                    <div className="bg-slate-900 p-3 rounded-xl mb-4 border border-slate-700">
                        <input type="text" placeholder="Malzeme Adı" value={newIngredient.name} onChange={(e) => setNewIngredient({...newIngredient, name: e.target.value})} className="w-full bg-slate-800 p-2 rounded text-white text-sm mb-2 border border-slate-600"/>
                        <div className="flex gap-2 mb-2">
                            <input type="number" placeholder="Fiyat" value={newIngredient.price} onChange={(e) => setNewIngredient({...newIngredient, price: e.target.value})} className="w-1/3 bg-slate-800 p-2 rounded text-white text-sm border border-slate-600"/>
                            <select value={newIngredient.unit} onChange={(e) => setNewIngredient({...newIngredient, unit: e.target.value})} className="w-1/3 bg-slate-800 p-2 rounded text-white text-sm border border-slate-600"><option>kg</option><option>Litre</option><option>Adet</option></select>
                            <input type="number" placeholder="Stok" value={newIngredient.stock} onChange={(e) => setNewIngredient({...newIngredient, stock: e.target.value})} className="w-1/3 bg-slate-800 p-2 rounded text-white text-sm border border-slate-600"/>
                        </div>
                        <button onClick={handleAddIngredient} className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold py-2 rounded">EKLE</button>
                    </div>
                    )}

                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                        {ingredients.map(ing => (
                            <div key={ing.id} onClick={() => !isEditingIngredients && addIngredientToRecipe(ing.id)} className={`flex justify-between items-center p-2 rounded border transition-all ${isEditingIngredients ? 'bg-slate-800 border-slate-600' : 'bg-slate-900/50 border-slate-700 hover:border-orange-500/50 cursor-pointer'}`}>
                                {isEditingIngredients ? (
                                    <div className="flex items-center gap-2 w-full">
                                        <Move size={14} className="text-slate-500"/>
                                        <input type="text" value={ing.name} onChange={(e) => handleUpdateIngredient(ing.id, 'name', e.target.value)} className="bg-transparent border-b border-slate-600 text-xs text-white w-full outline-none"/>
                                        <input type="number" value={ing.price} onChange={(e) => handleUpdateIngredient(ing.id, 'price', e.target.value)} className="bg-transparent border-b border-slate-600 text-xs text-orange-400 w-12 text-center outline-none"/>
                                        <button onClick={(e) => {e.stopPropagation(); setDeleteId(ing.id)}} className="text-slate-600 hover:text-red-500"><Trash2 size={14}/></button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <PlusCircle size={14} className="text-slate-500"/>
                                            <div>
                                                <span className="text-sm text-slate-300 block">{ing.name}</span>
                                                {(ing.stock || 0) < 5 && <span className="text-[9px] text-red-400 font-bold flex items-center gap-1"><AlertTriangle size={8}/> Stok Az</span>}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-mono text-slate-400">{formatCurrency(ing.price)}₺</div>
                                            <div className="text-[10px] text-slate-500">Stok: {ing.stock || 0} {ing.unit}</div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* SAĞ: HESAPLAYICI VE KAYIT */}
                <div className="lg:col-span-2 bg-slate-800 p-6 rounded-2xl border border-slate-700">
                    <h3 className="font-bold text-slate-300 mb-4 flex items-center gap-2"><Scale size={18}/> Reçete Tanımla</h3>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none">
                                <option value="">Ürün Seçiniz...</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            
                            <div className="flex items-center gap-2 bg-slate-900 px-3 rounded-lg border border-slate-700">
                                <span className="text-xs text-slate-500">Çıktı:</span>
                                <input type="number" value={recipeBuilder.yieldAmount} onChange={(e) => setRecipeBuilder({...recipeBuilder, yieldAmount: Number(e.target.value)})} className="w-12 bg-transparent text-white font-bold text-center outline-none"/>
                                <span className="text-xs text-slate-500">Adet</span>
                            </div>
                        </div>
                        
                        <div className="space-y-2 bg-slate-900/50 p-4 rounded-xl border border-slate-800 min-h-[150px]">
                            {recipeBuilder.items.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm py-8"><Package size={32} className="mb-2 opacity-50"/><p>Soldan malzeme seçerek reçete oluşturun.</p></div> : recipeBuilder.items.map(item => (
                                <div key={item.id} className="flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-700">
                                    <span className="text-sm text-slate-300">{item.name}</span>
                                    <div className="flex items-center gap-2">
                                        <input type="number" value={item.quantity} onChange={(e) => updateRecipeItemQuantity(item.id, e.target.value)} className="w-20 bg-slate-800 border border-slate-600 rounded p-1 text-white text-sm text-center"/>
                                        <span className="text-xs text-slate-500 w-10">{item.unit}</span>
                                    </div>
                                    <span className="text-xs text-yellow-400 font-bold w-16 text-right">{formatCurrency(item.price * item.quantity)} ₺</span>
                                    <button onClick={() => removeRecipeItem(item.id)} className="text-slate-600 hover:text-red-500"><X size={14}/></button>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between font-bold text-lg pt-4 border-t border-slate-600">
                            <span>BİRİM MALİYET:</span>
                            <span className="text-emerald-400">{formatCurrency(recipeCost.unitCost)} ₺</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={generateRecipeAdvice} disabled={aiLoading} className="py-3 rounded-xl font-bold bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 flex items-center justify-center gap-2">
                                {aiLoading ? <Loader2 className="animate-spin" size={18}/> : <Wand2 size={18}/>} AI Analizi
                            </button>
                            <button onClick={handleSaveRecipe} disabled={saving} className="py-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 disabled:opacity-50">
                                {saving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} REÇETEYİ KAYDET
                            </button>
                        </div>
                        {aiRecipeAdvice && <div className="bg-purple-900/20 p-3 rounded-lg text-purple-200 text-sm flex gap-2"><Sparkles size={16} className="shrink-0 mt-1"/>{aiRecipeAdvice}</div>}
                    </div>
                </div>
             </div>
        </div>
    );
};

export default Recipe;