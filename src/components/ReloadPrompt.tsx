import { useRegisterSW } from 'virtual:pwa-register/react';

function ReloadPrompt() {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r: any) {
            console.log('SW Registered: ' + r);
        },
        onRegisterError(error: any) {
            console.log('SW registration error', error);
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    return (
        <div className="ReloadPrompt-container">
            {(offlineReady || needRefresh) && (
                <div className="fixed bottom-0 right-0 m-4 p-4 bg-[#333] text-white rounded-lg shadow-lg z-[100] border border-[#444] animate-in slide-in-from-bottom duration-300">
                    <div className="mb-2 text-sm">
                        {offlineReady
                            ? 'Uygulama çevrimdışı çalışmaya hazır!'
                            : 'Yeni içerik mevcut, güncellemek için tıklayın.'}
                    </div>
                    <div className="flex gap-2">
                        {needRefresh && (
                            <button
                                className="px-3 py-1 bg-[#D4AF37] text-black rounded text-sm font-bold hover:bg-[#bfa030] transition-colors"
                                onClick={() => updateServiceWorker(true)}
                            >
                                Yenile
                            </button>
                        )}
                        <button
                            className="px-3 py-1 border border-white/20 rounded text-sm hover:bg-white/10 transition-colors"
                            onClick={close}
                        >
                            Kapat
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReloadPrompt;
