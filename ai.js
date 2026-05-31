// ai.js — Logika Koreksi Ujian dengan Gemini, Groq, dan Claude API

/**
 * Mengoreksi Pilihan Ganda (PG) secara lokal
 * @param {Array} soalPG - Array soal PG dari JSON
 * @param {Object} jawabanSiswa - Map nomor soal ke jawaban siswa (a/b/c)
 * @returns {Array} Hasil koreksi per soal [{no, siswa, benar, nilai, isBenar}]
 */
function koreksiPG(soalPG, jawabanSiswa) {
  return soalPG.map(q => {
    const jawabanSiswaValue = (jawabanSiswa[q.no] || "").toLowerCase().trim();
    const jawabanBenar = q.jawaban.toLowerCase().trim();
    const isBenar = jawabanSiswaValue === jawabanBenar;
    return {
      no: q.no,
      soal: q.soal,
      pilihan: q.pilihan,
      siswa: jawabanSiswaValue,
      benar: jawabanBenar,
      nilai: isBenar ? 1 : 0, // raw score (0 atau 1)
      isBenar: isBenar
    };
  });
}

/**
 * Mengoreksi Isian Singkat secara lokal sebagai fallback offline
 * @param {Array} soalIsian - Array soal Isian dari JSON
 * @param {Object} jawabanSiswa - Map nomor soal ke jawaban siswa
 * @returns {Array} Hasil koreksi offline
 */
function koreksiIsianOffline(soalIsian, jawabanSiswa) {
  return soalIsian.map(q => {
    const jawabanSiswaValue = (jawabanSiswa[q.no] || "").trim();
    const normalizedSiswa = jawabanSiswaValue.toLowerCase().replace(/\s+/g, " ");
    
    // Mendukung beberapa kunci jawaban yang dipisahkan oleh karakter "|" atau ","
    const kunciList = q.kunci.split(/[|,]+/).map(k => k.trim().toLowerCase().replace(/\s+/g, " "));
    
    const isBenar = kunciList.some(kunci => {
      if (kunci === "") return false;
      // Perbandingan persis
      if (normalizedSiswa === kunci) return true;
      // Perbandingan toleran untuk anak-anak (kata kunci terkandung di dalam jawaban)
      if (kunci.length >= 3 && (normalizedSiswa.includes(kunci) || kunci.includes(normalizedSiswa))) {
        return true;
      }
      return false;
    });

    return {
      no: q.no,
      soal: q.soal,
      kunci: q.kunci.replace(/[|,]+/g, " / "),
      siswa: jawabanSiswaValue,
      nilai: isBenar ? 1 : 0,
      komentar: isBenar 
        ? "Jawabanmu tepat sekali! (Koreksi Otomatis Offline)" 
        : `Jawaban kurang tepat. Kunci jawaban: ${q.kunci.split(/[|,]+/g).join(" / ")} (Koreksi Otomatis Offline)`,
      isOffline: true
    };
  });
}

/**
 * Mengoreksi Uraian secara offline (selalu nilai 0 dengan instruksi koreksi mandiri orang tua)
 * @param {Array} soalUraian - Array soal Uraian dari JSON
 * @param {Object} jawabanSiswa - Map nomor soal ke jawaban siswa
 * @returns {Array} Hasil koreksi offline
 */
function koreksiUraianOffline(soalUraian, jawabanSiswa) {
  return soalUraian.map(q => {
    return {
      no: q.no,
      soal: q.soal,
      rubrik: q.rubrik,
      siswa: jawabanSiswa[q.no] || "",
      nilai: 0, // default 0 agar tidak mengacaukan perhitungan jumlah
      komentar: "Belum dinilai. Orang tua siswa dapat membaca rubrik di bawah dan memberikan nilai mandiri.",
      isOffline: true
    };
  });
}

/**
 * Helper untuk fetch dengan fallback CORS proxy
 * @param {string} url - Target URL API
 * @param {Object} options - Parameter fetch
 * @param {boolean} useProxyFallback - Apakah mencoba proxy jika direct fetch gagal
 * @returns {Promise<Response>} Respon fetch
 */
