const fs = require('fs');

// JSON dosyasını oku
const rawData = fs.readFileSync('faculty-scraped-data.json', 'utf8');
const faculties = JSON.parse(rawData);

// Metni temizleme fonksiyonu
function cleanText(text) {
  if (!text) return '';

  return text
    // HTML tag'lerini kaldır
    .replace(/<[^>]*>/g, '')
    // Script ve style içeriklerini kaldır
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // URL'leri kaldır (http/https ile başlayanlar)
    .replace(/https?:\/\/[^\s)]+/g, '')
    // Markdown link formatını kaldır
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    // Image tag'lerini kaldır
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    // Hashtag (#) ile başlayan satırları temizle (markdown başlıklar)
    .replace(/^#+\s*/gm, '')
    // Tekrarlayan ifadeleri kaldır
    .replace(/Ana içeriğe atla/gi, '')
    .replace(/ANASAYFA \| YTÜ/gi, '')
    .replace(/Anasayfa \| YTÜ/gi, '')
    .replace(/YTÜ /gi, '')
    .replace(/!/g, '')
    // Çoklu boşlukları tek boşluğa indir
    .replace(/\s+/g, ' ')
    // Gereksiz satır başı/sonu boşluklarını kaldır
    .replace(/^\s+|\s+$/g, '')
    // Birden fazla ardışık yeni satırı tek yeni satıra indir
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

// Her fakültenin verisini temizle
const cleanedFaculties = faculties.map(faculty => ({
  faculty: faculty.faculty,
  url: faculty.url,
  title: cleanText(faculty.title),
  text: cleanText(faculty.text)
}));

// Temizlenmiş veriyi yeni dosyaya kaydet
fs.writeFileSync(
  'faculty-cleaned-data.json',
  JSON.stringify(cleanedFaculties, null, 2),
  'utf8'
);

console.log('✓ Veri temizleme tamamlandı!\n');
console.log('=== TEMİZLENMİŞ VERİ ÖRNEĞİ ===\n');

// İlk fakülteyi örnek olarak göster
console.log(`Fakülte: ${cleanedFaculties[0].faculty}`);
console.log(`URL: ${cleanedFaculties[0].url}`);
console.log(`Başlık: ${cleanedFaculties[0].title}`);
console.log(`\nİçerik (ilk 300 karakter):`);
console.log(cleanedFaculties[0].text.substring(0, 300) + '...\n');

console.log(`\n✓ Temizlenmiş veriler faculty-cleaned-data.json dosyasına kaydedildi.`);
