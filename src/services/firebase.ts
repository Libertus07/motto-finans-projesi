// services/firebase.ts

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import {
    initializeFirestore,
    getFirestore,
    Firestore,
    persistentLocalCache,
    persistentMultipleTabManager,
    CACHE_SIZE_UNLIMITED
} from 'firebase/firestore';
import { getFunctions, httpsCallable, Functions } from 'firebase/functions';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const API_KEY_ENV = import.meta.env.VITE_FIREBASE_API_KEY;
const APP_ID_ENV = import.meta.env.VITE_FIREBASE_APP_ID;

if (!API_KEY_ENV || !APP_ID_ENV) {
    const missing: string[] = [];
    if (!API_KEY_ENV) missing.push("VITE_FIREBASE_API_KEY");
    if (!APP_ID_ENV) missing.push("VITE_FIREBASE_APP_ID");
    throw new Error(`❌ Kritik Hata: Firebase ortam değişkenleri eksik: ${missing.join(", ")}! Lütfen .env dosyasını kontrol edin.`);
}

const config = {
    apiKey: API_KEY_ENV,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: APP_ID_ENV,
};

const cleanedApiKey = String(config.apiKey).replace(/[\"',]/g, '').trim();
const finalConfig = { ...config, apiKey: cleanedApiKey };

// --- BAŞLATMA MANTIĞI (Singleton Pattern) ---
// Eğer uygulama daha önce başlatıldıysa onu kullan, yoksa yenisini yarat.
const app: FirebaseApp = !getApps().length ? initializeApp(finalConfig) : getApp();

const auth: Auth = getAuth(app);
const storage: FirebaseStorage = getStorage(app);
const functions: Functions = getFunctions(app);

// Firestore Başlatma
let db: Firestore;
try {
    // İlk deneme: Offline Persistence ile başlat
    db = initializeFirestore(app, {
        localCache: persistentLocalCache({
            cacheSizeBytes: CACHE_SIZE_UNLIMITED,
            tabManager: persistentMultipleTabManager()
        })
    });
    console.log("✅ Firebase: Offline mod aktif.");
} catch (e: any) {
    // Hata yakalama: Eğer "zaten başlatıldı" hatasıysa, var olanı kullan.
    if (e.code === 'failed-precondition' || e.message?.includes('already been called')) {
        db = getFirestore(app);
        console.log("ℹ️ Firebase: Mevcut bağlantı kullanılıyor.");
    } else {
        console.error("❌ Firebase Hatası:", e);
        db = getFirestore(app); // Her durumda bir db örneği döndür
    }
}

export { auth, db, storage, functions, httpsCallable };
export const appId: string = finalConfig.projectId || '';
