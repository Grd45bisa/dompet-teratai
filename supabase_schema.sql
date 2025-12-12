-- ============================================================
-- EXPENSE TRACKER UMKM - Supabase Database Schema
-- ============================================================
-- Jalankan script ini di Supabase SQL Editor
-- Pastikan Anda menjalankannya secara berurutan

-- ============================================================
-- 1. TABLE: users
-- Menyimpan data user dari Google OAuth
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,                          -- Google User ID (sub dari JWT)
    email TEXT UNIQUE NOT NULL,                   -- Email dari Google
    full_name TEXT,                               -- Nama lengkap
    avatar_url TEXT,                              -- URL foto profil dari Google
    business_type TEXT,                           -- Jenis usaha (umkm, usaha_kecil, pribadi, lainnya)
    onboarding_completed BOOLEAN DEFAULT FALSE,   -- Status onboarding
    dark_mode BOOLEAN DEFAULT FALSE,              -- Preferensi tema
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk pencarian cepat berdasarkan email
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- ============================================================
-- 2. TABLE: categories
-- Kategori pengeluaran (default + custom per user)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,  -- NULL untuk kategori default
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#43A047',        -- Warna hex untuk UI
    is_default BOOLEAN DEFAULT FALSE,             -- True = kategori sistem, tersedia untuk semua user
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk query kategori per user
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);

-- ============================================================
-- 3. TABLE: expenses
-- Data pengeluaran/transaksi
-- ============================================================
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    amount DECIMAL(15, 2) NOT NULL,               -- Jumlah dalam Rupiah
    description TEXT,                              -- Catatan/deskripsi
    expense_date DATE NOT NULL,                   -- Tanggal pengeluaran
    receipt_url TEXT,                             -- URL struk (opsional, dari Supabase Storage)
    ai_processed BOOLEAN DEFAULT FALSE,           -- Flag untuk AI processing
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes untuk query yang sering digunakan
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON public.expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON public.expenses(user_id, expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON public.expenses(category_id);

-- ============================================================
-- 4. FUNCTION: Auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger untuk users
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger untuk expenses
DROP TRIGGER IF EXISTS update_expenses_updated_at ON public.expenses;
CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 5. INSERT: Default Categories
-- Kategori default yang tersedia untuk semua user
-- ============================================================
INSERT INTO public.categories (user_id, name, color, is_default) VALUES
    (NULL, 'Makanan & Minuman', '#E91E63', TRUE),
    (NULL, 'Transportasi', '#2196F3', TRUE),
    (NULL, 'Belanja', '#FF9800', TRUE),
    (NULL, 'Tagihan', '#9C27B0', TRUE),
    (NULL, 'Hiburan', '#00BCD4', TRUE),
    (NULL, 'Kesehatan', '#F44336', TRUE),
    (NULL, 'Pendidikan', '#3F51B5', TRUE),
    (NULL, 'Lainnya', '#757575', TRUE)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- Keamanan data: user hanya bisa akses data sendiri
-- ============================================================

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Policies untuk users (allow all since we use anon key + custom auth)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (true);

-- Policies untuk categories
DROP POLICY IF EXISTS "Anyone can view default categories" ON public.categories;
CREATE POLICY "Anyone can view default categories" ON public.categories
    FOR SELECT USING (is_default = true OR user_id IS NOT NULL);

DROP POLICY IF EXISTS "Users can insert own categories" ON public.categories;
CREATE POLICY "Users can insert own categories" ON public.categories
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own categories" ON public.categories;
CREATE POLICY "Users can update own categories" ON public.categories
    FOR UPDATE USING (is_default = false);

DROP POLICY IF EXISTS "Users can delete own categories" ON public.categories;
CREATE POLICY "Users can delete own categories" ON public.categories
    FOR DELETE USING (is_default = false);

-- Policies untuk expenses
DROP POLICY IF EXISTS "Users can view own expenses" ON public.expenses;
CREATE POLICY "Users can view own expenses" ON public.expenses
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own expenses" ON public.expenses;
CREATE POLICY "Users can insert own expenses" ON public.expenses
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own expenses" ON public.expenses;
CREATE POLICY "Users can update own expenses" ON public.expenses
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can delete own expenses" ON public.expenses;
CREATE POLICY "Users can delete own expenses" ON public.expenses
    FOR DELETE USING (true);

-- ============================================================
-- 7. STORAGE BUCKET: receipts
-- Untuk menyimpan foto struk (jalankan di Supabase Dashboard)
-- ============================================================
-- CATATAN: Buat bucket ini di Supabase Dashboard > Storage
-- Nama bucket: receipts
-- Public: false
-- Allowed MIME types: image/*

-- ============================================================
-- SELESAI! Database schema siap digunakan
-- ============================================================

-- Untuk mengecek tabel sudah dibuat:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
