const admin = require('firebase-admin');
const fs = require('fs');

// Service account key
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function uploadTavilyDataToFirebase() {
  try {
    console.log('📂 Tavily verilerini JSON dosyasından okuma...\n');

    const tavilyData = JSON.parse(
      fs.readFileSync('faculty-social-media-tavily-results.json', 'utf-8')
    );

    console.log(`✅ ${tavilyData.length} fakülte verisi bulundu.\n`);
    console.log('🔄 Firebase\'e yükleniyor...\n');

    let successCount = 0;
    let errorCount = 0;

    for (const facultyData of tavilyData) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📚 ${facultyData.facultyName}`);
      console.log(`🆔 ID: ${facultyData.facultyId}`);
      console.log('='.repeat(60));

      try {
        // Firebase'de fakülteyi bul
        const facultyRef = db.collection('faculty').doc(facultyData.facultyId);
        const facultyDoc = await facultyRef.get();

        if (!facultyDoc.exists) {
          console.log(`❌ Firebase'de bulunamadı: ${facultyData.facultyName}`);
          errorCount++;
          continue;
        }

        // Mevcut veriyi kontrol et
        // const currentData = facultyDoc.data();

        // socialMediaAnalytics alanını oluştur
        const socialMediaAnalytics = {};

        // Her platform için Tavily verilerini ekle
        for (const [platform, data] of Object.entries(facultyData.tavilyData)) {
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
        await facultyRef.update({
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
    console.log(`✅ Başarılı: ${successCount} fakülte`);
    console.log(`❌ Hata: ${errorCount} fakülte`);
    console.log(`📝 Toplam: ${tavilyData.length} fakülte`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Genel hata:', error);
  } finally {
    process.exit();
  }
}

uploadTavilyDataToFirebase();
