import React, { useState } from 'react';
import { 
  Sparkles, 
  Volume2, 
  Flame, 
  BookMarked, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Plus, 
  Layers, 
  Target, 
  Zap, 
  BookOpen, 
  BrainCircuit, 
  BarChart3, 
  CalendarCheck,
  ChevronRight,
  ShieldCheck,
  Settings,
  User,
  Database,
  Download,
  RefreshCw,
  Check
} from 'lucide-react';
import { ActiveTab, UserProfile, VocabularyItem, QuizHistoryItem } from '../types';
import { speakKorean } from '../utils/speech';
import { playBubbleSound } from '../utils/sound';

interface DashboardProps {
  user: UserProfile;
  vocabularyList: VocabularyItem[];
  quizHistory: QuizHistoryItem[];
  setActiveTab: (tab: ActiveTab) => void;
  onUpdateUser?: (updated: Partial<UserProfile>) => void;
  onResetData?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  vocabularyList,
  quizHistory,
  setActiveTab,
  onUpdateUser,
  onResetData,
}) => {
  const [showSettingsSection, setShowSettingsSection] = useState(false);
  const [savedSettingsSuccess, setSavedSettingsSuccess] = useState(false);

  // Compute SRS Mastery distribution
  const masteryCounts = [0, 1, 2, 3, 4, 5].map((lvl) => {
    return vocabularyList.filter((item) => item.masteryLevel === lvl).length;
  });

  const totalWords = vocabularyList.length;
  const masteredWords = vocabularyList.filter((item) => item.masteryLevel === 5).length;
  const newWords = vocabularyList.filter((item) => item.masteryLevel === 0).length;

  const averageQuizScore = quizHistory.length > 0 
    ? Math.round(quizHistory.reduce((acc, q) => acc + q.score, 0) / quizHistory.length)
    : 88;

  const targetPercentage = Math.min(
    100,
    Math.round((user.wordsLearnedToday / Math.max(1, user.targetDailyWords)) * 100)
  );

  // Daily featured word
  const dailyWord = vocabularyList[0] || {
    hangul: '안녕하세요',
    romaja: 'annyeonghaseyo',
    meaningId: 'Halo / Selamat pagi/siang/malam',
    partOfSpeech: 'ungkapan',
    masteryLevel: 5,
    exampleSentenceHangul: '선생님, 안녕하세요!',
    exampleSentenceRomaja: 'Seonsaengnim, annyeonghaseyo!',
    exampleSentenceId: 'Guru, halo!',
    tags: ['Salam', 'Dasar'],
  };

  const masteryLabels = [
    { level: 0, label: 'Level 0 (Baru)', color: 'bg-slate-500' },
    { level: 1, label: 'Level 1 (Mulai)', color: 'bg-rose-500' },
    { level: 2, label: 'Level 2 (Cukup)', color: 'bg-amber-500' },
    { level: 3, label: 'Level 3 (Menengah)', color: 'bg-blue-500' },
    { level: 4, label: 'Level 4 (Kuat)', color: 'bg-indigo-500' },
    { level: 5, label: 'Level 5 (Kuasai)', color: 'bg-emerald-500' },
  ];

  // 7-day activity frequency bars
  const activityDays = [
    { day: 'Sen', height: '45%', active: false, count: '14 kata' },
    { day: 'Sel', height: '65%', active: false, count: '20 kata' },
    { day: 'Rab', height: '50%', active: false, count: '16 kata' },
    { day: 'Kam', height: '90%', active: true, count: '32 kata' },
    { day: 'Jum', height: '60%', active: false, count: '18 kata' },
    { day: 'Sab', height: '75%', active: false, count: '24 kata' },
    { day: 'Min', height: '40%', active: false, count: '12 kata' },
  ];

  const handleExportData = () => {
    playBubbleSound(100);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      user,
      vocabulary: vocabularyList,
      exportDate: new Date().toISOString(),
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `HangeulFlow_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleQuickSettingChange = (changes: Partial<UserProfile>) => {
    playBubbleSound(80);
    if (onUpdateUser) {
      onUpdateUser(changes);
      setSavedSettingsSuccess(true);
      setTimeout(() => setSavedSettingsSuccess(false), 2000);
    }
  };

  return (
    <div id="bento-dashboard-root" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header Greeting Bar */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-2">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-semibold border border-emerald-500/25 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>HangeulFlow • AI Korean Learning</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Annyeong, {user.name.split(' ')[0]}!</span>
            <span>👋</span>
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Pantau progres kosakata harian, hafalan SRS, dan latihan adaptif Anda.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-2 backdrop-blur-md">
            <span className="text-orange-400 font-bold flex items-center gap-1">
              <Flame className="w-4 h-4 fill-orange-400" />
              {user.streakDays}
            </span>
            <span className="text-xs text-white/60 font-medium">Hari Streak</span>
          </div>

          <button
            id="btn-bento-quick-audio"
            onClick={() => speakKorean('안녕하세요! 오늘도 열심히 한국어를 공부해 볼까요?')}
            title="Dengarkan Sapaan Korea"
            className="p-2.5 bg-white/5 border border-white/10 hover:border-emerald-500/40 rounded-2xl text-slate-300 hover:text-emerald-300 transition-all cursor-pointer"
          >
            <Volume2 className="w-5 h-5" />
          </button>

          {/* Quick Settings Toggle Button */}
          <button
            id="btn-dashboard-settings-toggle"
            onClick={() => {
              playBubbleSound(50);
              setShowSettingsSection(!showSettingsSection);
            }}
            className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
              showSettingsSection 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
            title="Pengaturan Akun & Belajar"
          >
            <Settings className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Pengaturan</span>
          </button>
        </div>
      </header>

      {/* 2. Top Bento Grid (4 Columns Layout) */}
      <div id="bento-top-row" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Bento Tile 1: Kosakata Baru & Total */}
        <div 
          id="bento-tile-vocab"
          onClick={() => {
            playBubbleSound(60);
            setActiveTab('dictionary');
          }}
          className="bento-card p-6 flex flex-col justify-between cursor-pointer group"
        >
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-sky-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-sky-500/20 transition-all" />
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/50 font-medium">Total Kosakata</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <BookMarked className="w-4 h-4" />
            </div>
          </div>

          <div className="my-4">
            <div className="text-4xl font-bold text-white tracking-tight">+{totalWords}</div>
            <div className="text-xs text-sky-400 font-medium mt-2 flex items-center gap-1">
              <span>↑ 12% minggu ini</span>
              <span className="text-white/40">• {newWords} kata baru</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-white/40 group-hover:text-sky-300 transition-colors">
            <span>Buka Kamus SRS</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Bento Tile 2: Rata-rata Skor / Akurasi */}
        <div 
          id="bento-tile-accuracy"
          onClick={() => {
            playBubbleSound(180);
            setActiveTab('quiz');
          }}
          className="bento-card p-6 flex flex-col justify-between cursor-pointer group"
        >
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-amber-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />

          <div className="flex items-center justify-between">
            <span className="text-sm text-white/50 font-medium">Akurasi Latihan</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="my-4">
            <div className="text-4xl font-bold text-white tracking-tight">{averageQuizScore}%</div>
            <div className="text-xs text-amber-400 font-medium mt-2 flex items-center gap-1">
              <span>★ Level {user.level} Pelajar</span>
              <span className="text-white/40">• {masteredWords} dikuasai</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-white/40 group-hover:text-amber-300 transition-colors">
            <span>Mulai Latihan Soal</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Bento Tile 3: Target Belajar Harian */}
        <div 
          id="bento-tile-daily-target"
          className="bento-card p-6 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/50 font-medium">Target Hari Ini</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Target className="w-4 h-4" />
            </div>
          </div>

          <div className="my-4 space-y-2">
            <div className="flex justify-between items-baseline">
              <div className="text-3xl font-bold text-white tracking-tight">
                {user.wordsLearnedToday}
                <span className="text-lg text-white/40 font-normal"> / {user.targetDailyWords} kata</span>
              </div>
              <span className="text-xs font-bold text-emerald-400">{targetPercentage}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
                style={{ width: `${targetPercentage}%` }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
            <span>{targetPercentage >= 100 ? 'Target tercapai!' : `${user.targetDailyWords - user.wordsLearnedToday} kata lagi`}</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>

        {/* Bento Tile 4: XP & Level Badge */}
        <div 
          id="bento-tile-xp-level"
          className="bento-card p-6 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/50 font-medium">Level Belajar</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>

          <div className="my-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-emerald-950/50">
                Lv.{user.level}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{user.name}</p>
                <p className="text-xs text-emerald-300 font-medium">{user.xp} Total XP</p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
            <span>+{user.nextLevelXp - user.xp} XP menuju Lv.{user.level + 1}</span>
            <Award className="w-3.5 h-3.5 text-purple-400" />
          </div>
        </div>
      </div>

      {/* 3. Middle Bento Grid (Analytics & Featured Word) */}
      <div id="bento-middle-row" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: SRS Mastery & 7-Day Histogram */}
        <div className="lg:col-span-2 space-y-6">
          {/* SRS Stage Tracker */}
          <div className="bento-card p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                  Sebaran Penguasaan SRS (Level 0 - 5)
                </h2>
                <p className="text-xs text-white/40">
                  Algoritma Spaced Repetition otomatis menguji kata berdasarkan daya ingat Anda.
                </p>
              </div>
            </div>

            {/* SRS Tier Bars */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {masteryLabels.map((item) => {
                const count = masteryCounts[item.level];
                const pct = totalWords > 0 ? Math.round((count / totalWords) * 100) : 0;
                return (
                  <div key={item.level} className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between">
                    <span className="text-[11px] text-white/50 font-medium">Lv.{item.level}</span>
                    <div className="my-2">
                      <span className="text-2xl font-bold text-white">{count}</span>
                      <span className="text-[10px] text-white/40 ml-1">kata</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 7-Day Frequency Histogram */}
          <div className="bento-card p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-teal-400" />
                Aktivitas Belajar 7 Hari Terakhir
              </h2>
              <span className="text-xs font-semibold text-emerald-400">Konsisten</span>
            </div>

            <div className="h-32 flex items-end justify-between gap-3 pt-4 px-2">
              {activityDays.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                  <div className="relative w-full flex items-end justify-center h-24 bg-white/5 rounded-xl overflow-hidden p-1">
                    <div 
                      className={`w-full rounded-lg transition-all duration-300 ${
                        d.active 
                          ? 'bg-gradient-to-t from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/20' 
                          : 'bg-white/20 group-hover:bg-white/30'
                      }`}
                      style={{ height: d.height }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${d.active ? 'text-emerald-300 font-bold' : 'text-white/40'}`}>
                    {d.day}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Featured Word of the Day */}
        <div className="space-y-6 flex flex-col">
          <div className="bento-card p-6 sm:p-7 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Kata Hari Ini
                </h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  {dailyWord.partOfSpeech}
                </span>
              </div>

              {/* Korean Word Block */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center relative group">
                <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-wide">
                  {dailyWord.hangul}
                </p>
                <p className="text-xs font-medium text-emerald-300 tracking-wider mt-1">
                  [{dailyWord.romaja}]
                </p>
                <p className="text-sm font-semibold text-slate-200 mt-2">
                  {dailyWord.meaningId}
                </p>

                <button
                  id="btn-bento-daily-audio"
                  onClick={() => speakKorean(dailyWord.hangul)}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600/25 hover:bg-emerald-600/40 text-emerald-200 text-xs font-semibold border border-emerald-500/30 transition-all cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Pelafalan Suara</span>
                </button>
              </div>

              {/* Cerita Terakhir Preview */}
              <div className="mt-4 pt-4 border-t border-white/5">
                <h3 className="text-xs font-bold text-white/70 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Cerita Rekomendasi</span>
                  <span className="text-[10px] text-white/40 lowercase font-normal">TOPIK I</span>
                </h3>

                <div 
                  onClick={() => {
                    playBubbleSound(90);
                    setActiveTab('story');
                  }}
                  className="group cursor-pointer p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/30 transition-all"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors">
                      Kunjungan ke Hongdae
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium">
                      Interaktif
                    </span>
                  </div>
                  <p className="text-xs italic text-white/50 line-clamp-2 leading-relaxed">
                    "오늘 친구와 함께 홍대에서 맛있는 저녁을 먹었습니다..."
                  </p>
                </div>
              </div>
            </div>

            <button
              id="btn-bento-view-stories"
              onClick={() => {
                playBubbleSound(90);
                setActiveTab('story');
              }}
              className="mt-4 w-full py-2.5 border border-dashed border-white/20 hover:border-emerald-500/50 rounded-2xl text-xs text-white/60 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Lihat Semua Cerita Interaktif</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Integrated Profile & Settings Section (Inside Beranda as requested) */}
      <div id="bento-settings-embedded-section" className="bento-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Pengaturan & Preferensi Belajar
              </h2>
              <p className="text-xs text-white/50">
                Atur kecepatan audio, alih aksara Romaja, target harian, dan pencadangan.
              </p>
            </div>
          </div>

          {savedSettingsSuccess && (
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Tersimpan!
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Target Harian */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-white/80">Target Hafalan Harian</label>
              <span className="text-xs font-extrabold px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                {user.targetDailyWords} Kata
              </span>
            </div>
            <input
              type="range"
              min="3"
              max="30"
              step="1"
              value={user.targetDailyWords}
              onChange={(e) => handleQuickSettingChange({ targetDailyWords: Number(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-white/30">
              <span>3 Kata</span>
              <span>10 Kata</span>
              <span>30 Kata</span>
            </div>
          </div>

          {/* Kecepatan Audio Korea */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-white/80">Kecepatan Suara Korea</label>
              <span className="text-xs font-extrabold px-2.5 py-0.5 bg-sky-500/20 text-sky-300 rounded-full border border-sky-500/30">
                {user.speechSpeed.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0.6"
              max="1.2"
              step="0.1"
              value={user.speechSpeed}
              onChange={(e) => handleQuickSettingChange({ speechSpeed: Number(e.target.value) })}
              className="w-full accent-sky-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-white/30">
              <span>0.6x (Lambat)</span>
              <span>0.9x (Natural)</span>
              <span>1.2x (Cepat)</span>
            </div>
          </div>

          {/* Romaja Toggle */}
          <div 
            onClick={() => handleQuickSettingChange({ showRomaja: !user.showRomaja })}
            className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between cursor-pointer hover:bg-white/10 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-white">Tampilkan Romaja (Latin)</p>
              <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${user.showRomaja ? 'bg-emerald-600' : 'bg-white/20'}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${user.showRomaja ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </div>
            <p className="text-[11px] text-white/40">Tampilkan teks latin di bawah Hangul untuk memudahkan pembacaan.</p>
          </div>
        </div>

        {/* Database Sync & JSON Export */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/60">
              Database Cloudflare D1 SQLite aktif & tersinkronisasi otomatis
            </span>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={handleExportData}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ekspor JSON</span>
            </button>

            {onResetData && (
              <button
                onClick={() => {
                  playBubbleSound(40);
                  onResetData();
                }}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-semibold text-rose-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Data</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. Riwayat Sesi Latihan */}
      <div 
        id="bento-history-card"
        className="bento-card p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            Riwayat Sesi Latihan
          </h2>
          <span className="text-xs text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Sinkron Cloudflare D1
          </span>
        </div>

        {quizHistory.length === 0 ? (
          <p className="text-xs text-white/40 py-4 text-center">Belum ada riwayat latihan.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {quizHistory.slice(0, 5).map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs ${
                    item.score >= 80 
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  }`}>
                    {item.score}%
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{item.topic}</p>
                    <p className="text-[11px] text-white/40">
                      {new Date(item.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })} • {item.totalQuestions} Soal • Tingkat {item.difficulty}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold text-emerald-300">+{item.xpEarned} XP</span>
                  {item.newWordsAdded > 0 && (
                    <p className="text-[10px] text-emerald-400">+{item.newWordsAdded} kata baru</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
