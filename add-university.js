const admin = require('firebase-admin');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function addUniversity() {
  try {
    // Üniversite verisi
    const universityData = {
      name: 'Yıldız Teknik Üniversitesi',
      shortName: 'YTÜ',
      city: 'İstanbul',
      country: 'Türkiye',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('university').add(universityData);
    console.log(`✓ ${universityData.name} eklendi (ID: ${docRef.id})`);

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    process.exit();
  }
}

addUniversity();
