import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Sparkles, 
  Volume2, 
  Plus, 
  Layers, 
  Info, 
  Check, 
  BookmarkCheck,
  ChevronRight
} from 'lucide-react';
import { InteractiveStory, StoryWordAnalysis, VocabularyItem } from '../types';
import { initialStories } from '../data/storyData';
import { speakKorean } from '../utils/speech';

interface StoryViewProps {
  onAddWord: (word: VocabularyItem) => void;
}

export const StoryView: React.FC<StoryViewProps> = ({ onAddWord }) => {
  const [stories] = useState<InteractiveStory[]>(initialStories);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [selectedWord, setSelectedWord] = useState<StoryWordAnalysis | null>(null);
  const [addedWordHangul, setAddedWordHangul] = useState<string | null>(null);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number | null>(null);

  const currentStory = stories[selectedStoryIndex] || stories[0];

  const handleAddStoryWordToVocab = (wordAnalysis: StoryWordAnalysis) => {
    const newWord: VocabularyItem = {
      id: `voc_story_${Date.now()}`,
      hangul: wordAnalysis.hangul.split(' ')[0], // Base word
      romaja: wordAnalysis.romaja,
      meaningId: wordAnalysis.meaning,
      partOfSpeech: 'kata_benda',
      masteryLevel: 0,
      exampleSentenceHangul: currentStory.sentences[0]?.hangul || wordAnalysis.hangul,
      exampleSentenceRomaja: currentStory.sentences[0]?.romaja || wordAnalysis.romaja,
      exampleSentenceId: currentStory.sentences[0]?.translationId || wordAnalysis.meaning,
      grammarNotes: wordAnalysis.explanation,
      tags: ['Cerita', currentStory.level],
      createdAt: new Date().toISOString(),
      reviewCount: 0,
      correctCount: 0,
    };

    onAddWord(newWord);
    setAddedWordHangul(wordAnalysis.hangul);
    setTimeout(() => setAddedWordHangul(null), 3000);
  };

  const getRoleColor = (role: StoryWordAnalysis['role']) => {
    switch (role) {
      case 'Subjek (S)':
        return 'text-sky-300 bg-sky-500/15 border-sky-500/30';
      case 'Predikat (P)':
        return 'text-purple-300 bg-purple-500/15 border-purple-500/30';
      case 'Objek (O)':
        return 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30';
      case 'Partikel':
        return 'text-amber-300 bg-amber-500/15 border-amber-500/30';
      default:
        return 'text-indigo-300 bg-indigo-500/15 border-indigo-500/30';
    }
  };

  return (
    <div id="story-view-root" className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bento-card p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Interactive Grammar Reader</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Cerita & Analisis Tata Bahasa SPOK
          </h1>
          <p className="text-xs sm:text-sm text-white/60 max-w-2xl leading-relaxed">
            Klik kata manapun di dalam kalimat untuk membedah struktur gramatika, partikel penanda (-은/는, -이/가, -을/를), serta fungsi peran katanya secara interaktif.
          </p>
        </div>

        {/* Story Selector Pills */}
        <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl">
          {stories.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => {
                setSelectedStoryIndex(idx);
                setSelectedWord(null);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedStoryIndex === idx
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Cerita {idx + 1} ({s.level})
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Main Interactive Story Reader */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bento-card p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                  Level {currentStory.level}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  {currentStory.titleHangul}
                </h2>
                <p className="text-xs text-white/50">{currentStory.titleId}</p>
              </div>

              <button
                onClick={() => speakKorean(currentStory.sentences.map(s => s.hangul).join(' '))}
                className="px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>Baca Seluruh Cerita</span>
              </button>
            </div>

            {/* Sentences Container */}
            <div className="space-y-6 pt-2">
              {currentStory.sentences.map((sentence, sIdx) => (
                <div
                  key={sIdx}
                  className={`p-5 rounded-2xl border transition-all ${
                    activeSentenceIndex === sIdx
                      ? 'bg-white/10 border-purple-500/40 ring-1 ring-purple-500/30'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Interactive Words */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {sentence.words.map((w, wIdx) => {
                      const isSelected = selectedWord?.hangul === w.hangul;
                      return (
                        <button
                          key={wIdx}
                          onClick={() => {
                            setSelectedWord(w);
                            setActiveSentenceIndex(sIdx);
                            speakKorean(w.word);
                          }}
                          className={`px-3 py-1.5 rounded-xl font-bold text-base sm:text-lg border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-400 text-black border-emerald-300 shadow-md shadow-emerald-500/20 scale-105'
                              : 'bg-white/5 hover:bg-white/15 text-white border-white/10'
                          }`}
                        >
                          {w.word}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => {
                        setActiveSentenceIndex(sIdx);
                        speakKorean(sentence.hangul);
                      }}
                      className="p-2 rounded-xl bg-white/5 text-purple-300 hover:text-white hover:bg-purple-600/30 transition-colors ml-auto cursor-pointer"
                      title="Dengarkan Kalimat Ini"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Romaja & Translation */}
                  <div className="space-y-1 pt-2 border-t border-white/5">
                    <p className="text-xs text-purple-300/80 font-medium">
                      {sentence.romaja}
                    </p>
                    <p className="text-xs sm:text-sm text-white/80">
                      {sentence.translationId}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Word Grammar Inspector Drawer */}
        <div className="space-y-6">
          <div className="bento-card p-6 space-y-5 sticky top-24">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-purple-400" />
                Bedah Tata Bahasa & Peran Kata
              </h3>
            </div>

            {selectedWord ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-center">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getRoleColor(selectedWord.role)}`}>
                    {selectedWord.role}
                  </span>
                  <h4 className="text-3xl font-extrabold text-white">{selectedWord.hangul}</h4>
                  <p className="text-xs text-purple-300 font-medium">[{selectedWord.romaja}]</p>
                  <p className="text-sm font-bold text-emerald-300 pt-1">
                    Arti: {selectedWord.meaning}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">
                    Penjelasan Gramatika
                  </span>
                  <p className="text-xs text-white/70 leading-relaxed p-3.5 rounded-xl bg-white/5 border border-white/5">
                    {selectedWord.explanation}
                  </p>
                </div>

                <button
                  onClick={() => handleAddStoryWordToVocab(selectedWord)}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  {addedWordHangul === selectedWord.hangul ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Tersimpan di Kamus!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Simpan Kata ke Kamus SRS</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="p-8 text-center space-y-3">
                <p className="text-xs text-white/40 leading-relaxed">
                  Sentuh atau klik salah satu kata Hangul pada teks cerita di sebelah kiri untuk melihat bedah peran kata dan partikel gramatikalnya di sini.
                </p>
              </div>
            )}

            {/* Grammar Legend */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <span className="text-[10px] font-bold text-white/40 uppercase">Panduan Warna Partikel</span>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <div className="text-sky-300">🔵 Subjek (S)</div>
                <div className="text-emerald-300">🟢 Objek (O)</div>
                <div className="text-purple-300">🟣 Predikat (P)</div>
                <div className="text-amber-300">🟡 Partikel Penghubung</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
