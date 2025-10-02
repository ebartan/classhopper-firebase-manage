const admin = require('firebase-admin');
const fs = require('fs');

// Service account key
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function generateDepartmentMarkdownReport() {
  console.log('📄 Department sosyal medya raporu oluşturuluyor...\n');

  const snapshot = await db.collection('department').get();
  const departments = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.socialMediaAnalytics && Object.keys(data.socialMediaAnalytics).length > 0) {
      departments.push({
        id: doc.id,
        ...data
      });
    }
  });

  let markdown = `# YTU Department Sosyal Medya Analiz Raporu

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

  const facultyGroups = {};

  departments.forEach(dept => {
    Object.keys(stats).forEach(platform => {
      if (dept.socialMediaAnalytics[platform]) {
        stats[platform]++;
      }
    });

    // Fakülteye göre grupla
    if (!facultyGroups[dept.fakulteAdi]) {
      facultyGroups[dept.fakulteAdi] = [];
    }
    facultyGroups[dept.fakulteAdi].push(dept);
  });

  markdown += `| Platform | Department Sayısı | Oran |\n`;
  markdown += `|----------|-------------------|------|\n`;
  markdown += `| 📸 Instagram | ${stats.instagram}/${departments.length} | ${(stats.instagram/departments.length*100).toFixed(0)}% |\n`;
  markdown += `| 🐦 Twitter | ${stats.twitter}/${departments.length} | ${(stats.twitter/departments.length*100).toFixed(0)}% |\n`;
  markdown += `| 👥 Facebook | ${stats.facebook}/${departments.length} | ${(stats.facebook/departments.length*100).toFixed(0)}% |\n`;
  markdown += `| 💼 LinkedIn | ${stats.linkedin}/${departments.length} | ${(stats.linkedin/departments.length*100).toFixed(0)}% |\n`;
  markdown += `| 🎥 YouTube | ${stats.youtube}/${departments.length} | ${(stats.youtube/departments.length*100).toFixed(0)}% |\n`;
  markdown += `| **Toplam** | **${Object.values(stats).reduce((a, b) => a + b, 0)}** | - |\n\n`;

  markdown += `---\n\n`;

  // Fakülte bazında grupla
  markdown += `## 📚 Fakülte Bazında Department Analizi\n\n`;

  Object.entries(facultyGroups).sort((a, b) => b[1].length - a[1].length).forEach(([faculty, depts]) => {
    markdown += `### ${faculty} (${depts.length} Department)\n\n`;

    depts.forEach(dept => {
      const platformCount = Object.keys(dept.socialMediaAnalytics).length;
      markdown += `#### ${dept.bolumAdi}\n\n`;
      markdown += `**Aktif Platform Sayısı:** ${platformCount}/5\n\n`;

      const platformEmojis = {
        instagram: '📸',
        twitter: '🐦',
        facebook: '👥',
        linkedin: '💼',
        youtube: '🎥'
      };

      Object.entries(dept.socialMediaAnalytics).forEach(([platform, data]) => {
        const emoji = platformEmojis[platform];
        markdown += `##### ${emoji} ${platform.charAt(0).toUpperCase() + platform.slice(1)}\n\n`;
        markdown += `**URL:** [${data.url}](${data.url})\n\n`;

        if (data.analytics && data.analytics.summary) {
          markdown += `**Analiz Özeti:**\n`;
          markdown += `> ${data.analytics.summary}\n\n`;
        }

        if (data.analytics && data.analytics.sources && data.analytics.sources.length > 0) {
          markdown += `**Kaynaklar:**\n`;
          data.analytics.sources.slice(0, 2).forEach((source, idx) => {
            markdown += `${idx + 1}. [${source.title}](${source.url})\n`;
          });
          markdown += `\n`;
        }
      });

      markdown += `---\n\n`;
    });
  });

  // Özet ve bulgular
  markdown += `## 📈 Bulgular ve İstatistikler\n\n`;

  markdown += `### ✅ Genel Durum\n\n`;
  markdown += `- **Toplam Department**: ${departments.length}\n`;
  markdown += `- **En Yaygın Platform**: ${Object.entries(stats).sort((a, b) => b[1] - a[1])[0][0]} (${Object.entries(stats).sort((a, b) => b[1] - a[1])[0][1]} department)\n`;
  markdown += `- **Ortalama Platform Sayısı**: ${(Object.values(stats).reduce((a, b) => a + b, 0) / departments.length).toFixed(1)}/department\n\n`;

  markdown += `### 🏆 En Aktif Fakülteler\n\n`;

  Object.entries(facultyGroups)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 5)
    .forEach(([faculty, depts], idx) => {
      markdown += `${idx + 1}. **${faculty}** - ${depts.length} department\n`;
    });

  markdown += `\n---\n\n`;
  markdown += `## 🔧 Teknik Bilgiler\n\n`;
  markdown += `- **Veri Kaynağı:** Tavily API\n`;
  markdown += `- **Toplama Yöntemi:** Otomatik web scraping ve AI analizi\n`;
  markdown += `- **Veri Formatı:** Firebase Firestore\n`;
  markdown += `- **Koleksiyon:** department\n`;
  markdown += `- **Alan:** socialMediaAnalytics\n`;
  markdown += `- **Son İşlem Tarihi:** ${new Date().toLocaleString('tr-TR')}\n\n`;

  markdown += `---\n\n`;
  markdown += `*Bu rapor otomatik olarak oluşturulmuştur.*\n`;

  // Dosyaya kaydet
  const outputFile = 'department-social-media-report.md';
  fs.writeFileSync(outputFile, markdown, 'utf-8');

  console.log(`✅ Markdown raporu oluşturuldu: ${outputFile}`);
  console.log(`📄 Toplam ${markdown.split('\n').length} satır\n`);

  return outputFile;
}

generateDepartmentMarkdownReport()
  .then(() => process.exit())
  .catch(err => {
    console.error('❌ Hata:', err);
    process.exit(1);
  });
