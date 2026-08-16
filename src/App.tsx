import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { AddWordView } from './components/AddWordView';
import { DictionaryView } from './components/DictionaryView';
import { QuizView } from './components/QuizView';
import { StoryView } from './components/StoryView';
import { SettingsView } from './components/SettingsView';
import { LiquidGooeyNavBar } from './components/LiquidGooeyNavBar';
import { LoginView } from './components/LoginView';
import { ActiveTab, UserProfile, VocabularyItem, QuizHistoryItem, MasteryLevel } from './types';
import { api, authApi } from './utils/api';
import { initialUserProfile } from './data/initialData';

interface DbVocabulary {
  id: string;
  kata_korea: string;
  terjemahan_indo: string;
  contoh_kalimat_korea?: string | null;
  contoh_kalimat_indo?: string | null;
  level_hafalan: number;
  jumlah_benar: number;
  jumlah_salah: number;
  created_at: string;
  romaja?: string | null;
  part_of_speech?: VocabularyItem['partOfSpeech'] | null;
  tags_json?: string;
}

function dbToUi(item: DbVocabulary): VocabularyItem {
  return {
    id: item.id,
    hangul: item.kata_korea,
    romaja: item.romaja || '',
    meaningId: item.terjemahan_indo,
    partOfSpeech: item.part_of_speech || 'lainnya',
    masteryLevel: Math.max(0, Math.min(5, Math.round(item.level_hafalan / 20))) as MasteryLevel,
    exampleSentenceHangul: item.contoh_kalimat_korea || '',
    exampleSentenceRomaja: '',
    exampleSentenceId: item.contoh_kalimat_indo || '',
    tags: (() => { try { return JSON.parse(item.tags_json || '[]'); } catch { return []; } })(),
    createdAt: item.created_at,
    reviewCount: item.jumlah_benar + item.jumlah_salah,
    correctCount: item.jumlah_benar,
  };
}

function dbUserToUi(user: { id: string; email: string; nama: string; foto: string | null }): UserProfile {
  return {
    ...initialUserProfile,
    id: user.id,
    name: user.nama,
    email: user.email,
    avatarUrl: user.foto || initialUserProfile.avatarUrl,
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [vocabularyList, setVocabularyList] = useState<VocabularyItem[]>([]);
  const [quizHistory] = useState<QuizHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadVocabulary = async () => {
    const result = await api<{ data: DbVocabulary[] }>('/api/vocabulary');
    setVocabularyList(result.data.map(dbToUi));
  };

  useEffect(() => {
    (async () => {
      try {
        const auth = await authApi.me();
        if (!auth.authenticated || !auth.user) {
          setLoading(false);
          return;
        }
        setUser(dbUserToUi(auth.user));
        await loadVocabulary();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Gagal memuat aplikasi.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAddWord = async (newWord: VocabularyItem) => {
    try {
      const result = await api<{ data: DbVocabulary }>('/api/vocabulary', {
        method: 'POST',
        body: JSON.stringify({
          kata_korea: newWord.hangul,
          terjemahan_indo: newWord.meaningId,
          contoh_kalimat_korea: newWord.exampleSentenceHangul,
          contoh_kalimat_indo: newWord.exampleSentenceId,
          romaja: newWord.romaja,
          part_of_speech: newWord.partOfSpeech,
          tags: newWord.tags,
        }),
      });
      setVocabularyList(prev => [dbToUi(result.data), ...prev.filter(v => v.id !== result.data.id)]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan kosakata.');
    }
  };

  const handleUpdateMastery = async (id: string, newLevel: MasteryLevel) => {
    const old = vocabularyList.find(v => v.id === id);
    if (!old) return;
    try {
      const result = await api<{ data: DbVocabulary }>('/api/vocabulary', {
        method: 'PUT',
        body: JSON.stringify({ id, hasil: newLevel > old.masteryLevel ? 'benar' : 'salah' }),
      });
      setVocabularyList(prev => prev.map(v => v.id === id ? dbToUi(result.data) : v));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memperbarui level.');
    }
  };

  const handleDeleteWord = async (id: string) => {
    try {
      await api(`/api/vocabulary?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      setVocabularyList(prev => prev.filter(v => v.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menghapus kosakata.');
    }
  };

  const handleUpdateUser = (updated: Partial<UserProfile>) => setUser(prev => prev ? ({ ...prev, ...updated }) : prev);
  const handleCompleteQuiz = (_result: QuizHistoryItem) => { /* quiz API will persist history */ };
  const handleResetData = () => { localStorage.clear(); window.location.reload(); };

  if (loading) return <div className="min-h-screen bg-[#0D0D0F] text-white flex items-center justify-center">Memuat KoreaFlow…</div>;
  if (!user) return <LoginView />;

  return (
    <div id="hangeulflow-root" className="min-h-screen bg-[#0D0D0F] text-slate-100 flex flex-col relative overflow-x-hidden">
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-950/15 rounded-full blur-[160px] pointer-events-none -z-10" />
      {error && <button onClick={() => setError('')} className="fixed top-20 right-4 z-50 max-w-sm rounded-xl bg-red-500/15 border border-red-500/30 px-4 py-3 text-sm text-red-200">{error} ×</button>}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} user={user} setMobileOpen={() => {}} />
        <main id="main-content-canvas" className="flex-1 p-4 sm:p-6 lg:p-8 pb-32 sm:pb-36 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22 }} className="h-full">
              {activeTab === 'dashboard' && <Dashboard user={user} vocabularyList={vocabularyList} quizHistory={quizHistory} setActiveTab={setActiveTab} onUpdateUser={handleUpdateUser} onResetData={handleResetData} />}
              {activeTab === 'dictionary' && <DictionaryView vocabularyList={vocabularyList} onUpdateMastery={handleUpdateMastery} onDeleteWord={handleDeleteWord} onNavigateAddWord={() => setActiveTab('add-word')} />}
              {activeTab === 'add-word' && <AddWordView onAddWord={handleAddWord} existingCount={vocabularyList.length} />}
              {activeTab === 'quiz' && <QuizView vocabularyList={vocabularyList} onCompleteQuiz={handleCompleteQuiz} onUpdateMastery={handleUpdateMastery} />}
              {activeTab === 'story' && <StoryView onAddWord={handleAddWord} />}
              {activeTab === 'settings' && <SettingsView user={user} vocabularyList={vocabularyList} onUpdateUser={handleUpdateUser} onResetData={handleResetData} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <LiquidGooeyNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
