import React from 'react';

const SkeletonLoader = () => {
    return (
        <div className="min-h-screen bg-[#FDFBF7] pb-32 animate-pulse">
            {/* Header Skeleton */}
            <div className="sticky top-0 bg-[#FDFBF7]/95 backdrop-blur-md z-30 p-4 border-b border-[#432818]/5">
                <div className="flex justify-between items-center mb-4">
                    <div className="h-8 w-32 bg-[#432818]/10 rounded-lg"></div>
                    <div className="flex gap-3">
                        <div className="w-10 h-10 bg-[#432818]/10 rounded-2xl"></div>
                        <div className="w-10 h-10 bg-[#432818]/10 rounded-2xl"></div>
                    </div>
                </div>
                {/* Categories Skeleton */}
                <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-6 w-20 bg-[#432818]/5 rounded-full shrink-0"></div>
                    ))}
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* Widgets Skeleton */}
                <div className="flex gap-4 overflow-hidden">
                    <div className="w-24 h-32 bg-[#432818]/10 rounded-2xl shrink-0"></div>
                    <div className="w-24 h-32 bg-[#432818]/10 rounded-2xl shrink-0"></div>
                    <div className="w-24 h-32 bg-[#432818]/10 rounded-2xl shrink-0"></div>
                </div>

                {/* Banner Skeleton */}
                <div className="h-32 w-full bg-[#432818]/10 rounded-[2rem]"></div>

                {/* Grid Skeleton */}
                <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-48 bg-[#432818]/5 rounded-[2rem] p-4 flex flex-col justify-end">
                            <div className="h-4 w-2/3 bg-[#432818]/10 rounded mb-2"></div>
                            <div className="h-6 w-1/3 bg-[#432818]/10 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SkeletonLoader;
