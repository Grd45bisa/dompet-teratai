# PROPOSAL PENELITIAN

---

## RANCANG BANGUN APLIKASI *EXPENSE TRACKER* BERBASIS WEB UNTUK UMKM MENGGUNAKAN TEKNOLOGI *OPTICAL CHARACTER RECOGNITION* (OCR) DAN *VISION LANGUAGE MODEL* (VLM)

---

|                    |                                      |
|--------------------|--------------------------------------|
| **Nama**           | [ISI NAMA]                           |
| **NIM**            | [ISI NIM]                            |
| **Program Studi**  | Teknik Informatika                   |
| **Institusi**      | [ISI NAMA UNIVERSITAS]               |
| **Tahun**          | 2025                                 |

---

## BAB I PENDAHULUAN

### 1.1 Latar Belakang

Usaha Mikro, Kecil, dan Menengah (UMKM) merupakan tulang punggung perekonomian Indonesia. Berdasarkan data Kementerian Koperasi dan UKM Republik Indonesia, jumlah UMKM di Indonesia mencapai lebih dari 64 juta unit usaha, menyumbang lebih dari 60% terhadap Produk Domestik Bruto (PDB) nasional, serta menyerap lebih dari 97% tenaga kerja di seluruh sektor ekonomi. Namun di balik besarnya kontribusi tersebut, mayoritas pelaku UMKM masih menghadapi permasalahan mendasar dalam pengelolaan keuangan, yaitu pencatatan pengeluaran yang tidak tertib, tidak akurat, dan tidak konsisten.

Praktik yang paling umum dijumpai di lapangan adalah penyimpanan struk atau *invoice* pembelian secara fisik sebagai satu-satunya bukti transaksi. Metode ini sangat rentan terhadap berbagai risiko: struk dapat hilang, rusak terkena air, atau tulisannya memudar karena kertas termal. Ketika struk hilang, pelaku UMKM kehilangan jejak pengeluaran dan tidak dapat lagi memverifikasi total biaya yang telah dikeluarkan. Kondisi ini berdampak langsung pada sulitnya memantau arus kas, merencanakan anggaran, dan mengajukan kredit ke lembaga keuangan formal yang mensyaratkan adanya laporan keuangan.

Perkembangan teknologi *Artificial Intelligence* (AI), khususnya *Optical Character Recognition* (OCR) dan *Vision Language Model* (VLM), membuka peluang untuk mengatasi permasalahan tersebut secara otomatis. OCR memungkinkan sistem membaca dan mengekstraksi teks dari foto struk, sementara VLM membawa kemampuan lebih jauh dengan memahami konten gambar secara kontekstual — tidak sekadar membaca teks, tetapi juga menginterpretasikan makna setiap elemen pada struk, seperti membedakan nama toko, total harga, dan kategori barang, tanpa bergantung pada *template* format yang kaku.

Sejumlah penelitian terdahulu telah mengeksplorasi integrasi OCR dan AI dalam manajemen keuangan. Daniyal dkk. (2025) membuktikan bahwa sistem pencatatan pengeluaran berbasis OCR dan AI meningkatkan akurasi dan efisiensi secara signifikan dibandingkan metode manual. Ivanenko dkk. (2025) menunjukkan bahwa kombinasi LLM dengan OCR menghasilkan akurasi ekstraksi data *invoice* yang lebih tinggi berkat kemampuan pemahaman kontekstual yang lebih baik. Namun penelitian-penelitian tersebut belum mengintegrasikan solusi lengkap yang mencakup antarmuka yang ramah pengguna, *real-time synchronization*, ekspor laporan, dan aksesibilitas *Progressive Web Application* — khususnya dalam konteks UMKM Indonesia.

