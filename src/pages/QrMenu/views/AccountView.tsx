import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Zap, ScrollText, CreditCard, Heart, Gift, Trash2, AlertTriangle, Pencil, X, User, Calendar, Save, Loader2, Camera, History, ArrowUpRight, ArrowDownLeft, Plus, Package, Ticket, Timer, Copy, Bell, Settings, Moon, Sun, Check, ChevronRight, Share2, HelpCircle, MessageCircle, Phone, LayoutDashboard, Edit3, Disc, BarChart3, Info } from 'lucide-react';
import { deleteUser } from 'firebase/auth';
import { doc, deleteDoc, updateDoc, collection, query, where, orderBy, limit, getDocs, addDoc, onSnapshot, getDoc, arrayRemove, setDoc } from 'firebase/firestore';
import { auth, db, appId } from '../../../services/firebase';
import { SHOP_ID } from '../../../utils/constants';
import { CustomerProfile, Deal, Notification, Card, PointHistoryItem, Product as GlobalProduct } from '../../../types';
import { useToast } from '../components/ToastProvider';
import PointHistoryModal from './PointHistoryModal';
import CardsModal from './CardsModal';
import WheelSettingsModal from './WheelSettingsModal';
import WheelStatsModal from './WheelStatsModal';
import FavoritesModal from './FavoritesModal';
import OrdersModal from './OrdersModal';
import DealsModal from './DealsModal';
import NotificationsModal from './NotificationsModal';
import SettingsModal from './SettingsModal';
import WelcomeBonusModal from './WelcomeBonusModal';
import AdminBonusModal from './AdminBonusModal';
import InviteFriendModal from './InviteFriendModal';
import HelpModal from './HelpModal';
import EditProfileModal from './EditProfileModal';

interface AccountViewProps {
    customerProfile: CustomerProfile | null;
    onSignOut: () => void;
    theme: string;
    setTheme: (theme: string) => void;
    language: string;
    setLanguage: (lang: string) => void;
    t: (key: string) => string;
    isAdmin: boolean;
    // Admin settings
    welcomeBonus: number;
    referrerReward: number;
    refereeReward: number;
}

// Varsayılan Çark Ayarları (Yönetici paneli ilk açılış için)
interface WheelPrize {
    id: string;
    label: string;
    type: string; // 'none' | 'points'
    value: number;
    weight: number;
    color: string;
    icon: string;
}

const defaultWheelPrizes: WheelPrize[] = [
    { id: 'lose', label: 'Pas', type: 'none', weight: 40, color: '#9E9E9E', icon: 'Frown', value: 0 },
    { id: 'points_50', label: '50 Volt', type: 'points', value: 50, weight: 30, color: '#4CAF50', icon: 'Zap' },
    { id: 'lose_extra', label: 'Pas', type: 'none', value: 0, weight: 10, color: '#757575', icon: 'Frown' },
    { id: 'points_100', label: '100 Volt', type: 'points', value: 100, weight: 15, color: '#FFC107', icon: 'Zap' },
    { id: 'points_25', label: '25 Volt', type: 'points', value: 25, weight: 5, color: '#2196F3', icon: 'Zap' }
];

