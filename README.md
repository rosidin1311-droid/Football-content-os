# ⚽ Football Content OS

Planner + Generator konten YouTube sepakbola. Kelola ide video, generate script AI, dan atur jadwal upload — semua dari HP.

## Fitur

- **Planner**: Kanban board status produksi (Ide → Script → Voice → Edit → Terjadwal → Upload)
- **Generator**: Generate script lengkap (judul, hook, naskah, deskripsi, tags) pakai Gemini AI, atau batch 7 judul sekaligus
- **Kalender**: Visualisasi jadwal upload bulanan, drag video dari "belum dijadwalkan" ke tanggal

## Cara Deploy dari HP (tanpa install apa-apa di device)

### Bagian 1 — Setup Supabase (5 menit)

1. Buka **supabase.com** di browser HP, daftar/login pakai GitHub
2. Klik **New Project** → kasih nama bebas → pilih region **Southeast Asia (Singapore)** → generate password (simpan)
3. Tunggu ±2 menit sampai project siap
4. Di sidebar kiri, klik **SQL Editor** → **New Query**
5. Buka file `supabase/schema.sql` di project ini, **copy semua isinya**, paste ke SQL Editor, klik **Run**
6. Di sidebar kiri, klik **Authentication** → **Providers** → pastikan **Email** aktif
7. (Opsional tapi disarankan) Di **Authentication** → **Settings**, matikan "Confirm email" kalau mau langsung bisa login tanpa cek email dulu — cocok untuk pemakaian pribadi
8. Klik **Project Settings** (ikon gear) → **API** → catat 2 nilai ini:
   - `Project URL`
   - `anon public` key

### Bagian 2 — Ambil API Key Gemini (2 menit, gratis)

1. Buka **aistudio.google.com/app/apikey** di browser HP
2. Login pakai akun Google
3. Klik **Create API Key** → pilih atau buat project baru
4. Copy API key yang muncul (diawali `AIzaSy...`)

Free tier Gemini 1.5 Flash: **1.500 request/hari gratis** — lebih dari cukup untuk generate 30 video/bulan.

### Bagian 3 — Push Code ke GitHub (5 menit)

Kalau kamu terima file project ini sebagai folder/zip:

1. Buka **github.com** di browser HP → login/daftar
2. Klik **+** → **New repository** → kasih nama `football-content-os` → **Create repository**
3. Di halaman repo kosong, klik **uploading an existing file**
4. Upload semua file dan folder dari project ini (bisa drag-drop kalau browser HP mendukung, atau upload satu-satu dari file manager HP)
5. Klik **Commit changes**

> **Penting**: JANGAN upload file `.env.local` kalau kamu sempat buat — biarkan `.gitignore` yang mengatur supaya secret tidak ke-push ke publik.

### Bagian 4 — Deploy ke Vercel (5 menit)

1. Buka **vercel.com** di browser HP → **Sign Up** → pilih **Continue with GitHub**
2. Setelah masuk dashboard, klik **Add New** → **Project**
3. Cari repo `football-content-os` yang tadi dibuat → klik **Import**
4. Di halaman konfigurasi, buka bagian **Environment Variables**, tambahkan 3 baris ini satu per satu:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | (Project URL dari Supabase) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (anon public key dari Supabase) |
   | `GEMINI_API_KEY` | (API key dari Google AI Studio) |

5. Klik **Deploy**
6. Tunggu 2-3 menit → selesai, kamu dapat link seperti `football-content-os.vercel.app`

### Bagian 5 — Install ke Homescreen HP

1. Buka link Vercel tadi di browser HP (Chrome/Safari)
2. Daftar akun baru di dalam app (email + password bebas, ini akun pribadi kamu sendiri, terpisah dari akun Supabase/Vercel)
3. Buka menu browser → **Add to Home Screen** / **Install App**
4. Selesai — app muncul di homescreen seperti app native

## Update Konten ke Depan

Kalau nanti mau ubah tampilan atau tambah fitur, edit file di GitHub langsung dari browser HP (klik ikon pensil di file), commit — Vercel otomatis re-deploy dalam ±1 menit.

## Struktur Project

```
app/
  planner/          → Kanban board status video
  generator/         → AI script & batch title generator
  kalender/          → Jadwal upload bulanan
  api/
    generate-script/ → Endpoint Gemini untuk 1 script lengkap
    generate-titles/ → Endpoint Gemini untuk batch 7 judul
components/           → AuthGate, BottomNav, Badges (shared UI)
lib/                  → Supabase client, TypeScript types
supabase/schema.sql    → Jalankan sekali di SQL Editor Supabase
```
