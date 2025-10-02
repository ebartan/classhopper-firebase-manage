const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

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

async function scrapeDepartmentUrls() {
  try {
    console.log('🔍 Fakülte sitelerinden bölüm URL\'leri taranıyor...\n');

    const allResults = [];

    for (const faculty of facultyUrls) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📚 ${faculty.name}`);
      console.log(`🌐 ${faculty.url}`);
      console.log('='.repeat(60));

      try {
        // Fakülte ana sayfasını çek
        const response = await axios.get(faculty.url, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        const $ = cheerio.load(response.data);
        const departmentUrls = new Set();

        // Bölüm linklerini ara
        // Yaygın bölüm URL patternleri:
        // - /bolumler, /departments, /bölümler
        // - Subdomain: bilgisayar.elk.yildiz.edu.tr gibi

        $('a').each((i, elem) => {
          const href = $(elem).attr('href');
          const text = $(elem).text().trim().toLowerCase();

          if (href) {
            // Bölüm sayfaları
            if (
              href.includes('/bolum') ||
              href.includes('/department') ||
              text.includes('bölüm') ||
              text.includes('department') ||
              text.includes('mühendisli') ||
              text.includes('engineering')
            ) {
              // URL'i tam hale getir
              let fullUrl = href;
              if (href.startsWith('/')) {
                const baseUrl = new URL(faculty.url);
                fullUrl = `${baseUrl.protocol}//${baseUrl.host}${href}`;
              } else if (!href.startsWith('http')) {
                fullUrl = new URL(href, faculty.url).href;
              }

              // Sadece YTU domainindeki linkleri al
              if (fullUrl.includes('yildiz.edu.tr')) {
                departmentUrls.add(fullUrl);
              }
            }
          }
        });

        console.log(`\n✅ ${departmentUrls.size} potansiyel bölüm URL'si bulundu:`);

        const urlList = Array.from(departmentUrls);
        urlList.forEach((url, index) => {
          console.log(`   ${index + 1}. ${url}`);

          allResults.push({
            faculty: faculty.name,
            facultyUrl: faculty.url,
            departmentUrl: url
          });
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.log(`❌ Hata: ${error.message}`);
      }
    }

    // Sonuçları JSON'a kaydet
    fs.writeFileSync(
      'department-urls-scraped.json',
      JSON.stringify(allResults, null, 2),
      'utf-8'
    );

    console.log(`\n\n${'='.repeat(60)}`);
    console.log('✅ Tarama tamamlandı!');
    console.log(`📊 Toplam ${allResults.length} bölüm URL'si bulundu.`);
    console.log(`💾 Veriler department-urls-scraped.json dosyasına kaydedildi.`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Genel hata:', error);
  }
}

scrapeDepartmentUrls();
