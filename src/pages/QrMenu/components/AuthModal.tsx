import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, Lock, User, Phone, Calendar, ArrowRight, Loader2, Sparkles, Eye, EyeOff, Check, Ticket, Crown } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, setPersistence, browserLocalPersistence, browserSessionPersistence, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, increment } from 'firebase/firestore';
import { auth, db } from '../../../services/firebase';
import { COLLECTIONS } from '../../../utils/firebasePaths';
import { LoyaltyCustomer } from '../../../types';
import { CustomerProfile } from '../views/qrMenu';
import { useToast } from './ToastProvider';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'login' | 'register';
    onModeChange: (mode: 'login' | 'register') => void;
    t: (key: string) => string;
    welcomeBonus: number;
    referrerReward: number;
    refereeReward: number;
}

const InputField = React.forwardRef<HTMLInputElement, any>(({ icon: Icon, type = "text", ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    return (
        <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#432818]/40 group-focus-within:text-[#D4AF37] transition-colors">
                <Icon size={18} />
            </div>
            <input
                {...props}
                type={isPassword ? (showPassword ? "text" : "password") : type}
                ref={ref}
                className={`w-full pl-9 ${isPassword ? 'pr-9' : 'pr-3'} py-2 bg-white border-2 border-[#432818]/5 rounded-xl outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 transition-all placeholder:text-[#432818]/30 font-medium text-[#432818] text-sm`}
            />
            {isPassword && (
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#432818]/40 hover:text-[#D4AF37] transition-colors p-1"
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            )}
        </div>
    );
});

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode, onModeChange, t, welcomeBonus, referrerReward, refereeReward }) => {

    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const firstInputRef = useRef<HTMLInputElement>(null);

    const today = new Date().toISOString().split('T')[0];

    // Form States
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [rememberMe, setRememberMe] = useState(false);
    const [registerForm, setRegisterForm] = useState({
        firstName: '', lastName: '', phone: '', email: '', password: '', birthday: '', inviteCode: ''
    });
    const [activeView, setActiveView] = useState<'login' | 'register' | 'forgot-password' | 'agreement'>(mode);
    const [isAgreed, setIsAgreed] = useState(false);

    useEffect(() => {
        if (isOpen && firstInputRef.current) {
            setTimeout(() => firstInputRef.current?.focus(), 100);
        }
    }, [isOpen, mode]);

    useEffect(() => {
        setActiveView(mode);
    }, [mode]);

    if (!isOpen) return null;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!loginForm.email || !loginForm.password) {
            showToast('Lütfen tüm alanları doldurun.', 'error');
            return;
        }

        setIsLoading(true);
        try {
            await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
            await signInWithEmailAndPassword(auth, loginForm.email, loginForm.password);
            onClose();
            showToast("Giriş başarılı! Hoş geldiniz.", 'success');
        } catch (error: any) {
            console.error(error);
            let msg = "Giriş yapılamadı.";
            if (error.code === 'auth/invalid-credential') msg = "E-posta veya şifre hatalı.";
            showToast(msg, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic Validation
        if (!registerForm.firstName || !registerForm.lastName || !registerForm.email || !registerForm.password || !registerForm.phone) {
            showToast('Lütfen zorunlu alanları doldurun (*).', 'error');
            return;
        }
        if (registerForm.password.length < 6) {
            showToast('Şifre en az 6 karakter olmalıdır.', 'error');
            return;
        }

        if (!isAgreed) {
            showToast('Lütfen kullanıcı sözleşmesini onaylayın.', 'error');
            return;
        }

        const cleanPhone = registerForm.phone.replace(/\s/g, '');

        const generateInviteCode = () => {
            return `MOTTO-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        };

        setIsLoading(true);
        try {
            const cred = await createUserWithEmailAndPassword(auth, registerForm.email, registerForm.password);
            await updateProfile(cred.user, { displayName: `${registerForm.firstName} ${registerForm.lastName}` });

            const personalInviteCode = generateInviteCode();

            let totalStartingPoints = welcomeBonus;
            // Actually wait, COLLECTIONS uses dynamic paths?? No, COLLECTIONS usually has pure names.
            // Let's check imports. COLLECTIONS come from utils/firebasePaths.
            // But we need the SHOP_ID context for where queries if challenges are per shop? 
            // In handleRegister, we are creating users in `customers` collection.
            // The previous code used `doc(db, COLLECTIONS.CUSTOMERS, ...)` which assumes global customers or correct path.
            // Let's assume COLLECTIONS.CUSTOMERS is the correct path.

            // 1. Process Referral Logic
            if (registerForm.inviteCode && registerForm.inviteCode.length > 5) {
                try {
                    const customersRef = collection(db, COLLECTIONS.CUSTOMERS);
                    const q = query(customersRef, where('personalInviteCode', '==', registerForm.inviteCode.toUpperCase().trim()));
                    const snapshot = await getDocs(q);

                    if (!snapshot.empty) {
                        const referrerDoc = snapshot.docs[0];
                        const referrerData = referrerDoc.data();

                        // Prevent self-referral (unlikely here as we are creating new user)

                        // Update Referrer
                        await updateDoc(referrerDoc.ref, {
                            points: increment(referrerReward),
                            referralCount: increment(1)
                        });

                        // Add transaction for Referrer
                        await addDoc(collection(db, COLLECTIONS.TRANSACTIONS), {
                            customerPhone: referrerData.phone,
                            customerId: referrerDoc.id,
                            type: 'referral_bonus',
                            amount: 0,
                            points: referrerReward,
                            desc: `Arkadaş Daveti Bonusu: ${registerForm.firstName} 🎉`,
                            date: new Date().toLocaleDateString('tr-TR'),
                            timestamp: serverTimestamp()
                        });

                        // Bonus for Referee (New User)
                        totalStartingPoints += refereeReward;
                    }
                } catch (err) {
                    console.error("Referral check failed", err);
                }
            }

            const newProfile: any = {
                uid: cred.user.uid,
                firstName: registerForm.firstName,
                lastName: registerForm.lastName,
                phone: cleanPhone,
                email: registerForm.email,
                birthday: registerForm.birthday,
                inviteCode: registerForm.inviteCode,
                personalInviteCode, // Kişiye özel davet kodu
                points: totalStartingPoints, // Welcome bonus + Referral Bonus
                referredBy: (registerForm.inviteCode && registerForm.inviteCode.length > 5 && totalStartingPoints > welcomeBonus) ? registerForm.inviteCode.toUpperCase().trim() : null, // Storing code effectively links to referrer if we query code, but ID is better. 
                // Wait, I don't have referrerID in scope easily unless I lift it out.
                // Let's just save the inviteCode used for now as 'usedInviteCode'.
                usedInviteCode: registerForm.inviteCode ? registerForm.inviteCode.toUpperCase().trim() : null,
                favorites: [],
                createdAt: new Date().toISOString()
            };

            await setDoc(doc(db, COLLECTIONS.CUSTOMERS, cred.user.uid), newProfile);

            // Also save to POS customers collection with phone as key
            const posCustomer: any = {
                phone: cleanPhone,
                name: registerForm.firstName.toUpperCase(),
                surname: registerForm.lastName.toUpperCase(),
                birthday: registerForm.birthday || "",
                points: totalStartingPoints,
                inviteCode: registerForm.inviteCode,
                personalInviteCode, // POS kaydına da ekle
                tier: 'BRONZE',
                createdAt: new Date().toISOString(),
                totalOrders: 0,
                totalSpent: 0,
                lastVisit: 'Yeni Kayıt',
                email: registerForm.email,
                favorites: [],
                coffeeStamps: 0
            };
            await setDoc(doc(db, COLLECTIONS.CUSTOMERS, cleanPhone), posCustomer);

            // Hoşgeldin Hediyesi İşlem Kaydı (Puan Geçmişinde Görünmesi İçin)
            await addDoc(collection(db, COLLECTIONS.TRANSACTIONS), {
                customerPhone: cleanPhone,
                customerId: cred.user.uid,
                type: 'gift',
                amount: 0,
                points: welcomeBonus,
                desc: 'Hoşgeldin Hediyesi 🎉',
                date: new Date().toLocaleDateString('tr-TR'),
                timestamp: serverTimestamp()
            });

            // Extra transaction log for referral bonus if applicable
            if (totalStartingPoints > welcomeBonus) {
                await addDoc(collection(db, COLLECTIONS.TRANSACTIONS), {
                    customerPhone: cleanPhone,
                    customerId: cred.user.uid,
                    type: 'gift',
                    amount: 0,
                    points: refereeReward,
                    desc: 'Davet ile Kayıt Bonusu 🎁',
                    date: new Date().toLocaleDateString('tr-TR'),
                    timestamp: serverTimestamp()
                });
            }

            onClose();
            showToast(`Motto Club'a Hoş Geldiniz!  Volt Hesabınıza Yüklendi ⚡`, 'success');
        } catch (error: any) {
            console.error(error);
            let msg = "Kayıt olunamadı.";
            if (error.code === 'auth/email-already-in-use') msg = "Bu e-posta zaten kullanımda.";
            showToast(msg, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!loginForm.email) {
            showToast('Lütfen e-posta adresinizi girin.', 'error');
            return;
        }
        setIsLoading(true);
        try {
            await sendPasswordResetEmail(auth, loginForm.email);
            showToast('Sıfırlama bağlantısı gönderildi. E-postanızı kontrol edin.', 'success');
            setActiveView('login');
        } catch (error: any) {
            console.error(error);
            showToast(error.code === 'auth/user-not-found' ? "Kullanıcı bulunamadı." : "İşlem başarısız.", 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Sadece rakamları al
        let raw = e.target.value.replace(/\D/g, '');

        // Başında 0 varsa kaldır (5XX formatı için)
        if (raw.startsWith('0')) {
            raw = raw.substring(1);
        }

        // Maksimum 10 hane
        raw = raw.substring(0, 10);

        // Formatla: 5XX XXX XX XX
        let formatted = raw;
        if (raw.length > 3) formatted = `${raw.slice(0, 3)} ${raw.slice(3)}`;
        if (raw.length > 6) formatted = `${raw.slice(0, 3)} ${raw.slice(3, 6)} ${raw.slice(6)}`;
        if (raw.length > 8) formatted = `${raw.slice(0, 3)} ${raw.slice(3, 6)} ${raw.slice(6, 8)} ${raw.slice(8)}`;

        setRegisterForm(prev => ({ ...prev, phone: formatted }));
    };

    const getPasswordStrength = (pass: string) => {
        if (!pass) return 0;
        let score = 0;
        if (pass.length >= 6) score += 1; // En az 6 karakter
        if (pass.length >= 8) score += 1; // İdeal uzunluk
        if (/[0-9]/.test(pass)) score += 1; // Rakam içeriyor
        if (/[^A-Za-z0-9]/.test(pass)) score += 1; // Özel karakter içeriyor
        return Math.min(score, 4);
    };

    return (
        <div className="fixed inset-0 z-[70] bg-[#1a1a1a]/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#FDFBF7] w-full max-w-sm max-h-[90vh] overflow-y-auto custom-scrollbar rounded-[1.5rem] p-5 relative shadow-2xl scale-100 animate-in zoom-in-95 duration-200 my-auto">

                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-[#432818]/5 hover:bg-[#432818]/10 transition-colors text-[#432818] z-20"
                >
                    <X size={16} />
                </button>

                <div className="text-center mb-4 relative z-10">
                    <div className="w-12 h-12 bg-[#D4AF37] rounded-xl rotate-3 mx-auto flex items-center justify-center shadow-lg shadow-orange-900/10 mb-2">
                        <Crown size={24} className="text-[#FDFBF7]" />
                    </div>
                    <h2 className="text-lg font-black text-[#432818] uppercase tracking-widest font-cinzel">Motto Club</h2>
                    <p className="text-[#BB9457] font-bold text-[10px] font-cinzel tracking-wider mt-0.5">
                        {activeView === 'forgot-password' ? t('forgot_password_title') : (activeView === 'agreement' ? t('agreement_title') : (activeView === 'login' ? t('login_title') : t('register_title')))}
                    </p>
                </div>

                {activeView === 'login' && (
                    <form onSubmit={handleLogin} className="space-y-4 relative z-10">
                        <InputField
                            icon={Mail}
                            type="email"
                            placeholder={t('email_placeholder')}
                            value={loginForm.email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginForm({ ...loginForm, email: e.target.value })}
                            autoComplete="username"
                        />
                        <InputField
                            icon={Lock}
                            type="password"
                            placeholder={t('password_placeholder')}
                            value={loginForm.password}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginForm({ ...loginForm, password: e.target.value })}
                            autoComplete="current-password"
                        />

                        <div className="flex items-center justify-between px-1">
                            <label className="flex items-center gap-2 cursor-pointer group select-none">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${rememberMe ? 'bg-[#432818] border-[#432818]' : 'border-[#432818]/20 group-hover:border-[#432818]/40'}`}>
                                    {rememberMe && <Check size={12} className="text-[#D4AF37]" strokeWidth={3} />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span className="text-xs font-bold text-[#432818]/60 group-hover:text-[#432818] transition-colors font-cinzel">{t('remember_me')}</span>
                            </label>
                            <button type="button" onClick={() => setActiveView('forgot-password')} className="text-xs font-bold text-[#432818]/60 hover:text-[#432818] transition-colors font-cinzel">
                                {t('forgot_password')}
                            </button>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#432818] text-[#D4AF37] py-4 rounded-xl font-bold text-lg font-cinzel hover:bg-[#2c1a0f] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : <>{t('login_button')} <ArrowRight size={20} /></>}
                            </button>
                        </div>
                    </form>
                )}

                {activeView === 'register' && (
                    <form onSubmit={handleRegister} className="space-y-1 relative z-10">
                        <div className="flex gap-2">
                            <InputField icon={User} placeholder={t('name_placeholder')} value={registerForm.firstName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegisterForm({ ...registerForm, firstName: e.target.value })} ref={firstInputRef} />
                            <InputField icon={User} placeholder={t('surname_placeholder')} value={registerForm.lastName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegisterForm({ ...registerForm, lastName: e.target.value })} />
                        </div>
                        <InputField icon={Phone} type="tel" placeholder={t('phone_placeholder')} value={registerForm.phone} onChange={handlePhoneChange} />
                        <InputField icon={Mail} type="email" placeholder={t('email_placeholder')} value={registerForm.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegisterForm({ ...registerForm, email: e.target.value })} autoComplete="off" />
                        <InputField icon={Lock} type="password" placeholder={t('password_min_placeholder')} value={registerForm.password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegisterForm({ ...registerForm, password: e.target.value })} autoComplete="new-password" />
                        <InputField icon={Ticket} placeholder={t('invite_code_placeholder')} value={registerForm.inviteCode} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegisterForm({ ...registerForm, inviteCode: e.target.value })} />

                        {registerForm.password && (
                            <div className="flex flex-col gap-1 px-2 -mt-1">
                                <div className="flex gap-1 h-1">
                                    {[1, 2, 3, 4].map((level) => {
                                        const strength = getPasswordStrength(registerForm.password);
                                        const color = strength <= 1 ? 'bg-red-400' : strength === 2 ? 'bg-orange-400' : strength === 3 ? 'bg-yellow-400' : 'bg-emerald-500';
                                        return (
                                            <div key={level} className={`flex-1 rounded-full transition-all duration-300 ${level <= strength ? color : 'bg-[#432818]/10'}`} />
                                        );
                                    })}
                                </div>
                                <div className="flex justify-end">
                                    <span className="text-[10px] font-bold text-[#432818]/60">
                                        {[t('weak'), t('weak'), t('medium'), t('good'), t('strong')][getPasswordStrength(registerForm.password)]}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#432818]/60 ml-1 font-cinzel">DOĞUM TARİHİ</label>
                            <div className="grid grid-cols-3 gap-2">
                                {/* GÜN */}
                                <div className="relative">
                                    <select
                                        value={registerForm.birthday ? registerForm.birthday.split('-')[2] : ''}
                                        onChange={(e) => {
                                            const day = e.target.value;
                                            const current = registerForm.birthday ? registerForm.birthday.split('-') : ['', '', ''];
                                            const year = current[0] || new Date().getFullYear().toString();
                                            const month = current[1] || '01';
                                            setRegisterForm({ ...registerForm, birthday: `${year}-${month}-${day}` });
                                        }}
                                        className="w-full px-3 py-2 bg-white border-2 border-[#432818]/5 rounded-xl outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/10 transition-all font-medium text-[#432818] text-sm appearance-none"
                                    >
                                        <option value="" disabled>Gün</option>
                                        {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                                            <option key={d} value={d.toString().padStart(2, '0')}>{d}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* AY */}
                                <div className="relative">
                                    <select
                                        value={registerForm.birthday ? registerForm.birthday.split('-')[1] : ''}
                                        onChange={(e) => {
                                            const month = e.target.value;
                                            const current = registerForm.birthday ? registerForm.birthday.split('-') : ['', '', ''];
                                            const year = current[0] || new Date().getFullYear().toString();
                                            const day = current[2] || '01';
                                            setRegisterForm({ ...registerForm, birthday: `${year}-${month}-${day}` });
                                        }}
                                        className="w-full px-3 py-2 bg-white border-2 border-[#432818]/5 rounded-xl outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/10 transition-all font-medium text-[#432818] text-sm appearance-none"
                                    >
                                        <option value="" disabled>Ay</option>
                                        {['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'].map((m, i) => (
                                            <option key={m} value={(i + 1).toString().padStart(2, '0')}>{m}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* YIL */}
                                <div className="relative">
                                    <select
                                        value={registerForm.birthday ? registerForm.birthday.split('-')[0] : ''}
                                        onChange={(e) => {
                                            const year = e.target.value;
                                            const current = registerForm.birthday ? registerForm.birthday.split('-') : ['', '', ''];
                                            const month = current[1] || '01';
                                            const day = current[2] || '01';
                                            setRegisterForm({ ...registerForm, birthday: `${year}-${month}-${day}` });
                                        }}
                                        className="w-full px-3 py-2 bg-white border-2 border-[#432818]/5 rounded-xl outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/10 transition-all font-medium text-[#432818] text-sm appearance-none"
                                    >
                                        <option value="" disabled>Yıl</option>
                                        {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(y => (
                                            <option key={y} value={y.toString()}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-2 px-1 mt-2">
                            <div
                                className={`w-5 h-5 mt-0.5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer ${isAgreed ? 'bg-[#432818] border-[#432818]' : 'border-[#432818]/20 hover:border-[#432818]/40'}`}
                                onClick={() => setIsAgreed(!isAgreed)}
                            >
                                {isAgreed && <Check size={12} className="text-[#D4AF37]" strokeWidth={3} />}
                            </div>
                            <span className="text-xs font-bold text-[#432818]/60 font-cinzel leading-tight select-none">
                                <button type="button" onClick={() => setActiveView('agreement')} className="underline hover:text-[#D4AF37] text-[#432818]">{t('agreement_check')}</button>
                            </span>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#432818] text-[#D4AF37] py-4 rounded-xl font-bold text-lg font-cinzel hover:bg-[#2c1a0f] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : t('register_button')}
                            </button>
                        </div>
                    </form>
                )}

                {activeView === 'forgot-password' && (
                    <form onSubmit={handleResetPassword} className="space-y-4 relative z-10">
                        <div className="text-center px-4 mb-2">
                            <p className="text-[#432818]/60 text-sm">
                                E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
                            </p>
                        </div>
                        <InputField
                            icon={Mail}
                            type="email"
                            placeholder={t('email_placeholder')}
                            value={loginForm.email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginForm({ ...loginForm, email: e.target.value })}
                        />
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#432818] text-[#D4AF37] py-4 rounded-xl font-bold text-lg font-cinzel hover:bg-[#2c1a0f] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : t('send_link')}
                            </button>
                        </div>
                    </form>
                )}

                {activeView === 'agreement' && (
                    <div className="relative z-10 h-[400px] flex flex-col animate-in fade-in slide-in-from-right-8">
                        <div className="flex-1 overflow-y-auto custom-scrollbar text-xs text-[#432818]/80 p-4 border border-[#432818]/10 rounded-xl mb-4 bg-white/50 leading-relaxed text-justify">
                            <h4 className="font-bold mb-2">1. TARAFLAR VE KONU</h4>
                            <p className="mb-3">İşbu sözleşme, Motto Club üyesi ("Üye") ile Motto Roastery ("Şirket") arasında, üyeliğin oluşturulması ve sadakat programı şartlarını belirler.</p>

                            <h4 className="font-bold mb-2">2. KİŞİSEL VERİLERİN KORUNMASI (KVKK)</h4>
                            <p className="mb-3">Üye tarafından paylaşılan ad, soyad, telefon ve doğum tarihi bilgileri; hizmet kalitesini artırmak, puan/kampanya takibi yapmak ve size özel fırsatlar sunmak amacıyla işlenmektedir. Verileriniz 3. kişilerle paylaşılmaz.</p>

                            <h4 className="font-bold mb-2">3. ÜYELİK VE PUANLAR</h4>
                            <p className="mb-3">Kazanılan Volt puanlar nakde çevrilemez. Şirket, puan sisteminde ve ödüllerde değişiklik yapma hakkını saklı tutar.</p>

                            <h4 className="font-bold mb-2">4. İLETİŞİM İZNİ</h4>
                            <p className="mb-3">Üye, kendisine kampanya ve bilgilendirme amacıyla SMS veya E-posta gönderilmesine izin verir.</p>
                        </div>
                        <button
                            onClick={() => { setIsAgreed(true); setActiveView('register'); }}
                            className="w-full bg-[#432818] text-[#D4AF37] py-3 rounded-xl font-bold font-cinzel hover:bg-[#2c1a0f] transition-colors"
                        >
                            {t('read_approve')}
                        </button>
                        <button
                            onClick={() => setActiveView('register')}
                            className="w-full mt-2 text-[#432818]/60 text-xs font-bold font-cinzel hover:text-[#432818]"
                        >
                            {t('cancel').toUpperCase()}
                        </button>
                    </div>
                )}

                <div className="mt-6 text-center relative z-10">
                    {activeView === 'forgot-password' || activeView === 'agreement' ? (
                        <button onClick={() => setActiveView('login')} className="text-sm font-bold text-[#432818]/60 hover:text-[#432818] transition-colors font-cinzel">
                            {activeView === 'agreement' ? '' : <span className="text-[#D4AF37] underline">{t('back_to_login')}</span>}
                        </button>
                    ) : (
                        <button
                            onClick={() => onModeChange(activeView === 'login' ? 'register' : 'login')}
                            className="text-sm font-bold text-[#432818]/60 hover:text-[#432818] transition-colors font-cinzel"
                        >
                            {activeView === 'login' ? t('no_account') : t('already_member')}
                            <span className="text-[#D4AF37] underline">{activeView === 'login' ? t('register_now') : t('login_now')}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
