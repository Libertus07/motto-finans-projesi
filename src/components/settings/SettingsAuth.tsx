import React, { useState, useEffect } from 'react';
import { Shield, KeyRound, Save, Loader2, Eye, EyeOff } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';

import { SHOP_ID as CURRENT_SHOP_ID } from '../../utils/constants';

interface AuthPins {
    kasiyer: string;
    garson: string;
    [key: string]: string; // Index signature for dynamic access
}

const SettingsAuth: React.FC = () => {
    const [pins, setPins] = useState<AuthPins>({ kasiyer: '', garson: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPins, setShowPins] = useState<{ [key: string]: boolean }>({ kasiyer: false, garson: false });

    useEffect(() => {
        const fetchPins = async () => {
            try {
                const docRef = doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'settings', 'auth');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setPins(docSnap.data() as AuthPins);
                } else {
                    setPins({ kasiyer: '178600', garson: '325200' });
                }
            } catch (e) { console.error(e); }
            setLoading(false);
        };
        fetchPins();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await setDoc(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'settings', 'auth'), pins);
            alert("PIN kodları güncellendi!");
        } catch (e) {
            console.error(e);
            alert("Hata oluştu.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-indigo-500" /></div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[32px] p-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-3xl" />

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center shadow-2xl shadow-indigo-600/30">
                            <Shield size={32} className="text-white" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white">Personel Giriş Kodları</h3>
                            <p className="text-xs text-slate-400 mt-1">Kasiyer ve Garson giriş PIN'lerini yönetin</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {['kasiyer', 'garson'].map(role => (
                            <div key={role} className="bg-white/5 border-2 border-white/10 rounded-[24px] p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${role === 'kasiyer' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                            <KeyRound size={20} />
                                        </div>
                                        <span className="font-bold text-white capitalize">{role}</span>
                                    </div>
                                    <button
                                        onClick={() => setShowPins(prev => ({ ...prev, [role]: !prev[role] }))}
                                        className="text-slate-400 hover:text-white transition-colors"
                                    >
                                        {showPins[role] ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <input
                                    type={showPins[role] ? "text" : "password"}
                                    value={pins[role]}
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                        setPins(prev => ({ ...prev, [role]: val }));
                                    }}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-center text-xl font-mono font-bold text-white tracking-widest outline-none focus:border-indigo-500 transition-all"
                                    placeholder="6 Haneli PIN"
                                />
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full mt-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        DEĞİŞİKLİKLERİ KAYDET
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsAuth;