Berdasarkan permasalahan dan peluang tersebut, penelitian ini mengusulkan rancang bangun aplikasi *expense tracker* berbasis web untuk UMKM yang mengintegrasikan teknologi OCR dan *Vision Language Model* (VLM) melalui platform otomasi *workflow* n8n. Dengan aplikasi ini, pelaku UMKM cukup mengunggah foto struk, dan sistem akan secara otomatis mengekstraksi, mengkategorikan, serta menyimpan data pengeluaran ke dalam basis data digital yang aman dan dapat diakses kapan saja — menggantikan ketergantungan pada struk fisik yang selama ini mudah hilang dan rusak.

### 1.2 Rumusan Masalah

Berdasarkan latar belakang yang telah diuraikan, rumusan masalah dalam penelitian ini adalah sebagai berikut:

1. Bagaimana merancang dan membangun aplikasi *expense tracker* berbasis web yang dapat membantu UMKM dalam mencatat pengeluaran secara efisien?
2. Bagaimana mengintegrasikan teknologi *Optical Character Recognition* (OCR) dan *Vision Language Model* (VLM) untuk mengotomatiskan ekstraksi data dari struk atau *invoice* pembelian?
3. Bagaimana merancang sistem kategorisasi pengeluaran secara otomatis berdasarkan hasil analisis AI terhadap konten struk?
4. Bagaimana tingkat kegunaan (*usability*) aplikasi yang dibangun berdasarkan penilaian pengguna dari kalangan UMKM?

### 1.3 Tujuan Penelitian

Tujuan dari penelitian ini adalah:

1. Merancang dan membangun aplikasi *expense tracker* berbasis web yang dapat digunakan oleh pelaku UMKM untuk mencatat dan memantau pengeluaran usaha.
2. Mengimplementasikan integrasi teknologi OCR dan VLM melalui platform n8n untuk mengotomatiskan proses ekstraksi data struk.
3. Membangun sistem kategorisasi pengeluaran otomatis berbasis hasil analisis *Vision Language Model*.
4. Mengevaluasi tingkat kegunaan (*usability*) aplikasi melalui pengujian terhadap pengguna dari kalangan UMKM.

### 1.4 Manfaat Penelitian

#### 1.4.1 Manfaat Teoritis

1. Memberikan kontribusi ilmiah terkait penerapan teknologi *Vision Language Model* (VLM) dalam domain manajemen keuangan UMKM.
2. Menjadi referensi bagi penelitian selanjutnya yang berkaitan dengan otomasi pencatatan keuangan berbasis AI dan OCR.
3. Memperkaya literatur ilmiah mengenai integrasi platform otomasi *workflow* (n8n) dalam pengembangan aplikasi web.

#### 1.4.2 Manfaat Praktis

1. **Bagi UMKM**: Memudahkan proses pencatatan pengeluaran sehingga tidak lagi bergantung pada penyimpanan struk fisik yang rentan hilang atau rusak.
2. **Bagi Pengembang**: Memberikan referensi implementasi nyata mengenai integrasi OCR, VLM, dan *workflow* otomasi dalam aplikasi web modern.
3. **Bagi Masyarakat**: Mendorong transformasi digital UMKM di Indonesia melalui teknologi yang terjangkau dan mudah digunakan.

### 1.5 Batasan Masalah

Agar penelitian ini terfokus dan terarah, ditetapkan batasan masalah sebagai berikut:

1. Aplikasi yang dibangun merupakan aplikasi berbasis web (*web-based application*) dan tidak mencakup pengembangan aplikasi *mobile native*.
2. Fitur OCR hanya mendukung unggahan berupa file gambar (JPEG, PNG) dan dokumen PDF.
3. Proses analisis OCR dan ekstraksi data struk dilakukan melalui integrasi dengan platform n8n menggunakan *Vision Language Model* eksternal.
4. Aplikasi ditujukan untuk pencatatan **pengeluaran** (*expense*), bukan sistem akuntansi lengkap yang mencakup pemasukan, neraca, atau laporan laba-rugi.
5. Pengujian aplikasi dilakukan secara terbatas pada pengguna dari kalangan UMKM dengan skala mikro dan kecil.
6. Autentikasi pengguna dilakukan melalui *Google OAuth 2.0* dan tidak mencakup metode autentikasi lainnya.

