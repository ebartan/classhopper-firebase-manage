const admin = require('firebase-admin');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function cleanFaculty() {
  try {
    console.log('Faculty kayıtları temizleniyor...\n');

    // Resmi fakülteler
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
    const facultyGroups = {};

    // Fakülteleri grupla
    for (const doc of facultiesSnapshot.docs) {
      const facultyData = doc.data();
      const name = facultyData.name;

      if (!facultyGroups[name]) {
        facultyGroups[name] = [];
      }
      facultyGroups[name].push(doc);
    }

    const batch = db.batch();
    let deleteCount = 0;

    console.log('1. Resmi listede olmayan birimler siliniyor...\n');

    // Resmi listede olmayan birimleri sil
    for (const [name, docs] of Object.entries(facultyGroups)) {
      if (!officialFaculties.includes(name)) {
        for (const doc of docs) {
          batch.delete(doc.ref);
          console.log(`❌ ${name} siliniyor (ID: ${doc.id})`);
          deleteCount++;
        }
      }
    }

    console.log('\n2. Duplicate kayıtlar siliniyor...\n');

    // Her fakülteden sadece bir tane bırak, diğerlerini sil
    for (const [name, docs] of Object.entries(facultyGroups)) {
      if (officialFaculties.includes(name) && docs.length > 1) {
        // İlk kaydı tut, diğerlerini sil
        for (let i = 1; i < docs.length; i++) {
          batch.delete(docs[i].ref);
          console.log(`🗑️  ${name} duplicate siliniyor (ID: ${docs[i].id})`);
          deleteCount++;
        }
        console.log(`✅ ${name} tutuldu (ID: ${docs[0].id})`);
      }
    }

    await batch.commit();

    console.log(`\n=== Özet ===`);
    console.log(`❌ Silinen kayıt: ${deleteCount}`);
    console.log(`✅ Kalan fakülte: ${officialFaculties.length}`);
    console.log('\nTemizlik tamamlandı!');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    process.exit();
  }
}

cleanFaculty();
