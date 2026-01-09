// pages/Settings.jsx - PREMIUM VERSION
import React, { useState } from 'react';
import { 
    Settings as SettingsIcon, Database, Trash2, Target, Building2, 
    User, Zap, FileText, Loader2, Award, Cake, Gift, Save, 
    Shield, Bell, Palette, Globe, Lock, CreditCard, Users,
    TrendingUp, DollarSign, AlertCircle, CheckCircle2, 
    Info, Download, Upload, RefreshCw, Eye, EyeOff
} from 'lucide-react';
import { doc, setDoc, writeBatch, collection, getDocs } from 'firebase/firestore';
import { db, appId } from '../services/firebase';
import { 
    INITIAL_TRANSACTIONS, INITIAL_PRODUCTS, INITIAL_DEBTS, 
    INITIAL_INVESTMENTS, INITIAL_QUICK_ACTIONS, INITIAL_INGREDIENTS, 
    INITIAL_NOTES, INITIAL_TABLES 
} from '../utils/constants';
import ConfirmationModal from '../components/ConfirmationModal';
import InfoModal from '../components/InfoModal';
import SettingsGeneral from '../components/settings/SettingsGeneral';
import SettingsFinancial from '../components/settings/SettingsFinancial';
import SettingsLoyalty from '../components/settings/SettingsLoyalty';
import SettingsData from '../components/settings/SettingsData';

const CURRENT_SHOP_ID = 'motto_coffee_sube_01';

