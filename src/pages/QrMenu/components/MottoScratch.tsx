import React, { useRef, useEffect, useState } from 'react';
import { X, Trophy, Sparkles, Gift, Zap, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface MottoScratchProps {
    isOpen: boolean;
    onClose: () => void;
}

const REWARDS = [
    { text: "50 VOLT", icon: <Zap size={64} className="text-[#D4AF37] drop-shadow-[0_0_15px_rgba(212,175,55,0.8)]" />, color: "#D4AF37" },
    { text: "100 VOLT", icon: <Zap size={64} className="text-[#D4AF37] drop-shadow-[0_0_15px_rgba(212,175,55,0.8)]" />, color: "#D4AF37" },
    { text: "%10 İNDİRİM", icon: <Gift size={64} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]" />, color: "#10B981" },
    { text: "BEDAVA KAHVE", icon: <Trophy size={64} className="text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]" />, color: "#F59E0B" },
    { text: "SÜRPRİZ ÖDÜL", icon: <Crown size={64} className="text-purple-400 drop-shadow-[0_0_15px_rgba(192,132,252,0.8)]" />, color: "#A855F7" },
];

const MottoScratch: React.FC<MottoScratchProps> = ({ isOpen, onClose }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const scratchCheckCounterRef = useRef(0);
    const [isRevealed, setIsRevealed] = useState(false);
    const [reward, setReward] = useState(REWARDS[0]);
    const [scratchPercent, setScratchPercent] = useState(0);

    const initCanvas = () => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        ctx.scale(dpr, dpr);

        // --- Premium Gold Foil Texture ---

        // Base Gradient (Golden Hour)
        const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
        gradient.addColorStop(0.0, '#CFB53B');
        gradient.addColorStop(0.2, '#FAFAD2'); // Light Gold
        gradient.addColorStop(0.4, '#C5A028');
        gradient.addColorStop(0.6, '#E6C200'); // Vivid Gold
        gradient.addColorStop(0.8, '#B8860B'); // Dark Goldenrod
        gradient.addColorStop(1.0, '#CFB53B');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, rect.width, rect.height);

        // Noise Texture for Realism
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        for (let i = 0; i < pixels.length; i += 4) {
            const noise = (Math.random() - 0.5) * 15;
            pixels[i] = Math.min(255, Math.max(0, pixels[i] + noise));
            pixels[i + 1] = Math.min(255, Math.max(0, pixels[i + 1] + noise));
            pixels[i + 2] = Math.min(255, Math.max(0, pixels[i + 2] + noise));
        }
        ctx.putImageData(imageData, 0, 0);

        // Micro-scratches / Brushed Metal Effect
        ctx.globalCompositeOperation = 'overlay';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 200; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * rect.width, Math.random() * rect.height);
            ctx.lineTo(Math.random() * rect.width, Math.random() * rect.height);
            ctx.stroke();
        }
        ctx.globalCompositeOperation = 'source-over';

        // --- Branding ---

        // "Sil Süpür" Text with Emboss Effect
        ctx.save();
        ctx.translate(rect.width / 2, rect.height / 2);

        // Shadow for depth
        ctx.shadowColor = 'rgba(67, 40, 24, 0.4)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        ctx.font = '900 32px "Cinzel", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(67, 40, 24, 0.7)'; // Dark Brownish Gold
        ctx.fillText('SİL SÜPÜR', 0, 0);

        // Subtle Highlight
        ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = -1;
        ctx.shadowOffsetY = -1;
        ctx.fillText('SİL SÜPÜR', 0, 0);

        ctx.restore();

        // Decorative Border
        ctx.strokeStyle = 'rgba(67, 40, 24, 0.2)';
        ctx.lineWidth = 4;
        ctx.strokeRect(10, 10, rect.width - 20, rect.height - 20);

        // Corner Ornaments
        const cornerSize = 25;
        ctx.fillStyle = 'rgba(67, 40, 24, 0.3)';
        // TL
        ctx.fillRect(10, 10, cornerSize, 4);
        ctx.fillRect(10, 10, 4, cornerSize);
        // TR
        ctx.fillRect(rect.width - 10 - cornerSize, 10, cornerSize, 4);
        ctx.fillRect(rect.width - 14, 10, 4, cornerSize);
        // BL
        ctx.fillRect(10, rect.height - 14, cornerSize, 4);
        ctx.fillRect(10, rect.height - 10 - cornerSize, 4, cornerSize);
        // BR
        ctx.fillRect(rect.width - 10 - cornerSize, rect.height - 14, cornerSize, 4);
        ctx.fillRect(rect.width - 14, rect.height - 10 - cornerSize, 4, cornerSize);
    };

    useEffect(() => {
        if (isOpen) {
            setIsRevealed(false);
            setScratchPercent(0);
            scratchCheckCounterRef.current = 0;
            setReward(REWARDS[Math.floor(Math.random() * REWARDS.length)]);
            setTimeout(initCanvas, 150);
        }
    }, [isOpen]);

    const handleScratch = (e: React.MouseEvent | React.TouchEvent) => {
        if (isRevealed) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        // --- Dynamic Particles Idea (Optional: can add canvas particles here) ---

        // Scratch Logic - "Magic Eraser"
        ctx.globalCompositeOperation = 'destination-out';

        const scratchRadius = 30;

        // Soft Brush
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, scratchRadius);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
        gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.5)'); // Soft edges
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, scratchRadius, 0, Math.PI * 2);
        ctx.fill();

        // Check progress
        scratchCheckCounterRef.current++;
        if (scratchCheckCounterRef.current % 4 === 0) {
            checkScratchPercent(ctx, rect.width, rect.height);
        }

        // Haptic Feedback for Mobile
        if (navigator.vibrate && Math.random() > 0.7) {
            navigator.vibrate(5);
        }
    };

    const checkScratchPercent = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        // Only check center area for better UX (ignoring corners)
        const margin = 20;
        const checkWidth = width - margin * 2;
        const checkHeight = height - margin * 2;

        // Safety check for zero-size
        if (checkWidth <= 0 || checkHeight <= 0) return;

        const imageData = ctx.getImageData(margin, margin, checkWidth, checkHeight);
        const pixels = imageData.data;
        let transparentPixels = 0;

        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] < 50) transparentPixels++;
        }

        const percent = (transparentPixels / (pixels.length / 4)) * 100;
        setScratchPercent(percent);

        if (percent > 45) { // 45% cleared is enough
            handleComplete();
        }
    };

    const handleComplete = () => {
        if (isRevealed) return;
        setIsRevealed(true);

        const canvas = canvasRef.current;
        if (canvas) {
            canvas.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            canvas.style.opacity = '0';
            canvas.style.transform = 'scale(1.1)'; // Slight pop outward
        }

        const end = Date.now() + 1500;
        const colors = ['#D4AF37', '#FFF', '#FFD700'];

        (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                >
                    {/* Dark Overlay with Blur */}
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 50 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="relative w-full max-w-[360px] aspect-[3/4] z-10"
                    >
                        {/* Golden Glow Behind */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#D4AF37]/20 blur-[100px] rounded-full pointer-events-none" />

                        {/* --- Main Interactive Card --- */}
                        <div className="w-full h-full bg-[#0a0a0a] rounded-[2rem] border border-[#D4AF37]/30 shadow-[0_0_50px_rgba(212,175,55,0.15)] overflow-hidden relative flex flex-col items-center justify-between py-10 px-6">

                            {/* Texture Overlay */}
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none" />

                            {/* Header */}
                            <div className="text-center relative z-10 w-full">
                                <div className="flex items-center justify-center gap-2 text-[#D4AF37]/60 mb-2">
                                    <Sparkles size={14} className="animate-pulse" />
                                    <span className="text-[10px] font-black tracking-[0.4em] uppercase font-cinzel">Motto Şans</span>
                                    <Sparkles size={14} className="animate-pulse" />
                                </div>
                                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#D4AF37] via-[#F5E6AD] to-[#B8860B] font-cinzel tracking-widest leading-none drop-shadow-sm filter">
                                    SİL SÜPÜR
                                </h2>
                                {/* Symmetrical Decoration Line */}
                                <div className="flex items-center justify-center gap-2 mt-3 opacity-50">
                                    <div className="w-8 h-[1px] bg-gradient-to-l from-[#D4AF37] to-transparent" />
                                    <div className="w-1 h-1 rounded-full bg-[#D4AF37]" />
                                    <div className="w-8 h-[1px] bg-gradient-to-r from-[#D4AF37] to-transparent" />
                                </div>
                            </div>

                            {/* --- Reward Area (Behind Scratch) --- */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] flex items-center justify-center">
                                {/* Revealed Content */}
                                <div className="flex flex-col items-center justify-center text-center gap-3">
                                    <motion.div
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={isRevealed ? { scale: 1, opacity: 1 } : {}}
                                        transition={{ type: "spring", delay: 0.1 }}
                                        className="relative"
                                    >
                                        <div className="absolute inset-0 blur-2xl opacity-40 animate-pulse" style={{ color: reward.color }}>{reward.icon}</div>
                                        {reward.icon}
                                    </motion.div>

                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={isRevealed ? { y: 0, opacity: 1 } : {}}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <h3 className="text-2xl font-black text-white font-cinzel leading-tight tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                            {reward.text}
                                        </h3>
                                    </motion.div>

                                    {/* Win Badge */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={isRevealed ? { opacity: 1, scale: 1 } : {}}
                                        transition={{ delay: 0.4, type: "spring" }}
                                        className="mt-2 text-[#D4AF37] text-[10px] font-black border border-[#D4AF37] px-3 py-1 rounded-full tracking-[0.2em] uppercase bg-[#D4AF37]/10"
                                    >
                                        Kazandın
                                    </motion.div>
                                </div>
                            </div>

                            {/* --- Scratch Surface (Canvas) --- */}
                            <div
                                ref={containerRef}
                                className={`relative z-20 w-[240px] h-[240px] rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] ring-1 ring-[#D4AF37]/20 transition-all duration-700 ${isRevealed ? 'pointer-events-none' : 'cursor-grab active:cursor-grabbing'}`}
                            >
                                <canvas
                                    ref={canvasRef}
                                    onMouseDown={handleScratch}
                                    onMouseMove={(e) => {
                                        if (e.buttons === 1) handleScratch(e);
                                    }}
                                    onTouchMove={handleScratch}
                                    onTouchStart={handleScratch}
                                    className="w-full h-full touch-none"
                                />

                                {/* Hand Hint Animation */}
                                {!isRevealed && scratchPercent === 0 && (
                                    <motion.div
                                        className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-60"
                                        animate={{ opacity: [0, 1, 0], scale: [0.9, 1.1, 0.9], rotate: [-10, 10, -10] }}
                                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                                    >
                                        <span className="text-4xl filter drop-shadow-lg">👆</span>
                                    </motion.div>
                                )}
                            </div>

                            {/* Footer / Close */}
                            <div className="w-full relative z-30 min-h-[60px] flex items-end justify-center">
                                <AnimatePresence mode="wait">
                                    {isRevealed ? (
                                        <motion.button
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: 20, opacity: 0 }}
                                            onClick={onClose}
                                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F5E6AD] to-[#D4AF37] text-black font-black font-cinzel tracking-widest text-[12px] uppercase hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] active:scale-95 transition-all"
                                        >
                                            Ödülü Al
                                        </motion.button>
                                    ) : (
                                        <motion.button
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            onClick={onClose}
                                            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs font-bold tracking-widest uppercase group"
                                        >
                                            <X size={14} className="group-hover:rotate-90 transition-transform" />
                                            Kapat
                                        </motion.button>
                                    )}
                                </AnimatePresence>
                            </div>

                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MottoScratch;
