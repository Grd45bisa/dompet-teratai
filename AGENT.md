# AGENT.md

Panduan ini dipakai saat mengerjakan proyek Dompet Teratai / Expense Tracker.
Fokus perubahan saat ini adalah memindahkan proses AI receipt analysis dari n8n ke backend langsung.

## Tujuan Utama

- Frontend tetap mengirim file ke backend melalui endpoint yang sudah ada:
  `POST /api/ai/analyze-receipt`.
- Backend tidak lagi meneruskan gambar ke n8n untuk analisis AI.
- Backend memproses gambar/PDF, memanggil model AI secara langsung, menormalisasi hasil, lalu mengembalikan data ke frontend.
- Kontrak response ke frontend harus tetap kompatibel dengan `src/lib/api.ts` dan `UploadModal.tsx`.

## Arsitektur Target

Alur yang diinginkan:

```text
Frontend UploadModal
  -> POST /api/ai/analyze-receipt
Backend
  -> validasi auth dan payload
  -> decode base64
  -> kompres gambar bila perlu
  -> jika PDF, ekstrak teks dahulu
  -> panggil AI provider langsung
  -> parse dan validasi JSON
  -> mapping kategori ke category_id
  -> balikan response ke frontend
Frontend
  -> isi form otomatis
  -> user review/edit
  -> simpan transaksi
```

## AI Provider

Gunakan OpenAI SDK dengan NVIDIA API-compatible endpoint:

```ts
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
});
```

Model target:

```text
nvidia/nemotron-3-nano-omni-30b-a3b-reasoning
```

Environment variable yang dibutuhkan:

```text
NVIDIA_API_KEY=...
NVIDIA_AI_MODEL=nvidia/nemotron-3-nano-omni-30b-a3b-reasoning
```

Jangan menaruh API key asli di source code.

## Output AI Wajib

AI harus diminta mengembalikan JSON murni dengan format:

```json
{
  "toko": "string",
  "total": 0,
  "kategori": "string",
  "tanggal": "YYYY-MM-DD",
  "alamat": "string",
  "catatan": "string",
  "confidence": 0.8
}
```

Aturan normalisasi:

- `total` harus number dalam Rupiah, tanpa titik/koma pemisah ribuan.
- `tanggal` harus `YYYY-MM-DD`; jika tidak terbaca, pakai tanggal hari ini.
- `kategori` harus dipetakan ke kategori yang ada di database.
- Jika data tidak yakin, isi string kosong atau fallback aman.
- Jangan percaya output AI mentah tanpa parsing dan validasi.

## PDF Handling

Jika user mengirim PDF/invoice:

- Backend harus mencoba ekstrak teks dari PDF terlebih dahulu.
- Teks hasil ekstraksi dikirim ke AI bersama instruksi ekstraksi data invoice/struk.
- Jika ekstraksi PDF gagal, backend mengembalikan error yang jelas ke frontend.
- Jangan mengirim PDF mentah ke model kecuali provider dan SDK sudah terbukti mendukung format tersebut di endpoint yang dipakai.

## File Yang Kemungkinan Tersentuh

Prioritas perubahan:

- `backend/src/routes/ai.ts`
- `backend/package.json`
- `backend/.env.example`

Opsional bila dibutuhkan:

- `backend/src/services/aiReceiptService.ts`
- `backend/src/services/pdfTextService.ts`
- `src/lib/api.ts` hanya untuk update komentar/type kecil jika kontrak berubah, tetapi sebaiknya kontrak tidak berubah.

## Batasan Penting

- Jangan ubah UI upload kecuali benar-benar diperlukan.
- Jangan ubah endpoint frontend yang sudah berjalan.
- Jangan hapus flow simpan transaksi manual.
- Jangan simpan gambar/PDF ke layanan eksternal tanpa kebutuhan jelas.
- Jangan commit atau expose secret.
- Hindari refactor besar di luar migrasi AI.

## Strategi Implementasi

1. Pisahkan logika AI ke service backend agar route tetap tipis.
2. Tambahkan dependency yang dibutuhkan, misalnya `openai` dan PDF text extractor.
3. Ganti panggilan n8n dengan panggilan langsung ke NVIDIA API.
4. Pertahankan category mapping yang sudah ada.
5. Tambahkan fallback/error handling untuk:
   - API key kosong
   - AI response bukan JSON
   - total tidak valid
   - PDF gagal diekstrak
6. Jalankan build backend dan cek TypeScript.

## Testing Minimal

Sebelum dianggap selesai:

- `npm run build` di folder `backend` harus berhasil.
- Endpoint `/api/ai/analyze-receipt` tetap menerima payload `{ image, filename }`.
- Response sukses tetap berbentuk:

```json
{
  "success": true,
  "data": {
    "toko": "",
    "total": 0,
    "kategori": "",
    "category_id": "",
    "tanggal": "",
    "alamat": "",
    "catatan": "",
    "confidence": 0.8
  }
}
```

