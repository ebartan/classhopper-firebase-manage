const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const facultiesWithUrls = [
  {
    name: 'Eğitim Fakültesi',
    url: 'http://www.egf.yildiz.edu.tr/'
  },
  {
    name: 'Elektrik-Elektronik Fakültesi',
    url: 'http://www.elk.yildiz.edu.tr/'
  },
  {
    name: 'Fen-Edebiyat Fakültesi',
    url: 'http://www.fed.yildiz.edu.tr/'
  },
  {
    name: 'Gemi İnşaatı ve Denizcilik Fakültesi',
    url: 'http://www.gidf.yildiz.edu.tr/'
  },
  {
    name: 'İktisadi ve İdari Bilimler Fakültesi',
    url: 'http://www.iib.yildiz.edu.tr/'
  },
  {
    name: 'İnşaat Fakültesi',
    url: 'http://www.ins.yildiz.edu.tr/'
  },
  {
    name: 'Kimya-Metalurji Fakültesi',
    url: 'http://www.kim.yildiz.edu.tr/'
  },
  {
    name: 'Makine Fakültesi',
    url: 'http://www.mak.yildiz.edu.tr/'
  },
  {
    name: 'Mimarlık Fakültesi',
    url: 'http://www.mmr.yildiz.edu.tr/'
  },
  {
    name: 'Sanat ve Tasarım Fakültesi',
    url: 'http://www.sts.yildiz.edu.tr/'
  }
];

async function addFacultyUrls() {
  try {
    console.log('Fakültelere URL adresleri ekleniyor...\n');

    for (const faculty of facultiesWithUrls) {
      // Fakülteyi isme göre bul
      const facultySnapshot = await db.collection('faculty')
        .where('name', '==', faculty.name)
        .limit(1)
        .get();

      if (facultySnapshot.empty) {
        console.log(`✗ ${faculty.name} - Bulunamadı`);
        continue;
      }

      const facultyDoc = facultySnapshot.docs[0];

      // URL'yi ekle
      await facultyDoc.ref.update({
        url: faculty.url,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`✓ ${faculty.name}`);
      console.log(`  URL: ${faculty.url}\n`);
    }

    console.log(`\n✓ ${facultiesWithUrls.length} fakülteye URL eklendi.`);

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    process.exit();
  }
}

addFacultyUrls();
