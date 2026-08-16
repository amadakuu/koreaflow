import React, { useState } from 'react';
import { Sparkles, Save, Loader2 } from 'lucide-react';
import { api } from '../utils/api';

export interface GeneratedVocab {
  kata_korea: string;
  terjemahan_indo: string;
  contoh_kalimat_korea: string;
  contoh_kalimat_indo: string;
}

export const AddWordViewCloud: React.FC<{ onSaved: () => void }> = ({ onSaved }) => {
  const [kata, setKata] = useState('');
  const [result, setResult] = useState<GeneratedVocab | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const generate = async () => {
    if (!kata.trim()) return;
    setBusy(true); setMessage('');
    try {
      const response = await api<{ data: GeneratedVocab }>('/api/generate-vocab', { method: 'POST', body: JSON.stringify({ kata: kata.trim() }) });
      setResult(response.data);
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Gagal membuat kosakata.'); }
    finally { setBusy(false); }
  };

  const save = async () => {
    if (!result) return;
    setBusy(true); setMessage('');
    try {
      await api('/api/vocabulary', { method: 'POST', body: JSON.stringify(result) });
      setMessage('Kosakata tersimpan di D1 dengan level 0.');
      setResult(null); setKata(''); onSaved();
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Gagal menyimpan.'); }
    finally { setBusy(false); }
  };

  return <div className="max-w-3xl mx-auto space-y-6">
    <div className="bento-card p-6 sm:p-8">
      <div className="flex items-center gap-2 mb-2"><Sparkles className="w-5 h-5 text-purple-300" /><h1 className="text-2xl font-bold">Tambah Kosakata</h1></div>
      <p className="text-sm text-white/50 mb-6">Masukkan satu kata/frasa Korea. Gemini akan mengisi arti dan contoh kalimat melalui backend.</p>
      <div className="flex gap-3"><input value={kata} onChange={e => setKata(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') generate(); }} placeholder="예: 학교" className="flex-1 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-purple-500" /><button onClick={generate} disabled={busy || !kata.trim()} className="px-5 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 font-semibold flex items-center gap-2">{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Generate</button></div>
    </div>
    {result && <div className="bento-card p-6 space-y-4">
      <label className="block text-xs text-white/50">Kata Korea<input value={result.kata_korea} onChange={e => setResult({ ...result, kata_korea: e.target.value })} className="mt-1 w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white" /></label>
      <label className="block text-xs text-white/50">Terjemahan Indonesia<input value={result.terjemahan_indo} onChange={e => setResult({ ...result, terjemahan_indo: e.target.value })} className="mt-1 w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white" /></label>
      <label className="block text-xs text-white/50">Contoh Korea<textarea value={result.contoh_kalimat_korea} onChange={e => setResult({ ...result, contoh_kalimat_korea: e.target.value })} className="mt-1 w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white" /></label>
      <label className="block text-xs text-white/50">Terjemahan contoh<textarea value={result.contoh_kalimat_indo} onChange={e => setResult({ ...result, contoh_kalimat_indo: e.target.value })} className="mt-1 w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white" /></label>
      <button onClick={save} disabled={busy} className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 font-semibold flex items-center gap-2"><Save className="w-4 h-4" /> Simpan</button>
    </div>}
    {message && <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70">{message}</div>}
  </div>;
};
