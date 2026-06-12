
| Topik Capstone | Topik Capstone |  |
| :---- | :---- | :---- |
| Siklus / Tahun | **Ganjil (Oktober) / 2025** |  |
| Judul Dokumen | **Capstone TA** Keuangan Pintar: Sistem Pencatatan Keuangan Berbasis Web dengan AI & OCR untuk Efisiensi |  |
| Jenis Dokumen | **IMPLEMENTASI** |  |
| Nomor Dokumen | **(C400.[NoRev]TA[2025].[1/2].[Kelompok 3]** |  |
| Nomor Revisi | **NoRev** |  |
| Nama File | **Kelompok 3.pdf** |  |
| Tanggal Penerbitan | **18 – 12 - 2025** |  |
| Unit Penerbit | **Program Studi Teknik Informatika FT UCA** |  |
| Jumlah Halaman | **10** | Tidak termasuk sampul |

|  DATA PENGUSUL |  |  |  |  |
| :---- | :---- | :---- | :---- | :---- |
| **NAMA** | **NIM** | **TANGGAL** | **JABATAN** | **TANDA TANGAN** |
|  Fahmi Sidiq |  2222105063 |  |  Anggota |  |
|  Suhendri |  2222105209 |  |  Anggota |  |
|  Dedi Abdul Rohman |  2222105054 |  |  Ketua |  |
|  Calvin Kenneth |  2222105050 |  |  Anggota |  |
|  Arya Pratama |  2222105047 |  |  Anggota |  |
| Chantika A. Ratu Kharisma | 2222105051 |  | Anggota |  |
| Depi Juniar | 2222105056 |  | Anggota |  |
| Erlangga Esa Putra | 2222105062 |  | Anggota |  |
| Faqih Ahmad  | 2222105066 |  | Anggota |  |
| Pujhy Novianty Romadhona | 2222105177 |  | Anggota |  |
| Rendi Pratama  | 2222105186 |  | Anggota |  |
|   **PEMBIMBING 1 (UTAMA)** |  |  |  |  |
| **NAMA** | **NIDN** | **TANGGAL** | **JABATAN** | **TANDA TANGAN** |
|  M. Adhit Dwi Yuda, S.kom.,M.T.I |  |  |  Pembimbing |  |

## Daftar Isi

**1. Pendahuluan**
- 1.1. Ringkasan isi dokumen
- 1.2. Aplikasi Dokumen
- 1.3. Referensi
- 1.4. Daftar Singkatan

**2. Implementasi**
- 2.1. Lingkungan Implementasi
- 2.2. Bahasa Pemrograman & Tools
- 2.3. Struktur Proyek
- 2.4. Implementasi Fitur Utama

**3. Tampilan Produk**
- 3.1. Halaman Login & Dashboard
- 3.2. Fitur Input Manual & OCR
- 3.3. Manajemen Kategori & Laporan

**4. Demonstrasi Produk**

| Versi, Tanggal, Oleh | Perbaikan |
| ----- | ----- |
| 1.0, 18-12-2025, Tim | Rilis Awal |

---

# 1. Pendahuluan

## 1.1. Ringkasan isi dokumen

Dokumen ini menjelaskan detail implementasi dari sistem aplikasi "Dompet Teratai". Fokus utama dokumen adalah menjabarkan bagaimana desain sistem yang telah dirancang direalisasikan menjadi kode program yang fungsional. Dokumen ini mencakup spesifikasi lingkungan pengembangan, teknologi yang digunakan, struktur kode, serta tangkapan layar (screenshot) dari antarmuka aplikasi yang telah dibangun.

## 1.2. Aplikasi Dokumen

Dokumen ini berlaku untuk pengembangan produk (capstone design) untuk:
1) Menjadi panduan teknis bagi tim pengembang dalam memahami struktur kode sistem.
2) Memastikan bahwa implementasi sesuai dengan spesifikasi desain yang telah disetujui.
3) Menjadi dokumentasi untuk pemeliharaan (maintenance) dan pengembangan lebih lanjut.

Proposal ini diajukan kepada dosen pembimbing tugas akhir dan tim capstone tugas akhir Program Studi Teknik UCA sebagai bahan penilaian tugas akhir.

## 1.3. Referensi

Lihat dokumen C100 (Proposal) dan C200 (Software Requirements Specification) untuk referensi lengkap mengenai kebutuhan dan desain sistem.

## 1.4. Daftar Singkatan

- **API**: Application Programming Interface
- **OCR**: Optical Character Recognition
- **UI/UX**: User Interface / User Experience
- **SPA**: Single Page Application
- **DBMS**: Database Management System

# 2. Implementasi

## 2.1. Lingkungan Implementasi

