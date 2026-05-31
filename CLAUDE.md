# CLAUDE.md — Instruksi untuk AI (Cursor / Claude Code)

> File ini dibaca oleh AI coding assistant (Cursor, Claude Code, dll) untuk memahami project secara utuh sebelum menulis kode.

---

## Konteks Project

Web app ujian TIK untuk SDN Sukasari 4 Tangerang. Siswa SD kelas 1–5 mengerjakan soal PAS (Penilaian Akhir Semester) di HP atau komputer. Guru upload soal dalam format JSON. AI (Claude API) mengoreksi jawaban isian pendek dan uraian secara otomatis.

**Pengguna utama:**
- Siswa SD kelas 1–5 (usia 6–11 tahun) → UI harus besar, jelas, warna cerah
- Guru → isi soal via JSON, tidak perlu coding

---

## Aturan Coding yang WAJIB Diikuti

1. **Tidak ada framework / build tool** — murni HTML, CSS (Tailwind CDN), Vanilla JS
2. **Tidak ada npm, tidak ada node_modules** — bisa langsung buka di browser
3. **Responsif mobile-first** — mayoritas siswa pakai HP
4. **Font besar** — minimum 16px body, judul soal minimum 18px
5. **Warna terang & cerah** — background putih/kuning muda, tombol biru/hijau solid
6. **Satu file JSON per kelas** — guru edit sendiri tanpa sentuh kode
7. **State disimpan di `sessionStorage`** — tidak perlu backend/database
8. **Fallback offline** — jika API Claude gagal, koreksi PG tetap jalan, isian/uraian beri pesan "sedang offline"

---

## Format JSON Soal (WAJIB PERSIS INI)

File: `soal/kelas1.json`

```json
{
  "kelas": 1,
  "topik": "Microsoft Paint",
  "mapel": "TIK",
  "sekolah": "SDN Sukasari 4 Tangerang",
  "tahun": "2025-2026",
  "durasi_menit": 60,
  "pg": [
    {
      "no": 1,
      "soal": "Aplikasi pengolah gambar sederhana adalah ….",
      "pilihan": { "a": "Notes", "b": "Paint", "c": "Notebook" },
      "jawaban": "b"
    }
  ],
  "isian": [
    {
      "no": 11,
      "soal": "Untuk menggambar garis lengkung dapat menggunakan ikon …",
      "kunci": "curve",
      "skor_maks": 1
    }
  ],
  "uraian": [
    {
      "no": 21,
      "soal": "Apa yang kamu ketahui tentang Paint pada komputer?",
      "rubrik": "Penjelasan tentang Microsoft Paint sebagai program menggambar bawaan Windows untuk menggambar dan mewarnai gambar sederhana.",
      "skor_maks": 4
    }
  ]
}
```

**Validasi**: Setiap file JSON wajib punya `pg` (10 soal), `isian` (10 soal), `uraian` (5 soal). Total 25 soal.

---

## Alur Halaman

```
index.html
  → Tampilkan pilihan kelas 1-5
  → Siswa isi Nama + No. Absen
  → Klik "Mulai Ujian"
  → Simpan {kelas, nama, absen} ke sessionStorage
  → Redirect ke ujian.html

ujian.html
  → Load soal dari soal/kelasX.json (fetch)
  → Tampilkan timer countdown (60 menit)
  → Bagian I: PG (pilih a/b/c, bisa ganti)
  → Bagian II: Isian pendek (textarea 1 baris)
  → Bagian III: Uraian (textarea 3 baris)
  → Tombol "Kumpulkan Jawaban" (sticky di bawah)
  → Konfirmasi dialog sebelum submit
  → Submit → panggil ai.js → redirect hasil.html

hasil.html
  → Tampilkan nama, kelas, nilai total
  → Breakdown: PG X/10, Isian X/10, Uraian X/20
  → Predikat A/B/C/D/E
  → Detail per soal dengan komentar AI
  → Tombol "Cetak Hasil" (window.print)
  → Tombol "Kembali ke Beranda"
```

---

## Logika Koreksi AI (`ai.js`)

```javascript
// Fungsi utama yang dipanggil saat submit
async function koreksiDenganAI(soal, jawaban, apiKey) {
  // 1. Koreksi PG: langsung bandingkan jawaban vs soal.pg[i].jawaban
  // 2. Koreksi Isian + Uraian: kirim ke Claude API
  // 3. Return objek hasil lengkap
}

// Prompt ke Claude API (kirim SATU request untuk isian + uraian sekaligus)
// Model: claude-sonnet-4-20250514
// Format response: JSON { isian: [{no, nilai, komentar}], uraian: [{no, nilai, komentar}] }
// Fallback: jika fetch gagal, nilai isian = 0, uraian = 0, tampilkan pesan "Koreksi offline tidak tersedia"
```

---

## `config.js` — Konfigurasi

```javascript
// config.js — JANGAN commit ke GitHub jika pakai API key pribadi
// Untuk GitHub Pages, gunakan environment variable atau input manual

const CONFIG = {
  ANTHROPIC_API_KEY: "", // diisi guru, atau prompt di awal
  MODEL: "claude-sonnet-4-20250514",
  SEKOLAH: "SDN Sukasari 4 Tangerang",
  NPSN: "20606443",
  TAHUN_PELAJARAN: "2025-2026"
};
```

> **Catatan keamanan**: Untuk production, tampilkan input API key di halaman index (disimpan ke sessionStorage), bukan hardcode di file.

---

## Desain UI — Spesifikasi

### Warna (Tailwind classes)
- Background halaman: `bg-yellow-50` (kuning muda cerah)
- Header sekolah: `bg-blue-600 text-white`
- Tombol utama: `bg-blue-500 hover:bg-blue-600 text-white`
- Tombol kelas: `bg-white border-2 border-blue-300 hover:bg-blue-50`
- Benar: `bg-green-100 border-green-500`
- Salah: `bg-red-100 border-red-500`
- Cukup: `bg-yellow-100 border-yellow-500`

### Typography
- Judul halaman: `text-2xl font-bold` (min 24px)
- Teks soal: `text-lg` (min 18px)
- Pilihan jawaban: `text-base` (16px)
- Semua teks harus mudah dibaca anak SD

### Komponen Kelas Selector
- 5 kartu kelas dalam grid 2-3 kolom
- Setiap kartu: angka kelas besar (text-5xl), nama topik kecil di bawah
- Hover + shadow untuk interaktivitas

### Timer
- Sticky di atas saat scroll
- Warna hijau jika > 15 menit tersisa
- Warna merah jika ≤ 5 menit (+ animasi pulse)
- Auto-submit jika habis

---

## Tasks untuk AI — Urutan Pengerjaan

Lihat `TASKS.md` untuk checklist lengkap.

---

## Deploy Notes

### GitHub Pages
- Tidak ada server-side code
- Semua fetch ke `soal/*.json` berjalan client-side
- API key Claude diinput oleh guru di halaman awal (simpan ke sessionStorage)
- Tidak perlu `.env` file

### Vercel (alternatif)
- Drag & drop folder ke vercel.com
- Atau connect GitHub repo
- Sama-sama static, tidak perlu config tambahan