### 1.6 Sistematika Penulisan

Penulisan proposal penelitian ini disusun dengan sistematika sebagai berikut:

- **BAB I PENDAHULUAN** — Membahas latar belakang, rumusan masalah, tujuan, manfaat, batasan masalah, dan sistematika penulisan.
- **BAB II TINJAUAN PUSTAKA** — Membahas landasan teori dan penelitian terdahulu yang relevan dengan topik penelitian.
- **BAB III METODOLOGI PENELITIAN** — Membahas metode penelitian, desain sistem, tahapan pengembangan, dan rencana pengujian.

---

## BAB II TINJAUAN PUSTAKA

### 2.1 Landasan Teori

#### 2.1.1 UMKM dan Permasalahan Pencatatan Keuangan

Usaha Mikro, Kecil, dan Menengah (UMKM) didefinisikan dalam Undang-Undang Nomor 20 Tahun 2008 tentang UMKM berdasarkan kriteria aset dan omzet usaha. UMKM memiliki peran strategis dalam perekonomian nasional, namun salah satu kendala utama yang dihadapi adalah lemahnya pengelolaan keuangan. Menurut berbagai studi, mayoritas UMKM di Indonesia masih melakukan pencatatan keuangan secara manual atau bahkan tidak melakukan pencatatan sama sekali. Kondisi ini menyebabkan sulitnya memantau arus kas, membuat laporan keuangan, dan mengajukan kredit usaha.

#### 2.1.2 *Expense Tracker*

*Expense tracker* adalah sistem atau aplikasi yang digunakan untuk mencatat, memantau, dan menganalisis pengeluaran. Dalam konteks bisnis, *expense tracker* berfungsi sebagai alat bantu manajemen keuangan yang memungkinkan pengguna untuk mengetahui distribusi pengeluaran berdasarkan kategori, periode waktu, dan anggaran yang ditetapkan. Sebuah *expense tracker* yang baik umumnya dilengkapi fitur kategorisasi otomatis, visualisasi data berupa grafik, dan kemampuan ekspor laporan dalam berbagai format.

#### 2.1.3 *Optical Character Recognition* (OCR)

*Optical Character Recognition* (OCR) adalah teknologi yang memungkinkan sistem komputer untuk mengenali dan mengekstrak teks dari gambar atau dokumen yang dipindai. Secara historis, OCR berbasis pada pencocokan pola (*pattern matching*) dan analisis fitur karakter. Namun perkembangan *deep learning* telah menghadirkan pendekatan OCR berbasis jaringan saraf tiruan (*neural network*) yang jauh lebih akurat, khususnya dalam menangani teks dengan variasi font, orientasi, dan kondisi pencahayaan yang beragam.

Dalam konteks pencatatan struk belanja, OCR digunakan untuk membaca informasi seperti nama toko, tanggal transaksi, daftar item, dan total harga dari foto struk yang diunggah pengguna.

#### 2.1.4 *Vision Language Model* (VLM)

*Vision Language Model* (VLM) adalah kelas model AI *multimodal* yang mampu memproses dan mengintegrasikan informasi dari dua modalitas sekaligus: gambar (*vision*) dan teks (*language*). VLM dilatih menggunakan dataset besar yang menggabungkan gambar dan teks, sehingga model mampu memahami konten visual secara kontekstual dan menghasilkan keluaran teks yang terstruktur.

Berbeda dengan OCR konvensional yang hanya mengekstrak teks secara mentah, VLM mampu menginterpretasikan makna dari teks yang diekstraksi, melakukan inferensi kategori, dan menghasilkan data terstruktur (*structured output*) langsung dari gambar. Kemampuan ini sangat relevan untuk pemrosesan struk belanja, di mana model tidak hanya membaca teks tetapi juga memahami konteks transaksi, seperti membedakan nama toko, total belanja, dan kategori produk.

Contoh VLM yang banyak digunakan antara lain GPT-4 Vision (OpenAI), Gemini Vision (Google), dan LLaVA (*Large Language and Vision Assistant*).

