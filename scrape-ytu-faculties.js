const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeYTUFaculties() {
  try {
    console.log('Yıldız Teknik Üniversitesi sitesinden fakülte linkleri çekiliyor...\n');

    // Ana sayfayı çek
    const response = await axios.get('https://yildiz.edu.tr/');
    const $ = cheerio.load(response.data);

    console.log('Sayfa başarıyla yüklendi. Fakülte linkleri aranıyor...\n');

    const facultyLinks = new Set();

    // Tüm linkleri tara
    $('a').each((i, elem) => {
      const href = $(elem).attr('href');
      const text = $(elem).text().trim().toLowerCase();

      if (href) {
        const fullUrl = href.startsWith('http') ? href : `https://yildiz.edu.tr${href}`;

        // Fakülte içeren linkleri bul
        if (
          fullUrl.includes('fakulte') ||
          fullUrl.includes('faculty') ||
          text.includes('fakülte') ||
          text.includes('mühendislik') ||
          text.includes('fen') ||
          text.includes('edebiyat') ||
          text.includes('tıp') ||
          text.includes('mimarlık') ||
          text.includes('İktisadi')
        ) {
          if (fullUrl.includes('yildiz.edu.tr')) {
            facultyLinks.add(fullUrl);
          }
        }
      }
    });

    console.log('=== BULUNAN FAKÜLTE LİNKLERİ ===\n');
    const sortedLinks = Array.from(facultyLinks).sort();
    sortedLinks.forEach((link, index) => {
      console.log(`${index + 1}. ${link}`);
    });

    console.log(`\n\nToplam ${sortedLinks.length} fakülte linki bulundu.`);

    return sortedLinks;

  } catch (error) {
    console.error('Hata:', error.message);
  }
}

scrapeYTUFaculties();
