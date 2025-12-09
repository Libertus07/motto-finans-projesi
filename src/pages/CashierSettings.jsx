import React, { useState } from 'react';
import { User, Shield, Info, LogOut, RefreshCw, Loader2 } from 'lucide-react';
import { writeBatch, doc, collection } from 'firebase/firestore'; // Firebase eklendi
import { db, appId, auth } from '../services/firebase'; // Bağlantı eklendi
import { INITIAL_TABLES } from '../utils/constants'; // Masa verisi eklendi

const CashierSettings = () => {
    const [loading, setLoading] = useState(false);
    
    const handleLogout = () => {
        window.location.reload();
    };

    // --- SADECE MASALARI YENİLEME FONKSİYONU ---
    const handleRefreshTables = async () => {
        if (!window.confirm("Masalar yeniden yapılandırılacak (Mevcut siparişler silinebilir). Onaylıyor musun?")) return;
        
        setLoading(true);
        const user = auth.currentUser;
        
        try {
            const batch = writeBatch(db);
            // Sadece masaları tekrar yazıyoruz
            INITIAL_TABLES.forEach(t => {
                batch.set(doc(db, 'artifacts', appId, 'users', user.uid, 'tables', t.id), t);
            });
            
            await batch.commit();
            alert("✅ Masalar başarıyla güncellendi!");
        } catch (error) {
            console.error(error);
            alert("Hata oluştu: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-right duration-500">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <User className="text-indigo-400"/> Personel Ayarları
                </h2>
            </div>

            {/* Profil Kartı */}
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 relative overflow-hidden">
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center border-4 border-slate-800 shadow-xl">
                        <User size={32} className="text-white"/>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Kasiyer / Personel</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-emerald-400 font-bold bg-emerald-900/30 px-2 py-1 rounded-full border border-emerald-500/30">
                                ● Çevrimiçi
                            </span>
                            <span className="text-xs text-slate-400">
                                Motto Coffee
                            </span>
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            </div>

            {/* Araçlar ve Yetki Kartı */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sol: Yetkiler */}
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                    <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                        <Shield size={18} className="text-blue-400"/> Yetki Durumu
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-400">
                        <li className="flex items-center gap-2 text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Satış Yapabilir (POS)</li>
                        <li className="flex items-center gap-2 text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Masa Aç/Kapa</li>
                        <li className="flex items-center gap-2 text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Veresiye İşleyebilir</li>
                        <li className="flex items-center gap-2 text-red-400"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Ciro Hedefi Değiştiremez</li>
                    </ul>
                </div>

                {/* Sağ: Sistem Araçları (Masa Yenileme Buraya Eklendi) */}
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                            <Info size={18} className="text-purple-400"/> Sistem Araçları
                        </h3>
                        <p className="text-sm text-slate-400 mb-4">
                            Eğer masalar ekranda görünmüyorsa veya hatalıysa aşağıdaki butonu kullanın.
                        </p>
                        
                        {/* 👇 MASA YENİLEME BUTONU */}
                        <button 
                            onClick={handleRefreshTables}
                            disabled={loading}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16}/> : <RefreshCw size={16}/>}
                            Masaları Yenile / Kur
                        </button>
                    </div>
                </div>
            </div>

            {/* Çıkış Yap Butonu */}
            <button 
                onClick={handleLogout}
                className="w-full py-4 bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 text-red-400 hover:text-red-300 font-bold rounded-xl transition-all flex items-center justify-center gap-2 group"
            >
                <LogOut size={20} className="group-hover:-translate-x-1 transition-transform"/>
                SİSTEMDEN ÇIKIŞ YAP
            </button>
        </div>
    );
};

export default CashierSettings;