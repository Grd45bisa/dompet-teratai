# Panduan Pengembangan Aplikasi Android - Dompet Teratai

Dokumen ini berisi panduan lengkap untuk membuat versi Android dari aplikasi web **Dompet Teratai** menggunakan **React Native Expo** dengan TypeScript. Backend tetap menggunakan backend yang sudah ada.

---

## Informasi Proyek

| Item | Detail |
|------|--------|
| **Nama Aplikasi** | Dompet Teratai |
| **Framework** | React Native Expo (TypeScript) |
| **Backend** | Express.js + Supabase (existing) |
| **Target Platform** | Android |
| **Metode Testing** | Expo Go |

---

## Ringkasan Fitur yang Harus Diimplementasi

| Halaman | Fitur Utama |
|---------|-------------|
| Login | Google OAuth, Demo Mode |
| Onboarding | Welcome screens dengan swiper |
| Complete Profile | Form profil pengguna |
| Dashboard | Greeting, Budget Progress, Stats, Chart 7 hari, Recent Transactions |
| Transactions | List transaksi, Filter, Detail modal, Delete, AI Processing Card |
| Reports | Grafik pengeluaran, Export PDF/Excel |
| Settings | Profile, Categories CRUD, Theme toggle, Logout, Delete Account |

---

## Struktur API Endpoints

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/auth/google` | GET | Redirect ke Google OAuth |
| `/auth/me` | GET | Get current user profile |
| `/auth/profile` | PUT | Update user profile |
| `/auth/account` | DELETE | Delete user account |
| `/expenses` | GET | Get expenses with filters |
| `/expenses` | POST | Create new expense |
| `/expenses/:id` | PUT | Update expense |
| `/expenses/:id` | DELETE | Delete expense |
| `/categories` | GET | Get all categories |
| `/categories` | POST | Create category |
| `/categories/:id` | PUT | Update category |
| `/categories/:id` | DELETE | Delete category |
| `/ai/analyze-receipt` | POST | Analyze receipt image with AI |
| `/ai/save-expense` | POST | Save AI-extracted expense |

---

## Tipe Data (Types)

```typescript
interface User {
    id: string;
    email: string;
    full_name: string | null;
    
    avatar_url: string | null;
    business_type: string | null;
    occupation: string | null;
    monthly_budget: number;
    onboarding_completed: boolean;
    dark_mode: boolean;
    created_at: string;
    updated_at: string;
}

interface Category {
    id: string;
    user_id: string | null;
    name: string;
    color: string;
    is_default: boolean;
    created_at: string;
}

interface Expense {
    id: string;
    user_id: string;
    category_id: string | null;
    category?: Category;
    amount: number;
    description: string | null;
    expense_date: string;
    receipt_url: string | null;
    attachment_type: 'image' | 'pdf' | null;
    attachment_data: string | null;
    ai_processed: boolean;
    created_at: string;
    updated_at: string;
}
```

---

## Dukungan Tablet - Responsive Layout

Aplikasi harus mendukung **2 mode tampilan** untuk tablet:

| Mode | Orientasi | Tampilan | Keterangan |
|------|-----------|----------|------------|
| **Mobile Mode** | Portrait | Layout mobile | Sama seperti tampilan HP |
| **Desktop Mode** | Landscape | Layout desktop | Mirip tampilan website |

### Aturan Responsive

| Device | Portrait | Landscape |
|--------|----------|-----------|
| Phone (< 600dp) | Mobile | Mobile |
| Tablet (>= 600dp) | Mobile | Desktop |

### Implementasi yang Dibutuhkan

1. **Custom Hook untuk Deteksi Layout**
   ```typescript
   // src/hooks/useResponsiveLayout.ts
   import { useWindowDimensions } from 'react-native';

   export type LayoutMode = 'mobile' | 'desktop';

   export function useResponsiveLayout() {
       const { width, height } = useWindowDimensions();
       const isLandscape = width > height;
       const isTablet = Math.min(width, height) >= 600;
       
       // Tablet landscape = desktop mode
       const layoutMode: LayoutMode = isTablet && isLandscape ? 'desktop' : 'mobile';
       
       return {
           layoutMode,
           isTablet,
           isLandscape,
           screenWidth: width,
           screenHeight: height,
       };
   }
   ```

2. **Perbedaan Layout per Mode**

   | Komponen | Mobile Mode | Desktop Mode |
   |----------|-------------|--------------|
   | Navigation | Bottom Tab | Side Navigation (Drawer) |
   | Dashboard | Single column, stacked cards | Multi-column grid layout |
   | Transactions | Full width list | Split view (list + detail) |
   | Reports | Stacked charts | Side-by-side charts |
   | Settings | Single column | Two-column layout |
   | Modals | Full screen | Centered popup (max-width) |

3. **Contoh Penggunaan di Komponen**
   ```typescript
   import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

   export function Dashboard() {
       const { layoutMode } = useResponsiveLayout();
       
       if (layoutMode === 'desktop') {
           return <DashboardDesktopLayout />;
       }
       return <DashboardMobileLayout />;
   }
   ```

4. **Layout Desktop untuk Tablet Landscape**
   - Sidebar navigation di kiri (seperti website)
   - Content area yang lebih luas
   - Grid layout untuk cards (2-3 kolom)
   - Charts lebih besar dengan detail
   - Split view untuk transactions (list + detail panel)

5. **Dependencies Tambahan**
   - `react-native-drawer-layout` - untuk side navigation di desktop mode
   - Atau custom implementation dengan `Animated` API

---

# FASE 1: Setup Proyek dan Konfigurasi

## Prompt AI untuk Fase 1

```
Saya ingin membuat proyek React Native Expo dengan TypeScript untuk aplikasi expense tracker bernama "Dompet Teratai". Tolong bantu saya:

