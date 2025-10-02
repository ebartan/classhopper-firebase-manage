const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkFacultyNames() {
  try {
    // JSON dosyasından fakülte isimlerini al
    const jsonData = JSON.parse(fs.readFileSync('faculty-cleaned-data.json', 'utf8'));
    const jsonFaculties = jsonData.map(f => f.faculty);

    console.log('=== JSON DOSYASINDAKI FAKÜLTELER ===\n');
    jsonFaculties.forEach((name, index) => {
      console.log(`${index + 1}. ${name}`);
    });

    console.log('\n=== FIREBASE\'DEKİ FAKÜLTELER ===\n');

    // Firebase'den fakülte isimlerini al
    const facultiesSnapshot = await db.collection('faculty').get();
    const firebaseFaculties = [];

    facultiesSnapshot.docs.forEach((doc, index) => {
      const name = doc.data().name;
      firebaseFaculties.push(name);
      console.log(`${index + 1}. ${name}`);
    });

    console.log('\n=== KARŞILAŞTIRMA ===\n');

    // JSON'da olup Firebase'de olmayanlar
    const notInFirebase = jsonFaculties.filter(name => !firebaseFaculties.includes(name));
    if (notInFirebase.length > 0) {
      console.log('❌ JSON\'da olup Firebase\'de OLMAYAN fakülteler:');
      notInFirebase.forEach(name => console.log(`   - ${name}`));
    } else {
      console.log('✓ JSON\'daki tüm fakülteler Firebase\'de mevcut');
    }

    console.log('');

    // Firebase'de olup JSON'da olmayanlar
    const notInJson = firebaseFaculties.filter(name => !jsonFaculties.includes(name));
    if (notInJson.length > 0) {
      console.log('❌ Firebase\'de olup JSON\'da OLMAYAN fakülteler:');
      notInJson.forEach(name => console.log(`   - ${name}`));
    } else {
      console.log('✓ Firebase\'deki tüm fakülteler JSON\'da mevcut');
    }

    console.log('');

    // Eşleşenler
    const matching = jsonFaculties.filter(name => firebaseFaculties.includes(name));
    console.log(`\n✓ Eşleşen fakülte sayısı: ${matching.length}/${jsonFaculties.length}`);

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    process.exit();
  }
}

checkFacultyNames();
