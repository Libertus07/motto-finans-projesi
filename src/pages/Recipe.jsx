import React, { useState } from 'react';
import { ChefHat, Package, Settings, Move, PlusCircle, AlertTriangle, Scale, X, Loader2, Wand2, Sparkles, Trash2 } from 'lucide-react';
import { addDoc, deleteDoc, updateDoc, doc, collection } from 'firebase/firestore';
import { db, appId, auth } from '../services/firebase';
import { formatCurrency } from '../utils/helpers';

const Recipe = ({ ingredients }) => {
    const [isEditingIngredients, setIsEditingIngredients] = useState(false);
    const [newIngredient, setNewIngredient] = useState({ name: '', unit: 'kg', price: '', stock: '' });
    const [recipeBuilder, setRecipeBuilder] = useState({ productName: '', yieldAmount: 1, items: [] });
    const [aiLoading, setAiLoading] = useState(false);
    const [aiRecipeAdvice, setAiRecipeAdvice] = useState("");

    // --- HAMMADDE YÖNETİMİ ---
    const handleAddIngredient = async () => {
        if (!newIngredient.name || !newIngredient.price) return;
        const user = auth.currentUser;
        const ingData = {
            name: newIngredient.name,
            unit: newIngredient.unit,
            price: Number(newIngredient.price) || 0,
            stock: Number(newIngredient.stock) || 0,
            order: ingredients.length + 1
        };
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'ingredients'), ingData);
        setNewIngredient({ name: '', unit: 'kg', price: '', stock: '' });
    };

    const handleUpdateIngredient = async (id, field, value) => {
        const user = auth.currentUser;
        const val = (field === 'price' || field === 'stock') ? Number(value) : value;
        await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'ingredients', id), { [field]: val });
    };

    const handleDeleteIngredient = async (id) => {
        if(!window.confirm('Silinsin mi?')) return;
        const user = auth.currentUser;
        await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'ingredients', id));
    };

    // --- REÇETE OLUŞTURMA MANTIĞI ---
    const addIngredientToRecipe = (id) => {
        const ing = ingredients.find(i => i.id === id);
        if (!ing) return;
        
        const existing = recipeBuilder.items.find(item => item.id === id);
        if (!existing) {
            setRecipeBuilder(prev => ({
                ...prev,
                items: [...prev.items, { id: ing.id, name: ing.name, price: ing.price, unit: ing.unit, quantity: 1 }]
            }));
        } else {
            updateRecipeItemQuantity(id, existing.quantity + 1);
        }
    };

    const updateRecipeItemQuantity = (id, quantity) => {
        setRecipeBuilder(prev => ({
            ...prev,
            items: prev.items.map(item => item.id === id ? { ...item, quantity: Number(quantity) } : item)
        }));
    };

    const removeRecipeItem = (id) => {
        setRecipeBuilder(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));
    };

    const calculateRecipeCost = () => {
        const totalCost = recipeBuilder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return { totalCost, unitCost: totalCost / (recipeBuilder.yieldAmount || 1) };
    };

    const recipeCost = calculateRecipeCost();

    // --- AI TAVSİYE ---
    const generateRecipeAdvice = async () => {
        if(recipeBuilder.items.length === 0) return setAiRecipeAdvice("Lütfen önce malzeme ekleyin.");
        setAiLoading(true);
        // Simüle edilmiş AI cevabı (API maliyeti olmasın diye)
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
                                        <button onClick={(e) => {e.stopPropagation(); handleDeleteIngredient(ing.id)}} className="text-slate-600 hover:text-red-500"><Trash2 size={14}/></button>
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

                {/* SAĞ: HESAPLAYICI */}
                <div className="lg:col-span-2 bg-slate-800 p-6 rounded-2xl border border-slate-700">
                    <h3 className="font-bold text-slate-300 mb-4 flex items-center gap-2"><Scale size={18}/> Hesaplayıcı</h3>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <input type="text" placeholder="Ürün Adı" value={recipeBuilder.productName} onChange={(e) => setRecipeBuilder({...recipeBuilder, productName: e.target.value})} className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"/>
                            <input type="number" placeholder="Çıktı (Adet)" value={recipeBuilder.yieldAmount} onChange={(e) => setRecipeBuilder({...recipeBuilder, yieldAmount: Number(e.target.value)})} className="w-24 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"/>
                        </div>
                        
                        <div className="space-y-2 bg-slate-900/50 p-4 rounded-xl border border-slate-800 min-h-[100px]">
                            {recipeBuilder.items.length === 0 ? <p className="text-slate-500 text-sm text-center py-4">Soldaki listeden malzeme seçin.</p> : recipeBuilder.items.map(item => (
                                <div key={item.id} className="flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-700">
                                    <span className="text-sm text-slate-300">{item.name}</span>
                                    <div className="flex items-center gap-2">
                                        <input type="number" value={item.quantity} onChange={(e) => updateRecipeItemQuantity(item.id, e.target.value)} className="w-16 bg-slate-800 border-slate-600 rounded p-1 text-white text-sm"/>
                                        <span className="text-xs text-slate-500">{item.unit}</span>
                                    </div>
                                    <span className="text-xs text-yellow-400 font-bold">{formatCurrency(item.price * item.quantity)} ₺</span>
                                    <button onClick={() => removeRecipeItem(item.id)} className="text-slate-600 hover:text-red-500"><X size={14}/></button>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between font-bold text-lg pt-4 border-t border-slate-600">
                            <span>BİRİM MALİYET:</span>
                            <span className="text-emerald-400">{formatCurrency(recipeCost.unitCost)} ₺</span>
                        </div>
                        
                        <button onClick={generateRecipeAdvice} disabled={aiLoading} className="w-full py-3 rounded-xl font-bold bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-2">
                            {aiLoading ? <Loader2 className="animate-spin"/> : <Wand2/>} AI ANALİZİ
                        </button>
                        {aiRecipeAdvice && <div className="bg-purple-900/20 p-3 rounded-lg text-purple-200 text-sm flex gap-2"><Sparkles size={16} className="shrink-0 mt-1"/>{aiRecipeAdvice}</div>}
                    </div>
                </div>
             </div>
        </div>
    );
};

export default Recipe;