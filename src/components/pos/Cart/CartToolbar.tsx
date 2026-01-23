// components/pos/Cart/CartToolbar.tsx
import React from 'react';
import {
    Gift, Percent, Tag, Calculator, PauseCircle,
    History, Trash2, Crown
} from 'lucide-react';
import ToolButton from '../shared/ToolButton';

interface CartToolbarProps {
    isDarkMode: boolean;
    discountRate: number;
    customTotal: string;
    isSelectionMode: boolean;
    showLoyaltyModal: boolean;
    showChangeModal: boolean;
    showHistoryModal: boolean;
    showHeldOrdersModal: boolean;
    cartLength: number;
    loyaltyCustomer: any;
    onLoyaltyClick: () => void;
    onDiscountClick: () => void;
    onRoundClick: () => void;
    onChangeClick: () => void;
    onHoldClick: () => void;
    onHistoryClick: () => void;
    onClearCart: () => void;
}

const CartToolbar: React.FC<CartToolbarProps> = ({
    isDarkMode,
    discountRate,
    customTotal,
    isSelectionMode,
    showLoyaltyModal,
    showChangeModal,
    showHistoryModal,
    showHeldOrdersModal,
    cartLength,
    loyaltyCustomer,
    onLoyaltyClick,
    onDiscountClick,
    onRoundClick,
    onChangeClick,
    onHoldClick,
    onHistoryClick,
    onClearCart
}) => {
    // 🧠 Akıllı Durum Kontrolü
    const isLoyaltyActive = !!loyaltyCustomer;

    return (
        <div className={`w-[70px] flex flex-col items-center py-4 gap-3 shrink-0 border-r transition-colors duration-500 overflow-y-auto max-h-[calc(100vh-200px)] ${isDarkMode
                ? 'bg-slate-800/50 border-white/5'
                : 'bg-slate-50 border-slate-200'
            }`}>
            {/* 🎁 SADAKAT BUTONU - AKILLI MOD */}
            <ToolButton
                icon={isLoyaltyActive ? Crown : Gift}
                label={isLoyaltyActive ? (loyaltyCustomer.name || "Müşteri") : "Sadakat"}
                active={isLoyaltyActive || showLoyaltyModal}
                // Müşteri seçiliyse Emerald, değilse Standart Purple
                colorClass={isLoyaltyActive ? "bg-emerald-600 border-emerald-500" : "bg-purple-600 border-purple-500"}
                iconColor={isLoyaltyActive ? "text-emerald-400" : "text-purple-400"}
                disabled={isSelectionMode}
                onClick={onLoyaltyClick}
                isDarkMode={isDarkMode}
            />

            {/* 💰 İNDİRİM BUTONU */}
            <ToolButton
                icon={Percent}
                label={discountRate > 0 ? `%${discountRate}` : "İndirim"}
                active={discountRate > 0}
                colorClass="bg-orange-600 border-orange-500"
                iconColor="text-orange-400"
                disabled={isSelectionMode}
                onClick={onDiscountClick}
                isDarkMode={isDarkMode}
            />

            {/* 🏷️ YUVARLA BUTONU */}
            <ToolButton
                icon={Tag}
                label="Yuvarla"
                active={customTotal !== ''}
                colorClass="bg-emerald-600 border-emerald-500"
                iconColor="text-emerald-400"
                disabled={isSelectionMode}
                onClick={onRoundClick}
                isDarkMode={isDarkMode}
            />

            {/* 🧮 PARA ÜSTÜ BUTONU */}
            <ToolButton
                icon={Calculator}
                label="P.Üstü"
                active={showChangeModal}
                colorClass="bg-cyan-600 border-cyan-500"
                iconColor="text-cyan-400"
                onClick={onChangeClick}
                isDarkMode={isDarkMode}
            />

            {/* ⏸️ BEKLET BUTONU */}
            <ToolButton
                icon={PauseCircle}
                label="Beklet"
                active={showHeldOrdersModal}
                colorClass="bg-yellow-600 border-yellow-500"
                iconColor="text-yellow-400"
                onClick={onHoldClick}
                isDarkMode={isDarkMode}
            />

            {/* ALT BÖLÜM - GEÇMİŞ VE TEMİZLE */}
            <div className="mt-auto flex flex-col items-center gap-3">
                <ToolButton
                    icon={History}
                    label="Geçmiş"
                    active={showHistoryModal}
                    colorClass="bg-slate-600 border-slate-500"
                    onClick={onHistoryClick}
                    isDarkMode={isDarkMode}
                />

                <button
                    onClick={onClearCart}
                    disabled={cartLength === 0}
                    className="w-[50px] h-[50px] rounded-2xl flex items-center justify-center text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all disabled:opacity-30 active:scale-95"
                >
                    <Trash2 size={20} />
                </button>
            </div>
        </div>
    );
};

export default CartToolbar;
