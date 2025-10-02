const fs = require('fs');

// Kusursuz bölüm listesi
const perfectList = require('./perfect-department-list.json');

// Sosyal medya bilgileri olan liste
const socialMediaList = require('./departments-with-social-media.json');

console.log('🔄 Sosyal medya hesapları ekleniyor...\n');

// Her bölüm için sosyal medya ara
const finalList = perfectList.map(dept => {
  // Sosyal medya listesinde ara
  const match = socialMediaList.find(sm => {
    // URL ile eşleşme kontrolü
    if (dept.url && sm.url) {
      return dept.url.toLowerCase().includes(sm.url.toLowerCase().split('/')[2]?.split('.')[0] || '');
    }

    // İsim ile eşleşme kontrolü
    const deptName = dept.bolumAdi.toLowerCase()
      .replace(/ı/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/\s+/g, '');

    const smName = (sm.name || '').toLowerCase()
      .replace(/ı/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/\s+/g, '');

    return deptName.includes(smName) || smName.includes(deptName);
  });

  if (match && match.socialMedia) {
    console.log(`✅ ${dept.bolumAdi} - Sosyal medya eklendi`);
    return {
      ...dept,
      socialMedia: match.socialMedia
    };
  } else {
    console.log(`❌ ${dept.bolumAdi} - Sosyal medya bulunamadı`);
    return {
      ...dept,
      socialMedia: {
        twitter: '',
        instagram: '',
        facebook: '',
        linkedin: '',
        youtube: ''
      }
    };
  }
});

// Kaydet
fs.writeFileSync(
  'final-perfect-departments.json',
  JSON.stringify(finalList, null, 2),
  'utf-8'
);

const withSocial = finalList.filter(d => d.socialMedia && d.socialMedia.twitter).length;
console.log(`\n\n📊 Sonuç:`);
console.log(`   Toplam: ${finalList.length} bölüm`);
console.log(`   Sosyal medya ile: ${withSocial} bölüm`);
console.log(`   Sosyal medya olmayan: ${finalList.length - withSocial} bölüm`);
console.log(`\n✅ final-perfect-departments.json oluşturuldu`);
