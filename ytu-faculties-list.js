// Yıldız Teknik Üniversitesi Fakülte Listesi

const faculties = [
  {
    name: 'Eğitim Fakültesi',
    code: 'egf',
    url: 'http://www.egf.yildiz.edu.tr/'
  },
  {
    name: 'Elektrik-Elektronik Fakültesi',
    code: 'elk',
    url: 'http://www.elk.yildiz.edu.tr/'
  },
  {
    name: 'Fen-Edebiyat Fakültesi',
    code: 'fed',
    url: 'http://www.fed.yildiz.edu.tr/'
  },
  {
    name: 'Gemi İnşaatı ve Denizcilik Fakültesi',
    code: 'gidf',
    url: 'http://www.gidf.yildiz.edu.tr/'
  },
  {
    name: 'İktisadi ve İdari Bilimler Fakültesi',
    code: 'iib',
    url: 'http://www.iib.yildiz.edu.tr/'
  },
  {
    name: 'İnşaat Fakültesi',
    code: 'ins',
    url: 'http://www.ins.yildiz.edu.tr/'
  },
  {
    name: 'Kimya-Metalürji Fakültesi',
    code: 'kim',
    url: 'http://www.kim.yildiz.edu.tr/'
  },
  {
    name: 'Makine Fakültesi',
    code: 'mak',
    url: 'http://www.mak.yildiz.edu.tr/'
  },
  {
    name: 'Mimarlık Fakültesi',
    code: 'mmr',
    url: 'http://www.mmr.yildiz.edu.tr/'
  },
  {
    name: 'Sanat ve Tasarım Fakültesi',
    code: 'sts',
    url: 'http://www.sts.yildiz.edu.tr/'
  }
];

module.exports = faculties;

// Konsola yazdır
console.log('=== YILDIZ TEKNİK ÜNİVERSİTESİ FAKÜLTELERİ ===\n');
faculties.forEach((faculty, index) => {
  console.log(`${index + 1}. ${faculty.name}`);
  console.log(`   Kod: ${faculty.code}`);
  console.log(`   URL: ${faculty.url}\n`);
});
console.log(`Toplam: ${faculties.length} fakülte`);
