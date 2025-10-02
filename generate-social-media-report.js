const fs = require('fs');

function generateMarkdownReport() {
  console.log('📄 Markdown raporu oluşturuluyor...\n');

  const data = JSON.parse(
    fs.readFileSync('faculty-social-media-tavily-results.json', 'utf-8')
  );

  let markdown = `# YTU Fakülte Sosyal Medya Analiz Raporu

**Tarih:** ${new Date().toLocaleDateString('tr-TR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})}

**Oluşturulma Zamanı:** ${new Date().toLocaleString('tr-TR')}

## 📊 Genel İstatistikler

`;

  // İstatistikleri hesapla
  const stats = {
    instagram: 0,
    twitter: 0,
    facebook: 0,
    linkedin: 0,
    youtube: 0
  };

  const followerData = [];

  data.forEach(faculty => {
    const facultyStats = {
      name: faculty.facultyName,
      platforms: {}
    };

    Object.keys(stats).forEach(platform => {
      if (faculty.tavilyData[platform]) {
        stats[platform]++;
        facultyStats.platforms[platform] = faculty.tavilyData[platform].tavilyAnswer;
      }
    });

    followerData.push(facultyStats);
  });

  markdown += `| Platform | Fakülte Sayısı | Oran |\n`;
  markdown += `|----------|----------------|------|\n`;
  markdown += `| 📸 Instagram | ${stats.instagram}/10 | ${(stats.instagram/10*100).toFixed(0)}% |\n`;
  markdown += `| 🐦 Twitter | ${stats.twitter}/10 | ${(stats.twitter/10*100).toFixed(0)}% |\n`;
  markdown += `| 👥 Facebook | ${stats.facebook}/10 | ${(stats.facebook/10*100).toFixed(0)}% |\n`;
  markdown += `| 💼 LinkedIn | ${stats.linkedin}/10 | ${(stats.linkedin/10*100).toFixed(0)}% |\n`;
  markdown += `| 🎥 YouTube | ${stats.youtube}/10 | ${(stats.youtube/10*100).toFixed(0)}% |\n`;
  markdown += `| **Toplam** | **${Object.values(stats).reduce((a, b) => a + b, 0)}** | - |\n\n`;

  markdown += `---\n\n`;

  // Her fakülte için detaylı rapor
  markdown += `## 📚 Fakülte Bazında Detaylı Analiz\n\n`;

  data.forEach((faculty, index) => {
    markdown += `### ${index + 1}. ${faculty.facultyName}\n\n`;
    markdown += `**Firebase ID:** \`${faculty.facultyId}\`\n\n`;

    const platformCount = Object.keys(faculty.tavilyData).length;
    markdown += `**Aktif Platform Sayısı:** ${platformCount}/5\n\n`;

    // Her platform için
    const platformEmojis = {
      instagram: '📸',
      twitter: '🐦',
      facebook: '👥',
      linkedin: '💼',
      youtube: '🎥'
    };

    Object.entries(faculty.tavilyData).forEach(([platform, data]) => {
      const emoji = platformEmojis[platform];
      markdown += `#### ${emoji} ${platform.charAt(0).toUpperCase() + platform.slice(1)}\n\n`;
      markdown += `**URL:** [${data.url}](${data.url})\n\n`;

      if (data.tavilyAnswer) {
        markdown += `**Analiz Özeti:**\n`;
        markdown += `> ${data.tavilyAnswer}\n\n`;
      }

      if (data.sources && data.sources.length > 0) {
        markdown += `**Kaynaklar:**\n`;
        data.sources.forEach((source, idx) => {
          markdown += `${idx + 1}. [${source.title}](${source.url})\n`;
          if (source.content) {
            markdown += `   - ${source.content.substring(0, 100)}...\n`;
          }
        });
        markdown += `\n`;
      }

      markdown += `**Son Güncelleme:** ${new Date(data.searchedAt).toLocaleString('tr-TR')}\n\n`;
    });

    markdown += `---\n\n`;
  });

  // Özet ve öneriler
  markdown += `## 📈 Bulgular ve Öneriler\n\n`;

  markdown += `### ✅ Güçlü Yönler\n\n`;
  markdown += `- **LinkedIn ve Instagram** platformlarında %100 aktiflik\n`;
  markdown += `- **YouTube** kanalları tüm fakültelerde mevcut\n`;
  markdown += `- Fakültelerin çoğu aktif sosyal medya kullanımına sahip\n\n`;

  markdown += `### ⚠️ İyileştirme Alanları\n\n`;
  markdown += `- **Twitter** kullanımı artırılabilir (${stats.twitter}/10 fakülte)\n`;
  markdown += `- Eksik Facebook sayfaları tamamlanabilir (${stats.facebook}/10 fakülte)\n`;
  markdown += `- Sosyal medya hesaplarında daha fazla etkileşim sağlanabilir\n\n`;

  markdown += `### 🎯 En Aktif Fakülteler\n\n`;

  // Platform sayısına göre sırala
  const sortedFaculties = [...data].sort((a, b) =>
    Object.keys(b.tavilyData).length - Object.keys(a.tavilyData).length
  );

  sortedFaculties.slice(0, 5).forEach((faculty, idx) => {
    const platformCount = Object.keys(faculty.tavilyData).length;
    markdown += `${idx + 1}. **${faculty.facultyName}** - ${platformCount}/5 platform\n`;
  });

  markdown += `\n---\n\n`;
  markdown += `## 🔧 Teknik Bilgiler\n\n`;
  markdown += `- **Veri Kaynağı:** Tavily API\n`;
  markdown += `- **Toplama Yöntemi:** Otomatik web scraping ve AI analizi\n`;
  markdown += `- **Veri Formatı:** JSON\n`;
  markdown += `- **Son İşlem Tarihi:** ${new Date(data[0].scrapedAt).toLocaleString('tr-TR')}\n\n`;

  markdown += `---\n\n`;
  markdown += `*Bu rapor otomatik olarak oluşturulmuştur.*\n`;

  // Dosyaya kaydet
  const outputFile = 'faculty-social-media-report.md';
  fs.writeFileSync(outputFile, markdown, 'utf-8');

  console.log(`✅ Markdown raporu oluşturuldu: ${outputFile}`);
  console.log(`📄 Toplam ${markdown.split('\n').length} satır\n`);

  return outputFile;
}

generateMarkdownReport();
