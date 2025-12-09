import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ⚠️ Not: Bu değerler, local test için hardcoded olarak kullanılmaktadır.
const firebaseConfig = {
  apiKey: "AIzaSyC7dD3PwBEsaGyYLEG6wUqccMgY8IH4kmM",
  authDomain: "mottocoffee-app.firebaseapp.com",
  projectId: "mottocoffee-app",
  storageBucket: "mottocoffee-app.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcde12345",
  measurementId: "G-ABCDEF1234",
};

// Bağlantıyı başlat
const app = initializeApp(firebaseConfig);

// Dışarıya aktar
export const auth = getAuth(app);
export const db = getFirestore(app);

// ✅ DÜZELTME: appId'yi doğrudan config objesinden alıyoruz.
// Bu, App.jsx dosyasındaki Firebase yolunun doğru kurulmasını sağlar.
export const appId = firebaseConfig.appId;