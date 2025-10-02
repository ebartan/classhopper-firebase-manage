const Exa = require('exa-js').default;

const EXA_API_KEY = 'c3f85f48-f839-4a48-8b18-136b834e653d';

async function scrapeFacultyUrls() {
  try {
    const exa = new Exa(EXA_API_KEY);

    console.log('Yıldız Teknik Üniversitesi fakülte URL\'leri aranıyor...\n');

    // Ana üniversite sayfasından fakülteleri ara
    const result = await exa.searchAndContents(
      'site:yildiz.edu.tr fakülte',
      {
        numResults: 50,
        text: true,
        includeDomains: ['yildiz.edu.tr']
      }
    );

    console.log(`${result.results.length} sonuç bulundu\n`);

    // Tüm sonuçları göster
    console.log('=== TÜM BULUNAN SAYFALAR ===\n');
    result.results.forEach((r, index) => {
      console.log(`${index + 1}. ${r.title}`);
      console.log(`   ${r.url}`);
      console.log(`   Score: ${r.score}\n`);
    });

  } catch (error) {
    console.error('Hata:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

scrapeFacultyUrls();
