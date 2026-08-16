import React from 'react';
import { Menu, Flame, Sparkles, Volume2, ShieldCheck, Settings } from 'lucide-react';
import { ActiveTab, UserProfile } from '../types';
import { speakKorean } from '../utils/speech';
import { playBubbleSound } from '../utils/sound';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  user: UserProfile;
  setMobileOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  user,
  setMobileOpen,
}) => {
  const getTabTitle = (tab: ActiveTab) => {
    switch (tab) {
      case 'dashboard':
        return {
          title: 'Beranda & Progres',
          subtitle: 'Pantau perkembangan kosakata, ritme belajar, dan pengaturan akun',
        };
      case 'add-word':
        return {
          title: 'Tambah Kosakata AI',
          subtitle: 'Terjemahan otomatis, deteksi partikel & contoh kalimat kontekstual',
        };
      case 'dictionary':
        return {
          title: 'Kamus Flashcard SRS',
          subtitle: 'Spaced Repetition System dengan kenaikan & penurunan level otomatis',
        };
      case 'quiz':
        return {
          title: 'Latihan Soal Adaptif',
          subtitle: 'Kuis dinamis AI dengan kosakata kamus Anda & skor langsung',
        };
      case 'story':
        return {
          title: 'Cerita Interaktif',
          subtitle: 'Bacaan Korea interaktif dengan penjelasan SPOK & tata bahasa per kata',
        };
      case 'settings':
        return {
          title: 'Pengaturan & Profil',
          subtitle: 'Kelola preferensi akun, audio, dan sinkronisasi Cloudflare D1',
        };
    }
  };

  const headerInfo = getTabTitle(activeTab);

  return (
    <header
      id="main-app-header"
      className="sticky top-0 z-30 w-full bg-[#0D0D0F]/85 backdrop-blur-xl border-b border-white/10 px-4 lg:px-8 py-3.5 flex items-center justify-between transition-all"
    >
      {/* Left: Brand & title */}
      <div className="flex items-center gap-3 lg:gap-4">
        <button
          onClick={() => {
            playBubbleSound(0);
            setActiveTab('dashboard');
          }}
          className="flex items-center gap-2 pr-3 border-r border-white/10 text-left cursor-pointer hover:opacity-80 transition-opacity"
        >
          <span className="font-extrabold text-lg tracking-tight text-white">HangeulFlow</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
            PRO
          </span>
        </button>

        <div>
          <h1 className="text-sm lg:text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <span>{headerInfo.title}</span>
            {activeTab === 'dashboard' && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" /> Cloudflare D1 Ready
              </span>
            )}
          </h1>
          <p className="hidden md:block text-xs text-white/50 max-w-lg truncate">
            {headerInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Streak, XP Progress, Quick Action, Account Badge */}
      <div className="flex items-center gap-2.5 lg:gap-3">
        {/* Quick Audio Test Button */}
        <button
          id="btn-quick-voice-demo"
          onClick={() => speakKorean('안녕하세요! 한국어 공부를 시작해 볼까요?')}
          title="Tes Suara Bahasa Korea"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 text-xs text-white/70 hover:text-emerald-300 transition-colors cursor-pointer"
        >
          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Suara Korea</span>
        </button>

        {/* Streak Pill */}
        <div
          id="header-streak-badge"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/5 border border-white/10 text-orange-400 text-xs font-semibold"
        >
          <Flame className="w-4 h-4 fill-orange-400 text-orange-400" />
          <span>{user.streakDays} Hari</span>
        </div>

        {/* User Account Button (navigates to Dashboard with settings) */}
        <button
          id="header-user-badge-btn"
          onClick={() => {
            playBubbleSound(0);
            setActiveTab('dashboard');
          }}
          className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white transition-all cursor-pointer"
        >
          <img
            src={user.avatarUrl}
            alt={user.name}
            referrerPolicy="no-referrer"
            className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-500/50"
          />
          <span className="hidden md:inline font-medium text-xs text-white/90">
            {user.name.split(' ')[0]}
          </span>
        </button>
      </div>
    </header>
  );
};
