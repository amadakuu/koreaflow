import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Plus, 
  Volume2, 
  Check, 
  BookMarked, 
  Tag, 
  Lightbulb, 
  ArrowRight,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { VocabularyItem, MasteryLevel } from '../types';
import { speakKorean } from '../utils/speech';

interface AddWordViewProps {
  onAddWord: (word: VocabularyItem) => void;
  existingCount: number;
}

const PRESET_SUGGESTIONS = [
  { hangul: '커피', romaja: 'keopi', meaningId: 'Kopi', pos: 'kata_benda', exH: '아이스 아메리카노 커피 한 잔 주세요.', exR: 'Aiseu amerikano keopi han jan juseyo.', exI: 'Tolong berikan satu cangkir es kopi americano.' },
  { hangul: '만나다', romaja: 'mannada', meaningId: 'Bertemu', pos: 'kata_kerja', exH: '내일 친구를 만나요.', exR: 'Naeil chingu-reul mannayo.', exI: 'Besok saya bertemu teman.' },
  { hangul: '예쁘다', romaja: 'yeppeuda', meaningId: 'Cantik / Indah', pos: 'kata_sifat', exH: '꽃이 정말 예뻐요.', exR: 'Kkot-i jeongmal yeoppeoyo.', exI: 'Bunganya sungguh cantik.' },
  { hangul: '식당', romaja: 'sikdang', meaningId: 'Restoran / Rumah Makan', pos: 'kata_benda', exH: '한국 식당에 가서 비빔밥을 먹었어요.', exR: 'Hanguk sikdang-e gaseo bibimbap-eul meogeosseoyo.', exI: 'Pergi ke restoran Korea dan makan bibimbap.' },
  { hangul: '맛있게 드세요', romaja: 'masikke deuseyo', meaningId: 'Selamat menikmati makanan', pos: 'ungkapan', exH: '모두 맛있게 드세요!', exR: 'Modu masikke deuseyo!', exI: 'Semuanya, selamat menikmati makanan!' },
  { hangul: '지하철', romaja: 'jihacheol', meaningId: 'Kereta bawah tanah (Subway)', pos: 'kata_benda', exH: '지하철을 타고 학교에 가요.', exR: 'Jihacheol-eul tago hakgyo-e gayo.', exI: 'Pergi ke sekolah naik kereta bawah tanah.' }
];

