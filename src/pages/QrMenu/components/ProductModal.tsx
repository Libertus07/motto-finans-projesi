import React from 'react';
import { X, Coffee, Info, Tag } from 'lucide-react';
import { Product } from '../../../types';

interface ProductModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;

    // Eski sistem bu propsları gönderdiği için hata almamak adına opsiyonel bırakıyoruz.
    onAddToCart?: (product: Product, options: any) => void;
    t?: (key: string) => string;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose }) => {
    if (!isOpen || !product) return null;

    const imageValue = product.image;

    const hasRealImage =
        typeof imageValue === 'string' &&
        (imageValue.startsWith('http') ||
            imageValue.startsWith('/') ||
            imageValue.startsWith('data:'));

    const isSoldOut = product.stock !== undefined && product.stock <= 0;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/55 backdrop-blur-sm px-4 py-6">
            <button
                onClick={onClose}
                className="absolute inset-0 w-full h-full cursor-default"
                aria-label="Ürün detayını kapat"
            />

            <article className="relative w-full max-w-md max-h-[calc(100dvh-48px)] overflow-y-auto bg-[#FDFBF7] rounded-[2rem] shadow-[0_30px_90px_rgba(0,0,0,0.35)] border border-[#432818]/10 animate-in fade-in zoom-in-95 duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-white text-[#432818] flex items-center justify-center shadow-lg active:scale-95"
                    aria-label="Kapat"
                >
                    <X size={22} />
                </button>

                <div className="h-40 sm:h-52 bg-[#F7EFE6] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#FDFBF7] z-10" />

                    {hasRealImage ? (
                        <img
                            src={imageValue}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-28 h-28 rounded-[2rem] bg-white border border-[#432818]/10 flex items-center justify-center text-6xl shadow-inner relative z-20">
                            {imageValue || <Coffee size={52} className="text-[#432818]" />}
                        </div>
                    )}

                    {isSoldOut && (
                        <div className="absolute left-4 top-4 z-20 rounded-full bg-red-600 text-white px-3 py-1 text-xs font-black">
                            Tükendi
                        </div>
                    )}
                </div>

                <div className="p-5 pt-4">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="min-w-0">
                            <p className="text-[#D4AF37] text-[10px] font-black tracking-[0.24em] uppercase mb-2">
                                {product.category}
                            </p>

                            <h2 className="text-2xl font-black text-[#432818] leading-tight">
                                {product.name}
                            </h2>
                        </div>

                        <div className="shrink-0 rounded-[1.2rem] bg-[#432818] text-[#D4AF37] px-4 py-3 shadow-lg">
                            <span className="block text-[10px] font-black tracking-[0.18em] uppercase mb-1">
                                Fiyat
                            </span>

                            <strong className="text-xl font-black whitespace-nowrap">
                                {product.price}₺
                            </strong>
                        </div>
                    </div>

                    <div className="rounded-[1.6rem] bg-white border border-[#432818]/10 p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2 text-[#D4AF37]">
                            <Info size={18} />
                            <span className="text-[11px] font-black tracking-[0.18em] uppercase">
                                Ürün Bilgisi
                            </span>
                        </div>

                        <p className="text-[#432818]/65 leading-relaxed font-medium">
                            {product.description ||
                                'Bu ürün Motto Coffee menüsünde yer alan özel lezzetlerden biridir.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 rounded-[1.6rem] bg-[#432818]/5 border border-[#432818]/8 p-4">
                        <div className="w-10 h-10 rounded-[1rem] bg-white flex items-center justify-center text-[#432818] shrink-0">
                            <Tag size={19} />
                        </div>

                        <div>
                            <p className="text-[11px] font-black text-[#D4AF37] tracking-[0.16em] uppercase">
                                Bilgilendirme
                            </p>

                            <p className="text-sm font-semibold text-[#432818]/60">
                                Sipariş ve sepet özelliği sonraki sürümde aktif edilecek.
                            </p>
                        </div>
                    </div>
                </div>
            </article>
        </div>
    );
};

export default ProductModal;