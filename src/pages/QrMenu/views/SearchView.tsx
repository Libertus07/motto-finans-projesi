import React, { useMemo } from 'react';
import { Search, Coffee, Tag, Sparkles } from 'lucide-react';
import { Product } from '../../../types';

interface SearchViewProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    products: Product[];
    onProductClick: (product: Product) => void;
}

const SearchView: React.FC<SearchViewProps> = ({
    searchQuery,
    setSearchQuery,
    products,
    onProductClick
}) => {
    const filteredProducts = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        if (!query) {
            return products.slice(0, 12);
        }

        return products.filter((product) => {
            return (
                product.name.toLowerCase().includes(query) ||
                product.category.toLowerCase().includes(query) ||
                product.description?.toLowerCase().includes(query)
            );
        });
    }, [searchQuery, products]);

    return (
        <main className="min-h-screen bg-[#FDFBF7] pb-32 text-[#432818]">
            <section className="sticky top-0 z-30 bg-[#FDFBF7]/95 backdrop-blur-xl border-b border-[#432818]/5 px-5 pt-6 pb-4">
                <p className="text-[#D4AF37] text-[11px] font-black tracking-[0.30em] uppercase mb-2">
                    Arama
                </p>

                <h1 className="text-3xl font-black tracking-tight mb-4">
                    Menüde hızlıca ara
                </h1>

                <div className="relative">
                    <Search
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#432818]/40"
                        size={21}
                    />

                    <input
                        autoFocus
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        type="text"
                        placeholder="Latte, cheesecake, çay..."
                        className="w-full h-14 pl-12 pr-4 bg-white border border-[#432818]/10 rounded-[1.4rem] focus:border-[#D4AF37] focus:outline-none text-[#432818] font-semibold shadow-[0_10px_30px_rgba(67,40,24,0.05)]"
                    />
                </div>
            </section>

            <section className="px-5 pt-5">
                {!searchQuery.trim() && (
                    <div className="rounded-[2rem] bg-gradient-to-br from-[#432818] to-[#24140d] text-[#FDFBF7] p-5 mb-5 shadow-[0_16px_40px_rgba(67,40,24,0.16)] relative overflow-hidden">
                        <div className="absolute -right-8 -bottom-10 text-[7rem] opacity-10">
                            ☕
                        </div>

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/20 px-3 py-1 mb-3">
                                <Sparkles size={14} className="text-[#D4AF37]" />
                                <span className="text-[10px] font-black tracking-[0.18em] uppercase text-[#D4AF37]">
                                    Hızlı Bul
                                </span>
                            </div>

                            <h2 className="text-xl font-black mb-1">
                                Popüler ürünlerden başlayın
                            </h2>

                            <p className="text-sm text-[#FDFBF7]/70 leading-relaxed">
                                Ürün adı, kategori veya açıklama yazarak menüde hızlıca arama yapabilirsiniz.
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-[#D4AF37] text-[10px] font-black tracking-[0.24em] uppercase mb-1">
                            Sonuçlar
                        </p>

                        <h2 className="text-xl font-black">
                            {searchQuery.trim()
                                ? `${filteredProducts.length} ürün bulundu`
                                : 'Önerilen ürünler'}
                        </h2>
                    </div>

                    <div className="w-10 h-10 rounded-[1.1rem] bg-white border border-[#432818]/10 flex items-center justify-center shadow-sm">
                        <Tag size={19} />
                    </div>
                </div>

                {filteredProducts.length > 0 ? (
                    <div className="grid gap-4">
                        {filteredProducts.map((product) => (
                            <SearchProductCard
                                key={product.id}
                                product={product}
                                onClick={() => onProductClick(product)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-[2rem] bg-white border border-[#432818]/10 p-7 text-center shadow-[0_12px_30px_rgba(67,40,24,0.05)]">
                        <div className="w-16 h-16 mx-auto rounded-[1.5rem] bg-[#432818]/5 flex items-center justify-center mb-4">
                            <Search size={28} className="text-[#432818]/45" />
                        </div>

                        <h3 className="text-xl font-black mb-2">
                            Ürün bulunamadı
                        </h3>

                        <p className="text-[#432818]/55 leading-relaxed">
                            Farklı bir kelime deneyebilir veya ana sayfadan kategorilere göz atabilirsiniz.
                        </p>
                    </div>
                )}
            </section>
        </main>
    );
};

function SearchProductCard({
    product,
    onClick
}: {
    product: Product;
    onClick: () => void;
}) {
    const imageValue = product.image;

    const hasRealImage =
        typeof imageValue === 'string' &&
        (imageValue.startsWith('http') ||
            imageValue.startsWith('/') ||
            imageValue.startsWith('data:'));

    return (
        <button
            onClick={onClick}
            className="w-full rounded-[2rem] bg-white border border-[#432818]/10 shadow-[0_12px_32px_rgba(67,40,24,0.06)] p-4 text-left flex gap-4 active:scale-[0.98] transition-all"
        >
            <div className="w-[72px] h-[72px] rounded-[1.4rem] bg-[#F7EFE6] border border-[#432818]/8 flex items-center justify-center text-3xl overflow-hidden shrink-0">
                {hasRealImage ? (
                    <img
                        src={imageValue}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span>{imageValue || <Coffee size={34} />}</span>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-[#D4AF37] text-[9px] font-black tracking-[0.18em] uppercase mb-1 truncate">
                    {product.category}
                </p>

                <h3 className="font-black text-[#432818] text-[17px] leading-tight mb-1">
                    {product.name}
                </h3>

                {product.description && (
                    <p className="text-[#432818]/55 text-sm leading-relaxed line-clamp-2 mb-2">
                        {product.description}
                    </p>
                )}

                <strong className="inline-flex rounded-full bg-[#432818] text-[#D4AF37] px-3 py-1.5 text-sm font-black">
                    {product.price}₺
                </strong>
            </div>
        </button>
    );
}

export default SearchView;