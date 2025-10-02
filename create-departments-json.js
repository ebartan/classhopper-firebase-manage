const fs = require('fs');

const scrapedData = JSON.parse(fs.readFileSync('department-urls-scraped.json', 'utf-8'));

console.log('🧹 Bölüm URL\'leri temizleniyor ve JSON oluşturuluyor...\n');

// Subdomain URL'leri ve düzgün bölüm sayfalarını ayır
const cleanedDepartments = [];
const seenUrls = new Set();

scrapedData.forEach(item => {
  const url = item.departmentUrl;

  // Zaten eklenmiş mi kontrol et
  if (seenUrls.has(url)) {
    return;
  }

  // Gereksiz URL'leri filtrele
  if (
    url.includes('/haberler/') ||
    url.includes('/duyurular/') ||
    url.includes('/sertifika-programlari/') ||
    url.includes('/bolumler') ||  // Genel bölümler listesi sayfası
    url.includes('https%3A') ||    // Bozuk URL
    url.includes('/en') ||         // İngilizce sayfa
    url.includes('-dersleri') ||   // Ders listeleri
    url.includes('department-') || // İngilizce department sayfaları
    url.includes('/personel') ||   // Personel sayfaları
    url.includes('/akademik')      // Akademik kadro sayfaları
  ) {
    return;
  }

  // Subdomain URL'leri ayır (ce.yildiz.edu.tr gibi)
  const urlObj = new URL(url);
  const hostname = urlObj.hostname;
  const isSubdomain = hostname.split('.').length > 3 && !hostname.startsWith('www');

  // Bölüm adını URL'den çıkar
  let departmentName = '';
  if (isSubdomain) {
    // Subdomain'den: ce.yildiz.edu.tr -> ce
    departmentName = hostname.split('.')[0].toUpperCase();
  } else {
    // Path'ten: /bilgisayar-ve-ogretim-teknolojileri-egitimi-bolumu
    const pathParts = urlObj.pathname.split('/').filter(p => p);
    if (pathParts.length > 0) {
      departmentName = pathParts[pathParts.length - 1]
        .replace(/-bolumu$/, '')
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
  }

  cleanedDepartments.push({
    faculty: item.faculty,
    facultyUrl: item.facultyUrl,
    name: departmentName,
    url: url,
    isSubdomain: isSubdomain,
    socialMedia: {
      twitter: '',
      instagram: '',
      facebook: '',
      linkedin: '',
      youtube: ''
    }
  });

  seenUrls.add(url);
});

// Fakültelere göre grupla ve raporla
const byFaculty = {};

cleanedDepartments.forEach(dept => {
  if (!byFaculty[dept.faculty]) {
    byFaculty[dept.faculty] = [];
  }
  byFaculty[dept.faculty].push(dept);
});

console.log('📊 Fakültelere göre bölüm sayıları:\n');

let totalDepartments = 0;
let totalSubdomains = 0;

Object.keys(byFaculty).sort().forEach(faculty => {
  const depts = byFaculty[faculty];
  const subdomains = depts.filter(d => d.isSubdomain).length;

  console.log(`${faculty}`);
  console.log(`  Toplam: ${depts.length} bölüm`);
  console.log(`  Subdomain: ${subdomains}`);

  depts.forEach((d, i) => {
    console.log(`    ${i + 1}. ${d.name}`);
    console.log(`       ${d.isSubdomain ? '🌐' : '📄'} ${d.url}`);
  });
  console.log('');

  totalDepartments += depts.length;
  totalSubdomains += subdomains;
});

console.log('='.repeat(60));
console.log(`📈 TOPLAM:`);
console.log(`   Bölüm: ${totalDepartments}`);
console.log(`   Subdomain URL: ${totalSubdomains}`);
console.log(`   Fakülte içi URL: ${totalDepartments - totalSubdomains}`);
console.log('='.repeat(60));

// JSON'a kaydet
fs.writeFileSync(
  'departments-with-urls.json',
  JSON.stringify(cleanedDepartments, null, 2),
  'utf-8'
);

console.log('\n✅ Veriler departments-with-urls.json dosyasına kaydedildi.');
