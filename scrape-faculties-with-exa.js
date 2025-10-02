const Exa = require('exa-js').default;

const EXA_API_KEY = 'c3f85f48-f839-4a48-8b18-136b834e653d';

const facultyUrls = [
  {
    name: 'Eğitim Fakültesi',
    url: 'http://www.egf.yildiz.edu.tr/'
  },
  {
    name: 'Elektrik-Elektronik Fakültesi',
    url: 'http://www.elk.yildiz.edu.tr/'
  },
  {
    name: 'Fen-Edebiyat Fakültesi',
    url: 'http://www.fed.yildiz.edu.tr/'
  },
  {
    name: 'Gemi İnşaatı ve Denizcilik Fakültesi',
    url: 'http://www.gidf.yildiz.edu.tr/'
  },
  {
    name: 'İktisadi ve İdari Bilimler Fakültesi',
    url: 'http://www.iib.yildiz.edu.tr/'
  },
  {
    name: 'İnşaat Fakültesi',
    url: 'http://www.ins.yildiz.edu.tr/'
  },
  {
    name: 'Kimya-Metalurji Fakültesi',
    url: 'http://www.kim.yildiz.edu.tr/'
  },
  {
    name: 'Makine Fakültesi',
    url: 'http://www.mak.yildiz.edu.tr/'
  },
  {
    name: 'Mimarlık Fakültesi',
    url: 'http://www.mmr.yildiz.edu.tr/'
  },
  {
    name: 'Sanat ve Tasarım Fakültesi',
    url: 'http://www.sts.yildiz.edu.tr/'
  }
];

async function scrapeFacultiesWithExa() {
  try {
    const exa = new Exa(EXA_API_KEY);

    console.log('Exa ile fakülte siteleri scrape ediliyor...\n');

    const results = [];

    for (const faculty of facultyUrls) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`${faculty.name}`);
      console.log(`URL: ${faculty.url}`);
      console.log('='.repeat(60));

      try {
        // Fakülte sitesinin içeriğini çek
        const result = await exa.getContents([faculty.url], {
          text: true
        });

        if (result.results && result.results.length > 0) {
          const content = result.results[0];

          console.log(`\nBaşlık: ${content.title || 'N/A'}`);
          console.log(`\nİçerik (ilk 500 karakter):`);
          console.log(content.text ? content.text.substring(0, 500) : 'İçerik bulunamadı');
          console.log('\n...');

          results.push({
            faculty: faculty.name,
            url: faculty.url,
            title: content.title,
            text: content.text
          });
        } else {
          console.log('✗ İçerik çekilemedi');
        }

        // Rate limiting için bekle
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.log(`✗ Hata: ${error.message}`);
      }
    }

    // Sonuçları JSON dosyasına kaydet
    const fs = require('fs');
    fs.writeFileSync(
      'faculty-scraped-data.json',
      JSON.stringify(results, null, 2),
      'utf8'
    );

    console.log(`\n\n✓ ${results.length} fakülte scrape edildi.`);
    console.log('✓ Veriler faculty-scraped-data.json dosyasına kaydedildi.');

  } catch (error) {
    console.error('Genel hata:', error.message);
  }
}

scrapeFacultiesWithExa();
