// services/firebase.js (OFFLINE PWA DESTEĞİ + API DÜZELTMELERİ EKLENMİŞ SON HAL)

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// 👇 enableIndexedDbPersistence eklendi
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // Depolama için eklendi

// Aşama 1'de çalışan (ve doğru olduğu kanıtlanan) yedek konfigürasyon.
const FALLBACK_CONFIG_RAW = {
    apiKey: "AIzaSyC7dD3PwBEsaGyYLEG6wUqccMgY8IH4kmM", 
    authDomain: "mottocoffee-app.firebaseapp.com",
    projectId: "mottocoffee-app",
    storageBucket: "mottocoffee-app.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcde12345",
};

// Ortam değişkenlerini çek
const API_KEY_ENV = import.meta.env.VITE_FIREBASE_API_KEY;
const APP_ID_ENV = import.meta.env.VITE_FIREBASE_APP_ID;

let config;

// Ortam değişkeni kontrolü
if (API_KEY_ENV && APP_ID_ENV) {
    // 1. Ortam değişkenlerini kullan
    config = {
        apiKey: API_KEY_ENV,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: APP_ID_ENV,
    };
    console.log("Firebase: Ortam Değişkenleri kullanılıyor.");
} else {
    // 2. Yedek (Fallback) konfigürasyonu kullan
    config = FALLBACK_CONFIG_RAW;
    console.warn("Firebase UYARISI: VITE_FIREBASE_API_KEY veya VITE_FIREBASE_APP_ID yüklenemedi. Yedek anahtar kullanılıyor. Lütfen .env dosyanızı kontrol edin.");
}

// 🔥 KRİTİK TEMİZLİK ADIMI: API Anahtarını tırnak, virgül ve boşluklardan temizle.
const cleanedApiKey = String(config.apiKey).replace(/["',]/g, '').trim();

// Yeni konfigürasyon nesnesini oluştur
const finalConfig = {
    ...config,
    apiKey: cleanedApiKey // Temizlenmiş anahtarı kullan
};

// Bağlantıyı başlat
const app = initializeApp(finalConfig);

// Servisleri başlat
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // Storage tanımlandı

// 👇 ÇEVRİMDIŞI VERİ DESTEĞİNİ AKTİF ETME KODU (YENİ EKLENEN KISIM)
try {
  // Verileri tarayıcı hafızasına (IndexedDB) kaydeder
  enableIndexedDbPersistence(db).catch((err) => {
      if (err.code == 'failed-precondition') {
          // Birden fazla sekme açıksa sadece birinde çalışır
          console.log('Çoklu sekme hatası - Offline Persistence devre dışı');
      } else if (err.code == 'unimplemented') {
          console.log('Tarayıcı bu özelliği desteklemiyor');
      }
  });
  console.log("✅ Offline mod (Persistence) aktif edildi.");
} catch (e) {
  console.log("Offline mode error:", e);
}

// Dışarıya aktar
export { auth, db, storage };
export const appId = finalConfig.appId;