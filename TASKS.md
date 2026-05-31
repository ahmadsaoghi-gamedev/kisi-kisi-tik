# TASKS.md — Checklist Pembangunan Project

AI coding assistant (Cursor) mengerjakan task ini secara berurutan. Centang setelah selesai.

---

## Fase 1 — Setup & Struktur File

- [ ] **1.1** Buat folder struktur persis seperti di `CLAUDE.md`
- [ ] **1.2** Buat `config.js` dengan template kosong + komentar panduan
- [ ] **1.3** Buat `soal/kelas1.json` dengan data soal kelas 1 PERSIS dari sumber (lihat catatan di bawah)
- [ ] **1.4** Buat `soal/kelas2.json` s/d `soal/kelas5.json` sebagai template kosong dengan format yang benar (soal diisi placeholder "SOAL BELUM DIISI — hubungi guru")
- [ ] **1.5** Validasi semua JSON bisa di-parse tanpa error

> ⚠️ **Catatan 1.3**: Soal kelas 1 sudah tersedia (lihat file `soal-kelas1-source.md`). Kelas 2–5 diisi guru secara manual setelah app jadi.

---

## Fase 2 — Halaman `index.html`

- [ ] **2.1** Header sekolah: logo (jika ada), nama sekolah, NPSN, tahun pelajaran
- [ ] **2.2** Judul halaman: "Ujian TIK — Pilih Kelasmu!"
- [ ] **2.3** Grid kartu kelas 1–5:
  - Angka kelas besar di tengah
  - Nama topik kecil di bawah (load dari JSON)
  - Kelas yang belum ada soalnya tampil disabled (abu-abu)
- [ ] **2.4** Form identitas siswa: input Nama + input No. Absen (muncul setelah klik kelas)
- [ ] **2.5** Input API Key (opsional, collapsible "Pengaturan Guru"):
  - Label: "API Key Claude (untuk koreksi AI)"
  - Simpan ke sessionStorage
  - Jika kosong, koreksi AI dinonaktifkan (hanya PG yang dikoreksi)
- [ ] **2.6** Tombol "Mulai Ujian" → validasi nama tidak kosong → simpan state → redirect `ujian.html`
- [ ] **2.7** Footer: nama sekolah, alamat, kontak
- [ ] **2.8** Responsif: mobile (1 kolom) dan desktop (3 kolom untuk kartu kelas)

---

## Fase 3 — Halaman `ujian.html`

- [ ] **3.1** Load state dari sessionStorage (kelas, nama, absen) → jika kosong redirect ke index
- [ ] **3.2** Fetch `soal/kelasX.json` berdasarkan kelas yang dipilih
- [ ] **3.3** Header sticky:
  - Nama siswa + kelas
  - Timer countdown (format MM:SS)
  - Progress bar soal terjawab / total
- [ ] **3.4** Section I — Pilihan Ganda (no. 1–10):
  - Teks soal jelas (text-lg)
  - 3 tombol pilihan (a, b, c) — full width di mobile
  - Pilihan terpilih berubah warna biru
  - Bisa ganti pilihan sebelum submit
- [ ] **3.5** Section II — Isian Singkat (no. 11–20):
  - Input text atau textarea 1 baris
  - Placeholder: "Tulis jawabanmu di sini…"
  - Auto-save ke sessionStorage setiap ketik (debounce 500ms)
- [ ] **3.6** Section III — Uraian (no. 21–25):
  - Textarea 4 baris, resizable
  - Counter karakter (min 20 karakter disarankan)
  - Auto-save ke sessionStorage
- [ ] **3.7** Tombol "Kumpulkan Jawaban" (sticky di bottom, bg-blue-500):
  - Hitung soal yang belum dijawab
  - Tampilkan konfirmasi: "X soal belum dijawab. Yakin kumpulkan?"
  - Jika konfirmasi → panggil `ai.js` → loading spinner → redirect hasil
- [ ] **3.8** Timer logic:
  - Mulai dari `durasi_menit` yang ada di JSON
  - Simpan `waktu_mulai` ke sessionStorage (anti-cheat reload)
  - Auto-submit + alert jika waktu habis
- [ ] **3.9** Handle error fetch JSON: tampilkan pesan "Soal belum tersedia untuk kelas ini"

---

## Fase 4 — `ai.js` (Logika Koreksi)

- [ ] **4.1** Fungsi `koreksiPG(soal, jawaban)` → return array skor per soal (0 atau 1)
- [ ] **4.2** Fungsi `koreksiAI(soal, jawaban, apiKey)` → async, return hasil isian + uraian
- [ ] **4.3** Build prompt Claude API yang efisien:
  - Satu request untuk semua isian + uraian
  - System prompt: "Kamu guru TIK SD, koreksi dalam Bahasa Indonesia, singkat"
  - Response format JSON (instruksikan di prompt)
