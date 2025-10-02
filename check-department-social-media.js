const admin = require('firebase-admin');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkDepartmentSocialMedia() {
  try {
    const snapshot = await db.collection('department').get();

    let withUrl = 0;
    let withSocialMedia = 0;
    let emptyName = 0;

    console.log('📋 Firebase\'deki bölümler:\n');

    snapshot.forEach(doc => {
      const data = doc.data();

      if (!data.name || data.name.trim() === '') {
        emptyName++;
      }

      if (data.url && data.url.trim() !== '') {
        withUrl++;
      }

      if (data.socialMedia) {
        const hasAnySocial = Object.values(data.socialMedia).some(v => v && v.trim() !== '');
        if (hasAnySocial) {
          withSocialMedia++;
          console.log(`✅ ${data.name || 'İsimsiz'} (${data.fakulteAdi})`);
          console.log(`   🌐 URL: ${data.url || '❌'}`);
          console.log(`   📱 Sosyal Medya: ${Object.keys(data.socialMedia).length} platform`);
        }
      }
    });

    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 Firebase Department Durumu:');
    console.log('='.repeat(60));
    console.log(`Toplam: ${snapshot.size} bölüm`);
    console.log(`URL ile: ${withUrl} bölüm`);
    console.log(`Sosyal medya ile: ${withSocialMedia} bölüm`);
    console.log(`İsimsiz: ${emptyName} bölüm`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    process.exit();
  }
}

checkDepartmentSocialMedia();