async function fetchDenganProxy(url, options, useProxyFallback = true) {
  try {
    console.log(`Mencoba direct fetch ke: ${url}`);
    const response = await fetch(url, options);
    if (response.ok) return response;
    
    const errText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errText}`);
  } catch (e) {
    if (useProxyFallback) {
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      console.warn(`Direct fetch gagal/diblokir CORS. Mencoba via proxy: ${proxyUrl}`);
      const response = await fetch(proxyUrl, options);
      if (response.ok) return response;
      
      const errText = await response.text();
      throw new Error(`Proxy HTTP ${response.status}: ${errText}`);
    }
    throw e;
  }
}

/**
 * Menyiapkan system dan user prompt untuk koreksi isian & uraian
 * @param {Object} dataUjian - Data lengkap soal
 * @param {Object} jawabanSiswa - Jawaban siswa
 * @returns {Object} { systemPrompt, userPrompt }
 */
function siapkanPromptKoreksi(dataUjian, jawabanSiswa) {
  const isianData = dataUjian.isian.map(q => ({
    no: q.no,
    soal: q.soal,
    kunci: q.kunci,
    jawaban_siswa: jawabanSiswa[q.no] || ""
  }));

  const uraianData = dataUjian.uraian.map(q => ({
    no: q.no,
    soal: q.soal,
    rubrik: q.rubrik,
    jawaban_siswa: jawabanSiswa[q.no] || ""
  }));

  const systemPrompt = `Kamu adalah seorang Guru TIK SD yang ramah, hangat, bijaksana, dan teliti. Tugasmu adalah mengoreksi jawaban ujian siswa Kelas ${dataUjian.kelas} SD dalam Bahasa Indonesia.
Sekolah: ${dataUjian.sekolah}
Mata Pelajaran: ${dataUjian.mapel}
Topik: ${dataUjian.topik}

Koreksilah jawaban siswa berdasarkan KUNCI JAWABAN (untuk Isian) dan RUBRIK PENILAIAN (untuk Uraian).
PENTING:
- Untuk Isian: Berikan nilai 1 jika jawaban siswa secara esensi cocok dengan kunci jawaban, dan 0 jika salah.
- Untuk Uraian: Berikan nilai bulat antara 0 sampai 4 (0, 1, 2, 3, atau 4) berdasarkan tingkat kecocokan jawaban siswa dengan rubrik penilaian. Siswa SD kelas rendah mungkin menulis dengan ejaan sederhana, berikan toleransi yang ramah anak.
- Berikan KOMENTAR pendek (1-2 kalimat) yang ramah anak, mendidik, dan memotivasi siswa (misal menggunakan kata: "Hebat sekali!", "Bagus!", "Ayo belajar lagi!"). Jangan terlalu kaku.

Kembalikan hasil koreksi HANYA dalam format JSON valid dan mentah (RAW JSON), tanpa teks penjelasan sebelum atau sesudahnya. Format output yang WAJIB:
{
  "isian": [
    {
      "no": 11,
      "nilai": 1,
      "komentar": "Jawabanmu sangat tepat! Kamu pintar sekali."
    }
  ],
  "uraian": [
    {
      "no": 21,
      "nilai": 4,
      "komentar": "Luar biasa! Kamu menjelaskan Paint dengan sangat lengkap dan mudah dipahami."
    }
  ]
}`;

  const userPrompt = `Berikut data jawaban siswa Kelas ${dataUjian.kelas} SD atas nama "${sessionStorage.getItem("siswa_nama") || "Siswa"}":

[DATA ISIAN SINGKAT (No. 11-20)]
${JSON.stringify(isianData, null, 2)}

[DATA URAIAN (No. 21-25)]
${JSON.stringify(uraianData, null, 2)}

Koreksi sekarang dan berikan JSON hasil sesuai instruksi system.`;

  return { systemPrompt, userPrompt };
}

/**
 * Membersihkan format text hasil AI agar menjadi JSON valid
 * @param {string} text - Response text mentah dari AI
 * @returns {Object} JSON object yang diparse
 */
function bersihkanDanParseJson(text) {
  let cleanText = text.trim();
  if (cleanText.startsWith("```json")) {
    cleanText = cleanText.replace(/^```json/, "").replace(/```$/, "").trim();
  } else if (cleanText.startsWith("```")) {
    cleanText = cleanText.replace(/^```/, "").replace(/```$/, "").trim();
  }
  return JSON.parse(cleanText);
}

/**
 * Panggil Google Gemini API (Sangat direkomendasikan karena mendukung CORS asli browser!)
 */
