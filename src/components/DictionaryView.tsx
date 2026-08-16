import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookMarked, 
  Search, 
  Volume2, 
  Layers, 
  Award, 
  RotateCw, 
  Check, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Sparkles,
  ArrowUpRight,
  Trash2
} from 'lucide-react';
import { VocabularyItem, MasteryLevel } from '../types';
import { speakKorean } from '../utils/speech';

interface DictionaryViewProps {
  vocabularyList: VocabularyItem[];
  onUpdateMastery: (id: string, newLevel: MasteryLevel) => void;
  onDeleteWord: (id: string) => void;
  onNavigateAddWord: () => void;
}

export const DictionaryView: React.FC<DictionaryViewProps> = ({
  vocabularyList,
  onUpdateMastery,
  onDeleteWord,
  onNavigateAddWord,
}) => {
  const [viewMode, setViewMode] = useState<'flashcard' | 'list'>('flashcard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<number | 'all'>('all');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Filtered vocabulary items
  const filteredWords = vocabularyList.filter((item) => {
    const matchesSearch = 
      item.hangul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.romaja.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.meaningId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLevel = selectedLevelFilter === 'all' || item.masteryLevel === selectedLevelFilter;

    return matchesSearch && matchesLevel;
  });

  const currentCard = filteredWords[currentCardIndex] || filteredWords[0];

  const handleNextCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % Math.max(1, filteredWords.length));
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev - 1 + filteredWords.length) % Math.max(1, filteredWords.length));
  };

  const handleRateMastery = (increase: boolean) => {
    if (!currentCard) return;
    const current = currentCard.masteryLevel;
    let nextLevel: MasteryLevel = current;
    if (increase) {
      nextLevel = Math.min(5, current + 1) as MasteryLevel;
    } else {
      nextLevel = Math.max(0, current - 1) as MasteryLevel;
    }
    onUpdateMastery(currentCard.id, nextLevel);
    handleNextCard();
  };

  const levelBadges = [
    { level: 0, label: 'Lv 0 (Baru)', color: 'bg-slate-500/20 text-slate-300 border-slate-500/40' },
    { level: 1, label: 'Lv 1 (Mulai)', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
    { level: 2, label: 'Lv 2 (Cukup)', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    { level: 3, label: 'Lv 3 (Menengah)', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
    { level: 4, label: 'Lv 4 (Kuat)', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
    { level: 5, label: 'Lv 5 (Kuasai)', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  ];

  return (
    <div id="dictionary-view-root" className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top Header & Switcher */}
      <div className="bento-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30 mb-2">
            <BookMarked className="w-3.5 h-3.5" />
            <span>Spaced Repetition System</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Kamus Flashcard & Kosakata SRS
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1">
            Ulas kartu hafalan atau telusuri seluruh perbendaharaan kata Korea Anda.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl">
          <button
            onClick={() => setViewMode('flashcard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'flashcard'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            🎴 Flashcard 3D
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            📋 Daftar Kosakata ({vocabularyList.length})
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bento-card p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari Hangul, Romaja, atau arti Indonesia..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentCardIndex(0);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-white text-xs sm:text-sm focus:border-purple-500 focus:outline-hidden"
          />
        </div>

        {/* Level Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => {
              setSelectedLevelFilter('all');
              setCurrentCardIndex(0);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedLevelFilter === 'all'
                ? 'bg-white text-black font-bold shadow-xs'
                : 'bg-white/5 text-white/60 hover:text-white border border-white/5'
            }`}
          >
            Semua ({vocabularyList.length})
          </button>
          {levelBadges.map((badge) => {
            const count = vocabularyList.filter(v => v.masteryLevel === badge.level).length;
            const isSelected = selectedLevelFilter === badge.level;
            return (
              <button
                key={badge.level}
                onClick={() => {
                  setSelectedLevelFilter(badge.level);
                  setCurrentCardIndex(0);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-purple-600 text-white border-purple-400 font-bold shadow-xs'
                    : `${badge.color} hover:opacity-100 opacity-70`
                }`}
              >
                {badge.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {filteredWords.length === 0 ? (
        <div className="bento-card p-12 text-center space-y-4">
          <p className="text-white/40 text-sm">Tidak ada kosakata yang cocok dengan pencarian atau filter.</p>
          <button
            onClick={onNavigateAddWord}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-full text-xs font-bold cursor-pointer"
          >
            + Tambah Kosakata Baru
          </button>
        </div>
      ) : viewMode === 'flashcard' ? (
        /* 3D Flashcard Deck View */
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* Card Counter & Level Indicator */}
          <div className="flex items-center justify-between text-xs text-white/60 px-2">
            <span>
              Kartu <strong>{currentCardIndex + 1}</strong> dari <strong>{filteredWords.length}</strong>
            </span>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${levelBadges[currentCard.masteryLevel]?.color}`}>
                {levelBadges[currentCard.masteryLevel]?.label}
              </span>
              <span className="text-white/40">• {currentCard.partOfSpeech}</span>
            </div>
          </div>

          {/* Interactive 3D Flip Card Container */}
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="relative min-h-[340px] sm:min-h-[380px] rounded-3xl bento-card cursor-pointer group select-none transition-all duration-300 perspective-1000 border-2 border-white/10 hover:border-purple-500/40 p-8 flex flex-col justify-between"
          >
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-blue-600/10 rounded-3xl pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400 bg-purple-500/15 px-2.5 py-1 rounded-full border border-purple-500/25">
                  {isFlipped ? 'Jawaban & Arti' : 'Tampak Depan'}
                </span>
                {currentCard.tags.map((tag, idx) => (
                  <span key={idx} className="text-[10px] text-white/40 bg-white/5 px-2 py-0.5 rounded-md">
                    #{tag}
                  </span>
                ))}
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  speakKorean(currentCard.hangul);
                }}
                title="Dengarkan Suara Korea"
                className="p-2.5 rounded-2xl bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 transition-all cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Central Word Presentation */}
            <div className="relative z-10 text-center py-6">
              {!isFlipped ? (
                <div className="space-y-3">
                  <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-wide">
                    {currentCard.hangul}
                  </h2>
                  <p className="text-sm font-medium text-purple-300/90 tracking-wider">
                    [{currentCard.romaja}]
                  </p>
                  <p className="text-xs text-white/40 pt-4 flex items-center justify-center gap-1">
                    <RotateCw className="w-3.5 h-3.5 animate-spin-slow" /> Klik kartu untuk membalik
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300">
                    {currentCard.meaningId}
                  </h3>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left space-y-1.5 max-w-lg mx-auto">
                    <p className="text-xs font-semibold text-white/40 uppercase">Contoh Kalimat:</p>
                    <p className="text-sm font-semibold text-white">{currentCard.exampleSentenceHangul}</p>
                    <p className="text-xs text-purple-300">{currentCard.exampleSentenceRomaja}</p>
                    <p className="text-xs text-white/70 italic">{currentCard.exampleSentenceId}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Tip */}
            <div className="relative z-10 text-center text-[11px] text-white/30">
              Diulang {currentCard.reviewCount} kali • {currentCard.correctCount} kali benar
            </div>
          </div>

          {/* SRS Action Review Buttons: Lupa (Lv -1) vs Ingat (Lv +1) */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handlePrevCard}
              className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
              title="Kartu Sebelumnya"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex-1 flex gap-3">
              <button
                onClick={() => handleRateMastery(false)}
                className="flex-1 py-3 px-4 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <X className="w-4 h-4 text-rose-400" />
                <span>Belum Hafal (Lv -1)</span>
              </button>

              <button
                onClick={() => handleRateMastery(true)}
                className="flex-1 py-3 px-4 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-950/30"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Sudah Hafal (Lv +1)</span>
              </button>
            </div>

            <button
              onClick={handleNextCard}
              className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
              title="Kartu Berikutnya"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bento-card overflow-hidden">
          <div className="divide-y divide-white/5">
            {filteredWords.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 hover:bg-white/5 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-white">{item.hangul}</span>
                    <span className="text-xs text-purple-300 font-medium">[{item.romaja}]</span>
                    <button
                      onClick={() => speakKorean(item.hangul)}
                      className="p-1 rounded-lg bg-white/5 text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-white/80 font-medium">{item.meaningId}</p>
                  <p className="text-xs text-white/40 italic">{item.exampleSentenceHangul} — {item.exampleSentenceId}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${levelBadges[item.masteryLevel]?.color}`}>
                    {levelBadges[item.masteryLevel]?.label}
                  </span>

                  {/* Level Quick Modifier */}
                  <select
                    value={item.masteryLevel}
                    onChange={(e) => onUpdateMastery(item.id, Number(e.target.value) as MasteryLevel)}
                    className="bg-white/5 border border-white/10 rounded-xl text-xs text-white px-2 py-1 focus:outline-hidden"
                  >
                    {[0, 1, 2, 3, 4, 5].map(lv => (
                      <option key={lv} value={lv} className="bg-[#121217] text-white">
                        Level {lv}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => onDeleteWord(item.id)}
                    title="Hapus kata"
                    className="p-1.5 text-white/30 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
