import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Zap, ScrollText, CreditCard, Heart, Gift, Trash2, AlertTriangle, Pencil, X, User, Calendar, Save, Loader2, Camera, History, ArrowUpRight, ArrowDownLeft, Plus, Package, Ticket, Timer, Copy, Bell, Settings, Moon, Sun, Check, ChevronRight, Share2, HelpCircle, MessageCircle, Phone, LayoutDashboard, Edit3, Disc, BarChart3, Info, Target, Medal } from 'lucide-react';
import { deleteUser } from 'firebase/auth';
import { doc, deleteDoc, updateDoc, collection, query, where, orderBy, limit, getDocs, addDoc, onSnapshot, getDoc, arrayRemove, setDoc, arrayUnion } from 'firebase/firestore';
import { auth, db, appId } from '../../../services/firebase';
import { SHOP_ID } from '../../../utils/constants';
import { CustomerProfile, Deal, Notification, Card, PointHistoryItem, Product as GlobalProduct, Order } from '../../../types';
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
import { getTier, getNextTier, getTierThreshold, getTierColor, getTierBadge } from '../../../utils/loyalty';
import MissionsModal from './MissionsModal';
import MissionsSettingsModal from './MissionsSettingsModal';
import { Challenge } from '../../../types';
import { calculateProgress, checkBadges } from '../../../utils/gamification';
import BadgesModal from './BadgesModal';
import TierBenefitsModal from './TierBenefitsModal';

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
    const [orders, setOrders] = useState<Order[]>([]);
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
    const [showBadgesModal, setShowBadgesModal] = useState(false);
    const [showTierModal, setShowTierModal] = useState(false);
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

    // --- MISSIONS LOGIC ---
    const [showMissionsModal, setShowMissionsModal] = useState(false);
    const [showMissionsSettingsModal, setShowMissionsSettingsModal] = useState(false);
    const [challenges, setChallenges] = useState<Challenge[]>([]);

    useEffect(() => {
        const challengesRef = collection(db, 'artifacts', appId, 'shops', SHOP_ID, 'challenges');
        const q = query(challengesRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedChallenges = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Challenge));

            // Merge with local progress / Checks
            const merged = fetchedChallenges.map(c => {
                let status: 'active' | 'completed' | 'claimed' = 'active';

                // Calculate automated progress
                const { progress, isCompleted } = calculateProgress(c, customerProfile);

                // Check claim status
                if (customerProfile?.['claimedChallenges']?.includes(c.id)) {
                    status = 'claimed';
                } else if (isCompleted) {
                    status = 'completed';
                }

                return { ...c, progress, status };
            });

            setChallenges(merged);
        });

        return () => unsubscribe();
    }, [customerProfile]);

    // Check Badges on Load
    useEffect(() => {
        if (!customerProfile || !customerProfile.uid) return;

        const newBadges = checkBadges(customerProfile);
        if (newBadges.length > 0) {
            const badgeIds = newBadges.map(b => b.id);

            // Update Firestore
            const userRef = doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'customers', auth.currentUser?.uid || 'unknown');

            // Optimistic update (optional, but good practice if we had local state for badges)
            // For now just DB update
            updateDoc(userRef, {
                badges: arrayUnion(...badgeIds)
            }).then(() => {
                showToast(`Tebrikler! ${newBadges.length} yeni rozet kazandınız! 🏅`, 'success');
            }).catch(err => console.error("Badge update error", err));
        }
    }, [customerProfile, showToast]);




    const handleClaimChallenge = async (challengeId: string) => {
        if (!auth.currentUser) return;

        const challenge = challenges.find(c => c.id === challengeId);
        if (!challenge || challenge.status !== 'active' || challenge.progress < challenge.target) return;

        try {
            // Update local state first for optimistic UI
            setChallenges(prev => prev.map(c =>
                c.id === challengeId ? { ...c, status: 'claimed' } : c
            ));

            // Add points to user
            const userRef = doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'customers', auth.currentUser.uid);
            await updateDoc(userRef, {
                points: (customerProfile?.points || 0) + challenge.reward,
                claimedChallenges: arrayUnion(challengeId)
            });

            // Log transaction
            await addDoc(collection(db, 'artifacts', appId, 'shops', SHOP_ID, 'transactions'), {
                customerId: auth.currentUser.uid,
                customerPhone: customerProfile?.phone,
                type: 'game',
                points: challenge.reward,
                desc: `Görev Tamamlandı: ${challenge.title} 🎯`,
                timestamp: new Date()
            });

            showToast(`${challenge.reward} Volt kazandınız!`, 'success');
        } catch (error) {
            console.error("Claim error:", error);
            showToast('Ödül alınırken hata oluştu.', 'error');
        }
    };

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
        } catch (error: unknown) {
            console.error(error);
            if ((error as { code?: string }).code === 'auth/requires-recent-login') {
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
            let allOrders: Order[] = [];

            // 1. Query by User ID (Primary)
            try {
                const q1 = query(ordersRef, where('customerId', '==', auth.currentUser.uid), orderBy('createdAt', 'desc'), limit(20));
                const snapshot1 = await getDocs(q1);
                allOrders = snapshot1.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Order));
            } catch (err) {
                console.error("Error fetching by customerId:", err);
                throw err; // Stop if primary query fails
            }

            // 2. Query by Phone (Secondary - Fail Safe)
            if (customerProfile?.phone) {
                try {
                    const q2 = query(ordersRef, where('customerPhone', '==', customerProfile.phone), orderBy('createdAt', 'desc'), limit(20));
                    const snapshot2 = await getDocs(q2);
                    const phoneOrders = snapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Order));
                    allOrders = [...allOrders, ...phoneOrders];
                } catch (err) {
                    // Likely missing index or permission issue. Log but don't block UI.
                    console.warn("Could not fetch orders by phone:", err);
                }
            }

            // Deduplicate
            const uniqueOrders = Array.from(new Map(allOrders.map(item => [item.id, item])).values());

            // Sort locally (since we merged two sorted lists, fine tuning)
            uniqueOrders.sort((a, b) => {
                const getDate = (item: Order) => {
                    if (!item.createdAt) return 0;
                    if (item.createdAt instanceof Date) return item.createdAt.getTime();
                    if (typeof item.createdAt === 'string') return new Date(item.createdAt).getTime();
                    // Firestore Timestamp
                    if ('seconds' in item.createdAt) return (item.createdAt as { seconds: number }).seconds * 1000;
                    return 0;
                };
                return getDate(b) - getDate(a);
            });

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
                        image: '🎁',
                        discountValue: 10,
                        discountType: 'percentage'
                    },
                    {
                        id: 'coffee_lover',
                        title: 'Kahve Tutkunları',
                        description: '3. Nesil kahvelerde 2 al 1 öde fırsatı.',
                        code: 'COFFEE2X1',
                        expiresAt: new Date(Date.now() + 86400000 * 2).toISOString(),
                        image: '☕',
                        discountValue: 0,
                        discountType: 'fixed' // 2al1öde mantığı farklı olabilir ama type hatasını çözmek için 'fixed' veya 'percentage' gerekli
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

    const currentPoints = customerProfile?.points || 0;
    const currentTier = getTier(currentPoints);
    const nextTier = getNextTier(currentTier);
    const nextThreshold = nextTier ? getTierThreshold(nextTier) : 0;
    const prevThreshold = getTierThreshold(currentTier);

    // Progress calculation
    // Avoid division by zero and cap at 100%
    let progress = 0;
    if (nextTier) {
        const totalGap = nextThreshold - prevThreshold;
        const currentProgress = currentPoints - prevThreshold;
        progress = Math.min(Math.max((currentProgress / totalGap) * 100, 0), 100);
    } else {
        progress = 100; // Max tier reached
    }

    return (

        <div className="min-h-screen bg-[#FDFBF7] pb-32">
            {/* Header Background - Standard Motto Style */}
            <div className="bg-[#432818] pt-12 pb-32 rounded-b-[3rem] relative overflow-hidden shadow-xl">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>

            <div className="px-5 -mt-24 relative z-10 max-w-lg mx-auto">
                {/* Profil Kartı - Clean Light Style */}
                <div className="bg-white rounded-[2.5rem] p-6 shadow-[0_20px_40px_rgba(67,40,24,0.08)] mb-8 text-center relative border border-[#432818]/5 overflow-hidden">
                    {/* Decorative Shine */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-[#D4AF37]/20 to-transparent rounded-full blur-2xl"></div>

                    <div className="relative inline-block mb-4">
                        <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl mx-auto relative z-10 p-1 bg-gradient-to-br from-[#FDFBF7] to-white">
                            <div className="w-full h-full rounded-full bg-[#f0f0f0] flex items-center justify-center text-4xl font-black text-[#432818] overflow-hidden relative">
                                {customerProfile?.photoURL ? (
                                    <img src={customerProfile.photoURL} alt="Profil" className="w-full h-full object-cover" />
                                ) : (
                                    customerProfile?.firstName?.charAt(0) || '?'
                                )}
                            </div>

                            {/* Tier Badge */}
                            <div
                                className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg border-2 border-white z-20"
                                style={{ backgroundColor: getTierColor(currentTier) }}
                                title={`${currentTier} Üye`}
                            >
                                {getTierBadge(currentTier)}
                            </div>
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-1 right-8 p-2 bg-[#432818] text-white rounded-full shadow-lg hover:scale-110 active:scale-90 transition-all z-20 border-2 border-white"
                        >
                            {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} strokeWidth={2.5} />}
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                    </div>

                    <h2 className="text-2xl font-black text-[#432818] mb-1 tracking-tight font-cinzel">{customerProfile?.firstName} {customerProfile?.lastName}</h2>
                    <p className={`text-[11px] font-black tracking-[0.2em] uppercase mb-1 ${isAdmin ? 'text-red-500' : 'text-[#D4AF37]'}`}>
                        {isAdmin ? 'YÖNETİCİ' : `${currentTier} ÜYE`}
                    </p>

                    {/* Progress Bar */}
                    {nextTier && (
                        <div className="max-w-[200px] mx-auto mb-6">
                            <div className="flex justify-between text-[9px] font-bold text-[#432818]/40 mb-1 uppercase tracking-wider">
                                <span>{currentPoints} Puan</span>
                                <span>Hedef: {nextThreshold}</span>
                            </div>
                            <div className="h-2 bg-[#432818]/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#D4AF37] rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                                    style={{ width: `${progress}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                                </div>
                            </div>
                            <p className="text-[9px] font-medium text-[#432818]/40 mt-1.5">
                                {nextTier} seviyesine ulaşmak için <span className="text-[#D4AF37] font-bold">{nextThreshold - currentPoints}</span> puan daha gerekli.
                            </p>
                        </div>
                    )}
                    {!nextTier && (
                        <div className="mb-6 mt-2">
                            <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#D4AF37] to-[#FDB931] text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                                ZİRVEDESİNİZ 🏆
                            </span>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        {/* Volt Balance Card */}
                        <div className="bg-[#432818] p-4 rounded-[2rem] shadow-lg shadow-[#432818]/20 relative overflow-hidden group aspect-[4/3] flex flex-col items-center justify-center">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            <div className="relative text-center">
                                <div className="text-[#D4AF37] mb-2 opacity-80">
                                    <Zap size={28} className="mx-auto" fill="currentColor" />
                                </div>
                                <div className="font-black text-white text-3xl font-cinzel tracking-tight tabular-nums leading-none mb-1">
                                    {customerProfile?.points || 0}
                                </div>
                                <div className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em]">BAKİYE</div>
                            </div>
                        </div>

                        {/* Missions Entry Button */}
                        <button
                            onClick={() => setShowMissionsModal(true)}
                            className="bg-[#D4AF37] p-4 rounded-[2rem] shadow-lg shadow-[#432818]/20 relative overflow-hidden group aspect-[4/3] flex flex-col items-center justify-center hover:scale-[1.02] active:scale-[0.98] transition-all border-2 border-white/20"
                        >
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative text-center">
                                <div className="text-white mb-2">
                                    <Target size={28} className="mx-auto" strokeWidth={2.5} />
                                </div>
                                <div className="font-black text-white text-xl font-cinzel tracking-tight leading-none mb-1">
                                    GÖREVLER
                                </div>
                                <div className="text-[9px] font-bold text-[#432818]/60 uppercase tracking-[0.2em] bg-white/30 rounded-full px-2 py-0.5 inline-block">
                                    {challenges.filter(c => c.status === 'active').length} AKTİF
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* New Grid Row for Badges & History */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        {/* Badges Button */}
                        <button
                            onClick={() => setShowBadgesModal(true)}
                            className="bg-[#FDFBF7] p-4 rounded-[2rem] shadow-sm relative overflow-hidden group aspect-[4/3] flex flex-col items-center justify-center hover:shadow-md transition-all border border-[#432818]/5"
                        >
                            <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] mb-2 group-hover:scale-110 transition-transform">
                                <Medal size={24} />
                            </div>
                            <div className="font-bold text-[#432818] text-sm uppercase tracking-wider">ROZETLER</div>
                            <div className="text-[9px] text-[#432818]/40 font-bold mt-1">
                                {customerProfile?.badges?.length || 0} Kazanıldı
                            </div>
                        </button>

                        {/* History Button (Existing functionality, moved/styled here for symmetry) */}
                        <button
                            onClick={() => setShowHistoryModal(true)}
                            className="bg-[#FDFBF7] p-4 rounded-[2rem] shadow-sm relative overflow-hidden group aspect-[4/3] flex flex-col items-center justify-center hover:shadow-md transition-all border border-[#432818]/5"
                        >
                            <div className="w-12 h-12 rounded-full bg-[#432818]/5 flex items-center justify-center text-[#432818]/60 mb-2 group-hover:scale-110 transition-transform">
                                <History size={24} />
                            </div>
                            <div className="font-bold text-[#432818] text-sm uppercase tracking-wider">GEÇMİŞ</div>
                            <div className="text-[9px] text-[#432818]/40 font-bold mt-1">
                                İşlem Takibi
                            </div>
                        </button>
                    </div>

                </div>

                {/* Menu Groups */}
                <div className="space-y-8">



                    {/* Missions Modal */}
                    <MissionsModal
                        isOpen={showMissionsModal}
                        onClose={() => setShowMissionsModal(false)}
                        challenges={challenges}
                        onClaim={handleClaimChallenge}
                    />

                    <BadgesModal
                        isOpen={showBadgesModal}
                        onClose={() => setShowBadgesModal(false)}
                        customerProfile={customerProfile}
                    />

                    {/* Missions Settings Modal */}
                    <MissionsSettingsModal
                        isOpen={showMissionsSettingsModal}
                        onClose={() => setShowMissionsSettingsModal(false)}
                        challenges={challenges}
                        showToast={showToast}
                    />

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
                                    icon={Target}
                                    label="GÖREV YÖNETİMİ"
                                    onClick={() => setShowMissionsSettingsModal(true)}
                                    value="AYARLAR"
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

                    {/* Tier Benefits Section */}
                    {customerProfile && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-50">
                            <h3 className="px-4 mb-3 text-[10px] font-black text-[#432818]/40 uppercase tracking-[0.2em]">Motto Club Ayrıcalıkları</h3>
                            <div className="bg-white rounded-[2rem] shadow-sm border border-[#432818]/5 overflow-hidden">
                                <button
                                    onClick={() => setShowTierModal(true)}
                                    className="w-full p-4 flex items-center justify-between hover:bg-[#FDFBF7] transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 flex items-center justify-center text-2xl">
                                            {getTierBadge(getTier(customerProfile?.points || 0))}
                                        </div>
                                        <div className="text-left">
                                            <div className="font-black text-sm text-[#432818]">{getTier(customerProfile?.points || 0)} ÜYE</div>
                                            <div className="text-[10px] text-[#432818]/50 font-bold uppercase tracking-wider">Ayrıcalıkları Gör</div>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} className="text-[#432818]/30 group-hover:text-[#D4AF37] transition-colors" />
                                </button>
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
                referrerReward={referrerReward}
                refereeReward={refereeReward}
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

            {/* Tier Benefits Modal */}
            <TierBenefitsModal
                isOpen={showTierModal}
                onClose={() => setShowTierModal(false)}
                customerProfile={customerProfile}
            />
        </div >
    );
};



export default AccountView;