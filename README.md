# 📚 Aplikasi Ujian TIK — SDN Sukasari 4 Tangerang

Web app ujian TIK untuk siswa kelas 1–5. Siswa membuka di HP atau komputer, pilih kelas, kerjakan soal, dan langsung dapat nilai dengan koreksi AI.

## Stack

- **Frontend**: HTML + Tailwind CDN + Vanilla JS (tidak perlu build tool)
- **AI Koreksi**: Anthropic Claude API (`claude-sonnet-4-20250514`)
- **Deploy**: GitHub Pages (gratis, tanpa server)
- **Data soal**: File JSON per kelas — guru isi sendiri

## Struktur Folder

```
tik-ujian/
├── index.html          ← halaman utama (pilih kelas)
├── ujian.html          ← halaman mengerjakan soal
├── hasil.html          ← halaman hasil & nilai
├── config.js           ← API key & pengaturan
├── ai.js               ← logika koreksi AI
├── soal/
│   ├── kelas1.json     ← soal kelas 1 (guru isi)
│   ├── kelas2.json     ← soal kelas 2 (guru isi)
│   ├── kelas3.json     ← soal kelas 3 (guru isi)
│   ├── kelas4.json     ← soal kelas 4 (guru isi)
│   └── kelas5.json     ← soal kelas 5 (guru isi)
└── assets/
    └── logo-sekolah.png (opsional)
```

## Cara Deploy ke GitHub Pages

1. Buat repo baru di GitHub (misal: `ujian-tik-sukasari4`)
2. Upload semua file
3. Masuk Settings → Pages → pilih branch `main`
4. URL otomatis: `https://username.github.io/ujian-tik-sukasari4`
5. Bagikan URL ke siswa via WhatsApp grup kelas

## Cara Isi Soal

Edit file `soal/kelas1.json` dst. Format sudah ada di `CLAUDE.md`.
Guru **tidak perlu coding** — cukup edit file JSON.
