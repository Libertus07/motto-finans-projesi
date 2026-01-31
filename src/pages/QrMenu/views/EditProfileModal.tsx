import React, { useState, useEffect } from 'react';
import { X, Loader2, Ticket } from 'lucide-react';
import { doc, updateDoc, collection, query, where, getDocs, increment, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, appId } from '../../../services/firebase';
import { SHOP_ID } from '../../../utils/constants';
import { CustomerProfile } from '../../../types';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    customerProfile: CustomerProfile | null;
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
    referrerReward: number;
    refereeReward: number;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, customerProfile, showToast, referrerReward, refereeReward }) => {
    const [formData, setFormData] = useState({
        firstName: customerProfile?.firstName || '',
        lastName: customerProfile?.lastName || '',
        email: customerProfile?.email || '',
        phone: customerProfile?.phone || '',
        birthday: customerProfile?.birthday || ''
    });
    const [inviteCode, setInviteCode] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isRedeeming, setIsRedeeming] = useState(false);

    useEffect(() => {
        if (isOpen && customerProfile) {
            setFormData({
                firstName: customerProfile.firstName || '',
                lastName: customerProfile.lastName || '',
                email: customerProfile.email || '',
                phone: customerProfile.phone || '',
                birthday: customerProfile.birthday || ''
            });
        }
    }, [isOpen, customerProfile]);

    const handleSave = async () => {
        if (!auth.currentUser || !customerProfile) return;

        setIsSaving(true);
        try {
            const userRef = doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'customers', auth.currentUser.uid);
            await updateDoc(userRef, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                birthday: formData.birthday
            });

            // Also update POS customer record if phone exists
            if (customerProfile.phone) {
                const posRef = doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'customers', customerProfile.phone);
                await updateDoc(posRef, {
                    name: formData.firstName.toUpperCase(),
                    surname: formData.lastName.toUpperCase(),
                    email: formData.email,
                    birthday: formData.birthday
                });
            }

            showToast('Profil bilgileriniz güncellendi.', 'success');
            onClose();
        } catch (error) {
            console.error('Profile update error:', error);
            showToast('Profil güncellenirken hata oluştu.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRedeemCode = async () => {
        if (!auth.currentUser || !inviteCode || inviteCode.length < 6) return;

        // Basic check: don't allow own code
        if (customerProfile?.personalInviteCode === inviteCode.toUpperCase()) {
            showToast('Kendi davet kodunuzu kullanamazsınız.', 'error');
            return;
        }

        setIsRedeeming(true);
        try {
            const customersRef = collection(db, 'artifacts', appId, 'shops', SHOP_ID, 'customers');
            const q = query(customersRef, where('personalInviteCode', '==', inviteCode.toUpperCase().trim()));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                showToast('Geçersiz davet kodu.', 'error');
                setIsRedeeming(false);
                return;
            }

            const referrerDoc = snapshot.docs[0];
            const referrerData = referrerDoc.data();

            // Distribute Rewards

            // 1. Reward Referrer
            await updateDoc(referrerDoc.ref, {
                points: increment(referrerReward),
                referralCount: increment(1)
            });
            await addDoc(collection(db, 'artifacts', appId, 'shops', SHOP_ID, 'transactions'), {
                customerPhone: referrerData.phone,
                customerId: referrerDoc.id,
                type: 'referral_bonus',
                points: referrerReward,
                desc: `Arkadaş Daveti Bonusu: ${customerProfile?.firstName} 🎉`,
                timestamp: serverTimestamp()
            });

            // 2. Reward User (Referee)
            const userRef = doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'customers', auth.currentUser.uid);
            await updateDoc(userRef, {
                referredBy: inviteCode.toUpperCase().trim(),
                points: increment(refereeReward)
            });
            await addDoc(collection(db, 'artifacts', appId, 'shops', SHOP_ID, 'transactions'), {
                customerPhone: customerProfile?.phone,
                customerId: auth.currentUser.uid,
                type: 'gift',
                points: refereeReward,
                desc: 'Davet Kodu Kullanımı 🎁',
                timestamp: serverTimestamp()
            });

            showToast(`Davet kodu onaylandı! ${refereeReward} Volt kazandınız.`, 'success');
            onClose();

        } catch (error) {
            console.error("Redeem error:", error);
            showToast('Kod kullanılırken hata oluştu.', 'error');
        } finally {
            setIsRedeeming(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
            <div className="bg-[#FDFBF7] w-full max-w-md rounded-[2rem] relative shadow-2xl animate-in zoom-in-95 duration-300 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-[#432818] tracking-tight">Profili Düzenle</h2>
                    <button onClick={onClose} className="p-2 hover:bg-[#432818]/5 rounded-full transition-all">
                        <X size={20} className="text-[#432818]/60" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="text"
                            placeholder="Ad"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            className="px-4 py-3 bg-white border border-[#432818]/10 rounded-xl outline-none focus:border-[#D4AF37] transition-all"
                        />
                        <input
                            type="text"
                            placeholder="Soyad"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            className="px-4 py-3 bg-white border border-[#432818]/10 rounded-xl outline-none focus:border-[#D4AF37] transition-all"
                        />
                    </div>
                    <input
                        type="email"
                        placeholder="E-posta"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-[#432818]/10 rounded-xl outline-none focus:border-[#D4AF37] transition-all"
                    />
                    <input
                        type="tel"
                        placeholder="Telefon"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-[#432818]/10 rounded-xl outline-none focus:border-[#D4AF37] transition-all"
                    />
                    <input
                        type="date"
                        value={formData.birthday}
                        onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-[#432818]/10 rounded-xl outline-none focus:border-[#D4AF37] transition-all"
                    />
                </div>

                {/* Invite Code Section (Only if not referred yet) */}
                {!customerProfile?.referredBy && (
                    <div className="mt-6 bg-[#F9F7F5] p-4 rounded-xl border border-[#432818]/5">
                        <div className="flex items-center gap-2 mb-2">
                            <Ticket size={14} className="text-[#D4AF37]" />
                            <span className="text-xs font-black text-[#432818] uppercase tracking-wider">Davet Kodum Var</span>
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Arkadaşının Kodu"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                className="flex-1 px-3 py-2 bg-white border border-[#432818]/10 rounded-lg outline-none text-sm font-bold tracking-wider placeholder:font-medium placeholder:tracking-normal focus:border-[#D4AF37] transition-colors uppercase"
                            />
                            <button
                                onClick={handleRedeemCode}
                                disabled={isRedeeming || inviteCode.length < 6}
                                className="bg-[#432818] text-[#D4AF37] px-4 rounded-lg font-bold text-xs disabled:opacity-50 hover:bg-[#2c1a0f] transition-colors"
                            >
                                {isRedeeming ? <Loader2 size={14} className="animate-spin" /> : 'KULLAN'}
                            </button>
                        </div>
                        <p className="text-[10px] text-[#432818]/40 mt-2 font-medium">
                            Kodu girerek {refereeReward} Volt kazanabilirsin.
                        </p>
                    </div>
                )}

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl font-bold text-[#432818]/60 hover:bg-white transition-all"
                    >
                        İptal
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 bg-[#432818] text-white py-3 rounded-xl font-bold hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : 'Kaydet'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProfileModal;
