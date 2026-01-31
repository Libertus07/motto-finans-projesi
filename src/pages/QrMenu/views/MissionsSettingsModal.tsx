import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Target, Save, CheckCircle2, Circle, Wand2 } from 'lucide-react';
import { Challenge } from '../../../types';
import { doc, collection, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, appId } from '../../../services/firebase';
import { SHOP_ID } from '../../../utils/constants';
import { generateAIMission } from '../../../utils/gamification';

interface MissionsSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    challenges: Challenge[];
    showToast: (message: string, type: 'success' | 'error') => void;
}

const MissionsSettingsModal: React.FC<MissionsSettingsModalProps> = ({ isOpen, onClose, challenges, showToast }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newChallenge, setNewChallenge] = useState<Partial<Challenge>>({
        title: '',
        description: '',
        reward: 50,
        target: 1,
        icon: '🎯',
        status: 'active',
        type: 'custom'
    });
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleAddChallenge = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newChallenge.title || !newChallenge.description) return;

        setIsLoading(true);
        try {
            await addDoc(collection(db, 'artifacts', appId, 'shops', SHOP_ID, 'challenges'), {
                ...newChallenge,
                createdAt: serverTimestamp()
            });
            showToast('Görev başarıyla eklendi.', 'success');
            setIsAdding(false);
            setNewChallenge({ title: '', description: '', reward: 50, target: 1, icon: '🎯', status: 'active' });
        } catch (error) {
            console.error(error);
            showToast('Görev eklenirken hata oluştu.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bu görevi silmek istediğinize emin misiniz?')) return;
        try {
            await deleteDoc(doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'challenges', id));
            showToast('Görev silindi.', 'success');
        } catch (error) {
            console.error(error);
            showToast('Silinemedi.', 'error');
        }
    };

    const handleAIGenerate = () => {
        const aiMission = generateAIMission();
        setNewChallenge({
            ...newChallenge,
            ...aiMission,
            status: 'active'
        });
        setIsAdding(true);
        showToast('Motto AI yeni bir görev oluşturdu! ✨', 'success');
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#432818]/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-[#FDFBF7] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-50 duration-300">
                {/* Header */}
                <div className="bg-[#432818] p-6 flex justify-between items-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                            <Target className="text-[#D4AF37]" size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-[#FDFBF7] font-cinzel tracking-tight leading-none">Görev Yönetimi</h2>
                            <p className="text-[#FDFBF7]/60 text-[10px] font-bold uppercase tracking-widest">Motto Missions</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="relative z-10 bg-white/10 text-white p-2 rounded-full hover:bg-white/20 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {/* Add New Challenge Form */}
                    {isAdding ? (
                        <form onSubmit={handleAddChallenge} className="bg-white p-5 rounded-3xl border border-[#432818]/10 shadow-lg mb-6 animate-in slide-in-from-top-4">
                            <h3 className="text-sm font-bold text-[#432818] mb-4 uppercase tracking-wider">Yeni Görev Oluştur</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-[#432818]/50 mb-1 uppercase">Başlık</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-[#FDFBF7] border border-[#432818]/10 rounded-xl px-4 py-2 text-[#432818] placeholder-[#432818]/30 focus:outline-none focus:border-[#D4AF37]"
                                        placeholder="Örn: Kahve Gurmesi"
                                        value={newChallenge.title}
                                        onChange={e => setNewChallenge({ ...newChallenge, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-[#432818]/50 mb-1 uppercase">Tip</label>
                                    <select
                                        className="w-full bg-[#FDFBF7] border border-[#432818]/10 rounded-xl px-4 py-2 text-[#432818] focus:outline-none focus:border-[#D4AF37]"
                                        value={newChallenge.type || 'custom'}
                                        onChange={e => setNewChallenge({ ...newChallenge, type: e.target.value as Challenge['type'] })}
                                    >
                                        <option value="custom">Özel (Manuel)</option>
                                        <option value="order_count">Sipariş Sayısı</option>
                                        <option value="spend_amount">Harcama Tutarı</option>
                                        <option value="profile">Profil Tamamlama</option>
                                        <option value="referral">Arkadaş Daveti</option>
                                        <option value="social">Sosyal Medya</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold text-[#432818]/50 mb-1 uppercase">Açıklama</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-[#FDFBF7] border border-[#432818]/10 rounded-xl px-4 py-2 text-[#432818]"
                                        placeholder="Görevin detayları..."
                                        value={newChallenge.description}
                                        onChange={e => setNewChallenge({ ...newChallenge, description: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-4 md:col-span-2">
                                    <div>
                                        <label className="block text-[10px] font-bold text-[#432818]/50 mb-1 uppercase">İkon</label>
                                        <input
                                            type="text"
                                            className="w-full bg-[#FDFBF7] border border-[#432818]/10 rounded-xl px-4 py-2 text-[#432818]"
                                            placeholder="🎯"
                                            value={newChallenge.icon}
                                            onChange={e => setNewChallenge({ ...newChallenge, icon: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-[#432818]/50 mb-1 uppercase">Ödül (Volt)</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full bg-[#FDFBF7] border border-[#432818]/10 rounded-xl px-4 py-2 text-[#432818]"
                                            value={newChallenge.reward}
                                            onChange={e => setNewChallenge({ ...newChallenge, reward: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-[#432818]/50 mb-1 uppercase">Hedef</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full bg-[#FDFBF7] border border-[#432818]/10 rounded-xl px-4 py-2 text-[#432818]"
                                            value={newChallenge.target}
                                            onChange={e => setNewChallenge({ ...newChallenge, target: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#432818]/60 hover:bg-[#432818]/5"
                                >
                                    Vazgeç
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-6 py-2 bg-[#432818] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:scale-105 transition-all shadow-lg flex items-center gap-2"
                                >
                                    {isLoading ? 'Kaydediliyor...' : <><Save size={14} /> Kaydet</>}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="flex gap-4 mb-6">
                            <button
                                onClick={() => setIsAdding(true)}
                                className="flex-1 py-4 border-2 border-dashed border-[#432818]/20 rounded-3xl text-[#432818]/40 font-bold hover:bg-[#432818]/5 hover:border-[#432818]/40 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={20} />
                                YENİ GÖREV EKLE
                            </button>
                            <button
                                onClick={handleAIGenerate}
                                className="flex-1 py-4 bg-gradient-to-r from-[#D4AF37] to-[#FDB931] rounded-3xl text-white font-bold hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-md"
                            >
                                <Wand2 size={20} className="animate-pulse" />
                                Motto AI ✨
                            </button>
                        </div>
                    )}

                    {/* Challenge List */}
                    <div className="space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                        {challenges.length > 0 ? (
                            challenges.map(challenge => (
                                <div key={challenge.id} className="bg-white p-4 rounded-2xl border border-[#432818]/5 shadow-sm flex items-center justify-between group hover:border-[#D4AF37]/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#FDFBF7] rounded-xl flex items-center justify-center text-2xl shadow-inner">
                                            {challenge.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[#432818]">{challenge.title}</h4>
                                            <p className="text-xs text-[#432818]/50">{challenge.description}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] font-bold bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-0.5 rounded-full">{challenge.reward} Volt</span>
                                                <span className="text-[10px] font-bold text-[#432818]/40">Hedef: {challenge.target}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleDelete(challenge.id)}
                                            className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Sil"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-[#432818]/40 text-sm font-medium">
                                Henüz görev tanımlanmamış.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MissionsSettingsModal;
