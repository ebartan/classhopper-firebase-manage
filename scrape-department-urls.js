const admin = require('firebase-admin');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Fakülte URL'leri (bölümler sayfası)
const facultyUrls = {
  'Eğitim Fakültesi': 'https://egitim.yildiz.edu.tr/bolumler',
  'Elektrik-Elektronik Fakültesi': 'https://elk.yildiz.edu.tr/bolumler',
  'Fen-Edebiyat Fakültesi': 'https://fed.yildiz.edu.tr/bolumler',
  'Gemi İnşaatı ve Denizcilik Fakültesi': 'https://gid.yildiz.edu.tr/bolumler',
  'İktisadi ve İdari Bilimler Fakültesi': 'https://iib.yildiz.edu.tr/bolumler',
  'İnşaat Fakültesi': 'https://ins.yildiz.edu.tr/bolumler',
  'Kimya-Metalurji Fakültesi': 'https://kim.yildiz.edu.tr/bolumler',
  'Makine Fakültesi': 'https://mak.yildiz.edu.tr/bolumler',
  'Mimarlık Fakültesi': 'https://mmr.yildiz.edu.tr/bolumler',
  'Sanat ve Tasarım Fakültesi': 'https://sts.yildiz.edu.tr/bolumler'
};

async function scrapeDepartmentUrls() {
  console.log('Bu script için manuel veri girişi yapılacak.');
  console.log('Her fakültenin bölüm URL\'lerini toplamak için WebFetch kullanın.\n');

  console.log('Fakülte URL\'leri:');
  Object.entries(facultyUrls).forEach(([name, url]) => {
    console.log(`${name}: ${url}`);
  });

  process.exit();
}

scrapeDepartmentUrls();
