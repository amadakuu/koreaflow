import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BrainCircuit, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Volume2, 
  RotateCcw, 
  Award, 
  ArrowRight,
  Flame,
  Check,
  Zap
} from 'lucide-react';
import { VocabularyItem, MasteryLevel, QuizHistoryItem } from '../types';
import { speakKorean } from '../utils/speech';

interface QuizViewProps {
  vocabularyList: VocabularyItem[];
  onCompleteQuiz: (result: QuizHistoryItem) => void;
  onUpdateMastery: (id: string, newLevel: MasteryLevel) => void;
}

interface Question {
  id: string;
  type: 'hangul_to_meaning' | 'meaning_to_hangul' | 'complete_sentence';
  prompt: string;
  subPrompt?: string;
  audioHangul?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  wordId?: string;
}

export const QuizView: React.FC<QuizViewProps> = ({
  vocabularyList,
  onCompleteQuiz,
  onUpdateMastery,
}) => {
  const [quizState, setQuizState] = useState<'intro' | 'active' | 'finished'>('intro');
  const [selectedTopic, setSelectedTopic] = useState('Semua Kosakata');
  const [questionCount, setQuestionCount] = useState(5);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [streak, setStreak] = useState(0);

  // Generate dynamic quiz questions from vocabulary
  const startQuiz = () => {
    if (vocabularyList.length === 0) return;

    const pool = [...vocabularyList].sort(() => Math.random() - 0.5);
    const selectedWords = pool.slice(0, Math.min(questionCount, pool.length));

    const generated: Question[] = selectedWords.map((word, idx) => {
      // Pick random question type
      const isHangulToMeaning = idx % 2 === 0;

      // Distractor answers
      const distractors = vocabularyList
        .filter(w => w.id !== word.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      if (isHangulToMeaning) {
        const options = [word.meaningId, ...distractors.map(d => d.meaningId)].sort(() => Math.random() - 0.5);
        return {
          id: `q_${idx}`,
          type: 'hangul_to_meaning',
          prompt: word.hangul,
          subPrompt: `[${word.romaja}] • ${word.partOfSpeech}`,
          audioHangul: word.hangul,
          options,
          correctAnswer: word.meaningId,
          explanation: `${word.hangul} ([${word.romaja}]) berarti "${word.meaningId}". Contoh: ${word.exampleSentenceHangul} (${word.exampleSentenceId})`,
          wordId: word.id,
        };
      } else {
        const options = [word.hangul, ...distractors.map(d => d.hangul)].sort(() => Math.random() - 0.5);
        return {
          id: `q_${idx}`,
          type: 'meaning_to_hangul',
          prompt: word.meaningId,
          subPrompt: `Pilih kosakata Hangul yang tepat (${word.partOfSpeech})`,
          audioHangul: word.hangul,
          options,
          correctAnswer: word.hangul,
          explanation: `Bahasa Korea untuk "${word.meaningId}" adalah ${word.hangul} (${word.romaja}).`,
          wordId: word.id,
        };
      }
    });

    setQuestions(generated);
    setCurrentIndex(0);
    setScore(0);
    setCorrectAnswersCount(0);
    setStreak(0);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setQuizState('active');
  };

  const handleSelectOption = (opt: string) => {
    if (isAnswerChecked) return;
    setSelectedOption(opt);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption || isAnswerChecked) return;

    const currentQ = questions[currentIndex];
    const isCorrect = selectedOption === currentQ.correctAnswer;

    setIsAnswerChecked(true);

    if (isCorrect) {
      setScore(prev => prev + 100 + (streak * 15));
      setCorrectAnswersCount(prev => prev + 1);
      setStreak(prev => prev + 1);

      // Increase mastery level in SRS
      if (currentQ.wordId) {
        const currentWord = vocabularyList.find(w => w.id === currentQ.wordId);
        if (currentWord) {
          const next = Math.min(5, currentWord.masteryLevel + 1) as MasteryLevel;
          onUpdateMastery(currentQ.wordId, next);
        }
      }
    } else {
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
    } else {
      // Finished
      const finalScore = Math.round((correctAnswersCount / questions.length) * 100);
      const xpEarned = correctAnswersCount * 25 + 50;

      const historyResult: QuizHistoryItem = {
        id: `qh_${Date.now()}`,
        date: new Date().toISOString(),
        topic: selectedTopic,
        difficulty: 'pemula',
        score: finalScore,
        totalQuestions: questions.length,
        xpEarned,
        newWordsAdded: 0,
      };

      onCompleteQuiz(historyResult);
      setQuizState('finished');
    }
  };

  const currentQ = questions[currentIndex];

  return (
    <div id="quiz-view-root" className="max-w-4xl mx-auto space-y-8 pb-16">
      {quizState === 'intro' ? (
        /* Quiz Setup Intro Screen */
        <div className="bento-card p-6 sm:p-10 space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>Adaptive Quiz Engine</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Latihan Soal & Kuis Adaptif
            </h1>
            <p className="text-xs sm:text-sm text-white/60 max-w-xl leading-relaxed">
              Uji daya ingat kosakata Korea Anda dengan soal interaktif pilihan ganda dan alih aksara. Setiap jawaban benar akan menaikkan level Spaced Repetition (SRS) dan memberikan bonus XP.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <span className="text-xs font-bold text-purple-300 uppercase">Jumlah Soal</span>
              <div className="flex gap-2">
                {[5, 10, 15].map((num) => (
                  <button
                    key={num}
                    onClick={() => setQuestionCount(num)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      questionCount === num
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    {num} Soal
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <span className="text-xs font-bold text-emerald-300 uppercase">Perbendaharaan Tersedia</span>
              <p className="text-2xl font-extrabold text-white">{vocabularyList.length} Kata</p>
              <p className="text-[11px] text-white/40">Diambil secara acak dari kamus pribadi Anda</p>
            </div>
          </div>

          <button
            onClick={startQuiz}
            disabled={vocabularyList.length === 0}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-extrabold text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/40 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-40"
          >
            <Zap className="w-5 h-5 text-black" />
            <span>Mulai Sesi Latihan Sekarang</span>
          </button>
        </div>
      ) : quizState === 'active' && currentQ ? (
        /* Active Question Screen */
        <div className="space-y-6">
          {/* Header Progress Bar & Streak */}
          <div className="bento-card p-4 sm:p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-white/50">
                Soal {currentIndex + 1} / {questions.length}
              </span>
              <div className="w-32 sm:w-48 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {streak > 1 && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{streak}x Combo</span>
                </div>
              )}
              <span className="text-xs font-extrabold text-emerald-400">{score} PTS</span>
            </div>
          </div>

          {/* Question Card */}
          <div className="bento-card p-8 text-center space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-center gap-3">
              <span className="text-xs uppercase font-bold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                {currentQ.type === 'hangul_to_meaning' ? 'Arti Kosakata' : 'Tebak Huruf Hangul'}
              </span>
              {currentQ.audioHangul && (
                <button
                  onClick={() => speakKorean(currentQ.audioHangul!)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-purple-300 transition-colors cursor-pointer"
                  title="Dengarkan Suara Korea"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-wide">
                {currentQ.prompt}
              </h2>
              {currentQ.subPrompt && (
                <p className="text-xs sm:text-sm font-medium text-white/50">{currentQ.subPrompt}</p>
              )}
            </div>

            {/* Answer Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-2xl mx-auto pt-4 text-left">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                const isCorrect = opt === currentQ.correctAnswer;

                let btnStyle = 'bg-white/5 border-white/10 hover:bg-white/10 text-white';

                if (isAnswerChecked) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300';
                  } else {
                    btnStyle = 'bg-white/5 border-white/5 opacity-40 text-white/40';
                  }
                } else if (isSelected) {
                  btnStyle = 'bg-purple-600/30 border-purple-400 text-purple-200 ring-2 ring-purple-500/40';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(opt)}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-white/10 text-xs font-bold flex items-center justify-center">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-sm font-medium">{opt}</span>
                    </div>

                    {isAnswerChecked && isCorrect && <Check className="w-4 h-4 text-emerald-400" />}
                    {isAnswerChecked && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400" />}
                  </button>
                );
              })}
            </div>

            {/* Feedback and Explanation */}
            <AnimatePresence>
              {isAnswerChecked && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-2xl text-left text-xs space-y-1 ${
                    selectedOption === currentQ.correctAnswer
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                  }`}
                >
                  <p className="font-bold">
                    {selectedOption === currentQ.correctAnswer ? '🎉 Jawaban Anda Benar!' : '❌ Jawaban Kurang Tepat'}
                  </p>
                  <p className="text-white/70">{currentQ.explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Bar */}
          <div className="flex justify-end">
            {!isAnswerChecked ? (
              <button
                onClick={handleCheckAnswer}
                disabled={!selectedOption}
                className="py-3.5 px-8 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-sm shadow-lg shadow-purple-900/40 transition-all cursor-pointer"
              >
                Periksa Jawaban
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="py-3.5 px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
              >
                <span>{currentIndex + 1 < questions.length ? 'Soal Berikutnya' : 'Lihat Hasil Akhir'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Result Summary Screen */
        <div className="bento-card p-8 sm:p-12 text-center space-y-8 max-w-xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
            <Award className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase font-bold text-emerald-400 tracking-widest">Sesi Selesai</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Latihan Berhasil Diselesaikan!
            </h2>
            <p className="text-xs text-white/50">
              Hasil performa Anda telah disimpan dan disinkronkan ke Cloudflare D1.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
            <div>
              <div className="text-2xl font-extrabold text-emerald-400">
                {Math.round((correctAnswersCount / Math.max(1, questions.length)) * 100)}%
              </div>
              <p className="text-[10px] text-white/40 font-medium">Akurasi</p>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-purple-300">
                {correctAnswersCount} / {questions.length}
              </div>
              <p className="text-[10px] text-white/40 font-medium">Jawaban Benar</p>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-cyan-400">+{correctAnswersCount * 25 + 50}</div>
              <p className="text-[10px] text-white/40 font-medium">XP Didapat</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={startQuiz}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Ulangi Latihan</span>
            </button>
            <button
              onClick={() => setQuizState('intro')}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm cursor-pointer"
            >
              Kembali ke Menu Kuis
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
