import React, { useEffect } from 'react';
import { Plus, Clock, Leaf, Flame, Wheat, User, Bell } from 'lucide-react';
import { Product } from '../../../types';
import { CustomerProfile } from './qrMenu';
import { getTodayString } from '../../../utils/helpers';
import VoltWidget from '../components/VoltWidget';
import StampCard from '../components/StampCard';
import LiveTrends from '../components/LiveTrends';
import JukeboxWidget from '../components/JukeboxWidget';
import GuestbookWidget from '../components/GuestbookWidget';
import MottoGameWidget from '../components/MottoGameWidget';
import { ChevronLeft, LayoutGrid, Lock } from 'lucide-react';
import SkeletonLoader from '../components/SkeletonLoader';
import CoffeeLoader from '../components/CoffeeLoader';

const categoryEmojiMap: Record<string, string> = {
    'Kahveler': '☕',
    'Soğuk İçecekler': '🥤',
    'Tatlılar': '🍰',
    'Atıştırmalıklar': '🥪',
    'Çaylar': '🫖',
    'Özel Karışımlar': '🧪',
    'Kahvaltılıklar': '🥐',
    'Sıcak İçecekler': '🔥'
};

const categoryImageMap: Record<string, string> = {
    'Kahveler': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=300&q=80',
    'Soğuk İçecekler': 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?auto=format&fit=crop&w=300&q=80',
    'Tatlılar': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=300&q=80',
    'Atıştırmalıklar': 'https://images.unsplash.com/photo-1621510456098-9452928a330c?auto=format&fit=crop&w=300&q=80',
    'Çaylar': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=300&q=80',
    'Özel Karışımlar': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=300&q=80',
    'Kahvaltılıklar': 'https://images.unsplash.com/photo-1533089862017-ec7373ae410c?auto=format&fit=crop&w=300&q=80',
    'Sıcak İçecekler': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=300&q=80'
};

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

