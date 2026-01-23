import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Zap, Trophy, Sparkles, Clock } from 'lucide-react';
import { doc, updateDoc, increment, onSnapshot, getDoc } from 'firebase/firestore';
import confetti from 'canvas-confetti';
import { db } from '../../../services/firebase';
import { COLLECTIONS, DOCUMENTS } from '../../../utils/firebasePaths';
import { CustomerProfile } from '../views/qrMenu';
import { getTodayString } from '../../../utils/helpers';

interface WheelOfFateProps {
    isOpen: boolean;
    onClose: () => void;
    customerProfile: CustomerProfile | null;
    t: (key: string) => string;
}

const WheelOfFate: React.FC<WheelOfFateProps> = ({ isOpen, onClose, customerProfile, t }) => {
    // --- STATE ---
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [prizeResult, setPrizeResult] = useState<{ label: string; value: number } | null>(null);
    const [hasSpunToday, setHasSpunToday] = useState(false);
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [showConfetti, setShowConfetti] = useState(false);
    const [prizes, setPrizes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showResultModal, setShowResultModal] = useState(false);

    // Independent state for live data to avoid stale props issues
    const [liveCustomerData, setLiveCustomerData] = useState<CustomerProfile | null>(customerProfile);

    const spinAudioRef = useRef<HTMLAudioElement | null>(null);

    // --- AUDIO INIT ---
    useEffect(() => {
        spinAudioRef.current = new Audio('/sounds/spin-wheel.mp3');
        spinAudioRef.current.loop = true;
        spinAudioRef.current.volume = 0.5;
        spinAudioRef.current.preload = 'auto';
        spinAudioRef.current.load();
    }, []);

    // Teselli Mesajı Seçimi
    const consolationMessage = useMemo(() => {
        const messages = [
            "Bugün şansın yokmuş 😔",
            "Üzülme, yarın yine dene!",
            "Kısmet değilmiş...",
            "Bir dahaki sefere bol şans!",
            "Olsun, canın sağ olsun ❤️"
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }, []);

    // --- RESET STATE ON OPEN ---
    useEffect(() => {
        if (isOpen) {
            setPrizeResult(null);
            setShowResultModal(false);
            setShowConfetti(false);
        }
    }, [isOpen]);

    // --- FETCH PRIZES FROM FIREBASE ---
    useEffect(() => {
        if (!isOpen) return;

        const fetchPrizes = async () => {
            try {
                const docRef = doc(db, DOCUMENTS.SETTINGS_WHEEL);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists() && docSnap.data().prizes && docSnap.data().prizes.length > 0) {
                    const loadedPrizes = docSnap.data().prizes.map((p: any, i: number) => ({
                        ...p,
                        id: i,
                        type: (p.value > 0) ? 'win' : 'lose',
                        border: p.border || ((p.value > 0) ? '#D4AF37' : '#8A6E2F'),
                        weight: Number(p.weight) || 10
                    }));
                    setPrizes(loadedPrizes);
                } else {
                    setPrizes([
                        { id: 1, label: '50 VOLT', value: 50, type: 'win', color: '#0f0f0f', border: '#D4AF37', weight: 10 },
                        { id: 2, label: 'BOŞ', value: 0, type: 'lose', color: '#1a1a1a', border: '#8A6E2F', weight: 40 },
                        { id: 3, label: '100 VOLT', value: 100, type: 'win', color: '#0f0f0f', border: '#D4AF37', weight: 5 },
                        { id: 4, label: 'BOŞ', value: 0, type: 'lose', color: '#1a1a1a', border: '#8A6E2F', weight: 40 },
                        { id: 5, label: '25 VOLT', value: 25, type: 'win', color: '#0f0f0f', border: '#D4AF37', weight: 20 },
                    ]);
                }
            } catch (error) {
                console.error("Error fetching wheel prizes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPrizes();
    }, [isOpen]);

    const SEGMENT_ANGLE = prizes.length > 0 ? 360 / prizes.length : 60;

    // --- LIVE DATA LISTENER ---
    useEffect(() => {
        if (!isOpen || !customerProfile?.uid) return;
        setLiveCustomerData(customerProfile);
        const unsubscribe = onSnapshot(doc(db, COLLECTIONS.CUSTOMERS, customerProfile.uid), (docSnap) => {
            if (docSnap.exists()) {
                setLiveCustomerData(docSnap.data() as CustomerProfile);
            }
        });
        return () => unsubscribe();
    }, [isOpen, customerProfile?.uid]);

    // --- DAILY LIMIT CHECK ---
    useEffect(() => {
        if (!isOpen) return;
        const todayStr = getTodayString();
        const profileToCheck = liveCustomerData || customerProfile;
        const isAdmin = (profileToCheck as any)?.role === 'admin' || (profileToCheck as any)?.isAdmin === true;

        if (!isAdmin && profileToCheck?.lastSpinDate === todayStr) {
            setHasSpunToday(true);
        } else {
            setHasSpunToday(false);
        }
    }, [isOpen, liveCustomerData, customerProfile]);

    // --- TIMER LOGIC ---
    useEffect(() => {
        if (!hasSpunToday) return;
        const updateTimer = () => {
            const now = new Date();
            const tomorrow = new Date();
            tomorrow.setHours(24, 0, 0, 0);
            const diff = tomorrow.getTime() - now.getTime();
            if (diff <= 0) {
                setHasSpunToday(false);
                return;
            }
            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / (1000 * 60)) % 60);
            const s = Math.floor((diff / 1000) % 60);
            setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
        };
        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [hasSpunToday]);

    // --- SPIN ACTION ---
    const handleSpin = () => {
        if (isSpinning || hasSpunToday || prizeResult || prizes.length === 0) return;

        if (spinAudioRef.current) {
            spinAudioRef.current.currentTime = 0;
            spinAudioRef.current.play().catch(() => { });
        }

        setIsSpinning(true);
        setShowConfetti(false);

        const totalWeight = prizes.reduce((sum, p) => sum + (p.weight || 0), 0);
        let random = Math.random() * totalWeight;
        let winnerIndex = 0;

        for (let i = 0; i < prizes.length; i++) {
            const weight = prizes[i].weight || 0;
            if (random < weight) {
                winnerIndex = i;
                break;
            }
            random -= weight;
        }

        const winner = prizes[winnerIndex];
        const spinCount = 5;
        const baseRotation = 360 * spinCount;
        const currentAngle = rotation % 360;
        const segmentCenterAngle = winnerIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
        const targetBaseAngle = 360 - segmentCenterAngle;
        let adjustment = targetBaseAngle - currentAngle;
        while (adjustment < 0) adjustment += 360;
        const maxJitter = SEGMENT_ANGLE * 0.4;
        const jitter = (Math.random() * maxJitter) - (maxJitter / 2);
        const finalRotation = rotation + baseRotation + adjustment + jitter;

        setRotation(finalRotation);

        setTimeout(async () => {
            if (spinAudioRef.current) {
                spinAudioRef.current.pause();
                spinAudioRef.current.currentTime = 0;
            }
            setIsSpinning(false);
            setPrizeResult(winner);
            setHasSpunToday(true);
            if (winner.value > 0) setShowConfetti(true);
            setShowResultModal(true);

            if (customerProfile) {
                const todayStr = getTodayString();
                const customerRef = doc(db, COLLECTIONS.CUSTOMERS, customerProfile.uid);
                const updates: any = { lastSpinDate: todayStr };
                if (winner.value > 0) {
                    updates.points = increment(winner.value);
                }
                await updateDoc(customerRef, updates);
            }
        }, 5000);
    };

    // --- SVG HELPERS ---
    const getCoordinatesForPercent = (percent: number) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    const makeSlicePath = (percent: number) => {
        const start = getCoordinatesForPercent(0);
        const end = getCoordinatesForPercent(percent);
        const largeArcFlag = percent > 0.5 ? 1 : 0;
        return `M 0 0 L ${start[0]} ${start[1]} A 1 1 0 ${largeArcFlag} 1 ${end[0]} ${end[1]} L 0 0`;
    };

    if (!isOpen || loading) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
            {showConfetti && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-[particle_1s_ease-out_forwards]"
                            style={{
                                left: '50%',
                                top: '50%',
                                '--x': `${(Math.random() - 0.5) * 600}px`,
                                '--y': `${(Math.random() - 0.5) * 600}px`,
                                opacity: Math.random(),
                                animationDelay: `${Math.random() * 0.5}s`
                            } as any}
                        />
                    ))}
                </div>
            )}

            <div className="relative w-full max-w-md bg-[#0a0a0a] rounded-[3rem] p-1 border border-[#D4AF37]/30 shadow-[0_0_50px_rgba(212,175,55,0.15)] flex flex-col items-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.05),_transparent_70%)] pointer-events-none"></div>
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent"></div>

                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 z-50 p-2 rounded-full bg-white/5 text-white/50 hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
                >
                    <X size={20} />
                </button>

                <div className="relative mt-10 mb-8 text-center z-10">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Zap size={18} className="text-[#D4AF37] animate-pulse" fill="currentColor" />
                        <span className="text-[#D4AF37] text-[10px] font-black tracking-[0.4em] uppercase">{t('motto_luck')}</span>
                        <Zap size={18} className="text-[#D4AF37] animate-pulse" fill="currentColor" />
                    </div>
                    <h2 className="text-4xl font-black text-white font-cinzel tracking-[0.1em] drop-shadow-[0_5px_15px_rgba(212,175,55,0.3)]">
                        {t('wheel_title')}
                    </h2>
                </div>

                <div className="relative w-80 h-80 mb-10 flex items-center justify-center scale-105">
                    <div className="absolute inset-[-15px] rounded-full bg-gradient-to-br from-[#8A6E2F] via-[#FDFBF7] to-[#8A6E2F] shadow-[0_0_50px_rgba(212,175,55,0.4)] p-[5px]">
                        <div className="w-full h-full rounded-full bg-[#111] relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.1)_0%,transparent_70%)] animate-pulse"></div>
                            {[...Array(24)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`absolute w-2 h-2 rounded-full transition-all duration-300 ${isSpinning ? (i % 2 === 0 ? 'bg-[#FFF] shadow-[0_0_12px_#FFF] scale-125' : 'bg-[#D4AF37]/40') : 'bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.5)]'}`}
                                    style={{
                                        top: '50%',
                                        left: '50%',
                                        transform: `rotate(${i * 15}deg) translate(164px) rotate(-${i * 15}deg)`,
                                        animation: isSpinning ? `pulse 0.5s infinite alternate ${i * 0.05}s` : 'none'
                                    }}
                                ></div>
                            ))}
                        </div>
                    </div>

                    <div
                        className="relative w-full h-full rounded-full overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.9)] z-10 border-4 border-[#1a110d]"
                        style={{
                            transform: `rotate(${rotation}deg)`,
                            transition: isSpinning ? 'transform 5s cubic-bezier(0.1, 0, 0.15, 1)' : 'none'
                        }}
                    >
                        <svg viewBox="-1.05 -1.05 2.1 2.1" className="w-full h-full transform -rotate-90">
                            <defs>
                                <radialGradient id="wedge-inner" cx="0.5" cy="0.5" r="0.8">
                                    <stop offset="0%" stopColor="rgba(212,175,55,0.1)" />
                                    <stop offset="100%" stopColor="transparent" />
                                </radialGradient>
                            </defs>
                            {prizes.map((prize, idx) => {
                                const angle = 360 / prizes.length;
                                return (
                                    <g key={prize.id} transform={`rotate(${idx * angle})`}>
                                        <path
                                            d={makeSlicePath(1 / prizes.length)}
                                            fill={prize.type === 'win' ? '#141414' : '#0a0a0a'}
                                            stroke={prize.border}
                                            strokeWidth="0.01"
                                            className="transition-colors duration-500"
                                        />
                                        <path
                                            d={makeSlicePath(1 / prizes.length)}
                                            fill="url(#wedge-inner)"
                                            className="pointer-events-none"
                                        />
                                        <g transform={`rotate(${angle / 2}) translate(0.7, 0)`}>
                                            <text
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                                fill={prize.type === 'win' ? '#FDFBF7' : '#444'}
                                                fontSize="0.09"
                                                fontWeight="900"
                                                fontFamily="Cinzel, serif"
                                                transform="rotate(90)"
                                                style={{ letterSpacing: '0.08em', filter: prize.type === 'win' ? 'drop-shadow(0 0 2px rgba(212,175,55,0.8))' : 'none' }}
                                            >
                                                {prize.label}
                                            </text>
                                        </g>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>

                    <div className="absolute z-20 w-20 h-20 rounded-full bg-gradient-to-br from-[#D4AF37] via-[#FDFBF7] to-[#8A6E2F] flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.8)] border-[6px] border-[#0a0a0a] group hover:scale-110 transition-transform duration-500">
                        <div className="w-full h-full rounded-full border border-[#0a0a0a]/10 flex items-center justify-center bg-[#D4AF37] relative overflow-hidden">
                            <Trophy size={24} className="text-[#0a0a0a] z-10" fill="currentColor" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent translate-x-[-100%] animate-[shimmer_2s_linear_infinite]"></div>
                        </div>
                    </div>

                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-30 filter drop-shadow-[0_8px_10px_rgba(0,0,0,0.8)]">
                        <div className="w-10 h-12 bg-gradient-to-b from-[#FDFBF7] to-[#D4AF37]"
                            style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}></div>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white shadow-lg -mt-1 shadow-white/50 animate-pulse"></div>
                    </div>
                </div>

                <div className="w-full px-8 pb-10 flex flex-col items-center h-28 justify-center">
                    {isSpinning && (
                        <div className="flex flex-col items-center gap-2">
                            <div className="text-[#D4AF37] font-cinzel font-black text-xl animate-pulse tracking-[0.2em] flex items-center gap-3">
                                <Sparkles size={20} className="animate-spin text-white" />
                                BOL ŞANS...
                            </div>
                        </div>
                    )}

                    {hasSpunToday && !isSpinning && !prizeResult && (
                        <div className="flex flex-col items-center animate-in slide-in-from-bottom-4 fade-in duration-700">
                            <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.3em] mb-3 opacity-60 flex items-center gap-2">
                                <Clock size={12} /> {t('new_chance')}
                            </span>
                            <div className="text-3xl font-mono text-white tracking-[0.2em] bg-white/5 py-3 px-10 rounded-[1.5rem] border border-white/10 shadow-inner group overflow-hidden relative">
                                {timeLeft}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            </div>
                        </div>
                    )}

                    {!hasSpunToday && !isSpinning && !prizeResult && (
                        <button
                            onClick={handleSpin}
                            className="group relative px-12 py-5 bg-[#D4AF37] rounded-2xl overflow-hidden shadow-[0_15px_30px_rgba(212,175,55,0.2)] hover:scale-110 active:scale-95 transition-all duration-300 ring-2 ring-white/20"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                            <span className="relative text-[#0a0a0a] font-black font-cinzel tracking-[0.2em] text-base flex items-center gap-3">
                                {t('spin_button')} <Zap size={20} fill="currentColor" className="animate-bounce" />
                            </span>
                        </button>
                    )}
                </div>

                {showResultModal && prizeResult && (
                    <div className="absolute inset-0 z-50 bg-[#0a0a0a]/98 backdrop-blur-2xl flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-500 overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.15),transparent_60%)] animate-pulse"></div>

                        <div className="w-32 h-32 bg-gradient-to-br from-[#D4AF37]/20 to-transparent rounded-[2.5rem] flex items-center justify-center mb-8 border border-[#D4AF37]/30 shadow-2xl relative group">
                            <div className="absolute inset-0 rounded-[2.5rem] border-2 border-[#D4AF37] animate-ping opacity-20 group-hover:opacity-40"></div>
                            {prizeResult.value > 0 ? (
                                <Trophy size={64} className="text-[#D4AF37] drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]" fill="currentColor" />
                            ) : (
                                <span className="text-6xl drop-shadow-lg">😔</span>
                            )}
                        </div>

                        <div className="px-6 space-y-2 text-center mb-10 z-10">
                            <h3 className="text-4xl font-black text-white font-cinzel tracking-tight uppercase leading-none">
                                {prizeResult.value > 0 ? t('congrats') : consolationMessage}
                            </h3>
                            <p className="text-[#D4AF37] text-xs font-black tracking-[0.3em] font-cinzel opacity-60">
                                {prizeResult.value > 0 ? 'ÖDÜLÜNÜZ TANIMLANDI' : 'SİZİ SEVİYORUZ'}
                            </p>
                        </div>

                        <div className="w-full relative group z-10 mb-12">
                            <div className="absolute -inset-4 bg-gradient-to-r from-transparent via-[#D4AF37]/10 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative bg-white/5 border border-white/10 rounded-[2.5rem] p-10 text-center shadow-2xl backdrop-blur-md overflow-hidden ring-1 ring-white/10">
                                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent"></div>
                                <div className="text-4xl font-black text-[#D4AF37] font-cinzel tracking-[0.1em] drop-shadow-[0_0_10px_rgba(212,175,55,0.3)] scale-110">
                                    {prizeResult.label}
                                </div>
                                {prizeResult.value > 0 && (
                                    <div className="mt-4 text-[10px] text-white/40 font-black tracking-[0.4em] uppercase">VOLT PUAN</div>
                                )}
                            </div>
                        </div>

                        <button onClick={() => {
                            if (prizeResult.value > 0) {
                                confetti({
                                    particleCount: 150,
                                    spread: 100,
                                    origin: { y: 0.6 },
                                    colors: ['#D4AF37', '#FDFBF7', '#8A6E2F'],
                                    zIndex: 9999
                                });
                            }
                            onClose();
                        }} className="w-full group relative bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-[#0a0a0a] py-5 rounded-2xl font-black font-cinzel text-lg shadow-[0_15px_40px_rgba(212,175,55,0.3)] hover:scale-[1.05] active:scale-[0.95] transition-all overflow-hidden">
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                            <span className="relative flex items-center justify-center gap-3 tracking-widest">
                                {prizeResult.value > 0 ? 'ÖDÜLÜ TOPLA' : 'YARIN GÖRÜŞÜRÜZ'} <Zap size={20} fill="currentColor" />
                            </span>
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes particle {
                    0% { transform: translate(0, 0) scale(1); opacity: 1; }
                    100% { transform: translate(var(--x), var(--y)) scale(0); opacity: 0; }
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 0.8; }
                    100% { transform: scale(1.1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default WheelOfFate;