#### 2.1.5 n8n (*Workflow Automation*)

n8n adalah platform otomasi *workflow* sumber terbuka (*open-source*) yang memungkinkan pengintegrasian berbagai layanan dan API tanpa memerlukan penulisan kode yang kompleks. n8n menggunakan pendekatan berbasis *node*, di mana setiap *node* merepresentasikan satu operasi atau integrasi layanan. Dalam konteks penelitian ini, n8n digunakan sebagai lapisan orkestrasi antara aplikasi web dan *Vision Language Model* eksternal, sehingga proses analisis struk dapat dilakukan secara otomatis melalui *webhook*.

#### 2.1.6 Arsitektur Aplikasi Web Modern

Aplikasi web modern umumnya mengadopsi arsitektur *client-server* dengan pemisahan yang jelas antara *frontend* dan *backend*. *Frontend* bertanggung jawab atas antarmuka pengguna (*user interface*), sedangkan *backend* menangani logika bisnis, autentikasi, dan komunikasi dengan basis data. Komunikasi antara *frontend* dan *backend* dilakukan melalui *RESTful API*. Selain itu, teknologi *WebSocket* memungkinkan komunikasi *real-time* dua arah antara *client* dan *server*, sehingga perubahan data dapat langsung tercermin di antarmuka pengguna tanpa perlu melakukan *refresh* halaman.

#### 2.1.7 *Progressive Web Application* (PWA)

*Progressive Web Application* (PWA) adalah pendekatan pengembangan aplikasi web yang memungkinkan aplikasi web berperilaku seperti aplikasi *native* pada perangkat *mobile* maupun *desktop*. PWA memanfaatkan teknologi *Service Worker* untuk kemampuan *offline*, *caching* aset, dan notifikasi *push*. Dengan PWA, pengguna dapat menginstal aplikasi langsung dari *browser* tanpa melalui toko aplikasi (*app store*), sehingga memperluas jangkauan dan aksesibilitas aplikasi.

---

### 2.2 Penelitian Terdahulu

Beberapa penelitian terdahulu yang relevan dengan topik penelitian ini disajikan pada Tabel 2.1 berikut.

**Tabel 2.1 Penelitian Terdahulu**

