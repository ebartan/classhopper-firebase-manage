const admin = require('firebase-admin');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function removeMongoFields() {
  try {
    console.log('Department kayıtlarından MongoDB referansları kaldırılıyor...\n');

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
      const fieldsToRemove = {};

      // Hangi field'lar mevcut kontrol et
      if (departmentData.id !== undefined) {
        fieldsToRemove.id = admin.firestore.FieldValue.delete();
      }
      if (departmentData.oid !== undefined) {
        fieldsToRemove.oid = admin.firestore.FieldValue.delete();
      }

      if (Object.keys(fieldsToRemove).length > 0) {
        batch.update(doc.ref, fieldsToRemove);
        const removedFields = Object.keys(fieldsToRemove).join(', ');
        console.log(`✓ ${departmentData.name || doc.id} - kaldırılan: ${removedFields}`);
        removeCount++;
      } else {
        console.log(`- ${departmentData.name || doc.id} - zaten MongoDB field'ları yok`);
      }
    }

    if (removeCount > 0) {
      await batch.commit();
      console.log(`\n✓ ${removeCount} kayıttan MongoDB field'ları kaldırıldı.`);
    } else {
      console.log('\nHiçbir kayıtta MongoDB field\'ı bulunamadı.');
    }

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    process.exit();
  }
}

removeMongoFields();
