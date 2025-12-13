// components/SupplierModal.jsx (YENİ BİLEŞEN)

import React, { useState, useEffect } from 'react';
import { X, Save, User, Smartphone, Loader2 } from 'lucide-react';
import { doc, setDoc, collection, updateDoc } from 'firebase/firestore';
import { db, appId } from '../services/firebase';

const CURRENT_SHOP_ID = 'motto_coffee_sube_01';
const SupplierModal = ({ isOpen, onClose, supplierData = null, onSave, isEditing = false }) => {
    
    // Eğer düzenleme yapılıyorsa mevcut veriyi, yoksa boş formu kullan
    const [formData, setFormData] = useState({ 
        name: '', 
        contact: '', 
        id: '' 
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEditing && supplierData) {
            setFormData({
                name: supplierData.name || '',
                contact: supplierData.contact || '',
                id: supplierData.id
            });
        } else {
            setFormData({ name: '', contact: '', id: '' });
        }
    }, [supplierData, isEditing, isOpen]);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!formData.name.trim()) return alert("Tedarikçi adı boş olamaz.");
        setLoading(true);

        // Veritabanı referansı
        const supplierRef = isEditing
            ? doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'suppliers', formData.id)
            : doc(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'suppliers'));
        
        // Kaydedilecek veri
        const dataToSave = {
            name: formData.name.trim(),
            contact: formData.contact.trim(),
            createdAt: isEditing ? supplierData.createdAt : new Date().toISOString(),
            // Eğer yeni kayıt ise, ismini de borç/stok takibini kolaylaştırmak için slug olarak ekleyebiliriz (isteğe bağlı)
        };

        try {
            await setDoc(supplierRef, dataToSave, { merge: true });
            
            // Başarılı kayıttan sonra Debts sayfasına geri bildirim gönder
            onSave(formData.name.trim(), isEditing);
            onClose();

        } catch (error) {
            console.error("Tedarikçi kaydetme hatası:", error);
            alert("Kaydetme hatası: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        {isEditing ? `Tedarikçi Düzenle: ${supplierData?.name}` : 'Yeni Tedarikçi Ekle'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20}/></button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Tedarikçi Adı</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18}/>
                            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Örn: Sütçü Ahmet" className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-indigo-500"/>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase block mb-1">İletişim (Telefon/E-posta)</label>
                        <div className="relative">
                            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18}/>
                            <input type="text" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} placeholder="Örn: 05XX XXX XX XX" className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-indigo-500"/>
                        </div>
                    </div>
                    
                    <button onClick={handleSave} disabled={loading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} 
                        {isEditing ? 'Değişiklikleri Kaydet' : 'Tedarikçiyi Ekle'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SupplierModal;