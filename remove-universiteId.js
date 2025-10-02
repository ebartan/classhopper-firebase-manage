const admin = require('firebase-admin');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function removeUniversiteId() {
  try {
    console.log('Department kayıtlarından universiteId field\'ı kaldırılıyor...\n');

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

      if (departmentData.universiteId !== undefined) {
        batch.update(doc.ref, {
          universiteId: admin.firestore.FieldValue.delete()
        });
        console.log(`✓ ${departmentData.name || doc.id} - universiteId kaldırıldı`);
        removeCount++;
      } else {
        console.log(`- ${departmentData.name || doc.id} - zaten universiteId yok`);
      }
    }

    if (removeCount > 0) {
      await batch.commit();
      console.log(`\n✓ ${removeCount} kayıttan universiteId field'ı kaldırıldı.`);
    } else {
      console.log('\nHiçbir kayıtta universiteId field\'ı bulunamadı.');
    }

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    process.exit();
  }
}

removeUniversiteId();
