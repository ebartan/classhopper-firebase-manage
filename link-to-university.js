const admin = require('firebase-admin');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function linkToUniversity() {
  try {
    console.log('University referansları ekleniyor...\n');

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
    console.log(`University bulundu: ${universityDoc.data().name} (ID: ${universityDoc.id})\n`);

    // 1. Faculty koleksiyonunu güncelle
    console.log('1. Faculty koleksiyonu güncelleniyor...\n');
    const facultiesSnapshot = await db.collection('faculty').get();

    const facultyBatch = db.batch();
    let facultyCount = 0;

    for (const doc of facultiesSnapshot.docs) {
      facultyBatch.update(doc.ref, {
        universityRef: universityRef,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✓ ${doc.data().name} - university referansı eklendi`);
      facultyCount++;
    }

    await facultyBatch.commit();
    console.log(`\n✓ ${facultyCount} faculty kaydına university referansı eklendi.\n`);

    // 2. Department koleksiyonunu güncelle
    console.log('2. Department koleksiyonu güncelleniyor...\n');
    const departmentsSnapshot = await db.collection('department').get();

    const departmentBatch = db.batch();
    let departmentCount = 0;

    for (const doc of departmentsSnapshot.docs) {
      departmentBatch.update(doc.ref, {
        universityRef: universityRef,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✓ ${doc.data().name || doc.id} - university referansı eklendi`);
      departmentCount++;
    }

    await departmentBatch.commit();
    console.log(`\n✓ ${departmentCount} department kaydına university referansı eklendi.\n`);

    console.log('=== Özet ===');
    console.log(`University: ${universityDoc.data().name}`);
    console.log(`✓ Faculty: ${facultyCount} kayıt`);
    console.log(`✓ Department: ${departmentCount} kayıt`);
    console.log('\nTüm ilişkilendirmeler tamamlandı!');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    process.exit();
  }
}

linkToUniversity();
