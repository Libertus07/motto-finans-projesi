// pages/CashierPOS.jsx - FULLY REFACTORED VERSION
import React, { useState, useMemo, useEffect, useRef } from 'react';

// 🎯 CUSTOM HOOKS
import { useCart } from '../hooks/pos/useCart';
import { usePayment } from '../hooks/pos/usePayment';
import { useLoyalty } from '../hooks/pos/useLoyalty';
import { useTransactions } from '../hooks/pos/useTransactions';

// 🎨 COMPONENTS
import CartPanel from '../components/pos/Cart/CartPanel';
import MenuPanel from '../components/pos/Menu/MenuPanel';
import PaymentSection from '../components/pos/Payment/PaymentSection';
import Receipt from '../components/Receipt';
import ProductOptionsModal from '../components/ProductOptionsModal';
import MobileTabBar from '../components/pos/shared/MobileTabBar';

// 🔔 MODALS
import ChangeCalculatorModal from '../components/pos/Modals/ChangeCalculatorModal';
import RoundPriceModal from '../components/pos/Modals/RoundPriceModal';
import PartialPaymentModal from '../components/pos/Modals/PartialPaymentModal';
import HistoryModal from '../components/pos/Modals/HistoryModal';
import HeldOrdersModal from '../components/pos/Modals/HeldOrdersModal';
import LoyaltyModal from '../components/pos/Modals/LoyaltyModal';
import RegisterModal from '../components/pos/Loyalty/RegisterModal';
import ConfirmDialog from '../components/pos/shared/ConfirmDialog';

// 🛠️ UTILS & CONSTANTS
import { calculateTotals, getCurrentPayable } from '../utils/pos/calculations';
import { playCashSound } from '../utils/pos/sounds';
import { formatCurrency } from '../utils/helpers';
import { bankOptions } from '../utils/pos/themes';

