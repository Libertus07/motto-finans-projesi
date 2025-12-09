import React, { useState, useRef } from 'react';
import { Coffee, PlusCircle, Search, Trash2, AlertTriangle, ArrowRight, Calculator, MinusCircle, GripVertical, TrendingUp, Wand2, Loader2, Sparkles } from 'lucide-react';
import { addDoc, deleteDoc, updateDoc, doc, collection, writeBatch } from 'firebase/firestore';
import { db, appId, auth } from '../services/firebase';
import { formatCurrency } from '../utils/helpers';
import { CATEGORIES, GEMINI_API_KEY } from '../utils/constants';

const Products = ({ products, isPatron }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState('Tümü');
    const [newProduct, setNewProduct] = useState({ name: '', price: '', cost: '', category: 'Kahveler' });
    const [dailySales, setDailySales] = useState({});
    const [aiLoading, setAiLoading] = useState(false);
    const [aiProductDesc, setAiProductDesc] = useState("");
    
    // Sürükle Bırak Referansları
    const dragItem = useRef(null);
    const dragOverItem = useRef(null);

    // --- SÜRÜKLE BIRAK (SIRALAMA) ---
    const handleDragStart = (e, id) => { dragItem.current = id; };
    const handleDragOver = (e) => { e.preventDefault(); };
    const handleDrop = async (e, droppedId) => {
        if (!isPatron || dragItem.current === droppedId) return;
        const dragProduct = products.find(p => p.id === dragItem.current);
        const dropProduct = products.find(p => p.id === droppedId);
        if (!dragProduct || !dropProduct) return;

        const newList = [...products];
        const dragIndex = newList.findIndex(p => p.id === dragProduct.id);
        const dropIndex = newList.findIndex(p => p.id === dropProduct.id);
        
        newList.splice(dragIndex, 1);
        newList.splice(dropIndex, 0, dragProduct);

        // Firebase'de sırayı güncelle
        const batch = writeBatch(db);
        newList.forEach((p, index) => {
            const ref = doc(db, 'artifacts', appId, 'users', auth.currentUser.uid, 'products', p.id);
            batch.update(ref, { order: index + 1 });
        });
        await batch.commit();
        dragItem.current = null;
    };

    // --- FIREBASE İŞLEMLERİ ---
    const handleAddProduct = async () => {
        if (!newProduct.name || !newProduct.price) return;
        const user = auth.currentUser;
        const pData = { 
            name: newProduct.name, 
            price: Number(newProduct.price), 
            cost: Number(newProduct.cost) || 0, 
            category: newProduct.category,
            sold: 0, 
            order: products.length + 1 
        };
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'products'), pData);
        setNewProduct({ name: '', price: '', cost: '', category: 'Kahveler' });
        setAiProductDesc("");
    };

    // 👇 GÜNCELLENEN KISIM: Onay penceresi (window.confirm) kaldırıldı
    const handleDeleteProduct = async (id) => {
        await deleteDoc(doc(db, 'artifacts', appId, 'users', auth.currentUser.uid, 'products', id));
    };

    const handleUpdateProduct = async (id, field, value) => {
        const val = (field === 'price' || field === 'cost') ? Number(value) : value;
        await updateDoc(doc(db, 'artifacts', appId, 'users', auth.currentUser.uid, 'products', id), { [field]: val });
    };

    const handleBulkPriceUpdate = async () => {
        const percent = Number(prompt("Seçili kategoriye yüzde kaç zam/indirim yapılsın? (Örn: 10 veya -10)"));
        if (!percent) return;
        // Toplu işlem tehlikeli olduğu için buradaki onayı tutmak daha güvenli olabilir, istersen bunu da kaldırabiliriz.
        if(!window.confirm(`${selectedCategory} kategorisine %${percent} işlem yapılacak. Emin misiniz?`)) return;
        
        const batch = writeBatch(db);
        const targets = products.filter(p => selectedCategory === 'Tümü' || p.category === selectedCategory);
        targets.forEach(p => {
            const newPrice = Math.ceil(p.price * (1 + percent / 100));
            batch.update(doc(db, 'artifacts', appId, 'users', auth.currentUser.uid, 'products', p.id), { price: newPrice });
        });
        await batch.commit();
    };

    // --- HIZLI SATIŞ SİMÜLATÖRÜ ---
    const handleSalesChange = (id, val) => setDailySales(prev => ({ ...prev, [id]: Math.max(0, Number(val)) }));
    
    const calculateDailyTotal = () => {
        let totalRev = 0, totalCost = 0;
        Object.entries(dailySales).forEach(([id, qty]) => {
            const p = products.find(prod => prod.id === id);
            if (p && qty > 0) { totalRev += p.price * qty; totalCost += p.cost * qty; }
        });
        return { totalRev, profit: totalRev - totalCost };
    };

    const transferSalesToIncome = async () => {
        const { totalRev } = calculateDailyTotal();
        if (totalRev <= 0) return;
        await addDoc(collection(db, 'artifacts', appId, 'users', auth.currentUser.uid, 'transactions'), {
            date: new Date().toISOString().split('T')[0],
            type: 'income', amount: totalRev, desc: 'Hızlı Satış (Terminal)',
            method: 'mix', subMethod: 'Terminal', category: null
        });
        setDailySales({});
        alert("Satış kasaya işlendi!");
    };

    // --- AI AÇIKLAMA ---
    const generateDescription = async () => {
        if(!newProduct.name) return;
        setAiLoading(true);
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: `Bir kafe menüsü için "${newProduct.name}" (${newProduct.category}) ürününe kısa, iştah açıcı, 1 cümlelik Türkçe açıklama yaz.` }] }] })
            });
            const data = await response.json();
            setAiProductDesc(data.candidates?.[0]?.content?.parts?.[0]?.text || "Açıklama üretilemedi.");
        } catch (e) { console.error(e); } finally { setAiLoading(false); }
    };

    // Filtreleme
    const filteredProducts = products.filter(p => 
        (selectedCategory === 'Tümü' || p.category === selectedCategory) &&
        (p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
             {/* ÜST PANEL */}
             <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-800 p-4 rounded-2xl border border-slate-700">
                 <div><h2 className="text-2xl font-bold text-white flex items-center gap-2"><Coffee className="text-orange-400"/> Menü Yönetimi</h2></div>
                 <div className="flex gap-2 w-full md:w-auto">
                     <div className="relative flex-1 md:w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16}/><input type="text" placeholder="Ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-xl pl-10 pr-4 py-2 text-sm text-white outline-none"/></div>
                     {isPatron && <button onClick={handleBulkPriceUpdate} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap"><TrendingUp size={16}/> Toplu Fiyat</button>}
                 </div>
             </div>

             {/* YENİ ÜRÜN EKLEME */}
             {isPatron && (
             <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 p-5 rounded-2xl shadow-lg relative overflow-hidden">
                 <h3 className="font-bold text-white mb-4 flex items-center gap-2 relative z-10"><PlusCircle size={18} className="text-emerald-400"/> Hızlı Ürün Ekle</h3>
                 <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end relative z-10">
                    <div className="col-span-2 md:col-span-1"><label className="text-[10px] text-slate-400 block mb-1 font-bold">ÜRÜN ADI</label><input type="text" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-slate-950 border border-slate-600 rounded-lg p-2.5 text-white text-sm outline-none focus:border-emerald-500"/></div>
                    <div className="col-span-1"><label className="text-[10px] text-slate-400 block mb-1 font-bold">KATEGORİ</label><select value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} className="w-full bg-slate-950 border border-slate-600 rounded-lg p-2.5 text-white text-sm outline-none">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                    <div className="col-span-1"><label className="text-[10px] text-slate-400 block mb-1 font-bold">MALİYET</label><input type="number" placeholder="0" value={newProduct.cost} onChange={(e) => setNewProduct({...newProduct, cost: e.target.value})} className="w-full bg-slate-950 border border-slate-600 rounded-lg p-2.5 text-white text-sm outline-none focus:border-red-500"/></div>
                    <div className="col-span-1"><label className="text-[10px] text-slate-400 block mb-1 font-bold">SATIŞ</label><input type="number" placeholder="0" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-slate-950 border border-slate-600 rounded-lg p-2.5 text-white text-sm outline-none focus:border-blue-500 font-bold"/></div>
                    <div className="col-span-2 md:col-span-1 flex gap-2">
                        <button onClick={generateDescription} disabled={aiLoading} className="bg-purple-600 hover:bg-purple-700 text-white p-2.5 rounded-lg w-12 flex items-center justify-center">{aiLoading ? <Loader2 className="animate-spin"/> : <Wand2 size={18}/>}</button>
                        <button onClick={handleAddProduct} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg flex-1 flex items-center justify-center gap-2">EKLE <ArrowRight size={16}/></button>
                    </div>
                 </div>
                 {aiProductDesc && <div className="mt-3 bg-purple-900/20 border border-purple-500/30 p-3 rounded-lg text-xs text-purple-200 flex gap-2"><Sparkles size={14} className="shrink-0 mt-0.5"/><p>"{aiProductDesc}"</p></div>}
             </div>
             )}

             {/* KATEGORİLER */}
             <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar border-b border-slate-800">
                 <button onClick={() => setSelectedCategory('Tümü')} className={`px-4 py-2 rounded-t-xl text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${selectedCategory === 'Tümü' ? 'border-indigo-500 text-indigo-400 bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>Tümü</button>
                 {CATEGORIES.map(c => (<button key={c} onClick={() => setSelectedCategory(c)} className={`px-4 py-2 rounded-t-xl text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${selectedCategory === c ? 'border-indigo-500 text-indigo-400 bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>{c}</button>))}
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* SOL: ÜRÜN LİSTESİ (SÜRÜKLE BIRAKLI) */}
                <div className="lg:col-span-2 space-y-3">
                   {filteredProducts.map((p) => {
                       const profit = p.price - p.cost;
                       const margin = p.price > 0 ? (profit / p.price) * 100 : 0;
                       return (
                           <div key={p.id} draggable={isPatron} onDragStart={(e) => handleDragStart(e, p.id)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, p.id)} className={`group relative bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col sm:flex-row items-center gap-4 transition-all hover:border-slate-500 ${isPatron ? 'cursor-move' : ''}`}>
                              {isPatron && <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-600 opacity-0 group-hover:opacity-50"><GripVertical size={16}/></div>}
                              <div className="flex-1 w-full text-center sm:text-left pl-4">
                                  <div className="flex items-center justify-center sm:justify-start gap-2">
                                      <input type="text" value={p.name} disabled={!isPatron} onChange={(e) => handleUpdateProduct(p.id, 'name', e.target.value)} className="bg-transparent font-bold text-white text-lg outline-none w-full border-b border-transparent focus:border-indigo-500 transition-all"/>
                                      {isPatron && margin < 40 && <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20 whitespace-nowrap flex items-center gap-1"><AlertTriangle size={10}/> %{margin.toFixed(0)}</span>}
                                  </div>
                                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                                      <select value={p.category} disabled={!isPatron} onChange={(e) => handleUpdateProduct(p.id, 'category', e.target.value)} className="text-xs text-slate-500 bg-slate-900/50 rounded px-2 py-1 outline-none">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
                                      <span className="text-xs text-slate-500">Satılan: <strong className="text-slate-300">{p.sold}</strong></span>
                                  </div>
                              </div>
                              <div className="flex items-center gap-6 bg-slate-900/50 p-2 rounded-xl border border-slate-800">
                                  <div className="text-right"><label className="text-[10px] text-slate-500 block">MALİYET</label><div className="flex items-center"><input type="number" value={p.cost} disabled={!isPatron} onChange={(e) => handleUpdateProduct(p.id, 'cost', e.target.value)} className="bg-transparent text-right text-red-400 w-16 font-mono text-sm outline-none border-b border-transparent focus:border-red-500"/><span className="text-xs text-slate-600 ml-1">₺</span></div></div>
                                  <div className="w-px h-8 bg-slate-700"></div>
                                  <div className="text-right"><label className="text-[10px] text-emerald-500 block font-bold">SATIŞ</label><div className="flex items-center"><input type="number" value={p.price} disabled={!isPatron} onChange={(e) => handleUpdateProduct(p.id, 'price', e.target.value)} className="bg-transparent text-right text-white w-16 font-bold text-lg outline-none border-b border-transparent focus:border-emerald-500"/><span className="text-sm text-slate-400 ml-1 font-bold">₺</span></div></div>
                              </div>
                              {isPatron && <button onClick={() => handleDeleteProduct(p.id)} className="text-slate-600 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18}/></button>}
                           </div>
                       )
                   })}
                </div>

                {/* SAĞ: HIZLI SATIŞ SİMÜLATÖRÜ */}
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 h-fit sticky top-24">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Calculator size={20} className="text-emerald-400"/> Satış Terminali</h3>
                    <div className="space-y-2 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar bg-slate-900/30 p-2 rounded-xl border border-slate-700/50">
                        {filteredProducts.map(p => (
                            <div key={p.id} className="flex justify-between items-center group">
                                <span className="text-sm text-slate-300 truncate w-32">{p.name}</span>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => handleSalesChange(p.id, (dailySales[p.id] || 0) - 1)} className="text-slate-500 hover:text-red-400 p-1"><MinusCircle size={14}/></button>
                                    <input type="number" value={dailySales[p.id] || ''} onChange={(e) => handleSalesChange(p.id, e.target.value)} placeholder="0" className="w-8 bg-slate-800 border border-slate-600 rounded text-center text-xs text-white py-1 outline-none"/>
                                    <button onClick={() => handleSalesChange(p.id, (dailySales[p.id] || 0) + 1)} className="text-slate-500 hover:text-emerald-400 p-1"><PlusCircle size={14}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-600 space-y-2 mt-4">
                        <div className="flex justify-between text-sm"><span className="text-slate-400">Toplam Ciro:</span><span className="font-bold text-blue-400 text-lg">{formatCurrency(calculateDailyTotal().totalRev)} ₺</span></div>
                        {isPatron && <div className="flex justify-between text-xs border-t border-slate-700 pt-2"><span className="text-slate-500">Operasyonel Kâr:</span><span className="font-bold text-emerald-400">{formatCurrency(calculateDailyTotal().profit)} ₺</span></div>}
                    </div>
                    <button onClick={transferSalesToIncome} className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition-colors shadow-lg flex items-center justify-center gap-2">Satışı Kasaya İşle <ArrowRight size={16}/></button>
                </div>
             </div>
        </div>
    );
};

export default Products;