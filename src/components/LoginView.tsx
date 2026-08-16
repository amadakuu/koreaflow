import React from 'react';
import { Chrome, Sparkles } from 'lucide-react';
import { authApi } from '../utils/api';

export const LoginView: React.FC = () => (
  <div className="min-h-screen bg-[#0D0D0F] text-white flex items-center justify-center p-6">
    <div className="w-full max-w-md bento-card p-8 text-center space-y-6">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
        <Sparkles className="w-7 h-7 text-purple-300" />
      </div>
      <div>
        <h1 className="text-2xl font-extrabold">KoreaFlow</h1>
        <p className="text-sm text-white/50 mt-2">Masuk untuk menyimpan kamus dan progres belajarmu.</p>
      </div>
      <button onClick={authApi.login} className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-white text-black font-semibold hover:bg-white/90 transition-colors">
        <Chrome className="w-5 h-5" />
        Masuk dengan Google
      </button>
    </div>
  </div>
);
