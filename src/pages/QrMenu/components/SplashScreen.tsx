import React, { useState, useEffect } from 'react';
import { ChefHat, Zap } from 'lucide-react';

const SplashScreen = () => {
    const [show, setShow] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShow(false), 2500);
        return () => clearTimeout(timer);
    }, []);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-[#FDFBF7] flex flex-col items-center justify-center animate-out fade-out duration-1000 delay-[2000ms] fill-mode-forwards pointer-events-none">
            <div className="relative">
                <div className="w-32 h-32 relative text-[#432818]">
                    <ChefHat size={128} strokeWidth={1.5} />
                    <Zap size={64} className="absolute top-0 right-0 text-motto-gold animate-[ping_1s_ease-in-out_infinite] opacity-0" style={{ animationDelay: '1s', animationIterationCount: 1, animationFillMode: 'forwards' }} strokeWidth={0} fill="currentColor" />
                </div>
            </div>
            <h1 className="mt-6 text-3xl font-cinzel font-black tracking-[0.2em] text-[#432818] animate-in fade-in duration-700 slide-in-from-bottom-4">MOTTO</h1>
            <p className="text-[#BB9457] text-xs font-cinzel font-bold tracking-[0.5em] mt-2 border-t border-[#BB9457] pt-2">ROASTERY</p>
        </div>
    );
};

export default SplashScreen;
