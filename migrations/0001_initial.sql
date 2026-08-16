PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  google_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  nama TEXT NOT NULL,
  foto TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS vocabulary (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  kata_korea TEXT NOT NULL,
  terjemahan_indo TEXT NOT NULL,
  contoh_kalimat_korea TEXT,
  contoh_kalimat_indo TEXT,
  level_hafalan INTEGER NOT NULL DEFAULT 0 CHECK (level_hafalan BETWEEN 0 AND 100),
  jumlah_benar INTEGER NOT NULL DEFAULT 0,
  jumlah_salah INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, kata_korea)
);

CREATE INDEX IF NOT EXISTS idx_vocabulary_user ON vocabulary(user_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_user_level ON vocabulary(user_id, level_hafalan);

CREATE TABLE IF NOT EXISTS quiz_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  tema TEXT NOT NULL,
  jumlah_soal INTEGER NOT NULL DEFAULT 0,
  tingkat_kesulitan TEXT NOT NULL,
  nilai INTEGER NOT NULL DEFAULT 0,
  tanggal TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_quiz_history_user ON quiz_history(user_id, tanggal DESC);

CREATE TABLE IF NOT EXISTS stories (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  tema TEXT NOT NULL,
  judul TEXT NOT NULL,
  isi_cerita_korea TEXT NOT NULL,
  tingkat TEXT NOT NULL,
  tanggal TEXT NOT NULL DEFAULT (datetime('now')),
  analysis_json TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_stories_user ON stories(user_id, tanggal DESC);

CREATE TABLE IF NOT EXISTS settings (
  user_id TEXT PRIMARY KEY,
  tema_warna TEXT NOT NULL DEFAULT 'purple',
  ukuran_font TEXT NOT NULL DEFAULT 'medium',
  target_harian INTEGER NOT NULL DEFAULT 10,
  model_ai TEXT NOT NULL DEFAULT 'gemini-2.5-flash',
  bahasa_penjelasan TEXT NOT NULL DEFAULT 'id',
  speech_speed REAL NOT NULL DEFAULT 1.0,
  show_romaja INTEGER NOT NULL DEFAULT 1,
  auto_play_audio INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS activity_log (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  tipe TEXT NOT NULL,
  metadata_json TEXT,
  tanggal TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_activity_user_date ON activity_log(user_id, tanggal DESC);
