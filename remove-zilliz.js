const admin = require('firebase-admin');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function removeZilliz() {
  try {
    console.log('Department kayıtlarından zilliz field\'ı kaldırılıyor...\n');

    // Tüm department kayıtlarını oku
    const departmentsSnapshot = await db.collection('department').get();

    if (departmentsSnapshot.empty) {
      console.log('Department tablosunda kayıt bulunamadı!');
      return;
    }

    console.log(`${departmentsSnapshot.size} department kaydı bulundu.\n`);

    const batch = db.batch();
    let removeCount = 0;

    for (const doc of departmentsSnapshot.docs) {
      const departmentData = doc.data();

      if (departmentData.zilliz !== undefined) {
        batch.update(doc.ref, {
          zilliz: admin.firestore.FieldValue.delete()
        });
        console.log(`✓ ${departmentData.name || doc.id} - zilliz kaldırıldı`);
        removeCount++;
      } else {
        console.log(`- ${departmentData.name || doc.id} - zaten zilliz yok`);
      }
    }

    if (removeCount > 0) {
      await batch.commit();
      console.log(`\n✓ ${removeCount} kayıttan zilliz field'ı kaldırıldı.`);
    } else {
      console.log('\nHiçbir kayıtta zilliz field\'ı bulunamadı.');
    }

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    process.exit();
  }
}

removeZilliz();
