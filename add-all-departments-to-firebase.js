const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function addAllDepartmentsToFirebase() {
  try {
    // JSON dosyasından bölüm verilerini oku
    const departmentsData = JSON.parse(
      fs.readFileSync('departments-with-social-media.json', 'utf-8')
    );

    console.log('➕ 46 bölüm YENİ KAYIT olarak Firebase\'e ekleniyor...\n');

    let successCount = 0;
    let errorCount = 0;

    for (const deptData of departmentsData) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📚 ${deptData.name || 'İsimsiz Bölüm'}`);
      console.log(`🏢 ${deptData.faculty}`);
      console.log('='.repeat(60));

      try {
        // Yeni bölüm kaydı oluştur
        const newDeptData = {
          name: deptData.name || '',
          fakulteAdi: deptData.faculty,
          url: deptData.url || '',
          socialMedia: deptData.socialMedia || {
            twitter: '',
            instagram: '',
            facebook: '',
            linkedin: '',
            youtube: ''
          },
          isSubdomain: deptData.isSubdomain || false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        // Firestore'a ekle
        const docRef = await db.collection('department').add(newDeptData);

        console.log(`✅ Eklendi (ID: ${docRef.id})`);
        console.log(`   📛 İsim: ${newDeptData.name}`);
        console.log(`   🌐 URL: ${newDeptData.url}`);
        console.log(`   🐦 Twitter: ${newDeptData.socialMedia.twitter || '❌'}`);
        console.log(`   📸 Instagram: ${newDeptData.socialMedia.instagram || '❌'}`);
        console.log(`   👥 Facebook: ${newDeptData.socialMedia.facebook || '❌'}`);
        console.log(`   💼 LinkedIn: ${newDeptData.socialMedia.linkedin || '❌'}`);
        console.log(`   🎥 YouTube: ${newDeptData.socialMedia.youtube || '❌'}`);

        successCount++;

      } catch (error) {
        console.log(`❌ Hata: ${error.message}`);
        errorCount++;
      }
    }

    console.log(`\n\n${'='.repeat(60)}`);
    console.log('📊 ÖZET RAPOR');
    console.log('='.repeat(60));
    console.log(`✅ Eklenen: ${successCount} bölüm`);
    console.log(`❌ Hata: ${errorCount} bölüm`);
    console.log(`📝 Toplam: ${departmentsData.length} bölüm`);
    console.log('='.repeat(60));

    // Firebase'deki toplam bölüm sayısını kontrol et
    console.log('\n🔍 Firebase kontrol ediliyor...\n');

    const allDepartments = await db.collection('department').get();
    const withSocialMedia = [];
    const withUrl = [];

    allDepartments.forEach(doc => {
      const data = doc.data();

      if (data.url && data.url.trim() !== '') {
        withUrl.push(data);
      }

      if (data.socialMedia) {
        const hasAnySocial = Object.values(data.socialMedia).some(v => v && v.trim() !== '');
        if (hasAnySocial) {
          withSocialMedia.push(data);
        }
      }
    });

    console.log(`📈 Firebase İstatistikleri:`);
    console.log(`   📊 Toplam: ${allDepartments.size} bölüm`);
    console.log(`   🌐 URL ile: ${withUrl.length} bölüm`);
    console.log(`   📱 Sosyal medya ile: ${withSocialMedia.length} bölüm`);

  } catch (error) {
    console.error('❌ Genel hata:', error);
  } finally {
    process.exit();
  }
}

addAllDepartmentsToFirebase();
