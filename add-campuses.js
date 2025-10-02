const admin = require('firebase-admin');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function addCampuses() {
  try {
    console.log('Kampüsler ekleniyor...\n');

    // University'yi bul
    const universitySnapshot = await db.collection('university')
      .where('name', '==', 'Yıldız Teknik Üniversitesi')
      .limit(1)
      .get();

    if (universitySnapshot.empty) {
      console.log('University bulunamadı!');
      return;
    }

    const universityDoc = universitySnapshot.docs[0];
    const universityRef = db.collection('university').doc(universityDoc.id);

    // Kampüsler
    const campuses = [
      {
        name: 'Davutpaşa Kampüsü',
        district: 'Esenler',
        city: 'İstanbul',
        universityRef: universityRef,
        universiteAdi: 'Yıldız Teknik Üniversitesi',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        name: 'Yıldız Kampüsü',
        district: 'Beşiktaş',
        city: 'İstanbul',
        universityRef: universityRef,
        universiteAdi: 'Yıldız Teknik Üniversitesi',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    console.log(`${campuses.length} kampüs ekleniyor...\n`);

    for (const campus of campuses) {
      const docRef = await db.collection('campus').add(campus);
      console.log(`✓ ${campus.name} eklendi (ID: ${docRef.id})`);
      console.log(`  📍 ${campus.district}, ${campus.city}`);
    }

    console.log('\n✓ Tüm kampüsler başarıyla eklendi!');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    process.exit();
  }
}

addCampuses();