const Settings = ({ 
    monthlyGoal, 
    setMonthlyGoal, 
    fixedCosts, 
    setFixedCosts, 
    loyaltySettings, 
    setLoyaltySettings 
}) => {
    const [dbLoading, setDbLoading] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ 
        open: false, type: '', title: '', message: '', action: null 
    });
    const [infoModal, setInfoModal] = useState({ 
        isOpen: false, type: 'success', title: '', message: '' 
    });
    const [activeSection, setActiveSection] = useState('general');
    const [unsavedChanges, setUnsavedChanges] = useState(false);

    // 💾 SAVE HANDLERS
    const handleUpdateGoal = async (val) => {
        setMonthlyGoal(val);
        setUnsavedChanges(false);
        await setDoc(
            doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'settings', 'monthlyGoal'), 
            { value: Number(val) }
        );
    };

    const handleUpdateFixedCost = async (field, val) => {
        const newCosts = { ...fixedCosts, [field]: Number(val) };
        setFixedCosts(newCosts);
        setUnsavedChanges(false);
        await setDoc(
            doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'settings', 'fixedCosts'), 
            newCosts
        );
    };

    const handleUpdateLoyaltySetting = async (field, val) => {
        const newSettings = { ...loyaltySettings, [field]: Number(val) };
        setLoyaltySettings(newSettings);
        setUnsavedChanges(false);
        await setDoc(
            doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'settings', 'loyalty'), 
            newSettings
        );
    };

    // 🗄️ DATA MANAGEMENT
    const seedDemoData = async () => {
        setDbLoading(true);
        const batch = writeBatch(db);

        INITIAL_TRANSACTIONS.forEach(t => 
            batch.set(doc(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'transactions')), t)
        );
        INITIAL_PRODUCTS.forEach(p => 
            batch.set(doc(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'products')), p)
        );
        INITIAL_DEBTS.forEach(d => 
            batch.set(doc(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'debts')), d)
        );
        INITIAL_INVESTMENTS.forEach(i => 
            batch.set(doc(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'investments')), i)
        );
        INITIAL_QUICK_ACTIONS.forEach(qa => 
            batch.set(doc(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'quickActions')), qa)
        );
        INITIAL_INGREDIENTS.forEach(ing => 
            batch.set(doc(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'ingredients')), ing)
        );
        INITIAL_NOTES.forEach(n => 
            batch.set(doc(collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'notes')), n)
        );
        
        if (INITIAL_TABLES) {
            INITIAL_TABLES.forEach(t => {
                batch.set(doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'tables', t.id), t);
            });
        }

        batch.set(
            doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'settings', 'fixedCosts'), 
            { rent: 0, staff: 0, bills: 0, other: 0 }
        );
        batch.set(
            doc(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, 'settings', 'monthlyGoal'), 
            { value: 120000 }
        );

        try { 
            await batch.commit(); 
            setInfoModal({ 
                isOpen: true, 
                type: 'success', 
                title: 'İşlem Başarılı', 
                message: 'Örnek veriler ve masalar başarıyla yüklendi.' 
            });
        } catch (e) { 
            setInfoModal({ 
                isOpen: true, 
                type: 'error', 
                title: 'Hata', 
                message: e.message 
            });
        } finally { 
            setDbLoading(false); 
            setConfirmModal({ ...confirmModal, open: false }); 
        }
    };

    const handleHardReset = async () => {
        setDbLoading(true);
        const collections = [
            'transactions', 'products', 'debts', 'investments', 
            'quickActions', 'ingredients', 'notes', 'tables', 'staff'
        ];
        
        try {
            for (const colName of collections) {
                const snapshot = await getDocs(
                    collection(db, 'artifacts', appId, 'shops', CURRENT_SHOP_ID, colName)
                );
                const batch = writeBatch(db);
                snapshot.docs.forEach((doc) => batch.delete(doc.ref));
                await batch.commit();
            }
            setInfoModal({ 
                isOpen: true, 
                type: 'success', 
                title: 'Temizlendi', 
                message: 'Tüm veriler başarıyla silindi ve sistem sıfırlandı.' 
            });
        } catch (e) { 
            setInfoModal({ 
                isOpen: true, 
                type: 'error', 
                title: 'Hata', 
                message: e.message 
            });
        } finally { 
            setDbLoading(false); 
            setConfirmModal({ ...confirmModal, open: false }); 
        }
    };

    const openSeedModal = () => setConfirmModal({
        open: true, 
        type: 'warning', 
        title: 'Örnek Veri Yükle',
        message: 'Mevcut verilerin üzerine örnek veriler (MASALAR DAHİL) eklenecek. Devam edilsin mi?',
        action: seedDemoData
    });

    const openResetModal = () => setConfirmModal({
        open: true, 
        type: 'danger', 
        title: 'Tüm Verileri Sil',
        message: '⚠️ DİKKAT: TÜM VERİLER SİLİNECEK! Bu işlem geri alınamaz. Emin misiniz?',
        action: handleHardReset
    });

    // 🎨 SECTION TABS
    const sections = [
        { id: 'general', label: 'Genel', icon: SettingsIcon, color: 'indigo' },
        { id: 'financial', label: 'Finans', icon: DollarSign, color: 'emerald' },
        { id: 'loyalty', label: 'Sadakat', icon: Award, color: 'purple' },
        { id: 'data', label: 'Veri', icon: Database, color: 'rose' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#05070a] via-[#0a0d14] to-[#05070a] pb-20">
            <ConfirmationModal 
                isOpen={confirmModal.open} 
                onClose={() => setConfirmModal({ ...confirmModal, open: false })} 
                onConfirm={confirmModal.action} 
                title={confirmModal.title} 
                message={confirmModal.message} 
                type={confirmModal.type} 
                loading={dbLoading}
            />
            <InfoModal 
                isOpen={infoModal.isOpen} 
                onClose={() => setInfoModal({ ...infoModal, isOpen: false })} 
                type={infoModal.type} 
                title={infoModal.title} 
                message={infoModal.message}
            />

            {/* 🎨 HEADER */}
            <div className="sticky top-0 z-40 backdrop-blur-2xl bg-[#05070a]/90 border-b border-white/5">
                <div className="max-w-6xl mx-auto px-6 py-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-[24px] bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-2xl shadow-indigo-600/30">
                                <SettingsIcon size={28} className="text-white" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-white tracking-tight">
                                    Sistem Ayarları
                                </h1>
                                <p className="text-xs text-slate-400 font-medium mt-1">
                                    Motto Coffee yapılandırma paneli
                                </p>
                            </div>
                        </div>

                        {/* STATUS INDICATOR */}
                        <div className="flex items-center gap-4">
                            {unsavedChanges && (
                                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                                    <AlertCircle size={16} className="text-amber-400" />
                                    <span className="text-xs font-bold text-amber-400">
                                        Kaydedilmemiş Değişiklik
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <div>
                                    <p className="text-xs font-bold text-emerald-400 leading-none">
                                        SİSTEM AKTİF
                                    </p>
                                    <p className="text-[10px] text-slate-500 leading-none mt-0.5">
                                        Tüm modüller çalışıyor
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TAB NAVIGATION */}
                    <div className="flex gap-2 mt-6">
                        {sections.map(section => {
                            const Icon = section.icon;
                            const isActive = activeSection === section.id;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`
                                        relative flex items-center gap-2 px-6 py-3 rounded-2xl
                                        font-bold text-sm transition-all
                                        ${isActive 
                                            ? 'bg-white text-black shadow-xl' 
                                            : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                                        }
                                    `}
                                >
                                    <Icon size={16} />
                                    {section.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* 📄 CONTENT */}
            <div className="max-w-6xl mx-auto px-6 py-8">
                
                {/* 🏠 GENERAL SECTION */}
                {activeSection === 'general' && <SettingsGeneral />}

                {/* 💰 FINANCIAL SECTION */}
                {activeSection === 'financial' && <SettingsFinancial monthlyGoal={monthlyGoal} setMonthlyGoal={setMonthlyGoal} setUnsavedChanges={setUnsavedChanges} handleUpdateGoal={handleUpdateGoal} fixedCosts={fixedCosts} handleUpdateFixedCost={handleUpdateFixedCost} />}

                {/* 🎁 LOYALTY SECTION */}
                {activeSection === 'loyalty' && <SettingsLoyalty loyaltySettings={loyaltySettings} handleUpdateLoyaltySetting={handleUpdateLoyaltySetting} />}

            {/* 🗄️ DATA SECTION */}
            {activeSection === 'data' && <SettingsData dbLoading={dbLoading} openSeedModal={openSeedModal} openResetModal={openResetModal} />}

        </div>
    </div>
);
};
export default Settings;;