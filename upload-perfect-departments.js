const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function uploadPerfectDepartments() {
  try {
    const departments = require('./complete-perfect-departments.json');

    console.log('🗑️  Mevcut tüm bölümler siliniyor...\n');

    // Tüm bölümleri sil
    const snapshot = await db.collection('department').get();
    const batch = db.batch();

    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`✅ ${snapshot.size} bölüm silindi\n`);

    console.log('📝 42 kusursuz bölüm ekleniyor...\n');

    // Yeni bölümleri ekle
    let added = 0;
    for (const dept of departments) {
      const data = {
        bolumAdi: dept.bolumAdi,
        fakulteAdi: dept.fakulteAdi,
        url: dept.url,
        socialMedia: dept.socialMedia,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await db.collection('department').add(data);
      console.log(`   ✅ ${dept.bolumAdi}`);
      added++;
    }

    console.log(`\n\n${'='.repeat(60)}`);
    console.log('📊 SONUÇ');
    console.log('='.repeat(60));
    console.log(`   Toplam eklenen: ${added} bölüm`);
    console.log(`   Sosyal medya ile: ${departments.filter(d => d.socialMedia?.twitter).length} bölüm`);
    console.log(`   Başarı oranı: ${Math.round((departments.filter(d => d.socialMedia?.twitter).length / added) * 100)}%`);
    console.log('='.repeat(60));
    console.log('\n✅ Kusursuz bölüm listesi Firebase\'e yüklendi!');

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    process.exit();
  }
}

uploadPerfectDepartments();
