
| Topik Capstone | Topik Capstone |  |
| :---- | :---- | :---- |
| Siklus / Tahun | **Ganjil (Oktober) / 2025** |  |
| Judul Dokumen | **Capstone TA** Keuangan Pintar: Sistem Pencatatan Keuangan Berbasis Web dengan AI & OCR untuk Efisiensi |  |
| Jenis Dokumen | **DESAIN SISTEM** |  |
| Nomor Dokumen | **(C300.[NoRev]TA[2025].[1/2].[Kelompok 3]** |  |
| Nomor Revisi | **NoRev** |  |
| Nama File | **Kelompok 3.pdf** |  |
| Tanggal Penerbitan | **18 – 12 - 2025** |  |
| Unit Penerbit | **Program Studi Teknik Informatika FT UCA** |  |
| Jumlah Halaman | **15** | Tidak termasuk sampul |

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

**2. Arsitektur Sistem**
- 2.1. Gambaran Umum Arsitektur
- 2.2. Diagram Blok Sistem
- 2.3. Teknologi yang Digunakan

**3. Desain Basis Data**
- 3.1. Entity Relationship Diagram (ERD)
- 3.2. Struktur Tabel

**4. Desain Antarmuka (User Interface)**
- 4.1. Wireframe / Mockup Halaman Utama
- 4.2. Desain Alur Pengguna (User Flow)

**5. Desain API dan Integrasi**
- 5.1. Spesifikasi Endpoint API
- 5.2. Integrasi OCR

| Versi, Tanggal, Oleh | Perbaikan |
| ----- | ----- |
| 1.0, 18-12-2025, Tim | Rilis Awal |

---

# 1. Pendahuluan

## 1.1. Ringkasan isi dokumen

Dokumen ini merinci rancangan teknis (Technical Design) untuk aplikasi "Dompet Teratai". Dokumen ini mencakup desain arsitektur perangkat lunak, perancangan basis data, desain antarmuka pengguna, serta spesifikasi API yang akan diimplementasikan. Tujuannya adalah memberikan blue-print yang jelas bagi tim pengembang dalam membangun sistem.

## 1.2. Aplikasi Dokumen

Dokumen ini berlaku untuk pengembangan produk (capstone design) untuk:
1) Menjadi acuan utama dalam proses coding dan implementasi database.
2) Menjelaskan alur data dan interaksi antar komponen sistem secara detail.
3) Memastikan konsistensi desain antarmuka dan pengalaman pengguna (UX).

## 1.3. Referensi

Lihat dokumen C200 (Software Requirements Specification) untuk kebutuhan bisnis yang mendasari desain ini.

## 1.4. Daftar Singkatan

- **ERD**: Entity Relationship Diagram
- **REST**: Representational State Transfer
- **JSON**: JavaScript Object Notation
- **JWT**: JSON Web Token

# 2. Arsitektur Sistem

## 2.1. Gambaran Umum Arsitektur

Aplikasi Dompet Teratai menggunakan arsitektur **Client-Server** modern:
- **Client (Frontend)**: Single Page Application (SPA) berbasis web yang responsif, dibangun dengan React. Bertanggung jawab atas antarmuka pengguna dan logika presentasi.
- **Server (Backend/BaaS)**: Menggunakan layanan Supabase yang menyediakan database PostgreSQL, autentikasi, dan API otomatis. Layanan OCR pihak ketiga akan diakses melalui Edge Functions atau API Proxy.

## 2.3. Teknologi yang Digunakan

| Layer | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Frontend** | React, TypeScript, Tailwind CSS | Framework UI komponen berbasis state. |
| **Backend & Auth** | Supabase | Backend-as-a-Service untuk database dan auth. |
| **Database** | PostgreSQL | Relational Database Management System. |
| **OCR Engine** | Tesseract.js / Google Vision | Engine pengolah citra ke teks. |
| **Hosting** | Vercel / Netlify | Platform deployment frontend. |

# 3. Desain Basis Data

## 3.1. Entity Relationship Diagram (ERD)

Sistem menggunakan database relasional dengan entitas utama sebagai berikut:
- **Users**: Menyimpan data pengguna terdaftar (ID, Email, Nama).
- **Transactions**: Menyimpan data transaksi (ID, User_ID, Amount, Date, Category_ID, Note, Type).
- **Categories**: Menyimpan kategori transaksi (ID, Name, Type, User_ID).

## 3.2. Struktur Tabel

**Tabel `profiles`** (Extends Supabase Auth users)
- `id` (UUID, PK, FK to auth.users)
- `full_name` (Text)
- `avatar_url` (Text)
- `updated_at` (Timestamp)

**Tabel `transactions`**
- `id` (UUID, PK)
- `user_id` (UUID, FKto profiles.id)
- `amount` (Numeric, Not Null)
- `date` (Date, Not Null)
- `category` (Text)
- `description` (Text)
- `type` (Enum: 'income', 'expense')
- `created_at` (Timestamp)

# 4. Desain Antarmuka

## 4.1. Mockup Halaman Utama (Dashboard)

Dashboard dirancang untuk memberikan informasi sekilas yang penting:
- **Header**: Sapaan pengguna dan Ringkasan Saldo Total.
- **Body Atas**: Grafik lingkaran (Pie Chart) proporsi pengeluaran bulan ini.
- **Body Tengah**: Daftar 5 transaksi terakhir (Recent Transactions).
- **Floating Action Button (+)**: Tombol cepat untuk menambah transaksi baru.

## 4.2. Desain Alur Pengguna (Input dengan OCR)

1. User menekan tombol "+" -> Pilih "Scan Struk".
2. User memilih file gambar/kamera.
3. Sistem menampilkan proses "Scanning...".
4. Sistem menampilkan Form Input yang *sudah terisi otomatis* (Total Harga, Tanggal) dari hasil scan.
5. User memverifikasi/mengedit data jika perlu.
6. User menekan "Simpan".

# 5. Desain API dan Integrasi

## 5.1. Spesifikasi Endpoint

Aplikasi menggunakan Supabase JS Client, yang secara internal berkomunikasi melalui REST/WebSocket. Operasi utama meliputi:
- `supabase.from('transactions').select('*')`: Mengambil data transaksi.
- `supabase.from('transactions').insert({...})`: Menambah data baru.
- `supabase.auth.signInWithOAuth(...)`: Login Google.

## 5.2. Integrasi OCR

OCR akan diimplementasikan sebagai fungsi utilitas di frontend (`/utils/ocr.ts`) yang menerima input File Gambar dan mengembalikan Promise berisi string teks atau objek data terekstrak (Date, Amount).