0. BUAT FOLDER BARU UNTUK PROYEK:
   - Buat folder baru di luar folder proyek web untuk menyimpan proyek Android
   - Lokasi yang disarankan: folder sejajar dengan proyek web, contoh:
     - Proyek web: E:\...\Expanse-tracker
     - Proyek mobile: E:\...\dompet-teratai-mobile
   - Jalankan perintah berikut di terminal:
     ```bash
     # Navigasi ke folder parent
     cd E:\Tugas Kuliah Khusus Pahmi\Semester 7\Projek PKM
     
     # Buat folder baru untuk proyek mobile
     mkdir dompet-teratai-mobile
     
     # Masuk ke folder tersebut
     cd dompet-teratai-mobile
     ```
   - PENTING: Jangan membuat proyek mobile di dalam folder proyek web untuk menghindari konflik

1. SETUP PROYEK:
   - Buat proyek baru menggunakan Expo dengan template TypeScript
   - Nama proyek: dompet-teratai-mobile
   - Gunakan Expo Router untuk navigasi
   - Setup struktur folder yang rapi dan scalable

2. STRUKTUR FOLDER yang harus dibuat:
   ```
   src/
   ├── app/                    # Expo Router pages
   │   ├── (auth)/            # Auth group (login, register)
   │   ├── (tabs)/            # Main tabs (dashboard, transactions, reports, settings)
   │   └── _layout.tsx        # Root layout
   ├── components/            # Reusable components
   │   ├── ui/               # Basic UI components (Button, Card, Input, etc)
   │   ├── dashboard/        # Dashboard specific components
   │   ├── transactions/     # Transaction specific components
   │   └── layout/           # Layout components (Header, BottomNav, Sidebar)
   ├── contexts/             # React contexts
   │   ├── AuthContext.tsx
   │   ├── ThemeContext.tsx
   │   └── ToastContext.tsx
   ├── hooks/                # Custom hooks
   │   └── useResponsiveLayout.ts  # Hook untuk deteksi tablet/mobile mode
   ├── lib/                  # API client dan utilities
   │   └── api.ts
   ├── types/                # TypeScript types
   │   └── index.ts
   ├── utils/                # Utility functions
   │   └── formatCurrency.ts
   └── constants/            # App constants (colors, etc)
       └── Colors.ts
   ```

3. DEPENDENCIES yang harus diinstall:
   - @react-navigation/native (untuk navigasi)
   - @react-navigation/bottom-tabs (untuk bottom tab navigation)
   - @react-navigation/drawer (untuk drawer/sidebar navigation di tablet landscape)
   - @react-navigation/stack (untuk stack navigation)
   - expo-router (untuk file-based routing)
   - expo-secure-store (untuk menyimpan token)
   - expo-image-picker (untuk ambil foto)
   - expo-camera (untuk kamera)
   - react-native-chart-kit (untuk grafik)
   - react-native-vector-icons (untuk icons) ATAU @expo/vector-icons
   - date-fns (untuk format tanggal)
   - axios (untuk HTTP requests)
   - socket.io-client (untuk WebSocket)
   - expo-auth-session (untuk Google OAuth)
   - expo-web-browser (untuk OAuth flow)
   - react-native-safe-area-context
   - react-native-screens
   - react-native-gesture-handler
   - react-native-reanimated (untuk animasi smooth)
   - expo-screen-orientation (untuk deteksi orientasi tablet)

4. KONFIGURASI:
   - Setup app.json dengan nama "Dompet Teratai", slug, dan icon
   - Buat file .env untuk API_URL
   - Setup babel.config.js untuk reanimated
   - Buat constants/Colors.ts dengan color palette:
     ```typescript
     export const Colors = {
       primary: '#43A047',      // Hijau utama
       primaryDark: '#2E7D32',
       primaryLight: '#81C784',
       background: '#F5F5F5',
       backgroundDark: '#1A1A1A',
       card: '#FFFFFF',
       cardDark: '#2A2A2A',
       text: '#1A1A1A',
       textDark: '#F5F5F5',
       textSecondary: '#666666',
       border: '#E5E7EB',
       danger: '#EF4444',
       warning: '#F59E0B',
       success: '#10B981',
       purple: '#8B5CF6',
       blue: '#3B82F6',
       orange: '#F97316',
     };
     ```

5. Jangan gunakan emoji untuk icon, gunakan @expo/vector-icons dengan icon dari Ionicons, MaterialIcons, atau Feather.

6. BUAT HOOK untuk responsive layout (tablet support):
   - Buat file src/hooks/useResponsiveLayout.ts
   - Hook harus mendeteksi:
     - Apakah device adalah tablet (min width/height >= 600)
     - Apakah orientasi landscape
     - layoutMode: 'mobile' | 'desktop' (tablet + landscape = desktop)
   - Gunakan useWindowDimensions dari react-native