async function panggilGeminiAPI(dataUjian, jawabanSiswa, apiKey, model) {
  const { systemPrompt, userPrompt } = siapkanPromptKoreksi(dataUjian, jawabanSiswa);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const bodyData = {
    contents: [
      {
        parts: [
          { text: `${systemPrompt}\n\n${userPrompt}` }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json"
    }
  };

  const response = await fetchDenganProxy(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bodyData)
  }, false); // Gemini tidak butuh proxy karena mendukung CORS di browser!

  const resData = await response.json();
  const rawText = resData.candidates[0].content.parts[0].text;
  const parsedResult = bersihkanDanParseJson(rawText);

  if (parsedResult.isian && parsedResult.uraian) {
    return { isian: parsedResult.isian, uraian: parsedResult.uraian, isSuccess: true };
  }
  throw new Error("Struktur JSON respon Gemini tidak lengkap.");
}

/**
 * Panggil Groq API (Sangat cepat, menggunakan antarmuka OpenAI-Compatible)
 */
async function panggilGroqAPI(dataUjian, jawabanSiswa, apiKey, model) {
  const { systemPrompt, userPrompt } = siapkanPromptKoreksi(dataUjian, jawabanSiswa);
  const url = "https://api.groq.com/openai/v1/chat/completions";

  const bodyData = {
    model: model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    response_format: { type: "json_object" }
  };

  // Groq memblokir CORS di browser, jadi gunakan fallback Proxy secara otomatis
  const response = await fetchDenganProxy(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(bodyData)
  }, true);

  const resData = await response.json();
  const rawText = resData.choices[0].message.content;
  const parsedResult = bersihkanDanParseJson(rawText);

  if (parsedResult.isian && parsedResult.uraian) {
    return { isian: parsedResult.isian, uraian: parsedResult.uraian, isSuccess: true };
  }
  throw new Error("Struktur JSON respon Groq tidak lengkap.");
}

/**
 * Panggil Anthropic Claude API (Format asli)
 */
async function panggilClaudeAPI(dataUjian, jawabanSiswa, apiKey, model) {
  const { systemPrompt, userPrompt } = siapkanPromptKoreksi(dataUjian, jawabanSiswa);
  const url = "https://api.anthropic.com/v1/messages";

  const bodyData = {
    model: model,
    max_tokens: 4000,
    system: systemPrompt,
    messages: [
      { role: "user", content: userPrompt }
    ]
  };

  // Claude memblokir CORS di browser, wajib menggunakan fallback Proxy
  const response = await fetchDenganProxy(url, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    },
    body: JSON.stringify(bodyData)
  }, true);

  const resData = await response.json();
  const rawText = resData.content[0].text;
  const parsedResult = bersihkanDanParseJson(rawText);

  if (parsedResult.isian && parsedResult.uraian) {
    return { isian: parsedResult.isian, uraian: parsedResult.uraian, isSuccess: true };
  }
  throw new Error("Struktur JSON respon Claude tidak lengkap.");
}

/**
 * Menghitung predikat berdasarkan nilai total akhir
 * @param {number} total - Nilai total (0-100)
 * @returns {string} Predikat A/B/C/D/E
 */
function dapatkanPredikat(total) {
  if (total >= 90) return "A";
  if (total >= 80) return "B";
  if (total >= 70) return "C";
  if (total >= 60) return "D";
  return "E";
}

/**
 * Mengoreksi seluruh ujian (PG + Isian + Uraian)
 * @param {Object} dataUjian - Data soal lengkap
 * @param {Object} jawabanSiswa - Jawaban siswa
 * @param {string} _deprecatedApiKey - Parameter lama (diabaikan, sekarang baca dari sessionStorage)
 * @returns {Promise<Object>} Hasil penilaian lengkap
 */