const CashierPOS = ({ products = [] }) => {
    // 🌗 CORE STATE
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('Tümü');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('popularity');
    const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('menu');
    
    // 🎭 MODAL STATE
    const [showChangeModal, setShowChangeModal] = useState(false);
    const [showManualModal, setShowManualModal] = useState(false);
    const [showPartialModal, setShowPartialModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showHeldOrdersModal, setShowHeldOrdersModal] = useState(false);
    const [productToCustomize, setProductToCustomize] = useState(null);
    
    // 🔄 UI STATE
    const [processing, setProcessing] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [printData, setPrintData] = useState(null);
    const [heldOrders, setHeldOrders] = useState([]);
    const [loyaltyDiscount, setLoyaltyDiscount] = useState(0); // Applied loyalty discount
    
    const receiptRef = useRef(null);

    // 🪝 CUSTOM HOOKS
    const cartHook = useCart();
    const paymentHook = usePayment();
    const loyaltyHook = useLoyalty();
    const transactionsHook = useTransactions();

    // 📋 COMPUTED VALUES
    const categories = useMemo(() => 
        ['Tümü', ...new Set(products.map(p => p.category))], 
        [products]
    );

    const totals = useMemo(() => calculateTotals({
        cart: cartHook.cart,
        discountRate: paymentHook.discountRate,
        splitCount: paymentHook.splitCount,
        customTotal: paymentHook.customTotal,
        isPartialMode: paymentHook.isPartialMode,
        paidSoFar: paymentHook.paidSoFar,
        isSelectionMode: cartHook.isSelectionMode,
        selectedItems: cartHook.selectedItems
    }), [
        cartHook.cart, 
        cartHook.isSelectionMode, 
        cartHook.selectedItems,
        paymentHook.discountRate, 
        paymentHook.splitCount, 
        paymentHook.customTotal,
        paymentHook.isPartialMode, 
        paymentHook.paidSoFar
    ]);

    const currentPayable = getCurrentPayable(
        paymentHook.isPartialMode,
        totals.partialPayable,
        cartHook.isSelectionMode,
        totals.finalTotal
    );

    const totalItems = useMemo(() => 
        cartHook.isSelectionMode 
            ? Object.values(cartHook.selectedItems).reduce((sum, qty) => sum + qty, 0) 
            : cartHook.cart.reduce((sum, item) => sum + item.quantity, 0),
        [cartHook.cart, cartHook.isSelectionMode, cartHook.selectedItems]
    );

    const activeBankStyle = useMemo(() => 
        bankOptions.find(b => b.key === paymentHook.cardBank) || bankOptions[0],
        [paymentHook.cardBank]
    );

    const processedProducts = useMemo(() => {
        let result = products.filter(p => 
            (selectedCategory === 'Tümü' || p.category === selectedCategory) && 
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return result.sort((a, b) => {
            switch(sortOption) {
                case 'price-asc': return a.price - b.price;
                case 'price-desc': return b.price - a.price;
                case 'name': return a.name.localeCompare(b.name);
                default: return (b.sales || 0) - (a.sales || 0);
            }
        });
    }, [products, selectedCategory, searchTerm, sortOption]);

    // 🔧 HANDLERS
    const handleProductClick = (product) => {
        if (product.options && product.options.length > 0) {
            setProductToCustomize(product);
        } else {
            cartHook.addToCart(product);
        }
    };

    const handleOptionConfirm = (customizedProduct) => {
        cartHook.addToCart(customizedProduct);
        setProductToCustomize(null);
    };

    const handleHoldOrder = () => {
        if (cartHook.cart.length === 0) return;
        const newHold = {
            id: Date.now(),
            items: cartHook.cart,
            total: totals.subTotal,
            time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        };
        setHeldOrders([newHold, ...heldOrders]);
        cartHook.setCart([]);
        paymentHook.resetPayment();
        alert("Sipariş beklemeye alındı.");
    };

    const handleRestoreOrder = (holdId) => {
        if (cartHook.cart.length > 0) {
            if(!window.confirm("Mevcut sepet silinecek. Emin misiniz?")) return;
        }
        const orderToRestore = heldOrders.find(h => h.id === holdId);
        if (orderToRestore) {
            cartHook.setCart(orderToRestore.items);
            setHeldOrders(heldOrders.filter(h => h.id !== holdId));
            setShowHeldOrdersModal(false);
        }
    };

    const handlePrintReceipt = () => {
        if (cartHook.cart.length === 0) return;
        
        const itemsToPrint = cartHook.isSelectionMode 
            ? cartHook.cart
                .filter(item => cartHook.selectedItems[item.id])
                .map(item => ({ 
                    ...item, 
                    quantity: cartHook.selectedItems[item.id] 
                }))
            : cartHook.cart;
        
        setPrintData({
            title: cartHook.isSelectionMode 
                ? 'Parçalı Ödeme Fişi' 
                : (paymentHook.isPartialMode ? 'Hesap Özeti' : 'Adisyon Fişi'),
            type: 'Bilgi Fişi',
            date: new Date().toLocaleString('tr-TR'),
            items: itemsToPrint.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price
            })),
            total: totals.finalTotal,
            subDetails: {
                rawTotal: totals.subTotal,
                discount: totals.discountAmount > 0 ? totals.discountAmount : null,
                paid: paymentHook.isPartialMode ? paymentHook.paidSoFar : null,
                remaining: paymentHook.isPartialMode ? totals.remainingDebt : null
            }
        });
    };

    const handleCheckout = async () => {
        if (cartHook.cart.length === 0) return;

        setProcessing(true);

        try {
            // 🔥 KRİTİK HESAPLAMA: İndirim tutarını puana geri çeviriyoruz (1 TL = 2 Puan)
            const pointsSpentVal = loyaltyDiscount / 0.5;

            const transactionData = {
                amount: currentPayable,      // 195 TL
                total: totals.subTotal,      // 200 TL
                loyaltyDiscount: loyaltyDiscount, // 5 TL
                pointsSpent: pointsSpentVal, // ✨ HARCANAN PUAN (Örn: 10 M-Coin)
                method: paymentHook.paymentMethod,
                cardBank: paymentHook.cardBank,
                type: 'income',
                desc: 'POS Satışı',
                date: new Date().toISOString().split('T')[0] //
            };

            // 1. İşlemi Kaydet ve Puanları Güncelle
            const result = await transactionsHook.saveTransaction(transactionData, loyaltyHook.loyaltyCustomer);

            if (result.success) {
                playCashSound();
                setSuccessMsg(`₺${formatCurrency(currentPayable)} Tahsil Edildi`);

                // 🔥 KRİTİK: İndirim Rozetini ve Puan State'ini SIFIRLA
                setLoyaltyDiscount(0);
                paymentHook.setCustomTotal('');

                // 2. Sepeti Temizle
                cartHook.setCart([]);
                paymentHook.resetPayment();

                // 3. Müşteri Seçimini Kapat (Badge'in gitmesi için)
                loyaltyHook.resetCustomer();

                setTimeout(() => setSuccessMsg(''), 3000);
            }
        } catch (error) {
            console.error("Ödeme Hatası:", error);
        } finally {
            setProcessing(false);
        }
    };

    const handleLoyaltyRedeemPoints = (discountValue, pointsUsed) => {
        const newTotal = Math.max(0, totals.subTotal - discountValue);

        paymentHook.setCustomTotal(newTotal.toString());
        paymentHook.setIsPartialMode(false);
        paymentHook.setDiscountRate(0);
        setLoyaltyDiscount(discountValue); // Track applied discount

        // Başarı mesajı göster
        setSuccessMsg(`${pointsUsed} M-Coin kullanıldı! ${formatCurrency(discountValue)} ₺ indirim uygulandı.`);
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const handleCancelLoyaltyDiscount = async () => {
        if (loyaltyDiscount > 0 && loyaltyHook.loyaltyCustomer) {
            // Kullanılan puanları geri yükle
            const pointsToRestore = Math.round(loyaltyDiscount / 0.5); // 0.5 TL = 1 puan

            try {
                await loyaltyHook.restorePoints(pointsToRestore);
                setSuccessMsg(`${pointsToRestore} M-Coin geri yüklendi!`);
            } catch (error) {
                console.error('Puan geri yükleme hatası:', error);
                setSuccessMsg('İndirim iptal edildi (puan geri yüklenemedi).');
            }
        }

        // Ödeme ayarlarını sıfırla
        paymentHook.setCustomTotal('');
        paymentHook.setDiscountRate(0);
        setLoyaltyDiscount(0);

        if (!loyaltyDiscount > 0) {
            setSuccessMsg('M-Coin indirimi iptal edildi.');
        }
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    // 🖨️ PRINT EFFECT
    useEffect(() => {
        if (printData && receiptRef.current) {
            const timer = setTimeout(() => {
                const printContent = receiptRef.current.innerHTML;
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                    printWindow.document.write('<html><head><title>Adisyon</title><style>@import url("/index.css");</style></head><body>');
                    printWindow.document.write(printContent);
                    printWindow.document.write('</body></html>');
                    printWindow.document.close();
                    printWindow.print();
                }
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [printData]);

    // 📜 HISTORY EFFECT
    useEffect(() => {
        if (showHistoryModal) {
            transactionsHook.fetchRecentTransactions();
        }
    }, [showHistoryModal]);

    // 🎨 RENDER
    return (
        <div className={`relative w-full h-[calc(100vh-80px)] overflow-hidden font-sans flex lg:gap-4 transition-colors duration-500 ${isDarkMode ? 'bg-[#0F131C] text-slate-200' : 'bg-slate-100 text-slate-800'}`}>
            
            {/* PRODUCT OPTIONS MODAL */}
            <ProductOptionsModal 
                isOpen={!!productToCustomize}
                onClose={() => setProductToCustomize(null)}
                product={productToCustomize}
                onConfirm={handleOptionConfirm}
            />

            {/* CART PANEL */}
            <CartPanel
                cart={cartHook.cart}
                isDarkMode={isDarkMode}
                activeTab={activeTab}
                isSelectionMode={cartHook.isSelectionMode}
                isPartialMode={paymentHook.isPartialMode}
                selectedItems={cartHook.selectedItems}
                discountRate={paymentHook.discountRate}
                splitCount={paymentHook.splitCount}
                customTotal={paymentHook.customTotal}
                currentPayable={currentPayable}
                paidSoFar={paymentHook.paidSoFar}
                remainingDebt={totals.remainingDebt}
                discountAmount={totals.discountAmount}
                showLoyaltyModal={loyaltyHook.showLoyaltyModal}
                loyaltyCustomer={loyaltyHook.loyaltyCustomer}
                loyaltyDiscount={loyaltyDiscount}
                onCancelLoyaltyDiscount={handleCancelLoyaltyDiscount}
                showChangeModal={showChangeModal}
                showHistoryModal={showHistoryModal}
                showHeldOrdersModal={showHeldOrdersModal}
                onUpdateQuantity={cartHook.updateQuantity}
                onToggleSelection={cartHook.toggleSelection}
                onRemoveFromCart={cartHook.removeFromCart}
                onCloseTab={() => setActiveTab('menu')}
                onLoyaltyClick={loyaltyHook.openLoyaltyModal}
                onDiscountClick={paymentHook.cycleDiscountRate}
                onRoundClick={() => {
                    paymentHook.setCustomTotal('');
                    setShowManualModal(true);
                }}
                onChangeClick={() => setShowChangeModal(true)}
                onHoldClick={() => {
                    if(cartHook.cart.length > 0) handleHoldOrder();
                    else setShowHeldOrdersModal(true);
                }}
                onHistoryClick={() => setShowHistoryModal(true)}
                onClearCart={() => {
                    cartHook.clearCart();
                    paymentHook.resetPayment();
                    paymentHook.disablePartialMode();
                }}
                onSelectionToggle={cartHook.toggleSelectionMode}
                onPartialClick={() => {
                    paymentHook.setCustomTotal('');
                    setShowPartialModal(true);
                }}
                onSplitClick={paymentHook.cycleSplitCount}
                onCloseSummary={() => {
                    if (paymentHook.isPartialMode) {
                        paymentHook.disablePartialMode();
                    } else if (cartHook.isSelectionMode) {
                        cartHook.toggleSelectionMode();
                    }
                }}
            >
                {/* PAYMENT SECTION PLACEHOLDER */}
                <PaymentSection 
                    isDarkMode={isDarkMode}
                    paymentMethod={paymentHook.paymentMethod}
                    cardBank={paymentHook.cardBank}
                    receivedAmount={paymentHook.receivedAmount}
                    currentPayable={currentPayable}
                    processing={processing}
                    successMsg={successMsg}
                    cartLength={cartHook.cart.length}
                    isSelectionMode={cartHook.isSelectionMode}
                    subTotal={totals.subTotal}
                    activeBankStyle={activeBankStyle}
                    loyaltyCustomer={loyaltyHook.loyaltyCustomer}
                    loyaltyHook={loyaltyHook}
                    onRedeemPoints={handleLoyaltyRedeemPoints}
                    onMethodChange={paymentHook.setPaymentMethod}
                    onBankChange={paymentHook.setCardBank}
                    onClearReceived={() => paymentHook.setReceivedAmount('')}
                    onPrint={handlePrintReceipt}
                    onCheckout={handleCheckout}
                    showChangeModal={showChangeModal}
                    showManualModal={showManualModal}
                    showPartialModal={showPartialModal}
                    showHistoryModal={showHistoryModal}
                />
            
            </CartPanel>

            {/* MENU PANEL */}
            <MenuPanel 
                isDarkMode={isDarkMode}
                categories={categories}
                selectedCategory={selectedCategory}
                searchTerm={searchTerm}
                sortOption={sortOption}
                isSortMenuOpen={isSortMenuOpen}
                processedProducts={processedProducts}
                activeTab={activeTab}
                onThemeToggle={() => setIsDarkMode(!isDarkMode)}
                onCategorySelect={setSelectedCategory}
                onSearchChange={setSearchTerm}
                onSortToggle={() => setIsSortMenuOpen(!isSortMenuOpen)}
                onSortSelect={(option) => {
                    setSortOption(option);
                    setIsSortMenuOpen(false);
                }}
                onProductClick={handleProductClick}
            />

            {/* MODALS */}
            <ChangeCalculatorModal 
                isOpen={showChangeModal}
                onClose={() => setShowChangeModal(false)}
                currentPayable={currentPayable}
                receivedAmount={paymentHook.receivedAmount}
                onAmountChange={paymentHook.setReceivedAmount}
            />

            <RoundPriceModal 
                isOpen={showManualModal}
                onClose={() => setShowManualModal(false)}
                subTotal={totals.subTotal}
                customTotal={paymentHook.customTotal}
                onCustomTotalChange={paymentHook.setCustomTotal}
                onApply={() => paymentHook.setDiscountRate(0)}
            />

            <PartialPaymentModal 
                isOpen={showPartialModal}
                onClose={() => {
                    setShowPartialModal(false);
                    paymentHook.setCustomTotal('');
                }}
                finalTotal={totals.finalTotal}
                paidSoFar={paymentHook.paidSoFar}
                customTotal={paymentHook.customTotal}
                discountRate={paymentHook.discountRate}
                onCustomTotalChange={paymentHook.setCustomTotal}
                onDiscountToggle={paymentHook.cycleDiscountRate}
                onApply={() => {
                    setShowPartialModal(false);
                    paymentHook.enablePartialMode();
                    paymentHook.setSplitCount(1);
                }}
            />

            <HistoryModal 
                isOpen={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
                transactions={transactionsHook.recentTransactions}
                onVoidTransaction={transactionsHook.voidTransaction}
            />

            <HeldOrdersModal 
                isOpen={showHeldOrdersModal}
                onClose={() => setShowHeldOrdersModal(false)}
                heldOrders={heldOrders}
                onRestore={handleRestoreOrder}
            />

            <LoyaltyModal
                isOpen={loyaltyHook.showLoyaltyModal}
                onClose={loyaltyHook.closeLoyaltyModal}
                loyaltyPhone={loyaltyHook.loyaltyPhone}
                loyaltyCustomer={loyaltyHook.loyaltyCustomer}
                processing={loyaltyHook.processing}
                isDarkMode={isDarkMode}
                onPhoneChange={loyaltyHook.setLoyaltyPhone}
                onSearch={loyaltyHook.searchCustomer}
                onResetCustomer={loyaltyHook.resetCustomer}
                onNewCustomer={() => loyaltyHook.setShowRegisterModal(true)}
                onRedeemPoints={(points) =>
                    loyaltyHook.redeemPoints(points, handleLoyaltyRedeemPoints)
                }
            />

            {/* Diğer modalların yanına ekleyin */}
            <RegisterModal
                isOpen={loyaltyHook.showRegisterModal}
                onClose={() => loyaltyHook.setShowRegisterModal(false)}
                phone={loyaltyHook.loyaltyPhone}
                onRegister={loyaltyHook.registerCustomer}
                isDarkMode={isDarkMode}
            />

            {/* Yeni Üye Onayı İçin */}
            <ConfirmDialog
                isOpen={loyaltyHook.showConfirmDialog}
                title="Üye Bulunamadı"
                message={`${loyaltyHook.loyaltyPhone} numaralı müşteri kayıtlı değil. Yeni profil oluşturulsun mu?`}
                type="question"
                isDarkMode={isDarkMode}
                onCancel={() => loyaltyHook.setShowConfirmDialog(false)}
                onConfirm={() => {
                    loyaltyHook.setShowConfirmDialog(false);
                    loyaltyHook.setShowRegisterModal(true);
                }}
            />

            {/* MOBILE TAB BAR */}
            <MobileTabBar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                cartCount={totalItems}
                isDarkMode={isDarkMode}
                cartTotal={totals.finalTotal}
            />

            {/* RECEIPT */}
            <Receipt data={printData} ref={receiptRef} />
        </div>
    );
};

export default CashierPOS;