| No | Peneliti | Tahun | Judul | Metode/Teknologi | Hasil | Persamaan | Perbedaan |
|----|----------|-------|-------|-----------------|-------|-----------|-----------|
| 1 | Dikembangkan oleh mahasiswa UNIKOM | 2024 | Pengembangan Aplikasi Web VisiKas: Otomatisasi Pencatatan Keuangan dan Penyusunan Laporan Keuangan UMKM Berbasis Ekstraksi Data Struk dengan Teknologi OCR | React, TypeScript, OCR, Firebase, Supabase | Aplikasi mampu mengotomatiskan pencatatan keuangan UMKM melalui ekstraksi data struk fisik menggunakan OCR, mempercepat proses input data dan meminimalkan kesalahan manusia | Sama-sama menggunakan OCR untuk ekstraksi data struk, berbasis web, dan ditargetkan untuk UMKM | Penelitian ini tidak mengintegrasikan *Vision Language Model* (VLM); VisiKas menggunakan OCR konvensional, sedangkan penelitian ini menggunakan VLM melalui platform n8n untuk pemahaman kontekstual yang lebih dalam |
| 2 | Maulana, dkk. | 2023 | Perancangan Aplikasi Laporan Keuangan Berbasis Web Untuk Pelaku UMKM | PHP, MySQL, berbasis web | Aplikasi berhasil dirancang untuk membantu UMKM menyusun laporan keuangan, dapat diakses melalui smartphone dan komputer | Sama-sama menargetkan UMKM dan berbasis web | Tidak menggunakan OCR maupun AI; pencatatan dilakukan secara manual oleh pengguna |
| 3 | Daniyal, dkk. | 2025 | *Automated Expense Tracking with OCR: Enhancing Financial Management through Technology* | OCR, AI, manajemen keuangan digital | Sistem berhasil mengotomatiskan pencatatan pengeluaran dari struk menggunakan OCR dan AI, meningkatkan akurasi dan efisiensi pencatatan keuangan | Sama-sama menggunakan OCR dan AI untuk otomasi pencatatan pengeluaran | Penelitian tersebut tidak spesifik untuk UMKM Indonesia dan tidak menggunakan platform n8n sebagai orkestrasi *workflow* |
| 4 | Ivanenko, dkk. | 2025 | *Automated Invoice Data Extraction: Using LLM and OCR* (arXiv:2511.05547) | LLM, OCR, ekstraksi data faktur | Kombinasi LLM dan OCR menghasilkan akurasi ekstraksi data *invoice* yang lebih tinggi dibandingkan OCR konvensional, dengan kemampuan *Named Entity Recognition* (NER) yang lebih baik | Sama-sama mengkombinasikan LLM/VLM dengan OCR untuk ekstraksi data dokumen finansial | Penelitian tersebut berfokus pada *invoice* B2B dan tidak diterapkan dalam konteks aplikasi *expense tracker* untuk UMKM |
| 5 | Meza & Timotius | 2023 | *Development of a Student Expense Tracking System Using Optical Character Recognition* | OCR, Python, sistem pencatatan pengeluaran | Sistem OCR berhasil mengekstrak data struk dan mencatatnya secara otomatis dalam sistem pencatatan pengeluaran mahasiswa | Sama-sama membangun sistem *expense tracker* berbasis OCR | Target pengguna berbeda (mahasiswa vs. UMKM); tidak menggunakan VLM dan tidak berbasis web modern dengan *real-time sync* |
| 6 | Prayudha, dkk. | 2022 | Rancang Bangun Aplikasi *Point of Sale* (POS App) Berbasis *Progressive Web App* untuk Usaha Mikro Kecil dan Menengah | PWA, React, Node.js | Aplikasi POS berbasis PWA berhasil dibangun dan dapat digunakan untuk mengelola transaksi UMKM dengan pengalaman pengguna yang mendekati aplikasi *native* | Sama-sama menggunakan arsitektur PWA dan menargetkan UMKM | Berfokus pada manajemen penjualan (*POS*), bukan pencatatan pengeluaran; tidak memiliki fitur OCR atau AI |

Berdasarkan kajian terhadap penelitian-penelitian terdahulu, dapat diidentifikasi bahwa terdapat celah (*research gap*) yang belum dijawab oleh penelitian sebelumnya, yaitu belum adanya aplikasi *expense tracker* berbasis web untuk UMKM yang mengintegrasikan *Vision Language Model* (VLM) sebagai inti pemrosesan struk, dikombinasikan dengan platform otomasi *workflow* n8n, serta dilengkapi dengan fitur *real-time synchronization* dan *Progressive Web Application* (PWA). Penelitian ini hadir untuk mengisi celah tersebut.

---

## BAB III METODOLOGI PENELITIAN

### 3.1 Metode Penelitian

Penelitian ini menggunakan metode **penelitian pengembangan** (*Research and Development* / R&D) dengan pendekatan *prototype*. Metode *prototype* dipilih karena memungkinkan pengembangan sistem secara iteratif berdasarkan masukan pengguna, sehingga aplikasi yang dihasilkan sesuai dengan kebutuhan nyata pelaku UMKM.

### 3.2 Tahapan Penelitian

Tahapan penelitian yang akan dilakukan adalah sebagai berikut:

#### 3.2.1 Studi Literatur
Melakukan kajian terhadap penelitian terdahulu, dokumentasi teknologi, dan referensi ilmiah yang berkaitan dengan OCR, *Vision Language Model*, pengembangan aplikasi web, dan manajemen keuangan UMKM.

#### 3.2.2 Analisis Kebutuhan
Melakukan identifikasi kebutuhan fungsional dan non-fungsional sistem melalui:
- Observasi terhadap permasalahan pencatatan keuangan UMKM
- Analisis *use case* dan alur kerja pengguna (*user flow*)

