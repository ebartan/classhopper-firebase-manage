const admin = require('firebase-admin');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function getDepartmentsCount() {
  try {
    const snapshot = await db.collection('departments').get();

    console.log(`\n📊 Toplam ${snapshot.size} bölüm bulundu.\n`);

    // İlk 10 bölümü göster
    console.log('📝 İlk 10 bölüm:');
    snapshot.docs.slice(0, 10).forEach((doc, index) => {
      const data = doc.data();
      console.log(`   ${index + 1}. ${data.name || data.bolumAdi || 'İsimsiz'} (ID: ${doc.id})`);
      if (data.fakulteAdi) {
        console.log(`      Fakülte: ${data.fakulteAdi}`);
      }
    });

    console.log(`\n   ... ve ${snapshot.size - 10} bölüm daha\n`);

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    process.exit();
  }
}

getDepartmentsCount();
