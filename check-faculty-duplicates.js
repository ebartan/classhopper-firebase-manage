const admin = require('firebase-admin');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkFacultyDuplicates() {
  try {
    console.log('Faculty kayıtları kontrol ediliyor...\n');

    // Sitedeki resmi fakülteler
    const officialFaculties = [
      'Eğitim Fakültesi',
      'Elektrik-Elektronik Fakültesi',
      'Fen-Edebiyat Fakültesi',
      'Gemi İnşaatı ve Denizcilik Fakültesi',
      'İktisadi ve İdari Bilimler Fakültesi',
      'İnşaat Fakültesi',
      'Kimya-Metalurji Fakültesi',
      'Makine Fakültesi',
      'Mimarlık Fakültesi',
      'Sanat ve Tasarım Fakültesi'
    ];

    const facultiesSnapshot = await db.collection('faculty').get();
    console.log(`Toplam ${facultiesSnapshot.size} faculty kaydı bulundu.\n`);

    const facultyGroups = {};

    // Fakülteleri grupla
    for (const doc of facultiesSnapshot.docs) {
      const facultyData = doc.data();
      const name = facultyData.name;

      if (!facultyGroups[name]) {
        facultyGroups[name] = [];
      }
      facultyGroups[name].push({
        id: doc.id,
        data: facultyData
      });
    }

    console.log('=== Fakülte Listesi ===\n');

    // Her fakülteyi göster
    for (const [name, docs] of Object.entries(facultyGroups)) {
      const isOfficial = officialFaculties.includes(name);
      const isDuplicate = docs.length > 1;

      if (!isOfficial) {
        console.log(`❌ ${name} (${docs.length} kayıt) - RESMİ LİSTEDE YOK`);
      } else if (isDuplicate) {
        console.log(`⚠️  ${name} (${docs.length} kayıt) - DUPLICATE`);
      } else {
        console.log(`✅ ${name} (${docs.length} kayıt)`);
      }

      // ID'leri göster
      docs.forEach((doc, index) => {
        console.log(`   ${index + 1}. ID: ${doc.id}`);
      });
      console.log('');
    }

    console.log('\n=== Özet ===');
    console.log(`Toplam farklı fakülte: ${Object.keys(facultyGroups).length}`);
    console.log(`Resmi fakülte sayısı: ${officialFaculties.length}`);

    const duplicates = Object.entries(facultyGroups).filter(([_, docs]) => docs.length > 1);
    console.log(`Duplicate olan: ${duplicates.length}`);

    const notOfficial = Object.keys(facultyGroups).filter(name => !officialFaculties.includes(name));
    console.log(`Resmi listede olmayan: ${notOfficial.length}`);
    console.log(`  → ${notOfficial.join(', ')}`);

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    process.exit();
  }
}

checkFacultyDuplicates();
