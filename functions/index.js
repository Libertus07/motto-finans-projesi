/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentUpdated, onDocumentCreated } = require("firebase-functions/v2/firestore");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");

// Admin SDK'yı başlat
admin.initializeApp();
const db = admin.firestore();

// 🛡️ GÜVENLİ PUAN HARCAMA FONKSİYONU
exports.redeemPoints = onCall({ cors: true }, async (request) => {
    // 1. Güvenlik Kontrolü: İstek yapan kullanıcı giriş yapmış mı?
    if (!request.auth) {
        throw new HttpsError(
            'unauthenticated',
            'Bu işlemi gerçekleştirmek için sisteme giriş yapmalısınız.'
        );
    }

    // Frontend'den gelen verileri al
    const { pointsToRedeem, appId, shopId } = request.data;

    // GÜVENLİK: Müşteri ID'sini request.data'dan değil, doğrulanmış auth token'dan alıyoruz.
    const customerId = request.auth.uid;

    // 2. Veri Doğrulama
    if (!pointsToRedeem || !appId || !shopId) {
        throw new HttpsError(
            'invalid-argument',
            'Eksik bilgi: Puan, App ID veya Shop ID gönderilmedi.'
        );
    }

    if (typeof pointsToRedeem !== 'number' || pointsToRedeem <= 0) {
        throw new HttpsError(
            'invalid-argument',
            'Geçersiz puan miktarı.'
        );
    }

    // Firestore Referansı
    // Veri yapınıza uygun yol: artifacts/{appId}/shops/{shopId}/customers/{customerId}
    const customerRef = db.doc(`artifacts/${appId}/shops/${shopId}/customers/${customerId}`);

    // 3. Transaction (Atomik İşlem) Başlat
    // Bu blok içindeki işlemler "ya hep ya hiç" mantığıyla çalışır.
    // Puan okuma ve düşme arasında başka bir işlem araya giremez.
    return db.runTransaction(async (transaction) => {
        const customerDoc = await transaction.get(customerRef);

        if (!customerDoc.exists) {
            throw new HttpsError('not-found', 'Müşteri bulunamadı.');
        }

        const userData = customerDoc.data();
        const currentPoints = Number(userData.points) || 0;

        // 4. Bakiye Kontrolü (Backend tarafında kesin doğrulama)
        if (currentPoints < pointsToRedeem) {
            throw new HttpsError(
                'failed-precondition',
                `Yetersiz bakiye. Mevcut: ${currentPoints}, İstenen: ${pointsToRedeem}`
            );
        }

        const newBalance = currentPoints - pointsToRedeem;

        // 5. Güncelleme
        transaction.update(customerRef, {
            points: newBalance,
            lastRedeemDate: new Date().toISOString()
        });

        logger.info(`✅ Puan Harcandı: ${customerId} - ${pointsToRedeem} Puan. Yeni Bakiye: ${newBalance}`);

        return {
            success: true,
            message: 'Puan başarıyla harcandı.',
            previousPoints: currentPoints,
            newPoints: newBalance
        };
    });
});

