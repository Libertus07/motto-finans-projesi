import React, { useState } from 'react';
import { X, CheckCircle2, Target, Trophy, Clock, Zap } from 'lucide-react';
import { Challenge } from '../../../types';

interface MissionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    challenges: Challenge[];
    onClaim: (challengeId: string) => void;
}

const MissionsModal: React.FC<MissionsModalProps> = ({ isOpen, onClose, challenges, onClaim }) => {
    const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

    if (!isOpen) return null;

    const filteredChallenges = challenges.filter(c =>
        activeTab === 'active'
            ? c.status === 'active'
            : c.status !== 'active'
    );

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#432818]/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md bg-[#FDFBF7] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-50 duration-300">
                {/* Header */}
                <div className="bg-[#432818] p-6 pb-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-white/10 text-white p-2 rounded-full hover:bg-white/20 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex flex-col items-center text-center relative z-10 pt-4">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-3 backdrop-blur-md ring-4 ring-white/5 shadow-inner">
                            <Target size={32} className="text-[#D4AF37]" />
                        </div>
                        <h2 className="text-2xl font-black text-[#FDFBF7] font-cinzel tracking-tight leading-none mb-1">Motto Görevleri</h2>
                        <p className="text-[#FDFBF7]/60 text-xs font-bold uppercase tracking-widest">Tamamla ve Kazan</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-white border-b border-[#432818]/5 px-4 pt-4 pb-2 gap-4 -mt-4 relative z-20 rounded-t-[2rem]">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === 'active'
                                ? 'bg-[#432818] text-[#D4AF37] shadow-lg shadow-[#432818]/20'
                                : 'bg-[#432818]/5 text-[#432818]/40 hover:bg-[#432818]/10'
                            }`}
                    >
                        Aktif Görevler
                    </button>
                    <button
                        onClick={() => setActiveTab('completed')}
                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === 'completed'
                                ? 'bg-[#432818] text-[#D4AF37] shadow-lg shadow-[#432818]/20'
                                : 'bg-[#432818]/5 text-[#432818]/40 hover:bg-[#432818]/10'
                            }`}
                    >
                        Tamamlananlar
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4 custom-scrollbar">
                    {filteredChallenges.length > 0 ? (
                        filteredChallenges.map(challenge => (
                            <div key={challenge.id} className="bg-white rounded-3xl p-5 border border-[#432818]/5 shadow-sm relative overflow-hidden group">
                                <div className="flex items-start gap-4 relative z-10">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0 ${challenge.status === 'claimed'
                                            ? 'bg-emerald-100 text-emerald-600'
                                            : 'bg-[#F9F7F5] text-[#432818]'
                                        }`}>
                                        {challenge.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-black text-[#432818] font-cinzel text-lg leading-tight truncate pr-2">{challenge.title}</h3>
                                            <div className="flex items-center gap-1.5 bg-[#432818]/5 px-2 py-1 rounded-lg shrink-0">
                                                <Zap size={10} className="text-[#D4AF37]" fill="currentColor" />
                                                <span className="text-[10px] font-black text-[#432818]">{challenge.reward} V</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-[#432818]/60 font-medium leading-relaxed mb-3 line-clamp-2">{challenge.description}</p>

                                        {/* Progress Bar or Action */}
                                        {challenge.status === 'active' ? (
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between text-[10px] font-bold text-[#432818]/40 tracking-wider">
                                                    <span>İLERLEME</span>
                                                    <span>{challenge.progress} / {challenge.target}</span>
                                                </div>
                                                <div className="h-2 bg-[#432818]/5 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-[#D4AF37] rounded-full transition-all duration-1000"
                                                        style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                                                    />
                                                </div>
                                                {challenge.progress >= challenge.target && (
                                                    <button
                                                        onClick={() => onClaim(challenge.id)}
                                                        className="w-full mt-3 bg-[#432818] text-[#D4AF37] py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2"
                                                    >
                                                        <Trophy size={14} /> Ödülü Al
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="mt-2 flex items-center gap-2 text-emerald-600 text-xs font-black uppercase tracking-wider bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100/50">
                                                <CheckCircle2 size={14} />
                                                <span>Tamamlandı</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 opacity-40">
                            <div className="w-16 h-16 bg-[#432818]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Clock size={32} className="text-[#432818]" />
                            </div>
                            <p className="text-sm font-bold text-[#432818]">Görev bulunamadı.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MissionsModal;
