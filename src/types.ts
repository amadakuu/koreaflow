export type ActiveTab = 'dashboard' | 'add-word' | 'dictionary' | 'quiz' | 'story' | 'settings';

export type MasteryLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface VocabularyItem {
  id: string;
  hangul: string;
  romaja: string;
  meaningId: string;
  partOfSpeech: 'kata_benda' | 'kata_kerja' | 'kata_sifat' | 'partikel' | 'ungkapan' | 'lainnya';
  masteryLevel: MasteryLevel; // 0: Baru, 1: Mulai Hafal, 2: Cukup Hafal, 3: Menengah, 4: Kuat, 5: Terkuasai
  exampleSentenceHangul: string;
  exampleSentenceRomaja: string;
  exampleSentenceId: string;
  grammarNotes?: string;
  tags: string[];
  createdAt: string;
  lastReviewedDate?: string;
  reviewCount: number;
  correctCount: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  streakDays: number;
  lastActiveDate: string;
  targetDailyWords: number;
  wordsLearnedToday: number;
  preferredDifficulty: 'pemula' | 'menengah' | 'mahir';
  speechSpeed: number; // 0.8 - 1.2
  showRomaja: boolean;
  autoPlayAudio: boolean;
}

export interface QuizHistoryItem {
  id: string;
  date: string;
  topic: string;
  difficulty: 'pemula' | 'menengah' | 'mahir';
  score: number;
  totalQuestions: number;
  xpEarned: number;
  newWordsAdded: number;
}

export interface StoryWordAnalysis {
  word: string;
  hangul: string;
  romaja: string;
  meaning: string;
  role: 'Subjek (S)' | 'Predikat (P)' | 'Objek (O)' | 'Keterangan (K)' | 'Partikel';
  explanation: string;
}

export interface InteractiveStory {
  id: string;
  titleHangul: string;
  titleId: string;
  level: 'TOPIK I' | 'TOPIK II' | 'Dasar';
  description: string;
  sentences: {
    hangul: string;
    romaja: string;
    translationId: string;
    words: StoryWordAnalysis[];
  }[];
}
