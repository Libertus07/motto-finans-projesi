import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, onSnapshot, doc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { db, appId, auth } from '../../../services/firebase';
import { SHOP_ID } from '../../../utils/constants';
import { Product, CustomerProfile } from '../../../types';
import { useToast } from '../components/ToastProvider';

export const useQrMenuData = () => {
    const { showToast } = useToast();
    const [searchParams] = useSearchParams();
    const tableId = searchParams.get('table');

    // Views
    const [view, setView] = useState('home');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    // Data State
    const [cart, setCart] = useState<any[]>([]); // Keep any for cart as it has dynamic customizations for now
    const [searchQuery, setSearchQuery] = useState('');
    const [tableInfo, setTableInfo] = useState<any>(null); // Keep any for tableInfo as it's modified dynamically here
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Auth State
    const [isMember, setIsMember] = useState(false);
    const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

    // Gamification & Engagement State
    const [isWheelOpen, setIsWheelOpen] = useState(false);
    const [isOracleOpen, setIsOracleOpen] = useState(false);
    const [isScratchOpen, setIsScratchOpen] = useState(false);
    const [isHubOpen, setIsHubOpen] = useState(false);
    const [isAssistantOpen, setIsAssistantOpen] = useState(false);
    const [upsellItem, setUpsellItem] = useState<Product | null>(null);

    // Item Detail State
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [flyingItems, setFlyingItems] = useState<any[]>([]);
    const [welcomeBonus, setWelcomeBonus] = useState(50);
    const [referrerReward, setReferrerReward] = useState(50);
    const [refereeReward, setRefereeReward] = useState(50);

    // Global Settings (Dil ve Tema)
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'tr');

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') root.classList.add('dark');
        else root.classList.remove('dark');
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const t = (key: string) => translations[language]?.[key] || key;


    // --- INITIALIZATION ---
    useEffect(() => {
        let unsubProfile: (() => void) | null = null;
        let unsubSettings: (() => void) | null = null;
        let unsubTable: (() => void) | null = null;
        let unsubAuth: (() => void) | null = null;
        let presenceInterval: NodeJS.Timeout | null = null;

        unsubAuth = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                if (currentUser.isAnonymous) {
                    setIsMember(false);
                    setCustomerProfile(null);
                } else {
                    setIsMember(true);
                    unsubProfile = onSnapshot(doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'customers', currentUser.uid), (doc) => {
                        if (doc.exists()) setCustomerProfile(doc.data() as CustomerProfile);
                    });
                }
            } else {
                try { signInAnonymously(auth).catch(e => console.error("Anon sign in error:", e)); } catch (e) { console.error("Anon sign in exception:", e); }
            }
        });

        if (tableId) {
            unsubTable = onSnapshot(doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'tables', tableId), (doc) => {
                if (doc.exists()) setTableInfo({ id: doc.id, ...doc.data() });
            });

            // Update Presence
            const updatePresence = async () => {
                try {
                    const tableRef = doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'tables', tableId);
                    await updateDoc(tableRef, { lastActivity: new Date().toISOString() });
                } catch {
                    // console.error("Presence update failed"); // Silent fail
                }
            };
            updatePresence();
            presenceInterval = setInterval(updatePresence, 30000);
        }

        const unsubProds = onSnapshot(collection(db, 'artifacts', appId, 'shops', SHOP_ID, 'products'), (snap) => {
            const prodData = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Product[];
            setProducts(prodData.sort((a, b) => (a.order || 9999) - (b.order || 9999)));
            setLoading(false);
        });

        // Ayarları Dinle
        unsubSettings = onSnapshot(doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'settings', 'loyalty'), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setWelcomeBonus(data.welcomeBonus || 50);
                setReferrerReward(data.referrerReward || 50);
                setRefereeReward(data.refereeReward || 50);
            }
        });

        return () => {
            if (unsubAuth) unsubAuth();
            if (unsubTable) unsubTable();
            if (unsubProds) unsubProds();
            if (unsubProfile) unsubProfile();
            if (unsubSettings) unsubSettings();
            if (presenceInterval) clearInterval(presenceInterval);
        };
    }, [tableId]);

    // ✨ PROACTIVE VIP DETECTION
    useEffect(() => {
        if (tableId && customerProfile?.isVIP && !tableInfo?.isVIP) {
            const updateTableVIP = async () => {
                try {
                    const tableRef = doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'tables', tableId);
                    await updateDoc(tableRef, { isVIP: true });
                } catch (e) {
                    console.error("Failed to auto-set VIP on table", e);
                }
            };
            updateTableVIP();
        }
    }, [customerProfile, tableId, tableInfo?.isVIP]);

    // 🖼️ CATEGORY IMAGES
    const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});

    useEffect(() => {
        const unsubImages = onSnapshot(collection(db, 'artifacts', appId, 'shops', SHOP_ID, 'categories'), (snapshot) => {
            const images: Record<string, string> = {};
            snapshot.docs.forEach(doc => {
                images[doc.id] = doc.data().image;
            });
            setCategoryImages(images);
        });
        return () => unsubImages();
    }, []);

    // Derived State
    const categories = useMemo(() => [...new Set(products.map(item => item.category))], [products]);
    const favoriteProducts = useMemo(() => products.filter(p => p.isFavorite).slice(0, 4), [products]);
    const productsByCategory = useMemo(() => {
        const grouped: Record<string, Product[]> = {};
        categories.forEach(cat => {
            grouped[cat] = products.filter(p => p.category === cat);
        });
        return grouped;
    }, [products, categories]);

    const isAdmin = useMemo(() => {
        return customerProfile?.role === 'admin' || customerProfile?.isAdmin === true;
    }, [customerProfile]);


    // Actions
    const scrollToCategory = (category: string) => {
        setActiveCategory(category);
        window.scrollTo({ top: 0, behavior: 'auto' });
    };

    const toggleFavorite = async (product: Product) => {
        if (!isMember || !customerProfile) {
            setIsAuthModalOpen(true);
            return;
        }

        const isFav = customerProfile.favorites?.includes(product.id);
        const customerRef = doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'customers', customerProfile.uid);

        try {
            if (isFav) {
                // Remove from favorites
                await updateDoc(customerRef, {
                    favorites: customerProfile.favorites?.filter(id => id !== product.id)
                });
                // Also update local product state if needed, but onSnapshot handles it for customerProfile.
                // However, we need to update the product document's isFavorite field if it's user-specific or global?
                // Actually, 'isFavorite' on product is usually global or per-user. 
                // Given the type definition, it seems Product.isFavorite is a boolean. 
                // If this is a per-user favorite, we rely on customerProfile.favorites list.
                showToast('Favorilerden çıkarıldı', 'success');
            } else {
                // Add to favorites
                await updateDoc(customerRef, {
                    favorites: arrayUnion(product.id)
                });
                showToast('Favorilere eklendi', 'success');
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
            showToast('Bir hata oluştu', 'error');
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handlePlaceOrder = async (_method: 'cash' | 'online') => {
        if (!tableId) return;
        try {
            const tableRef = doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'tables', tableId);
            const batchOrders = cart.map(item => ({
                id: item.uniqueId,
                productId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                note: item.customization?.notes || '',
                status: 'pending',
                createdAt: new Date().toISOString()
            }));
            const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            await updateDoc(tableRef, {
                orders: arrayUnion(...batchOrders),
                total: increment(totalAmount),
                status: 'occupied',
                lastOrderTime: new Date().toISOString(),
                isVIP: tableInfo?.isVIP || customerProfile?.isVIP || false,
                ...(tableInfo?.status === 'empty' ? { startTime: new Date().toISOString() } : {})
            });

            // Increment coffee stamps and points for loyalty
            if (isMember && customerProfile) {
                const customerRef = doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'customers', customerProfile.uid);
                const updates: any = {};

                const coffeeCount = cart.filter(item => item.category === 'Kahve').reduce((sum, item) => sum + item.quantity, 0);
                if (coffeeCount > 0) {
                    updates.coffeeStamps = increment(coffeeCount);
                    updates.lastCoffeeDate = new Date().toISOString();
                }

                const earnedPoints = Math.floor(totalAmount / 10);
                if (earnedPoints > 0) {
                    updates.points = increment(earnedPoints);
                }

                if (Object.keys(updates).length > 0) {
                    await updateDoc(customerRef, updates);

                    // Also update POS customers if phone exists
                    if (customerProfile.phone) {
                        const posCustomerRef = doc(db, 'artifacts', appId, 'shops', SHOP_ID, 'customers', customerProfile.phone);
                        await updateDoc(posCustomerRef, updates);
                    }
                }
            }

            setCart([]);
            setTimeout(() => { setView('home'); }, 3000);
            showToast("Siparişiniz alındı! 🚀", 'success');
        } catch (error) {
            console.error(error);
            showToast("Hata oluştu.", 'error');
        }
    };

    const addToCart = (product: any, options: any, e?: React.MouseEvent | DOMRect) => {
        const item = { ...product, price: product.price, customization: { ...options }, uniqueId: `${product.id}_${Date.now()}` };
        setCart([...cart, { ...item, quantity: 1 }]);
        setSelectedProduct(null);
        showToast(`${product.name} sepete eklendi`, 'success');

        // Animasyon Başlatma
        let startRect: DOMRect | null = null;
        if (e instanceof DOMRect) {
            startRect = e;
        } else if (e && (e as any).currentTarget) {
            startRect = ((e as any).currentTarget as HTMLElement).getBoundingClientRect();
        }
        if (startRect) {
            setFlyingItems(prev => [...prev, { id: Date.now(), startRect, image: product.image }]);
        }

        if (product.category === 'Kahve' && !cart.some(i => i.category === 'Tatlı')) {
            const dessert = products.find(p => p.category === 'Tatlı' && p.isFavorite);
            if (dessert) {
                setTimeout(() => setUpsellItem(dessert), 500);
            }
        }
    };

    const removeFlyingItem = (id: number) => {
        setFlyingItems(prev => prev.filter(i => i.id !== id));
    };

    const translations: Record<string, Record<string, string>> = {
        tr: {
            home: 'Olimpos',
            search: 'Keşfet',
            cart: 'Sepet',
            messenger: 'Haberci',
            profile: 'Profil',
            login: 'Giriş',
            orders: 'Siparişler',
            cards: 'Kartlarım',
            history: 'Puan Geçmişi',
            favorites: 'Favoriler',
            deals: 'Fırsatlar',
            notifications: 'Bildirimler',
            settings: 'Ayarlar',
            account_actions: 'Hesap İşlemleri',
            delete_account: 'Hesabımı Sil',
            edit_profile: 'Profili Düzenle',
            invite_friend: 'Arkadaşını Davet Et',
            help_support: 'Yardım & Destek',
            invite_title: 'ARKADAŞINI DAVET ET',
            invite_desc: 'Bu kodu arkadaşınla paylaş, ilk siparişinde ikiniz de 50 Volt kazanın!',
            copy_code: 'KODU KOPYALA',
            help_title: 'YARDIM MERKEZİ',
            contact_us: 'BİZE ULAŞIN',
            admin_panel: 'Yönetici Paneli',
            // General
            cancel: 'Vazgeç',
            close: 'Kapat',
            add_to_cart: 'Sepete Ekle',
            price: 'Fiyat',
            total: 'Toplam',
            // AuthModal
            login_title: 'AYRICALIKLI DÜNYAYA GİRİŞ',
            register_title: 'ARAMIZA KATIL',
            forgot_password_title: 'ŞİFRE SIFIRLAMA',
            agreement_title: 'AYDINLATMA METNİ',
            email_placeholder: 'E-Posta Adresi',
            password_placeholder: 'Şifre',
            remember_me: 'Beni Hatırla',
            forgot_password: 'Şifremi Unuttum',
            login_button: 'GİRİŞ YAP',
            register_button: 'KULÜBE KATIL',
            send_link: 'BAĞLANTI GÖNDER',
            name_placeholder: 'Ad*',
            surname_placeholder: 'Soyad*',
            phone_placeholder: '5XX XXX XX XX',
            password_min_placeholder: 'Şifre (Min 6)*',
            invite_code_placeholder: 'Davet Kodu (İsteğe Bağlı)',
            agreement_check: "Kullanıcı Sözleşmesi'ni ve KVKK Metni'ni okudum, onaylıyorum.",
            read_approve: 'OKUDUM VE ONAYLIYORUM',
            back_to_login: 'Giriş Ekranına Dön',
            no_account: 'Hesabın yok mu? ',
            register_now: 'Hemen Üye Ol',
            already_member: 'Zaten üye misin? ',
            login_now: 'Giriş Yap',
            weak: 'Zayıf',
            medium: 'Orta',
            good: 'İyi',
            strong: 'Güçlü',
            // ServiceModal
            how_can_we_help: 'Nasıl yardımcı olabiliriz?',
            call_waiter: 'Garson Çağır',
            request_bill: 'Hesap İste',
            // ProductModal
            special_note: 'Özel Notunuz',
            note_placeholder: 'Örn: Bol soslu olsun...',
            // WheelOfFate
            wheel_title: 'ÇARKI ÇEVİR',
            motto_luck: 'Motto Şans',
            spin_button: 'ÇARKI ÇEVİR',
            spinning: 'Dönüyor...',
            congrats: 'TEBRİKLER!',
            empty: 'BOŞ ÇIKTI',
            new_chance: 'Yeni Hak',
            // TheOracle
            oracle_title: 'Kahin',
            oracle_desc: 'Ruhun ne arzuluyor? Yıldızlar senin için seçsin.',
            consult_oracle: 'KAHİNE DANIŞ',
            stars_choice: 'Yıldızların Seçimi',
            accept: 'KABUL ET',
            // OrderDetailsModal & AccountView Orders
            order_details: 'Sipariş Detayı',
            products: 'Ürünler',
            subtotal: 'Ara Toplam',
            status_completed: 'Tamamlandı',
            status_cancelled: 'İptal Edildi',
            status_preparing: 'Hazırlanıyor',
            status_pending: 'Bekliyor',
            status_served: 'Servis Edildi',
            // CartView
            cart_empty_title: 'AMFORANIZ BOŞ',
            cart_empty_desc: "Olimpos'un eşsiz lezzetleri sizi bekliyor. Menüye dönün ve kendinizi şımartın.",
            return_menu: 'MENÜYE DÖN',
            cart_title: 'AMFORA',
            product_count: 'ÜRÜN',
            total_amount: 'TOPLAM TUTAR',
            will_earn: 'KAZANILACAK',
            pay_online: 'ONLINE ÖDE',
            pay_cash: 'KASADA ÖDE',
            members_only: 'Motto Club Üyelerine Özel',
        },
        en: {
            home: 'Olympus',
            search: 'Discover',
            cart: 'Cart',
            messenger: 'Messenger',
            profile: 'Profile',
            login: 'Login',
            orders: 'Orders',
            cards: 'My Cards',
            history: 'History',
            favorites: 'Favorites',
            deals: 'Deals',
            notifications: 'Notifications',
            settings: 'Settings',
            account_actions: 'Account Actions',
            delete_account: 'Delete Account',
            edit_profile: 'Edit Profile',
            invite_friend: 'Invite a Friend',
            help_support: 'Help & Support',
            invite_title: 'INVITE A FRIEND',
            invite_desc: 'Share this code with your friend, both earn 50 Volt on their first order!',
            copy_code: 'COPY CODE',
            help_title: 'HELP CENTER',
            contact_us: 'CONTACT US',
            admin_panel: 'Admin Panel',
            // General
            cancel: 'Cancel',
            close: 'Close',
            add_to_cart: 'Add to Cart',
            price: 'Price',
            total: 'Total',
            // AuthModal
            login_title: 'LOGIN TO PRIVILEGED WORLD',
            register_title: 'JOIN US',
            forgot_password_title: 'PASSWORD RESET',
            agreement_title: 'CLARIFICATION TEXT',
            email_placeholder: 'Email Address',
            password_placeholder: 'Password',
            remember_me: 'Remember Me',
            forgot_password: 'Forgot Password',
            login_button: 'LOGIN',
            register_button: 'JOIN CLUB',
            send_link: 'SEND LINK',
            name_placeholder: 'Name*',
            surname_placeholder: 'Surname*',
            phone_placeholder: '5XX XXX XX XX',
            password_min_placeholder: 'Password (Min 6)*',
            invite_code_placeholder: 'Invite Code (Optional)',
            agreement_check: 'I have read and approve the User Agreement and KVKK Text.',
            read_approve: 'I READ AND APPROVE',
            back_to_login: 'Back to Login',
            no_account: "Don't have an account? ",
            register_now: 'Register Now',
            already_member: 'Already a member? ',
            login_now: 'Login',
            weak: 'Weak',
            medium: 'Medium',
            good: 'Good',
            strong: 'Strong',
            // ServiceModal
            how_can_we_help: 'How can we help?',
            call_waiter: 'Call Waiter',
            request_bill: 'Request Bill',
            // ProductModal
            special_note: 'Your Special Note',
            note_placeholder: 'Ex: Extra sauce...',
            // WheelOfFate
            wheel_title: 'SPIN THE WHEEL',
            motto_luck: 'Motto Luck',
            spin_button: 'SPIN THE WHEEL',
            spinning: 'Spinning...',
            congrats: 'CONGRATS!',
            empty: 'EMPTY',
            new_chance: 'New Chance',
            // TheOracle
            oracle_title: 'The Oracle',
            oracle_desc: 'What does your soul desire? Let the stars choose for you.',
            consult_oracle: 'CONSULT THE ORACLE',
            stars_choice: 'Choice of Stars',
            accept: 'ACCEPT',
            // OrderDetailsModal & AccountView Orders
            order_details: 'Order Details',
            products: 'Products',
            subtotal: 'Subtotal',
            status_completed: 'Completed',
            status_cancelled: 'Cancelled',
            status_preparing: 'Preparing',
            status_pending: 'Pending',
            status_served: 'Served',
            // CartView
            cart_empty_title: 'YOUR AMPHORA IS EMPTY',
            cart_empty_desc: 'Unique flavors of Olympus await you. Return to menu and indulge yourself.',
            return_menu: 'RETURN TO MENU',
            cart_title: 'AMPHORA',
            product_count: 'PRODUCT',
            total_amount: 'TOTAL AMOUNT',
            will_earn: 'WILL EARN',
            pay_online: 'PAY ONLINE',
            pay_cash: 'PAY AT CASHIER',
            members_only: 'Exclusive to Motto Club Members',
        }
    };

    return {
        tableId,
        view, setView,
        activeCategory, setActiveCategory,
        cart, setCart,
        searchQuery, setSearchQuery,
        tableInfo,
        products,
        loading,
        isMember,
        customerProfile,
        isAuthModalOpen, setIsAuthModalOpen,
        authMode, setAuthMode,
        isServiceModalOpen, setIsServiceModalOpen,
        isWheelOpen, setIsWheelOpen,
        isOracleOpen, setIsOracleOpen,
        isScratchOpen, setIsScratchOpen,
        isHubOpen, setIsHubOpen,
        isAssistantOpen, setIsAssistantOpen,
        upsellItem, setUpsellItem,
        selectedProduct, setSelectedProduct,
        categories,
        favoriteProducts,
        productsByCategory,
        scrollToCategory,
        handlePlaceOrder,
        addToCart,
        flyingItems,
        removeFlyingItem,
        theme,
        setTheme,
        language,
        setLanguage,
        t,
        isAdmin,
        welcomeBonus,
        referrerReward,
        refereeReward,
        toggleFavorite,
        categoryImages
    };
};
