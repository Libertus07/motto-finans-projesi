import React, { useState } from 'react';
import { ChevronRight, Zap, Crown, Lock } from 'lucide-react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { COLLECTIONS } from '../../../utils/firebasePaths';
import { CustomerProfile } from '../views/qrMenu';
import VoltHistoryModal from './VoltHistoryModal';

interface VoltWidgetProps {
    customerProfile: CustomerProfile | null;
    isMember: boolean;
    onOpenAuth: () => void;
}

const VoltWidget: React.FC<VoltWidgetProps> = ({ customerProfile, isMember, onOpenAuth }) => {
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [historyFilter, setHistoryFilter] = useState<'all' | 'earned' | 'spent'>('all');

    const handleShowHistory = async () => {
        if (!customerProfile?.phone) return;
        setShowHistoryModal(true);
        setHistoryFilter('all');
        setLoadingHistory(true);
        try {
            const transactionsRef = collection(db, COLLECTIONS.TRANSACTIONS);
            const q = query(
                transactionsRef,
                where('customerPhone', '==', customerProfile.phone),
                orderBy('timestamp', 'desc'),
                limit(20)
            );
            const snapshot = await getDocs(q);
            setHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("History fetch error:", error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const volts = customerProfile?.points || 0;

    // Tier Logic (Örnek Seviyeler)
    const tiers = [
        { name: 'Motto Üye', min: 0 },
        { name: 'Sadık Üye', min: 150 },
        { name: 'VIP Üye', min: 500 }
    ];

    let currentTierIndex = 0;
    for (let i = tiers.length - 1; i >= 0; i--) {
        if (volts >= tiers[i].min) {
            currentTierIndex = i;
            break;
        }
    }

    const currentTier = tiers[currentTierIndex];
    const nextTier = tiers[currentTierIndex + 1];

    const progress = nextTier
        ? Math.min(((volts - currentTier.min) / (nextTier.min - currentTier.min)) * 100, 100)
        : 100;

    return (
        <>
            <div
                className="relative rounded-[2rem] overflow-hidden transition-all duration-300 group shadow-[0_10px_30px_rgba(67,40,24,0.15)] cursor-pointer hover:scale-[1.01] h-full"
                onClick={() => isMember ? handleShowHistory() : onOpenAuth()}
            >
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#432818] to-[#2c1a0f]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-2xl -ml-10 -mb-10"></div>
                    {/* Pattern */}
                    <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#D4AF37 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                </div>

                {/* Content */}
                <div className="relative z-10 p-5 flex flex-col h-full justify-between">
                    {/* Header */}
                    <div className="flex flex-col gap-3 mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                                <Crown size={12} className="text-[#D4AF37]" />
                            </div>
                            <h3 className="font-black text-sm text-[#FDFBF7] font-cinzel tracking-wider truncate">
                                {isMember ? currentTier.name.toUpperCase() : 'MOTTO CLUB'}
                            </h3>
                        </div>

                        {isMember && (
                            <div>
                                <div className="flex items-center gap-1 text-[#D4AF37]">
                                    <Zap size={16} fill="currentColor" />
                                    <span className="text-2xl font-black font-cinzel leading-none">{volts}</span>
                                </div>
                                <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest block">Volt Puan</span>
                            </div>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="relative pt-2">
                        <div className="flex justify-between text-[10px] font-bold text-[#D4AF37]/60 mb-2 font-cinzel">
                            <span>{currentTier.name}</span>
                            {nextTier && <span>{nextTier.name} ({nextTier.min}V)</span>}
                        </div>

                        <div className="h-4 bg-black/20 rounded-full overflow-hidden p-0.5 border border-white/5 backdrop-blur-sm">
                            <div
                                className="h-full bg-gradient-to-r from-[#D4AF37] to-[#FDFBF7] rounded-full shadow-[0_0_15px_rgba(212,175,55,0.4)] relative transition-all duration-1000 ease-out"
                                style={{ width: `${isMember ? progress : 0}%` }}
                            >
                                <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                            </div>
                        </div>

                        {isMember && nextTier && (
                            <p className="text-right text-[9px] text-white/30 mt-2 font-medium">
                                Sonraki seviyeye <span className="text-[#D4AF37]">{nextTier.min - volts} Volt</span> kaldı
                            </p>
                        )}
                    </div>
                </div>

                {/* Guest Overlay */}
                {!isMember && (
                    <div className="absolute inset-0 z-20 bg-[#1a110d]/60 backdrop-blur-[3px] flex flex-col items-center justify-center text-center p-4 animate-in fade-in">
                        <div className="w-10 h-10 bg-[#D4AF37] rounded-xl rotate-3 flex items-center justify-center shadow-lg mb-2 border border-[#FDFBF7]/20">
                            <Lock size={20} className="text-[#1a110d]" />
                        </div>
                        <h4 className="text-white font-bold font-cinzel text-sm mb-1 uppercase tracking-tighter">Motto Club</h4>
                        <p className="text-white/80 text-[10px] mb-4 leading-tight">
                            Üye ol, hediyeler kazan!
                        </p>
                        <button className="bg-[#D4AF37] text-[#1a110d] px-4 py-2 rounded-lg font-bold font-cinzel text-[10px] hover:bg-white transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] active:scale-95 flex items-center gap-1 uppercase">
                            KATIL <ChevronRight size={12} />
                        </button>
                    </div>
                )}
            </div>

            <VoltHistoryModal
                isOpen={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
                history={history}
                loadingHistory={loadingHistory}
                historyFilter={historyFilter}
                setHistoryFilter={setHistoryFilter}
            />
        </>
    );
};

export default VoltWidget;
