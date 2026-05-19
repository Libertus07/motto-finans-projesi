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
        categoryImages
    } = useQrMenuData();

    return (
        <div className="font-sans antialiased text-[#432818] select-none pb-safe-bottom bg-[#FDFBF7]">
            <SplashScreen />

            <ServiceModal isOpen={isServiceModalOpen} onClose={() => setIsServiceModalOpen(false)} tableId={tableId ?? undefined} t={t} />
            <ProductModal
                product={selectedProduct}
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
                onAddToCart={addToCart}
                t={t}
            />
            <CartFlyAnimation items={flyingItems} onComplete={removeFlyingItem} />

            {/* --- VIEW ROUTING --- */}

            {view === 'home' && (
                <HomeView
                    loading={loading}
                    products={products}
                    categories={categories}
                    activeCategory={activeCategory}
                    productsByCategory={productsByCategory}
                    onCategoryClick={scrollToCategory}
                    onProductClick={setSelectedProduct}
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
                onPaymentClick={() => setView('cart')}
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
