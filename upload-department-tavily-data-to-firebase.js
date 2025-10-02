const admin = require('firebase-admin');
const fs = require('fs');

// Service account key
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function uploadDepartmentTavilyDataToFirebase() {
  try {
    console.log('📂 Department Tavily verilerini JSON dosyasından okuma...\n');

    const tavilyData = JSON.parse(
      fs.readFileSync('department-social-media-tavily-results.json', 'utf-8')
    );

    console.log(`✅ ${tavilyData.length} department verisi bulundu.\n`);
    console.log('🔄 Firebase\'e yükleniyor...\n');

    let successCount = 0;
    let errorCount = 0;

    // İlk 5 kayıt için test
    const testData = tavilyData.slice(0, 5);
    console.log(`⚠️  TEST MODU: İlk ${testData.length} department işlenecek\n`);

    for (const departmentData of testData) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🏛️  ${departmentData.departmentName}`);
      console.log(`🆔 ID: ${departmentData.departmentId}`);
      console.log('='.repeat(60));

      try {
        // Firebase'de departmanı bul
        const departmentRef = db.collection('department').doc(departmentData.departmentId);
        const departmentDoc = await departmentRef.get();

        if (!departmentDoc.exists) {
          console.log(`❌ Firebase'de bulunamadı: ${departmentData.departmentName}`);
          errorCount++;
          continue;
        }

        // socialMediaAnalytics alanını oluştur
        const socialMediaAnalytics = {};

        // Her platform için Tavily verilerini ekle
        for (const [platform, data] of Object.entries(departmentData.tavilyData)) {
          socialMediaAnalytics[platform] = {
            url: data.url,
            analytics: {
              summary: data.tavilyAnswer || '',
              sources: data.sources || [],
              lastUpdated: data.searchedAt || new Date().toISOString()
            }
          };

          console.log(`  ✅ ${platform}: ${data.url}`);
        }

        // Firebase'i güncelle
        await departmentRef.update({
          socialMediaAnalytics: socialMediaAnalytics,
          'metadata.tavilyLastUpdated': admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`✅ Firebase güncellendi`);
        console.log(`📊 ${Object.keys(socialMediaAnalytics).length} platform verisi eklendi`);

        successCount++;

      } catch (error) {
        console.log(`❌ Hata: ${error.message}`);
        errorCount++;
      }
    }

    console.log(`\n\n${'='.repeat(60)}`);
    console.log('📊 ÖZET RAPOR');
    console.log('='.repeat(60));
    console.log(`✅ Başarılı: ${successCount} department`);
    console.log(`❌ Hata: ${errorCount} department`);
    console.log(`📝 Toplam: ${tavilyData.length} department`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Genel hata:', error);
  } finally {
    process.exit();
  }
}

uploadDepartmentTavilyDataToFirebase();
