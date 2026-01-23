import React from 'react';
import { X, Heart, Loader2 } from 'lucide-react';
import { Product } from '../../../types';

interface FavoritesModalProps {
    isOpen: boolean;
    onClose: () => void;
    favoriteProducts: Product[];
    isLoadingFavorites: boolean;
    onRemoveFavorite: (id: string) => void;
}

const FavoritesModal: React.FC<FavoritesModalProps> = ({ isOpen, onClose, favoriteProducts, isLoadingFavorites, onRemoveFavorite }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
            <div className="bg-[#FDFBF7] w-full max-w-md rounded-[2rem] relative shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh] overflow-hidden">
                <div className="p-6 border-b border-[#432818]/5 flex justify-between items-center bg-white">
                    <h2 className="text-xl font-black text-[#432818] tracking-tight">Favorilerim</h2>
                    <button onClick={onClose} className="p-2 hover:bg-[#FDFBF7] rounded-full text-[#432818]/60 transition-all"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
                    {isLoadingFavorites ? (
                        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#432818]/40" size={32} /></div>
                    ) : favoriteProducts.length === 0 ? (
                        <div className="text-center py-12">
                            <Heart size={40} className="mx-auto text-[#432818]/10 mb-3" />
                            <p className="text-[#432818]/40 font-bold text-sm">Favori listeniz boş.</p>
                        </div>
                    ) : (
                        favoriteProducts.map((product) => (
                            <div key={product.id} className="bg-white p-3 rounded-2xl border border-[#432818]/5 relative shadow-sm hover:shadow-md transition-all">
                                <div className="flex gap-4">
                                    <div className="w-20 h-20 bg-[#FDFBF7] rounded-xl flex items-center justify-center text-3xl">
                                        {product.image || '✨'}
                                    </div>
                                    <div className="flex-1 py-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-bold text-[#432818] text-sm uppercase leading-tight mb-1">{product.name}</h3>
                                            <p className="text-[10px] text-[#432818]/40 font-medium line-clamp-2">{product.description}</p>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="font-black text-[#432818]">{product.price} ₺</span>
                                            <button
                                                onClick={() => onRemoveFavorite(product.id)}
                                                className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Heart size={16} fill="currentColor" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default FavoritesModal;