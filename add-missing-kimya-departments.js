const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function addMissingKimyaDepartments() {
  try {
    console.log('➕ Kimya-Metalurji eksik 5 bölümü ekleniyor...\n');

    // URL'den bölüm adını çıkar
    const kimyaDepartments = [
      {
        name: 'Biyomühendislik',
        url: 'http://bioeng.yildiz.edu.tr/',
        subdomain: 'bioeng'
      },
      {
        name: 'Gıda Mühendisliği',
        url: 'http://food.yildiz.edu.tr/',
        subdomain: 'food'
      },
      {
        name: 'Kimya Mühendisliği',
        url: 'http://kmm.yildiz.edu.tr/',
        subdomain: 'kmm'
      },
      {
        name: 'Matematik Mühendisliği',
        url: 'http://mtm.yildiz.edu.tr/',
        subdomain: 'mtm'
      },
      {
        name: 'Metalurji ve Malzeme Mühendisliği',
        url: 'http://met.yildiz.edu.tr/',
        subdomain: 'met'
      }
    ];

    // JSON'dan sosyal medya bilgilerini çek
    const allDepartments = JSON.parse(
      fs.readFileSync('departments-with-social-media.json', 'utf-8')
    );

    let successCount = 0;

    for (const dept of kimyaDepartments) {
      // Bu URL'ye ait sosyal medyayı bul
      const matchingDept = allDepartments.find(d =>
        d.url === dept.url || d.url.includes(dept.subdomain)
      );

      if (matchingDept) {
        const newDeptData = {
          bolumAdi: dept.name,
          fakulteAdi: 'Kimya-Metalurji Fakültesi',
          url: dept.url,
          socialMedia: matchingDept.socialMedia || {
            twitter: '',
            instagram: '',
            facebook: '',
            linkedin: '',
            youtube: ''
          },
          isSubdomain: true,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('department').add(newDeptData);

        console.log(`✅ ${dept.name} eklendi (ID: ${docRef.id})`);
        console.log(`   🌐 URL: ${dept.url}`);
        console.log(`   🐦 Twitter: ${newDeptData.socialMedia.twitter ? '✅' : '❌'}`);
        console.log(`   📸 Instagram: ${newDeptData.socialMedia.instagram ? '✅' : '❌'}`);
        console.log(`   👥 Facebook: ${newDeptData.socialMedia.facebook ? '✅' : '❌'}`);
        console.log(`   💼 LinkedIn: ${newDeptData.socialMedia.linkedin ? '✅' : '❌'}`);
        console.log(`   🎥 YouTube: ${newDeptData.socialMedia.youtube ? '✅' : '❌'}`);
        console.log('');

        successCount++;
      } else {
        console.log(`❌ ${dept.name} için sosyal medya bulunamadı`);
      }
    }

    console.log(`${'='.repeat(60)}`);
    console.log(`✅ ${successCount}/5 bölüm eklendi`);
    console.log('='.repeat(60));

    // Final kontrol
    console.log('\n🔍 Final Kontrol...\n');

    const snapshot = await db.collection('department').get();
    const kimyaBolumler = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.fakulteAdi === 'Kimya-Metalurji Fakültesi') {
        kimyaBolumler.push(data);
      }
    });

    console.log(`📊 Kimya-Metalurji Fakültesi: ${kimyaBolumler.length} bölüm`);
    kimyaBolumler.forEach((dept, i) => {
      console.log(`   ${i + 1}. ${dept.bolumAdi}`);
    });

    console.log(`\n📈 Toplam Bölüm Sayısı: ${snapshot.size}`);

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    process.exit();
  }
}

addMissingKimyaDepartments();
