const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function cleanAndAddAllDepartments() {
  try {
    console.log('🗑️  ADIM 1: Tüm eski department kayıtlarını silme...\n');

    const snapshot = await db.collection('department').get();
    console.log(`   Silinecek: ${snapshot.size} kayıt`);

    const batch = db.batch();
    let deleteCount = 0;

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
      deleteCount++;
    });

    await batch.commit();
    console.log(`   ✅ ${deleteCount} kayıt silindi\n`);

    console.log('➕ ADIM 2: 46 bölümü temiz veri ile ekleme...\n');

    // JSON dosyasından bölümleri oku
    const departmentsData = JSON.parse(
      fs.readFileSync('departments-with-social-media.json', 'utf-8')
    );

    let successCount = 0;
    let skippedCount = 0;

    for (const deptData of departmentsData) {
      // İsimsiz kayıtları atla
      if (!deptData.name || deptData.name.trim() === '') {
        console.log(`   ⏭️  Atlanan: ${deptData.faculty} - İsimsiz bölüm`);
        skippedCount++;
        continue;
      }

      const newDeptData = {
        bolumAdi: deptData.name,
        fakulteAdi: deptData.faculty,
        url: deptData.url || '',
        socialMedia: deptData.socialMedia || {
          twitter: '',
          instagram: '',
          facebook: '',
          linkedin: '',
          youtube: ''
        },
        isSubdomain: deptData.isSubdomain || false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await db.collection('department').add(newDeptData);

      console.log(`   ✅ ${deptData.name} (${deptData.faculty}) - ID: ${docRef.id}`);
      successCount++;
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 SONUÇ');
    console.log('='.repeat(60));
    console.log(`✅ Eklenen: ${successCount} bölüm`);
    console.log(`⏭️  Atlanan: ${skippedCount} bölüm (isimsiz)`);
    console.log(`📝 Toplam: ${departmentsData.length} bölüm`);
    console.log('='.repeat(60));

    // Final kontrol
    console.log('\n🔍 Final Kontrol...\n');

    const finalSnapshot = await db.collection('department').get();
    let withUrl = 0;
    let withSocialMedia = 0;

    finalSnapshot.forEach(doc => {
      const data = doc.data();

      if (data.url && data.url.trim() !== '') {
        withUrl++;
      }

      if (data.socialMedia) {
        const hasAnySocial = Object.values(data.socialMedia).some(v => v && v.trim() !== '');
        if (hasAnySocial) {
          withSocialMedia++;
        }
      }
    });

    console.log(`📈 Firebase Department Koleksiyonu:`);
    console.log(`   📊 Toplam: ${finalSnapshot.size} bölüm`);
    console.log(`   🌐 URL ile: ${withUrl} bölüm (${Math.round(withUrl/finalSnapshot.size*100)}%)`);
    console.log(`   📱 Sosyal medya ile: ${withSocialMedia} bölüm (${Math.round(withSocialMedia/finalSnapshot.size*100)}%)`);
    console.log(`   ✅ Her bölüm isimli: ${finalSnapshot.docs.every(d => d.data().bolumAdi && d.data().bolumAdi.trim() !== '') ? 'EVET' : 'HAYIR'}`);

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    process.exit();
  }
}

cleanAndAddAllDepartments();