Berikan saya:
1. Perintah terminal untuk membuat proyek
2. File-file konfigurasi yang diperlukan (app.json, babel.config.js, tsconfig.json)
3. File constants/Colors.ts
4. File types/index.ts dengan semua tipe data yang dibutuhkan
5. File hooks/useResponsiveLayout.ts untuk deteksi tablet/mobile mode
```

---

# FASE 2: Implementasi API Client dan Contexts

## Prompt AI untuk Fase 2

```
Lanjutkan proyek React Native Expo "Dompet Teratai". Sekarang saya ingin implementasi API client dan Context providers.

BACKEND API URL: https://back.teratai.web.id

1. BUAT FILE src/lib/api.ts:
   - Implementasi generic fetch wrapper dengan token handling
   - Gunakan expo-secure-store untuk menyimpan token (bukan localStorage)
   - Implementasi semua API endpoints:

   AUTH API:
   - getProfile(): GET /auth/me
   - updateProfile(data): PUT /auth/profile
   - deleteAccount(): DELETE /auth/account
   - logout(): Clear token

   EXPENSES API:
   - getExpenses(filters): GET /expenses
   - createExpense(data): POST /expenses
   - updateExpense(id, data): PUT /expenses/:id
   - deleteExpense(id): DELETE /expenses/:id

   CATEGORIES API:
   - getCategories(): GET /categories
   - createCategory(data): POST /categories
   - updateCategory(id, data): PUT /categories/:id
   - deleteCategory(id): DELETE /categories/:id

   AI API:
   - analyzeReceipt(imageBase64, filename): POST /ai/analyze-receipt
   - saveExpense(data): POST /ai/save-expense

2. BUAT FILE src/contexts/AuthContext.tsx:
   - State: user, loading, isAuthenticated
   - Functions: login, logout, updateUser, refreshUser
   - Handle token dari URL callback setelah Google OAuth
   - Auto-fetch user profile saat app start jika ada token

3. BUAT FILE src/contexts/ThemeContext.tsx:
   - State: isDarkMode, colors (based on dark mode)
   - Functions: toggleTheme
   - Persist theme preference ke AsyncStorage
   - Sync dengan user.dark_mode dari backend

4. BUAT FILE src/contexts/ToastContext.tsx:
   - State: toast (type, message, visible)
   - Functions: showToast(type, message), hideToast()
   - Types: 'success' | 'error' | 'warning' | 'info'
   - Auto-hide setelah 3 detik
   - Animasi slide dari atas

5. BUAT KOMPONEN src/components/ui/Toast.tsx:
   - Tampilkan toast notification
   - Icon berbeda untuk setiap type (gunakan @expo/vector-icons, BUKAN emoji):
     - success: checkmark-circle (Ionicons)
     - error: close-circle (Ionicons)
     - warning: warning (Ionicons)
     - info: information-circle (Ionicons)
   - Warna berbeda untuk setiap type
   - Animasi fade dan slide

6. BUAT FILE src/utils/formatCurrency.ts:
   ```typescript
   export function formatCurrency(amount: number): string {
       return new Intl.NumberFormat('id-ID').format(amount);
   }

   export function formatCompactCurrency(amount: number): string {
       if (amount >= 1000000000) {
           return `Rp ${(amount / 1000000000).toFixed(1)}M`;
       }
       if (amount >= 1000000) {
           return `Rp ${(amount / 1000000).toFixed(1)}jt`;
       }
       if (amount >= 1000) {
           return `Rp ${(amount / 1000).toFixed(0)}rb`;
       }
       return `Rp ${amount}`;
   }
   ```

Pastikan semua menggunakan TypeScript dengan proper typing. Jangan gunakan emoji, gunakan icon dari @expo/vector-icons.
```

---

# FASE 3: Implementasi Auth Flow (Login, OAuth, Onboarding)

## Prompt AI untuk Fase 3

```
Lanjutkan proyek React Native Expo "Dompet Teratai". Sekarang implementasi authentication flow.

1. BUAT HALAMAN LOGIN src/app/(auth)/login.tsx:
   - Layout yang menarik dan modern
   - Logo aplikasi di atas (gunakan Image dari react-native)
   - Judul "Dompet Teratai" dengan subtitle "Expense Tracker"
   - Tagline: "Catat Pengeluaran, Kelola Keuangan"
   - List fitur dengan icon (gunakan @expo/vector-icons, BUKAN emoji):
     - camera-outline (Ionicons): "Foto Struk - Foto struk, AI isi otomatis"
     - bar-chart-outline (Ionicons): "Laporan Lengkap - Grafik & export ke PDF/Excel"
     - shield-checkmark-outline (Ionicons): "Aman & Gratis - Data tersimpan aman"
   - Tombol "Masuk dengan Google" dengan icon Google SVG
   - Tombol "Coba Demo Dulu" untuk demo mode
   - Demo mode: set demo data ke AsyncStorage, navigate ke dashboard
   - Footer: "© 2024 Dompet Teratai"

2. IMPLEMENTASI GOOGLE OAUTH:
   - Gunakan expo-auth-session dan expo-web-browser
   - Redirect ke backend: [API_URL]/auth/google
   - Handle callback dengan token dari URL
   - Simpan token ke SecureStore
   - Fetch user profile setelah login berhasil

