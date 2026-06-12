
| Topik Capstone | Topik Capstone |  |
| :---- | :---- | :---- |
| Siklus / Tahun | **Ganjil (Oktober) / 2025** |  |
| Judul Dokumen | **Capstone TA** Keuangan Pintar: Sistem Pencatatan Keuangan Berbasis Web dengan AI & OCR untuk Efisiensi |  |
| Jenis Dokumen | **PENGUJIAN** |  |
| Nomor Dokumen | **(C500.[NoRev]TA[2025].[1/2].[Kelompok 3]** |  |
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

**2. Rencana Pengujian**
- 2.1. Lingkungan Pengujian
- 2.2. Metode Pengujian
- 2.3. Skenario Pengujian

**3. Hasil Pengujian**
- 3.1. Pengujian Fungsional (Blackbox)
- 3.2. Pengujian Usability
- 3.3. Pengujian OCR Accuracy

**4. Kesimpulan**

| Versi, Tanggal, Oleh | Perbaikan |
| ----- | ----- |
| 1.0, 18-12-2025, Tim | Rilis Awal |

---

# 1. Pendahuluan

## 1.1. Ringkasan isi dokumen

Dokumen ini berisi rencana dan hasil pengujian untuk aplikasi "Dompet Teratai". Pengujian dilakukan untuk memverifikasi bahwa sistem berjalan sesuai dengan kebutuhan fungsional dan non-fungsional yang telah didefinisikan sebelumnya. Fokus utama pengujian adalah pada fungsionalitas inti seperti pencatatan transaksi, akurasi fitur OCR, dan keamanan autentikasi pengguna.

## 1.2. Aplikasi Dokumen

Dokumen ini berlaku untuk pengembangan produk (capstone design) untuk:
1) Menjamin kualitas perangkat lunak (Quality Assurance) sebelum dirilis ke pengguna.
2) Mengidentifikasi bug atau kesalahan logika sistem lebih awal.
3) Menjadi bukti validasi bahwa produk memenuhi standar kelayakan.

Proposal ini diajukan kepada dosen pembimbing tugas akhir dan tim capstone tugas akhir Program Studi Teknik UCA sebagai bahan penilaian tugas akhir.

## 1.3. Referensi

- Dokumen C200 (Spesifikasi Kebutuhan Perangkat Lunak)
- Standar Pengujian Perangkat Lunak ISO/IEC 29119

## 1.4. Daftar Singkatan

- **TC**: Test Case
- **UAT**: User Acceptance Testing
- **OCR**: Optical Character Recognition

# 2. Rencana Pengujian

## 2.1. Lingkungan Pengujian

Pengujian dilakukan pada lingkungan berikut:
- **Perangkat Keras**: Laptop (Windows 11, RAM 16GB) dan Smartphone (Android 13).
- **Peramban Web**: Google Chrome (versi terbaru) dan Microsoft Edge.
- **Koneksi Internet**: Wifi Stabil (100 Mbps) untuk simulasi kondisi optimal, dan Data Seluler (4G) untuk simulasi lapangan.

## 2.2. Metode Pengujian

Metode yang digunakan adalah **Blackbox Testing**, dimana pengujian berfokus pada output yang dihasilkan dari input tertentu tanpa melihat kode internal.

## 2.3. Skenario Pengujian

| ID | Fitur | Skenario | Harapan |
| :--- | :--- | :--- | :--- |
| TC-01 | Registrasi/Login | Login dengan Google OAuth | Pengguna diarahkan ke dashboard setelah berhasil login akun Google. |
| TC-02 | Registrasi/Login | Login tanpa kredensial | Muncul pesan error validasi. |
| TC-03 | Transaksi Manual | Input data pemasukan valid | Data tersimpan dan saldo bertambah. |
| TC-04 | Transaksi Manual | Input nominal negatif | Sistem menolak input dan menampilkan peringatan. |
| TC-05 | Fitur OCR | Upload gambar struk jelas | Sistem mendeteksi total harga dan tanggal dengan benar. |
| TC-06 | Fitur OCR | Upload gambar buram/gelap | Sistem memberi peringatan image tidak terbaca atau hasil akurasi rendah. |
| TC-07 | Dashboard | Filter Laporan Bulanan | Grafik menampilkan data sesuai bulan yang dipilih. |

# 3. Hasil Pengujian

## 3.1. Pengujian Fungsional (Blackbox)

| ID Test | Tanggal Uji | Hasil (Pass/Fail) | Catatan |
| :--- | :--- | :--- | :--- |
| TC-01 | 10-12-2025 | **PASS** | Redirect berjalan lancar. |
| TC-02 | 10-12-2025 | **PASS** | Validasi form berfungsi. |
| TC-03 | 11-12-2025 | **PASS** | Saldo terupdate real-time. |
| TC-04 | 11-12-2025 | **PASS** | Input negatif diblokir. |
| TC-05 | 12-12-2025 | **PASS** | Waktu proses rata-rata 3 detik. Akurasi 90% pada struk Alfamart/Indomaret. |
| TC-06 | 12-12-2025 | **PASS** | Error handling berjalan saat OCR gagal membaca. |
| TC-07 | 13-12-2025 | **PASS** | Chart.js merender ulang data dengan benar. |

## 3.2. Pengujian Usability

Berdasarkan pengujian dengan 5 responden pengguna awal:
- **Kemudahan Penggunaan**: 4.5/5
- **Desain Antarmuka**: 4.2/5
- **Kecepatan Aplikasi**: 4.0/5

*Feedback:* Pengguna merasa fitur OCR sangat membantu mempercepat pencatatan, namun meminta adanya fitur edit manual jika hasil scan kurang tepat (Fitur ini sudah diimplementasikan).

## 3.3. Pengujian OCR Accuracy

Pengujian dilakukan dengan 20 sampel struk belanja berbeda:
- **Total Harga**: Terbaca benar pada 18/20 struk (90%).
- **Tanggal**: Terbaca benar pada 17/20 struk (85%).
- **Kegagalan**: Terjadi pada struk yang lecek, luntur, atau kondisi cahaya sangat rendah.

# 4. Kesimpulan

Secara keseluruhan, aplikasi Dompet Teratai telah memenuhi spesifikasi fungsional utama. Fitur inti seperti pencatatan transaksi manual dan integrasi backend berjalan 100% lancar. Fitur unggulan OCR memiliki tingkat keberhasilan yang tinggi untuk penggunaan sehari-hari yang wajar. Sistem dinyatakan siap untuk tahap deployment dan penggunaan oleh pengguna umum.