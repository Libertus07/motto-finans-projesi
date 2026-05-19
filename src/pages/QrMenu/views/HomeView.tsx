import React, { useEffect } from 'react';
import {
    ChevronLeft,
    Grid3X3,
    MapPin,
    Clock,
    Search,
    Sparkles,
    Star
} from 'lucide-react';
import { Product } from '../../../types';
import { CustomerProfile } from './qrMenu';
import SkeletonLoader from '../components/SkeletonLoader';
import CoffeeLoader from '../components/CoffeeLoader';

interface HomeViewProps {
    loading: boolean;
    products: Product[];
    categories: string[];
    activeCategory: string | null;
    productsByCategory: Record<string, Product[]>;
    isMember: boolean;
    customerProfile: CustomerProfile | null;
    onCategoryClick: (category: string) => void;
    onProductClick: (product: Product) => void;
    onWheelClick: () => void;
    onOracleClick: () => void;
    onScratchClick: () => void;
    onAuthClick: () => void;
    onAccountClick: () => void;
    onResetCategory: () => void;
    t: (key: string) => string;
    categoryImages?: Record<string, string>;
}

const categoryEmojiMap: Record<string, string> = {
    'İmza Kahveler': '☕',
    'Kokteyl & Özel İçecekler': '🍹',
    'Soğuk Kahveler': '🧊',
    'Soğuk İçecekler': '🥤',
    'Sıcak Kahveler': '🔥',
    'Sıcak İçecekler': '🫖',
    'Pastalar': '🍰',
    'Sütlü Tatlılar': '🍮',
    'Milkshake & Frappe': '🥛',
    'Frozen & Bubble Tea': '🧋',
    'Dondurmalar': '🍨',
    'Yöresel Kahveler': '☕',

    // Eski veri varsa bozulmasın diye:
    'Kahveler': '☕',
    'Tatlılar': '🍰',
    'Çaylar': '🫖',
    'Özel Karışımlar': '🍹',
    'Atıştırmalıklar': '🥐',
    'Kahvaltılıklar': '🥐'
};

