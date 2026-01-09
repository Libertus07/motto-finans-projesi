// components/pos/Menu/ProductGrid.jsx
import React from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ 
    products, 
    onProductClick,
    isDarkMode 
}) => {
    return (
        <div className={`
            flex-1 overflow-y-auto p-2 md:p-4 custom-scrollbar
            ${isDarkMode 
                ? 'bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:2rem_2rem]' 
                : 'bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:16px_16px] bg-slate-50/50'}
        `}>
            <div className="grid grid-cols-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 md:gap-3 content-start pb-28 lg:pb-0">
                {products.map(product => (
                    <ProductCard 
                        key={product.id}
                        product={product}
                        onClick={onProductClick}
                        isDarkMode={isDarkMode}
                    />
                ))}
            </div>
        </div>
    );
};

export default ProductGrid;