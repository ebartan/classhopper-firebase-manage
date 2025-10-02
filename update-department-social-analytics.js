const admin = require('firebase-admin');
const axios = require('axios');

// Service account key
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Tavily API configuration
const TAVILY_API_KEY = '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';
const TAVILY_API_URL = 'https://api.tavily.com/search';

async function searchWithTavily(query) {
  try {
    const response = await axios.post(
      TAVILY_API_URL,
      {
        api_key: TAVILY_API_KEY,
        query: query,
        search_depth: 'basic',
        include_answer: true,
        include_raw_content: false,
        max_results: 3
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    return response.data;
  } catch (error) {
    console.error(`❌ Tavily hatası: ${error.message}`);
    return null;
  }
}

async function updateDepartmentSocialAnalytics(startIndex = 0, batchSize = 5) {
  try {
    console.log(`🔍 Firebase'den department'lar alınıyor (${startIndex}-${startIndex + batchSize})...\n`);

    const allSnapshot = await db.collection('department').get();

    // Sosyal medyası olan department'ları filtrele
    const depsWithSocialMedia = [];
    allSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.socialMedia && Object.values(data.socialMedia).some(v => v && v.trim() !== '')) {
        depsWithSocialMedia.push(doc);
      }
    });

    console.log(`📊 Toplam sosyal medyası olan: ${depsWithSocialMedia.length}`);

    // Batch'i al
    const batch = depsWithSocialMedia.slice(startIndex, startIndex + batchSize);
    console.log(`✅ İşlenecek: ${batch.length} department\n`);

    const snapshot = { docs: batch, size: batch.length };

    console.log(`✅ ${snapshot.size} department bulundu\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const departmentId = doc.id;

      console.log(`\n${'='.repeat(60)}`);
      console.log(`🏛️  ${data.bolumAdi}`);
      console.log(`📚 Fakülte: ${data.fakulteAdi}`);
      console.log(`🆔 ID: ${departmentId}`);
      console.log('='.repeat(60));

      const socialMediaAnalytics = {};
      const platforms = {
        instagram: { emoji: '📸', query: 'followers posts' },
        twitter: { emoji: '🐦', query: 'tweets followers' },
        facebook: { emoji: '👥', query: 'likes followers' },
        linkedin: { emoji: '💼', query: 'followers company' },
        youtube: { emoji: '🎥', query: 'subscribers videos' }
      };

      for (const [platform, config] of Object.entries(platforms)) {
        const url = data.socialMedia[platform];

        if (url && url.trim() !== '') {
          console.log(`\n${config.emoji} ${platform.toUpperCase()}: ${url.substring(0, 60)}...`);
          console.log(`   📡 Tavily ile aranıyor...`);

          const searchQuery = `${data.bolumAdi} ${data.fakulteAdi} YTU ${platform} ${url} ${config.query}`;
          const results = await searchWithTavily(searchQuery);

          if (results && results.answer) {
            socialMediaAnalytics[platform] = {
              url: url,
              analytics: {
                summary: results.answer,
                sources: results.results ? results.results.slice(0, 3).map(r => ({
                  title: r.title,
                  url: r.url,
                  content: r.content || ''
                })) : [],
                lastUpdated: new Date().toISOString()
              }
            };
            console.log(`   ✅ Başarılı: ${results.answer.substring(0, 80)}...`);
          } else {
            console.log(`   ❌ Yanıt alınamadı`);
          }

          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      try {
        await db.collection('department').doc(departmentId).update({
          socialMediaAnalytics: socialMediaAnalytics,
          'metadata.tavilyLastUpdated': admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`\n✅ Firebase güncellendi - ${Object.keys(socialMediaAnalytics).length} platform`);
        successCount++;
      } catch (error) {
        console.log(`\n❌ Firebase hatası: ${error.message}`);
        errorCount++;
      }
    }

    console.log(`\n\n${'='.repeat(60)}`);
    console.log('📊 ÖZET');
    console.log('='.repeat(60));
    console.log(`✅ Başarılı: ${successCount}`);
    console.log(`❌ Hata: ${errorCount}`);
    console.log(`📊 Toplam: ${snapshot.size}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Genel hata:', error);
  } finally {
    process.exit();
  }
}

// Komut satırı argümanlarından batch numarasını al (varsayılan 0)
const batchIndex = parseInt(process.argv[2] || '0');
const batchSize = 5;

console.log(`\n🚀 BATCH ${batchIndex + 1} (Department ${batchIndex * batchSize + 1}-${(batchIndex + 1) * batchSize})\n`);

updateDepartmentSocialAnalytics(batchIndex * batchSize, batchSize);