const HomeView: React.FC<HomeViewProps> = ({
    loading,
    products,
    categories,
    activeCategory,
    productsByCategory,
    onCategoryClick,
    onProductClick,
    onResetCategory,
    categoryImages = {}
}) => {
    useEffect(() => {
        if (activeCategory) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [activeCategory]);

    if (loading) return <SkeletonLoader />;

    if (products.length === 0) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center pb-32">
                <CoffeeLoader />
            </div>
        );
    }

    const featuredProducts = products.slice(0, 4);

    return (
        <main className="min-h-screen bg-[#FDFBF7] pb-32 text-[#432818]">
            {!activeCategory ? (
                <>
                    <HeroSection />

                    <section className="px-5 mt-6">
                        <div className="rounded-[2.2rem] bg-gradient-to-br from-[#432818] to-[#24140d] p-5 text-[#FDFBF7] shadow-[0_18px_45px_rgba(67,40,24,0.18)] overflow-hidden relative">
                            <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-[#D4AF37]/10" />
                            <div className="absolute -right-6 -bottom-10 text-[7rem] opacity-10">
                                ☕
                            </div>

                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/20 px-3 py-1 mb-4">
                                    <Sparkles size={14} className="text-[#D4AF37]" />
                                    <span className="text-[10px] font-black tracking-[0.18em] uppercase text-[#D4AF37]">
                                        Bu Haftaya Özel
                                    </span>
                                </div>

                                <h2 className="text-2xl font-black leading-tight mb-2">
                                    Kahve yanında tatlı keyfi
                                </h2>

                                <p className="text-sm leading-relaxed text-[#FDFBF7]/75 max-w-[260px]">
                                    Günlük kampanyaları, öne çıkan ürünleri ve özel fırsatları burada göstereceğiz.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="px-5 mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-[#D4AF37] text-[11px] font-black tracking-[0.25em] uppercase mb-1">
                                    Menü
                                </p>
                                <h2 className="text-2xl font-black">
                                    Kategoriler
                                </h2>
                            </div>

                            <div className="w-11 h-11 rounded-[1.25rem] bg-white border border-[#432818]/10 flex items-center justify-center shadow-sm">
                                <Grid3X3 size={20} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {categories.map((category) => (
                                <CategoryCard
                                    key={category}
                                    category={category}
                                    count={productsByCategory[category]?.length || 0}
                                    image={categoryImages[category]}
                                    onClick={() => onCategoryClick(category)}
                                />
                            ))}
                        </div>
                    </section>

                    <section className="px-5 mt-9">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-[#D4AF37] text-[11px] font-black tracking-[0.25em] uppercase mb-1">
                                    Seçili Lezzetler
                                </p>
                                <h2 className="text-2xl font-black">
                                    Öne Çıkanlar
                                </h2>
                            </div>

                            <Star size={22} className="text-[#D4AF37]" />
                        </div>

                        <div className="grid gap-4">
                            {featuredProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onClick={() => onProductClick(product)}
                                />
                            ))}
                        </div>
                    </section>

                    <section className="px-5 mt-9">
                        <div className="rounded-[2rem] bg-white border border-[#432818]/10 p-5 shadow-[0_12px_35px_rgba(67,40,24,0.06)]">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-[1.2rem] bg-[#432818]/5 flex items-center justify-center shrink-0">
                                    <MapPin size={22} />
                                </div>

                                <div>
                                    <h3 className="font-black mb-1">
                                        Motto Coffee Yüksekova
                                    </h3>
                                    <p className="text-sm text-[#432818]/60 leading-relaxed">
                                        İpek Yolu Caddesi Halkbank karşısı Altekin Plaza altı, Yüksekova / Hakkari
                                    </p>
                                </div>
                            </div>

                            <div className="h-px bg-[#432818]/10 my-4" />

                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-[1.2rem] bg-[#432818]/5 flex items-center justify-center shrink-0">
                                    <Clock size={22} />
                                </div>

                                <div>
                                    <h3 className="font-black mb-1">
                                        Çalışma Saatleri
                                    </h3>
                                    <p className="text-sm text-[#432818]/60">
                                        08:00 - 01:00
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </>
            ) : (
                <CategoryProductsView
                    category={activeCategory}
                    products={productsByCategory[activeCategory] || []}
                    onBack={onResetCategory}
                    onProductClick={onProductClick}
                />
            )}
        </main>
    );
};

function HeroSection() {
    return (
        <header className="px-5 pt-8 text-center">
            <div className="mx-auto w-40 h-32 rounded-[2.5rem] bg-white border border-[#432818]/10 shadow-[0_18px_45px_rgba(67,40,24,0.12)] overflow-hidden flex items-center justify-center mb-6">
                <img
                    src="/logo.png"
                    alt="Motto Coffee Logo"
                    className="w-full h-full object-cover"
                />
            </div>

            <p className="text-[#D4AF37] text-[11px] font-black tracking-[0.35em] uppercase mb-2">
                QR Menü
            </p>

            <h1 className="text-[2.15rem] leading-tight font-black tracking-tight">
                Motto Coffee
                <span className="block text-[1.6rem]">
                    & Patisserie
                </span>
            </h1>

            <p className="text-[#432818]/55 font-bold mt-3">
                Wake up to a new motto!
            </p>

            <div className="mt-5 flex items-center justify-center gap-2 text-[#432818]/45 text-xs font-bold">
                <Search size={15} />
                <span>Alt menüden arama yapabilir, garson çağırabilir veya iletişim bilgilerine ulaşabilirsiniz.</span>
            </div>
        </header>
    );
}

function CategoryCard({
    category,
    count,
    image,
    onClick
}: {
    category: string;
    count: number;
    image?: string;
    onClick: () => void;
}) {
    const emoji = categoryEmojiMap[category] || '☕';

    return (
        <button
            onClick={onClick}
            className="group min-h-[150px] rounded-[2rem] bg-white border border-[#432818]/10 shadow-[0_12px_30px_rgba(67,40,24,0.06)] p-4 text-left active:scale-[0.97] transition-all overflow-hidden relative"
        >
            <div className="absolute -right-8 -bottom-8 text-[6rem] opacity-[0.04] group-hover:opacity-[0.08] transition-opacity">
                {emoji}
            </div>

            <div className="relative z-10">
                <div className="w-16 h-16 rounded-[1.5rem] bg-[#F7EFE6] border border-[#432818]/8 flex items-center justify-center text-3xl overflow-hidden mb-4">
                    {image ? (
                        <img src={image} alt={category} className="w-full h-full object-cover" />
                    ) : (
                        <span>{emoji}</span>
                    )}
                </div>

                <h3 className="font-black text-[#432818] leading-tight text-[15px] mb-2">
                    {category}
                </h3>

                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#432818]/5 px-2.5 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                    <span className="text-[10px] font-black text-[#432818]/55 uppercase tracking-wider">
                        {count} ürün
                    </span>
                </div>
            </div>
        </button>
    );
}

function CategoryProductsView({
    category,
    products,
    onBack,
    onProductClick
}: {
    category: string;
    products: Product[];
    onBack: () => void;
    onProductClick: (product: Product) => void;
}) {
    return (
        <section className="px-5 pt-5">
            <div className="sticky top-0 z-30 -mx-5 px-5 pt-4 pb-4 bg-[#FDFBF7]/95 backdrop-blur-xl border-b border-[#432818]/5">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="w-12 h-12 rounded-[1.3rem] bg-white border border-[#432818]/10 flex items-center justify-center shadow-sm active:scale-95"
                    >
                        <ChevronLeft size={23} />
                    </button>

                    <div className="min-w-0">
                        <p className="text-[#D4AF37] text-[10px] font-black tracking-[0.25em] uppercase mb-1">
                            Kategori
                        </p>
                        <h1 className="text-2xl font-black truncate">
                            {category}
                        </h1>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 mt-5">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onClick={() => onProductClick(product)}
                    />
                ))}
            </div>
        </section>
    );
}

