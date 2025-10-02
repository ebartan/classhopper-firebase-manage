const admin = require('firebase-admin');
const axios = require('axios');
const fs = require('fs');

// Service account key
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Tavily API configuration
const TAVILY_API_KEY = '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';
const TAVILY_API_URL = 'https://api.tavily.com/search';

async function searchWithTavily(query, searchDepth = 'basic') {
  try {
    const response = await axios.post(
      TAVILY_API_URL,
      {
        api_key: TAVILY_API_KEY,
        query: query,
        search_depth: searchDepth,
        include_answer: true,
        include_raw_content: false,
        max_results: 5
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error(`❌ Tavily API hatası: ${error.message}`);
    return null;
  }
}

async function scrapeDepartmentSocialMediaWithTavily() {
  try {
    console.log('🔍 Firebase\'den department sosyal medya linkleri alınıyor...\n');

    // Department koleksiyonundan sosyal medyası olan departmanları çek
    const departmentsSnapshot = await db.collection('department').get();

    const results = [];
    let processedCount = 0;
    let withSocialMedia = 0;

    for (const doc of departmentsSnapshot.docs) {
      const departmentData = doc.data();
      const departmentId = doc.id;

      // Sosyal medya linklerini kontrol et
      if (!departmentData.socialMedia || Object.keys(departmentData.socialMedia).length === 0) {
        continue;
      }

      withSocialMedia++;

      console.log(`\n${'='.repeat(60)}`);
      console.log(`🏛️  Department: ${departmentData.name}`);
      console.log(`🆔 ID: ${departmentId}`);
      console.log('='.repeat(60));

      // Tüm sosyal medya platformları için
      const socialMediaData = {};
      const platforms = {
        instagram: { emoji: '📸', query: 'followers posts' },
        twitter: { emoji: '🐦', query: 'tweets followers' },
        facebook: { emoji: '👥', query: 'likes followers posts' },
        linkedin: { emoji: '💼', query: 'followers company' },
        youtube: { emoji: '🎥', query: 'subscribers videos' }
      };

      for (const [platform, config] of Object.entries(platforms)) {
        const platformUrl = departmentData.socialMedia[platform];

        if (platformUrl && platformUrl.trim() !== '') {
          console.log(`\n${config.emoji} ${platform.toUpperCase()}: ${platformUrl}`);

          // Tavily ile sosyal medya hesabı hakkında arama yap
          const searchQuery = `${departmentData.name} YTU department ${platform} ${platformUrl} university ${config.query}`;

          console.log(`   📡 Tavily ile aranıyor...`);

          const searchResults = await searchWithTavily(searchQuery);

          if (searchResults) {
            socialMediaData[platform] = {
              url: platformUrl,
              tavilyAnswer: searchResults.answer || null,
              sources: searchResults.results ? searchResults.results.slice(0, 3).map(r => ({
                title: r.title,
                url: r.url,
                content: r.content || ''
              })) : [],
              searchedAt: new Date().toISOString()
            };

            console.log(`   ✅ Tavily yanıtı alındı`);
            if (searchResults.answer) {
              console.log(`   💬 Özet: ${searchResults.answer.substring(0, 100)}...`);
            }
          } else {
            console.log(`   ❌ Tavily yanıtı alınamadı`);
          }

          // API rate limiting için bekleme
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          console.log(`\n⚠️  ${config.emoji} ${platform.toUpperCase()}: Link yok veya boş`);
        }
      }

      results.push({
        departmentId: departmentId,
        departmentName: departmentData.name,
        departmentCode: departmentData.code || null,
        socialMedia: departmentData.socialMedia,
        tavilyData: socialMediaData,
        scrapedAt: new Date().toISOString()
      });

      processedCount++;
    }

    // Sonuçları JSON'a kaydet
    const outputFile = 'department-social-media-tavily-results.json';
    fs.writeFileSync(
      outputFile,
      JSON.stringify(results, null, 2),
      'utf-8'
    );

    console.log(`\n\n${'='.repeat(60)}`);
    console.log('📊 ÖZET RAPOR');
    console.log('='.repeat(60));
    console.log(`✅ İşlenen department: ${processedCount}`);
    console.log(`🔗 Sosyal medyası olan: ${withSocialMedia}`);
    console.log(`📊 Toplam department: ${departmentsSnapshot.size}`);
    console.log(`💾 Sonuçlar: ${outputFile}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Genel hata:', error);
  } finally {
    process.exit();
  }
}

scrapeDepartmentSocialMediaWithTavily();
