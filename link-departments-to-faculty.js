const admin = require('firebase-admin');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function linkDepartmentsToFaculty() {
  try {
    console.log('1. Faculty kayıtları ekleniyor...\n');

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

    // Faculty kayıtlarını ekle ve ID'lerini map'te sakla
    const facultyMap = {};

    for (const facultyName of faculties) {
      const facultyData = {
        name: facultyName,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await db.collection('faculty').add(facultyData);
      facultyMap[facultyName] = docRef.id;
      console.log(`✓ ${facultyName} eklendi (ID: ${docRef.id})`);
    }

    console.log('\n2. Department kayıtları okunuyor...\n');

    // Tüm department kayıtlarını oku
    const departmentsSnapshot = await db.collection('department').get();

    if (departmentsSnapshot.empty) {
      console.log('Department tablosunda kayıt bulunamadı!');
      return;
    }

    console.log(`${departmentsSnapshot.size} department kaydı bulundu.\n`);
    console.log('3. Faculty ilişkilendirmeleri yapılıyor...\n');

    let updateCount = 0;
    let notFoundCount = 0;

    // Her department için faculty referansı ekle
    const batch = db.batch();

    for (const doc of departmentsSnapshot.docs) {
      const departmentData = doc.data();
      const fakulteAdi = departmentData.fakulteAdi;

      if (fakulteAdi && facultyMap[fakulteAdi]) {
        const facultyRef = db.collection('faculty').doc(facultyMap[fakulteAdi]);
        batch.update(doc.ref, {
          facultyRef: facultyRef,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✓ ${departmentData.name || doc.id} → ${fakulteAdi}`);
        updateCount++;
      } else {
        console.log(`✗ ${departmentData.name || doc.id} → Fakülte bulunamadı: "${fakulteAdi}"`);
        notFoundCount++;
      }
    }

    await batch.commit();

    console.log('\n=== Özet ===');
    console.log(`✓ Başarılı: ${updateCount}`);
    console.log(`✗ Eşleşmeyen: ${notFoundCount}`);
    console.log('\nİşlem tamamlandı!');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    process.exit();
  }
}

linkDepartmentsToFaculty();