function ProductCard({
    product,
    onClick
}: {
    product: Product;
    onClick: () => void;
}) {
    const imageValue = (product as any).image as string | undefined;
    const hasImage =
        typeof imageValue === 'string' &&
        (imageValue.startsWith('http') ||
            imageValue.startsWith('/') ||
            imageValue.startsWith('data:'));

    const isSoldOut = (product as any).stock !== undefined && (product as any).stock <= 0;

    return (
        <button
            onClick={onClick}
            disabled={isSoldOut}
            className={`w-full rounded-[2rem] bg-white border border-[#432818]/10 shadow-[0_12px_32px_rgba(67,40,24,0.06)] p-4 text-left flex gap-4 active:scale-[0.98] transition-all ${isSoldOut ? 'opacity-50 grayscale' : ''
                }`}
        >
            <div className="w-20 h-20 rounded-[1.5rem] bg-[#F7EFE6] border border-[#432818]/8 flex items-center justify-center text-3xl shrink-0 overflow-hidden">
                {hasImage ? (
                    <img src={imageValue} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                    <span>{imageValue || '☕'}</span>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className="font-black text-[#432818] text-[17px] leading-tight">
                            {product.name}
                        </h3>

                        {product.description && (
                            <p className="text-[#432818]/55 text-sm leading-relaxed mt-1 line-clamp-2">
                                {product.description}
                            </p>
                        )}
                    </div>

                    <div className="shrink-0 text-right">
                        <span className="block text-[10px] font-black text-[#D4AF37] tracking-[0.16em] uppercase mb-1">
                            Fiyat
                        </span>
                        <strong className="text-[#432818] text-xl font-black whitespace-nowrap">
                            {product.price}₺
                        </strong>
                    </div>
                </div>

                {isSoldOut && (
                    <div className="mt-3 inline-flex rounded-full bg-red-500/10 px-3 py-1 text-red-600 text-xs font-black">
                        Tükendi
                    </div>
                )}
            </div>
        </button>
    );
}

export default HomeView;