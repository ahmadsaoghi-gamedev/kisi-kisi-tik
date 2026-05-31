// config.js — JANGAN commit ke GitHub jika pakai API key pribadi
// Untuk GitHub Pages, gunakan input manual di halaman utama (Pengaturan Guru)

const CONFIG = {
  SEKOLAH: "SDN Sukasari 4 Tangerang",
  NPSN: "20606443",
  NSS: "10.1.02.23.10.068",
  ALAMAT: "Jl. Moch. Yamin No.1, Babakan, Tangerang",
  TAHUN_PELAJARAN: "2025-2026",
  
  // Default Settings untuk AI
  DEFAULT_PROVIDER: "gemini", // Pilihan: 'gemini', 'groq', 'claude'
  DEFAULT_MODELS: {
    gemini: "gemini-1.5-flash", // Gemini 1.5 Flash (Gratis, Cepat, CORS-friendly)
    groq: "llama-3.3-70b-versatile", // Groq Llama 3.3 (Sangat Cepat, LMT Tinggi)
    claude: "claude-3-5-sonnet-20241022" // Claude 3.5 Sonnet (Sangat Akurat)
  }
};
