import React from 'react';
import { X, Coffee, Trophy, Calendar, Clock } from 'lucide-react';
import { CustomerProfile } from '../views/qrMenu';

interface StampCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    totalStamps: number;
    currentStamps: number;
    target: number;
    earnedRewards: number;
    customerProfile: CustomerProfile | null;
}

const StampCardModal: React.FC<StampCardModalProps> = ({
    isOpen, onClose, totalStamps, currentStamps, target, earnedRewards, customerProfile
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#FDFBF7] w-full max-w-sm rounded-[2.5rem] overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">

                {/* Modal Header */}
                <div className="bg-[#1a110d] p-8 pb-12 relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <button
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-colors z-20"
                    >
                        <X size={18} />
                    </button>

                    <div className="relative z-10 text-center">
                        <div className="w-16 h-16 bg-[#D4AF37] rounded-2xl rotate-3 mx-auto flex items-center justify-center shadow-lg shadow-orange-900/20 mb-4 border-2 border-[#FDFBF7]/10">
                            <Coffee size={32} className="text-[#1a110d]" />
                        </div>
                        <h2 className="text-2xl font-black text-[#FDFBF7] font-cinzel tracking-wide">KAHVE PASAPORTU</h2>
                        <p className="text-[#D4AF37] text-xs font-bold tracking-widest uppercase mt-1">Motto Club Üyesi</p>
                    </div>
                </div>

                {/* Stats Container - Overlapping Header */}
                <div className="px-6 -mt-8 relative z-10 pb-6 overflow-y-auto custom-scrollbar">
                    <div className="bg-white rounded-3xl p-6 shadow-xl border border-[#432818]/5 mb-6">
                        <div className="flex justify-between items-center mb-6">
                            <div className="text-center flex-1 border-r border-[#432818]/5">
                                <div className="text-3xl font-black text-[#432818] font-cinzel">{totalStamps}</div>
                                <div className="text-[9px] font-bold text-[#432818]/40 uppercase tracking-wider mt-1">Toplam Kahve</div>
                            </div>
                            <div className="text-center flex-1">
                                <div className="text-3xl font-black text-[#D4AF37] font-cinzel">{earnedRewards}</div>
                                <div className="text-[9px] font-bold text-[#432818]/40 uppercase tracking-wider mt-1">Kazanılan İkram</div>
                            </div>
                        </div>

                        <div className="bg-[#FDFBF7] rounded-2xl p-4 border border-[#432818]/5">
                            <div className="flex justify-between text-xs font-bold text-[#432818] mb-2">
                                <span>Sonraki İkram</span>
                                <span>{currentStamps} / {target}</span>
                            </div>
                            <div className="h-3 bg-[#432818]/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#D4AF37] rounded-full transition-all duration-1000"
                                    style={{ width: `${(currentStamps / target) * 100}%` }}
                                ></div>
                            </div>
                            <p className="text-[10px] text-[#432818]/50 mt-2 font-medium text-center">
                                {target - currentStamps} kahve sonra 1 kahve bizden!
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-[#432818]/40 uppercase tracking-widest font-cinzel ml-1">Kazanımlar</h3>
                        <div className="bg-white p-4 rounded-2xl border border-[#432818]/5 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]"><Trophy size={20} /></div>
                            <div>
                                <h4 className="font-bold text-[#432818] text-sm">Sadakat Rozeti</h4>
                                <p className="text-[10px] text-[#432818]/60">Motto Club ailesinin değerli bir parçasısınız.</p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-[#432818]/5 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#432818]/5 flex items-center justify-center text-[#432818]"><Calendar size={20} /></div>
                            <div>
                                <h4 className="font-bold text-[#432818] text-sm">Üyelik Tarihi</h4>
                                <p className="text-[10px] text-[#432818]/60">
                                    {customerProfile?.createdAt ? new Date(customerProfile.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Bilinmiyor'}
                                </p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-[#432818]/5 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#432818]/5 flex items-center justify-center text-[#432818]"><Clock size={20} /></div>
                            <div>
                                <h4 className="font-bold text-[#432818] text-sm">Son Kahve Keyfi</h4>
                                <p className="text-[10px] text-[#432818]/60">
                                    {customerProfile?.lastCoffeeDate ? new Date(customerProfile.lastCoffeeDate).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Henüz kahve içilmedi'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StampCardModal;