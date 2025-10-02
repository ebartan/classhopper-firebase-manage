const fs = require('fs');

// Dosyayı oku
const data = JSON.parse(fs.readFileSync('faculty-cleaned-data.json', 'utf-8'));

// Her fakülteye socialMedia alanı ekle
const updatedData = data.map(faculty => {
  // Eğer zaten socialMedia alanı varsa atla
  if (faculty.socialMedia) {
    return faculty;
  }

  // Twitter bilgisi varsa text'ten çıkar
  let twitterUrl = '';
  const twitterMatch = faculty.text.match(/Tweets by (@?\w+)/i);
  if (twitterMatch) {
    const handle = twitterMatch[1].replace('@', '');
    twitterUrl = `https://twitter.com/${handle}`;
  }

  return {
    ...faculty,
    socialMedia: {
      twitter: twitterUrl,
      instagram: '',
      facebook: '',
      linkedin: '',
      youtube: ''
    }
  };
});

// Güncellenmiş veriyi dosyaya yaz
fs.writeFileSync(
  'faculty-cleaned-data.json',
  JSON.stringify(updatedData, null, 2),
  'utf-8'
);

console.log('✅ Sosyal medya alanları eklendi!');
console.log(`📊 Toplam ${updatedData.length} fakülte güncellendi.`);

// Twitter URL'lerini göster
const withTwitter = updatedData.filter(f => f.socialMedia.twitter);
console.log(`\n🐦 Twitter hesabı bulunan fakülteler: ${withTwitter.length}`);
withTwitter.forEach(f => {
  console.log(`   - ${f.faculty}: ${f.socialMedia.twitter}`);
});
