const admin = require('firebase-admin');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function addUniversiteAdiToFaculty() {
  try {
    console.log('Faculty koleksiyonuna universiteAdi field\'ı ekleniyor...\n');

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
    const universityName = universityDoc.data().name;
    console.log(`University: ${universityName}\n`);

    // Tüm faculty kayıtlarını güncelle
    const facultiesSnapshot = await db.collection('faculty').get();

    if (facultiesSnapshot.empty) {
      console.log('Faculty tablosunda kayıt bulunamadı!');
      return;
    }

    console.log(`${facultiesSnapshot.size} faculty kaydı bulundu.\n`);

    const batch = db.batch();
    let updateCount = 0;

    for (const doc of facultiesSnapshot.docs) {
      batch.update(doc.ref, {
        universiteAdi: universityName,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✓ ${doc.data().name} - universiteAdi eklendi`);
      updateCount++;
    }

    await batch.commit();
    console.log(`\n✓ ${updateCount} faculty kaydına universiteAdi field'ı eklendi.`);

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    process.exit();
  }
}

addUniversiteAdiToFaculty();
