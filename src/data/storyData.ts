import { InteractiveStory } from '../types';

export const initialStories: InteractiveStory[] = [
  {
    id: 'story_01',
    titleHangul: '홍대에서의 즐거운 저녁',
    titleId: 'Malam yang Menyenangkan di Hongdae',
    level: 'TOPIK I',
    description: 'Cerita tentang pengalaman jalan-jalan dan makan malam bersama teman di kawasan populer Hongdae, Seoul.',
    sentences: [
      {
        hangul: '오늘 저는 친구와 함께 홍대에 갔습니다.',
        romaja: 'Oneul jeoneun chingu-wa hamkke Hongdae-e gasseumnida.',
        translationId: 'Hari ini saya pergi ke Hongdae bersama teman.',
        words: [
          { word: '오늘', hangul: '오늘', romaja: 'oneul', meaning: 'Hari ini', role: 'Keterangan (K)', explanation: 'Keterangan waktu untuk menunjukkan kejadian hari ini.' },
          { word: '저는', hangul: '저 + 는', romaja: 'jeo-neun', meaning: 'Saya (topik)', role: 'Subjek (S)', explanation: 'Kata ganti sopan "저" dipasangkan dengan partikel topik "-는".' },
          { word: '친구와', hangul: '친구 + 와', romaja: 'chingu-wa', meaning: 'Teman + bersama', role: 'Partikel', explanation: 'Kata benda "친구" (teman) dengan partikel penghubung "-와" (dan/bersama).' },
          { word: '함께', hangul: '함께', romaja: 'hamkke', meaning: 'Bersama-sama', role: 'Keterangan (K)', explanation: 'Kata keterangan penjelas kebersamaan.' },
          { word: '홍대에', hangul: '홍대 + 에', romaja: 'Hongdae-e', meaning: 'Ke Hongdae', role: 'Keterangan (K)', explanation: 'Nama tempat dengan partikel penunjuk arah tujuan "-에".' },
          { word: '갔습니다', hangul: '가다 (bentuk lampau formal)', romaja: 'gasseumnida', meaning: 'Telah pergi', role: 'Predikat (P)', explanation: 'Kata kerja "가다" (pergi) dalam bentuk lampau formal 았/었습니다.' }
        ]
      },
      {
        hangul: '우리는 맛있는 불고기와 따뜻한 찌개를 먹었습니다.',
        romaja: 'Uri-neun masinneun bulgogi-wa ttatteuthan jjigae-reul meogeosseumnida.',
        translationId: 'Kami memakan bulgogi yang lezat dan jjigae yang hangat.',
        words: [
          { word: '우리는', hangul: '우리 + 는', romaja: 'uri-neun', meaning: 'Kami / Kita', role: 'Subjek (S)', explanation: 'Kata ganti jamak "우리" dengan partikel topik "-는".' },
          { word: '맛있는', hangul: '맛있다 + 는', romaja: 'masinneun', meaning: 'Yang lezat/enak', role: 'Keterangan (K)', explanation: 'Kata sifat "맛있다" diubah menjadi bentuk adjektiva penjelas kata benda.' },
          { word: '불고기와', hangul: '불고기 + 와', romaja: 'bulgogi-wa', meaning: 'Bulgogi dan', role: 'Objek (O)', explanation: 'Daging panggang bumbu Korea dengan partikel penghubung "-와".' },
          { word: '따뜻한', hangul: '따뜻하다 + ㄴ', romaja: 'ttatteuthan', meaning: 'Yang hangat', role: 'Keterangan (K)', explanation: 'Bentuk kata sifat penjelas untuk cuaca atau makanan.' },
          { word: '찌개를', hangul: '찌개 + 를', romaja: 'jjigae-reul', meaning: 'Sup rebusan (jjigae)', role: 'Objek (O)', explanation: 'Makanan sup khas Korea dengan partikel penanda objek "-를".' },
          { word: '먹었습니다', hangul: '먹다 (lampau formal)', romaja: 'meogeosseumnida', meaning: 'Telah memakan', role: 'Predikat (P)', explanation: 'Kata kerja dasar "먹다" (makan) dalam bentuk lampau sopan.' }
        ]
      },
      {
        hangul: '거리에는 활기찬 음악과 사람들의 웃음소리가 가득했습니다.',
        romaja: 'Geori-eneun hwalgichan eumak-gwa saramdeul-ui useumsori-ga gadeukhaesseumnida.',
        translationId: 'Jalanan dipenuhi dengan musik yang penuh semangat dan suara tawa orang-orang.',
        words: [
          { word: '거리에는', hangul: '거리 + 에 + 는', romaja: 'geori-eneun', meaning: 'Di jalanan', role: 'Keterangan (K)', explanation: 'Partikel lokasi "-에" digabung dengan partikel topik "-는".' },
          { word: '활기찬', hangul: '활기차다 + ㄴ', romaja: 'hwalgichan', meaning: 'Penuh semangat / berenergi', role: 'Keterangan (K)', explanation: 'Bentuk deskriptif dari kata sifat "활기차다".' },
          { word: '음악과', hangul: '음악 + 과', romaja: 'eumak-gwa', meaning: 'Musik dan', role: 'Subjek (S)', explanation: 'Kata benda berakhiran konsonan dengan partikel "-과".' },
          { word: '사람들의', hangul: '사람들 + 의', romaja: 'saramdeul-ui', meaning: 'Milik orang-orang', role: 'Partikel', explanation: 'Partikel kepemilikan "-의".' },
          { word: '웃음소리가', hangul: '웃음소리 + 가', romaja: 'useumsori-ga', meaning: 'Suara tawa', role: 'Subjek (S)', explanation: 'Kata benda dengan partikel penanda subjek "-가".' },
          { word: '가득했습니다', hangul: '가득하다 (lampau)', romaja: 'gadeukhaesseumnida', meaning: 'Telah penuh / melimpah', role: 'Predikat (P)', explanation: 'Predikat keadaan yang menggambarkan suasana penuh sesak.' }
        ]
      }
    ]
  },
  {
    id: 'story_02',
    titleHangul: '서울의 봄날과 벚꽃',
    titleId: 'Hari Musim Semi dan Bunga Sakura di Seoul',
    level: 'Dasar',
    description: 'Cerita pendek tentang suasana musim semi di Korea saat bunga sakura mulai bermekaran di tepi sungai Han.',
    sentences: [
      {
        hangul: '따뜻한 봄이 오면 한강 공원에 벚꽃이 핍니다.',
        romaja: 'Ttatteuthan bom-i omyeon Hangang gongwon-e beotkkot-i pimnida.',
        translationId: 'Ketika musim semi yang hangat datang, bunga sakura bermekaran di taman Sungai Han.',
        words: [
          { word: '따뜻한', hangul: '따뜻하다', romaja: 'ttatteuthan', meaning: 'Hangat', role: 'Keterangan (K)', explanation: 'Kata sifat penjelas musim.' },
          { word: '봄이', hangul: '봄 + 이', romaja: 'bom-i', meaning: 'Musim semi', role: 'Subjek (S)', explanation: 'Musim semi dengan partikel subjek "-이".' },
          { word: '오면', hangul: '오다 + (으)면', romaja: 'omyeon', meaning: 'Jika / ketika datang', role: 'Predikat (P)', explanation: 'Tata bahasa pengandaian/waktu "-면".' },
          { word: '한강 공원에', hangul: '한강 공원 + 에', romaja: 'Hangang gongwon-e', meaning: 'Di taman Hangang', role: 'Keterangan (K)', explanation: 'Penanda lokasi tempat kejadian.' },
          { word: '벚꽃이', hangul: '벚꽃 + 이', romaja: 'beotkkot-i', meaning: 'Bunga sakura', role: 'Subjek (S)', explanation: 'Bunga sakura Korea (cherry blossom).' },
          { word: '핍니다', hangul: '피다 + ㅂ니다', romaja: 'pimnida', meaning: 'Mekar', role: 'Predikat (P)', explanation: 'Bentuk formal sopan dari kata kerja "피다".' }
        ]
      },
      {
        hangul: '많은 가족들이 돗자리를 펴고 즐거운 시간을 보냅니다.',
        romaja: 'Maneun gajokdeul-i dotjari-reul pyeogo jeulgeoun sigan-eul bonaemnida.',
        translationId: 'Banyak keluarga menggelar tikar dan menghabiskan waktu yang menyenangkan.',
        words: [
          { word: '많은', hangul: '많다 + 은', romaja: 'maneun', meaning: 'Banyak', role: 'Keterangan (K)', explanation: 'Kata sifat yang menerangkan jumlah.' },
          { word: '가족들이', hangul: '가족 + 들 + 이', romaja: 'gajokdeul-i', meaning: 'Keluarga-keluarga', role: 'Subjek (S)', explanation: 'Penanda jamak "-들" dan partikel subjek "-이".' },
          { word: '돗자리를', hangul: '돗자리 + 를', romaja: 'dotjari-reul', meaning: 'Tikar piknik', role: 'Objek (O)', explanation: 'Objek penderita dengan partikel "-를".' },
          { word: '펴고', hangul: '펴다 + 고', romaja: 'pyeogo', meaning: 'Menggelar dan...', role: 'Predikat (P)', explanation: 'Penghubung tindakan berurutan "-고".' },
          { word: '즐거운', hangul: '즐겁다 + ㄴ', romaja: 'jeulgeoun', meaning: 'Yang menyenangkan', role: 'Keterangan (K)', explanation: 'Bentuk tidak beraturan ㅂ → 우.' },
          { word: '시간을', hangul: '시간 + 을', romaja: 'sigan-eul', meaning: 'Waktu', role: 'Objek (O)', explanation: 'Waktu dengan partikel objek.' },
          { word: '보냅니다', hangul: '보내다 + ㅂ니다', romaja: 'bonaemnida', meaning: 'Menghabiskan (waktu)', role: 'Predikat (P)', explanation: 'Kata kerja formal "보내다".' }
        ]
      }
    ]
  }
];
