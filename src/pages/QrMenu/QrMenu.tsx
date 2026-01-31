import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';

// Components
import CartView from './components/CartView';
import StoriesWidget from './components/StoriesWidget';
import VoltWidget from './components/VoltWidget';
import StampCard from './components/StampCard';
import UpsellNotification from './components/UpsellNotification';
import SplashScreen from './components/SplashScreen';
import AuthModal from './components/AuthModal';
import ServiceModal from './components/ServiceModal';
import ProductModal from './components/ProductModal';
import BottomNav from './components/BottomNav';
import WheelOfFate from './components/WheelOfFate';
import TheOracle from './components/TheOracle';
import { ToastProvider } from './components/ToastProvider';
import CartFlyAnimation from './components/CartFlyAnimation';
import MottoScratch from './components/MottoScratch';
import MottoHubModal from './components/MottoHubModal';
import MottoAssistant from './components/MottoAssistant';
import { Bot } from 'lucide-react';

// Views (Yeni oluşturulacak dosyalar)
import HomeView from './views/HomeView';
import AccountView from './views/AccountView';
import SearchView from './views/SearchView';
import OrdersView from './views/OrdersView';

// Hooks
import { useQrMenuData } from './hooks/useQrMenuData';


const QrMenuContent = () => {
    const {
        tableId,
        view, setView,
        activeCategory, setActiveCategory,
        cart, setCart,
        searchQuery, setSearchQuery,
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
    } = useQrMenuData();

    // Simple recommendation logic for demo
    const suggestedProduct = React.useMemo(() => {
        if (!selectedProduct || products.length < 2) return null;
        const others = products.filter(p => p.id !== selectedProduct.id && p.category !== selectedProduct.category);
        if (others.length === 0) return products.find(p => p.id !== selectedProduct.id);
        // Deterministic selection based on ID length or similar to be pure
        const index = selectedProduct.id.length % others.length;
        return others[index];
    }, [selectedProduct, products]);

    return (
        <div className="font-sans antialiased text-[#432818] select-none pb-safe-bottom bg-[#FDFBF7]">
            <SplashScreen />

            <ServiceModal isOpen={isServiceModalOpen} onClose={() => setIsServiceModalOpen(false)} tableId={tableId ?? undefined} t={t} />
            <ProductModal
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
                onAddToCart={addToCart}
                t={t}
                relatedProduct={suggestedProduct}
                isFavorite={customerProfile?.favorites?.includes(selectedProduct?.id) || false}
                onToggleFavorite={toggleFavorite}
            />
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                mode={authMode}
                onModeChange={setAuthMode}
                t={t}
                welcomeBonus={welcomeBonus}
                referrerReward={referrerReward}
                refereeReward={refereeReward}
            />
            <WheelOfFate isOpen={isWheelOpen} onClose={() => setIsWheelOpen(false)} customerProfile={customerProfile} t={t ?? ''} />
            <TheOracle isOpen={isOracleOpen} onClose={() => setIsOracleOpen(false)} products={products} onAddToCart={addToCart} t={t} />
            <MottoScratch isOpen={isScratchOpen} onClose={() => setIsScratchOpen(false)} />
            <UpsellNotification upsellItem={upsellItem} onClose={() => setUpsellItem(null)} onAdd={(item) => addToCart(item, {})} />
            <CartFlyAnimation items={flyingItems} onComplete={removeFlyingItem} />
            <MottoAssistant
                isOpen={isAssistantOpen}
                onClose={() => setIsAssistantOpen(false)}
                products={products}
                onAddToCart={addToCart}
                t={t}
                customerName={customerProfile?.firstName}
            />

            {/* AI Assistant FAB */}
            {!isAssistantOpen && view === 'home' && (
                <button
                    onClick={() => setIsAssistantOpen(true)}
                    className="fixed bottom-28 right-4 z-[60] w-14 h-14 bg-[#432818] rounded-full flex items-center justify-center text-[#D4AF37] shadow-[0_4px_20px_rgba(67,40,24,0.4)] border border-[#D4AF37]/20 animate-in zoom-in duration-300 hover:scale-110 active:scale-95 transition-transform group"
                >
                    <div className="absolute inset-0 rounded-full border border-[#D4AF37]/50 animate-ping opacity-20"></div>
                    <Bot size={28} strokeWidth={1.5} />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-[#D4AF37]"></span>
                    </span>
                </button>
            )}

            <MottoHubModal
                isOpen={isHubOpen}
                onClose={() => setIsHubOpen(false)}
                onOpenFeature={(feature) => {
                    if (feature === 'service') {
                        setIsServiceModalOpen(true);
                    } else if (feature === 'trivia') { // Kept 'trivia' key for legacy hub compatibility or we should update Hub too. Let's assume Hub sends 'trivia' for the game widget button.
                        // Actually the user might want us to update the Hub logic too.
                        // For now let's map 'trivia' feature to Scratch open.
                        setIsScratchOpen(true);
                    } else {
                        if (view !== 'home') setView('home');
                        setTimeout(() => {
                            const map: Record<string, string> = {
                                trends: 'live-trends',
                                jukebox: 'jukebox-widget',
                                guestbook: 'guestbook-widget'
                            };
                            const id = map[feature];
                            if (id) {
                                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        }, 100);
                    }
                }}
            />

            {/* --- VIEW ROUTING --- */}

            {view === 'home' && (
                <HomeView
                    loading={loading}
                    products={products}
                    categories={categories}
                    activeCategory={activeCategory}
                    productsByCategory={productsByCategory}
                    isMember={isMember}
                    customerProfile={customerProfile}
                    onCategoryClick={scrollToCategory}
                    onProductClick={setSelectedProduct}
                    onWheelClick={() => isMember ? setIsWheelOpen(true) : setIsAuthModalOpen(true)}
                    onOracleClick={() => isMember ? setIsOracleOpen(true) : setIsAuthModalOpen(true)}
                    onScratchClick={() => isMember ? setIsScratchOpen(true) : setIsAuthModalOpen(true)}
                    onAuthClick={() => { setAuthMode('register'); setIsAuthModalOpen(true); }}
                    onAccountClick={() => setView('account')}
                    onResetCategory={() => {
                        setActiveCategory(null);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    t={t}
                    categoryImages={categoryImages}
                />
            )}

            {view === 'search' && (
                <SearchView searchQuery={searchQuery} setSearchQuery={setSearchQuery} products={products} onProductClick={setSelectedProduct} />
            )}

            {view === 'cart' && (
                <CartView
                    cart={cart}
                    setCart={setCart}
                    setView={setView}
                    isMember={isMember}
                    setAuthMode={setAuthMode}
                    setIsAuthModalOpen={setIsAuthModalOpen}
                    handlePlaceOrder={handlePlaceOrder}
                    t={t}
                />
            )}

            {view === 'account' && (
                <AccountView
                    customerProfile={customerProfile}
                    onSignOut={() => { signOut(auth); setView('home'); }}
                    theme={theme}
                    setTheme={setTheme}
                    language={language}
                    setLanguage={setLanguage}
                    t={t}
                    isAdmin={isAdmin}
                    welcomeBonus={welcomeBonus}
                    referrerReward={referrerReward}
                    refereeReward={refereeReward}
                />
            )}

            {view === 'orders' && (
                <OrdersView onBack={() => setView('account')} />
            )}

            <BottomNav
                view={view}
                setView={setView}
                cartCount={cart.reduce((a, b) => a + (b.quantity || 1), 0)}
                onOpenService={() => setIsServiceModalOpen(true)}
                onResetCategory={() => {
                    setActiveCategory(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                t={t}
                isMember={isMember}
                onAuthClick={() => { setAuthMode('register'); setIsAuthModalOpen(true); }}
                onAccountClick={() => setView('account')}
            />
        </div>
    );
};

const QrMenu = () => (
    <ToastProvider>
        <QrMenuContent />
    </ToastProvider>
);

export default QrMenu;
