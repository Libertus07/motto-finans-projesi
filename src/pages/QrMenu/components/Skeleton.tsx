import React from 'react';

export const CategorySkeleton = () => (
    <div className="flex flex-col items-center gap-2 min-w-[72px] animate-pulse">
        <div className="w-16 h-16 bg-[#FDFBF7] border-2 border-[#432818]/5 rounded-2xl flex items-center justify-center">
            <div className="w-8 h-8 bg-[#432818]/10 rounded-full"></div>
        </div>
        <div className="w-10 h-3 bg-[#432818]/10 rounded-full"></div>
    </div>
);

export const ProductCardSkeleton = () => (
    <div className="bg-white p-3 rounded-2xl shadow-sm border border-[#432818]/5 flex flex-col h-full animate-pulse">
        <div className="aspect-square bg-[#FDFBF7] rounded-xl mb-3 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#432818]/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
        </div>
        <div className="h-4 bg-[#432818]/10 rounded w-3/4 mb-2"></div>
        <div className="mt-auto flex justify-between items-center">
            <div className="h-4 bg-[#432818]/10 rounded w-1/3"></div>
            <div className="w-7 h-7 bg-[#432818]/10 rounded-lg"></div>
        </div>
    </div>
);

export const ProductListSkeleton = () => (
    <div className="bg-white p-3 rounded-2xl border border-[#432818]/5 flex gap-4 animate-pulse">
        <div className="w-24 h-24 bg-[#FDFBF7] rounded-xl shrink-0"></div>
        <div className="flex-1 py-1 flex flex-col justify-between">
            <div>
                <div className="h-4 bg-[#432818]/10 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-[#432818]/10 rounded w-3/4"></div>
            </div>
            <div className="flex justify-between items-end">
                <div className="h-5 bg-[#432818]/10 rounded w-1/4"></div>
                <div className="w-8 h-8 bg-[#432818]/10 rounded-lg"></div>
            </div>
        </div>
    </div>
);