Pengembangan dan implementasi sistem dilakukan menggunakan lingkungan sebagai berikut:

| Komponen | Spesifikasi | Keterangan |
| :--- | :--- | :--- |
| **Sistem Operasi** | Windows 10/11, macOS, Linux | Environment pengembangan |
| **Runtime Environment** | Node.js v18+ | Untuk menjalankan build tools dan server lokal |
| **Database** | Supabase (PostgreSQL) | Database cloud untuk data transaksi & user |
| **Browser** | Chrome, Edge, Firefox | Untuk pengujian klien |
| **Editor Kode** | Visual Studio Code | IDE Utama |

## 2.2. Bahasa Pemrograman & Tools

Teknologi utama yang digunakan dalam implementasi kode:

1.  **Frontend Framework**: React (v18) dengan TypeScript.
    -   Alasan: Performa tinggi, *type-safety*, dan ekosistem komponen yang luas.
2.  **Build Tool**: Vite.
    -   Alasan: Waktu build yang sangat cepat dan Hot Module Replacement (HMR) yang efisien.
3.  **Styling**: Vanilla CSS / CSS Modules.
    -   Alasan: Kontrol penuh terhadap desain antarmuka yang clean dan responsif.
4.  **Autentikasi & Backend Services**: Supabase.
    -   Alasan: Menyediakan Auth (Google OAuth), Database, dan Real-time subscription dalam satu paket.
5.  **OCR Processing**: Tesseract.js / Google Cloud Vision API (via Backend Proxy).
    -   Alasan: Ekstraksi teks dari gambar struk belanja.

## 2.3. Struktur Proyek

Struktur direktori kode sumber aplikasi disusun sebagai berikut untuk mempermudah navigasi dan modularitas:

```
src/
├── assets/          # Gambar, icon, dan file statis
├── components/      # Komponen UI yang dapat digunakan kembali (Button, Card, Input)
├── contexts/        # React Context untuk state global (AuthContext, TransactionContext)
├── hooks/           # Custom React Hooks
├── lib/             # Konfigurasi library pihak ketiga (supabaseClient.ts)
├── pages/           # Halaman utama aplikasi (Dashboard, Login, Settings)
├── services/        # Logika komunikasi dengan API/Database
├── styles/          # File CSS global dan modular
├── types/           # Definisi tipe TypeScript
├── App.tsx          # Komponen root & Routing
└── main.tsx         # Entry point aplikasi
```

## 2.4. Implementasi Fitur Utama

### A. Autentikasi Pengguna
Menggunakan **Supabase Auth** untuk menangani pendaftaran dan login. Fitur ini mengamankan akses aplikasi sehingga hanya pengguna terdaftar yang dapat melihat data keuangannya. Fokus pada integrasi **Google OAuth** untuk kemudahan akses satu-klik.

### B. Input Transaksi Manual
Formulir input yang responsif memungkinkan pengguna memasukkan data pengeluaran/pemasukan. Validasi input dilakukan di sisi klien untuk memastikan integritas data sebelum dikirim ke database.

### C. Pemindaian Struk (OCR)
Modul ini mengizinkan pengguna mengunggah foto struk. Sistem kemudian memproses gambar tersebut, mengekstrak teks relevan (seperti total harga dan tanggal), dan secara otomatis mengisi formulir transaksi untuk diverifikasi pengguna.

### D. Dashboard & Visualisasi
Implementasi grafik dan ringkasan keuangan menggunakan library charting. Data diambil secara *real-time* dari Supabase untuk memberikan wawasan keuangan terkini kepada pengguna.

# 3. Tampilan Produk

## 3.1. Halaman Login & Dashboard

*(Tempatkan screenshot halaman login dengan tombol "Sign in with Google" dan tampilan Dashboard utama yang menampilkan ringkasan saldo, grafik pengeluaran, dan daftar transaksi terbaru disini).*

## 3.2. Fitur Input Manual & OCR

*(Tempatkan screenshot form input manual dan antarmuka saat pengguna mengunggah/memindai struk belanja, menampilkan hasil ekstraksi data otomatis).*

## 3.3. Manajemen Kategori & Laporan

*(Tempatkan screenshot halaman pengaturan kategori dimana pengguna bisa menambah/edit kategori, serta halaman laporan bulanan).*

# 4. Demonstrasi Produk

Video demonstrasi penggunaan aplikasi Dompet Teratai dapat diakses melalui tautan berikut:

**[Link Video Demo - Akan Ditambahkan Setelah Deployment]**

Video ini mencakup skenario:
1.  Login pengguna baru.
2.  Menambahkan transaksi pengeluaran manual.
3.  Menggunakan fitur OCR untuk scan struk.
4.  Melihat dan memfilter laporan keuangan di dashboard.