- [ ] **4.4** Parse response JSON dari Claude dengan try-catch
- [ ] **4.5** Fallback jika API gagal (network error / key salah):
  - PG tetap dikoreksi
  - Isian & uraian: nilai null, tampilkan badge "Belum dikoreksi AI"
  - Simpan jawaban mentah agar guru bisa koreksi manual
- [ ] **4.6** Fungsi `hitungNilaiTotal(hasilPG, hasilIsian, hasilUraian)`:
  - PG: tiap soal = 4 poin (10 × 4 = 40)
  - Isian: tiap soal = 4 poin (10 × 4 = 40)
  - Uraian: tiap soal = 4 poin maks (5 × 4 = 20)
  - Total: 100 poin
  - Predikat: A (90–100), B (80–89), C (70–79), D (60–69), E (<60)

---

## Fase 5 — Halaman `hasil.html`

- [ ] **5.1** Load hasil dari sessionStorage → jika kosong redirect ke index
- [ ] **5.2** Kartu nilai utama:
  - Nama siswa, kelas, no absen, tanggal ujian
  - Nilai besar di tengah (misal: "85")
  - Predikat dengan warna (A=hijau, B=biru, C=kuning, D=oranye, E=merah)
- [ ] **5.3** Breakdown nilai:
  - PG: X dari 40
  - Isian: X dari 40
  - Uraian: X dari 20
  - Total: X dari 100
- [ ] **5.4** Accordion detail per bagian (bisa expand/collapse):
  - **PG**: ikon ✓/✗, jawaban siswa, jawaban benar (jika salah)
  - **Isian**: jawaban siswa, nilai AI (0/1), komentar AI
  - **Uraian**: jawaban siswa, nilai AI (0–4), komentar AI
- [ ] **5.5** Badge status AI: "Dikoreksi AI ✓" atau "Koreksi manual diperlukan ⚠"
- [ ] **5.6** Tombol "Cetak / Simpan PDF" (window.print dengan print stylesheet)
- [ ] **5.7** Tombol "Ulangi Ujian" dan "Kembali ke Beranda"
- [ ] **5.8** Print stylesheet: hitam putih, tanpa tombol, rapi untuk kertas A4

---

## Fase 6 — Polish & Testing

- [ ] **6.1** Test di Chrome mobile (DevTools → iPhone SE 375px)
- [ ] **6.2** Test di Chrome desktop 1280px
- [ ] **6.3** Test skenario: siswa tidak isi nama → pesan error jelas
- [ ] **6.4** Test skenario: API key kosong → koreksi PG jalan, isian/uraian fallback
- [ ] **6.5** Test skenario: API key salah → error handling, tidak crash
- [ ] **6.6** Test skenario: timer habis → auto-submit
- [ ] **6.7** Test skenario: reload halaman ujian → timer lanjut dari posisi benar
- [ ] **6.8** Pastikan tidak ada console.error yang muncul
- [ ] **6.9** Cek semua font size minimum 16px (accessibility anak SD)
- [ ] **6.10** Validasi HTML (tidak ada tag yang tidak ditutup)

---

## Fase 7 — Deploy

- [ ] **7.1** Buat file `.gitignore` (kosongkan config.js dari tracking jika ada API key)
- [ ] **7.2** Buat `_config.yml` untuk GitHub Pages (jika diperlukan)
- [ ] **7.3** Test buka `index.html` langsung dari file (file:// protocol) — harus jalan
- [ ] **7.4** Test buka via GitHub Pages URL — semua fetch JSON berhasil
- [ ] **7.5** Tulis panduan singkat di README.md: cara guru mengganti soal JSON

---

## Catatan untuk AI

- Jangan pakai `import/export` (tidak jalan di file:// tanpa server)
- Semua JS ditulis sebagai script tag biasa atau file external dengan `<script src="..."></script>`
- Tailwind CDN: `<script src="https://cdn.tailwindcss.com"></script>`
- Jangan gunakan localStorage untuk data ujian (privasi) — gunakan sessionStorage
- Semua teks antarmuka dalam **Bahasa Indonesia**
- Jika ragu antara dua cara, pilih yang lebih simple

---

## File Tambahan yang Perlu Dibuat AI

| File | Isi |
|------|-----|
| `soal-kelas1-source.md` | Data soal kelas 1 yang sudah ada (dari guru) |
| `panduan-guru.md` | Cara edit soal JSON, cara deploy, cara set API key |
| `print.css` | Stylesheet khusus cetak hasil ujian |
