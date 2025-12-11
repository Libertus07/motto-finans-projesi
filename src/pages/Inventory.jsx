// pages/Inventory.jsx (ORTAK HAVUZ ENTEGRASYONU ✅)

import React, { useState, useMemo } from 'react';
import { Truck, PlusCircle, AlertTriangle, Trash2, Box, RefreshCw, Loader2, ChefHat, Database } from 'lucide-react'; 
import { addDoc, doc, collection, writeBatch, updateDoc, deleteDoc } from 'firebase/firestore'; 
import { db, appId, auth } from '../services/firebase';
import { formatCurrency } from '../utils/helpers';
import ConfirmationModal from '../components/ConfirmationModal';
import InfoModal from '../components/InfoModal';

// 👇 MAĞAZA ID
const CURRENT_SHOP_ID = 'motto_coffee_sube_01';

const Inventory = ({ ingredients, debts }) => {
    const [newPurchase, setNewPurchase] = useState({ supplier: '', amount: '', quantity: '', ingredientId: '', isDebt: false });
    const [processing, setProcessing] = useState(false);
    const [newIngredient, setNewIngredient] = useState({ name: '', unit: 'kg', price: '', stock: '' });
    const [deleteData, setDeleteData] = useState(null); 
    const [infoModal, setInfoModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });

    const stockStats = useMemo(() => {
        const totalValue = ingredients.reduce((sum, ing) => sum + (ing.price * (ing.stock || 0)), 0);
        const lowStockCount = ingredients.filter(ing => (ing.stock || 0) < 5).length;
        const suppliers = [...new Set(debts.map(d => d.supplier).filter(s => s))];
        return { totalValue, lowStockCount, suppliers };
    }, [ingredients, debts]);
    
    const lowStockIngredients = ingredients.filter(ing => (ing.stock || 0) < 5);
    
    // --- HAMMADDE EKLEME (ORTAK HAVUZ) ---
    const handleAddIngredient = async () => {
        if (!newIngredient.name || !newIngredient.price) return;
        try {
            await addDoc(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'ingredients'), {
                name: newIngredient.name, unit: newIngredient.unit, price: Number(newIngredient.price) || 0, stock: Number(newIngredient.stock) || 0, order: ingredients.length + 1
            });
            setNewIngredient({ name: '', unit: 'kg', price: '', stock: '' });
        } catch (error) { console.error(error); }
    };

    const handleUpdateIngredient = async (id, field, value) => {
        const val = (field === 'price' || field === 'stock') ? Number(value) : value;
        if ((field === 'price' || field === 'stock') && (isNaN(val) || val < 0)) return;
        await updateDoc(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'ingredients', id), { [field]: val });
    };
    
    const confirmDelete = async () => {
        if (!deleteData) return;
        try {
            await deleteDoc(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'ingredients', deleteData.id));
            setDeleteData(null);
        } catch (error) { 
            console.error(error); 
            setInfoModal({ isOpen: true, type: 'error', title: 'Hata', message: 'Silme işlemi sırasında bir sorun oluştu.' });
        }
    };

    // --- ALIM KAYDETME (ORTAK HAVUZ & KASA & BORÇ) ---
    const handleRecordPurchase = async () => {
        if (!newPurchase.ingredientId || !newPurchase.amount || !newPurchase.quantity || !newPurchase.supplier) {
            setInfoModal({ isOpen: true, type: 'warning', title: 'Eksik Bilgi', message: 'Lütfen tüm alanları doldurunuz.' });
            return;
        }

        setProcessing(true);
        const ingredient = ingredients.find(i => i.id === newPurchase.ingredientId);
        const purchaseAmount = Number(newPurchase.amount);
        const purchaseQuantity = Number(newPurchase.quantity);
        const batch = writeBatch(db);

        try {
            const ingRef = doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'ingredients', newPurchase.ingredientId);
            const newStock = (ingredient.stock || 0) + purchaseQuantity;
            const newPrice = purchaseAmount / purchaseQuantity; 
            
            // 1. Stoku Güncelle
            batch.update(ingRef, { stock: newStock, price: newPrice });

            if (newPurchase.isDebt) {
                // 2a. Borç Olarak Kaydet (Veresiye Defteri)
                batch.set(doc(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'debts')), {
                    supplier: newPurchase.supplier, amount: purchaseAmount, dueDate: new Date().toISOString().split('T')[0],
                    note: `${ingredient.name} alımı (${purchaseQuantity} ${ingredient.unit})`, type: 'debt', createdAt: Date.now(),
                });
            } else {
                // 2b. Gider Olarak Kaydet (Kasa)
                batch.set(doc(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'transactions')), {
                    date: new Date().toISOString().split('T')[0], type: 'expense', amount: purchaseAmount,
                    desc: `${newPurchase.supplier} - ${ingredient.name} alımı`, method: 'cash', category: 'Stok (Fatura)',
                });
            }
            await batch.commit();
            setNewPurchase({ supplier: '', amount: '', quantity: '', ingredientId: '', isDebt: false });
            
            setInfoModal({ isOpen: true, type: 'success', title: 'Alım Kaydedildi', message: `${purchaseQuantity} ${ingredient.unit} ${ingredient.name} stoğa eklendi.` });

        } catch (error) { 
            console.error(error);
            setInfoModal({ isOpen: true, type: 'error', title: 'Hata', message: 'İşlem kaydedilirken bir sorun oluştu.' });
        } finally { 
            setProcessing(false); 
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
             <ConfirmationModal isOpen={!!deleteData} onClose={() => setDeleteData(null)} onConfirm={confirmDelete} title="Hammaddeyi Sil" message={`"${deleteData?.name}" adlı hammaddeyi silmek istediğinize emin misiniz?`}/>
             <InfoModal isOpen={infoModal.isOpen} onClose={() => setInfoModal({ ...infoModal, isOpen: false })} type={infoModal.type} title={infoModal.title} message={infoModal.message}/>

             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Truck className="text-orange-400"/> Stok & Tedarikçi Yönetimi</h2>
                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-right"><div className="text-xs text-slate-400 font-bold uppercase">Toplam Stok Değeri</div><div className="text-xl font-bold text-emerald-400">{formatCurrency(stockStats.totalValue)} ₺</div></div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 h-fit lg:col-span-1">
                    <div className="mb-6 pb-4 border-b border-slate-700/50">
                        <h3 className="font-bold text-white mb-3 flex items-center gap-2"><ChefHat size={18} className="text-emerald-400"/> Yeni Hammadde Tanımla</h3>
                        <div className="space-y-2">
                            <input type="text" placeholder="Adı (Örn: Badem Şurubu)" value={newIngredient.name} onChange={(e) => setNewIngredient({...newIngredient, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm outline-none focus:border-emerald-500"/>
                            <div className="flex gap-2">
                                <input type="number" placeholder="Birim Fiyatı (TL)" value={newIngredient.price} onChange={(e) => setNewIngredient({...newIngredient, price: e.target.value})} className="w-1/3 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm outline-none focus:border-emerald-500"/>
                                <select value={newIngredient.unit} onChange={(e) => setNewIngredient({...newIngredient, unit: e.target.value})} className="w-1/3 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm outline-none focus:border-emerald-500"><option>kg</option><option>Litre</option><option>Adet</option></select>
                                <input type="number" placeholder="İlk Stok" value={newIngredient.stock} onChange={(e) => setNewIngredient({...newIngredient, stock: e.target.value})} className="w-1/3 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm outline-none focus:border-emerald-500"/>
                            </div>
                            <button onClick={handleAddIngredient} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-lg">HAMMADDE EKLE</button>
                        </div>
                    </div>
                    
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2"><PlusCircle size={18} className="text-indigo-400"/> Yeni Alım Kaydet</h3>
                    <div className="space-y-3">
                        <div><label className="text-xs text-slate-400 block mb-1">Hammadde</label><select value={newPurchase.ingredientId} onChange={(e) => setNewPurchase({...newPurchase, ingredientId: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-indigo-500"><option value="">Seçiniz</option>{ingredients.map(ing => <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>)}</select></div>
                        <div><label className="text-xs text-slate-400 block mb-1">Tedarikçi</label><input type="text" placeholder="Örn: Sütçü Ahmet" list="supplier-list" value={newPurchase.supplier} onChange={(e) => setNewPurchase({...newPurchase, supplier: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-indigo-500"/><datalist id="supplier-list">{stockStats.suppliers.map(s => <option key={s} value={s} />)}</datalist></div>
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className="text-xs text-slate-400 block mb-1">Miktar</label><input type="number" placeholder="0" value={newPurchase.quantity} onChange={(e) => setNewPurchase({...newPurchase, quantity: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-indigo-500"/></div>
                            <div><label className="text-xs text-slate-400 block mb-1">Toplam Tutar</label><input type="number" placeholder="0.00" value={newPurchase.amount} onChange={(e) => setNewPurchase({...newPurchase, amount: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-indigo-500"/></div>
                        </div>
                        <div className="flex items-center gap-4 pt-2">
                             <input type="checkbox" id="isDebt" checked={newPurchase.isDebt} onChange={(e) => setNewPurchase({...newPurchase, isDebt: e.target.checked})} className="w-4 h-4 text-red-600 bg-slate-700 border-slate-600 rounded focus:ring-red-500"/>
                             <label htmlFor="isDebt" className="text-sm font-bold text-red-400 flex items-center gap-1"><RefreshCw size={14}/> Veresiye / Borç Olarak Kaydet</label>
                        </div>
                        <button onClick={handleRecordPurchase} disabled={processing} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors mt-4 flex items-center justify-center gap-2">{processing ? <Loader2 className="animate-spin" size={18}/> : <Database size={18}/>} Alımı Kaydet</button>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    {stockStats.lowStockCount > 0 && (
                        <div className="bg-red-900/20 p-4 rounded-xl border border-red-500/30">
                            <h4 className="font-bold text-red-400 flex items-center gap-2 mb-2"><AlertTriangle size={18}/> Düşük Stok Uyarısı ({stockStats.lowStockCount} ürün)</h4>
                            <ul className="text-sm text-red-300 space-y-1">{lowStockIngredients.map(ing => ( <li key={ing.id} className="flex justify-between border-b border-red-900/50 pb-1"><span>{ing.name}</span><span className="font-bold">{ing.stock} {ing.unit}</span></li> ))}</ul>
                        </div>
                    )}
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Box size={18}/> Hammadde Stok Durumu</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-slate-400">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-900/50">
                                    <tr><th className="px-4 py-3 rounded-l-lg">Hammadde</th><th className="px-4 py-3">Birim Fiyat</th><th className="px-4 py-3">Stok Miktar</th><th className="px-4 py-3 text-right">Toplam Değer</th><th className="px-4 py-3 text-right rounded-r-lg">İşlem</th></tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {ingredients.map(ing => (
                                        <tr key={ing.id} className="hover:bg-slate-700/50 transition-colors group">
                                            <td className="px-4 py-3 font-bold text-white w-40"><input type="text" value={ing.name} onChange={(e) => handleUpdateIngredient(ing.id, 'name', e.target.value)} className="bg-transparent border-b border-transparent focus:border-indigo-500 outline-none w-full"/></td>
                                            <td className="px-4 py-3 text-orange-400 w-32"><div className="flex items-center gap-1"><input type="number" value={ing.price} onChange={(e) => handleUpdateIngredient(ing.id, 'price', e.target.value)} className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-orange-400 font-bold w-20 text-right outline-none focus:border-orange-500 text-xs"/><span className='text-xs text-slate-500'>₺ / {ing.unit}</span></div></td>
                                            <td className={`px-4 py-3 font-mono w-32 ${ing.stock < 5 ? 'text-red-400 font-bold' : 'text-slate-300'}`}><div className="flex items-center gap-1"><input type="number" value={ing.stock} onChange={(e) => handleUpdateIngredient(ing.id, 'stock', e.target.value)} className={`bg-slate-900 border border-slate-600 rounded px-2 py-1 ${ing.stock < 5 ? 'text-red-400' : 'text-slate-300'} font-bold w-16 text-right outline-none focus:border-indigo-500 text-xs`}/><span className='text-xs text-slate-500'>{ing.unit}</span></div></td>
                                            <td className="px-4 py-3 text-right font-bold text-emerald-400">{formatCurrency(ing.price * (ing.stock || 0))} ₺</td>
                                            <td className="px-4 py-3 text-right w-16"><button onClick={() => setDeleteData(ing)} className="text-slate-500 hover:text-red-500 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity" title="Hammaddeyi Sil"><Trash2 size={16}/></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {ingredients.length === 0 && <div className="text-center py-8 text-slate-500 italic">Hiç hammadde kaydı yok. Lütfen yukarıdaki formdan yeni bir hammadde ekleyin.</div>}
                        </div>
                    </div>
                </div>
             </div>
        </div>
    );
};

export default Inventory;