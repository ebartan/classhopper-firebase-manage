const Exa = require('exa-js').default;
const fs = require('fs');

const EXA_API_KEY = 'c3f85f48-f839-4a48-8b18-136b834e653d';

async function scrapeSocialMediaWithExa() {
  try {
    const exa = new Exa(EXA_API_KEY);

    // Mevcut fakülte verilerini oku
    const faculties = JSON.parse(fs.readFileSync('faculty-cleaned-data.json', 'utf-8'));

    console.log('🔍 Exa ile fakültelerin sosyal medya hesapları aranıyor...\n');

    for (const faculty of faculties) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📚 ${faculty.faculty}`);
      console.log(`🌐 ${faculty.url}`);
      console.log('='.repeat(60));

      const socialMedia = {
        twitter: faculty.socialMedia?.twitter || '',
        instagram: '',
        facebook: '',
        linkedin: '',
        youtube: ''
      };

      // Instagram arama
      try {
        console.log('\n🔎 Instagram aranıyor...');
        const instagramQuery = `${faculty.faculty} Yıldız Teknik Üniversitesi instagram`;
        const instagramResult = await exa.search(instagramQuery, {
          numResults: 3,
          includeDomains: ['instagram.com']
        });

        if (instagramResult.results && instagramResult.results.length > 0) {
          const instagramUrl = instagramResult.results[0].url;
          socialMedia.instagram = instagramUrl;
          console.log(`   ✅ Instagram bulundu: ${instagramUrl}`);
        } else {
          console.log('   ❌ Instagram bulunamadı');
        }
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (error) {
        console.log(`   ❌ Instagram hatası: ${error.message}`);
      }

      // Facebook arama
      try {
        console.log('\n🔎 Facebook aranıyor...');
        const facebookQuery = `${faculty.faculty} Yıldız Teknik Üniversitesi facebook`;
        const facebookResult = await exa.search(facebookQuery, {
          numResults: 3,
          includeDomains: ['facebook.com']
        });

        if (facebookResult.results && facebookResult.results.length > 0) {
          const facebookUrl = facebookResult.results[0].url;
          socialMedia.facebook = facebookUrl;
          console.log(`   ✅ Facebook bulundu: ${facebookUrl}`);
        } else {
          console.log('   ❌ Facebook bulunamadı');
        }
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (error) {
        console.log(`   ❌ Facebook hatası: ${error.message}`);
      }

      // LinkedIn arama
      try {
        console.log('\n🔎 LinkedIn aranıyor...');
        const linkedinQuery = `${faculty.faculty} Yıldız Teknik Üniversitesi linkedin`;
        const linkedinResult = await exa.search(linkedinQuery, {
          numResults: 3,
          includeDomains: ['linkedin.com']
        });

        if (linkedinResult.results && linkedinResult.results.length > 0) {
          const linkedinUrl = linkedinResult.results[0].url;
          socialMedia.linkedin = linkedinUrl;
          console.log(`   ✅ LinkedIn bulundu: ${linkedinUrl}`);
        } else {
          console.log('   ❌ LinkedIn bulunamadı');
        }
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (error) {
        console.log(`   ❌ LinkedIn hatası: ${error.message}`);
      }

      // YouTube arama
      try {
        console.log('\n🔎 YouTube aranıyor...');
        const youtubeQuery = `${faculty.faculty} Yıldız Teknik Üniversitesi youtube`;
        const youtubeResult = await exa.search(youtubeQuery, {
          numResults: 3,
          includeDomains: ['youtube.com']
        });

        if (youtubeResult.results && youtubeResult.results.length > 0) {
          const youtubeUrl = youtubeResult.results[0].url;
          socialMedia.youtube = youtubeUrl;
          console.log(`   ✅ YouTube bulundu: ${youtubeUrl}`);
        } else {
          console.log('   ❌ YouTube bulunamadı');
        }
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (error) {
        console.log(`   ❌ YouTube hatası: ${error.message}`);
      }

      // Sosyal medya bilgilerini güncelle
      faculty.socialMedia = socialMedia;

      console.log('\n📊 Sonuç:');
      console.log(`   Twitter: ${socialMedia.twitter || '❌'}`);
      console.log(`   Instagram: ${socialMedia.instagram || '❌'}`);
      console.log(`   Facebook: ${socialMedia.facebook || '❌'}`);
      console.log(`   LinkedIn: ${socialMedia.linkedin || '❌'}`);
      console.log(`   YouTube: ${socialMedia.youtube || '❌'}`);
    }

    // Güncellenmiş veriyi kaydet
    fs.writeFileSync(
      'faculty-cleaned-data.json',
      JSON.stringify(faculties, null, 2),
      'utf-8'
    );

    console.log('\n\n✅ Tüm fakültelerin sosyal medya hesapları güncellendi!');
    console.log('💾 Veriler faculty-cleaned-data.json dosyasına kaydedildi.');

    // Özet rapor
    console.log('\n📈 Özet Rapor:');
    const stats = {
      twitter: faculties.filter(f => f.socialMedia.twitter).length,
      instagram: faculties.filter(f => f.socialMedia.instagram).length,
      facebook: faculties.filter(f => f.socialMedia.facebook).length,
      linkedin: faculties.filter(f => f.socialMedia.linkedin).length,
      youtube: faculties.filter(f => f.socialMedia.youtube).length
    };
    console.log(`   Twitter: ${stats.twitter}/${faculties.length} fakülte`);
    console.log(`   Instagram: ${stats.instagram}/${faculties.length} fakülte`);
    console.log(`   Facebook: ${stats.facebook}/${faculties.length} fakülte`);
    console.log(`   LinkedIn: ${stats.linkedin}/${faculties.length} fakülte`);
    console.log(`   YouTube: ${stats.youtube}/${faculties.length} fakülte`);

  } catch (error) {
    console.error('❌ Genel hata:', error.message);
  }
}

scrapeSocialMediaWithExa();
