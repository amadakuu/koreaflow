/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { AddWordView } from './components/AddWordView';
import { DictionaryView } from './components/DictionaryView';
import { QuizView } from './components/QuizView';
import { StoryView } from './components/StoryView';
import { SettingsView } from './components/SettingsView';
import { LiquidGooeyNavBar } from './components/LiquidGooeyNavBar';
import { ActiveTab, UserProfile, VocabularyItem, QuizHistoryItem, MasteryLevel } from './types';
import { initialUserProfile, initialVocabulary, initialQuizHistory } from './data/initialData';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  // Persistent User Profile State (Local-first / ready for Cloudflare D1 sync)
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('hangeulflow_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved user', e);
      }
    }
    return initialUserProfile;
  });

  // Persistent Vocabulary List
  const [vocabularyList, setVocabularyList] = useState<VocabularyItem[]>(() => {
    const saved = localStorage.getItem('hangeulflow_vocab');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved vocab', e);
      }
    }
    return initialVocabulary;
  });

  // Persistent Quiz History
  const [quizHistory, setQuizHistory] = useState<QuizHistoryItem[]>(() => {
    const saved = localStorage.getItem('hangeulflow_quiz_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved quiz history', e);
      }
    }
    return initialQuizHistory;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('hangeulflow_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('hangeulflow_vocab', JSON.stringify(vocabularyList));
  }, [vocabularyList]);

  useEffect(() => {
    localStorage.setItem('hangeulflow_quiz_history', JSON.stringify(quizHistory));
  }, [quizHistory]);

  // Handler: Add new word to vocabulary
  const handleAddWord = (newWord: VocabularyItem) => {
    setVocabularyList(prev => [newWord, ...prev]);
    setUser(prev => ({
      ...prev,
      xp: prev.xp + 15,
      wordsLearnedToday: prev.wordsLearnedToday + 1,
    }));
  };

  // Handler: Update mastery level of a word
  const handleUpdateMastery = (id: string, newLevel: MasteryLevel) => {
    setVocabularyList(prev =>
      prev.map(item => {
        if (item.id === id) {
          const isCorrect = newLevel > item.masteryLevel;
          return {
            ...item,
            masteryLevel: newLevel,
            reviewCount: item.reviewCount + 1,
            correctCount: isCorrect ? item.correctCount + 1 : item.correctCount,
            lastReviewedDate: new Date().toISOString(),
          };
        }
        return item;
      })
    );
  };

  // Handler: Delete word
  const handleDeleteWord = (id: string) => {
    setVocabularyList(prev => prev.filter(w => w.id !== id));
  };

  // Handler: Complete Quiz
  const handleCompleteQuiz = (result: QuizHistoryItem) => {
    setQuizHistory(prev => [result, ...prev]);
    setUser(prev => ({
      ...prev,
      xp: prev.xp + result.xpEarned,
      wordsLearnedToday: prev.wordsLearnedToday + result.newWordsAdded,
    }));
  };

  // Handler: Update User Profile
  const handleUpdateUser = (updated: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...updated }));
  };

  // Handler: Reset Data
  const handleResetData = () => {
    if (window.confirm('Apakah Anda yakin ingin mengatur ulang data ke kondisi bawaan?')) {
      setUser(initialUserProfile);
      setVocabularyList(initialVocabulary);
      setQuizHistory(initialQuizHistory);
      localStorage.clear();
    }
  };

  return (
    <div id="hangeulflow-root" className="min-h-screen bg-[#0D0D0F] text-slate-100 flex flex-col relative overflow-x-hidden">
      {/* Background ambient gradient blurs */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-950/15 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
          setMobileOpen={setMobileOpen}
        />

        <main id="main-content-canvas" className="flex-1 p-4 sm:p-6 lg:p-8 pb-32 sm:pb-36 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className="h-full"
            >
              {activeTab === 'dashboard' && (
                <Dashboard
                  user={user}
                  vocabularyList={vocabularyList}
                  quizHistory={quizHistory}
                  setActiveTab={setActiveTab}
                  onUpdateUser={handleUpdateUser}
                  onResetData={handleResetData}
                />
              )}

              {activeTab === 'dictionary' && (
                <DictionaryView
                  vocabularyList={vocabularyList}
                  onUpdateMastery={handleUpdateMastery}
                  onDeleteWord={handleDeleteWord}
                  onNavigateAddWord={() => setActiveTab('add-word')}
                />
              )}

              {activeTab === 'add-word' && (
                <AddWordView
                  onAddWord={handleAddWord}
                  existingCount={vocabularyList.length}
                />
              )}

              {activeTab === 'quiz' && (
                <QuizView
                  vocabularyList={vocabularyList}
                  onCompleteQuiz={handleCompleteQuiz}
                  onUpdateMastery={handleUpdateMastery}
                />
              )}

              {activeTab === 'story' && (
                <StoryView
                  onAddWord={handleAddWord}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  user={user}
                  vocabularyList={vocabularyList}
                  onUpdateUser={handleUpdateUser}
                  onResetData={handleResetData}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Liquid Gooey Navigation Bar Floating Dock */}
      <LiquidGooeyNavBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}