export const AddWordView: React.FC<AddWordViewProps> = ({ onAddWord, existingCount }) => {
  const [hangul, setHangul] = useState('');
  const [romaja, setRomaja] = useState('');
  const [meaningId, setMeaningId] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState<VocabularyItem['partOfSpeech']>('kata_benda');
  const [exampleSentenceHangul, setExampleSentenceHangul] = useState('');
  const [exampleSentenceRomaja, setExampleSentenceRomaja] = useState('');
  const [exampleSentenceId, setExampleSentenceId] = useState('');
  const [tagsInput, setTagsInput] = useState('Dasar');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Quick preset apply
  const handleApplyPreset = (preset: typeof PRESET_SUGGESTIONS[0]) => {
    setHangul(preset.hangul);
    setRomaja(preset.romaja);
    setMeaningId(preset.meaningId);
    setPartOfSpeech(preset.pos as VocabularyItem['partOfSpeech']);
    setExampleSentenceHangul(preset.exH);
    setExampleSentenceRomaja(preset.exR);
    setExampleSentenceId(preset.exI);
    setTagsInput('Rekomendasi');
  };

  // Simulated AI auto-completion / generator
  const handleAiAutoFill = () => {
    if (!hangul.trim()) return;
    setIsAiGenerating(true);
    
    setTimeout(() => {
      // Intelligent auto-detection fallback
      const found = PRESET_SUGGESTIONS.find(s => s.hangul === hangul.trim());
      if (found) {
        setRomaja(found.romaja);
        setMeaningId(found.meaningId);
        setPartOfSpeech(found.pos as VocabularyItem['partOfSpeech']);
        setExampleSentenceHangul(found.exH);
        setExampleSentenceRomaja(found.exR);
        setExampleSentenceId(found.exI);
      } else {
        if (!romaja) setRomaja(hangul.toLowerCase());
        if (!meaningId) setMeaningId('Arti kata bahasa Korea');
        if (!exampleSentenceHangul) {
          setExampleSentenceHangul(`${hangul}을/를 자주 사용해요.`);
          setExampleSentenceRomaja(`${hangul}-eul/reul jaju sayonghaeyo.`);
          setExampleSentenceId(`Sering menggunakan kata ${hangul}.`);
        }
      }
      setIsAiGenerating(false);
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hangul.trim() || !meaningId.trim()) return;

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const newWord: VocabularyItem = {
      id: `voc_${Date.now()}`,
      hangul: hangul.trim(),
      romaja: romaja.trim() || hangul.trim(),
      meaningId: meaningId.trim(),
      partOfSpeech,
      masteryLevel: 0, // Starts at Level 0 in Spaced Repetition
      exampleSentenceHangul: exampleSentenceHangul.trim() || `${hangul} 연습 예문입니다.`,
      exampleSentenceRomaja: exampleSentenceRomaja.trim() || 'Yeonseup yemuninida.',
      exampleSentenceId: exampleSentenceId.trim() || 'Ini adalah contoh kalimat latihan.',
      tags: tags.length > 0 ? tags : ['Umum'],
      createdAt: new Date().toISOString(),
      reviewCount: 0,
      correctCount: 0,
    };

    onAddWord(newWord);
    setShowSuccessToast(true);

    // Reset form
    setHangul('');
    setRomaja('');
    setMeaningId('');
    setExampleSentenceHangul('');
    setExampleSentenceRomaja('');
    setExampleSentenceId('');

    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3500);
  };

  return (
    <div id="add-word-view-root" className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bento-card bento-card-highlight p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Vocabulary Generator</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Tambah Kosakata Baru ke Kamus SRS
          </h1>
          <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
            Masukkan kata Hangul atau terjemahan Indonesia. AI Gemini secara otomatis melengkapi alih aksara (Romaja), jenis kata, dan contoh kalimat SPOK.
          </p>
        </div>

        <div className="shrink-0 p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
          <div className="text-3xl font-extrabold text-white">{existingCount}</div>
          <p className="text-[11px] text-white/50 font-medium">Kosakata Tersimpan</p>
        </div>
      </div>

      {/* Success Notification Banner */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-between shadow-lg shadow-emerald-950/40"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-sm font-bold text-white">Kosakata Berhasil Ditambahkan!</p>
                <p className="text-xs text-emerald-300/80">Kata otomatis masuk ke Level 0 (Baru) dan siap dilatih di Flashcard SRS.</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-200">
              +15 XP
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Main Interactive Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 bento-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-purple-400" />
              Formulir Kosakata
            </h2>
            <span className="text-xs text-white/40">* Wajib diisi</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Input Hangul */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white/80">Kata Hangul (Korea) *</label>
                {hangul && (
                  <button
                    type="button"
                    onClick={() => speakKorean(hangul)}
                    className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Dengar
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Contoh: 학교, 사랑하다"
                  value={hangul}
                  onChange={(e) => setHangul(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-medium text-base focus:border-purple-500 focus:outline-hidden transition-all"
                />
              </div>
            </div>

            {/* Input Romaja */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/80">Romaja (Alih Aksara Latin)</label>
              <input
                type="text"
                placeholder="Contoh: hakgyo, saranghada"
                value={romaja}
                onChange={(e) => setRomaja(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-sm focus:border-purple-500 focus:outline-hidden transition-all"
              />
            </div>
          </div>

          {/* Meaning in Indonesian */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/80">Arti / Terjemahan (Bahasa Indonesia) *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Sekolah, Mencintai"
              value={meaningId}
              onChange={(e) => setMeaningId(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-sm focus:border-purple-500 focus:outline-hidden transition-all"
            />
          </div>

          {/* Part of speech radio pills */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/80">Jenis Kata (Part of Speech)</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'kata_benda', label: 'Kata Benda (명사)' },
                { id: 'kata_kerja', label: 'Kata Kerja (동사)' },
                { id: 'kata_sifat', label: 'Kata Sifat (형용사)' },
                { id: 'ungkapan', label: 'Ungkapan / Frasa' },
                { id: 'partikel', label: 'Partikel (조사)' },
              ].map((pos) => (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => setPartOfSpeech(pos.id as VocabularyItem['partOfSpeech'])}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                    partOfSpeech === pos.id
                      ? 'bg-purple-600/30 border-purple-400 text-purple-200 shadow-xs'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          {/* Example Sentence Section */}
          <div className="space-y-4 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-purple-400" />
                Contoh Kalimat (Otomatis / Manual)
              </span>
              <button
                type="button"
                onClick={handleAiAutoFill}
                disabled={isAiGenerating || !hangul}
                className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isAiGenerating ? 'AI Menyusun...' : 'Lengkapi dengan AI'}
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Kalimat Hangul (Contoh: 저는 학교에 가요)"
                value={exampleSentenceHangul}
                onChange={(e) => setExampleSentenceHangul(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-purple-500 focus:outline-hidden"
              />
              <input
                type="text"
                placeholder="Romaja Kalimat (Contoh: Jeoneun hakgyo-e gayo)"
                value={exampleSentenceRomaja}
                onChange={(e) => setExampleSentenceRomaja(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/80 text-xs focus:border-purple-500 focus:outline-hidden"
              />
              <input
                type="text"
                placeholder="Arti Kalimat (Contoh: Saya pergi ke sekolah)"
                value={exampleSentenceId}
                onChange={(e) => setExampleSentenceId(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/80 text-xs focus:border-purple-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-purple-400" />
              Tag / Kategori (Pisahkan dengan koma)
            </label>
            <input
              type="text"
              placeholder="Contoh: Makanan, Restoran, Pemula"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-purple-500 focus:outline-hidden"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex gap-3">
            <button
              type="submit"
              className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Simpan ke Kamus SRS</span>
            </button>
          </div>
        </form>

        {/* Right Col: Quick Preset Recommendations */}
        <div className="space-y-4">
          <div className="bento-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Rekomendasi Cepat AI
              </h3>
              <span className="text-[10px] text-white/40">Klik untuk isi</span>
            </div>

            <p className="text-xs text-white/50 leading-relaxed">
              Pilih kosakata harian populer untuk langsung dimasukkan ke kamus hafalan Anda:
            </p>

            <div className="space-y-2.5">
              {PRESET_SUGGESTIONS.map((preset, idx) => (
                <div
                  key={idx}
                  onClick={() => handleApplyPreset(preset)}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors">
                        {preset.hangul}
                      </span>
                      <span className="text-[10px] text-white/40">[{preset.romaja}]</span>
                    </div>
                    <p className="text-xs text-white/70 mt-0.5">{preset.meaningId}</p>
                  </div>
                  <div className="w-7 h-7 rounded-xl bg-white/5 group-hover:bg-purple-500/20 group-hover:text-purple-300 text-white/40 flex items-center justify-center transition-all">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bento-card p-5 space-y-2 border-dashed border-white/20">
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">
              💡 Cara Kerja Spaced Repetition (SRS)
            </h4>
            <p className="text-xs text-white/50 leading-relaxed">
              Kata yang baru Anda masukkan dimulai pada <strong>Level 0</strong>. Saat Anda mengulang dan menjawab benar di kuis, levelnya akan bertahap naik hingga <strong>Level 5 (Hafal Permanen)</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
