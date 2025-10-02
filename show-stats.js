const fs = require('fs');
const data = JSON.parse(fs.readFileSync('faculty-social-media-tavily-results.json', 'utf-8'));

console.log('📊 SOSYAL MEDYA İSTATİSTİKLERİ\n');
console.log('='.repeat(70));

const stats = {
  instagram: 0,
  twitter: 0,
  facebook: 0,
  linkedin: 0,
  youtube: 0
};

data.forEach(faculty => {
  console.log(`\n📚 ${faculty.facultyName}`);
  console.log('-'.repeat(70));

  Object.keys(stats).forEach(platform => {
    if (faculty.tavilyData[platform]) {
      stats[platform]++;
      const answer = faculty.tavilyData[platform].tavilyAnswer;
      const emoji = platform === 'instagram' ? '📸' :
                    platform === 'twitter' ? '🐦' :
                    platform === 'facebook' ? '👥' :
                    platform === 'linkedin' ? '💼' : '🎥';
      console.log(`  ${emoji} ${platform.toUpperCase()}: ✅`);
      if (answer) {
        console.log(`     ${answer.substring(0, 80)}...`);
      }
    }
  });
});

console.log('\n\n' + '='.repeat(70));
console.log('📈 TOPLAM İSTATİSTİKLER');
console.log('='.repeat(70));
console.log(`📸 Instagram: ${stats.instagram}/10 fakülte`);
console.log(`🐦 Twitter: ${stats.twitter}/10 fakülte`);
console.log(`👥 Facebook: ${stats.facebook}/10 fakülte`);
console.log(`💼 LinkedIn: ${stats.linkedin}/10 fakülte`);
console.log(`🎥 YouTube: ${stats.youtube}/10 fakülte`);
console.log(`📊 Toplam veri noktası: ${Object.values(stats).reduce((a, b) => a + b, 0)}`);
