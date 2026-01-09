import React from 'react';
import { X } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const AssetDetailModal = ({
    selectedAssetInfo,
    setSelectedAssetInfo,
    transactions
}) => {
    // Tıklanan hesaba ait son 5 işlemi filtreleyen fonksiyon
    const getAssetTransactions = (assetTitle) => {
        // Başlıkları veritabanı tipleriyle eşleştiriyoruz (Örn: "Kasa (Nakit)" -> "cash")
        const typeMap = {
            "Kasa (Nakit)": "cash",
            "Ziraat Bankası": "ziraat",
            "Halk Bankası": "halk",
            "Diğer Hesaplar": "iban",
            "Altın / Döviz": "investment"
        };

        const assetType = typeMap[assetTitle];
        return transactions
            .filter(t => t.paymentMethod === assetType || t.category === assetType)
            .slice(0, 5); // Sadece son 5 işlem
    };

    if (!selectedAssetInfo) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Arka Plan Karartma */}
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setSelectedAssetInfo(null)}></div>

            {/* Modal İçeriği */}
            <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-300">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-black text-white">{selectedAssetInfo.title}</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1 text-indigo-400">Son 5 Hareket</p>
                    </div>
                    <button onClick={() => setSelectedAssetInfo(null)} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    {getAssetTransactions(selectedAssetInfo.title).length > 0 ? (
                        getAssetTransactions(selectedAssetInfo.title).map((t, i) => (
                            <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-white leading-none mb-1">{t.description || 'İşlem'}</span>
                                    <span className="text-[10px] text-slate-500 font-medium">{t.date}</span>
                                </div>
                                <span className={`text-sm font-black ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)} ₺
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="py-10 text-center text-slate-500 italic text-sm">Bu hesaba ait son işlem bulunamadı.</div>
                    )}
                </div>

                <button
                    onClick={() => setSelectedAssetInfo(null)}
                    className="w-full mt-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
                >
                    KAPAT
                </button>
            </div>
        </div>
    );
};

export default AssetDetailModal;