// 🤝 DAVET SİSTEMİ (REFERRAL) - GÜNCELLENDİ
exports.processInviteReward = onDocumentCreated("artifacts/{appId}/shops/{shopId}/customers/{customerId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const newData = snapshot.data();
    const { appId, shopId } = event.params;

    // Sadece ana uygulama profili (uid içeren) oluşturulduğunda ve davet kodu varsa çalış
    if (!newData.uid || !newData.inviteCode) return;

    const db = admin.firestore();

    // ✨ AYARLARI ÇEK (Dinamik Ödül)
    let referrerReward = 50;
    let refereeReward = 50;

    try {
        const settingsSnap = await db.doc(`artifacts/${appId}/shops/${shopId}/settings/loyalty`).get();
        if (settingsSnap.exists) {
            const s = settingsSnap.data();
            referrerReward = Number(s.referrerReward) || 50;
            refereeReward = Number(s.refereeReward) || Number(s.welcomeBonus) || 50;
        }
    } catch (e) { console.error("Settings fetch error", e); }

    try {
        // 1. Davet Edeni Bul (Invite Code ile sorgula)
        const customersRef = db.collection(`artifacts/${appId}/shops/${shopId}/customers`);
        const referrerQuery = await customersRef.where('personalInviteCode', '==', newData.inviteCode).limit(1).get();

        if (referrerQuery.empty) {
            console.log(`Invalid invite code used: ${newData.inviteCode}`);
            return;
        }

        const referrerDoc = referrerQuery.docs[0];
        const referrerData = referrerDoc.data();

        // Kendini davet etmeyi engelle
        if (referrerDoc.id === newData.uid) return;

        const batch = db.batch();
        const transactionsRef = db.collection(`artifacts/${appId}/shops/${shopId}/transactions`);
        const today = new Date().toLocaleDateString('tr-TR');

        // --- DAVET EDENE PUAN YÜKLE ---
        // Bulunan dökümanı güncelle
        batch.update(referrerDoc.ref, { points: admin.firestore.FieldValue.increment(referrerReward) });

        // Eğer referrer bir telefon numarası ile de kayıtlıysa (POS kaydı) ve biz UID dökümanını bulduysak, POS kaydını da güncelle
        if (referrerData.phone && referrerDoc.id === referrerData.uid) {
            const referrerPosRef = db.doc(`artifacts/${appId}/shops/${shopId}/customers/${referrerData.phone}`);
            batch.update(referrerPosRef, { points: admin.firestore.FieldValue.increment(referrerReward) });
        }
        // Tam tersi durum (nadiren)
        else if (referrerData.uid && referrerDoc.id === referrerData.phone) {
            const referrerUidRef = db.doc(`artifacts/${appId}/shops/${shopId}/customers/${referrerData.uid}`);
            batch.update(referrerUidRef, { points: admin.firestore.FieldValue.increment(referrerReward) });
        }

        // Davet Eden İçin İşlem Kaydı
        const referrerTransRef = transactionsRef.doc();
        batch.set(referrerTransRef, {
            customerPhone: referrerData.phone || '',
            customerId: referrerData.uid || '',
            type: 'gift',
            amount: 0,
            points: referrerReward,
            desc: 'Davet Ödülü (Arkadaşın Katıldı) 🎁',
            date: today,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        // ✨ YENİ: Davet Eden Kişiye Bildirim Gönder (In-App Notification)
        const referrerNotifRef = referrerDoc.ref.collection('notifications').doc();
        batch.set(referrerNotifRef, {
            title: 'Arkadaşın Davetini Kabul Etti! 🥳',
            message: `Tebrikler! Arkadaşın aramıza katıldı ve sana ${referrerReward} Volt kazandırdı.`,
            read: false,
            createdAt: new Date().toISOString(),
            type: 'referral_success'
        });

        // --- YENİ ÜYEYE PUAN YÜKLE ---
        // Uygulama Kaydını Güncelle
        const newUserAppRef = db.doc(`artifacts/${appId}/shops/${shopId}/customers/${newData.uid}`);
        batch.update(newUserAppRef, { points: admin.firestore.FieldValue.increment(refereeReward) });

        // POS Kaydını Güncelle
        if (newData.phone) {
            const newUserPosRef = db.doc(`artifacts/${appId}/shops/${shopId}/customers/${newData.phone}`);
            batch.update(newUserPosRef, { points: admin.firestore.FieldValue.increment(refereeReward) });
        }

        // Yeni Üye İçin İşlem Kaydı
        const newUserTransRef = transactionsRef.doc();
        batch.set(newUserTransRef, {
            customerPhone: newData.phone || '',
            customerId: newData.uid,
            type: 'gift',
            amount: 0,
            points: refereeReward,
            desc: 'Davet ile Katılım Ödülü 🎁',
            date: today,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        await batch.commit();
        console.log(`Invite reward processed. Referrer: ${referrerData.phone}, New User: ${newData.phone}`);

    } catch (error) {
        console.error("Error processing invite reward:", error);
    }
});

// 🔔 MUTFAK BİLDİRİMİ & SİPARİŞ SENKRONİZASYONU
// Masaya (tables koleksiyonuna) yeni sipariş eklendiğinde çalışır.
// Bu siparişleri alır ve merkezi 'orders' koleksiyonuna kopyalar.
// Mutfak ekranı bu 'orders' koleksiyonunu dinleyerek anlık bildirim alır.
exports.propagateOrdersToKitchen = onDocumentUpdated("artifacts/{appId}/shops/{shopId}/tables/{tableId}", async (event) => {
    const beforeData = event.data.before.data();
    const afterData = event.data.after.data();

    // Sipariş dizilerini al
    const oldOrders = beforeData.orders || [];
    const newOrders = afterData.orders || [];

    // Eğer yeni sipariş yoksa işlem yapma
    if (newOrders.length <= oldOrders.length) return;

    // Sadece yeni eklenen siparişleri bul (ID'si eskilerde olmayanlar)
    const addedOrders = newOrders.filter(nOrder =>
        !oldOrders.some(oOrder => oOrder.id === nOrder.id)
    );

    if (addedOrders.length === 0) return;

    const { appId, shopId, tableId } = event.params;
    const batch = db.batch();

    addedOrders.forEach(order => {
        // Merkezi 'orders' koleksiyonuna referans
        const orderRef = db.doc(`artifacts/${appId}/shops/${shopId}/orders/${order.id}`);

        batch.set(orderRef, {
            ...order,
            tableId: tableId,
            tableName: afterData.name || `Masa ${tableId}`, // Masa adını ekle
            serverTimestamp: admin.firestore.FieldValue.serverTimestamp()
        });
    });

    await batch.commit();
    logger.info(`🔥 Mutfak için ${addedOrders.length} yeni sipariş oluşturuldu. Masa: ${tableId}`);
});

// 🎡 GÜVENLİ ÇARK ÇEVİRME (WHEEL OF FATE)
exports.spinWheel = onCall({ cors: true }, async (request) => {
    // 1. Auth Check
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Çarkı çevirmek için giriş yapmalısınız.');
    }

    const { appId, shopId } = request.data;
    const customerId = request.auth.uid;

    if (!appId || !shopId) {
        throw new HttpsError('invalid-argument', 'App ID ve Shop ID gerekli.');
    }

    const customerRef = db.doc(`artifacts/${appId}/shops/${shopId}/customers/${customerId}`);

    return db.runTransaction(async (transaction) => {
        // 1. Kullanıcı Verisini Çek
        const customerDoc = await transaction.get(customerRef);
        if (!customerDoc.exists) {
            throw new HttpsError('not-found', 'Kullanıcı profili bulunamadı.');
        }

        const userData = customerDoc.data();
        // UTC tarih kontrolü (Basit). Yerel saat hassasiyeti gerekirse timezone offset eklenebilir.
        const today = new Date().toISOString().split('T')[0];

        // YÖNETİCİ KONTROLÜ: Admin ise tarih kontrolünü atla
        const isAdmin = userData.role === 'admin' || userData.isAdmin === true;

        if (!isAdmin && userData.lastSpinDate === today) {
            throw new HttpsError('failed-precondition', 'Bugün şansınızı zaten denediniz. Yarın tekrar bekleriz!');
        }

        // 2. Ödül Ayarlarını Çek (Dinamik)
        const settingsRef = db.doc(`artifacts/${appId}/shops/${shopId}/settings/wheel`);
        const settingsDoc = await transaction.get(settingsRef);

        let prizes = [
            { id: 'lose', label: 'Pas', type: 'none', weight: 40, color: '#9E9E9E', icon: 'Frown' },
            { id: 'points_50', label: '50 Volt', type: 'points', value: 50, weight: 30, color: '#4CAF50', icon: 'Zap' },
            { id: 'lose_extra', label: 'Pas', type: 'none', value: 0, weight: 10, color: '#757575', icon: 'Frown' },
            { id: 'points_100', label: '100 Volt', type: 'points', value: 100, weight: 15, color: '#FFC107', icon: 'Zap' },
            { id: 'points_25', label: '25 Volt', type: 'points', value: 25, weight: 5, color: '#2196F3', icon: 'Zap' }
        ];

        if (settingsDoc.exists && settingsDoc.data().prizes && settingsDoc.data().prizes.length > 0) {
            prizes = settingsDoc.data().prizes;
        }

        // 3. Ağırlıklı Rastgele Seçim
        const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
        let random = Math.random() * totalWeight;
        let selectedPrize = prizes[prizes.length - 1]; // Fallback

        for (const prize of prizes) {
            if (random < prize.weight) {
                selectedPrize = prize;
                break;
            }
            random -= prize.weight;
        }

        // 4. Sonuçları İşle ve Veritabanını Güncelle
        const updates = { lastSpinDate: today };

        if (selectedPrize.type === 'points') {
            const currentPoints = Number(userData.points) || 0;
            updates.points = currentPoints + selectedPrize.value;
        }
        // Hediye mantığı buraya eklenebilir (örn: kupon koleksiyonuna ekleme)

        transaction.update(customerRef, updates);

        // 5. İşlem Geçmişine Kayıt (Audit Log)
        // Güvenlik için kimin ne kazandığını kayıt altına alıyoruz.
        const transactionRef = db.collection(`artifacts/${appId}/shops/${shopId}/transactions`).doc();
        transaction.set(transactionRef, {
            customerId: customerId,
            customerPhone: userData.phone || '',
            type: 'game',
            amount: 0,
            points: selectedPrize.type === 'points' ? selectedPrize.value : 0,
            desc: `Çark Ödülü: ${selectedPrize.label} 🎡`,
            date: new Date().toLocaleDateString('tr-TR'),
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        logger.info(`🎡 Çark Sonucu: ${customerId} kazandı: ${selectedPrize.label}`);

        return {
            success: true,
            prize: selectedPrize // Frontend bu bilgiyi alıp animasyonu ilgili dilimde durduracak
        };
    });
});
