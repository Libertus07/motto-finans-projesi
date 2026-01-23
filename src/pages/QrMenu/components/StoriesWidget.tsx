import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const StoriesWidget = () => {
    const [activeStory, setActiveStory] = useState<number | null>(null);

    const stories = [
        { id: 1, title: 'Barista', image: '☕', color: 'from-orange-400 to-red-500' },
        { id: 2, title: 'Yeni Lezzet', image: '🍰', color: 'from-pink-400 to-purple-500' },
        { id: 3, title: 'Mutlu Saat', image: '⏰', color: 'from-blue-400 to-cyan-500' },
        { id: 4, title: 'Motto Club', image: '👑', color: 'from-yellow-400 to-orange-500' },
    ];

    return (
        <div className="flex gap-4 overflow-x-auto px-4 py-4 scrollbar-hide">
            {stories.map((story, index) => (
                <div key={story.id} className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => setActiveStory(index)}>
                    <div className={`w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr ${story.color}`}>
                        <div className="w-full h-full bg-[#FDFBF7] rounded-full p-0.5">
                            <div className="w-full h-full bg-[#432818]/5 rounded-full flex items-center justify-center text-2xl">
                                {story.image}
                            </div>
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#432818] font-cinzel">{story.title}</span>
                </div>
            ))}
            {/* Story Viewer Modal */}
            {activeStory !== null && (
                <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center" onClick={() => setActiveStory(null)}>
                    <div className="relative w-full h-full max-w-md bg-[#1a110d] flex flex-col">
                        {/* Progress Bar */}
                        <div className="absolute top-2 left-2 right-2 flex gap-1 z-20">
                            {stories.map((s, i) => (
                                <div key={s.id} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-white transition-all duration-[5000ms] ease-linear ${i === activeStory ? 'w-full' : i < activeStory ? 'w-full' : 'w-0'}`}
                                        onTransitionEnd={() => { if (i === activeStory) setActiveStory(prev => (prev !== null && prev < stories.length - 1) ? prev + 1 : null); }}
                                    />
                                </div>
                            ))}
                        </div>

                        <button className="absolute top-6 right-4 text-white z-20"><X /></button>

                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                            <div className="text-8xl mb-8 animate-bounce">{stories[activeStory].image}</div>
                            <h2 className="text-white font-black font-cinzel text-3xl mb-4">{stories[activeStory].title}</h2>
                            <p className="text-white/60 font-cinzel">Motto Golden Age dünyasında keşfedilecek çok şey var.</p>
                        </div>

                        <div className="p-8 pb-12">
                            <button className="w-full bg-[#D4AF37] text-[#432818] py-4 rounded-xl font-bold font-cinzel">Detayları Gör</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoriesWidget;
