import React, { useMemo } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { Product } from '../../../types';

interface SearchViewProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    products: Product[];
    onProductClick: (product: Product) => void;
}

const SearchView: React.FC<SearchViewProps> = ({ searchQuery, setSearchQuery, products, onProductClick }) => {
    const filteredProducts = useMemo(() => {
        if (!searchQuery) return [];
        return products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [searchQuery, products]);

    return (
        <div className="min-h-screen bg-[#FDFBF7]">
            <div className="p-4 sticky top-0 bg-[#FDFBF7]/90 backdrop-blur-sm z-10 border-b border-[#432818]/5">
                <div className="relative">
                    <Search className="absolute left-4 top-3.5 text-[#432818]/40" size={20} />
                    <input
                        autoFocus
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        type="text"
                        placeholder="Menüde ara..."
                        className="w-full pl-11 pr-4 py-3 bg-white border border-[#432818]/10 rounded-xl focus:border-[#D4AF37] focus:outline-none text-[#432818] font-cinzel"
                    />
                </div>
            </div>
            <div className="px-4 pt-4 pb-32">
                {filteredProducts.map(item => (
                    <div key={item.id} onClick={() => onProductClick(item)} className="p-4 bg-white border border-[#432818]/5 rounded-xl mb-2 flex justify-between items-center active:scale-[0.99] transition-transform">
                        <span className="font-bold text-[#432818] font-cinzel">{item.name}</span>
                        <ChevronRight size={16} className="text-[#432818]/40" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SearchView;