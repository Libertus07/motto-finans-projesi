import React, { useState, useEffect, useMemo } from 'react';
import { ChefHat, Package, Settings, Search, Plus, Trash2, Save, Loader2, Wand2, Sparkles, TrendingUp, DollarSign, AlertTriangle, Scale, ArrowRight, PieChart, Eye, Printer, Activity, Leaf } from 'lucide-react';
import { addDoc, deleteDoc, updateDoc, setDoc, doc, collection, getDoc, getDocs } from 'firebase/firestore';
import { db, appId } from '../services/firebase';
import { formatCurrency } from '../utils/helpers';
import ConfirmationModal from '../components/ConfirmationModal';
import InfoModal from '../components/InfoModal';
import { SHOP_ID as CURRENT_SHOP_ID } from '../utils/constants';
import { useOutletContext } from 'react-router-dom';
import { DashboardContextType } from '../types';
import { usePermissions } from '../hooks/usePermissions';
import { PERMISSIONS } from '../utils/roles';

// --- TYPES ---
interface RecipeItem {
    id: string;
    name: string;
    price: number;
    unit: string;
    quantity: number;
}

interface RecipeData {
    yieldAmount: number;
    items: RecipeItem[];
}

interface NutritionData {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
}

const Recipe: React.FC = () => {
    const { ingredients, products } = useOutletContext<DashboardContextType>();
    const { hasPermission } = usePermissions();
    const canManage = hasPermission(PERMISSIONS.RECIPE_MANAGE);

    // --- STATE ---
    const [isEditingIngredients, setIsEditingIngredients] = useState(false);
    const [newIngredient, setNewIngredient] = useState({ name: '', unit: 'kg', price: '', stock: '' });
    const [ingredientSearch, setIngredientSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'pantry' | 'studio'>('pantry');

    const [selectedProductId, setSelectedProductId] = useState('');
    const [recipeBuilder, setRecipeBuilder] = useState<RecipeData>({ yieldAmount: 1, items: [] });

    // Phase 7 Features
    const [simulationMode, setSimulationMode] = useState(false);
    const [simulatedPrices, setSimulatedPrices] = useState<Record<string, number>>({});
    const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
    const [isChefMode, setIsChefMode] = useState(false);

    // AI & Feedback
    const [aiLoading, setAiLoading] = useState(false);
    const [aiRecipeAdvice, setAiRecipeAdvice] = useState("");
    // System
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [infoModal, setInfoModal] = useState<{ isOpen: boolean; type: 'success' | 'warning' | 'error' | 'info'; title: string; message: string }>({ isOpen: false, type: 'success', title: '', message: '' });
    const [existingRecipeIds, setExistingRecipeIds] = useState<Set<string>>(new Set());

    // --- EFFECTS ---
    useEffect(() => {
        const fetchRecipeIds = async () => {
            const snapshot = await getDocs(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'recipes'));
            const ids = new Set(snapshot.docs.map(d => d.id));
            setExistingRecipeIds(ids);
        };
        fetchRecipeIds();
    }, []);

    useEffect(() => {
        const fetchRecipe = async () => {
            if (!selectedProductId) {
                setRecipeBuilder({ yieldAmount: 1, items: [] });
                setAiRecipeAdvice("");
                return;
            }
            const docRef = doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'recipes', selectedProductId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setRecipeBuilder(docSnap.data() as RecipeData);
            } else {
                setRecipeBuilder({ yieldAmount: 1, items: [] });
            }
        };
        fetchRecipe();
    }, [selectedProductId]);

    // --- ACTIONS ---
    const handleAddIngredient = async () => {
        if (!canManage) return;
        if (!newIngredient.name || !newIngredient.price) return;
        try {
            await addDoc(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'ingredients'), {
                name: newIngredient.name,
                unit: newIngredient.unit,
                price: Number(newIngredient.price) || 0,
                stock: Number(newIngredient.stock) || 0,
                order: ingredients.length + 1
            });
            setNewIngredient({ name: '', unit: 'kg', price: '', stock: '' });
        } catch (error) {
            console.error("Error adding ingredient:", error);
        }
    };

    const handleUpdateIngredient = async (id: string, field: string, value: string) => {
        if (!canManage) return;
        const val = (field === 'price' || field === 'stock') ? Number(value) : value;
        try {
            await updateDoc(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'ingredients', id), { [field]: val });
        } catch (error) { console.error("Update failed", error); }
    };

    const confirmDelete = async () => {
        if (!canManage || !deleteId) return;
        try {
            await deleteDoc(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'ingredients', deleteId));
            setDeleteId(null);
        } catch (error) { console.error("Delete failed", error); }
    };

    const addIngredientToRecipe = (id: string) => {
        if (!selectedProductId) {
            setInfoModal({ isOpen: true, type: 'warning', title: 'Ürün Seçiniz', message: 'Reçete oluşturmak için önce sağ taraftan bir ürün seçin.' });
            return;
        }
        const ing = ingredients.find(i => i.id === id);
        if (!ing) return;
        const existing = recipeBuilder.items.find(item => item.id === id);
        if (!existing) {
            setRecipeBuilder(prev => ({ ...prev, items: [...prev.items, { id: ing.id, name: ing.name, price: ing.price, unit: ing.unit, quantity: 1 }] }));
        } else {
            updateRecipeItemQuantity(id, existing.quantity + 1);
        }
    };

    const updateRecipeItemQuantity = (id: string, quantity: number | string) => {
        setRecipeBuilder(prev => ({ ...prev, items: prev.items.map(item => item.id === id ? { ...item, quantity: Number(quantity) } : item) }));
    };

    const removeRecipeItem = (id: string) => {
        setRecipeBuilder(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));
    };

    const handleSaveRecipe = async () => {
        if (!canManage) return;
        if (!selectedProductId) return;
        setSaving(true);
        try {
            await setDoc(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'recipes', selectedProductId), recipeBuilder);
            setExistingRecipeIds(prev => new Set(prev).add(selectedProductId));
            setInfoModal({ isOpen: true, type: 'success', title: 'Reçete Kaydedildi', message: 'Reçete ve maliyetler güncellendi.' });
            setAiRecipeAdvice(""); // Clear old advice
        } catch (error) {
            console.error(error);
            setInfoModal({ isOpen: true, type: 'error', title: 'Hata', message: 'Kaydedilirken sorun oluştu.' });
        } finally {
            setSaving(false);
        }
    };

    // --- PHASE 7 LOGIC ---
    const handleSimulationChange = (ingredientId: string, newPrice: string) => {
        setSimulatedPrices(prev => ({
            ...prev,
            [ingredientId]: Number(newPrice)
        }));
    };

    // --- CALCULATIONS ---
    const recipeCost = useMemo(() => {
        const total = recipeBuilder.items.reduce((sum, item) => {
            // Use simulated price if in simulation mode and price exists, otherwise use real price
            const priceToUse = simulationMode && simulatedPrices[item.id] !== undefined
                ? simulatedPrices[item.id]
                : item.price;
            return sum + (priceToUse * item.quantity);
        }, 0);
        return { totalCost: total, unitCost: total / (recipeBuilder.yieldAmount || 1) };
    }, [recipeBuilder, simulationMode, simulatedPrices]);

    const selectedProduct = products.find(p => p.id === selectedProductId);
    const marginAnalysis = useMemo(() => {
        if (!selectedProduct || recipeCost.unitCost === 0) return null;
        const margin = selectedProduct.price - recipeCost.unitCost;
        const marginPercent = (margin / selectedProduct.price) * 100;
        return { margin, marginPercent };
    }, [selectedProduct, recipeCost]);

    const generateRecipeAdvice = () => {
        if (recipeBuilder.items.length === 0) return;
        setAiLoading(true);
        setTimeout(() => {
            const { unitCost } = recipeCost;
            let advice = `Maliyet: ${formatCurrency(unitCost)} ₺. `;
            if (marginAnalysis) {
                if (marginAnalysis.marginPercent < 30) advice += "⚠️ Kâr marjı çok düşük (%30'un altında). Porsiyon küçültün veya fiyat artırın.";
                else if (marginAnalysis.marginPercent > 70) advice += "✨ Harika kâr marjı (%70+). Bu 'yıldız' bir ürün.";
                else advice += "✅ Standart kâr marjı aralığında.";
            }

            // Mock AI Nutrition Estimation
            const estimatedCals = recipeBuilder.items.reduce((sum, item) => sum + (item.quantity * (Math.random() * 500)), 0) / recipeBuilder.yieldAmount;
            setNutritionData({
                calories: Math.round(estimatedCals),
                protein: Math.round(estimatedCals * 0.1),
                fat: Math.round(estimatedCals * 0.05),
                carbs: Math.round(estimatedCals * 0.15)
            });

            setAiRecipeAdvice(advice);
            setAiLoading(false);
        }, 1200);
    };

    // --- RENDER HELPERS ---
    const filteredIngredients = ingredients.filter(i => i.name.toLowerCase().includes(ingredientSearch.toLowerCase()));

    const getMarginColor = (percent: number) => {
        if (percent < 30) return 'text-red-400';
        if (percent < 60) return 'text-yellow-400';
        return 'text-emerald-400';
    };

    const getMarginBadge = (percent: number) => {
        if (percent < 30) return 'bg-red-500/10 border-red-500/20 text-red-400';
        if (percent < 60) return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    };

    if (isChefMode && selectedProduct) {
        return (
            <div className="fixed inset-0 bg-slate-950 z-50 p-8 flex flex-col animate-in fade-in duration-300 overflow-y-auto">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-5xl font-black text-white mb-2">{selectedProduct.name}</h1>
                        <div className="text-2xl text-slate-400 font-bold">{recipeBuilder.yieldAmount} Adet Porsiyon</div>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => window.print()} className="p-4 bg-slate-800 rounded-2xl text-white hover:bg-slate-700"><Printer size={32} /></button>
                        <button onClick={() => setIsChefMode(false)} className="p-4 bg-red-600 rounded-2xl text-white hover:bg-red-500"><Trash2 size={32} className="rotate-45" /></button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold text-indigo-400 mb-6 flex items-center gap-3"><Package size={32} /> Malzemeler</h2>
                        {recipeBuilder.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-2xl border-b border-slate-800 pb-4">
                                <span className="text-white font-medium">{item.name}</span>
                                <span className="font-bold text-emerald-400">{item.quantity} <span className="text-lg text-slate-500">{item.unit}</span></span>
                            </div>
                        ))}
                    </div>
                    <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800">
                        <h2 className="text-3xl font-bold text-orange-400 mb-6 flex items-center gap-3"><ChefHat size={32} /> Hazırlanışı</h2>
                        <p className="text-xl text-slate-400 leading-relaxed">
                            Standart reçete prosedürlerini uygulayınız.
                            <br /><br />
                            1. Tüm malzemeleri hazırlayın.<br />
                            2. Gramajlara kesinlikle uyunuz.<br />
                            3. Sunum standartlarına dikkat ediniz.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 md:p-8 font-sans">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-900/10 to-transparent opacity-60" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-3xl opacity-40" />
            </div>

            <ConfirmationModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={confirmDelete} title="Silme Onayı" message="Bu malzemeyi silmek istediğinize emin misiniz?" type="danger" loading={false} />
            <InfoModal isOpen={infoModal.isOpen} onClose={() => setInfoModal({ ...infoModal, isOpen: false })} type={infoModal.type} title={infoModal.title} message={infoModal.message} />

            <div className="max-w-[1600px] mx-auto relative z-10">
                {/* HEADLINE */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-slate-800/60 pb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/20">
                                <ChefHat size={28} className="text-white" />
                            </div>
                            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">Reçete Stüdyosu</h1>
                        </div>
                        <p className="text-slate-400 font-medium max-w-lg">
                            Ürünlerinizin reçetelerini oluşturun, birim maliyetleri hesaplayın ve kâr marjınızı optimize edin.
                        </p>
                    </div>

                    <div className="flex gap-6">
                        <div className="text-right hidden md:block">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Maliyetler</div>
                            <div className="text-2xl font-black text-emerald-400">{existingRecipeIds.size} <span className="text-sm font-medium text-slate-500">Reçete</span></div>
                        </div>
                        <div className="text-right hidden md:block">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Depo</div>
                            <div className="text-2xl font-black text-indigo-400">{ingredients.length} <span className="text-sm font-medium text-slate-500">Malzeme</span></div>
                        </div>
                    </div>
                </div>

                {/* MOBILE TABS */}
                <div className="flex gap-2 mb-6 lg:hidden">
                    <button
                        onClick={() => setActiveTab('pantry')}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'pantry' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'bg-slate-800 text-slate-400'}`}
                    >
                        <Package size={18} />
                        Depo ({ingredients.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('studio')}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'studio' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'bg-slate-800 text-slate-400'}`}
                    >
                        <ChefHat size={18} />
                        Stüdyo
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 min-h-[600px] lg:h-[calc(100vh-220px)]">

                    {/* --- LEFT: THE PANTRIE (DEPO) --- */}
                    <div className={`${activeTab === 'pantry' ? 'flex' : 'hidden'} lg:flex lg:col-span-4 flex-col bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl h-[600px] lg:h-auto`}>
                        {/* Search & Header */}
                        <div className="p-5 border-b border-slate-700/50 bg-slate-900/80">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-white flex items-center gap-2 text-lg">
                                    <Package className="text-indigo-400" size={20} />
                                    Depo & Malzemeler
                                </h3>
                                <button
                                    onClick={() => setIsEditingIngredients(!isEditingIngredients)}
                                    className={`p-2 rounded-xl transition-all ${isEditingIngredients ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                                >
                                    <Settings size={18} />
                                </button>
                            </div>

                            {!isEditingIngredients ? (
                                <div className="relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Malzeme ara..."
                                        value={ingredientSearch}
                                        onChange={(e) => setIngredientSearch(e.target.value)}
                                        className="w-full bg-slate-950/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <input type="text" placeholder="Yeni Malzeme Adı" value={newIngredient.name} onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-indigo-500" />
                                    <div className="flex gap-2">
                                        <input type="number" placeholder="Birim Fiyat" value={newIngredient.price} onChange={(e) => setNewIngredient({ ...newIngredient, price: e.target.value })} className="w-1/2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-indigo-500" />
                                        <select value={newIngredient.unit} onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })} className="w-1/2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-300 outline-none focus:border-indigo-500">
                                            <option value="kg">kg</option>
                                            <option value="Liter">Litre</option>
                                            <option value="Adet">Adet</option>
                                            <option value="Gram">Gram</option>
                                        </select>
                                    </div>
                                    <button onClick={handleAddIngredient} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs tracking-wider transition-colors shadow-lg shadow-indigo-900/20">MALZEME EKLE</button>
                                </div>
                            )}
                        </div>

                        {/* Ingredients List */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                            {filteredIngredients.length === 0 ? (
                                <div className="text-center py-10 text-slate-500 text-sm">Malzeme bulunamadı.</div>
                            ) : (
                                filteredIngredients.map(ing => (
                                    <div
                                        key={ing.id}
                                        onClick={() => !isEditingIngredients && addIngredientToRecipe(ing.id)}
                                        className={`group relative p-3 rounded-xl border transition-all duration-200 ${isEditingIngredients
                                            ? 'bg-slate-800/50 border-slate-700'
                                            : 'bg-slate-800/30 border-slate-700/30 hover:bg-slate-800 hover:border-indigo-500/30 cursor-pointer active:scale-[0.98]'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center relative z-10">
                                            {isEditingIngredients ? (
                                                <>
                                                    <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                                                        <input
                                                            type="text"
                                                            value={ing.name}
                                                            onChange={(e) => handleUpdateIngredient(ing.id, 'name', e.target.value)}
                                                            className="bg-slate-950 border-b border-slate-700 text-sm text-white w-full outline-none py-1 focus:border-indigo-500 transition-colors"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="relative">
                                                            <input
                                                                type="number"
                                                                value={ing.price}
                                                                onChange={(e) => handleUpdateIngredient(ing.id, 'price', e.target.value)}
                                                                className="bg-slate-950 border-b border-slate-700 text-sm text-emerald-400 w-16 text-center outline-none py-1 focus:border-emerald-500 transition-colors font-mono"
                                                            />
                                                            <span className="absolute right-0 top-1.5 text-[10px] text-slate-500 pointer-events-none">₺</span>
                                                        </div>
                                                        <button onClick={(e) => { e.stopPropagation(); setDeleteId(ing.id); }} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${'bg-gradient-to-br from-indigo-500/10 to-purple-500/10 text-indigo-400 group-hover:text-white group-hover:from-indigo-500 group-hover:to-purple-500 transition-colors'}`}>
                                                            <Plus size={16} />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{ing.name}</h4>
                                                            <span className="text-[10px] text-slate-500">{ing.unit} başına</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm font-mono font-bold text-emerald-400">{formatCurrency(ing.price)}₺</div>
                                                        {ing.stock !== undefined && <div className="text-[9px] text-slate-500 font-medium">Stok: {ing.stock}</div>}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* --- RIGHT: THE CHEF'S TABLE (BUILDER) --- */}
                    <div className={`${activeTab === 'studio' ? 'flex' : 'hidden'} lg:flex lg:col-span-8 flex-col gap-6`}>

                        {/* 1. Selector Section */}
                        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10 transition-opacity group-hover:opacity-100 opacity-50" />

                            <div className="flex flex-col md:flex-row gap-6 items-end">
                                <div className="flex-1 w-full">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block ml-1">Reçetesi Yapılacak Ürün</label>
                                    <div className="relative">
                                        <select
                                            value={selectedProductId}
                                            onChange={(e) => setSelectedProductId(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-5 py-4 text-white appearance-none outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all font-bold text-lg"
                                        >
                                            <option value="">Lütfen Bir Ürün Seçiniz...</option>
                                            {products.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {existingRecipeIds.has(p.id) ? '✅ ' : ''} {p.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                            <ArrowRight size={20} />
                                        </div>
                                    </div>
                                </div>

                                {selectedProductId && (
                                    <>
                                        <div className="w-full md:w-auto flex items-center gap-3 bg-slate-950 border border-slate-700 rounded-2xl p-2 pr-5 animate-in fade-in slide-in-from-right">
                                            <div className="bg-slate-800 p-3 rounded-xl">
                                                <Scale className="text-slate-400" size={20} />
                                            </div>
                                            <div>
                                                <div className="text-[10px] uppercase font-bold text-slate-500">Porsiyon Çıktısı</div>
                                                <div className="flex items-baseline gap-1">
                                                    <input
                                                        type="number"
                                                        value={recipeBuilder.yieldAmount}
                                                        onChange={(e) => setRecipeBuilder({ ...recipeBuilder, yieldAmount: Math.max(1, Number(e.target.value)) })}
                                                        className="w-12 bg-transparent text-white font-black text-xl outline-none border-b border-dashed border-slate-600 focus:border-emerald-500 text-center"
                                                    />
                                                    <span className="text-xs font-bold text-slate-400">Adet</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setIsChefMode(true)}
                                            className="p-4 bg-slate-800 border border-slate-700 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-700 transition-all active:scale-95"
                                            title="Şef Modu"
                                        >
                                            <Eye size={24} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* 2. Builder Canvas & Smart Analysis */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-0">

                            {/* RECIPE ITEMS */}
                            <div className="md:col-span-7 lg:col-span-8 bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl flex flex-col overflow-hidden shadow-2xl relative">
                                {!selectedProductId ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 bg-slate-900/80 z-20 backdrop-blur-sm">
                                        <div className="w-20 h-20 rounded-3xl bg-slate-800 flex items-center justify-center mb-4 shadow-xl rotate-3">
                                            <ChefHat size={40} className="text-slate-500" />
                                        </div>
                                        <p className="font-medium text-lg">Reçeteyi görmek için ürün seçin</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Canvas Header */}
                                        <div className="p-5 border-b border-slate-700/50 flex justify-between items-center bg-slate-900/50">
                                            <h3 className="font-bold text-white flex items-center gap-2">
                                                <PieChart className="text-purple-400" size={18} /> Reçete İçeriği
                                            </h3>
                                            <span className="text-xs font-bold text-slate-500 bg-slate-800 px-3 py-1 rounded-full">{recipeBuilder.items.length} Kalem</span>
                                        </div>

                                        {/* Items List */}
                                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                            {recipeBuilder.items.length === 0 ? (
                                                <div className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl min-h-[200px]">
                                                    <p className="mb-2">Malzemeler buraya eklenecek</p>
                                                    <span className="text-xs bg-slate-800 px-3 py-1.5 rounded-lg text-slate-400">Sol menüden malzeme seçin</span>
                                                </div>
                                            ) : (
                                                recipeBuilder.items.map(item => (
                                                    <div key={item.id} className={`border bg-slate-800/40 rounded-2xl p-3 flex items-center gap-3 group transition-colors ${simulationMode ? 'border-purple-500/30' : 'border-slate-700/50 hover:bg-slate-800/60'}`}>
                                                        <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center text-slate-400 font-bold text-xs shrink-0">
                                                            {((item.price * item.quantity) / recipeCost.totalCost * 100).toFixed(0)}%
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-bold text-slate-200 text-sm truncate">{item.name}</div>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <input
                                                                    type="number"
                                                                    value={item.quantity}
                                                                    disabled={simulationMode}
                                                                    onChange={(e) => updateRecipeItemQuantity(item.id, e.target.value)}
                                                                    className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5 text-xs text-center text-white focus:border-indigo-500 outline-none font-mono disabled:opacity-50"
                                                                />
                                                                <span className="text-xs text-slate-500 font-medium">{item.unit}</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            {simulationMode ? (
                                                                <div className="flex flex-col items-end">
                                                                    <input
                                                                        type="number"
                                                                        value={simulatedPrices[item.id] !== undefined ? simulatedPrices[item.id] : item.price}
                                                                        onChange={(e) => handleSimulationChange(item.id, e.target.value)}
                                                                        className="w-20 bg-purple-900/50 border border-purple-500/50 rounded px-1 text-right text-purple-300 text-sm font-bold outline-none"
                                                                    />
                                                                    <span className="text-[10px] text-slate-500 line-through">{formatCurrency(item.price * item.quantity)} ₺</span>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div className="text-sm font-black text-white">{formatCurrency(item.price * item.quantity)} ₺</div>
                                                                    <button onClick={() => removeRecipeItem(item.id)} className="text-slate-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* SMART ANALYSIS & ACTIONS */}
                            <div className="md:col-span-12 lg:col-span-4 flex flex-col gap-6">

                                {/* Cost Card */}
                                <div className={`bg-gradient-to-br ${simulationMode ? 'from-indigo-950 to-purple-950 border-purple-500/50' : 'from-slate-900 to-slate-950 border-slate-700/50'} border rounded-3xl p-6 shadow-2xl relative overflow-hidden transition-all duration-500`}>
                                    <div className="absolute top-0 right-0 p-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">{simulationMode ? 'SİMÜLE EDİLEN MALİYET' : 'TOPLAM BİRİM MALİYET'}</span>
                                            <div className="flex items-baseline gap-1">
                                                <span className={`text-5xl font-black tracking-tight ${simulationMode ? 'text-purple-400' : 'text-white'}`}>{formatCurrency(recipeCost.unitCost)}</span>
                                                <span className="text-xl font-bold text-slate-500">₺</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSimulationMode(!simulationMode)}
                                            className={`p-2 rounded-xl transition-all ${simulationMode ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                                            title="What-If Simülasyonu"
                                        >
                                            <Activity size={20} />
                                        </button>
                                    </div>

                                    {/* Smart Margin Bar */}
                                    {marginAnalysis && (
                                        <div className="mb-6 space-y-3">
                                            <div className="flex justify-between items-end">
                                                <span className="text-xs font-bold text-slate-400">Kâr Oranı</span>
                                                <span className={`text-xl font-black ${getMarginColor(marginAnalysis.marginPercent)}`}>%{marginAnalysis.marginPercent.toFixed(1)}</span>
                                            </div>
                                            <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                                                <div
                                                    className={`h-full transition-all duration-1000 ease-out ${marginAnalysis.marginPercent < 30 ? 'bg-red-500' : (marginAnalysis.marginPercent < 60 ? 'bg-yellow-500' : 'bg-emerald-500')}`}
                                                    style={{ width: `${Math.min(100, Math.max(0, marginAnalysis.marginPercent))}%` }}
                                                />
                                            </div>
                                            {simulationMode && (
                                                <div className="text-xs text-purple-300 text-center font-bold animate-pulse">
                                                    Simülasyon Modu Aktif - Değişiklikler Kaydedilmez
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* AI Button */}
                                    <button
                                        onClick={generateRecipeAdvice}
                                        disabled={aiLoading || !selectedProductId}
                                        className="w-full py-3 mb-3 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 group"
                                    >
                                        {aiLoading ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} className="group-hover:rotate-12 transition-transform" />}
                                        AI Analizi & Besin Değeri
                                    </button>

                                    {aiRecipeAdvice && (
                                        <div className="bg-indigo-950/30 border border-indigo-500/20 p-3 rounded-xl text-xs text-indigo-200 animate-in fade-in slide-in-from-bottom-2 mb-4">
                                            {aiRecipeAdvice}
                                        </div>
                                    )}

                                    {nutritionData && (
                                        <div className="grid grid-cols-4 gap-2 animate-in fade-in slide-in-from-bottom-4">
                                            <div className="bg-slate-900/50 p-2 rounded-lg text-center border border-slate-800">
                                                <span className="block text-[10px] text-slate-500 font-bold">Kcal</span>
                                                <span className="text-white font-bold">{nutritionData.calories}</span>
                                            </div>
                                            <div className="bg-slate-900/50 p-2 rounded-lg text-center border border-slate-800">
                                                <span className="block text-[10px] text-slate-500 font-bold">Prot</span>
                                                <span className="text-emerald-400 font-bold">{nutritionData.protein}g</span>
                                            </div>
                                            <div className="bg-slate-900/50 p-2 rounded-lg text-center border border-slate-800">
                                                <span className="block text-[10px] text-slate-500 font-bold">Yağ</span>
                                                <span className="text-yellow-400 font-bold">{nutritionData.fat}g</span>
                                            </div>
                                            <div className="bg-slate-900/50 p-2 rounded-lg text-center border border-slate-800">
                                                <span className="block text-[10px] text-slate-500 font-bold">Karb</span>
                                                <span className="text-blue-400 font-bold">{nutritionData.carbs}g</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Save Button */}
                                <button
                                    onClick={handleSaveRecipe}
                                    disabled={saving || !selectedProductId || !canManage || simulationMode}
                                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-lg tracking-wide shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group mt-auto"
                                >
                                    {saving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} className="group-hover:scale-110 transition-transform" />}
                                    KAYDET
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Recipe;