3. BUAT HALAMAN ONBOARDING src/app/(auth)/onboarding.tsx:
   - 3-4 slide welcome screen
   - Gunakan FlatList horizontal dengan pagination dots
   - Slide 1: Welcome, penjelasan singkat aplikasi
   - Slide 2: Fitur foto struk dengan AI
   - Slide 3: Fitur laporan dan grafik
   - Slide 4: Tombol "Mulai Sekarang"
   - Skip button di pojok kanan atas
   - Animasi smooth antar slide

4. BUAT HALAMAN COMPLETE PROFILE src/app/(auth)/complete-profile.tsx:
   - Form untuk melengkapi profil:
     - Nama Lengkap (TextInput)
     - Jenis Usaha (Picker/Dropdown): UMKM, Freelancer, Mahasiswa, Karyawan, Lainnya
     - Pekerjaan (TextInput, opsional)
     - Budget Bulanan (TextInput dengan format currency)
   - Tombol "Simpan & Lanjutkan"
   - Validasi: Nama wajib diisi
   - Setelah sukses: set onboarding_completed = true, navigate ke dashboard

5. BUAT ROOT LAYOUT src/app/_layout.tsx:
   - Wrap dengan semua providers (Auth, Theme, Toast)
   - Setup navigation container
   - Handle redirect based on auth state:
     - Belum login -> /login
     - Login tapi belum onboarding -> /complete-profile
     - Sudah onboarding -> /(tabs)/dashboard

6. STYLING:
   - Gunakan StyleSheet.create() untuk semua styles
   - Responsive design (gunakan Dimensions)
   - Support dark mode dari ThemeContext
   - Warna utama: #43A047 (hijau)
   - Modern dengan rounded corners dan shadows

Jangan gunakan emoji. Semua icon harus menggunakan @expo/vector-icons (Ionicons, MaterialIcons, atau Feather).
```

---

# FASE 4: Implementasi Main Screens (Dashboard, Transactions)

## Prompt AI untuk Fase 4

```
Lanjutkan proyek React Native Expo "Dompet Teratai". Sekarang implementasi halaman utama dengan bottom tab navigation.

1. SETUP BOTTOM TAB NAVIGATION src/app/(tabs)/_layout.tsx:
   - 4 tabs: Dashboard, Transaksi, Laporan, Pengaturan
   - Tab icons menggunakan @expo/vector-icons (Ionicons):
     - Dashboard: home-outline / home
     - Transaksi: receipt-outline / receipt
     - Laporan: pie-chart-outline / pie-chart
     - Pengaturan: settings-outline / settings
   - Floating Action Button (+) di tengah untuk Add Expense
   - Warna aktif: #43A047, Warna inaktif: #9CA3AF
   - Custom tab bar dengan styling modern

