// components/pos/Menu/MenuPanel.jsx
import React from 'react';
import MenuHeader from './MenuHeader';
import CategorySidebar from './CategorySidebar';
import ProductGrid from './ProductGrid';

const MenuPanel = ({ 
    // State
    isDarkMode,
    categories,
    selectedCategory,
    searchTerm,
    sortOption,
    isSortMenuOpen,
    processedProducts,
    activeTab,
    
    // Handlers
    onThemeToggle,
    onCategorySelect,
    onSearchChange,
    onSortToggle,
    onSortSelect,
    onProductClick
}) => {
    return (
        <div className={`
            absolute inset-0 lg:static lg:flex-1 
            flex flex-col lg:rounded-3xl lg:border lg:shadow-2xl 
            overflow-hidden transition-all duration-500 ease-in-out z-10
            ${activeTab === 'menu' ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'} 
            ${isDarkMode ? 'bg-[#0F131C] border-white/5' : 'bg-white border-slate-200'}
        `}>
            
            {/* HEADER */}
            <MenuHeader 
                isDarkMode={isDarkMode}
                searchTerm={searchTerm}
                sortOption={sortOption}
                isSortMenuOpen={isSortMenuOpen}
                onThemeToggle={onThemeToggle}
                onSearchChange={onSearchChange}
                onSortToggle={onSortToggle}
                onSortSelect={onSortSelect}
            />

            {/* MAIN CONTENT */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* KATEGORİ SIDEBAR */}
                <CategorySidebar 
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategorySelect={onCategorySelect}
                    isDarkMode={isDarkMode}
                />

                {/* ÜRÜN GRID */}
                <ProductGrid 
                    products={processedProducts}
                    onProductClick={onProductClick}
                    isDarkMode={isDarkMode}
                />
            </div>
        </div>
    );
};

export default MenuPanel;