const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function uploadDepartmentsToFirebase() {
  try {
    // JSON dosyasından bölüm verilerini oku
    const departmentsData = JSON.parse(
      fs.readFileSync('departments-with-social-media.json', 'utf-8')
    );

    console.log('🔄 Bölümlerin URL ve sosyal medya bilgileri Firebase\'e yükleniyor...\n');

    let successCount = 0;
    let errorCount = 0;
    let notFoundCount = 0;
    let createdCount = 0;

    for (const deptData of departmentsData) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📚 ${deptData.name || 'İsimsiz Bölüm'}`);
      console.log(`🏢 ${deptData.faculty}`);
      console.log('='.repeat(60));

      try {
        // Firebase'de bölümü fakulteAdi'na göre bul
        const deptSnapshot = await db
          .collection('department')
          .where('fakulteAdi', '==', deptData.faculty)
          .get();

        if (deptSnapshot.empty) {
          console.log(`⚠️  "${deptData.faculty}" fakültesine ait bölüm bulunamadı`);

          // Yeni bölüm oluştur
          console.log(`➕ Yeni bölüm oluşturuluyor...`);

          const newDeptData = {
            name: deptData.name,
            fakulteAdi: deptData.faculty,
            url: deptData.url,
            socialMedia: deptData.socialMedia,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          };

          const docRef = await db.collection('department').add(newDeptData);

          console.log(`✅ Yeni bölüm oluşturuldu (ID: ${docRef.id})`);
          console.log(`   🌐 URL: ${newDeptData.url}`);
          console.log(`   🐦 Twitter: ${newDeptData.socialMedia.twitter || '❌'}`);
          console.log(`   📸 Instagram: ${newDeptData.socialMedia.instagram || '❌'}`);
          console.log(`   👥 Facebook: ${newDeptData.socialMedia.facebook || '❌'}`);
          console.log(`   💼 LinkedIn: ${newDeptData.socialMedia.linkedin || '❌'}`);
          console.log(`   🎥 YouTube: ${newDeptData.socialMedia.youtube || '❌'}`);

          createdCount++;
          continue;
        }

        // Eğer birden fazla bölüm varsa, URL'ye göre eşleştir
        let deptDoc = null;

        if (deptSnapshot.size > 1) {
          console.log(`⚠️  ${deptSnapshot.size} bölüm bulundu, URL'ye göre eşleştiriliyor...`);

          // URL subdomain'ine göre eşleştir
          const urlMatch = deptData.url.match(/https?:\/\/([^.]+)\./);
          const subdomain = urlMatch ? urlMatch[1] : null;

          for (const doc of deptSnapshot.docs) {
            const data = doc.data();
            // Eğer URL varsa ve eşleşiyorsa
            if (data.url && data.url.includes(subdomain)) {
              deptDoc = doc;
              break;
            }
          }

          // Eşleşme bulunamazsa ilkini al
          if (!deptDoc) {
            deptDoc = deptSnapshot.docs[0];
            console.log(`   ℹ️  URL eşleşmesi bulunamadı, ilk bölüm seçildi`);
          }
        } else {
          deptDoc = deptSnapshot.docs[0];
        }

        const deptId = deptDoc.id;
        const currentData = deptDoc.data();

        // Güncellenecek veri
        const updateData = {
          name: deptData.name || currentData.name,
          url: deptData.url || currentData.url || '',
          socialMedia: deptData.socialMedia || {},
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        // Firebase'i güncelle
        await db.collection('department').doc(deptId).update(updateData);

        console.log(`✅ Güncellendi (ID: ${deptId})`);
        console.log(`   📛 İsim: ${updateData.name}`);
        console.log(`   🌐 URL: ${updateData.url}`);
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
    console.log(`✅ Güncellenen: ${successCount} bölüm`);
    console.log(`➕ Oluşturulan: ${createdCount} bölüm`);
    console.log(`❌ Hata: ${errorCount} bölüm`);
    console.log(`⚠️  Bulunamadı: ${notFoundCount} bölüm`);
    console.log(`📝 Toplam: ${departmentsData.length} bölüm`);
    console.log('='.repeat(60));

    // Firebase'deki tüm bölümlerin sosyal medya durumunu kontrol et
    console.log('\n🔍 Firebase\'deki tüm bölümler kontrol ediliyor...\n');

    const allDepartments = await db.collection('department').get();
    let withSocialMedia = 0;
    let withoutSocialMedia = 0;
    let withUrl = 0;

    allDepartments.forEach(doc => {
      const data = doc.data();
      if (data.socialMedia && Object.keys(data.socialMedia).length > 0) {
        const hasAnySocial = Object.values(data.socialMedia).some(v => v && v.trim() !== '');
        if (hasAnySocial) {
          withSocialMedia++;
        } else {
          withoutSocialMedia++;
        }
      } else {
        withoutSocialMedia++;
      }

      if (data.url && data.url.trim() !== '') {
        withUrl++;
      }
    });

    console.log(`📈 Firebase İstatistikleri:`);
    console.log(`   🌐 URL ile: ${withUrl}/${allDepartments.size} bölüm`);
    console.log(`   ✅ Sosyal medya ile: ${withSocialMedia}/${allDepartments.size} bölüm`);
    console.log(`   ❌ Sosyal medya yok: ${withoutSocialMedia}/${allDepartments.size} bölüm`);
    console.log(`   📊 Toplam: ${allDepartments.size} bölüm`);

  } catch (error) {
    console.error('❌ Genel hata:', error);
  } finally {
    process.exit();
  }
}

uploadDepartmentsToFirebase();
