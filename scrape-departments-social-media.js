const Exa = require('exa-js').default;
const fs = require('fs');

const EXA_API_KEY = 'c3f85f48-f839-4a48-8b18-136b834e653d';

async function scrapeDepartmentsSocialMedia() {
  try {
    const exa = new Exa(EXA_API_KEY);

    // Bölüm verilerini oku
    const departments = JSON.parse(fs.readFileSync('departments-with-urls.json', 'utf-8'));

    console.log(`🔍 ${departments.length} bölüm için sosyal medya hesapları aranıyor...\n`);

    for (const dept of departments) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📚 ${dept.name}`);
      console.log(`🏢 ${dept.faculty}`);
      console.log(`🌐 ${dept.url}`);
      console.log('='.repeat(60));

      const socialMedia = {
        twitter: '',
        instagram: '',
        facebook: '',
        linkedin: '',
        youtube: ''
      };

      // Instagram arama
      try {
        console.log('\n🔎 Instagram aranıyor...');
        const query = `${dept.name} ${dept.faculty} Yıldız Teknik Üniversitesi instagram`;
        const result = await exa.search(query, {
          numResults: 3,
          includeDomains: ['instagram.com']
        });

        if (result.results && result.results.length > 0) {
          socialMedia.instagram = result.results[0].url;
          console.log(`   ✅ ${result.results[0].url}`);
        } else {
          console.log('   ❌ Bulunamadı');
        }
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (error) {
        console.log(`   ❌ Hata: ${error.message}`);
      }

      // Twitter arama
      try {
        console.log('\n🔎 Twitter aranıyor...');
        const query = `${dept.name} ${dept.faculty} Yıldız Teknik Üniversitesi twitter`;
        const result = await exa.search(query, {
          numResults: 3,
          includeDomains: ['twitter.com', 'x.com']
        });

        if (result.results && result.results.length > 0) {
          socialMedia.twitter = result.results[0].url;
          console.log(`   ✅ ${result.results[0].url}`);
        } else {
          console.log('   ❌ Bulunamadı');
        }
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (error) {
        console.log(`   ❌ Hata: ${error.message}`);
      }

      // Facebook arama
      try {
        console.log('\n🔎 Facebook aranıyor...');
        const query = `${dept.name} ${dept.faculty} Yıldız Teknik Üniversitesi facebook`;
        const result = await exa.search(query, {
          numResults: 3,
          includeDomains: ['facebook.com']
        });

        if (result.results && result.results.length > 0) {
          socialMedia.facebook = result.results[0].url;
          console.log(`   ✅ ${result.results[0].url}`);
        } else {
          console.log('   ❌ Bulunamadı');
        }
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (error) {
        console.log(`   ❌ Hata: ${error.message}`);
      }

      // LinkedIn arama
      try {
        console.log('\n🔎 LinkedIn aranıyor...');
        const query = `${dept.name} ${dept.faculty} Yıldız Teknik Üniversitesi linkedin`;
        const result = await exa.search(query, {
          numResults: 3,
          includeDomains: ['linkedin.com']
        });

        if (result.results && result.results.length > 0) {
          socialMedia.linkedin = result.results[0].url;
          console.log(`   ✅ ${result.results[0].url}`);
        } else {
          console.log('   ❌ Bulunamadı');
        }
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (error) {
        console.log(`   ❌ Hata: ${error.message}`);
      }

      // YouTube arama
      try {
        console.log('\n🔎 YouTube aranıyor...');
        const query = `${dept.name} ${dept.faculty} Yıldız Teknik Üniversitesi youtube`;
        const result = await exa.search(query, {
          numResults: 3,
          includeDomains: ['youtube.com']
        });

        if (result.results && result.results.length > 0) {
          socialMedia.youtube = result.results[0].url;
          console.log(`   ✅ ${result.results[0].url}`);
        } else {
          console.log('   ❌ Bulunamadı');
        }
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (error) {
        console.log(`   ❌ Hata: ${error.message}`);
      }

      // Sosyal medya bilgilerini güncelle
      dept.socialMedia = socialMedia;

      console.log('\n📊 Sonuç:');
      console.log(`   🐦 Twitter: ${socialMedia.twitter || '❌'}`);
      console.log(`   📸 Instagram: ${socialMedia.instagram || '❌'}`);
      console.log(`   👥 Facebook: ${socialMedia.facebook || '❌'}`);
      console.log(`   💼 LinkedIn: ${socialMedia.linkedin || '❌'}`);
      console.log(`   🎥 YouTube: ${socialMedia.youtube || '❌'}`);
    }

    // Güncellenmiş veriyi kaydet
    fs.writeFileSync(
      'departments-with-social-media.json',
      JSON.stringify(departments, null, 2),
      'utf-8'
    );

    console.log('\n\n✅ Tüm bölümlerin sosyal medya hesapları tarandı!');
    console.log('💾 Veriler departments-with-social-media.json dosyasına kaydedildi.');

    // Özet rapor
    console.log('\n📈 Özet Rapor:');
    const stats = {
      twitter: departments.filter(d => d.socialMedia.twitter).length,
      instagram: departments.filter(d => d.socialMedia.instagram).length,
      facebook: departments.filter(d => d.socialMedia.facebook).length,
      linkedin: departments.filter(d => d.socialMedia.linkedin).length,
      youtube: departments.filter(d => d.socialMedia.youtube).length
    };
    console.log(`   🐦 Twitter: ${stats.twitter}/${departments.length} bölüm`);
    console.log(`   📸 Instagram: ${stats.instagram}/${departments.length} bölüm`);
    console.log(`   👥 Facebook: ${stats.facebook}/${departments.length} bölüm`);
    console.log(`   💼 LinkedIn: ${stats.linkedin}/${departments.length} bölüm`);
    console.log(`   🎥 YouTube: ${stats.youtube}/${departments.length} bölüm`);

  } catch (error) {
    console.error('❌ Genel hata:', error.message);
  }
}

scrapeDepartmentsSocialMedia();
