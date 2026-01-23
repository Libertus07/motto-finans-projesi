// components/pos/Menu/ProductCard.tsx
import React from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../../utils/helpers';
import { getCategoryTheme } from '../../../utils/pos/themes';
import { Product } from '../../../types';

interface ProductCardProps {
    product: Product;
    onClick: (product: Product) => void;
    isDarkMode: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
    product,
    onClick,
    isDarkMode
}) => {
    // product.category is required by Product interface, but fallback just in case
    const category = product.category || 'Diğer';
    const theme = getCategoryTheme(category, isDarkMode);
    const hasLowStock = product.stock !== undefined && product.stock <= 5;
    const hasOptions = product.options && product.options.length > 0;

    return (
        <button
            onClick={() => onClick(product)}
            className={`
                group relative h-24 md:h-32 p-2 md:p-3 rounded-2xl 
                ${theme.bg} ${theme.hoverBg} 
                border ${theme.border} ${theme.hoverBorder}
                hover:shadow-xl active:scale-[0.96] transition-all duration-200 
                flex flex-col justify-between overflow-hidden hover:-translate-y-1
            `}
        >
            {/* 🔴 STOK UYARISI */}
            {hasLowStock && (
                <span className="absolute top-1 left-1 bg-white text-red-600 border border-red-200 text-[9px] font-black px-1.5 py-0.5 rounded-md z-20 shadow-sm animate-pulse flex items-center gap-1">
                    <AlertCircle size={8} /> Son {product.stock}
                </span>
            )}

            {/* ⚙️ OPSIYONLU ÜRÜN İŞARETİ */}
            {hasOptions && (
                <span className="absolute top-1.5 right-1.5 md:top-2 md:right-2 w-2 h-2 md:w-2.5 md:h-2.5 bg-white rounded-full animate-pulse shadow-sm z-20 opacity-80" />
            )}

            {/* ÜST BÖLÜM - KATEGORİ & İSİM */}
            <div className="relative z-10 w-full text-left mt-2 md:mt-0">
                {/* Kategori Adı */}
                <span className={`
                    text-[8px] md:text-[9px] font-bold uppercase tracking-widest 
                    mb-0.5 md:mb-1 block truncate opacity-80 ${theme.text}
                `}>
                    {product.category}
                </span>

                {/* Ürün İsmi */}
                <h3 className={`
                    text-[10px] md:text-xs font-bold leading-tight 
                    transition-colors line-clamp-2 pr-4
                    ${isDarkMode
                        ? 'text-slate-200 group-hover:text-white'
                        : 'text-white drop-shadow-sm'}
                `}>
                    {product.name}
                </h3>
            </div>

            {/* ALT BÖLÜM - FİYAT & İKON */}
            <div className="relative z-10 flex items-end justify-between w-full mt-auto">
                {/* Fiyat */}
                <div className="flex items-baseline gap-0.5">
                    <span className={`
                        font-bold text-[10px] md:text-sm tracking-tight leading-none 
                        ${theme.priceColor}
                    `}>
                        {formatCurrency(product.price)}
                    </span>
                    <span className={`
                        text-[8px] md:text-[10px] font-bold opacity-70 
                        ${theme.priceColor}
                    `}>
                        ₺
                    </span>
                </div>

                {/* Ekle İkonu */}
                <div className={`
                    w-5 h-5 md:w-6 md:h-6 rounded-lg 
                    flex items-center justify-center 
                    transition-all duration-300 shadow-md 
                    ${theme.iconStyle}
                `}>
                    <Plus size={12} strokeWidth={3} />
                </div>
            </div>
        </button>
    );
};

export default ProductCard;
