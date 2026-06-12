

| Topik Capstone | Topik Capstone |  |
| :---- | :---- | :---- |
| Siklus / Tahun | **Ganjil (Oktober) / 2025** |  |
| Judul Dokumen | **Capstone TA** Aplikasi Dompet Teratai |  |
| Jenis Dokumen | **SPESIFIKASI** |  |
| Nomor Dokumen | **(C200.\[NoRev\]TA\[2024\].\[1/2\].\[Kelompok 7\]** |  |
| Nomor Revisi | **NoRev** |  |
| Nama File | **Kelompok 7.pdf** |  |
| Tanggal Penerbitan |  |  |
| Unit Penerbit | **Program Studi Teknik Informatika FT UCA** |  |
| Jumlah Halaman | **32** | Tidak termasuk sampul |

|  DATA PENGUSUL |  |  |  |  |
| ----- | ----- | ----- | ----- | ----- |
| **NAMA** | **NIM** | **TANGGAL** | **JABATAN** | **TANDA TANGAN** |
|  Fahmi Sidiq |  2222105063 |  |  Ketua  |  |
|  Suhendri |  2222105209 |  |  Anggota |  |
|  Dedi Abdul Rohman |  2222105054 |  |  Anggota |  |
|  Calvin Kenneth |  2222105050 |  |  Anggota |   |

| NAMA | NIDN | TANGGAL | JABATAN | TANDA TANGAN |
| ----- | ----- | ----- | :---: | ----- |
|  M. Adhit Dwi Yuda, S.kom.,M.T.I |  |  |  Pembimbing |  |

**Daftar Isi**

**[*1\.*](#pendahuluan)**	[***Pendahuluan	4***](#pendahuluan)

[**1.1.	Ringkasan isi dokumen	4**](#ringkasan-isi-dokumen)

[**1.2.	Aplikasi Dokumen	4**](#aplikasi-dokumen)

[**1.3.	Referensi	4**](#dokumen-ini-berlaku-untuk-pengembangan-produk-\(capstone-design\)-untuk:)

[**1.4.	Daftar Singkatan	4**](#daftar-singkatan)

[***2\.***	***Gambaran Sistem	4***](#gambaran-sistem)

[**2.1.**	**Gambaran Sistem Saat Ini	4**](#gambaran-sistem-saat-ini)  
[2.1.1.	Proses rekayasa/proses bisnis	4](#proses-rekayasa)  
[2.1.2.	Prosedur	4](#prosedur)  
[2.1.3.	Service Time	5](#service-time)

[**2.2.**	**Target dari Sistem yang dikembangkan	5**](#service-time)  
[2.2.1.	Ruang lingkup sistem	5](#manajemen-data:)  
[2.2.2.	Proses Rekayasa / Proses Bisnis baru yang ditawarkan	5](#manajemen-data:)  
[2.2.3.	Prosedur	5](#pencatatan-manual-\(opsional\):-pengguna-tetap-dapat-menginput-transaksi-non-struk-\(misal:-biaya-transportasi\)-melalui-form-sederhana.)  
[2.2.4.	Target *Service Time* dari Sistem yang dikembangkan	5](#heading=h.46hyirx4nmr2)

[***3\.***	***Gambaran Umum Sistem yang Dikembangkan	5***](#gambaran-umum-sistem-yang-dikembangkan)

[**3.1.**	**Fungsi utama pada produk	5**](#fungsi-utama-pada-produk)

[**3.2.**	**Karakteristik pengguna	6**](#karakteristik-pengguna)

[**3.3.**	**Batasan	6**](#akurasi-ocr:-teknologi-ocr-yang-digunakan-mungkin-tidak-100%-akurat-untuk-semua-format-struk.-sistem-akan-mengandalkan-verifikasi-pengguna-untuk-mengonfirmasi-data-\(terutama-total-dan-kategori\)-sebelum-disimpan.)

[**3.4.**	**Lingkungan Pengembangan Sistem	6**](#heading=h.bw53b2nxxjay)  
[3.4.1.	Lingkungan pengembangan	6](#lingkungan-pengembangan)  
[3.4.2.	Lingkungan operasional	6](#heading=h.b38o9nmzkq2m)

[***4\.***	***Requirements	7***](#heading=h.lr9hsd2rl7n3)

[**4.1.**	**External interface	7**](#external-interface)  
[4.1.1.	Hardware & Software Interface	7](#hardware-&-software-interface)  
[4.1.2.	Communication Interface	7](#heading=h.7cfvaeqzk7uo)

[**4.2.**	**Functional Description	7**](#heading=h.okt4p4722itj)  
[4.2.1.	Use case diagram	7](#heading=h.dv1x57sndej3)  
[4.2.2.	Use case scenario	7](#heading=h.n3qq95s843rc)

[**4.3.**	**Data Requirements	8**](#heading=h.qbhhaff0mptx)

[**4.4.**	**Functional Requirements	8**](#heading=h.486ifbdpmtf2)

[**4.5.**	**Non-functional Requirements	8**](#heading=h.n20nt15qchc2)

| Versi, Tanggal, Oleh | Perbaikan |
| ----- | ----- |
|   |  |

1. # **Pendahuluan** {#pendahuluan}

   1. ## **Ringkasan isi dokumen** {#ringkasan-isi-dokumen}

   Dompet Teratai adalah aplikasi dasbor keuangan personal berbasis web yang dirancang untuk membantu individu dan keluarga di Indonesia mengelola pengeluaran harian secara efektif. Dibangun dengan teknologi web modern (React, TypeScript, Vite) dan database cloud Supabase, kami memberikan sebuah platform yang tidak hanya intuitif dan mudah digunakan, tetapi juga menjamin keamanan data dengan autentikasi Google OAuth. Fitur unggulan kami, yaitu analisis struk belanja otomatis menggunakan OCR (Optical Character Recognition) melalui API backend, secara drastis mengurangi kesulitan dalam pencatatan manual, menjadikan manajemen keuangan personal lebih efisien dan akurat.

   Visi: Menjadi aplikasi manajemen keuangan pilihan utama bagi masyarakat Indonesia dengan menyederhanakan pencatatan pengeluaran dan memberikan wawasan finansial yang personal. Platform: Aplikasi Web Responsif (Desktop & Mobile). Target Pengguna Utama: Profesional muda, keluarga, dan wirausaha di Indonesia (usia 25-45 tahun) yang melek teknologi dan peduli terhadap kesehatan finansial mereka.

   

   2. ## **Aplikasi Dokumen** {#aplikasi-dokumen}

   Dokumen ini berlaku untuk pengembangan produk (capstone design) untuk:

1) Sebagai gambaran umum dari segi teknis maupun non-teknis tugas akhir yang akan dikerjakan.

2) Memastikan kelayakan tugas akhir, baik dari segi teknik, waktu, biaya/ekonomis, maupun strategis.

3) Menjadi catatan proses pengerjaan dan revisi yang dilakukan.

   Proposal ini diajukan kepada dosen pembimbing tugas akhir dan tim capstone tugas akhir Program Studi Teknik  UCA sebagai bahan penilaian tugas akhir.

   3. ## **Referensi**

* A concise survey of OCR for low‑resource languages — (2024) Survey yang fokus pada teknik OCR untuk bahasa/skrip dengan sumber daya terbatas. [ACL Anthology](https://aclanthology.org/2024.americasnlp-1.10.pdf?utm_source=chatgpt.com)  
* A survey of text detection and recognition algorithms based on deep learning — (2023) Kajian terbaru yang membahas deteksi teks \+ pengenalan teks berbasis deep learning untuk OCR. [ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0925231223008251?utm_source=chatgpt.com)  
* Envisioning personal finance and expense tracking for a sustainable future — (2022) Fokus pada desain UI/UX aplikasi pencatatan pengeluaran yang menyertakan acuan peer/expert untuk pengelolaan keuangan. [dl.designresearchsociety.org](https://dl.designresearchsociety.org/drs-conference-papers/drs2022/researchpapers/306/?utm_source=chatgpt.com)  
* Budget and Expense tracker — (2024) Platform web berbasis yang mendukung kategorisasi otomatis pengeluaran, monitoring real-time, dan laporan detail. [ijerd.com](https://ijerd.com/paper/vol20-issue11/20117982.pdf?utm_source=chatgpt.com)  
* Inside n8n: How a Fair-Code, Open-Source Platform Leads AI-Powered Workflow Automation — (2025) Artikel tentang evolusi n8n menjadi platform AI-orientasi. [Medium](https://medium.com/%40takafumi.endo/inside-n8n-how-a-fair-code-open-source-platform-leads-ai-powered-workflow-automation-e8128890d496?utm_source=chatgpt.com)  
* A Practical Evaluation of Self‑Hosted n8n for Secure and Scalable Workflow Automation — (tahun tak spesifik tapi baru) Evaluasi pelaksanaan n8n secara self-hosted untuk skala & keamanan. [ResearchGate](https://www.researchgate.net/publication/392714509_A_Practical_Evaluation_of_Self-Hosted_n8n_for_Secure_and_Scalable_Workflow_Automation?utm_source=chatgpt.com)

  4. ## **Daftar Singkatan** {#daftar-singkatan}

* **API**: Application Programming Interface (Penghubung depan dan belakang)  
* **OCR**: Optical Character Recognition (Untuk mengubah gambar/foto menjadi teks)  
* **UI/UX**: User Interface / User Experience (Tampilan depan dan pengalaman pengguna)

# 

2. # **Gambaran Sistem** {#gambaran-sistem}

   1. ## **Gambaran Sistem Saat Ini** {#gambaran-sistem-saat-ini}

![][image1]  
Bagian ini mendeskripsikan proses manajemen keuangan personal yang ada saat ini, yang menjadi dasar permasalahan dari pengembangan sistem. "Sistem saat ini" merujuk pada metode manual atau penggunaan aplikasi yang tidak memadai.

1. ### Proses rekayasa {#proses-rekayasa}

   Proses bisnis saat ini dalam pelacakan pengeluaran personal oleh target pengguna (profesional muda, keluarga) memiliki friksi yang tinggi. Alur kerja umumnya adalah sebagai berikut:

1. **Transaksi:** Pengguna melakukan berbagai transaksi harian (misal: belanja di minimarket, makan siang, transportasi online, membeli kopi).  
2. **Pengumpulan Bukti:** Pengguna menerima bukti transaksi berupa struk belanja fisik atau digital (e-receipt).  
3. **Pencatatan (Manual):** Pengguna diharapkan untuk secara konsisten mengumpulkan dan menginput data dari setiap struk ke dalam sebuah catatan, baik itu buku kas, file Excel, atau aplikasi keuangan.  
4. **Hambatan:** Proses pencatatan manual ini sangat membosankan, memakan waktu, dan rawan kesalahan (human error) serta sering terabaikan (lupa mencatat).  
5. **Data Tidak Utuh:** Akibat hambatan tersebut, data keuangan yang terkumpul seringkali tidak lengkap, tidak konsisten, dan tidak akurat.  
6. **Analisis Gagal:** Karena data yang tidak akurat, pengguna gagal mendapatkan wawasan (insight) finansial yang berarti, sehingga tujuan untuk mengontrol pengeluaran tidak tercapai.

   Selain itu, aplikasi yang ada di pasar seringkali memperburuk masalah dengan antarmuka yang rumit atau menimbulkan kekhawatiran privasi karena data sensitif disimpan di server pihak ketiga.

   2. ### Prosedur {#prosedur}

   Prosedur atau aturan bisnis yang ada saat ini bersifat tidak terstandar dan bergantung pada disiplin individu:

1. Pengguna harus menyimpan setiap struk belanja fisik.  
2. Pengguna harus meluangkan waktu khusus (harian atau mingguan) untuk melakukan entri data manual.  
3. Pengguna harus mengkategorikan setiap pengeluaran secara manual.  
4. Jika menggunakan aplikasi pihak ketiga, pengguna harus memercayakan data keuangannya untuk disimpan di server penyedia aplikasi.

   3. ### Service Time {#service-time}

   ### Kualitas layanan dari sistem manual saat ini sangat tidak efisien:

1. ### **Durasi Entri Data:** Proses input data manual dari tumpukan struk dapat memakan waktu 10-15 menit per hari, atau bisa membengkak menjadi 1-2 jam per minggu jika dirapel.

2. ### **Waktu ke Wawasan (Time-to-Insight):** Waktu yang dibutuhkan dari transaksi terjadi hingga pengguna mendapatkan wawasan sangat lama (bisa berhari-hari atau berminggu-minggu), sehingga wawasan tersebut sudah tidak relevan.

3. ### **Tingkat Kegagalan (Failure Rate):** Tingkat kelupaan atau kegagalan mencatat sangat tinggi, menyebabkan data tidak dapat diandalkan.

   2. ## **Target dari Sistem yang dikembangkan**

   Sistem "Dompet Teratai" dikembangkan untuk merekayasa ulang proses bisnis manual yang gagal tersebut menjadi sebuah alur kerja yang efisien, otomatis, dan aman.

   

      1. ### Ruang lingkup sistem          Sistem yang akan dikembangkan adalah aplikasi berbasis web responsif dengan ruang lingkup sebagai berikut: {#manajemen-data:}

1. ### Pengguna Sistem: {#manajemen-data:}

   1. ### Pengguna Umum (Individu/Keluarga): Profesional muda, keluarga, atau siapa saja yang ingin melacak pengeluaran pribadi. {#manajemen-data:}

   2. ### UMKM: Pemilik usaha kecil (seperti Skenario 3: Doni) yang membutuhkan alat pencatatan biaya operasional sederhana.

   

2. ### Fungsi Utama: {#manajemen-data:}

   1. ### Autentikasi pengguna menggunakan akun Google. {#manajemen-data:}

   2. ### Pencatatan pengeluaran (manual). {#manajemen-data:}

   3. ### Otomatisasi pencatatan melalui analisis struk (OCR). {#manajemen-data:}

   4. ### Visualisasi data dan pelaporan melalui dasbor interaktif. {#manajemen-data:}

3. ### Platform Sistem: {#manajemen-data:}

   1. ### Aplikasi Web (Front-end) yang dapat diakses melalui browser desktop dan mobile. {#manajemen-data:}

   2. ### Layanan Back-end untuk mengelola logika bisnis dan alur kerja OCR. {#manajemen-data:}

4. ### Manajemen Data: {#manajemen-data:}

   1. ### Seluruh data transaksi pengguna disimpan secara aman di database cloud Supabase dengan enkripsi. Setiap pengguna memiliki akses eksklusif ke data mereka melalui autentikasi Google OAuth yang terpercaya.

      2. ### Proses Rekayasa / Proses Bisnis baru yang ditawarkan          Sistem ini menawarkan proses bisnis baru yang berfokus pada minimalisasi friksi dan otomatisasi: {#pencatatan-manual-(opsional):-pengguna-tetap-dapat-menginput-transaksi-non-struk-(misal:-biaya-transportasi)-melalui-form-sederhana.}

1. ### Onboarding (Sekali): Pengguna mendaftar/login menggunakan akun Google dan memberikan izin (via OAuth) kepada aplikasi untuk mengakses Google Sheets miliknya. {#pencatatan-manual-(opsional):-pengguna-tetap-dapat-menginput-transaksi-non-struk-(misal:-biaya-transportasi)-melalui-form-sederhana.}

2. ### Pencatatan Otomatis (via OCR): {#pencatatan-manual-(opsional):-pengguna-tetap-dapat-menginput-transaksi-non-struk-(misal:-biaya-transportasi)-melalui-form-sederhana.}

   * ### Pengguna memfoto struk belanja menggunakan aplikasi. {#pencatatan-manual-(opsional):-pengguna-tetap-dapat-menginput-transaksi-non-struk-(misal:-biaya-transportasi)-melalui-form-sederhana.}

   * ### Sistem (via backend API) memproses gambar menggunakan OCR untuk mengekstrak data (Nama toko, total belanja, tanggal). {#pencatatan-manual-(opsional):-pengguna-tetap-dapat-menginput-transaksi-non-struk-(misal:-biaya-transportasi)-melalui-form-sederhana.}

   * ### Pengguna melakukan verifikasi singkat (misal: konfirmasi kategori). {#pencatatan-manual-(opsional):-pengguna-tetap-dapat-menginput-transaksi-non-struk-(misal:-biaya-transportasi)-melalui-form-sederhana.}

   * ### Sistem menyimpan data terstruktur tersebut langsung ke database Supabase pengguna. {#pencatatan-manual-(opsional):-pengguna-tetap-dapat-menginput-transaksi-non-struk-(misal:-biaya-transportasi)-melalui-form-sederhana.}

3. ### Pencatatan Manual (Opsional): Pengguna tetap dapat menginput transaksi non-struk (misal: biaya transportasi) melalui form sederhana. {#pencatatan-manual-(opsional):-pengguna-tetap-dapat-menginput-transaksi-non-struk-(misal:-biaya-transportasi)-melalui-form-sederhana.}

4. ### Visualisasi Real-time: Aplikasi membaca data langsung dari database Supabase dan menampilkannya dalam bentuk dasbor, diagram, dan laporan yang mudah dipahami secara real-time.

   3. ### Prosedur

Prosedur dan aturan bisnis baru yang ditawarkan adalah:

1. Pengguna wajib memiliki akun Google untuk menggunakan sistem.  
2. Pengguna wajib memberikan otorisasi kepada aplikasi melalui Google OAuth untuk autentikasi.  
3. Data transaksi keuangan pengguna disimpan dengan aman di database cloud Supabase dengan enkripsi.  
4. Data sepenuhnya dimiliki pengguna dan hanya dapat diakses oleh pemilik akun melalui autentikasi yang aman.

   4. ### Target *Service Time* dari Sistem yang dikembangkan

   ### Target efisiensi yang ingin dicapai dengan sistem baru ini adalah:

1. ### **Durasi Entri Data (OCR):** Mengurangi waktu pencatatan per struk dari beberapa menit (manual) menjadi beberapa detik (verifikasi). Skenario 1 (Budi) menargetkan pencatatan 3-4 struk dalam waktu kurang dari 3 menit.

2. ### **Waktu ke Wawasan (Time-to-Insight):** Waktu dari transaksi dicatat hingga muncul di dasbor adalah instan (real-time).

3. ### **Tingkat Kegagalan (Failure Rate):** Mengurangi tingkat kelupaan mencatat secara drastis karena prosesnya sangat cepat dan mudah dilakukan kapan saja via ponsel.

3. # **Gambaran Umum Sistem yang Dikembangkan** {#gambaran-umum-sistem-yang-dikembangkan}

   1. ## **Fungsi utama pada produk** {#fungsi-utama-pada-produk}

   Produk aplikasi "Dompet Teratai" memiliki beberapa fungsi utama yang dirancang untuk mengatasi masalah inti pengguna:

1. **Manajemen Autentikasi Pengguna:**  
   * Menyediakan proses registrasi dan login yang aman dan mudah menggunakan **Google Authentication (OAuth 2.0)**. Ini menghilangkan kebutuhan pengguna untuk mengingat password baru dan memanfaatkan ekosistem yang sudah mereka percayai.  
2. **Pencatatan Transaksi Manual:**  
   * Menyediakan form input yang sederhana dan intuitif bagi pengguna untuk mencatat pengeluaran yang tidak memiliki struk (misal: ongkos transportasi, jajan di warung) secara cepat.  
3. **Otomatisasi Struk (OCR):**  
   * Fungsi inti yang memungkinkan pengguna memfoto atau mengunggah gambar struk belanja.  
   * Sistem secara otomatis memproses gambar menggunakan OCR untuk mengekstrak data kunci (Total belanja, nama merchant, tanggal).  
   * Menyediakan antarmuka verifikasi bagi pengguna untuk mengonfirmasi data hasil OCR dan memilih kategori sebelum disimpan.  
4. **Manajemen Kategori:**  
   * Memungkinkan pengguna untuk mengelola kategori pengeluaran mereka.  
   * Menyediakan kategori default yang relevan dengan konteks lokal Indonesia.  
   * Memungkinkan pengguna membuat, mengedit, dan menghapus kategori kustom (sesuai skenario Citra/Freelancer dan Doni/UMKM).  
5. **Dasbor Visualisasi Data:**  
   * Menyajikan data keuangan pengguna dalam bentuk dasbor yang bersih dan interaktif.  
   * Menampilkan visualisasi (misal: diagram lingkaran, diagram batang) untuk menunjukkan alokasi pengeluaran berdasarkan kategori, tren pengeluaran dari waktu ke waktu, dll.  
6. **Keamanan Data via Supabase:**  
   * Fungsi fundamental di mana semua data transaksi yang dicatat (baik manual maupun OCR) akan secara otomatis **disimpan dengan aman** di database cloud Supabase dengan enkripsi. Pengguna memiliki akses eksklusif ke data mereka melalui autentikasi Google OAuth.

   

   2. ## **Karakteristik pengguna** {#karakteristik-pengguna}

### Tabel Pengguna, Pekerjaan, dan Hak Akses

| No | Pengguna | Pekerjaan / Persona (Contoh) | Hak Akses |
| ----- | ----- | ----- | ----- |
| 1 | Mitra | Karyawan Swasta (Persona: Arya), Ibu Rumah Tangga (Persona: Mama Arya ), Pemilik UMKM (Persona : Bapak Arya) | Mitra memiliki hak akses penuh dan eksklusif ke data miliknya sendiri. Hak akses ini mencakup: \- Melakukan login/autentikasi ke aplikasi. \- Memberikan izin aplikasi untuk mengelola file Google Sheet-nya. \- Mencatat transaksi baru (manual dan OCR). \- Mengelola kategori pengeluaran. \- Melihat dasbor visualisasi datanya. \- Mengakses data mentah (raw data) langsung dari Google Sheet pribadinya. |

### Kelompok Pengguna yang Direncanakan

#### **1\. Mitra**

* *Description of User**:*** Mahasiswa yang berinteraksi dengan aplikasi untuk memilih mata kuliah, mengakses materi pembelajaran AR, dan mengikuti bimbingan akademik secara virtual.  
* *Role*: Mahasiswa  
* *Prerequisite*: Mahasiswa harus login terlebih dahulu untuk dapat mengakses fitur-fitur pembelajaran dan memilih mata kuliah. Setelah login, mahasiswa akan mengisi form untuk memilih mata kuliah yang ingin diambil dan melanjutkan interaksi dengan materi AR.  
* *Task Description*: Mengirimkan permintaan pengambilan mata kuliah dan berinteraksi dengan konten AR yang tersedia, seperti visualisasi 3D dan audio terkait materi pembelajaran.

### Contoh Pengguna dan Hak Akses dalam Aplikasi AR

Pengguna: Mitra

* Pekerjaan: Melakukan login/autentikasi ke aplikasi, Memberikan izin aplikasi untuk mengelola file Google Sheet-nya, Mencatat transaksi baru (manual dan OCR), Mengelola kategori pengeluaran,Melihat dasbor visualisasi datanya, dan Mengakses data mentah (raw data) langsung dari Google Sheet pribadinya.  
* Hak Akses: Mitra memiliki hak akses penuh dan eksklusif ke data miliknya sendiri maupun data yang sudah diberi ijin kepada user lain untuk di akses.

Dengan struktur ini, aplikasi AR dapat memberikan pengalaman yang lebih interaktif dan personal kepada mahasiswa, serta memungkinkan dosen untuk mengelola pembelajaran dengan lebih efisien menggunakan teknologi augmented reality.

3. ## **Batasan**    	Batasan (constraints) dan asumsi berikut berlaku untuk pengembangan sistem ini: {#akurasi-ocr:-teknologi-ocr-yang-digunakan-mungkin-tidak-100%-akurat-untuk-semua-format-struk.-sistem-akan-mengandalkan-verifikasi-pengguna-untuk-mengonfirmasi-data-(terutama-total-dan-kategori)-sebelum-disimpan.}

1. ## Dependensi Akun Google: Sistem ini *wajib* digunakan dengan akun Google. Pengguna tanpa akun Google tidak dapat menggunakan aplikasi ini. {#akurasi-ocr:-teknologi-ocr-yang-digunakan-mungkin-tidak-100%-akurat-untuk-semua-format-struk.-sistem-akan-mengandalkan-verifikasi-pengguna-untuk-mengonfirmasi-data-(terutama-total-dan-kategori)-sebelum-disimpan.}

2. ## Konektivitas Internet: Koneksi internet aktif diperlukan untuk: {#akurasi-ocr:-teknologi-ocr-yang-digunakan-mungkin-tidak-100%-akurat-untuk-semua-format-struk.-sistem-akan-mengandalkan-verifikasi-pengguna-untuk-mengonfirmasi-data-(terutama-total-dan-kategori)-sebelum-disimpan.}

   * ## Proses autentikasi (login). {#akurasi-ocr:-teknologi-ocr-yang-digunakan-mungkin-tidak-100%-akurat-untuk-semua-format-struk.-sistem-akan-mengandalkan-verifikasi-pengguna-untuk-mengonfirmasi-data-(terutama-total-dan-kategori)-sebelum-disimpan.}

   * ## Sinkronisasi data (membaca dan menulis) dengan Google Sheets API. {#akurasi-ocr:-teknologi-ocr-yang-digunakan-mungkin-tidak-100%-akurat-untuk-semua-format-struk.-sistem-akan-mengandalkan-verifikasi-pengguna-untuk-mengonfirmasi-data-(terutama-total-dan-kategori)-sebelum-disimpan.}

   * ## Pemrosesan OCR (jika alur kerja OCR diproses di sisi server/n8n). {#akurasi-ocr:-teknologi-ocr-yang-digunakan-mungkin-tidak-100%-akurat-untuk-semua-format-struk.-sistem-akan-mengandalkan-verifikasi-pengguna-untuk-mengonfirmasi-data-(terutama-total-dan-kategori)-sebelum-disimpan.}

3. ## Akurasi OCR: Teknologi OCR yang digunakan mungkin tidak 100% akurat untuk semua format struk. Sistem akan mengandalkan verifikasi pengguna untuk mengonfirmasi data (terutama total dan kategori) sebelum disimpan. {#akurasi-ocr:-teknologi-ocr-yang-digunakan-mungkin-tidak-100%-akurat-untuk-semua-format-struk.-sistem-akan-mengandalkan-verifikasi-pengguna-untuk-mengonfirmasi-data-(terutama-total-dan-kategori)-sebelum-disimpan.}

4. ## Fokus Aplikasi: Aplikasi ini adalah alat bantu pelacakan pengeluaran dan visualisasi (dasbor). Ini bukan *software* akuntansi lengkap dan tidak menangani fitur akuntansi kompleks (misal: *double-entry bookkeeping*, manajemen aset, hutang-piutang).

   4. ## Lingkungan Pengembangan Sistem

      1. ### Lingkungan pengembangan {#lingkungan-pengembangan}

* **Perangkat Keras (Hardware):**  
  * Komputer/Laptop (CPU multi-core, min. RAM 8GB) untuk pengembangan.  
  * Perangkat Mobile (Android dan iOS) untuk pengujian fungsionalitas responsif dan fitur berbasis kamera (OCR).  
* **Perangkat Lunak (Software / Tools):**  
  * **Visual Studio Code / WebStorm:** Editor kode utama.  
  * **Browser Modern:** (Chrome, Firefox, Safari) untuk pengujian front-end.  
  * **Node.js 18+ dan Express.js:** Backend framework untuk REST API.  
  * **Supabase:** Database cloud dan authentication platform.  
  * **Postman / Insomnia:** API testing tools.  
  * **GitHub:** Sistem kontrol versi (VCS) untuk kolaborasi kode.

    2. ### Lingkungan operasional

* **Perangkat Keras (Sisi Klien/Pengguna):**  
  * Perangkat apa saja yang memiliki browser web modern (PC, Laptop, Smartphone, Tablet).  
  * Kamera pada perangkat (smartphone/tablet) diperlukan untuk memanfaatkan fitur foto struk OCR.  
* **Perangkat Lunak (Sisi Klien/Pengguna):**  
  * Browser web modern yang mendukung JavaScript (ES6+).  
  * Akun Google yang aktif dan terautentikasi di browser.  
* **Infrastruktur (Sisi Server/Backend):**  
  * Platform hosting untuk aplikasi web (Front-end) seperti Vercel atau Netlify.  
  * Layanan Google Cloud Platform (untuk Google OAuth Authentication).  
  * Supabase cloud infrastructure untuk database PostgreSQL dan authentication.  
  * Server atau platform cloud untuk menjalankan backend API (Node.js/Express).

4. # ***Requirements***

   1. ## **External interface** {#external-interface}

Bagian ini merinci antarmuka sistem dengan komponen eksternal, baik itu perangkat keras, perangkat lunak (API), maupun protokol komunikasi.

1. ### Hardware & Software Interface {#hardware-&-software-interface}

Antarmuka perangkat keras utama adalah perangkat yang digunakan oleh pengguna akhir (client-side) untuk berinteraksi dengan aplikasi web.

| No | Antarmuka Pengguna | Fungsi |
| ----- | ----- | ----- |
| 1 | **Layar Sentuh (Touchscreen)** | Antarmuka utama untuk interaksi pada perangkat mobile (smartphone/tablet), digunakan untuk navigasi, menekan tombol, dan input data. |
| 2 | **Kamera (Perangkat Mobile)** | Digunakan untuk mengakses fungsi "Foto Struk" agar pengguna dapat mengambil gambar struk secara langsung untuk diproses oleh OCR. |
| 3 | **Keyboard (Fisik/Virtual)** | Digunakan untuk input data manual (nama item, jumlah pengeluaran, kategori baru) pada perangkat desktop maupun mobile. |
| 4 | **Mouse / Trackpad** | Digunakan untuk navigasi dan interaksi aplikasi pada perangkat desktop (PC/Laptop). |

### Software Interface

### Antarmuka perangkat lunak adalah koneksi ke layanan eksternal (API) yang menjadi fondasi sistem ini.

| No | Antarmuka Perangkat Lunak | Fungsi |
| ----- | ----- | ----- |
| 1 | **Google Authentication API (OAuth 2.0)** | Digunakan untuk mengelola seluruh proses autentikasi dan otorisasi pengguna. Sistem mendapatkan token akses untuk memverifikasi identitas pengguna. |
| 2 | **Supabase Database API** | Antarmuka kritis yang digunakan untuk: \- Membaca data transaksi yang ada dari database Supabase. \- Menulis (menambah/memperbarui) data transaksi baru ke database Supabase. \- Mengelola user authentication dan authorization. |
| 3 | **OCR Service Endpoint** (via backend API) | Antarmuka backend yang akan dipanggil oleh front-end. Front-end mengirimkan data gambar (struk), dan endpoint ini akan mengembalikan data JSON hasil ekstraksi OCR. |

2. ### Communication Interface

Antarmuka komunikasi mendefinisikan protokol yang digunakan untuk transfer data.

1. **HTTPS (Hypertext Transfer Protocol Secure):**  
   * Seluruh komunikasi antara aplikasi (client-side) dengan server backend, Google Authentication API, dan Supabase API **wajib** menggunakan HTTPS.  
   * Ini memastikan bahwa semua data yang ditransmisikan, termasuk token otorisasi dan data keuangan, terenkripsi dan aman dari penyadapan.  
2. **Internet (TCP/IP):**  
   * Aplikasi ini memerlukan koneksi internet standar (via WiFi, 4G, 5G, atau LAN) untuk dapat berfungsi, karena semua fungsi inti bergantung pada layanan cloud (Google OAuth, Supabase, dan backend API).

 


   2. ## **Functional Description**

Bagian ini mendeskripsikan fungsionalitas sistem dari perspektif pengguna menggunakan Use Case Diagram dan Use Case Scenario.

1. ### Use case diagram

Diagram berikut mengilustrasikan interaksi utama antara Aktor ("Pengguna") dengan fungsi-fungsi inti ("Use Case") dari sistem "Dompet Teratai".

![][image2]

### 

2. ### Use case scenario

Berikut adalah skenario detail untuk setiap Use Case yang diidentifikasi di atas.

**Skenario 1: Autentikasi Pengguna**

| Use Case ID Number | UC-01 |
| ----- | ----- |
| **Use Case Name** | Melakukan Autentikasi Pengguna |
| **Use Case Description** | Use case ini menggambarkan proses pengguna melakukan login ke dalam aplikasi menggunakan layanan eksternal (Google) untuk mendapatkan akses ke dasbor mereka. |
| **Primary Actor** | Pengguna |
| **Secondary Actor** | Sistem, Google Authentication API |
| **Pre-Condition** | 1\. Pengguna telah membuka halaman aplikasi. 2\. Pengguna memiliki akun Google yang aktif. 3\. Perangkat terhubung ke internet. |

**Primary Flow of Events**

| User Action | System Response |
| ----- | ----- |
| 1\. Pengguna menekan tombol "Login dengan Google". | 2\. Sistem mengarahkan (redirect) pengguna ke halaman login Google Authentication. |
| 3\. Pengguna memasukkan kredensial (email/password) di halaman Google dan menyetujui izin (permission) yang diminta aplikasi. | 4\. Google Authentication API memverifikasi kredensial dan mengirimkan token otorisasi kembali ke Sistem. |
|  | 5\. Sistem menerima dan memvalidasi token. 6\. Sistem membuat sesi login untuk pengguna. 7\. Sistem menampilkan halaman Dasbor utama aplikasi. |

**Error Flow of Events**

| User Action | System Response |
| ----- | ----- |
| 3a. Pengguna membatalkan proses login atau menolak memberikan izin. | 4a. Sistem menampilkan pesan error "Proses login dibatalkan atau izin ditolak. Silakan coba lagi." |
|  | 5a. Sistem gagal memvalidasi token dari Google. 5b. Sistem menampilkan pesan "Terjadi kesalahan saat login. Coba beberapa saat lagi." |

**Skenario 2: Input Transaksi Manual**

| Use Case ID Number | UC-02 |
| ----- | ----- |
| **Use Case Name** | Menginput Transaksi Manual |
| **Use Case Description** | Pengguna mencatat transaksi pengeluaran baru secara manual (misal: untuk transaksi non-struk) melalui form input. |
| **Primary Actor** | Pengguna |
| **Secondary Actor** | Sistem, Google Sheets API |
| **Pre-Condition** | 1\. Pengguna telah berhasil login ke aplikasi (UC-01). |

**Primary Flow of Events**

| User Action | System Response |
| ----- | ----- |
| 1\. Pengguna menekan tombol "Tambah Transaksi Manual". | 2\. Sistem menampilkan form input (misal: Jumlah, Kategori, Tanggal, Catatan). |
| 3\. Pengguna mengisi data pada form, lalu menekan tombol "Simpan". | 4\. Sistem memvalidasi data input (misal: Jumlah harus angka). |
|  | 5\. Sistem memformat data dan mengirimkannya ke Supabase API untuk disimpan di database pengguna. |
|  | 6\. Supabase API mengonfirmasi data berhasil disimpan. |
|  | 7\. Sistem menampilkan pesan "Transaksi berhasil disimpan" dan otomatis memperbarui data di dasbor. |

**Error Flow of Events**

| User Action | System Response |
| ----- | ----- |
| 4a. Pengguna memasukkan data yang tidak valid (misal: "Jumlah" bukan angka). | 4b. Sistem menampilkan pesan error di samping field yang salah (misal: "Jumlah harus berupa angka"). Proses simpan dibatalkan. |
|  | 6a. Supabase API gagal menyimpan data (misal: tidak ada koneksi internet atau masalah autentikasi). |
|  | 6b. Sistem menampilkan pesan error "Gagal menyimpan. Periksa koneksi internet Anda." |

**Skenario 3: Input Transaksi via OCR**

| Use Case ID Number | UC-03 |
| ----- | ----- |
| **Use Case Name** | Menginput Transaksi via OCR |
| **Use Case Description** | Pengguna menggunakan kamera atau mengunggah gambar struk untuk dicatat secara otomatis menggunakan OCR. |
| **Primary Actor** | Pengguna |
| **Secondary Actor** | Sistem, OCR Service (backend API), Supabase API |
| **Pre-Condition** | 1\. Pengguna telah berhasil login (UC-01). 2\. Perangkat pengguna (jika mobile) memiliki kamera. |

**Primary Flow of Events**

| User Action | System Response |
| ----- | ----- |
| 1\. Pengguna menekan tombol "Scan Struk". | 2\. Sistem meminta izin akses kamera atau galeri. |
| 3\. Pengguna mengambil foto struk atau memilih gambar dari galeri. | 4\. Sistem mengunggah gambar ke OCR Service (n8n). |
|  | 5\. OCR Service memproses gambar dan mengembalikan hasil ekstraksi data (misal: Total, Merchant, Tanggal) dalam format JSON. |
|  | 6\. Sistem menampilkan "Form Verifikasi" yang sudah terisi otomatis (pre-filled) dengan data hasil OCR. |
| 7\. Pengguna memeriksa data, mengoreksi jika ada yang salah, memilih "Kategori", lalu menekan "Simpan". | 8\. Sistem memvalidasi data yang telah diverifikasi. |
|  | 9\. Sistem mengirimkan data final ke Supabase API untuk disimpan. |
|  | 10\. Sistem menampilkan pesan "Transaksi berhasil disimpan" dan memperbarui dasbor. |

**Error Flow of Events**

| User Action | System Response |
| ----- | ----- |
| 2a. Pengguna menolak izin akses kamera/galeri. | 2b. Sistem menampilkan pesan "Izin kamera/galeri diperlukan untuk fitur ini." |
|  | 5a. OCR Service gagal memproses gambar (gambar terlalu buram). |
|  | 5b. Sistem menampilkan pesan "Gagal membaca struk. Pastikan gambar jelas atau coba input manual." |
|  | 9a. Gagal menyimpan ke Supabase (koneksi terputus). |
|  | 9b. Sistem menampilkan pesan error "Gagal menyimpan. Periksa koneksi internet Anda." |

**Skenario 4: Melihat Dasbor**

| Use Case ID Number | UC-04 |
| ----- | ----- |
| **Use Case Name** | Melihat Dasbor |
| **Use Case Description** | Pengguna melihat visualisasi dan ringkasan data pengeluaran mereka yang tersimpan di Google Sheets. |
| **Primary Actor** | Pengguna |
| **Secondary Actor** | Sistem, Google Sheets API |
| **Pre-Condition** | 1\. Pengguna telah berhasil login (UC-01). |

**Primary Flow of Events**

| User Action | System Response |
| ----- | ----- |
| 1\. Pengguna membuka halaman Dasbor (biasanya halaman utama setelah login). | 2\. Sistem (Front-end) menampilkan *loading indicator*. 3\. Sistem mengirim permintaan "Baca Data" ke Supabase API untuk mengambil semua data transaksi dari database pengguna. |
|  | 4\. Supabase API mengembalikan data transaksi. |
|  | 5\. Sistem memproses (agregasi, kalkulasi) data tersebut di sisi klien. |
|  | 6\. Sistem merender data dalam bentuk visual (diagram lingkaran, diagram batang, daftar transaksi) yang mudah dipahami pengguna. |

**Error Flow of Events**

| User Action | System Response |
| ----- | ----- |
|  | 4a. Supabase API gagal mengambil data (misal: koneksi terputus, autentikasi gagal). |
|  | 4b. Sistem menampilkan pesan "Gagal memuat data dari database. Periksa koneksi atau autentikasi aplikasi." |
|  | 6a. Tidak ada data transaksi yang ditemukan (pengguna baru). |
|  | 6b. Sistem menampilkan pesan "Anda belum memiliki transaksi. Mulai catat pengeluaran Anda\!" |

**Skenario 5: Mengelola Kategori**

| Use Case ID Number | UC-05 |
| ----- | ----- |
| **Use Case Name** | Mengelola Kategori |
| **Use Case Description** | Pengguna dapat menambah, mengedit, atau menghapus kategori pengeluaran kustom sesuai kebutuhan (misal: Skenario Citra/Doni). |
| **Primary Actor** | Pengguna |
| **Secondary Actor** | Sistem, Google Sheets API |
| **Pre-Condition** | 1\. Pengguna telah berhasil login (UC-01). 2\. (Asumsi) Daftar kategori disimpan di tabel terpisah di database Supabase. |

**Primary Flow of Events (Tambah Kategori)**

| User Action | System Response |
| ----- | ----- |
| 1\. Pengguna masuk ke menu "Pengaturan" \> "Kategori". | 2\. Sistem mengambil dan menampilkan daftar kategori yang ada saat ini dari Supabase. |
| 3\. Pengguna menekan tombol "Tambah Kategori Baru". | 4\. Sistem menampilkan form untuk nama kategori baru. |
| 5\. Pengguna mengetik nama kategori baru (misal: "Bahan Baku Kopi") dan menekan "Simpan". | 6\. Sistem mengirim permintaan "Tambah Kategori" ke Supabase API. |
|  | 7\. Sistem menampilkan pesan "Kategori baru berhasil disimpan" dan memperbarui daftar di UI. |

**Error Flow of Events**

| User Action | System Response |
| ----- | ----- |
| 5a. Pengguna memasukkan nama kategori yang sudah ada. | 5b. Sistem menampilkan pesan error "Nama kategori sudah ada." |
|  | 6a. Supabase API gagal menyimpan (koneksi terputus). |
|  | 6b. Sistem menampilkan pesan "Gagal menyimpan kategori. Silakan coba lagi." |

3.  **Data Requirement**

Sistem \"Dompet Teratai\" menggunakan database cloud Supabase (PostgreSQL) untuk menyimpan semua data pengguna. Struktur data didefinisikan dalam beberapa tabel yang saling berelasi.

**Tabel 1: users**

Tabel ini menyimpan informasi pengguna yang telah melakukan autentikasi.

| Kolom | Nama Kolom | Tipe Data | Deskripsi | Contoh |
| ----- | ----- | ----- | ----- | ----- |
| A | `id` | UUID | ID unik pengguna (primary key). | `550e8400-e29b-41d4-a716-446655440000` |
| B | `email` | String | Email pengguna dari Google OAuth. | `user@example.com` |
| C | `name` | String | Nama lengkap pengguna. | `John Doe` |
| D | `created_at` | Timestamp | Waktu pembuatan akun. | `2025-01-20T10:00:00Z` |
| E | `updated_at` | Timestamp | Waktu update terakhir. | `2025-01-20T10:00:00Z` |

**Tabel 2: transactions**

Tabel ini berfungsi sebagai tabel utama untuk mencatat setiap entri pengeluaran atau pemasukan.

| Kolom | Nama Kolom | Tipe Data | Deskripsi | Contoh |
| ----- | ----- | ----- | ----- | ----- |
| A | `id` | UUID | ID unik untuk setiap transaksi (primary key). | `660e8400-e29b-41d4-a716-446655440001` |
| B | `user_id` | UUID | Foreign key ke tabel users. | `550e8400-e29b-41d4-a716-446655440000` |
| C | `date` | Timestamp | Tanggal dan waktu transaksi. | `2025-10-30T10:00:00Z` |
| D | `description` | String | Deskripsi atau nama merchant/toko. | `Makan Siang Nasi Padang` |
| E | `category_id` | UUID | Foreign key ke tabel categories. | `770e8400-e29b-41d4-a716-446655440002` |
| F | `amount` | Decimal | Jumlah nominal transaksi. | `25000.00` |
| G | `type` | Enum | Jenis transaksi (income/expense). | `expense` |
| H | `input_method` | Enum | Metode input (manual/ocr). | `ocr` |
| I | `verification_status` | Enum | Status verifikasi untuk OCR. | `verified` |
| J | `created_at` | Timestamp | Waktu pembuatan record. | `2025-10-30T10:05:00Z` |

### **Tabel 3: `categories`**

Tabel ini berfungsi sebagai *master data* untuk kategori transaksi. Pengguna dapat mengelola kategorinya sendiri (Use Case UC-05).

| Kolom | Nama Kolom | Tipe Data | Deskripsi | Contoh |
| :---- | :---- | :---- | :---- | :---- |
| A | `id` | UUID | ID unik kategori (primary key). | `770e8400-e29b-41d4-a716-446655440002` |
| B | `user_id` | UUID | Foreign key ke tabel users. | `550e8400-e29b-41d4-a716-446655440000` |
| C | `name` | String | Nama kategori. | `Makanan` |
| D | `type` | Enum | Tipe kategori (income/expense). | `expense` |
| E | `created_at` | Timestamp | Waktu pembuatan kategori. | `2025-01-20T10:00:00Z` |

**Kategori Default (Data Awal):**

Saat pengguna pertama kali mendaftar, sistem akan membuat kategori default:

1. (Makanan, expense)  
2. (Transportasi, expense)  
3. (Tagihan, expense)  
4. (Belanja Bulanan, expense)  
5. (Kesehatan, expense)  
6. (Pendidikan, expense)  
7. (Hiburan, expense)  
8. (Gaji, income)  
9. (Freelance, income)

   4. ## **Functional Requirements**

Bagian ini merinci persyaratan fungsional yang harus dipenuhi oleh sistem, didasarkan pada Use Case dan Data Requirements.

| ID | Grup (Use Case) | Persyaratan Fungsional (Requirement) |
| ----- | ----- | ----- |
| **FR-UC01** | **Autentikasi** |  |
| FR-UC01-01 |  | Sistem **harus** menyediakan opsi login/registrasi hanya menggunakan Google Authentication (OAuth 2.0). |
| FR-UC01-02 |  | Sistem **harus** memvalidasi token otorisasi yang diterima dari Google API. |
| FR-UC01-03 |  | Sistem **harus** mengarahkan pengguna ke halaman Dasbor setelah login berhasil. |
| FR-UC01-04 |  | Sistem **harus** menangani kasus error jika pengguna menolak otorisasi Google. |
| FR-UC01-05 |  | Sistem **harus** memiliki fungsi "Logout" yang menghapus sesi otentikasi pengguna. |
|  |  |  |
| **FR-UC02** | **Input Manual** |  |
| FR-UC02-01 |  | Sistem **harus** menyediakan form untuk input manual yang berisi field: Jumlah, Kategori, Tanggal, dan Catatan (Deskripsi). |
| FR-UC02-02 |  | Sistem **harus** melakukan validasi *client-side* untuk memastikan field "Jumlah" adalah angka valid. |
| FR-UC02-03 |  | Sistem **harus** menyimpan data transaksi manual ke tabel `transactions` di database Supabase sesuai struktur pada 4.3. |
| FR-UC02-04 |  | Kolom `Metode_Input` pada Sheet `Transaksi` **harus** diisi "Manual". |
|  |  |  |
| **FR-UC03** | **Input OCR** |  |
| FR-UC03-01 |  | Sistem **harus** dapat meminta akses ke kamera perangkat atau galeri foto pengguna. |
| FR-UC03-02 |  | Sistem **harus** dapat mengirim data gambar (foto struk) ke endpoint layanan OCR (n8n). |
| FR-UC03-03 |  | Sistem **harus** dapat menerima data JSON (Total, Merchant, Tanggal) dari layanan OCR. |
| FR-UC03-04 |  | Sistem **harus** menampilkan form verifikasi yang sudah terisi otomatis (pre-filled) dengan data hasil OCR. |
| FR-UC03-05 |  | Pengguna **harus** dapat mengoreksi data hasil OCR sebelum menyimpan. |
| FR-UC03-06 |  | Sistem **harus** menyimpan data transaksi terverifikasi ke tabel `transactions` di database Supabase. |
| FR-UC03-07 |  | Kolom `Metode_Input` **harus** diisi "OCR" dan `Status_Verifikasi` diisi "Terverifikasi". |
| FR-UC03-08 |  | Sistem **harus** menangani error jika OCR gagal memproses gambar (misal: gambar buram). |
|  |  |  |
| **FR-UC04** | **Dasbor** |  |
| FR-UC04-01 |  | Sistem **harus** membaca semua data dari tabel `transactions` di database Supabase milik pengguna. |
| FR-UC04-02 |  | Sistem **harus** membaca semua data kategori dari tabel `categories` di database Supabase. |
| FR-UC04-03 |  | Sistem **harus** menampilkan ringkasan total pengeluaran dan pemasukan. |
| FR-UC04-04 |  | Sistem **harus** menampilkan visualisasi data (misal: diagram lingkaran) alokasi pengeluaran berdasarkan kategori. |
| FR-UC04-05 |  | Sistem **harus** menampilkan daftar transaksi terbaru. |
| FR-UC04-06 |  | Dasbor **harus** otomatis diperbarui (refresh) setelah transaksi baru ditambahkan (via UC-02 atau UC-03). |
| FR-UC04-07 |  | Sistem **harus** menampilkan kondisi "empty state" (pesan data kosong) jika tabel `transactions` belum berisi data. |
|  |  |  |
| **FR-UC05** | **Kategori** |  |
| FR-UC05-01 |  | Sistem **harus** menyediakan antarmuka (UI) untuk "Tambah Kategori Baru". |
| FR-UC05-02 |  | Sistem **harus** menyimpan kategori baru ke tabel `categories` di database Supabase. |
| FR-UC05-03 |  | Sistem **harus** menyediakan fungsi untuk mengedit dan menghapus kategori yang sudah ada di tabel `categories`. |
| FR-UC05-04 |  | Sistem **harus** mencegah pengguna menambah kategori dengan nama yang duplikat. |
| FR-UC05-05 |  | Daftar kategori di form input (UC-02) dan form verifikasi (UC-03) **harus** diambil secara dinamis dari tabel `categories` di database Supabase. |

5. **Non-functional Requirements**

   Bagian ini merinci persyaratan non-fungsional (kualitas) yang menentukan standar operasional dan pengalaman pengguna dari sistem. ID "KPP" adalah singkatan dari "Dompet Teratai".

   

| SRS-Id | Parameter | Requirement |
| ----- | ----- | ----- |
| KPP-NF-01 | **Usability** (Kemudahan Penggunaan) | Antarmuka aplikasi **harus** dirancang secara intuitif sehingga pengguna baru dapat menyelesaikan alur kerja inti (login dan input 1 transaksi) dalam waktu kurang dari 1 menit tanpa panduan. |
| KPP-NF-02 |  | Desain aplikasi **harus** responsif (mobile-first) dan dapat beroperasi dengan baik di browser desktop (Chrome, Firefox, Safari) dan mobile (Chrome Android, Safari iOS). |
| KPP-NF-03 |  | Seluruh antarmuka **harus** menggunakan Bahasa Indonesia yang natural dan mudah dipahami (sesuai C100). |
|  |  |  |
| KPP-NF-04 | **Performance** (Kinerja) | Waktu muat (load time) awal aplikasi **harus** di bawah 5 detik. |
| KPP-NF-05 |  | Waktu muat Dasbor (dari API call ke Google Sheets hingga render) **harus** di bawah 3 detik untuk 1000 baris data transaksi. |
| KPP-NF-06 |  | Waktu pemrosesan OCR (dari unggah foto hingga form verifikasi tampil) **harus** di bawah 10 detik untuk koneksi internet stabil. |
|  |  |  |
| KPP-NF-07 | **Security** (Keamanan) | Semua komunikasi antara klien (browser) dan server (termasuk Google API dan n8n) **harus** menggunakan enkripsi HTTPS (SSL/TLS). |
| KPP-NF-08 |  | Aplikasi **harus** menyimpan data transaksi dengan aman di database cloud Supabase dengan enkripsi. Data hanya dapat diakses oleh pemilik akun melalui autentikasi Google OAuth. |
| KPP-NF-09 |  | Aplikasi **hanya boleh** meminta izin Google OAuth yang benar-benar dibutuhkan untuk autentikasi pengguna. |
|  |  |  |
| KPP-NF-10 | **Reliability** (Keandalan) | Akurasi ekstraksi OCR untuk *Total Belanja* pada struk standar (supermarket, restoran) **harus** di atas 90%. |
| KPP-NF-11 |  | Sistem **harus** menangani kondisi *offline* (tidak ada koneksi internet) dengan menampilkan pesan yang jelas kepada pengguna (tidak crash). |
|  |  |  |
| KPP-NF-12 | **Availability** (Ketersediaan) | Ketersediaan sistem aplikasi **bergantung** pada ketersediaan layanan Google (Google Cloud Identity, Google Sheets API) dan layanan OCR (n8n). |
|  |  |  |
| KPP-NF-13 | **Maintainability** (Pemeliharaan) | Penambahan atau perubahan kategori oleh pengguna (di Sheet `Kategori`) **tidak boleh** merusak data transaksi yang sudah ada di Sheet `Transaksi`. |

[image1]: <data:image/png;base64,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>

[image2]: <data:image/png;base64,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>