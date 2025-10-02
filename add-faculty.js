const admin = require('firebase-admin');

// Service account key'inizi buraya ekleyin
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function addFaculty() {
  try {
    const faculties = [
      "Eğitim Fakültesi",
      "Elektrik-Elektronik Fakültesi",
      "Fen-Edebiyat Fakültesi",
      "Gemi İnşaatı ve Denizcilik Fakültesi",
      "İktisadi ve İdari Bilimler Fakültesi",
      "İnşaat Fakültesi",
      "Kimya-Metalurji Fakültesi",
      "Makine Fakültesi",
      "Mimarlık Fakültesi",
      "Rektörlüğe Bağlı Bölümler",
      "Sanat ve Tasarım Fakültesi",
      "Uygulamalı Bilimler Fakültesi",
      "Yabancı Diller Yüksekokulu"
    ];

    console.log(`${faculties.length} fakülte ekleniyor...`);

    for (const facultyName of faculties) {
      const facultyData = {
        name: facultyName,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await db.collection('faculty').add(facultyData);
      console.log(`✓ ${facultyName} eklendi (ID: ${docRef.id})`);
    }

    console.log('\nTümü başarıyla eklendi!');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    process.exit();
  }
}

addFaculty();