const AccountView: React.FC<AccountViewProps> = ({ customerProfile, onSignOut, theme, setTheme, language, setLanguage, t, isAdmin, welcomeBonus, referrerReward, refereeReward }) => {
    const { showToast } = useToast();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [pointHistory, setPointHistory] = useState<PointHistoryItem[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [showCardsModal, setShowCardsModal] = useState(false);
    const [cards, setCards] = useState<Card[]>([]);
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [newCard, setNewCard] = useState({ holderName: '', number: '', expiry: '', cvc: '' });
    const [cardLoading, setCardLoading] = useState(false);
    const [showFavoritesModal, setShowFavoritesModal] = useState(false);
    const [favoriteProducts, setFavoriteProducts] = useState<GlobalProduct[]>([]);
    const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
    const [showOrdersModal, setShowOrdersModal] = useState(false);
    const [orders, setOrders] = useState<any[]>([]); // Orders are complex, keeping any or will define Order later
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const [showDealsModal, setShowDealsModal] = useState(false);
    const [deals, setDeals] = useState<Deal[]>([]);
    const [isLoadingDeals, setIsLoadingDeals] = useState(false);
    const [showNotificationsModal, setShowNotificationsModal] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [showAdminBonusModal, setShowAdminBonusModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Settings Modals
    const [showWelcomeSettingsModal, setShowWelcomeSettingsModal] = useState(false);
    const [showWheelSettingsModal, setShowWheelSettingsModal] = useState(false);
    const [wheelPrizes, setWheelPrizes] = useState<WheelPrize[]>([]);

    const [showWheelStatsModal, setShowWheelStatsModal] = useState(false);
    const [wheelStats, setWheelStats] = useState({ totalSpins: 0, totalPoints: 0, prizeDistribution: {} as Record<string, number> });
    const [isLoadingStats, setIsLoadingStats] = useState(false);

    const [newWelcomeBonus, setNewWelcomeBonus] = useState((welcomeBonus || 0).toString());
    const [newReferrerReward, setNewReferrerReward] = useState((referrerReward || 0).toString());
    const [newRefereeReward, setNewRefereeReward] = useState((refereeReward || 0).toString());

    // Eski kullanıcılar için davet kodu oluşturma (Backfill)
    useEffect(() => {
        if (customerProfile && !customerProfile.personalInviteCode && auth.currentUser) {
            const generateAndSaveCode = async () => {
                const code = `MOTTO-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
                try {
                    const userRef = doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'customers', auth.currentUser!.uid);
                    await updateDoc(userRef, { personalInviteCode: code });

                    if (customerProfile.phone) {
                        const posRef = doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'customers', customerProfile.phone);
                        await updateDoc(posRef, { personalInviteCode: code });
                    }
                } catch (e) {
                    console.error("Error generating invite code", e);
                }
            };
            generateAndSaveCode();
        }
    }, [customerProfile]);

    useEffect(() => {
        if (showCardsModal && auth.currentUser) {
            const q = query(collection(db, 'artifacts', appId, 'shops', SHOP_ID, 'customers', auth.currentUser.uid, 'cards'), orderBy('createdAt', 'desc'));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                setCards(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Card)));
            });
            return () => unsubscribe();
        }
    }, [showCardsModal]);

    // Menü butonları için yardımcı bileşen
    interface MenuItemProps {
        icon: React.ElementType;
        label: string;
        onClick: () => void;
        danger?: boolean;
        value?: string;
    }
    const MenuItem = ({ icon: Icon, label, onClick, danger = false, value = "" }: MenuItemProps) => (
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between p-5 bg-white hover:bg-[#FDFBF7] transition-all group border-b border-[#432818]/5 last:border-none"
        >
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${danger ? 'bg-red-50 text-red-500' : 'bg-[#432818]/5 text-[#432818] group-hover:bg-[#432818] group-hover:text-white'}`}>
                    <Icon size={18} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col items-start text-left">
                    <span className={`font-bold text-sm tracking-tight ${danger ? 'text-red-500' : 'text-[#432818]'}`}>{label}</span>
                    {value && <span className="text-[10px] font-bold text-[#432818]/50 uppercase">{value}</span>}
                </div>
            </div>
            <ChevronRight size={18} className="text-[#432818]/20 group-hover:text-[#432818] transform group-hover:translate-x-1 transition-all" />
        </button>
    );

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !auth.currentUser) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showToast('Lütfen bir resim dosyası seçin.', 'error');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast('Dosya boyutu 5MB\'dan küçük olmalıdır.', 'error');
            return;
        }

        setIsUploading(true);
        try {
            const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
            const { storage } = await import('../../../services/firebase');

            const storageRef = ref(storage, `profile-photos/${auth.currentUser.uid}`);
            await uploadBytes(storageRef, file);
            const photoURL = await getDownloadURL(storageRef);

            // Update Firestore
            const userRef = doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'customers', auth.currentUser.uid);
            await updateDoc(userRef, { photoURL });

            showToast('Profil fotoğrafı güncellendi.', 'success');
        } catch (error) {
            console.error('Photo upload error:', error);
            showToast('Fotoğraf yüklenirken hata oluştu.', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve tüm puanlarınız silinir.")) return;

        setIsDeleting(true);
        try {
            const user = auth.currentUser;
            if (user) {
                // 1. Firestore verisini sil
                await deleteDoc(doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'customers', user.uid));
                // 2. Auth kullanıcısını sil
                await deleteUser(user);
                showToast('Hesabınız başarıyla silindi.', 'success');
            }
        } catch (error: any) {
            console.error(error);
            if (error.code === 'auth/requires-recent-login') {
                showToast('Güvenlik gereği hesabınızı silmek için yeniden giriş yapmalısınız.', 'error');
                onSignOut();
            } else {
                showToast('Hesap silinirken bir hata oluştu.', 'error');
            }
        } finally {
            setIsDeleting(false);
        }
    };

    const handleShowHistory = async () => {
        if (!customerProfile?.phone) {
            showToast('Telefon numarası bulunamadı.', 'error');
            return;
        }

        setIsLoadingHistory(true);
        setShowHistoryModal(true);
        try {
            const transactionsRef = collection(db, 'artifacts', appId, 'shops', SHOP_ID, 'transactions');
            const q = query(
                transactionsRef,
                where('customerPhone', '==', customerProfile.phone),
                orderBy('timestamp', 'desc'),
                limit(20)
            );

            const querySnapshot = await getDocs(q);
            const history = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PointHistoryItem));
            setPointHistory(history);
        } catch (error) {
            console.error("Geçmiş yüklenirken hata:", error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handleAddCard = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth.currentUser) return;

        if (newCard.number.replace(/\s/g, '').length < 16 || newCard.expiry.length < 5 || newCard.cvc.length < 3) {
            showToast('Lütfen kart bilgilerini kontrol edin.', 'error');
            return;
        }

        setCardLoading(true);
        try {
            const maskedNumber = `**** **** **** ${newCard.number.replace(/\s/g, '').slice(-4)}`;
            const cardType = newCard.number.startsWith('4') ? 'Visa' : newCard.number.startsWith('5') ? 'MasterCard' : 'Kart';

            await addDoc(collection(db, 'artifacts', appId, 'shops', SHOP_ID, 'customers', auth.currentUser.uid, 'cards'), {
                holderName: newCard.holderName,
                maskedNumber,
                expiry: newCard.expiry,
                type: cardType,
                createdAt: new Date().toISOString()
            });

            showToast('Kart başarıyla eklendi.', 'success');
            setIsAddingCard(false);
            setNewCard({ holderName: '', number: '', expiry: '', cvc: '' });
        } catch (error) {
            console.error(error);
            showToast('Kart eklenirken hata oluştu.', 'error');
        } finally {
            setCardLoading(false);
        }
    };

    const handleDeleteCard = async (cardId: string) => {
        if (!auth.currentUser || !window.confirm('Bu kartı silmek istediğinize emin misiniz?')) return;
        try {
            await deleteDoc(doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'customers', auth.currentUser.uid, 'cards', cardId));
            showToast('Kart silindi.', 'success');
        } catch (error) {
            console.error(error);
            showToast('Silme işlemi başarısız.', 'error');
        }
    };

    const handleShowFavorites = async () => {
        if (!customerProfile?.favorites || customerProfile.favorites.length === 0) {
            showToast('Henüz favori ürününüz bulunmuyor.', 'error');
            return;
        }

        setIsLoadingFavorites(true);
        setShowFavoritesModal(true);

        try {
            const promises = customerProfile.favorites.map((id: string) =>
                getDoc(doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'products', id))
            );

            const snapshots = await Promise.all(promises);
            const products = snapshots
                .filter(snap => snap.exists())
                .map(snap => ({ id: snap.id, ...snap.data() } as GlobalProduct));

            setFavoriteProducts(products);
        } catch (error) {
            console.error(error);
            showToast('Favoriler yüklenirken hata oluştu.', 'error');
        } finally {
            setIsLoadingFavorites(false);
        }
    };

    const handleRemoveFavorite = async (productId: string) => {
        if (!auth.currentUser) return;
        try {
            const userRef = doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'customers', auth.currentUser.uid);
            await updateDoc(userRef, {
                favorites: arrayRemove(productId)
            });
            setFavoriteProducts(prev => prev.filter(p => p.id !== productId));
            showToast('Favorilerden kaldırıldı.', 'success');
        } catch (error) {
            console.error(error);
            showToast('İşlem başarısız.', 'error');
        }
    };

    const handleShowOrders = async () => {
        if (!auth.currentUser) return;

        setIsLoadingOrders(true);
        setShowOrdersModal(true);
        try {
            const ordersRef = collection(db, 'artifacts', appId, 'shops', SHOP_ID, 'orders');
            let allOrders: any[] = [];

            // 1. Query by User ID (Primary)
            try {
                const q1 = query(ordersRef, where('customerId', '==', auth.currentUser.uid), orderBy('createdAt', 'desc'), limit(20));
                const snapshot1 = await getDocs(q1);
                allOrders = snapshot1.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch (err) {
                console.error("Error fetching by customerId:", err);
                throw err; // Stop if primary query fails
            }

            // 2. Query by Phone (Secondary - Fail Safe)
            if (customerProfile?.phone) {
                try {
                    const q2 = query(ordersRef, where('customerPhone', '==', customerProfile.phone), orderBy('createdAt', 'desc'), limit(20));
                    const snapshot2 = await getDocs(q2);
                    const phoneOrders = snapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    allOrders = [...allOrders, ...phoneOrders];
                } catch (err) {
                    // Likely missing index or permission issue. Log but don't block UI.
                    console.warn("Could not fetch orders by phone:", err);
                }
            }

            // Deduplicate
            const uniqueOrders = Array.from(new Map(allOrders.map(item => [item.id, item])).values());

            // Sort locally (since we merged two sorted lists, fine tuning)
            uniqueOrders.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            setOrders(uniqueOrders);
        } catch (error) {
            console.error("Siparişler yüklenirken hata:", error);
            showToast('Sipariş geçmişi yüklenemedi.', 'error');
        } finally {
            setIsLoadingOrders(false);
        }
    };

    const handleShowDeals = async () => {
        setIsLoadingDeals(true);
        setShowDealsModal(true);
        try {
            const campaignsRef = collection(db, 'artifacts', appId, 'shops', SHOP_ID, 'campaigns');
            const q = query(campaignsRef, where('isActive', '==', true), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);

            let activeDeals: Deal[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Deal));

            if (activeDeals.length === 0) {
                // Demo verileri (Eğer veritabanı boşsa gösterilecek örnekler)
                activeDeals = [
                    {
                        id: 'welcome',
                        title: 'Hoş Geldin Hediyesi',
                        description: 'İlk siparişinde geçerli %10 indirim seni bekliyor!',
                        code: 'WELCOME10',
                        expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
                        image: '🎁'
                    },
                    {
                        id: 'coffee_lover',
                        title: 'Kahve Tutkunları',
                        description: '3. Nesil kahvelerde 2 al 1 öde fırsatı.',
                        code: 'COFFEE2X1',
                        expiresAt: new Date(Date.now() + 86400000 * 2).toISOString(),
                        image: '☕'
                    }
                ];
            }
            setDeals(activeDeals);
        } catch (error) {
            console.error("Kampanyalar yüklenirken hata:", error);
        } finally {
            setIsLoadingDeals(false);
        }
    };

    const handleShowNotifications = async () => {
        if (!auth.currentUser) return;

        setIsLoadingNotifications(true);
        setShowNotificationsModal(true);
        try {
            const notifsRef = collection(db, 'artifacts', appId, 'shops', SHOP_ID, 'customers', auth.currentUser.uid, 'notifications');
            const q = query(notifsRef, orderBy('createdAt', 'desc'), limit(20));
            const snapshot = await getDocs(q);

            let data: Notification[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));

            if (data.length === 0) {
                data = [
                    {
                        id: 'welcome',
                        title: 'Aramıza Hoş Geldin!',
                        message: 'Motto Club ayrıcalıklarından yararlanmaya hemen başla.',
                        createdAt: new Date().toISOString(),
                        read: false
                    }
                ];
            }

            setNotifications(data);
        } catch (error) {
            console.error("Bildirimler yüklenirken hata:", error);
        } finally {
            setIsLoadingNotifications(false);
        }
    };

    const handleSaveWheelSettings = async () => {
        try {
            // Toplam ağırlık kontrolü yapılabilir (opsiyonel)
            await setDoc(doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'settings', 'wheel'), {
                prizes: wheelPrizes
            }, { merge: true });
            showToast('Çark ayarları kaydedildi.', 'success');
            setShowWheelSettingsModal(false);
        } catch (error) {
            console.error(error);
            showToast('Kaydetme başarısız.', 'error');
        }
    };

    const handleShowWheelStats = async () => {
        setIsLoadingStats(true);
        setShowWheelStatsModal(true);
        try {
            const transactionsRef = collection(db, 'artifacts', appId, 'shops', SHOP_ID, 'transactions');
            const q = query(transactionsRef, where('type', '==', 'game'));
            const snapshot = await getDocs(q);

            let totalSpins = 0;
            let totalPoints = 0;
            const prizeDistribution: Record<string, number> = {};

            snapshot.forEach(doc => {
                const data = doc.data();
                totalSpins++;
                totalPoints += (data.points || 0);

                // Açıklamadan ödül ismini çek: "Çark Ödülü: 50 Volt 🎡" -> "50 Volt"
                let label = data.desc || 'Bilinmeyen';
                if (label.includes('Çark Ödülü:')) {
                    label = label.replace('Çark Ödülü:', '').replace('🎡', '').trim();
                }
                prizeDistribution[label] = (prizeDistribution[label] || 0) + 1;
            });

            setWheelStats({ totalSpins, totalPoints, prizeDistribution });
        } catch (error) {
            console.error("Stats error:", error);
            showToast('İstatistikler yüklenemedi.', 'error');
        } finally {
            setIsLoadingStats(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] pb-32">
            {/* Header Background - Standard Motto Style */}
            <div className="bg-[#432818] pt-12 pb-24 rounded-b-[3rem] relative overflow-hidden shadow-xl">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>

            <div className="px-5 -mt-20 relative z-10 max-w-lg mx-auto">
                {/* Profil Kartı - Clean Light Style */}
                <div className="bg-white rounded-[2.5rem] p-6 shadow-[0_20px_40px_rgba(67,40,24,0.08)] mb-8 text-center relative border border-[#432818]/5">

                    <div className="relative inline-block mb-4">
                        <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl mx-auto relative z-10">
                            <div className="w-full h-full rounded-full bg-[#FDFBF7] flex items-center justify-center text-4xl font-black text-[#432818] overflow-hidden">
                                {customerProfile?.photoURL ? (
                                    <img src={customerProfile.photoURL} alt="Profil" className="w-full h-full object-cover" />
                                ) : (
                                    customerProfile?.firstName?.charAt(0) || '?'
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={false} // This button is now part of the main view, not the modal. The modal will handle its own upload state.
                            className="absolute bottom-0 right-0 p-2.5 bg-[#432818] text-white rounded-xl shadow-lg hover:scale-110 active:scale-90 transition-all z-20"
                        >
                            {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} strokeWidth={2.5} />}
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                    </div>

                    <h2 className="text-2xl font-black text-[#432818] mb-1 tracking-tight font-cinzel">{customerProfile?.firstName} {customerProfile?.lastName}</h2>
                    <p className={`text-[10px] font-bold tracking-[0.2em] uppercase mb-6 ${isAdmin ? 'text-red-500' : 'text-[#432818]/40'}`}>
                        {isAdmin ? 'YÖNETİCİ HESABI' : 'Motto Club Üyesi'}
                    </p>

                    <div className="flex justify-center gap-4">
                        <div className="bg-[#FDFBF7] px-8 py-4 rounded-3xl border border-[#432818]/5 min-w-[140px]">
                            <div className="text-[#D4AF37] mb-1">
                                <Zap size={24} className="mx-auto" fill="currentColor" />
                            </div>
                            <div className="font-black text-[#432818] text-3xl font-cinzel tracking-tight tabular-nums leading-none">
                                {customerProfile?.points || 0}
                            </div>
                            <div className="text-[9px] font-bold text-[#432818]/30 uppercase tracking-[0.2em] mt-2">VOLT BAKİYE</div>
                        </div>
                    </div>
                </div>

                {/* Menu Groups */}
                <div className="space-y-8">
                    {/* Admin Group */}
                    {isAdmin && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <h3 className="px-4 mb-3 text-[10px] font-black text-[#432818]/40 uppercase tracking-[0.2em]">Yönetim Paneli</h3>
                            <div className="bg-white rounded-[2rem] shadow-sm border border-[#432818]/5 divide-y divide-[#432818]/5 overflow-hidden">
                                <MenuItem
                                    icon={LayoutDashboard}
                                    label={t('admin_panel')}
                                    onClick={() => window.location.href = '/pos'}
                                />
                                <MenuItem
                                    icon={BarChart3}
                                    label="ÇARK İSTATİSTİKLERİ"
                                    onClick={handleShowWheelStats}
                                    value="ANALİZ"
                                />
                                <MenuItem
                                    icon={Disc}
                                    label="ÇARK ÖDÜL AYARLARI"
                                    onClick={async () => {
                                        const snap = await getDoc(doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'settings', 'wheel'));
                                        if (snap.exists() && snap.data().prizes && snap.data().prizes.length > 0) {
                                            setWheelPrizes(snap.data().prizes);
                                        } else {
                                            setWheelPrizes(defaultWheelPrizes);
                                        }
                                        setShowWheelSettingsModal(true);
                                    }}
                                    value="AYARLAR"
                                />
                                <MenuItem
                                    icon={Gift}
                                    label="HOŞGELDİN BONUSU"
                                    onClick={() => {
                                        setNewWelcomeBonus((welcomeBonus || 0).toString());
                                        setShowWelcomeSettingsModal(true);
                                    }}
                                    value={`${welcomeBonus || 0} VOLT`}
                                />
                                <MenuItem
                                    icon={Share2}
                                    label="DAVET ÖDÜLLERİ"
                                    onClick={() => {
                                        setNewReferrerReward((referrerReward || 0).toString());
                                        setNewRefereeReward((refereeReward || 0).toString());
                                        setShowAdminBonusModal(true);
                                    }}
                                    value={`${referrerReward || 0}/${refereeReward || 0} V`}
                                />
                            </div>
                        </div>
                    )}

                    {/* Group 1 */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                        <h3 className="px-4 mb-3 text-[10px] font-black text-[#432818]/40 uppercase tracking-[0.2em]">Hesap İşlemleri</h3>
                        <div className="bg-white rounded-[2rem] shadow-sm border border-[#432818]/5 divide-y divide-[#432818]/5 overflow-hidden">
                            <MenuItem icon={User} label={t('edit_profile')} onClick={() => setShowEditModal(true)} />
                            <MenuItem icon={ScrollText} label={t('orders')} onClick={handleShowOrders} />
                            <MenuItem icon={CreditCard} label={t('cards')} onClick={() => setShowCardsModal(true)} />
                            <MenuItem icon={History} label={t('history')} onClick={handleShowHistory} />
                        </div>
                    </div>

                    {/* Group 2 */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                        <h3 className="px-4 mb-3 text-[10px] font-black text-[#432818]/40 uppercase tracking-[0.2em]">Fırsatlar</h3>
                        <div className="bg-white rounded-[2rem] shadow-sm border border-[#432818]/5 divide-y divide-[#432818]/5 overflow-hidden">
                            <MenuItem icon={Heart} label={t('favorites')} onClick={handleShowFavorites} />
                            <MenuItem icon={Gift} label={t('deals')} onClick={handleShowDeals} />
                            <MenuItem icon={Share2} label={t('invite_friend')} onClick={() => setShowInviteModal(true)} />
                        </div>
                    </div>

                    {/* Group 3 */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                        <h3 className="px-4 mb-3 text-[10px] font-black text-[#432818]/40 uppercase tracking-[0.2em]">Uygulama</h3>
                        <div className="bg-white rounded-[2rem] shadow-sm border border-[#432818]/5 divide-y divide-[#432818]/5 overflow-hidden">
                            <MenuItem icon={Bell} label={t('notifications')} onClick={handleShowNotifications} />
                            <MenuItem icon={HelpCircle} label={t('help_support')} onClick={() => setShowHelpModal(true)} />
                            <MenuItem icon={Settings} label={t('settings')} onClick={() => setShowSettingsModal(true)} />
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={onSignOut}
                        className="w-full bg-[#432818] text-white p-5 rounded-[2rem] font-black shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                    >
                        <LogOut size={20} strokeWidth={2.5} />
                        <span className="tracking-widest">GÜVENLİ ÇIKIŞ</span>
                    </button>

                    {/* Delete Account */}
                    <div className="text-center pt-2">
                        <button
                            onClick={handleDeleteAccount}
                            disabled={isDeleting}
                            className="text-[10px] font-bold text-red-400 hover:text-red-500 transition-all flex items-center justify-center gap-2 mx-auto uppercase tracking-wider"
                        >
                            {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                            {t('delete_account')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <EditProfileModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                customerProfile={customerProfile}
                showToast={showToast}
            />

            {/* Point History Modal */}
            {/* Point History Modal */}
            <PointHistoryModal
                isOpen={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
                pointHistory={pointHistory}
                isLoadingHistory={isLoadingHistory}
            />

            {/* Cards Modal */}
            {/* Cards Modal */}
            <CardsModal
                isOpen={showCardsModal}
                onClose={() => setShowCardsModal(false)}
                cards={cards}
                isAddingCard={isAddingCard}
                setIsAddingCard={setIsAddingCard}
                newCard={newCard}
                setNewCard={setNewCard}
                cardLoading={cardLoading}
                onAddCard={handleAddCard}
                onDeleteCard={handleDeleteCard}
            />

            {/* Favorites Modal */}
            {/* Favorites Modal */}
            <FavoritesModal
                isOpen={showFavoritesModal}
                onClose={() => setShowFavoritesModal(false)}
                favoriteProducts={favoriteProducts}
                isLoadingFavorites={isLoadingFavorites}
                onRemoveFavorite={handleRemoveFavorite}
            />

            {/* Orders Modal */}
            {/* Orders Modal */}
            <OrdersModal
                isOpen={showOrdersModal}
                onClose={() => setShowOrdersModal(false)}
                orders={orders}
                isLoadingOrders={isLoadingOrders}
                t={t}
            />

            {/* Deals Modal */}
            {/* Deals Modal */}
            <DealsModal
                isOpen={showDealsModal}
                onClose={() => setShowDealsModal(false)}
                deals={deals}
                isLoadingDeals={isLoadingDeals}
                showToast={showToast}
            />

            {/* Notifications Modal */}
            {/* Notifications Modal */}
            <NotificationsModal
                isOpen={showNotificationsModal}
                onClose={() => setShowNotificationsModal(false)}
                notifications={notifications}
                isLoadingNotifications={isLoadingNotifications}
            />

            {/* Wheel Stats Modal */}
            {/* Wheel Stats Modal */}
            <WheelStatsModal
                isOpen={showWheelStatsModal}
                onClose={() => setShowWheelStatsModal(false)}
                wheelStats={wheelStats}
                isLoadingStats={isLoadingStats}
            />

            {/* Settings Modal */}
            {/* Settings Modal */}
            <SettingsModal
                isOpen={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
                theme={theme}
                setTheme={setTheme}
                language={language}
                setLanguage={setLanguage}
                showToast={showToast}
            />

            {/* Welcome Bonus Modal */}
            {/* Welcome Bonus Modal */}
            <WelcomeBonusModal
                isOpen={showWelcomeSettingsModal}
                onClose={() => setShowWelcomeSettingsModal(false)}
                newWelcomeBonus={newWelcomeBonus}
                setNewWelcomeBonus={setNewWelcomeBonus}
                onSave={async () => {
                    await setDoc(doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'settings', 'loyalty'), { welcomeBonus: Number(newWelcomeBonus) }, { merge: true });
                    showToast('Hoşgeldin bonusu güncellendi!', 'success');
                    setShowWelcomeSettingsModal(false);
                }}
            />

            {/* Wheel Settings Modal */}
            <WheelSettingsModal
                isOpen={showWheelSettingsModal}
                onClose={() => setShowWheelSettingsModal(false)}
                wheelPrizes={wheelPrizes}
                setWheelPrizes={setWheelPrizes}
                onSave={handleSaveWheelSettings}
            />

            {/* Admin Bonus Modal */}
            {/* Admin Bonus Modal */}
            <AdminBonusModal
                isOpen={showAdminBonusModal}
                onClose={() => setShowAdminBonusModal(false)}
                newReferrerReward={newReferrerReward}
                setNewReferrerReward={setNewReferrerReward}
                newRefereeReward={newRefereeReward}
                setNewRefereeReward={setNewRefereeReward}
                onSave={async () => {
                    await setDoc(doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'settings', 'loyalty'), {
                        referrerReward: Number(newReferrerReward),
                        refereeReward: Number(newRefereeReward)
                    }, { merge: true });
                    showToast('Ödül ayarları güncellendi!', 'success');
                    setShowAdminBonusModal(false);
                }}
            />

            {/* Invite Friend Modal */}
            {/* Invite Friend Modal */}
            <InviteFriendModal
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                customerProfile={customerProfile}
                showToast={showToast}
                t={t}
            />

            {/* Help Modal */}
            {/* Help Modal */}
            <HelpModal
                isOpen={showHelpModal}
                onClose={() => setShowHelpModal(false)}
                t={t}
            />
        </div >
    );
};



export default AccountView;