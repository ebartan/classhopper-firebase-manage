const admin = require('firebase-admin');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function linkFacultyToCampus() {
  try {
    console.log('Faculty kayıtları kampüslerle eşleştiriliyor...\n');

    // Kampüsleri bul
    const campusSnapshot = await db.collection('campus').get();

    let davutpasaRef = null;
    let yildizRef = null;

    for (const doc of campusSnapshot.docs) {
      const campusData = doc.data();
      if (campusData.name === 'Davutpaşa Kampüsü') {
        davutpasaRef = db.collection('campus').doc(doc.id);
        console.log(`✓ Davutpaşa Kampüsü bulundu (ID: ${doc.id})`);
      } else if (campusData.name === 'Yıldız Kampüsü') {
        yildizRef = db.collection('campus').doc(doc.id);
        console.log(`✓ Yıldız Kampüsü bulundu (ID: ${doc.id})`);
      }
    }

    if (!davutpasaRef || !yildizRef) {
      console.log('Kampüsler bulunamadı!');
      return;
    }

    // Kampüs-Fakülte eşleştirmesi
    const campusMapping = {
      'Davutpaşa Kampüsü': [
        'Eğitim Fakültesi',
        'Elektrik-Elektronik Fakültesi',
        'Fen-Edebiyat Fakültesi',
        'İktisadi ve İdari Bilimler Fakültesi',
        'İnşaat Fakültesi',
        'Kimya-Metalurji Fakültesi',
        'Sanat ve Tasarım Fakültesi'
      ],
      'Yıldız Kampüsü': [
        'Gemi İnşaatı ve Denizcilik Fakültesi',
        'Makine Fakültesi',
        'Mimarlık Fakültesi'
      ]
    };

    console.log('\n--- Davutpaşa Kampüsü Fakülteleri ---\n');

    // Davutpaşa fakültelerini güncelle
    const davutpasaBatch = db.batch();
    let davutpasaCount = 0;

    for (const facultyName of campusMapping['Davutpaşa Kampüsü']) {
      const facultySnapshot = await db.collection('faculty')
        .where('name', '==', facultyName)
        .get();

      if (!facultySnapshot.empty) {
        for (const doc of facultySnapshot.docs) {
          davutpasaBatch.update(doc.ref, {
            campusRef: davutpasaRef,
            kampusAdi: 'Davutpaşa Kampüsü',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          console.log(`✓ ${facultyName} → Davutpaşa Kampüsü`);
          davutpasaCount++;
        }
      } else {
        console.log(`✗ ${facultyName} bulunamadı`);
      }
    }

    await davutpasaBatch.commit();
    console.log(`\n✓ ${davutpasaCount} fakülte Davutpaşa Kampüsü'ne bağlandı.\n`);

    console.log('--- Yıldız Kampüsü Fakülteleri ---\n');

    // Yıldız fakültelerini güncelle
    const yildizBatch = db.batch();
    let yildizCount = 0;

    for (const facultyName of campusMapping['Yıldız Kampüsü']) {
      const facultySnapshot = await db.collection('faculty')
        .where('name', '==', facultyName)
        .get();

      if (!facultySnapshot.empty) {
        for (const doc of facultySnapshot.docs) {
          yildizBatch.update(doc.ref, {
            campusRef: yildizRef,
            kampusAdi: 'Yıldız Kampüsü',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          console.log(`✓ ${facultyName} → Yıldız Kampüsü`);
          yildizCount++;
        }
      } else {
        console.log(`✗ ${facultyName} bulunamadı`);
      }
    }

    await yildizBatch.commit();
    console.log(`\n✓ ${yildizCount} fakülte Yıldız Kampüsü'ne bağlandı.\n`);

    console.log('=== Özet ===');
    console.log(`✓ Davutpaşa Kampüsü: ${davutpasaCount} fakülte`);
    console.log(`✓ Yıldız Kampüsü: ${yildizCount} fakülte`);
    console.log(`✓ Toplam: ${davutpasaCount + yildizCount} fakülte kampüslere bağlandı`);

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    process.exit();
  }
}

linkFacultyToCampus();
