const admin = require('firebase-admin');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkDepartmentFacultyRefs() {
  try {
    console.log('Department kayıtlarındaki faculty referansları kontrol ediliyor...\n');

    // Mevcut faculty kayıtlarını al
    const facultiesSnapshot = await db.collection('faculty').get();
    const validFacultyIds = new Set();
    const validFacultyNames = {};

    for (const doc of facultiesSnapshot.docs) {
      validFacultyIds.add(doc.id);
      validFacultyNames[doc.id] = doc.data().name;
    }

    console.log(`✅ Mevcut ${validFacultyIds.size} faculty kaydı bulundu.\n`);

    // Department kayıtlarını kontrol et
    const departmentsSnapshot = await db.collection('department').get();
    console.log(`${departmentsSnapshot.size} department kaydı kontrol ediliyor...\n`);

    let validCount = 0;
    let invalidCount = 0;
    const invalidDepartments = [];
    const facultyAdiBased = [];

    for (const doc of departmentsSnapshot.docs) {
      const departmentData = doc.data();
      const facultyRef = departmentData.facultyRef;
      const fakulteAdi = departmentData.fakulteAdi;

      if (facultyRef) {
        const facultyId = facultyRef.id;

        if (validFacultyIds.has(facultyId)) {
          validCount++;
        } else {
          invalidCount++;
          invalidDepartments.push({
            id: doc.id,
            name: departmentData.name || doc.id,
            facultyId: facultyId,
            fakulteAdi: fakulteAdi
          });
        }
      } else {
        // facultyRef yok ama fakulteAdi var
        if (fakulteAdi) {
          facultyAdiBased.push({
            id: doc.id,
            name: departmentData.name || doc.id,
            fakulteAdi: fakulteAdi
          });
        }
      }
    }

    console.log('=== Sonuçlar ===\n');
    console.log(`✅ Geçerli referans: ${validCount}`);
    console.log(`❌ Geçersiz referans: ${invalidCount}`);
    console.log(`⚠️  facultyRef yok (sadece fakulteAdi var): ${facultyAdiBased.length}\n`);

    if (invalidCount > 0) {
      console.log('--- Geçersiz Referanslar ---\n');
      invalidDepartments.forEach(dept => {
        console.log(`❌ ${dept.name}`);
        console.log(`   Department ID: ${dept.id}`);
        console.log(`   Geçersiz Faculty ID: ${dept.facultyId}`);
        console.log(`   fakulteAdi: ${dept.fakulteAdi}\n`);
      });
    }

    if (facultyAdiBased.length > 0) {
      console.log('--- Sadece fakulteAdi Olan Kayıtlar ---\n');
      facultyAdiBased.forEach(dept => {
        console.log(`⚠️  ${dept.name}`);
        console.log(`   Department ID: ${dept.id}`);
        console.log(`   fakulteAdi: ${dept.fakulteAdi}\n`);
      });
    }

    if (invalidCount > 0 || facultyAdiBased.length > 0) {
      console.log('⚠️  Bu kayıtlar güncellenmeli!');
    } else {
      console.log('✅ Tüm department kayıtları geçerli faculty referanslarına sahip!');
    }

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    process.exit();
  }
}

checkDepartmentFacultyRefs();
