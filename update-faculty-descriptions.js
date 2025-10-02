const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function updateFacultyDescriptions() {
  try {
    // JSON dosyasından fakülte verilerini al
    const jsonData = JSON.parse(fs.readFileSync('faculty-cleaned-data.json', 'utf8'));

    console.log('Fakültelere açıklama ekleniyor...\n');

    let updateCount = 0;
    let notFoundCount = 0;

    for (const facultyData of jsonData) {
      // Fakülteyi isme göre bul
      const facultySnapshot = await db.collection('faculty')
        .where('name', '==', facultyData.faculty)
        .limit(1)
        .get();

      if (facultySnapshot.empty) {
        console.log(`✗ ${facultyData.faculty} - Firebase'de bulunamadı`);
        notFoundCount++;
        continue;
      }

      const facultyDoc = facultySnapshot.docs[0];

      // Açıklamayı ekle
      await facultyDoc.ref.update({
        description: facultyData.text,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`✓ ${facultyData.faculty}`);
      console.log(`  Açıklama uzunluğu: ${facultyData.text.length} karakter\n`);
      updateCount++;
    }

    console.log(`\n=== ÖZET ===`);
    console.log(`✓ ${updateCount} fakülteye açıklama eklendi`);
    if (notFoundCount > 0) {
      console.log(`✗ ${notFoundCount} fakülte bulunamadı`);
    }

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    process.exit();
  }
}

updateFacultyDescriptions();
