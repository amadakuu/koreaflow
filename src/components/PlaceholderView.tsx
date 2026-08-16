import React from 'react';
import { 
  Sparkles, 
  BookMarked, 
  PlusCircle, 
  BookOpen, 
  Settings, 
  ArrowLeft,
  Lock,
  Zap,
  Layers,
  Database,
  Cloud,
  Code
} from 'lucide-react';
import { ActiveTab } from '../types';

interface PlaceholderViewProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const getTabDetails = (tab: ActiveTab) => {
    switch (tab) {
      case 'add-word':
        return {
          title: 'Modul: Tambah Kosakata AI',
          subtitle: 'Fitur terjemahan otomatis Gemini AI, ekstraksi partikel grammar, dan contoh kalimat alami.',
          icon: PlusCircle,
          badgeColor: 'from-purple-500 to-indigo-600',
          plannedFeatures: [
            'Input kata Korea / Indonesia dengan deteksi otomatis',
            'AI Gemini otomatis melengkapi: Hanja, Romaja, Jenis Kata, Contoh Kalimat',
            'Penjelasan partikel dan tata bahasa langsung dari AI',
            'Tombol Simpan otomatis ke Kamus & Cloudflare D1'
          ],
        };
      case 'dictionary':
        return {
          title: 'Modul: Kamus Flashcard SRS',
          subtitle: 'Spaced Repetition System dengan flashcard 3D flip dan sistem kenaikan/penurunan level.',
          icon: BookMarked,
          badgeColor: 'from-indigo-500 to-blue-600',
          plannedFeatures: [
            'Daftar lengkap kosakata dengan filter Level 0 s.d. Level 5',
            'Mode Flashcard Interaktif 3D Flip Card dengan audio Web Speech',
            'Tombol "Ingat" (Naik Level) & "Lupa" (Turun Level)',
            'Pencarian instan dan filter berdasarkan tag & jenis kata'
          ],
        };
      case 'quiz':
        return {
          title: 'Modul: Latihan Soal Adaptif AI',
          subtitle: 'Generator kuis dinamis berdasarkan tema, jumlah soal, dan tingkat kesulitan.',
          icon: Sparkles,
          badgeColor: 'from-pink-500 to-purple-600',
          plannedFeatures: [
            'Pilihan tema belajar (Keseharian, Makanan, Perjalanan, Drama Korea)',
            'Penggunaan kosakata dari kamus Anda + kata baru otomatis masuk Level 0',
            'Soal pilihan ganda & susun kalimat dengan evaluasi instan',
            'Skor langsung, riwayat sesi, dan penambahan EXP'
          ],
        };
      case 'story':
        return {
          title: 'Modul: Cerita Interaktif',
          subtitle: 'Bacaan cerita berbahasa Korea dengan pembedahan kalimat kata per kata.',
          icon: BookOpen,
          badgeColor: 'from-blue-500 to-cyan-600',
          plannedFeatures: [
            'Cerita berjenjang (Dasar, TOPIK I, TOPIK II)',
            'Tiap kata bisa diklik untuk melihat arti, partikel, & peran SPOK',
            'Audio bacaan penuh dan per kalimat',
            'Tombol cepat untuk menambahkan kata yang belum dipahami ke kamus'
          ],
        };
      case 'settings':
        return {
          title: 'Modul: Pengaturan & Sinkronisasi Akun',
          subtitle: 'Konfigurasi akun, target harian, Google OAuth, dan database Cloudflare D1.',
          icon: Settings,
          badgeColor: 'from-slate-600 to-slate-800',
          plannedFeatures: [
            'Status login Google OAuth & Cloudflare D1 Database ID',
            'Pengaturan target harian (5, 10, 20 kata per hari)',
            'Preferensi kecepatan audio & tampilan alih aksara (Romaja)',
            'Ekspor & Impor data kosakata format JSON'
          ],
        };
      default:
        return {
          title: 'Modul',
          subtitle: '',
          icon: Layers,
          badgeColor: 'from-purple-500 to-indigo-600',
          plannedFeatures: [],
        };
    }
  };

  const details = getTabDetails(activeTab);
  const Icon = details.icon;

  return (
    <div id={`placeholder-view-${activeTab}`} className="max-w-4xl mx-auto py-8 space-y-6">
      {/* Top Breadcrumb / Back Button */}
      <button
        id="btn-placeholder-back-dashboard"
        onClick={() => setActiveTab('dashboard')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-purple-300 transition-colors px-3 py-1.5 rounded-lg bg-white/5 border border-white/10"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Kembali ke Dashboard</span>
      </button>

      {/* Hero Banner for Next Feature */}
      <div className="glass-panel p-8 rounded-2xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-6">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${details.badgeColor} p-0.5 shadow-lg flex items-center justify-center`}>
            <div className="w-full h-full bg-[#13131A] rounded-[14px] flex items-center justify-center">
              <Icon className="w-7 h-7 text-purple-300" />
            </div>
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30 mb-1">
              <Lock className="w-3 h-3" /> Siap Dikembangkan di Tahap Berikutnya
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
              {details.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              {details.subtitle}
            </p>
          </div>
        </div>

        {/* Feature Checklist Preview */}
        <div className="p-5 rounded-xl bg-white/5 border border-white/5 space-y-3">
          <p className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            Spesifikasi Fitur yang Dirancang:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {details.plannedFeatures.map((feat, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cloudflare & Architecture Notice */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Cloud className="w-3.5 h-3.5 text-blue-400" /> Cloudflare Pages
            </span>
            <span className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-emerald-400" /> Cloudflare D1
            </span>
            <span className="flex items-center gap-1">
              <Code className="w-3.5 h-3.5 text-purple-400" /> Gemini API
            </span>
          </div>

          <button
            id="btn-return-to-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-purple-600/30"
          >
            Lihat Dashboard Utama
          </button>
        </div>
      </div>
    </div>
  );
};
