const Exa = require('exa-js').default;
const fs = require('fs');

const EXA_API_KEY = 'c3f85f48-f839-4a48-8b18-136b834e653d';

const missingDepartments = [
  { name: 'Bilgisayar Mühendisliği', faculty: 'Elektrik-Elektronik Fakültesi', url: 'http://bim.yildiz.edu.tr/' },
  { name: 'Biyomedikal Mühendisliği', faculty: 'Elektrik-Elektronik Fakültesi', url: 'http://bio.yildiz.edu.tr/' },
  { name: 'Yapay Zeka ve Veri Mühendisliği', faculty: 'Elektrik-Elektronik Fakültesi', url: 'http://yzvm.yildiz.edu.tr/' },
  { name: 'İnşaat Mühendisliği', faculty: 'İnşaat Fakültesi', url: 'https://ins.yildiz.edu.tr/' },
  { name: 'Harita Mühendisliği', faculty: 'İnşaat Fakültesi', url: 'https://har.yildiz.edu.tr/' },
  { name: 'Endüstri Mühendisliği', faculty: 'Makine Fakültesi', url: 'http://enm.yildiz.edu.tr/' }
];

async function findMissingSocialMedia() {
  try {
    const exa = new Exa(EXA_API_KEY);
    const results = [];

    for (const dept of missingDepartments) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🔍 ${dept.name} (${dept.faculty})`);
      console.log('='.repeat(60));

      const socialMedia = {};

      // Twitter
      try {
        const twitterResult = await exa.search(
          `${dept.name} Yıldız Teknik Üniversitesi twitter`,
          { numResults: 3, includeDomains: ['twitter.com', 'x.com'] }
        );
        socialMedia.twitter = twitterResult.results[0]?.url || '';
        console.log(`   Twitter: ${socialMedia.twitter || '❌'}`);
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (e) {
        socialMedia.twitter = '';
        console.log(`   Twitter: ❌ (hata)`);
      }

      // Instagram
      try {
        const instagramResult = await exa.search(
          `${dept.name} Yıldız Teknik Üniversitesi instagram`,
          { numResults: 3, includeDomains: ['instagram.com'] }
        );
        socialMedia.instagram = instagramResult.results[0]?.url || '';
        console.log(`   Instagram: ${socialMedia.instagram || '❌'}`);
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (e) {
        socialMedia.instagram = '';
        console.log(`   Instagram: ❌ (hata)`);
      }

      // Facebook
      try {
        const facebookResult = await exa.search(
          `${dept.name} Yıldız Teknik Üniversitesi facebook`,
          { numResults: 3, includeDomains: ['facebook.com'] }
        );
        socialMedia.facebook = facebookResult.results[0]?.url || '';
        console.log(`   Facebook: ${socialMedia.facebook || '❌'}`);
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (e) {
        socialMedia.facebook = '';
        console.log(`   Facebook: ❌ (hata)`);
      }

      // LinkedIn
      try {
        const linkedinResult = await exa.search(
          `${dept.name} Yıldız Teknik Üniversitesi linkedin`,
          { numResults: 3, includeDomains: ['linkedin.com'] }
        );
        socialMedia.linkedin = linkedinResult.results[0]?.url || '';
        console.log(`   LinkedIn: ${socialMedia.linkedin || '❌'}`);
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (e) {
        socialMedia.linkedin = '';
        console.log(`   LinkedIn: ❌ (hata)`);
      }

      // YouTube
      try {
        const youtubeResult = await exa.search(
          `${dept.name} Yıldız Teknik Üniversitesi youtube`,
          { numResults: 3, includeDomains: ['youtube.com'] }
        );
        socialMedia.youtube = youtubeResult.results[0]?.url || '';
        console.log(`   YouTube: ${socialMedia.youtube || '❌'}`);
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (e) {
        socialMedia.youtube = '';
        console.log(`   YouTube: ❌ (hata)`);
      }

      results.push({
        name: dept.name,
        faculty: dept.faculty,
        url: dept.url,
        socialMedia
      });
    }

    // Kaydet
    fs.writeFileSync(
      'missing-social-media-found.json',
      JSON.stringify(results, null, 2),
      'utf-8'
    );

    console.log(`\n\n✅ Sonuçlar missing-social-media-found.json dosyasına kaydedildi`);

  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

findMissingSocialMedia();
