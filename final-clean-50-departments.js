const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function finalClean50Departments() {
  try {
    console.log('🗑️  Tüm department kayıtlarını silme...\n');

    const snapshot = await db.collection('department').get();
    console.log(`   Silinecek: ${snapshot.size} kayıt`);

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`   ✅ Silindi\n`);

    console.log('➕ 50 BÖLÜMÜ EKSİKSİZ OLARAK EKLEME...\n');

    // YTU'nun 50 bölümü
    const departments = [
      // Eğitim Fakültesi (6)
      { bolumAdi: 'Bilgisayar ve Öğretim Teknolojileri Eğitimi', fakulteAdi: 'Eğitim Fakültesi', url: 'http://www.egf.yildiz.edu.tr/bilgisayar-ve-ogretim-teknolojileri-egitimi-bolumu' },
      { bolumAdi: 'Eğitim Bilimleri', fakulteAdi: 'Eğitim Fakültesi', url: 'http://www.egf.yildiz.edu.tr/egitim-bilimleri-bolumu' },
      { bolumAdi: 'Matematik ve Fen Bilimleri Eğitimi', fakulteAdi: 'Eğitim Fakültesi', url: 'http://www.egf.yildiz.edu.tr/matematik-ve-fen-bilimleri-egitimi-bolumu' },
      { bolumAdi: 'Temel Eğitim', fakulteAdi: 'Eğitim Fakültesi', url: 'http://www.egf.yildiz.edu.tr/temel-egitim-bolumu' },
      { bolumAdi: 'Türkçe ve Sosyal Bilimler Eğitimi', fakulteAdi: 'Eğitim Fakültesi', url: 'http://www.egf.yildiz.edu.tr/turkce-ve-sosyal-bilimler-egitimi-bolumu' },
      { bolumAdi: 'Yabancı Diller Eğitimi', fakulteAdi: 'Eğitim Fakültesi', url: 'http://www.egf.yildiz.edu.tr/yabanci-diller-egitimi-bolumu' },

      // Elektrik-Elektronik Fakültesi (6)
      { bolumAdi: 'Bilgisayar Mühendisliği', fakulteAdi: 'Elektrik-Elektronik Fakültesi', url: 'http://ce.yildiz.edu.tr/' },
      { bolumAdi: 'Biyomedikal Mühendisliği', fakulteAdi: 'Elektrik-Elektronik Fakültesi', url: 'http://bme.yildiz.edu.tr/' },
      { bolumAdi: 'Elektrik Mühendisliği', fakulteAdi: 'Elektrik-Elektronik Fakültesi', url: 'http://elm.yildiz.edu.tr/' },
      { bolumAdi: 'Elektronik ve Haberleşme Mühendisliği', fakulteAdi: 'Elektrik-Elektronik Fakültesi', url: 'http://ehm.yildiz.edu.tr/' },
      { bolumAdi: 'Kontrol ve Otomasyon Mühendisliği', fakulteAdi: 'Elektrik-Elektronik Fakültesi', url: 'http://kom.yildiz.edu.tr/' },
      { bolumAdi: 'Yapay Zeka ve Veri Mühendisliği', fakulteAdi: 'Elektrik-Elektronik Fakültesi', url: 'http://ai.yildiz.edu.tr/' },

      // Fen-Edebiyat Fakültesi (8)
      { bolumAdi: 'Matematik', fakulteAdi: 'Fen-Edebiyat Fakültesi', url: 'http://www.fed.yildiz.edu.tr/matematik-bolumu' },
      { bolumAdi: 'Fizik', fakulteAdi: 'Fen-Edebiyat Fakültesi', url: 'http://www.fed.yildiz.edu.tr/fizik-bolumu' },
      { bolumAdi: 'Kimya', fakulteAdi: 'Fen-Edebiyat Fakültesi', url: 'http://www.fed.yildiz.edu.tr/kimya-bolumu' },
      { bolumAdi: 'Moleküler Biyoloji ve Genetik', fakulteAdi: 'Fen-Edebiyat Fakültesi', url: 'http://www.fed.yildiz.edu.tr/molekuler-biyoloji-ve-genetik-bolumu' },
      { bolumAdi: 'İstatistik', fakulteAdi: 'Fen-Edebiyat Fakültesi', url: 'http://www.fed.yildiz.edu.tr/istatistik-bolumu' },
      { bolumAdi: 'Türk Dili ve Edebiyatı', fakulteAdi: 'Fen-Edebiyat Fakültesi', url: 'http://www.fed.yildiz.edu.tr/turk-dili-ve-edebiyati-bolumu' },
      { bolumAdi: 'Batı Dilleri ve Edebiyatları', fakulteAdi: 'Fen-Edebiyat Fakültesi', url: 'http://www.fed.yildiz.edu.tr/bati-dilleri-ve-edebiyatlari-bolumu' },
      { bolumAdi: 'İnsan ve Toplum Bilimleri', fakulteAdi: 'Fen-Edebiyat Fakültesi', url: '' },

      // Gemi İnşaatı ve Denizcilik Fakültesi (2)
      { bolumAdi: 'Gemi İnşaatı ve Gemi Makineleri Mühendisliği', fakulteAdi: 'Gemi İnşaatı ve Denizcilik Fakültesi', url: 'http://gim.yildiz.edu.tr/' },
      { bolumAdi: 'Gemi Makineleri İşletme Mühendisliği', fakulteAdi: 'Gemi İnşaatı ve Denizcilik Fakültesi', url: 'http://gmim.yildiz.edu.tr/' },

      // İktisadi ve İdari Bilimler Fakültesi (3)
      { bolumAdi: 'İktisat', fakulteAdi: 'İktisadi ve İdari Bilimler Fakültesi', url: 'http://ikt.yildiz.edu.tr/' },
      { bolumAdi: 'İşletme', fakulteAdi: 'İktisadi ve İdari Bilimler Fakültesi', url: 'http://isl.yildiz.edu.tr/' },
      { bolumAdi: 'Siyaset Bilimi ve Uluslararası İlişkiler', fakulteAdi: 'İktisadi ve İdari Bilimler Fakültesi', url: 'http://sbu.yildiz.edu.tr/' },

      // İnşaat Fakültesi (3)
      { bolumAdi: 'İnşaat Mühendisliği', fakulteAdi: 'İnşaat Fakültesi', url: 'https://inm.yildiz.edu.tr/' },
      { bolumAdi: 'Harita Mühendisliği', fakulteAdi: 'İnşaat Fakültesi', url: 'https://hrm.yildiz.edu.tr/' },
      { bolumAdi: 'Çevre Mühendisliği', fakulteAdi: 'İnşaat Fakültesi', url: 'https://cem.yildiz.edu.tr/' },

      // Kimya-Metalurji Fakültesi (5)
      { bolumAdi: 'Biyomühendislik', fakulteAdi: 'Kimya-Metalurji Fakültesi', url: 'http://bioeng.yildiz.edu.tr/' },
      { bolumAdi: 'Gıda Mühendisliği', fakulteAdi: 'Kimya-Metalurji Fakültesi', url: 'http://food.yildiz.edu.tr/' },
      { bolumAdi: 'Kimya Mühendisliği', fakulteAdi: 'Kimya-Metalurji Fakültesi', url: 'http://kmm.yildiz.edu.tr/' },
      { bolumAdi: 'Matematik Mühendisliği', fakulteAdi: 'Kimya-Metalurji Fakültesi', url: 'http://mtm.yildiz.edu.tr/' },
      { bolumAdi: 'Metalurji ve Malzeme Mühendisliği', fakulteAdi: 'Kimya-Metalurji Fakültesi', url: 'http://met.yildiz.edu.tr/' },

      // Makine Fakültesi (3)
      { bolumAdi: 'Makine Mühendisliği', fakulteAdi: 'Makine Fakültesi', url: 'http://mkm.yildiz.edu.tr/' },
      { bolumAdi: 'Endüstri Mühendisliği', fakulteAdi: 'Makine Fakültesi', url: 'http://enm.yildiz.edu.tr/' },
      { bolumAdi: 'Mekatronik Mühendisliği', fakulteAdi: 'Makine Fakültesi', url: 'http://mkt.yildiz.edu.tr/' },

      // Mimarlık Fakültesi (3)
      { bolumAdi: 'Mimarlık', fakulteAdi: 'Mimarlık Fakültesi', url: 'http://mim.yildiz.edu.tr/' },
      { bolumAdi: 'Şehir ve Bölge Planlama', fakulteAdi: 'Mimarlık Fakültesi', url: 'http://sbp.yildiz.edu.tr/' },
      { bolumAdi: 'Kültür Varlıklarını Koruma ve Onarım', fakulteAdi: 'Mimarlık Fakültesi', url: 'http://kvko.yildiz.edu.tr/' },

      // Sanat ve Tasarım Fakültesi (3)
      { bolumAdi: 'Müzik ve Sahne Sanatları', fakulteAdi: 'Sanat ve Tasarım Fakültesi', url: 'https://mssb.yildiz.edu.tr/' },
      { bolumAdi: 'İletişim Tasarımı', fakulteAdi: 'Sanat ve Tasarım Fakültesi', url: 'https://ilet.yildiz.edu.tr/' },
      { bolumAdi: 'Sanat', fakulteAdi: 'Sanat ve Tasarım Fakültesi', url: 'https://sab.yildiz.edu.tr/' },
    ];

    console.log(`Toplam ${departments.length} bölüm eklenecek\n`);

    // JSON'dan sosyal medya verilerini al
    const socialMediaData = JSON.parse(
      fs.readFileSync('departments-with-social-media.json', 'utf-8')
    );

    let successCount = 0;

    for (const dept of departments) {
      // URL'e göre sosyal medya bul
      const matchingDept = socialMediaData.find(d => d.url === dept.url);

      const newDeptData = {
        bolumAdi: dept.bolumAdi,
        fakulteAdi: dept.fakulteAdi,
        url: dept.url || '',
        socialMedia: matchingDept?.socialMedia || {
          twitter: '',
          instagram: '',
          facebook: '',
          linkedin: '',
          youtube: ''
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await db.collection('department').add(newDeptData);

      const hasSocial = Object.values(newDeptData.socialMedia).some(v => v && v.trim() !== '');

      console.log(`   ${hasSocial ? '✅' : '⚠️ '} ${dept.bolumAdi} (${dept.fakulteAdi})`);

      successCount++;
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ ${successCount}/${departments.length} bölüm eklendi`);
    console.log('='.repeat(60));

    // Final kontrol
    const finalSnapshot = await db.collection('department').get();
    let withSocialMedia = 0;

    finalSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.socialMedia) {
        const hasSocial = Object.values(data.socialMedia).some(v => v && v.trim() !== '');
        if (hasSocial) withSocialMedia++;
      }
    });

    console.log(`\n📊 FINAL DURUM:`);
    console.log(`   Toplam: ${finalSnapshot.size} bölüm`);
    console.log(`   Sosyal medya ile: ${withSocialMedia}/${finalSnapshot.size} (${Math.round(withSocialMedia/finalSnapshot.size*100)}%)`);

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    process.exit();
  }
}

finalClean50Departments();
