import React from 'react';
import { Flame, Volume2, ShieldCheck, LogOut } from 'lucide-react';
import { ActiveTab, UserProfile } from '../types';
import { speakKorean } from '../utils/speech';
import { playBubbleSound } from '../utils/sound';
import { authApi } from '../utils/api';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  user: UserProfile;
  setMobileOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, user }) => {
  const getTabTitle = (tab: ActiveTab) => ({
    dashboard: { title: 'Beranda & Progres', subtitle: 'Pantau perkembangan kosakata, ritme belajar, dan pengaturan akun' },
    'add-word': { title: 'Tambah Kosakata AI', subtitle: 'Terjemahan otomatis dan contoh kalimat kontekstual' },
    dictionary: { title: 'Kamus Flashcard SRS', subtitle: 'Spaced Repetition dengan level 0–100' },
    quiz: { title: 'Latihan Soal Adaptif', subtitle: 'Kuis dinamis AI dengan kosakata kamus Anda' },
    story: { title: 'Cerita Interaktif', subtitle: 'Bacaan Korea dengan analisis grammar per kata' },
    settings: { title: 'Pengaturan & Profil', subtitle: 'Kelola akun, preferensi, audio, dan AI' },
  }[tab]);
  const headerInfo = getTabTitle(activeTab);

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0D0D0F]/85 backdrop-blur-xl border-b border-white/10 px-4 lg:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3 lg:gap-4">
        <button onClick={() => { playBubbleSound(0); setActiveTab('dashboard'); }} className="font-extrabold text-lg tracking-tight text-white pr-3 border-r border-white/10">
          KoreaFlow
        </button>
        <div>
          <h1 className="text-sm lg:text-base font-semibold text-white flex items-center gap-2">
            {headerInfo.title}
            {activeTab === 'dashboard' && <span className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><ShieldCheck className="w-3 h-3" /> D1</span>}
          </h1>
          <p className="hidden md:block text-xs text-white/50 max-w-lg truncate">{headerInfo.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <button onClick={() => speakKorean('안녕하세요! 한국어 공부를 시작해 볼까요?')} title="Tes Suara" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/70">
          <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> Suara Korea
        </button>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/5 border border-white/10 text-orange-400 text-xs font-semibold">
          <Flame className="w-4 h-4 fill-orange-400" /> {user.streakDays} Hari
        </div>
        <div className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-2xl bg-white/5 border border-white/10">
          <img src={user.avatarUrl} alt={user.name} referrerPolicy="no-referrer" className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-500/50" />
          <span className="hidden md:inline font-medium text-xs text-white/90">{user.name.split(' ')[0]}</span>
          <button onClick={authApi.logout} title="Logout" className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/50 hover:text-red-300" aria-label="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
