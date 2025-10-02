const Exa = require('exa-js').default;
const fs = require('fs');

const EXA_API_KEY = 'c3f85f48-f839-4a48-8b18-136b834e653d';

// YTU Fakülteleri ve bölüm sayıları (resmi web sitelerinden)
const faculties = [
  {
    name: 'Eğitim Fakültesi',
    url: 'http://www.egf.yildiz.edu.tr/',
    expectedDepts: 6
  },
  {
    name: 'Elektrik-Elektronik Fakültesi',
    url: 'http://www.elk.yildiz.edu.tr/',
    expectedDepts: 6
  },
  {
    name: 'Fen-Edebiyat Fakültesi',
    url: 'http://www.fed.yildiz.edu.tr/',
    expectedDepts: 8
  },
  {
    name: 'Gemi İnşaatı ve Denizcilik Fakültesi',
    url: 'http://www.gidf.yildiz.edu.tr/',
    expectedDepts: 2
  },
  {
    name: 'İktisadi ve İdari Bilimler Fakültesi',
    url: 'http://www.iib.yildiz.edu.tr/',
    expectedDepts: 3
  },
  {
    name: 'İnşaat Fakültesi',
    url: 'http://www.ins.yildiz.edu.tr/',
    expectedDepts: 3
  },
  {
    name: 'Kimya-Metalurji Fakültesi',
    url: 'http://www.kim.yildiz.edu.tr/',
    expectedDepts: 5
  },
  {
    name: 'Makine Fakültesi',
    url: 'http://www.mak.yildiz.edu.tr/',
    expectedDepts: 3
  },
  {
    name: 'Mimarlık Fakültesi',
    url: 'http://www.mmr.yildiz.edu.tr/',
    expectedDepts: 3
  },
  {
    name: 'Sanat ve Tasarım Fakültesi',
    url: 'http://www.sts.yildiz.edu.tr/',
    expectedDepts: 3
  }
];

async function getCompleteDepartmentList() {
  try {
    const exa = new Exa(EXA_API_KEY);

    console.log('🔍 Her fakültenin bölüm listesi çıkarılıyor...\n');

    const allDepartments = [];

    for (const faculty of faculties) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📚 ${faculty.name}`);
      console.log(`🌐 ${faculty.url}`);
      console.log(`📊 Beklenen bölüm sayısı: ${faculty.expectedDepts}`);
      console.log('='.repeat(60));

      try {
        // Fakülte web sitesinden içerik çek
        const result = await exa.getContents([faculty.url], {
          text: true
        });

        if (result.results && result.results.length > 0) {
          const content = result.results[0].text;

          // Bölüm isimlerini bul
          console.log('\n📋 Bulunan bölümler:');

          // Pattern: Bölüm isimleri genellikle "Bölümü" veya "Mühendisliği" ile biter
          const deptPattern = /([A-ZÇĞİÖŞÜ][a-zçğıöşü]+(?:\s+ve\s+)?(?:[A-ZÇĞİÖŞÜ][a-zçğıöşü]+)*)\s+(?:Bölümü|Mühendisliği|Eğitimi)/g;
          const matches = content.match(deptPattern);

          if (matches) {
            const uniqueDepts = [...new Set(matches)].slice(0, faculty.expectedDepts);

            uniqueDepts.forEach((dept, i) => {
              const cleanName = dept.replace(/\s+(Bölümü|Mühendisliği|Eğitimi)$/, '');
              console.log(`   ${i + 1}. ${cleanName}`);

              allDepartments.push({
                bolumAdi: cleanName,
                fakulteAdi: faculty.name,
                url: ''
              });
            });

            console.log(`\n   ✅ ${uniqueDepts.length}/${faculty.expectedDepts} bölüm bulundu`);
          } else {
            console.log('   ❌ Bölüm bulunamadı');
          }
        }

        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.log(`   ❌ Hata: ${error.message}`);
      }
    }

    console.log(`\n\n${'='.repeat(60)}`);
    console.log('📊 TOPLAM');
    console.log('='.repeat(60));
    console.log(`   ${allDepartments.length} bölüm bulundu`);
    console.log(`   Hedef: ${faculties.reduce((sum, f) => sum + f.expectedDepts, 0)} bölüm`);
    console.log('='.repeat(60));

    // Kaydet
    fs.writeFileSync(
      'complete-department-list.json',
      JSON.stringify(allDepartments, null, 2),
      'utf-8'
    );

    console.log('\n✅ Liste complete-department-list.json dosyasına kaydedildi');

  } catch (error) {
    console.error('❌ Genel hata:', error);
  }
}

getCompleteDepartmentList();