const HomeView: React.FC<HomeViewProps> = ({
    loading,
    products,
    categories,
    activeCategory,
    productsByCategory,
    isMember,
    customerProfile,
    onCategoryClick,
    onProductClick,
    onWheelClick,
    onOracleClick,
    onScratchClick,
    onAuthClick,
    onAccountClick,
    onResetCategory,
    t,
    categoryImages = {}
}) => {
    useEffect(() => {
        if (activeCategory) {
            const element = document.getElementById(`cat-tab-${activeCategory}`);
            if (element) {
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }
        }
    }, [activeCategory]);
    const renderDietLabels = (product: Product) => (
        <div className="flex flex-col gap-1.5 absolute top-3 left-3 z-10">
            {product.isVegan && (
                <div className="bg-emerald-500/90 backdrop-blur-md text-white p-1.5 rounded-full shadow-lg ring-1 ring-white/20" title="Vegan">
                    <Leaf size={10} fill="currentColor" />
                </div>
            )}
            {product.isSpicy && (
                <div className="bg-red-500/90 backdrop-blur-md text-white p-1.5 rounded-full shadow-lg ring-1 ring-white/20" title="Acı">
                    <Flame size={10} fill="currentColor" />
                </div>
            )}
            {product.isGlutenFree && (
                <div className="bg-amber-500/90 backdrop-blur-md text-white p-1.5 rounded-full shadow-lg ring-1 ring-white/20" title="Glutensiz">
                    <Wheat size={10} />
                </div>
            )}
        </div>
    );

    // Yönetici Kontrolü ve Çark Durumu
    const isUserAdmin = customerProfile?.role === 'admin' || customerProfile?.isAdmin === true;
    const isWheelDisabled = isMember && customerProfile?.lastSpinDate === getTodayString() && !isUserAdmin;

    if (loading) return <SkeletonLoader />;

    if (products.length === 0) return (
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center pb-32">
            <CoffeeLoader />
        </div>
    );

    return (

        <div className="min-h-screen bg-[#FDFBF7] pb-32">
            {/* --- PREMIUM HEADER --- */}
            <div className="bg-[#FDFBF7]/80 backdrop-blur-xl z-40 sticky top-0 transition-all border-b border-[#432818]/5 pb-0 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
                <div className="p-5 pb-3">
                    <div className="relative flex items-center justify-between mb-2 min-h-[48px]">

                        {/* Left: Back Button */}
                        <div className="flex items-center min-w-[48px] z-20">
                            {activeCategory && (
                                <button
                                    onClick={onResetCategory}
                                    className="w-11 h-11 rounded-[1.2rem] bg-white text-[#432818] ring-1 ring-[#432818]/5 flex items-center justify-center active:scale-90 hover:shadow-lg transition-all duration-300 group"
                                >
                                    <ChevronLeft size={22} className="group-hover:-translate-x-0.5 transition-transform" />
                                </button>
                            )}
                        </div>

                        {/* Center: Brand Title */}
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center z-10 pointer-events-none">
                            <button
                                onClick={onResetCategory}
                                className="pointer-events-auto flex flex-col items-center justify-center group/brand"
                            >
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="h-[1.5px] w-4 bg-[#D4AF37]"></span>
                                    <span className="text-xs font-black text-[#D4AF37] uppercase tracking-[0.4em] font-cinzel leading-none drop-shadow-sm">
                                        {activeCategory ? 'MENÜ' : 'MOTTO'}
                                    </span>
                                    <span className="h-[1.5px] w-4 bg-[#D4AF37]"></span>
                                </div>
                                <h1 className="text-2xl font-black text-[#432818] tracking-widest font-cinzel leading-none drop-shadow-md whitespace-nowrap bg-gradient-to-br from-[#432818] to-[#603813] bg-clip-text text-transparent">
                                    {activeCategory ? activeCategory.toUpperCase() : 'OLIMPOS'}
                                </h1>
                            </button>
                        </div>

                        {/* Right: Action Buttons */}
                        <div className="flex items-center gap-3 z-20">


                            <button
                                onClick={isMember ? onAccountClick : onAuthClick}
                                className={`w-11 h-11 rounded-[1.2rem] flex items-center justify-center font-black text-sm shadow-md overflow-hidden relative active:scale-90 transition-transform ${isMember ? 'bg-gradient-to-br from-[#432818] to-[#2a1810] ring-2 ring-[#D4AF37] text-[#FDFBF7]' : 'bg-white text-[#432818] ring-1 ring-[#432818]/5'}`}
                            >
                                {isMember ? (
                                    <span className="font-cinzel text-lg">{customerProfile?.firstName?.charAt(0)}</span>
                                ) : (
                                    <User size={20} className="opacity-80" />
                                )}
                                {isMember && <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.4)_0%,transparent_60%)]"></div>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Categories Tab Bar */}
                <div className={`px-5 pb-2 overflow-x-auto scrollbar-hide flex gap-3 snap-x transition-all duration-300 ${activeCategory ? 'pb-4' : 'pb-2'}`}>
                    {categories.map(cat => (
                        <button
                            id={`cat-tab-${cat}`}
                            key={cat}
                            onClick={() => onCategoryClick(cat)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black whitespace-nowrap transition-all font-cinzel tracking-[0.1em] shrink-0 snap-center border shadow-sm flex items-center gap-2 ${activeCategory === cat
                                ? 'bg-[#432818] text-[#D4AF37] border-[#432818] scale-105 shadow-md'
                                : 'bg-white text-[#432818]/60 border-[#432818]/5 hover:bg-[#FDFBF7] hover:border-[#D4AF37]/20'}`}
                        >
                            {activeCategory && <span className="text-base">{categoryEmojiMap[cat] || '☕'}</span>}
                            <span>{cat.toUpperCase()}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="pt-6">
                {!activeCategory ? (
                    <>
                        <div className="px-5 space-y-4 mt-6">
                            {/* Top row: Side-by-side */}
                            <div className="grid grid-cols-2 gap-4">
                                <VoltWidget customerProfile={customerProfile} isMember={isMember} onOpenAuth={onAuthClick} />
                                <MottoGameWidget
                                    onWheelClick={onWheelClick}
                                    onOracleClick={onOracleClick}
                                    onScratchClick={onScratchClick}
                                />
                            </div>

                            {/* Bottom row: Full width horizontal */}
                            <StampCard isMember={isMember} customerProfile={customerProfile} onOpenAuth={onAuthClick} />
                        </div>

                        {/* --- CATEGORY GRID --- */}
                        <div className="mt-16">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-2xl bg-[#432818]/5 flex items-center justify-center text-[#432818] shadow-sm"><LayoutGrid size={20} strokeWidth={2} /></div>
                                <h2 className="text-2xl font-black text-[#432818] font-cinzel leading-none uppercase tracking-tight">Menüyü Keşfet</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => onCategoryClick(cat)}
                                        className="group relative h-40 bg-white rounded-[2.5rem] border border-[#432818]/10 shadow-lg shadow-[#432818]/5 hover:shadow-xl hover:shadow-[#432818]/10 overflow-hidden active:scale-95 transition-all p-4 flex flex-col justify-center items-center text-center gap-3 hover:border-[#D4AF37]"
                                    >
                                        <div className="w-16 h-16 bg-[#F9F7F5] rounded-[1.5rem] flex items-center justify-center text-3xl group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 shadow-sm ring-1 ring-[#432818]/5 overflow-hidden relative">
                                            {categoryImages[cat] || categoryImageMap[cat] ? (
                                                <img
                                                    src={categoryImages[cat] || categoryImageMap[cat]}
                                                    alt={cat}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                categoryEmojiMap[cat] || '☕'
                                            )}
                                            {/* Gradient Overlay for Images */}
                                            {(categoryImages[cat] || categoryImageMap[cat]) && <div className="absolute inset-0 bg-[#432818]/10 group-hover:bg-transparent transition-colors"></div>}
                                        </div>
                                        <div className="z-10 relative w-full flex flex-col items-center">
                                            <h3 className="font-extrabold text-[#432818] font-cinzel text-sm leading-tight tracking-wide mb-1 group-hover:text-[#BB9457] transition-colors break-words w-full px-1">{cat.toUpperCase()}</h3>
                                            <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity justify-center">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#432818]">{productsByCategory[cat]?.length || 0} ÇEŞİT</span>
                                            </div>
                                        </div>

                                        {/* Decorative Background */}
                                        <div className="absolute -right-6 -bottom-6 text-[5rem] opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-700 pointer-events-none rotate-12 filter grayscale">
                                            {categoryEmojiMap[cat] || '☕'}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div
                        className="px-5 animate-in fade-in duration-500 ease-out"
                        onTouchStart={(e) => {
                            const touch = e.touches[0];
                            (window as any).swipeStartX = touch.clientX;
                            (window as any).swipeStartY = touch.clientY;
                        }}
                        onTouchEnd={(e) => {
                            const touch = e.changedTouches[0];
                            const deltaX = touch.clientX - (window as any).swipeStartX;
                            const deltaY = touch.clientY - (window as any).swipeStartY;

                            // Yatay hareketi dikeyden daha baskın mı? (Dikey scroll'u bozmamak için)
                            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 70) {
                                const currentIndex = categories.indexOf(activeCategory);
                                if (deltaX > 0) {
                                    // Swipe Right -> Previous Category
                                    if (currentIndex > 0) {
                                        onCategoryClick(categories[currentIndex - 1]);
                                    }
                                } else {
                                    // Swipe Left -> Next Category
                                    if (currentIndex < categories.length - 1) {
                                        onCategoryClick(categories[currentIndex + 1]);
                                    }
                                }
                            }
                        }}
                    >
                        {/* --- PRODUCT LIST --- */}
                        <div className="grid gap-5 pb-20">
                            {productsByCategory[activeCategory]?.map((item, index) => (
                                <div
                                    key={item.id}
                                    onClick={() => item.stock !== undefined && item.stock <= 0 ? null : onProductClick(item)}
                                    className={`group bg-white p-4 rounded-[2.5rem] border border-[#432818]/5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex gap-5 active:scale-[0.98] transition-all relative overflow-hidden ${item.stock !== undefined && item.stock <= 0 ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:shadow-[0_15px_40px_rgba(67,40,24,0.08)] hover:border-[#D4AF37]/30'}`}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {renderDietLabels(item)}
                                    <div className="w-28 h-28 bg-[#F9F7F5] rounded-[2rem] flex items-center justify-center text-5xl shrink-0 relative group-hover:scale-105 transition-transform duration-500 overflow-hidden shadow-inner ring-1 ring-[#432818]/5">
                                        {item.image || '☕'}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent"></div>
                                        {item.stock !== undefined && item.stock <= 0 && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20">
                                                <span className="text-[10px] font-black text-white bg-red-600 px-2 py-1 rounded-[0.5rem] uppercase tracking-widest border border-white/20 shadow-lg -rotate-12">Tükendi</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 py-1.5 flex flex-col justify-between min-w-0">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-black text-[#432818] font-cinzel text-lg leading-tight truncate pr-2 group-hover:text-[#D4AF37] transition-colors">{item.name}</h3>
                                            </div>
                                            <p className="text-[11px] font-medium text-[#432818]/50 line-clamp-2 mt-1.5 leading-relaxed tracking-wide">{item.description}</p>
                                        </div>
                                        <div className="flex justify-between items-end mt-2">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-[#BB9457] uppercase tracking-widest opacity-80 mb-0.5">FİYAT</span>
                                                <span className="font-black text-[#432818] text-2xl font-cinzel leading-none tracking-tighter">{item.price} ₺</span>
                                            </div>
                                            <button
                                                disabled={item.stock !== undefined && item.stock <= 0}
                                                className={`w-11 h-11 rounded-2xl flex items-center justify-center border border-[#432818]/10 transition-all duration-300 ${item.stock !== undefined && item.stock <= 0 ? 'bg-[#432818]/5 text-[#432818]/20 cursor-not-allowed' : 'bg-[#432818]/5 text-[#432818] group-hover:bg-[#432818] group-hover:text-[#D4AF37] group-hover:shadow-lg group-hover:shadow-[#432818]/20'}`}
                                            >
                                                <Plus size={22} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* --- EXPERIENCE SECTIONS (Navigated from HUB) --- */}
            <div className="mt-20 space-y-8 pb-10 relative">
                {/* LOCKED OVERLAY */}
                <div className="absolute inset-0 z-20 backdrop-blur-sm bg-[#FDFBF7]/60 flex flex-col items-center justify-center text-center p-6 rounded-3xl border border-[#432818]/5">
                    <div className="w-16 h-16 bg-[#432818] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#432818]/20 mb-4 ring-4 ring-[#FDFBF7]">
                        <Lock size={32} className="text-[#D4AF37]" />
                    </div>
                    <h3 className="font-black text-2xl text-[#432818] font-cinzel mb-2">YAKINDA</h3>
                    <p className="text-[#432818]/60 font-medium max-w-xs leading-relaxed">
                        Motto Club deneyim alanı çok yakında sizlerle buluşacak. Yeni özellikler için takipte kalın!
                    </p>
                </div>

                <div className="opacity-40 grayscale pointer-events-none select-none filter blur-[2px]">
                    <div id="live-trends">
                        <LiveTrends />
                    </div>
                    <div id="jukebox-widget">
                        <JukeboxWidget />
                    </div>
                    <div id="guestbook-widget">
                        <GuestbookWidget />
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center py-12 opacity-30 mix-blend-multiply">
                <div className="w-8 h-8 opacity-20 mb-3 grayscale">☕</div>
                <p className="text-[10px] font-black font-cinzel tracking-[0.4em] text-[#432818]">EST. 2023 • MOTTO CLUB</p>
            </div>
        </div >
    );
};

export default HomeView;
