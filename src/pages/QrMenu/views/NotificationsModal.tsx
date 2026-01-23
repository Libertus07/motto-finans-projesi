import React from 'react';
import { X, Bell, Loader2 } from 'lucide-react';
import { Notification } from '../../../types';

interface NotificationsModalProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
    isLoadingNotifications: boolean;
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose, notifications, isLoadingNotifications }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
            <div className="bg-[#FDFBF7] w-full max-w-md rounded-[2rem] relative shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh] overflow-hidden">
                <div className="p-6 border-b border-[#432818]/5 flex justify-between items-center bg-white">
                    <h2 className="text-xl font-black text-[#432818] tracking-tight">Duyurular</h2>
                    <button onClick={onClose} className="p-2 hover:bg-[#FDFBF7] rounded-full text-[#432818]/60 transition-all"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
                    {isLoadingNotifications ? (
                        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#432818]/40" size={32} /></div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-12">
                            <Bell size={40} className="mx-auto text-[#432818]/10 mb-3" />
                            <p className="text-[#432818]/40 font-bold text-sm">Henüz bildiriminiz yok.</p>
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div key={notif.id} className={`bg-white p-4 rounded-2xl border transition-all ${!notif.read ? 'border-[#432818]/20 shadow-sm' : 'border-[#432818]/5 opacity-80'}`}>
                                <div className="flex gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${!notif.read ? 'bg-[#432818]/10 text-[#432818]' : 'bg-[#FDFBF7] text-[#432818]/20'}`}>
                                        <Bell size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-[#432818] text-sm leading-tight">{notif.title}</h3>
                                            {!notif.read && <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5"></div>}
                                        </div>
                                        <p className="text-xs text-[#432818]/60 leading-relaxed mb-2">{notif.message}</p>
                                        <span className="text-[9px] text-[#432818]/30 font-bold uppercase tracking-wider block">
                                            {new Date(notif.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationsModal;