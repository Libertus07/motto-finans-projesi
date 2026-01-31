import React, { useState, useEffect } from 'react';
import { Gift, Plus, Trash2, Calendar, Ticket, Check, X, Wand2 } from 'lucide-react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';
import { SHOP_ID } from '../../utils/constants';
import { Deal } from '../../types';

const CAMPAIGN_TEMPLATES = [
    {
        title: "Yağmurlu Gün Tesellisi ☔",
        description: "Hava kapalı olabilir ama kahven sıcak! İçini ısıtacak dilediğin bir Latte %20 indirimli.",
        code: "YAGMUR20"
    },
    {
        title: "Pazartesi Sendromuna Son 🚀",
        description: "Haftaya enerjik başla! Filtre kahve alana, yanında nefis kruvasan %50 indirimli.",
        code: "SENDROMYOK"
    },
    {
        title: "Hafta Sonu Kutlaması 🎉",
        description: "Motto Club üyelerine özel hafta sonu şımarıklığı. Tüm tatlılarda geçerli 2 Al 1 Öde fırsatı!",
        code: "MUTLU21"
    },
    {
        title: "Kahve Saati ☕",
        description: "Saat 14:00 - 17:00 arası tüm kahvelerde geçerli %15 Happy Hour indirimi.",
        code: "KAHVE15"
    },
    {
        title: "Öğrenci Dostu Menü 🎓",
        description: "Ders çalışırken mola ver! Öğrenci kimliğini göster, soğuk içeceklerde %10 indirimi kap.",
        code: "OGRENCI10"
    }
];

