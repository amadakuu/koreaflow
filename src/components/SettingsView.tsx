import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Settings, 
  User, 
  Database, 
  Sparkles, 
  Volume2, 
  Download, 
  Upload, 
  ShieldCheck, 
  RefreshCw, 
  Check,
  Flame,
  Zap
} from 'lucide-react';
import { UserProfile, VocabularyItem } from '../types';

interface SettingsViewProps {
  user: UserProfile;
  vocabularyList: VocabularyItem[];
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  vocabularyList,
  onUpdateUser,
  onResetData,
}) => {
  const [name, setName] = useState(user.name);
  const [dailyTarget, setDailyTarget] = useState(user.targetDailyWords);
  const [speechSpeed, setSpeechSpeed] = useState(user.speechSpeed);
  const [showRomaja, setShowRomaja] = useState(user.showRomaja);
  const [autoPlayAudio, setAutoPlayAudio] = useState(user.autoPlayAudio);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      name,
      targetDailyWords: dailyTarget,
      speechSpeed,
      showRomaja,
      autoPlayAudio,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportData = () => {
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

  return (
    <div id="settings-view-root" className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bento-card p-6 lg:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/30">
            <Settings className="w-3.5 h-3.5" />
            <span>Profile & System Settings</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Profil & Pengaturan Akun
          </h1>
          <p className="text-xs sm:text-sm text-white/50">
            Kelola preferensi belajar, target harian, dan sinkronisasi Cloudflare D1.
          </p>
        </div>

        {/* User Level Badge */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md">
            Lv.{user.level}
          </div>
          <div>
            <p className="text-sm font-bold text-white">{user.name}</p>
            <p className="text-xs text-purple-300 font-medium">{user.xp} Total XP</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Profile Details Card */}
        <div className="bento-card p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
            <User className="w-5 h-5 text-purple-400" />
            Informasi Profil & Belajar
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/80">Nama Pengguna</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-sm focus:border-purple-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/80">Email Terdaftar</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-2xl text-white/40 text-sm cursor-not-allowed"
              />
            </div>
          </div>

          {/* Daily Target Slider */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-white/80">
                Target Hafalan Harian
              </label>
              <span className="text-xs font-extrabold px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
                {dailyTarget} Kata / Hari
              </span>
            </div>
            <input
              type="range"
              min="3"
              max="30"
              step="1"
              value={dailyTarget}
              onChange={(e) => setDailyTarget(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-white/30">
              <span>Santai (3 kata)</span>
              <span>Sedang (10 kata)</span>
              <span>Intensif (30 kata)</span>
            </div>
          </div>
        </div>

        {/* Audio & Display Preferences */}
        <div className="bento-card p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
            <Volume2 className="w-5 h-5 text-emerald-400" />
            Preferensi Audio & Tampilan
          </h2>

          {/* Speech Speed */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-white/80">
                Kecepatan Pengucapan Suara Korea
              </label>
              <span className="text-xs font-extrabold px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                {speechSpeed.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0.6"
              max="1.2"
              step="0.1"
              value={speechSpeed}
              onChange={(e) => setSpeechSpeed(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-white/30">
              <span>0.6x (Sangat Lambat)</span>
              <span>0.9x (Natural Pemula)</span>
              <span>1.2x (Cepat)</span>
            </div>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div 
              onClick={() => setShowRomaja(!showRomaja)}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-all"
            >
              <div>
                <p className="text-xs font-bold text-white">Tampilkan Romaja (Latin)</p>
                <p className="text-[11px] text-white/40">Bantuan alih aksara pada kartu dan kuis</p>
              </div>
              <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${showRomaja ? 'bg-purple-600' : 'bg-white/20'}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${showRomaja ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </div>

            <div 
              onClick={() => setAutoPlayAudio(!autoPlayAudio)}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-all"
            >
              <div>
                <p className="text-xs font-bold text-white">Putar Suara Otomatis</p>
                <p className="text-[11px] text-white/40">Bunyikan suara saat kartu baru dibuka</p>
              </div>
              <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${autoPlayAudio ? 'bg-emerald-600' : 'bg-white/20'}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${autoPlayAudio ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Cloudflare D1 & Data Management */}
        <div className="bento-card p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
            <Database className="w-5 h-5 text-cyan-400" />
            Integrasi Database & Cadangan
          </h2>

          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <p className="text-xs font-bold text-white">Cloudflare D1 SQLite Database</p>
                <p className="text-[11px] text-cyan-300/80">
                  Sinkronisasi aktif • Edge database latensi ultra-rendah
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              Terhubung
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleExportData}
              className="flex-1 py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-purple-400" />
              <span>Ekspor Cadangan JSON</span>
            </button>

            <button
              type="button"
              onClick={onResetData}
              className="py-3 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset Data ke Awal</span>
            </button>
          </div>
        </div>

        {/* Save button */}
        <button
          type="submit"
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-purple-950/50 transition-all cursor-pointer"
        >
          {savedSuccess ? (
            <>
              <Check className="w-5 h-5 text-emerald-300" />
              <span>Pengaturan Berhasil Disimpan!</span>
            </>
          ) : (
            <span>Simpan Perubahan Pengaturan</span>
          )}
        </button>
      </form>
    </div>
  );
};
