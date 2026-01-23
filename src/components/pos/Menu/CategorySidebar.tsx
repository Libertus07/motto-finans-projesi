// components/pos/Menu/CategorySidebar.tsx
import React from 'react';
import { getCategoryTheme } from '../../../utils/pos/themes';

interface CategorySidebarProps {
    categories: string[];
    selectedCategory: string;
    onCategorySelect: (category: string) => void;
    isDarkMode: boolean;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({
    categories,
    selectedCategory,
    onCategorySelect,
    isDarkMode
}) => {
    return (
        <div className={`
            w-24 lg:w-28 flex flex-col gap-2 p-2 border-r 
            overflow-y-auto custom-scrollbar shrink-0 pb-28 lg:pb-2
            ${isDarkMode
                ? 'bg-[#11151f]/50 border-white/5'
                : 'bg-slate-50/50 border-slate-200'}
        `}>
            {/* BAŞLIK */}
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-2 mb-1 mt-2">
                KATEGORİ
            </div>

            {/* KATEGORİ BUTONLARI */}
            {categories.map(category => {
                const theme = getCategoryTheme(category, isDarkMode);
                const isSelected = selectedCategory === category;

                return (
                    <button
                        key={category}
                        onClick={() => onCategorySelect(category)}
                        className={`
                            relative w-full text-left px-3 py-4 rounded-xl 
                            text-[10px] lg:text-[11px] font-bold 
                            transition-all duration-300 group overflow-hidden border
                            ${isSelected
                                ? `${theme.bg} ${theme.text} ${theme.border} shadow-lg`
                                : `bg-transparent border-transparent ${isDarkMode
                                    ? 'text-slate-500 hover:text-slate-300'
                                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
                                }`
                            }
                        `}
                    >
                        {/* AKTİF İNDİKATÖR (Sadece Dark Mode'da) */}
                        {isSelected && isDarkMode && (
                            <div className={`
                                absolute left-0 top-3 bottom-3 w-1 rounded-r-full 
                                shadow-[0_0_10px] ${theme.indicator} 
                                bg-current opacity-80
                            `} />
                        )}

                        <span className="relative z-10 block truncate">
                            {category}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default CategorySidebar;
