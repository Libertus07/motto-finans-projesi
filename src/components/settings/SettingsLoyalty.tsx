import React from 'react';
import { Award, Gift, Cake, Info } from 'lucide-react';

interface LoyaltySettings {
    welcomeBonus?: number;
    birthdayBonus?: number;
    [key: string]: any;
}

interface SettingsLoyaltyProps {
    loyaltySettings: LoyaltySettings | null;
    handleUpdateLoyaltySetting: (key: string, value: string) => void;
}

const SettingsLoyalty: React.FC<SettingsLoyaltyProps> = ({ loyaltySettings, handleUpdateLoyaltySetting }) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[32px] p-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl" />
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-purple-600 to-pink-700 flex items-center justify-center shadow-2xl shadow-purple-600/30">
                            <Award size={32} className="text-white" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white">
                                Motto Club & Otomatik Hediye
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                                Üyelere verilecek otomatik ödül kuralları
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Hoşgeldin Bonus */}
                        <div className="bg-white/5 border-2 border-white/10 hover:border-indigo-500/30 rounded-[24px] p-6 transition-all group">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                    <Gift size={26} className="text-white" />
                                </div>
                                <div>
                                    <h4 className="text-base font-black text-white">
                                        Hoşgeldin Bonusu
                                    </h4>
                                    <p className="text-[10px] text-indigo-400 font-bold italic mt-1">
                                        ≈ {((loyaltySettings?.welcomeBonus || 0) / 2).toFixed(2)} ₺ değerinde
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    value={loyaltySettings?.welcomeBonus || 0}
                                    onChange={(e) => handleUpdateLoyaltySetting('welcomeBonus', e.target.value)}
                                    className="flex-1 bg-white/5 border-2 border-white/10 rounded-2xl px-4 py-3 text-white text-xl font-black outline-none focus:border-indigo-500 transition-all"
                                />
                                <span className="text-sm text-slate-400 font-bold">Volt</span>
                            </div>
                        </div>
                        {/* Doğum Günü Bonus */}
                        <div className="bg-white/5 border-2 border-white/10 hover:border-purple-500/30 rounded-[24px] p-6 transition-all group">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                                    <Cake size={26} className="text-white" />
                                </div>
                                <div>
                                    <h4 className="text-base font-black text-white">
                                        Doğum Günü Bonusu
                                    </h4>
                                    <p className="text-[10px] text-purple-400 font-bold italic mt-1">
                                        ≈ {((loyaltySettings?.birthdayBonus || 0) / 2).toFixed(2)} ₺ değerinde
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    value={loyaltySettings?.birthdayBonus || 0}
                                    onChange={(e) => handleUpdateLoyaltySetting('birthdayBonus', e.target.value)}
                                    className="flex-1 bg-white/5 border-2 border-white/10 rounded-2xl px-4 py-3 text-white text-xl font-black outline-none focus:border-purple-500 transition-all"
                                />
                                <span className="text-sm text-slate-400 font-bold">Volt</span>
                            </div>
                        </div>
                    </div>

                    {/* INFO BOX */}
                    <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-[20px] flex items-start gap-3">
                        <Info size={20} className="text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs text-indigo-300 font-bold">
                                10 Volt = 5 ₺ değerindedir
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1">
                                Üyeler kazandıkları puanları ödeme anında indirim olarak kullanabilir.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsLoyalty;
