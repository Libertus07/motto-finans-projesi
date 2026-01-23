import React from 'react';
import { User, Building2, Shield, TrendingUp, Users } from 'lucide-react';
import { SHOP_ID } from '../../utils/constants';

const SettingsGeneral: React.FC = () => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* PATRON & VERSION INFO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Patron Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[32px] p-8">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-3xl" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-2xl shadow-indigo-600/30">
                                <User size={36} className="text-white" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white">
                                    Sistem Sahibi
                                </h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-xs font-bold text-emerald-400">
                                        Çevrimiçi
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3 pt-6 border-t border-white/10">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Yetki Seviyesi</span>
                                <span className="text-white font-bold">Admin</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Sürüm</span>
                                <span className="text-white font-bold">v3.5.0</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Son Güncelleme</span>
                                <span className="text-white font-bold">Loyalty Update</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shop Info Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[32px] p-8">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-violet-500/10 to-transparent rounded-full blur-3xl" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-2xl shadow-violet-600/30">
                                <Building2 size={36} className="text-white" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white">
                                    Mağaza Bilgileri
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    Motto Coffee - Yüksekova Şube
                                </p>
                            </div>
                        </div>
                        <div className="space-y-3 pt-6 border-t border-white/10">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Shop ID</span>
                                <span className="text-white font-bold font-mono text-xs">
                                    {SHOP_ID.slice(-8)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Durum</span>
                                <span className="text-emerald-400 font-bold">Aktif</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Konum</span>
                                <span className="text-white font-bold">Yüksekova, Hakkari</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* QUICK STATS */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-[24px] p-6 text-center">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Shield size={24} className="text-indigo-400" />
                    </div>
                    <p className="text-2xl font-black text-white">100%</p>
                    <p className="text-xs text-slate-400 mt-1">Güvenli</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-[24px] p-6 text-center">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <TrendingUp size={24} className="text-emerald-400" />
                    </div>
                    <p className="text-2xl font-black text-white">Aktif</p>
                    <p className="text-xs text-slate-400 mt-1">Sistem Durumu</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-[24px] p-6 text-center">
                    <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Users size={24} className="text-violet-400" />
                    </div>
                    <p className="text-2xl font-black text-white">Multi</p>
                    <p className="text-xs text-slate-400 mt-1">Kullanıcı Desteği</p>
                </div>
            </div>
        </div>
    );
};

export default SettingsGeneral;
