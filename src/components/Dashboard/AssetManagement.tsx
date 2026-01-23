import React from 'react';
import { Building2, Banknote, Landmark, CreditCard, Coins } from 'lucide-react';
import AssetCard from './AssetCard';

interface AssetManagementProps {
    cash: number;
    ziraat: number;
    halk: number;
    iban: number;
    investment: number;
    getAssetRatio: (val: number) => number;
    setSelectedAssetInfo: (info: { title: string } | null) => void;
}

const AssetManagement: React.FC<AssetManagementProps> = ({
    cash,
    ziraat,
    halk,
    iban,
    investment,
    getAssetRatio,
    setSelectedAssetInfo
}) => {
    return (
        <div className="mt-8">
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2 tracking-tight">
                <Building2 className="text-indigo-400" /> Varlık Yönetimi & Hesaplar
            </h3>
            <div className="flex lg:grid lg:grid-cols-5 gap-4 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar w-full">
                <AssetCard
                    title="Kasa (Nakit)"
                    amount={cash}
                    icon={Banknote}
                    colorClass="text-emerald-400"
                    bgClass="bg-gradient-to-br from-emerald-900/40 to-slate-800 border-emerald-500/20 hover:border-emerald-500/50 shrink-0 w-[85vw] lg:w-auto snap-center"
                    ratio={getAssetRatio(cash)}
                    onClick={() => setSelectedAssetInfo({ title: "Kasa (Nakit)" })}
                />
                <AssetCard
                    title="Ziraat Bankası"
                    amount={ziraat}
                    icon={Landmark}
                    colorClass="text-red-500"
                    bgClass="bg-gradient-to-br from-red-900/40 to-slate-800 border-red-500/20 hover:border-red-500/50 shrink-0 w-[85vw] lg:w-auto snap-center"
                    ratio={getAssetRatio(ziraat)}
                    onClick={() => setSelectedAssetInfo({ title: "Ziraat Bankası" })}
                />
                <AssetCard
                    title="Halk Bankası"
                    amount={halk}
                    icon={Building2}
                    colorClass="text-blue-400"
                    bgClass="bg-gradient-to-br from-blue-900/40 to-slate-800 border-blue-500/20 hover:border-blue-500/50 shrink-0 w-[85vw] lg:w-auto snap-center"
                    ratio={getAssetRatio(halk)}
                    onClick={() => setSelectedAssetInfo({ title: "Halk Bankası" })}
                />
                <AssetCard
                    title="Diğer Hesaplar"
                    amount={iban}
                    icon={CreditCard}
                    colorClass="text-purple-400"
                    bgClass="bg-gradient-to-br from-purple-900/40 to-slate-800 border-purple-500/20 hover:border-purple-500/50 shrink-0 w-[85vw] lg:w-auto snap-center"
                    ratio={getAssetRatio(iban)}
                    onClick={() => setSelectedAssetInfo({ title: "Diğer Hesaplar" })}
                />
                <AssetCard
                    title="Altın / Döviz"
                    amount={investment}
                    icon={Coins}
                    colorClass="text-amber-400"
                    bgClass="bg-gradient-to-br from-amber-900/40 to-slate-800 border-amber-500/20 hover:border-amber-500/50 shrink-0 w-[85vw] lg:w-auto snap-center"
                    ratio={getAssetRatio(investment)}
                    subLabel="Portföy Payı"
                    onClick={() => setSelectedAssetInfo({ title: "Altın / Döviz" })}
                />
            </div>
        </div>
    );
};

export default AssetManagement;
