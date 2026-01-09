// services/firebase.js

import { initializeApp, getApps, getApp } from 'firebase/app'; // getApps eklendi
import { getAuth } from 'firebase/auth';
import { 
    initializeFirestore, 
    getFirestore, 
    persistentLocalCache, 
    persistentMultipleTabManager,
    CACHE_SIZE_UNLIMITED 
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Yapılandırma
const FALLBACK_CONFIG_RAW = {
    apiKey: "AIzaSyC7dD3PwBEsaGyYLEG6wUqccMgY8IH4kmM", 
    authDomain: "mottocoffee-app.firebaseapp.com",
    projectId: "mottocoffee-app",
    storageBucket: "mottocoffee-app.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcde12345",
};

const API_KEY_ENV = import.meta.env.VITE_FIREBASE_API_KEY;
const APP_ID_ENV = import.meta.env.VITE_FIREBASE_APP_ID;

let config;

if (API_KEY_ENV && APP_ID_ENV) {
    config = {
        apiKey: API_KEY_ENV,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: APP_ID_ENV,
    };
} else {
    config = FALLBACK_CONFIG_RAW;
}

const cleanedApiKey = String(config.apiKey).replace(/["',]/g, '').trim();
const finalConfig = { ...config, apiKey: cleanedApiKey };

// --- BAŞLATMA MANTIĞI (Singleton Pattern) ---
// Eğer uygulama daha önce başlatıldıysa onu kullan, yoksa yenisini yarat.
const app = !getApps().length ? initializeApp(finalConfig) : getApp();

const auth = getAuth(app);
const storage = getStorage(app);

// Firestore Başlatma
let db;
try {
    // İlk deneme: Offline Persistence ile başlat
    db = initializeFirestore(app, {
        localCache: persistentLocalCache({
            cacheSizeBytes: CACHE_SIZE_UNLIMITED,
            tabManager: persistentMultipleTabManager()
        })
    });
    console.log("✅ Firebase: Offline mod aktif.");
} catch (e) {
    // Hata yakalama: Eğer "zaten başlatıldı" hatasıysa, var olanı kullan.
    if (e.code === 'failed-precondition' || e.message.includes('already been called')) {
        db = getFirestore(app);
        console.log("ℹ️ Firebase: Mevcut bağlantı kullanılıyor.");
    } else {
        console.error("❌ Firebase Hatası:", e);
        db = getFirestore(app); // Her durumda bir db örneği döndür
    }
}

export { auth, db, storage };
export const appId = finalConfig.appId;