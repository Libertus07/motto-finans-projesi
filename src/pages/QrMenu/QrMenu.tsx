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
import TriviaGame from './components/TriviaGame';
import MottoHubModal from './components/MottoHubModal';

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
        isTriviaOpen, setIsTriviaOpen,
        isHubOpen, setIsHubOpen,
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
        refereeReward
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
            />
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} mode={authMode} onModeChange={setAuthMode} t={t} welcomeBonus={welcomeBonus} />
            <WheelOfFate isOpen={isWheelOpen} onClose={() => setIsWheelOpen(false)} customerProfile={customerProfile} t={t ?? ''} />
            <TheOracle isOpen={isOracleOpen} onClose={() => setIsOracleOpen(false)} products={products} onAddToCart={addToCart} t={t} />
            <TriviaGame isOpen={isTriviaOpen} onClose={() => setIsTriviaOpen(false)} />
            <UpsellNotification upsellItem={upsellItem} onClose={() => setUpsellItem(null)} onAdd={(item) => addToCart(item, {})} />
            <CartFlyAnimation items={flyingItems} onComplete={removeFlyingItem} />
            <MottoHubModal
                isOpen={isHubOpen}
                onClose={() => setIsHubOpen(false)}
                onOpenFeature={(feature) => {
                    if (feature === 'service') {
                        setIsServiceModalOpen(true);
                    } else if (feature === 'trivia') {
                        setIsTriviaOpen(true);
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
                    favoriteProducts={favoriteProducts}
                    productsByCategory={productsByCategory}
                    isMember={isMember}
                    customerProfile={customerProfile}
                    onCategoryClick={scrollToCategory}
                    onProductClick={setSelectedProduct}
                    onWheelClick={() => isMember ? setIsWheelOpen(true) : setIsAuthModalOpen(true)}
                    onOracleClick={() => isMember ? setIsOracleOpen(true) : setIsAuthModalOpen(true)}
                    onTriviaClick={() => isMember ? setIsTriviaOpen(true) : setIsAuthModalOpen(true)}
                    onAuthClick={() => { setAuthMode('register'); setIsAuthModalOpen(true); }}
                    onAccountClick={() => setView('account')}
                    onResetCategory={() => setActiveCategory(null)}
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
                onResetCategory={() => { setActiveCategory(null); scrollToCategory(categories[0]); }}
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
