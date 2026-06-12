<div align="center">

# 🌸 Dompet Teratai

### Aplikasi Pencatat Pengeluaran Harian dengan AI

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

<img src="public/Logotrans-Teratai.webp" alt="Dompet Teratai Logo" width="150">

**Kelola keuanganmu dengan mudah dan cerdas!**

[Demo](#demo) • [Fitur](#-fitur-utama) • [Instalasi](#-instalasi) • [Tech Stack](#-tech-stack)

</div>

---

## ✨ Fitur Utama

<table>
<tr>
<td width="50%">

### 📸 Foto Struk Otomatis
Upload foto struk belanja, AI akan mengekstrak data secara otomatis - jumlah, tanggal, dan kategori!

### 💰 Catat Pengeluaran
Input manual dengan kategori kustom dan deskripsi detail

### 📊 Dashboard Interaktif
Ringkasan pengeluaran dengan grafik yang mudah dipahami

</td>
<td width="50%">

### 🎯 Budget Tracker
Pantau budget bulanan dengan peringatan real-time

### 📈 Laporan Lengkap
Analisis pengeluaran per kategori dan periode waktu

### 📥 Export Data
Export laporan ke PDF dan Excel dengan satu klik

</td>
</tr>
</table>

### Fitur Tambahan

| Fitur | Deskripsi |
|-------|-----------|
| 🌙 **Dark Mode** | Tema gelap yang nyaman di mata |
| 📱 **Responsive** | Optimal di mobile dan desktop |
| 🔐 **Google Login** | Login mudah dengan akun Google |
| ☁️ **Cloud Sync** | Data tersimpan aman di cloud |

---

## 🛠 Tech Stack

<div align="center">

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=flat-square&logo=react-router&logoColor=white)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white)

### Tools
![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![Google OAuth](https://img.shields.io/badge/Google_OAuth-4285F4?style=flat-square&logo=google&logoColor=white)

</div>

---

## 📦 Instalasi

### Prerequisites

- Node.js 18+
- npm atau yarn
- Akun [Supabase](https://supabase.com)
- Google Cloud Console (untuk OAuth)

### Quick Start

```bash
# 1. Clone repository
git clone https://github.com/Grd45bisa/dompet-teratai.git
cd dompet-teratai

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env dengan konfigurasi Anda

# 4. Jalankan development server
npm run dev
```

### Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Konfigurasi SUPABASE_URL, SUPABASE_SERVICE_KEY, dll
npm run dev
```

---

## � Struktur Project

```
dompet-teratai/
├── 📁 src/
│   ├── 📁 components/     # React Components
│   │   ├── dashboard/     # Dashboard widgets
│   │   ├── layout/        # Sidebar, Header
│   │   ├── transactions/  # Transaction components
│   │   └── ui/            # Reusable UI
│   ├── 📁 contexts/       # React Contexts
│   ├── 📁 pages/          # Page components
│   ├── 📁 styles/         # CSS files
│   └── 📁 utils/          # Utilities
├── 📁 backend/
│   ├── routes/            # API routes
│   └── middleware/        # Auth middleware
└── 📁 public/             # Static assets
```

---

## ⚙️ Environment Variables

<details>
<summary><b>Frontend (.env)</b></summary>

```env
VITE_API_URL=http://localhost:3000/api
```

</details>

<details>
<summary><b>Backend (.env)</b></summary>

```env
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=http://localhost:5173
```

</details>

---

## � Deployment

| Platform | Frontend | Backend |
|----------|----------|---------|
| Vercel | ✅ | - |
| Netlify | ✅ | - |
| Railway | - | ✅ |
| Render | - | ✅ |

```bash
# Build untuk production
npm run build
```

---

## 👥 Tim Pengembang

<div align="center">

**Projek PKM Semester 7**

Dikembangkan dengan ❤️ oleh Mahasiswa Indonesia

</div>

---

## 📄 Lisensi

```
MIT License - Silakan gunakan dan modifikasi sesuai kebutuhan
```

---

<div align="center">

### ⭐ Jangan lupa kasih star ya!

Made with 💚 using React & Supabase

</div>