const SettingsCampaigns: React.FC = () => {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // Wizard State
    const [newDeal, setNewDeal] = useState<Partial<Deal>>({
        title: '',
        description: '',
        code: '',
        isActive: true
    });

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'artifacts', appId, 'shops', SHOP_ID, 'deals'), (snapshot) => {
            const dealList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Deal[];
            setDeals(dealList);
        });
        return () => unsubscribe();
    }, []);

    const handleGenerateCampaign = () => {
        setIsGenerating(true);
        // Simulate AI thinking delay
        setTimeout(() => {
            const randomTemplate = CAMPAIGN_TEMPLATES[Math.floor(Math.random() * CAMPAIGN_TEMPLATES.length)];
            const randomSuffix = Math.floor(Math.random() * 100);

            setNewDeal({
                ...newDeal,
                title: randomTemplate.title,
                description: randomTemplate.description,
                code: `${randomTemplate.code}${randomSuffix}`, // Make code unique-ish
                isActive: true,
                discountType: 'percentage',
                discountValue: 20
            });
            setIsGenerating(false);
        }, 1500);
    };

    const handleCreateCampaign = async () => {
        if (!newDeal.title || !newDeal.code) return;
        try {
            await addDoc(collection(db, 'artifacts', appId, 'shops', SHOP_ID, 'deals'), {
                ...newDeal,
                createdAt: new Date().toISOString()
            });
            setIsWizardOpen(false);
            setNewDeal({ title: '', description: '', code: '', isActive: true });
        } catch (error) {
            console.error("Error creating campaign:", error);
        }
    };

    const handleDeleteDeal = async (id: string) => {
        if (confirm('Bu kampanyayı silmek istediğinize emin misiniz?')) {
            await deleteDoc(doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'deals', id));
        }
    };

    const toggleStatus = async (deal: Deal) => {
        await updateDoc(doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'deals', deal.id), {
            isActive: !deal.isActive
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Gift className="text-rose-500" />
                        Kampanya Yönetimi
                    </h2>
                    <p className="text-slate-400 mt-1">
                        Müşterilerinize özel fırsatlar ve indirim kuponları oluşturun.
                    </p>
                </div>
                <button
                    onClick={() => setIsWizardOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-rose-600/20 active:scale-95"
                >
                    <Plus size={20} />
                    Yeni Kampanya
                </button>
            </div>

            {/* Campaign List */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {deals.map((deal) => (
                    <div key={deal.id} className="relative group bg-[#0a0d14] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all">
                        <div className={`h-2 w-full ${deal.isActive ? 'bg-rose-500' : 'bg-slate-700'}`} />
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-white/5 rounded-xl text-rose-400">
                                    <Ticket size={24} />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toggleStatus(deal)}
                                        className={`p-2 rounded-lg transition-colors ${deal.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700/50 text-slate-400'}`}
                                        title={deal.isActive ? 'Aktif - Durdur' : 'Pasif - Başlat'}
                                    >
                                        {deal.isActive ? <Check size={16} /> : <X size={16} />}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteDeal(deal.id)}
                                        className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-2">{deal.title}</h3>
                            <p className="text-slate-400 text-sm mb-4 line-clamp-2">{deal.description}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="flex items-center gap-2 text-slate-300 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50 font-mono text-sm">
                                    <span className="select-all">{deal.code}</span>
                                </div>
                                {deal.expiresAt && (
                                    <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
                                        <Calendar size={12} />
                                        <span>{new Date(deal.expiresAt).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {deals.length === 0 && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-800 rounded-3xl">
                        <div className="p-4 bg-slate-900 rounded-full mb-4">
                            <Gift size={32} className="text-slate-600" />
                        </div>
                        <h4 className="text-slate-400 font-bold mb-1">Henüz Kampanya Yok</h4>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto">
                            "Yeni Kampanya" butonunu kullanarak ilk fırsatınızı oluşturun.
                        </p>
                    </div>
                )}
            </div>

            {/* Campaign Wizard Modal */}
            {isWizardOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#0f172a] w-full max-w-lg rounded-3xl border border-white/10 shadow-2xl p-6 md:p-8 relative">
                        <button
                            onClick={() => setIsWizardOpen(false)}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-white mb-2">Kampanya Sihirbazı 🪄</h3>
                            <p className="text-slate-400">Yeni bir fırsat oluşturun.</p>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Kampanya Başlığı</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 transition-colors"
                                    placeholder="Örn: Kahve Alana Tatlı İkramı"
                                    value={newDeal.title}
                                    onChange={e => setNewDeal({ ...newDeal, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Açıklama</label>
                                <textarea
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 transition-colors h-24 resize-none"
                                    placeholder="Kampanya detaylarını giriniz..."
                                    value={newDeal.description}
                                    onChange={e => setNewDeal({ ...newDeal, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">İndirim Tipi</label>
                                    <select
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500 transition-colors"
                                        value={newDeal.discountType || 'percentage'}
                                        onChange={e => setNewDeal({ ...newDeal, discountType: e.target.value as 'percentage' | 'fixed' })}
                                    >
                                        <option value="percentage">Yüzde (%)</option>
                                        <option value="fixed">Tutar (TL)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">İndirim Değeri</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500 transition-colors"
                                        placeholder="Örn: 20"
                                        value={newDeal.discountValue || ''}
                                        onChange={e => setNewDeal({ ...newDeal, discountValue: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Kupon Kodu</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 transition-colors font-mono uppercase"
                                        placeholder="YAZ2024"
                                        value={newDeal.code}
                                        onChange={e => setNewDeal({ ...newDeal, code: e.target.value.toUpperCase() })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Son Tarih (Opsiyonel)</label>
                                    <input
                                        type="date"
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500 transition-colors"
                                        onChange={e => setNewDeal({ ...newDeal, expiresAt: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    onClick={handleGenerateCampaign}
                                    disabled={isGenerating}
                                    className="px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    {isGenerating ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Düşünüyor...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 size={18} />
                                            <span>Sihirli Oluştur</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setIsWizardOpen(false)}
                                    className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 transition-colors"
                                >
                                    Vazgeç
                                </button>
                                <button
                                    onClick={handleCreateCampaign}
                                    disabled={!newDeal.title || !newDeal.code}
                                    className="flex-1 py-3 bg-white text-black rounded-xl font-bold hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Oluştur
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsCampaigns;
