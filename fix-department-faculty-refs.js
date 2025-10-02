const admin = require('firebase-admin');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixDepartmentFacultyRefs() {
  try {
    console.log('Department kayıtlarındaki geçersiz faculty referansları düzeltiliyor...\n');

    // Mevcut faculty kayıtlarını al ve name -> ID map'i oluştur
    const facultiesSnapshot = await db.collection('faculty').get();
    const facultyMap = {};

    for (const doc of facultiesSnapshot.docs) {
      const name = doc.data().name;
      facultyMap[name] = {
        id: doc.id,
        ref: db.collection('faculty').doc(doc.id)
      };
    }

    console.log(`✅ ${Object.keys(facultyMap).size} faculty kaydı bulundu:\n`);
    Object.keys(facultyMap).forEach(name => {
      console.log(`   - ${name}`);
    });

    // Department kayıtlarını kontrol et ve geçersizleri düzelt
    const departmentsSnapshot = await db.collection('department').get();
    console.log(`\n${departmentsSnapshot.size} department kaydı kontrol ediliyor...\n`);

    const batch = db.batch();
    let fixedCount = 0;
    let deletedCount = 0;
    let validCount = 0;

    for (const doc of departmentsSnapshot.docs) {
      const departmentData = doc.data();
      const facultyRef = departmentData.facultyRef;
      const fakulteAdi = departmentData.fakulteAdi;

      if (!facultyRef || !facultyMap[fakulteAdi]) {
        // facultyRef yok veya fakulteAdi geçerli bir fakülteye ait değil
        if (fakulteAdi && !facultyMap[fakulteAdi]) {
          // Resmi listede olmayan fakülteye ait department, sil
          batch.delete(doc.ref);
          console.log(`❌ ${departmentData.name || doc.id} siliniyor (fakulteAdi: ${fakulteAdi})`);
          deletedCount++;
        }
      } else {
        const facultyId = facultyRef.id;
        const correctFacultyId = facultyMap[fakulteAdi]?.id;

        if (facultyId !== correctFacultyId) {
          // Geçersiz referans, düzelt
          batch.update(doc.ref, {
            facultyRef: facultyMap[fakulteAdi].ref,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          console.log(`🔧 ${departmentData.name || doc.id} düzeltiliyor`);
          console.log(`   Eski: ${facultyId} → Yeni: ${correctFacultyId} (${fakulteAdi})`);
          fixedCount++;
        } else {
          validCount++;
        }
      }
    }

    await batch.commit();

    console.log('\n=== Özet ===');
    console.log(`✅ Geçerli kayıt: ${validCount}`);
    console.log(`🔧 Düzeltilen kayıt: ${fixedCount}`);
    console.log(`❌ Silinen kayıt: ${deletedCount}`);
    console.log('\nGüncelleme tamamlandı!');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    process.exit();
  }
}

fixDepartmentFacultyRefs();
