const admin = require('firebase-admin');
const fs = require('fs');

// Service account key
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function updateFacultySocialMedia() {
  try {
    // JSON dosyasından fakülte verilerini oku
    const facultiesData = JSON.parse(
      fs.readFileSync('faculty-cleaned-data.json', 'utf-8')
    );

    console.log('🔄 Fakültelerin sosyal medya bilgileri güncelleniyor...\n');

    let successCount = 0;
    let errorCount = 0;
    let notFoundCount = 0;

    for (const facultyData of facultiesData) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📚 ${facultyData.faculty}`);
      console.log('='.repeat(60));

      try {
        // Firebase'de fakülteyi bul
        const facultySnapshot = await db
          .collection('faculty')
          .where('name', '==', facultyData.faculty)
          .limit(1)
          .get();

        if (facultySnapshot.empty) {
          console.log(`❌ Firebase'de bulunamadı: ${facultyData.faculty}`);
          notFoundCount++;
          continue;
        }

        const facultyDoc = facultySnapshot.docs[0];
        const facultyId = facultyDoc.id;

        // Mevcut veriyi al
        const currentData = facultyDoc.data();

        // Güncellenecek veri
        const updateData = {
          url: facultyData.url || currentData.url || '',
          socialMedia: facultyData.socialMedia || {},
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        // Firebase'i güncelle
        await db.collection('faculty').doc(facultyId).update(updateData);

        console.log(`✅ Güncellendi (ID: ${facultyId})`);
        console.log(`   🌐 Web: ${updateData.url}`);
        console.log(`   🐦 Twitter: ${updateData.socialMedia.twitter || '❌'}`);
        console.log(`   📸 Instagram: ${updateData.socialMedia.instagram || '❌'}`);
        console.log(`   👥 Facebook: ${updateData.socialMedia.facebook || '❌'}`);
        console.log(`   💼 LinkedIn: ${updateData.socialMedia.linkedin || '❌'}`);
        console.log(`   🎥 YouTube: ${updateData.socialMedia.youtube || '❌'}`);

        successCount++;

      } catch (error) {
        console.log(`❌ Hata: ${error.message}`);
        errorCount++;
      }
    }

    console.log(`\n\n${'='.repeat(60)}`);
    console.log('📊 ÖZET RAPOR');
    console.log('='.repeat(60));
    console.log(`✅ Başarılı: ${successCount} fakülte`);
    console.log(`❌ Hata: ${errorCount} fakülte`);
    console.log(`⚠️  Bulunamadı: ${notFoundCount} fakülte`);
    console.log(`📝 Toplam: ${facultiesData.length} fakülte`);
    console.log('='.repeat(60));

    // Firebase'deki tüm fakültelerin sosyal medya durumunu kontrol et
    console.log('\n🔍 Firebase\'deki tüm fakülteler kontrol ediliyor...\n');

    const allFaculties = await db.collection('faculty').get();
    let withSocialMedia = 0;
    let withoutSocialMedia = 0;

    allFaculties.forEach(doc => {
      const data = doc.data();
      if (data.socialMedia && Object.keys(data.socialMedia).length > 0) {
        withSocialMedia++;
      } else {
        withoutSocialMedia++;
        console.log(`⚠️  Sosyal medya yok: ${data.name}`);
      }
    });

    console.log(`\n📈 Firebase İstatistikleri:`);
    console.log(`   ✅ Sosyal medya ile: ${withSocialMedia} fakülte`);
    console.log(`   ❌ Sosyal medya yok: ${withoutSocialMedia} fakülte`);
    console.log(`   📊 Toplam: ${allFaculties.size} fakülte`);

  } catch (error) {
    console.error('❌ Genel hata:', error);
  } finally {
    process.exit();
  }
}

updateFacultySocialMedia();
