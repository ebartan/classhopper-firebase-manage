const fs = require('fs');

const finalList = require('./final-perfect-departments.json');
const missingFound = require('./missing-social-media-found.json');

console.log('🔄 Eksik sosyal medya hesapları ekleniyor...\n');

const completed = finalList.map(dept => {
  const found = missingFound.find(m => m.name === dept.bolumAdi);

  if (found) {
    console.log(`✅ ${dept.bolumAdi} - Sosyal medya güncellendi`);
    return {
      ...dept,
      socialMedia: found.socialMedia
    };
  }

  return dept;
});

// Kaydet
fs.writeFileSync(
  'complete-perfect-departments.json',
  JSON.stringify(completed, null, 2),
  'utf-8'
);

const withSocial = completed.filter(d => d.socialMedia && d.socialMedia.twitter).length;
console.log(`\n\n📊 KUSURSUZ LİSTE OLUŞTURULDU:`);
console.log(`   Toplam bölüm: ${completed.length}`);
console.log(`   Sosyal medya ile: ${withSocial}`);
console.log(`   Başarı oranı: ${Math.round((withSocial / completed.length) * 100)}%`);
console.log(`\n✅ complete-perfect-departments.json hazır!`);
