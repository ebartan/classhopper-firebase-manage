const admin = require('firebase-admin');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function getDepartmentsList() {
  try {
    const snapshot = await db.collection('department').get();

    console.log(`\n📊 Toplam ${snapshot.size} bölüm bulundu.\n`);

    // İlk 20 bölümü göster
    console.log('📝 Bölümler:\n');
    snapshot.docs.slice(0, 20).forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. ${data.name || data.bolumAdi || 'İsimsiz'}`);
      if (data.fakulteAdi) {
        console.log(`   Fakülte: ${data.fakulteAdi}`);
      }
      if (data.url) {
        console.log(`   URL: ${data.url}`);
      }
      console.log(`   ID: ${doc.id}`);
      console.log('');
    });

    if (snapshot.size > 20) {
      console.log(`... ve ${snapshot.size - 20} bölüm daha\n`);
    }

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    process.exit();
  }
}

getDepartmentsList();