2. BUAT HALAMAN DASHBOARD src/app/(tabs)/dashboard.tsx:

   SECTION 1 - GREETING CARD:
   - Icon waktu berdasarkan jam (gunakan @expo/vector-icons):
     - sunny-outline (pagi 06-11)
     - partly-sunny-outline (siang 12-14)
     - cloudy-outline (sore 15-17)
     - moon-outline (malam 18-05)
   - Text: "Selamat [Pagi/Siang/Sore/Malam]"
   - Nama user: "Hai, [Nama]!"
   - Tanggal hari ini dengan format Indonesia

   SECTION 2 - BUDGET PROGRESS CARD:
   - Icon target (Ionicons: flag-outline)
   - Title: "Budget Bulanan"
   - Subtitle: Bulan dan tahun saat ini
   - Progress bar dengan persentase
   - Warna progress:
     - Hijau (#43A047): < 80%
     - Kuning (#F59E0B): 80-99%
     - Merah (#EF4444): >= 100%
   - Stats: Terpakai | Sisa Budget
   - Status message berdasarkan persentase

   SECTION 3 - QUICK STATS (3 kartu):
   - Rata-rata Transaksi (icon: wallet-outline)
   - Jumlah Transaksi (icon: cart-outline)
   - Kategori Terbanyak (icon: pricetag-outline)

   SECTION 4 - CHART 7 HARI TERAKHIR:
   - Gunakan react-native-chart-kit dengan AreaChart atau LineChart
   - Icon: bar-chart-outline
   - Label hari dalam bahasa Indonesia (Sen, Sel, Rab, dst)
   - Warna gradient hijau (#43A047)

   SECTION 5 - RECENT TRANSACTIONS:
   - Icon: time-outline
   - Header: "Transaksi Terakhir" dengan link "Lihat Semua"
   - List 5 transaksi terbaru
   - Setiap item: icon kategori, deskripsi, kategori, tanggal, amount
   - Empty state jika belum ada transaksi

3. BUAT HALAMAN TRANSACTIONS src/app/(tabs)/transactions.tsx:

   HEADER:
   - Title: "Transaksi"
   - Subtitle: range tanggal
   - Filter button dengan badge count

   SUMMARY CARD:
   - Total pengeluaran periode ini
   - Jumlah transaksi

   FILTER PANEL (collapsible):
   - Date range picker (Dari Tanggal, Sampai Tanggal)
   - Category filter (multi-select chips)
   - Reset dan Apply button

   TRANSACTION LIST:
   - Group by date (Hari Ini, Kemarin, atau tanggal lengkap)
   - Setiap group: header tanggal dengan total
   - Setiap item:
     - Thumbnail receipt jika ada, atau category color dot
     - Icon PDF jika attachment_type === 'pdf' (Ionicons: document-text-outline)
     - Deskripsi
     - Category badge
     - Amount dan waktu
     - Delete button (icon: trash-outline)
     - Chevron untuk detail

   EMPTY STATE:
   - Icon: receipt-outline (large)
   - Text: "Belum ada transaksi"

4. BUAT KOMPONEN REUSABLE:
   - src/components/ui/Card.tsx
   - src/components/ui/Button.tsx
   - src/components/ui/Badge.tsx
   - src/components/dashboard/StatCard.tsx
   - src/components/dashboard/BudgetProgressCard.tsx
   - src/components/transactions/TransactionItem.tsx
   - src/components/transactions/TransactionGroup.tsx

5. DATA FETCHING:
   - Gunakan useEffect untuk fetch data saat mount
   - Implement pull-to-refresh (RefreshControl)
   - Loading skeleton saat fetching
   - Handle error dengan Toast

6. TABLET RESPONSIVE LAYOUT (PENTING):
   Aplikasi harus mendukung 2 mode tampilan:
   - Portrait (semua device): Layout mobile dengan bottom tab
   - Landscape (tablet only): Layout desktop dengan sidebar

   IMPLEMENTASI:
   a. Gunakan hook useResponsiveLayout untuk deteksi mode
   b. Di _layout.tsx, render berbeda berdasarkan layoutMode:
      ```typescript
      const { layoutMode } = useResponsiveLayout();
      
      if (layoutMode === 'desktop') {
          return <DrawerNavigator />;  // Sidebar navigation
      }
      return <BottomTabNavigator />;   // Bottom tab navigation
      ```
   
   c. DESKTOP MODE (Tablet Landscape):
      - Sidebar/Drawer navigation di kiri (permanent, bukan swipe)
      - Content area lebih luas di kanan
      - Dashboard: Grid 2-3 kolom untuk cards
      - Transactions: Split view (list di kiri, detail di kanan)
      - Charts lebih besar dan detail
      - Modal sebagai popup centered (bukan full screen)
   
   d. MOBILE MODE (Portrait):
      - Bottom tab navigation
      - Single column layout
      - Full screen modals
      - Layout standar mobile

   e. BUAT KOMPONEN LAYOUT:
      - src/components/layout/Sidebar.tsx (untuk desktop mode)
      - src/components/layout/BottomTabBar.tsx (untuk mobile mode)
      - src/components/layout/ResponsiveContainer.tsx (wrapper)

Semua icon menggunakan @expo/vector-icons. JANGAN gunakan emoji.
```

---

# FASE 5: Implementasi Reports dan Settings

## Prompt AI untuk Fase 5

```
Lanjutkan proyek React Native Expo "Dompet Teratai". Sekarang implementasi halaman Reports dan Settings.

1. BUAT HALAMAN REPORTS src/app/(tabs)/reports.tsx:

   HEADER:
   - Title: "Laporan"
   - Period selector: "Bulan Ini" | "3 Bulan" | "6 Bulan" | "1 Tahun"

   SUMMARY SECTION:
   - Total Pengeluaran (large, prominent)
   - Rata-rata per hari
   - Jumlah transaksi

   PIE CHART - KATEGORI:
   - Icon: pie-chart-outline
   - Title: "Pengeluaran per Kategori"
   - Gunakan react-native-chart-kit PieChart
   - Legend dengan warna kategori
   - Persentase untuk setiap kategori

   BAR CHART - TREN BULANAN:
   - Icon: trending-up-outline
   - Title: "Tren Pengeluaran"
   - Gunakan react-native-chart-kit BarChart
   - Label bulan dalam bahasa Indonesia

   TOP CATEGORIES LIST:
   - Icon: list-outline
   - Title: "Kategori Teratas"
   - Top 5 kategori dengan bar progress
   - Warna sesuai kategori

   EXPORT SECTION:
   - Card dengan opsi export
   - Button "Export ke PDF" (icon: document-outline)
   - Button "Export ke Excel" (icon: grid-outline)
   - Gunakan expo-print untuk PDF
   - Gunakan expo-sharing untuk share file

2. BUAT HALAMAN SETTINGS src/app/(tabs)/settings.tsx:

   PROFILE SECTION:
   - Avatar user (Image atau placeholder)
   - Nama lengkap (editable)
   - Email (read-only)
   - Jenis usaha (editable)
   - Pekerjaan (editable)
   - Budget bulanan (editable)
   - Tombol "Simpan Perubahan"

   CATEGORIES SECTION:
   - Icon: pricetags-outline
   - Title: "Kelola Kategori"
   - List semua kategori dengan:
     - Color dot
     - Nama kategori
     - Badge "Default" jika is_default
     - Edit button (icon: create-outline)
     - Delete button (icon: trash-outline) - hanya untuk custom
   - Tombol "Tambah Kategori Baru"
   - Modal untuk add/edit kategori:
     - Input nama
     - Color picker (preset colors)
     - Save dan Cancel button

   PREFERENCES SECTION:
   - Toggle Dark Mode (Switch)
   - Icon: moon-outline / sunny-outline

   ACCOUNT SECTION:
   - Button "Keluar" (icon: log-out-outline)
   - Button "Hapus Akun" (icon: trash-outline, warna merah)
   - Confirmation modal sebelum delete

   APP INFO:
   - Version: 1.0.0
   - Developer info

3. BUAT MODAL COMPONENTS:
   - src/components/ui/Modal.tsx (base modal)
   - src/components/settings/CategoryModal.tsx
   - src/components/settings/DeleteConfirmModal.tsx

4. IMPLEMENTASI CRUD KATEGORI:
   - Create: POST /categories
   - Update: PUT /categories/:id
   - Delete: DELETE /categories/:id (dengan konfirmasi)
   - Refresh list setelah CRUD

5. STYLING:
   - Consistent dengan halaman lain
   - Support dark mode
   - Smooth transitions dan animations

6. TABLET RESPONSIVE LAYOUT:
   
   REPORTS - DESKTOP MODE (Tablet Landscape):
   - Charts ditampilkan side-by-side (2 kolom)
   - Pie chart dan Bar chart dalam satu baris
   - Top categories dengan layout lebih luas
   - Export buttons di header atau sidebar
   
   REPORTS - MOBILE MODE:
   - Charts stacked vertikal
   - Single column layout
   
   SETTINGS - DESKTOP MODE (Tablet Landscape):
   - Two-column layout:
     - Kolom kiri: Profile section
     - Kolom kanan: Categories, Preferences, Account
   - Modal category edit sebagai popup centered
   
   SETTINGS - MOBILE MODE:
   - Single column, semua section stacked
   - Full screen modals

JANGAN gunakan emoji. Semua icon dari @expo/vector-icons.
```

---

# FASE 6: Implementasi Upload dan AI Analysis

## Prompt AI untuk Fase 6

```
Lanjutkan proyek React Native Expo "Dompet Teratai". Sekarang implementasi fitur upload gambar/PDF dan AI analysis.

1. BUAT FLOATING ACTION BUTTON (FAB):
   - Komponen: src/components/layout/FloatingButton.tsx
   - Position: absolute, bottom center, di atas tab bar
   - Style: circular, warna primary (#43A047), shadow
   - Icon: add-outline (Ionicons)
   - OnPress: open Upload Modal

2. BUAT UPLOAD MODAL src/components/dashboard/UploadModal.tsx:

   HEADER:
   - Title: "Tambah Pengeluaran"
   - Close button (icon: close-outline)

   UPLOAD AREA:
   - Large dashed border area
   - Icon: cloud-upload-outline
   - Text: "Upload Struk/Invoice"
   - Subtext: "Foto atau PDF untuk diproses AI"
   
   ACTION BUTTONS:
   - "Ambil Foto" (icon: camera-outline)
     - Gunakan expo-camera atau expo-image-picker
   - "Pilih dari Galeri" (icon: images-outline)
     - Gunakan expo-image-picker
   - "Upload PDF" (icon: document-attach-outline)
     - Gunakan expo-document-picker

   PREVIEW SECTION (setelah pilih file):
   - Tampilkan preview gambar atau icon PDF
   - Nama file
   - Tombol "Ganti" dan "Proses dengan AI"

   ATAU MANUAL INPUT:
   - Divider dengan text "atau input manual"
   - Tombol "Input Manual" (icon: create-outline)

3. BUAT AI PROCESSING FLOW:
   - Komponen: src/components/dashboard/AIProcessingCard.tsx
   - State: idle | processing | success | error
   
   PROCESSING STATE:
   - Animasi loading spinner
   - Text: "AI sedang menganalisis struk..."
   - Progress indicator

   SUCCESS STATE:
   - Icon: checkmark-circle (hijau)
   - AI Results card:
     - Toko/Merchant
     - Total amount (editable)
     - Kategori (dropdown, pre-selected dari AI)
     - Tanggal (date picker)
     - Alamat
     - Catatan
   - Confidence score dengan badge
   - Tombol "Simpan" dan "Batal"

   ERROR STATE:
   - Icon: alert-circle (merah)
   - Error message
   - Retry button

4. BUAT MANUAL INPUT MODAL:
   - Komponen: src/components/dashboard/ManualInputModal.tsx
   - Form fields:
     - Jumlah (TextInput, numeric, format currency)
     - Kategori (Picker/Dropdown)
     - Tanggal (DatePicker)
     - Deskripsi (TextInput)
     - Upload gambar (opsional)
   - Validasi: jumlah dan kategori wajib
   - Tombol "Simpan"

5. IMPLEMENTASI IMAGE HANDLING:
   - Resize gambar sebelum upload (gunakan expo-image-manipulator)
   - Compress to max 1MB
   - Convert to base64
   - Support format: jpg, png, webp

6. IMPLEMENTASI PDF HANDLING:
   - Gunakan expo-document-picker
   - Read file as base64
   - Kirim ke API dengan attachment_type: 'pdf'

7. API INTEGRATION:
   - Upload: POST /ai/analyze-receipt dengan { image: base64, filename }
   - Save: POST /ai/save-expense dengan hasil AI + attachment

8. REFRESH DATA:
   - Setelah save berhasil, emit event untuk refresh dashboard dan transactions
   - Gunakan context atau event emitter

JANGAN gunakan emoji. Semua icon dari @expo/vector-icons (Ionicons).
```

---

# FASE 7: Implementasi Real-time Updates dan Polish

## Prompt AI untuk Fase 7

```
Lanjutkan proyek React Native Expo "Dompet Teratai". Sekarang implementasi WebSocket untuk real-time updates dan polish aplikasi.

1. IMPLEMENTASI WEBSOCKET:
   - Buat context: src/contexts/SocketContext.tsx
   - Connect ke backend menggunakan socket.io-client
   - URL: [BACKEND_URL] (tanpa /api)
   - Events yang harus di-handle:
     - expense:created -> refresh data
     - expense:updated -> refresh data
     - expense:deleted -> refresh data
     - category:created -> refresh categories
     - category:updated -> refresh categories
     - category:deleted -> refresh categories
   - Emit user_id saat connect untuk room
   - Handle disconnect dan reconnect

2. BUAT CUSTOM HOOKS:
   - src/hooks/useSocketEvent.ts:
     ```typescript
     export function useSocketEvent(event: string, callback: () => void) {
       const socket = useSocket();
       useEffect(() => {
         if (!socket) return;
         socket.on(event, callback);
         return () => socket.off(event, callback);
       }, [socket, event, callback]);
     }
     ```

3. IMPLEMENTASI TRANSACTION DETAIL MODAL:
   - Komponen: src/components/transactions/TransactionDetailModal.tsx
   - Full screen modal dengan:
     - Header dengan close button
     - Receipt image (full width, zoomable) jika ada
     - PDF preview jika attachment_type === 'pdf'
     - Detail info:
       - Deskripsi
       - Jumlah (large, prominent)
       - Kategori dengan color badge
       - Tanggal dan waktu
       - AI processed badge jika ai_processed = true
     - Actions:
       - Download receipt (icon: download-outline)
       - Delete (icon: trash-outline)

4. IMPLEMENTASI SKELETON LOADERS:
   - Komponen: src/components/ui/Skeleton.tsx
   - Animated placeholder saat loading
   - Variasi: text, card, avatar, chart
   - Gunakan di Dashboard dan Transactions

5. IMPLEMENTASI EMPTY STATES:
   - Komponen: src/components/ui/EmptyState.tsx
   - Props: icon, title, description, actionText, onAction
   - Gunakan untuk:
     - No transactions
     - No categories
     - No reports data

6. IMPLEMENTASI PULL TO REFRESH:
   - Semua screen dengan data harus support pull-to-refresh
   - Gunakan RefreshControl dari react-native
   - State: refreshing

7. IMPLEMENTASI ERROR HANDLING:
   - Global error boundary
   - Network error handling dengan retry
   - Toast untuk semua error messages

8. ANIMASI DAN POLISH:
   - Gunakan react-native-reanimated untuk:
     - Page transitions
     - List item animations (stagger)
     - Button press effects
     - Modal animations
   - Haptic feedback menggunakan expo-haptics

9. PERFORMANCE OPTIMIZATION:
   - Gunakan memo dan useCallback
   - FlatList dengan proper keyExtractor
   - Image caching dengan expo-image
   - Lazy loading untuk screens

10. TESTING DI EXPO GO:
    - Setup untuk testing di device fisik
    - Handle deep linking untuk OAuth callback
    - Test semua fitur

JANGAN gunakan emoji. Semua icon dari @expo/vector-icons.
```

---

# FASE 8: Testing, Build, dan Deployment

## Prompt AI untuk Fase 8

```
Proyek React Native Expo "Dompet Teratai" sudah selesai. Sekarang saya ingin testing dan build untuk production.

1. TESTING CHECKLIST:
   - [ ] Login dengan Google OAuth berfungsi
   - [ ] Demo mode berfungsi
   - [ ] Onboarding flow lengkap
   - [ ] Complete profile form validation
   - [ ] Dashboard menampilkan data dengan benar
   - [ ] Budget progress calculation benar
   - [ ] Chart 7 hari menampilkan data
   - [ ] Recent transactions menampilkan 5 terbaru
   - [ ] Transactions list dengan filter berfungsi
   - [ ] Transaction detail modal berfungsi
   - [ ] Delete transaction berfungsi
   - [ ] Reports chart menampilkan data
   - [ ] Export PDF berfungsi
   - [ ] Export Excel berfungsi
   - [ ] Settings profile update berfungsi
   - [ ] Categories CRUD berfungsi
   - [ ] Dark mode toggle berfungsi
   - [ ] Logout berfungsi
   - [ ] Delete account berfungsi
   - [ ] Upload foto dari kamera berfungsi
   - [ ] Upload foto dari galeri berfungsi
   - [ ] Upload PDF berfungsi
   - [ ] AI analysis menampilkan hasil
   - [ ] Save AI result ke database berfungsi
   - [ ] Manual input expense berfungsi
   - [ ] Real-time update via WebSocket berfungsi
   - [ ] Pull to refresh berfungsi di semua screen
   - [ ] Error handling dan Toast berfungsi
   - [ ] Dark mode styling konsisten
   - [ ] Performance smooth (no lag)
   
   TABLET RESPONSIVE TESTING:
   - [ ] Phone Portrait: Bottom tab navigation tampil
   - [ ] Phone Landscape: Bottom tab navigation tetap tampil
   - [ ] Tablet Portrait: Bottom tab navigation (mobile mode)
   - [ ] Tablet Landscape: Sidebar navigation (desktop mode)
   - [ ] Rotasi tablet: Layout berubah smooth tanpa crash
   - [ ] Dashboard tablet landscape: Grid 2-3 kolom
   - [ ] Transactions tablet landscape: Split view
   - [ ] Reports tablet landscape: Charts side-by-side
   - [ ] Settings tablet landscape: Two-column layout
   - [ ] Modal tablet landscape: Centered popup (bukan full screen)

2. KONFIGURASI BUILD:
   - Update app.json dengan:
     ```json
     {
       "expo": {
         "name": "Dompet Teratai",
         "slug": "dompet-teratai",
         "version": "1.0.0",
         "orientation": "default",
         "icon": "./assets/icon.png",
         "splash": {
           "image": "./assets/splash.png",
           "resizeMode": "contain",
           "backgroundColor": "#43A047"
         },
         "android": {
           "adaptiveIcon": {
             "foregroundImage": "./assets/adaptive-icon.png",
             "backgroundColor": "#43A047"
           },
           "package": "com.dompetteratai.app",
           "permissions": [
             "CAMERA",
             "READ_EXTERNAL_STORAGE",
             "WRITE_EXTERNAL_STORAGE"
           ]
         },
         "plugins": [
           "expo-camera",
           "expo-image-picker",
           "expo-document-picker"
         ]
       }
     }
     ```

3. BUILD APK UNTUK TESTING:
   - Command: eas build -p android --profile preview
   - Atau untuk local: npx expo run:android

4. BUILD AAB UNTUK PLAY STORE:
   - Setup EAS Build: eas build:configure
   - Build: eas build -p android --profile production
   - Sign dengan keystore

5. ASSETS YANG DIBUTUHKAN:
   - icon.png (1024x1024)
   - adaptive-icon.png (1024x1024)
   - splash.png (1284x2778)
   - Semua dengan background #43A047

6. PLAY STORE SUBMISSION:
   - Buat akun Google Play Developer ($25 one-time)
   - Siapkan:
     - App title: Dompet Teratai
     - Short description (80 char)
     - Full description (4000 char)
     - Screenshots (min 2 phone screenshots)
     - Feature graphic (1024x500)
     - Privacy policy URL
     - App category: Finance
   - Upload AAB
   - Submit for review

7. POST-LAUNCH:
   - Setup Firebase Crashlytics untuk monitoring
   - Setup analytics
   - Plan for updates

Berikan saya step-by-step commands dan checklist untuk setiap tahap.
```

---

# Catatan Penting

## Perbedaan dengan Web Version

| Aspek | Web | Mobile |
|-------|-----|--------|
| Storage | localStorage | AsyncStorage + SecureStore |
| Navigation | React Router | Expo Router / React Navigation |
| Styling | CSS files | StyleSheet.create() |
| Icons | lucide-react | @expo/vector-icons |
| Charts | recharts | react-native-chart-kit |
| File handling | File API | expo-image-picker, expo-document-picker |
| OAuth | Redirect | expo-auth-session |

## Library Substitutions

| Web Library | Mobile Alternative |
|-------------|-------------------|
| lucide-react | @expo/vector-icons (Ionicons) |
| recharts | react-native-chart-kit / victory-native |
| date-fns | date-fns (sama) |
| socket.io-client | socket.io-client (sama) |
| React Router | Expo Router |

## Icon Mapping (lucide-react to Ionicons)

| Lucide Icon | Ionicons Equivalent |
|-------------|---------------------|
| Wallet | wallet-outline |
| ShoppingBag | cart-outline |
| Tag | pricetag-outline |
| TrendingUp | trending-up-outline |
| Target | flag-outline |
| Calendar | calendar-outline |
| BarChart3 | bar-chart-outline |
| Clock | time-outline |
| Sun | sunny-outline |
| Moon | moon-outline |
| Camera | camera-outline |
| Image | images-outline |
| FileText | document-text-outline |
| Filter | filter-outline |
| Trash2 | trash-outline |
| ChevronRight | chevron-forward-outline |
| X | close-outline |
| Plus | add-outline |
| Settings | settings-outline |
| LogOut | log-out-outline |
| Download | download-outline |
| Share | share-outline |

---

## Estimasi Waktu per Fase

| Fase | Deskripsi | Estimasi |
|------|-----------|----------|
| 1 | Setup Proyek | 2-3 hari |
| 2 | API Client & Contexts | 2-3 hari |
| 3 | Auth Flow | 3-4 hari |
| 4 | Dashboard & Transactions | 5-7 hari |
| 5 | Reports & Settings | 4-5 hari |
| 6 | Upload & AI Analysis | 4-5 hari |
| 7 | Real-time & Polish | 3-4 hari |
| 8 | Testing & Deployment | 3-4 hari |
| **Total** | | **26-35 hari** |

---

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Expo Router](https://expo.github.io/router/docs/)
- [@expo/vector-icons Directory](https://icons.expo.fyi/)
- [React Native Chart Kit](https://github.com/indiespirit/react-native-chart-kit)
- [EAS Build](https://docs.expo.dev/build/introduction/)
