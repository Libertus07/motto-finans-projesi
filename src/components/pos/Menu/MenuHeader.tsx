// components/pos/Menu/MenuHeader.tsx
import React from 'react';
import {
    Grid, Search, Sun, Moon,
    TrendingUp, ArrowUpNarrowWide, ArrowDownWideNarrow, ArrowDownAZ,
    QrCode
} from 'lucide-react';

interface MenuHeaderProps {
    isDarkMode: boolean;
    searchTerm: string;
    sortOption: string;
    isSortMenuOpen: boolean;
    onThemeToggle: () => void;
    onSearchChange: (val: string) => void;
    onSortToggle: () => void;
    onSortSelect: (option: string) => void;
}

const MenuHeader: React.FC<MenuHeaderProps> = ({
    isDarkMode,
    searchTerm,
    sortOption,
    isSortMenuOpen,
    onThemeToggle,
    onSearchChange,
    onSortToggle,
    onSortSelect
}) => {

    return (
        <div className={`
            flex justify-between items-center px-6 py-5 border-b 
            backdrop-blur-md z-20 shrink-0
            ${isDarkMode
                ? 'border-white/5 bg-[#141824]/80'
                : 'border-slate-100 bg-white/90'}
        `}>
            {/* SOL TARAF - LOGO & BAŞLIK */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
                    <Grid size={20} />
                </div>
                <div className="flex flex-col">
                    <h2 className={`
                        text-sm font-black tracking-wide leading-none uppercase 
                        ${isDarkMode ? 'text-white' : 'text-slate-800'}
                    `}>
                        Motto Menü
                    </h2>
                    <span className="text-[10px] text-indigo-500 font-bold tracking-wider mt-0.5">
                        ÜRÜN SEÇİMİ
                    </span>
                </div>
            </div>

            {/* SAĞ TARAF - ARAÇLAR */}
            <div className="flex items-center gap-2">
                {/* TEMA DEĞİŞTİRME */}
                <button
                    onClick={onThemeToggle}
                    className={`
                        w-10 h-10 rounded-xl flex items-center justify-center
                        transition-all border
                        ${isDarkMode
                            ? 'bg-slate-800 text-yellow-400 border-white/5 hover:bg-slate-700'
                            : 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100'}
                    `}
                >
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                {/* ARAMA KUTUSU */}
                <div className="relative w-32 lg:w-56 group">
                    <Search
                        size={16}
                        className={`
                            absolute left-3 top-1/2 -translate-y-1/2 transition-colors
                            ${isDarkMode
                                ? 'text-slate-500 group-focus-within:text-indigo-400'
                                : 'text-slate-400 group-focus-within:text-indigo-600'}
                        `}
                    />
                    <input
                        type="text"
                        placeholder="Ürün ara..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className={`
                            block w-full pl-10 pr-3 py-3 border rounded-xl text-xs 
                            placeholder-slate-500 focus:outline-none focus:ring-1 transition-all
                            ${isDarkMode
                                ? 'bg-slate-900/50 border-white/5 text-white focus:ring-indigo-500/50 focus:bg-slate-900'
                                : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-300 focus:ring-indigo-300'}
                        `}
                    />
                </div>

                {/* SIRALAMA MENÜSÜ */}
                <div className="relative">
                    <button
                        onClick={onSortToggle}
                        className={`
                            w-10 h-10 rounded-xl border flex items-center justify-center 
                            transition-colors relative
                            ${isDarkMode
                                ? 'bg-slate-800/50 border-white/5 text-slate-400 hover:text-white hover:bg-slate-700'
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100'}
                        `}
                    >
                        {(() => {
                            switch (sortOption) {
                                case 'price-asc': return <ArrowUpNarrowWide size={18} />;
                                case 'price-desc': return <ArrowDownWideNarrow size={18} />;
                                case 'name': return <ArrowDownAZ size={18} />;
                                default: return <TrendingUp size={18} />;
                            }
                        })()}
                        {sortOption !== 'popularity' && (
                            <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                        )}
                    </button>

                    {/* DROPDOWN MENÜ */}
                    {isSortMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={onSortToggle} />
                            <div className={`
                                absolute right-0 top-12 w-48 rounded-xl border shadow-2xl p-1 z-50 
                                flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-200
                                ${isDarkMode
                                    ? 'bg-[#1e2330] border-white/10'
                                    : 'bg-white border-slate-200'}
                            `}>
                                <button
                                    onClick={() => onSortSelect('popularity')}
                                    className={`
                                        flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors
                                        ${sortOption === 'popularity'
                                            ? 'bg-indigo-600 text-white'
                                            : (isDarkMode
                                                ? 'text-slate-400 hover:bg-white/5 hover:text-white'
                                                : 'text-slate-600 hover:bg-slate-100')}
                                    `}
                                >
                                    <TrendingUp size={14} /> En Çok Satan
                                </button>
                                <button
                                    onClick={() => onSortSelect('price-asc')}
                                    className={`
                                        flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors
                                        ${sortOption === 'price-asc'
                                            ? 'bg-indigo-600 text-white'
                                            : (isDarkMode
                                                ? 'text-slate-400 hover:bg-white/5 hover:text-white'
                                                : 'text-slate-600 hover:bg-slate-100')}
                                    `}
                                >
                                    <ArrowUpNarrowWide size={14} /> Fiyat Artan
                                </button>
                                <button
                                    onClick={() => onSortSelect('price-desc')}
                                    className={`
                                        flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors
                                        ${sortOption === 'price-desc'
                                            ? 'bg-indigo-600 text-white'
                                            : (isDarkMode
                                                ? 'text-slate-400 hover:bg-white/5 hover:text-white'
                                                : 'text-slate-600 hover:bg-slate-100')}
                                    `}
                                >
                                    <ArrowDownWideNarrow size={14} /> Fiyat Azalan
                                </button>
                                <button
                                    onClick={() => onSortSelect('name')}
                                    className={`
                                        flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors
                                        ${sortOption === 'name'
                                            ? 'bg-indigo-600 text-white'
                                            : (isDarkMode
                                                ? 'text-slate-400 hover:bg-white/5 hover:text-white'
                                                : 'text-slate-600 hover:bg-slate-100')}
                                    `}
                                >
                                    <ArrowDownAZ size={14} /> İsim (A-Z)
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MenuHeader;