#### 3.2.3 Perancangan Sistem
Merancang arsitektur sistem secara keseluruhan, meliputi:
- Perancangan arsitektur aplikasi (*frontend*, *backend*, basis data, integrasi n8n)
- Perancangan basis data menggunakan PostgreSQL (Supabase)
- Perancangan antarmuka pengguna (*UI/UX design*)
- Perancangan alur integrasi OCR dan VLM melalui n8n *webhook*

#### 3.2.4 Implementasi
Membangun aplikasi berdasarkan rancangan yang telah dibuat, dengan detail implementasi sebagai berikut:

**Frontend:**
- Framework: React 18 dengan TypeScript
- *Build tool*: Vite
- Manajemen *state*: React Context API
- Validasi form: React Hook Form + Zod
- Visualisasi data: Recharts
- Fitur PWA: vite-plugin-pwa

**Backend:**
- *Runtime*: Node.js dengan TypeScript
- Framework: Express.js
- *Real-time*: Socket.io (WebSocket)
- Pemrosesan gambar: Sharp (kompresi pra-OCR)
- Autentikasi: Google OAuth 2.0

**Basis Data:**
- PostgreSQL via Supabase
- *Row Level Security* (RLS)
- *Stored function* untuk kalkulasi pengeluaran bulanan dan harian

**Integrasi AI:**
- Platform orkestrasi: n8n (*workflow automation*)
- Model AI: *Vision Language Model* (VLM) via n8n *webhook*
- Kategorisasi otomatis: *string matching* + *fuzzy matching* berbasis hasil VLM

#### 3.2.5 Pengujian
Pengujian sistem dilakukan dengan dua pendekatan:
- **Pengujian Fungsional** (*Black-box Testing*): Memverifikasi bahwa seluruh fitur berjalan sesuai spesifikasi kebutuhan.
- **Pengujian Kegunaan** (*Usability Testing*): Mengevaluasi kemudahan penggunaan aplikasi oleh pengguna dari kalangan UMKM menggunakan metode *System Usability Scale* (SUS).

#### 3.2.6 Evaluasi dan Kesimpulan
Menganalisis hasil pengujian, mengevaluasi ketercapaian tujuan penelitian, dan menarik kesimpulan serta rekomendasi untuk penelitian selanjutnya.

### 3.3 Arsitektur Sistem

Aplikasi yang dikembangkan menggunakan arsitektur tiga lapis (*three-tier architecture*) dengan tambahan integrasi layanan AI eksternal, sebagaimana digambarkan pada Gambar 3.1 berikut:

```
┌─────────────────────────────────────────────────────────────┐
│             LAPISAN PRESENTASI (Frontend)                   │
│         React 18 + TypeScript + Vite + PWA                  │
│   Dashboard │ Upload Struk │ Laporan │ Pengaturan           │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP REST API / WebSocket
┌──────────────────────┴──────────────────────────────────────┐
│             LAPISAN LOGIKA BISNIS (Backend)                 │
│              Node.js + Express.js + TypeScript              │
│  Auth (Google OAuth) │ Expenses │ Categories │ AI Route     │
│           Socket.io (Real-time Sync)                        │
└──────────┬──────────────────────────┬───────────────────────┘
           │                          │
           │ SQL / RPC                │ HTTP Webhook
┌──────────┴──────────┐   ┌──────────┴───────────────────────┐
│  BASIS DATA         │   │  LAYANAN AI EKSTERNAL (n8n)      │
│  PostgreSQL         │   │  Workflow Automation + VLM       │
│  (Supabase)         │   │  OCR → Ekstraksi Data Struk      │
│  RLS, Functions,    │   │  → Structured JSON Output        │
│  Triggers           │   └──────────────────────────────────┘
└─────────────────────┘
```

### 3.4 Alur Kerja Fitur OCR

Alur kerja utama fitur pemindaian struk menggunakan OCR dan VLM adalah sebagai berikut:

