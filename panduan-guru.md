# Panduan Guru — Cara Menggunakan Aplikasi Ujian TIK

## 1. Cara Menambah/Mengubah Soal

Buka file `soal/kelas2.json` (atau kelas lainnya) menggunakan Notepad atau VS Code.

Ikuti format ini persis:

```json
{
  "kelas": 2,
  "topik": "Nama Topik",
  "mapel": "TIK",
  "sekolah": "SDN Sukasari 4 Tangerang",
  "tahun": "2025-2026",
  "durasi_menit": 60,
  "pg": [
    {
      "no": 1,
      "soal": "Tulis soal di sini ….",
      "pilihan": {
        "a": "Pilihan A",
        "b": "Pilihan B",
        "c": "Pilihan C"
      },
      "jawaban": "b"
    }
  ],
  "isian": [
    {
      "no": 11,
      "soal": "Tulis soal isian di sini …",
      "kunci": "kata kunci jawaban",
      "skor_maks": 1
    }
  ],
  "uraian": [
    {
      "no": 21,
      "soal": "Tulis soal uraian di sini?",
      "rubrik": "Panduan penilaian: siswa menjawab … dengan benar jika …",
      "skor_maks": 4
    }
  ]
}
```

**Ketentuan jumlah soal:**
- `pg`: harus 10 soal (no. 1–10)
- `isian`: harus 10 soal (no. 11–20)
- `uraian`: harus 5 soal (no. 21–25)

---

## 2. Cara Mengatur API Key Claude (untuk Koreksi AI)

1. Daftar di [console.anthropic.com](https://console.anthropic.com)
2. Buat API Key baru
3. Saat membuka halaman ujian, klik "⚙ Pengaturan Guru"
4. Masukkan API Key → klik Simpan
5. API Key tersimpan sementara di browser (hilang saat browser ditutup)

> **Privasi**: API Key TIDAK dikirim ke server sekolah, hanya digunakan langsung dari browser ke Anthropic.

---

## 3. Cara Deploy ke GitHub Pages (Gratis)

### Langkah-langkah:
1. Buka [github.com](https://github.com) → Login atau buat akun
2. Klik tombol **+** → **New repository**
3. Nama repo: `ujian-tik-sukasari4` (atau nama lain)
4. Pilih **Public** → klik **Create repository**
5. Upload semua file project (drag & drop ke halaman GitHub)
6. Masuk ke **Settings** → **Pages** (menu kiri)
7. Di "Source", pilih **Deploy from branch** → pilih `main` → `/root`
8. Klik **Save**
9. Tunggu 1–2 menit → URL muncul: `https://username.github.io/ujian-tik-sukasari4`

### Bagikan ke siswa:
- Kirim URL via WhatsApp grup
- Atau buat QR Code di [qr-code-generator.com](https://www.qr-code-generator.com)
- Tempel QR Code di papan kelas

---

## 4. Cara Deploy ke Vercel (Alternatif, Lebih Cepat)

1. Buka [vercel.com](https://vercel.com) → Login dengan GitHub
2. Klik **Add New Project**
3. Import repo GitHub yang sudah dibuat
4. Klik **Deploy** (tidak perlu konfigurasi)
5. URL otomatis: `https://ujian-tik-sukasari4.vercel.app`

---

## 5. FAQ

**Q: Apakah siswa perlu install aplikasi?**
A: Tidak. Cukup buka link di browser HP atau komputer.

**Q: Apakah bisa dikerjakan tanpa internet?**
A: Tidak bisa, karena soal dan koreksi AI memerlukan koneksi internet.

**Q: Apakah nilai tersimpan otomatis?**
A: Nilai hanya tersimpan sementara di browser siswa. Minta siswa screenshot atau cetak hasil sebelum menutup browser.

**Q: Bagaimana jika koreksi AI tidak jalan?**
A: Pilihan ganda tetap dikoreksi otomatis. Isian dan uraian perlu dikoreksi manual oleh guru.

**Q: Bisakah soal dikerjakan berkali-kali?**
A: Bisa. Siswa cukup kembali ke beranda dan mulai lagi.
