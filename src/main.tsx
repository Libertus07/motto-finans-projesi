import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
const init = async () => {
    const rootEl = document.getElementById('root');
    if (!rootEl) {
        console.error("Root element not found");
        return;
    }

    const root = createRoot(rootEl);

    try {
        // Dynamic import enables catching errors in dependencies (like firebase.js)
        const appModule = await import('./App');
        const App = appModule.default;

        root.render(
            <StrictMode>
                <App />
            </StrictMode>,
        );
        console.log("✅ React Mounted Successfully");
    } catch (error) {
        console.error("💥 Critical Startup Error:", error);

        // Show a user-friendly error screen
        root.render(
            <div style={{
                height: '100vh',
                backgroundColor: '#1a110d',
                color: '#D4AF37',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'sans-serif',
                padding: '20px',
                textAlign: 'center'
            }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️ Başlatma Hatası</h1>
                <p style={{ marginBottom: '2rem', color: '#FDFBF7' }}>Uygulama yüklenirken kritik bir hata oluştu.</p>
                <div style={{
                    backgroundColor: 'rgba(255,0,0,0.1)',
                    border: '1px solid rgba(255,0,0,0.3)',
                    padding: '1.5rem',
                    borderRadius: '0.5rem',
                    color: '#ff6b6b',
                    maxWidth: '600px',
                    overflow: 'auto'
                }}>
                    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.875rem' }}>
                        {error instanceof Error ? error.message : String(error)}
                    </pre>
                </div>
                <p style={{ marginTop: '2rem', fontSize: '0.875rem', opacity: 0.7 }}>
                    İpucu: <code style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>.env</code> dosyası eksik veya hatalı olabilir.
                </p>
            </div>
        );
    }
};

init();