1. Pengguna mengunggah foto struk atau file PDF melalui antarmuka aplikasi web.
2. *Frontend* melakukan kompresi gambar (maks. 1920px, kualitas 85% JPEG) sebelum dikirim ke *backend*.
3. *Backend* menerima gambar dalam format *base64* dan melakukan kompresi lanjutan menggunakan Sharp (maks. 1500px, kualitas 85%).
4. *Backend* mengirimkan gambar ke n8n *webhook* dalam format *multipart/form-data*.
5. n8n memproses gambar menggunakan *Vision Language Model* (VLM) untuk mengekstrak data terstruktur: nama toko, total transaksi, kategori, tanggal, alamat, dan catatan.
6. n8n mengembalikan hasil dalam format JSON ke *backend*.
7. *Backend* melakukan normalisasi kategori dari string hasil VLM ke `category_id` dalam basis data menggunakan *exact match* dan *fuzzy matching*.
8. Hasil dikembalikan ke *frontend* untuk ditinjau dan diedit oleh pengguna sebelum disimpan.
9. Pengguna mengkonfirmasi dan menyimpan data ke basis data.
10. *Backend* mengirimkan *event real-time* via Socket.io untuk memperbarui tampilan *dashboard* secara langsung.

### 3.5 Jadwal Penelitian

| No | Kegiatan | Bulan 1 | Bulan 2 | Bulan 3 | Bulan 4 | Bulan 5 |
|----|----------|---------|---------|---------|---------|---------|
| 1  | Studi Literatur | ✓ | | | | |
| 2  | Analisis Kebutuhan | ✓ | ✓ | | | |
| 3  | Perancangan Sistem | | ✓ | ✓ | | |
| 4  | Implementasi | | | ✓ | ✓ | |
| 5  | Pengujian | | | | ✓ | ✓ |
| 6  | Evaluasi & Penulisan Laporan | | | | | ✓ |

---

## DAFTAR PUSTAKA

1. Daniyal, M., dkk. (2025). *Automated Expense Tracking with OCR: Enhancing Financial Management through Technology*. ResearchGate. https://www.researchgate.net/publication/389173197

2. Ivanenko, dkk. (2025). *Automated Invoice Data Extraction: Using LLM and OCR*. arXiv:2511.05547. https://arxiv.org/abs/2511.05547

3. Maulana, dkk. (2023). Perancangan Aplikasi Laporan Keuangan Berbasis Web Untuk Pelaku UMKM. *Jati: Jurnal Akuntansi Terapan Indonesia*. https://journal.umy.ac.id/index.php/jati/article/view/18034

4. Meza, A. & Timotius, I.K. (2023). *Development of a Student Expense Tracking System Using Optical Character Recognition*. *International Journal of Artificial Intelligence (IJAI)*. https://lamintang.org/journal/index.php/ijai/article/view/741

5. UNIKOM. (2024). Pengembangan Aplikasi Web VisiKas: Otomatisasi Pencatatan Keuangan dan Penyusunan Laporan Keuangan UMKM Berbasis Ekstraksi Data Struk dengan Teknologi OCR. https://web.unikom.ac.id/pengembangan-aplikasi-web-visikas

6. Prayudha, dkk. (2022). Rancang Bangun Aplikasi *Point of Sale* (POS App) Berbasis *Progressive Web App* untuk Usaha Mikro Kecil dan Menengah. *JUSTIN (Jurnal Sistem dan Teknologi Informasi)*. https://jurnal.untan.ac.id/index.php/justin/article/view/76824

7. Undang-Undang Republik Indonesia Nomor 20 Tahun 2008 tentang Usaha Mikro, Kecil, dan Menengah.

8. *Invoice and receipt optical character recognition: review on open-source models*. (2024). *CEUR Workshop Proceedings*, Vol-4044. https://ceur-ws.org/Vol-4044/paper12.pdf

---

*Proposal ini dibuat sebagai bagian dari persyaratan penelitian ilmiah Program Studi Teknik Informatika.*
