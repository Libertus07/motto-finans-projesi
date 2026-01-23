import React from 'react';
import { AlertCircle, Database, Download, Trash2, Loader2 } from 'lucide-react';

interface SettingsDataProps {
    dbLoading: boolean;
    openSeedModal: () => void;
    openResetModal: () => void;
}

const SettingsData: React.FC<SettingsDataProps> = ({ dbLoading, openSeedModal, openResetModal }) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* WARNING BANNER */}
            <div className="bg-gradient-to-r from-rose-500/10 to-red-500/10 border-2 border-rose-500/30 rounded-[32px] p-6 flex items-start gap-4">
                <div className="w-12 h-12 bg-rose-500/20 rounded-2xl flex items-center justify-center shrink-0">
                    <AlertCircle size={24} className="text-rose-400" />
                </div>
                <div>
                    <h3 className="text-base font-black text-rose-400">
                        Dikkatli Olun!
                    </h3>
                    <p className="text-xs text-slate-300 mt-2">
                        Veri yönetimi işlemleri geri alınamaz. Lütfen işlemlerinizi dikkatli yapın.
                    </p>
                </div>
            </div>

            {/* DATA MANAGEMENT CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* SEED DATA */}
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 group hover:border-white/20 transition-all">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl" />
                    <div className="relative z-10">
                        <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center shadow-2xl shadow-emerald-600/30 mb-6">
                            <Download size={32} className="text-white" strokeWidth={2.5} />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2">
                            Örnek Veri Yükle
                        </h3>
                        <p className="text-xs text-slate-400 mb-6">
                            Demo ürünler, masalar ve işlemler ekleyin
                        </p>
                        <button
                            onClick={openSeedModal}
                            disabled={dbLoading}
                            className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {dbLoading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <Database size={20} />
                                    Veri Yükle
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* HARD RESET */}
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-rose-500/30 rounded-[32px] p-8 group hover:border-rose-500/50 transition-all">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-rose-500/10 to-transparent rounded-full blur-3xl" />
                    <div className="relative z-10">
                        <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-rose-600 to-red-700 flex items-center justify-center shadow-2xl shadow-rose-600/30 mb-6">
                            <Trash2 size={32} className="text-white" strokeWidth={2.5} />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2">
                            Tüm Verileri Sil
                        </h3>
                        <p className="text-xs text-slate-400 mb-6">
                            Sistemi sıfırlayın ve tüm verileri temizleyin
                        </p>
                        <button
                            onClick={openResetModal}
                            disabled={dbLoading}
                            className="w-full h-14 bg-rose-600/20 hover:bg-rose-600 hover:text-white border-2 border-rose-500/50 text-rose-400 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {dbLoading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <Trash2 size={20} />
                                    Tümünü Sil
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* DATA INFO */}
            <div className="bg-white/5 border border-white/10 rounded-[28px] p-6">
                <h4 className="text-sm font-black text-white mb-4 flex items-center gap-2">
                    <Database size={16} className="text-indigo-400" />
                    Veri Koleksiyonları
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        'Transactions', 'Products', 'Debts', 'Investments',
                        'Quick Actions', 'Ingredients', 'Notes', 'Tables'
                    ].map((col, i) => (
                        <div
                            key={i}
                            className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center"
                        >
                            <p className="text-xs font-bold text-slate-300">
                                {col}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SettingsData;
