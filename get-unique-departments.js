const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function getUniqueDepartments() {
  try {
    const snapshot = await db.collection('department').get();

    console.log(`📊 Firebase'de toplam ${snapshot.size} bölüm kaydı var\n`);

    // Tüm bölümleri çek
    const allDepartments = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      allDepartments.push({
        id: doc.id,
        bolumAdi: data.bolumAdi || data.name || '',
        fakulteAdi: data.fakulteAdi || '',
        url: data.url || '',
        socialMedia: data.socialMedia || null,
        createdAt: data.createdAt
      });
    });

    // Fakülte ve bölüm adına göre unique yap
    const uniqueMap = new Map();

    allDepartments.forEach(dept => {
      const key = `${dept.fakulteAdi}_${dept.bolumAdi}`;

      // Eğer bu key zaten varsa, daha iyi veriyi seç
      if (uniqueMap.has(key)) {
        const existing = uniqueMap.get(key);

        // Hangisi daha iyi veri: URL ve sosyal medya var mı?
        const existingScore = (existing.url ? 1 : 0) + (existing.socialMedia ? 1 : 0);
        const newScore = (dept.url ? 1 : 0) + (dept.socialMedia ? 1 : 0);

        if (newScore > existingScore) {
          uniqueMap.set(key, dept);
        }
      } else {
        uniqueMap.set(key, dept);
      }
    });

    const uniqueDepartments = Array.from(uniqueMap.values());

    console.log(`✅ Unique bölüm sayısı: ${uniqueDepartments.length}\n`);

    // İsimsiz olanları ve sosyal medya olmayanları say
    const unnamed = uniqueDepartments.filter(d => !d.bolumAdi || d.bolumAdi.trim() === '');
    const withoutSocial = uniqueDepartments.filter(d => !d.socialMedia);
    const withoutUrl = uniqueDepartments.filter(d => !d.url || d.url.trim() === '');

    console.log(`📊 Durum Analizi:`);
    console.log(`   ❌ İsimsiz: ${unnamed.length}`);
    console.log(`   ❌ Sosyal medya yok: ${withoutSocial.length}`);
    console.log(`   ❌ URL yok: ${withoutUrl.length}`);
    console.log(`   ✅ Tam veri: ${uniqueDepartments.length - Math.max(unnamed.length, withoutSocial.length, withoutUrl.length)}\n`);

    // İsimsiz olanları göster
    if (unnamed.length > 0) {
      console.log('🔍 İsimsiz Bölümler:\n');
      unnamed.forEach((dept, i) => {
        console.log(`${i + 1}. Fakülte: ${dept.fakulteAdi}`);
        console.log(`   ID: ${dept.id}`);
        console.log(`   URL: ${dept.url || 'Yok'}`);
        console.log('');
      });
    }

    // Kaydet
    fs.writeFileSync(
      'unique-departments.json',
      JSON.stringify(uniqueDepartments, null, 2),
      'utf-8'
    );

    console.log('✅ Unique bölümler unique-departments.json dosyasına kaydedildi');

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    process.exit();
  }
}

getUniqueDepartments();
