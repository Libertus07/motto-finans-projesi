// components/pos/Menu/MenuPanel.tsx
import React from 'react';
import MenuHeader from './MenuHeader';
import { Search, Grid, LayoutGrid, ListFilter, ArrowDownUp, X } from 'lucide-react';
import CategorySidebar from './CategorySidebar';
import ProductGrid from './ProductGrid';
import { Product } from '../../../types';

interface MenuPanelProps {
    // State
    isDarkMode: boolean;
    categories: string[];
    selectedCategory: string;
    searchTerm: string;
    sortOption: string;
    isSortMenuOpen: boolean;
    processedProducts: Product[];
    activeTab: string;

    // Handlers
    onThemeToggle: () => void;
    onCategorySelect: (category: string) => void;
    onSearchChange: (value: string) => void;
    onSortToggle: () => void;
    onSortSelect: (option: string) => void;
    onProductClick: (product: Product) => void;
}

const MenuPanel: React.FC<MenuPanelProps> = ({
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
    onProductClick,
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
