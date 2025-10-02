const Exa = require('exa-js').default;
const fs = require('fs');

const EXA_API_KEY = 'c3f85f48-f839-4a48-8b18-136b834e653d';

// Her fakültenin URL'si
const faculties = [
  { name: 'Eğitim Fakültesi', url: 'http://www.egf.yildiz.edu.tr/' },
  { name: 'Elektrik-Elektronik Fakültesi', url: 'http://www.elk.yildiz.edu.tr/' },
  { name: 'Fen-Edebiyat Fakültesi', url: 'http://www.fed.yildiz.edu.tr/' },
  { name: 'Gemi İnşaatı ve Denizcilik Fakültesi', url: 'http://www.gidf.yildiz.edu.tr/' },
  { name: 'İktisadi ve İdari Bilimler Fakültesi', url: 'http://www.iib.yildiz.edu.tr/' },
  { name: 'İnşaat Fakültesi', url: 'http://www.ins.yildiz.edu.tr/' },
  { name: 'Kimya-Metalurji Fakültesi', url: 'http://www.kim.yildiz.edu.tr/' },
  { name: 'Makine Fakültesi', url: 'http://www.mak.yildiz.edu.tr/' },
  { name: 'Mimarlık Fakültesi', url: 'http://www.mmr.yildiz.edu.tr/' },
  { name: 'Sanat ve Tasarım Fakültesi', url: 'http://www.sts.yildiz.edu.tr/' }
];

async function getAllDepartments() {
  try {
    const exa = new Exa(EXA_API_KEY);

    console.log('🔍 Her fakülteden tam bölüm listesi alınıyor...\n');

    const allData = [];

    for (const faculty of faculties) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📚 ${faculty.name}`);
      console.log(`🌐 ${faculty.url}`);
      console.log('='.repeat(60));

      try {
        const result = await exa.getContents([faculty.url], {
          text: true
        });

        if (result.results && result.results.length > 0) {
          const content = result.results[0].text;

          allData.push({
            faculty: faculty.name,
            url: faculty.url,
            content: content
          });

          console.log(`✅ İçerik alındı (${content.length} karakter)`);
        }

        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.log(`❌ Hata: ${error.message}`);
      }
    }

    // Kaydet
    fs.writeFileSync(
      'all-faculties-content.json',
      JSON.stringify(allData, null, 2),
      'utf-8'
    );

    console.log('\n\n✅ Tüm içerikler all-faculties-content.json dosyasına kaydedildi');

  } catch (error) {
    console.error('❌ Genel hata:', error);
  }
}

getAllDepartments();