async function koreksiUjianLengkap(dataUjian, jawabanSiswa, _deprecatedApiKey = "") {
  // 1. Koreksi Pilihan Ganda secara lokal (Selalu Berhasil)
  const hasilPG = koreksiPG(dataUjian.pg, jawabanSiswa);
  const rawScorePG = hasilPG.reduce((sum, item) => sum + item.nilai, 0); // max 10
  const scorePG = rawScorePG * 4; // 10 * 4 = max 40

  let hasilIsian = [];
  let hasilUraian = [];
  let isAiScored = false;
  let aiError = "";
  
  // Baca pengaturan AI dinamis dari sessionStorage
  const provider = sessionStorage.getItem("ai_provider") || CONFIG.DEFAULT_PROVIDER || "gemini";
  const apiKey = sessionStorage.getItem("ai_api_key") || "";
  const model = sessionStorage.getItem("ai_model") || CONFIG.DEFAULT_MODELS[provider];

  // 2. Koreksi Isian & Uraian via AI terpilih jika ada API Key
  if (apiKey && apiKey.trim() !== "") {
    try {
      console.log(`Memulai koreksi dengan Provider: ${provider.toUpperCase()} (Model: ${model})`);
      let aiResult = null;

      if (provider === "gemini") {
        aiResult = await panggilGeminiAPI(dataUjian, jawabanSiswa, apiKey, model);
      } else if (provider === "groq") {
        aiResult = await panggilGroqAPI(dataUjian, jawabanSiswa, apiKey, model);
      } else if (provider === "claude") {
        aiResult = await panggilClaudeAPI(dataUjian, jawabanSiswa, apiKey, model);
      } else {
        throw new Error(`Provider AI "${provider}" tidak didukung.`);
      }

      if (aiResult && aiResult.isSuccess) {
        isAiScored = true;
        
        // Gabungkan detail soal asli dengan hasil koreksi AI
        hasilIsian = dataUjian.isian.map(q => {
          const aiGrading = aiResult.isian.find(item => item.no === q.no) || { nilai: 0, komentar: "Tidak ada komentar dari AI." };
          return {
            no: q.no,
            soal: q.soal,
            kunci: q.kunci,
            siswa: jawabanSiswa[q.no] || "",
            nilai: Number(aiGrading.nilai) || 0, // raw score (0 atau 1)
            komentar: aiGrading.komentar || "Bagus!",
            isOffline: false
          };
        });

        hasilUraian = dataUjian.uraian.map(q => {
          const aiGrading = aiResult.uraian.find(item => item.no === q.no) || { nilai: 0, komentar: "Tidak ada komentar dari AI." };
          return {
            no: q.no,
            soal: q.soal,
            rubrik: q.rubrik,
            siswa: jawabanSiswa[q.no] || "",
            nilai: Number(aiGrading.nilai) || 0, // score (0 s/d 4)
            komentar: aiGrading.komentar || "Terima kasih atas jawabanmu.",
            isOffline: false
          };
        });
      }
    } catch (e) {
      console.error(`Kesalahan sistem koreksi AI (${provider}):`, e);
      aiError = `${provider.toUpperCase()} error: ${e.message}`;
    }
  }

  // Fallback ke Koreksi Offline jika API tidak ada / gagal
  if (!isAiScored) {
    console.warn(`Menggunakan koreksi offline karena: ${aiError || "API Key tidak diisi"}`);
    hasilIsian = koreksiIsianOffline(dataUjian.isian, jawabanSiswa);
    hasilUraian = koreksiUraianOffline(dataUjian.uraian, jawabanSiswa);
  }

  // 3. Hitung Skor Akhir
  const rawScoreIsian = hasilIsian.reduce((sum, item) => sum + (item.nilai || 0), 0); // max 10
  const scoreIsian = rawScoreIsian * 4; // 10 * 4 = max 40

  const scoreUraian = hasilUraian.reduce((sum, item) => sum + (item.nilai || 0), 0); // max 20 (5 * 4)

  const totalScore = scorePG + scoreIsian + scoreUraian; // max 100
  const predikat = dapatkanPredikat(totalScore);

  // Return objek laporan hasil lengkap
  return {
    siswa: {
      nama: sessionStorage.getItem("siswa_nama") || "Siswa",
      absen: sessionStorage.getItem("siswa_absen") || "0",
      kelas: dataUjian.kelas,
      topik: dataUjian.topik,
      mapel: dataUjian.mapel,
      sekolah: dataUjian.sekolah,
      tahun: dataUjian.tahun
    },
    nilai: {
      pg: scorePG,
      isian: scoreIsian,
      uraian: scoreUraian,
      total: totalScore,
      predikat: predikat
    },
    detail: {
      pg: hasilPG,
      isian: hasilIsian,
      uraian: hasilUraian
    },
    status: {
      isAiScored: isAiScored,
      aiProvider: isAiScored ? provider : "offline",
      aiModel: isAiScored ? model : "none",
      aiError: aiError,
      tanggal: new Date().toLocaleDateString("id-ID", {
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  };
}
