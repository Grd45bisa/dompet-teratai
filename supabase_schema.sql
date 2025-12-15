-- ============================================================
-- 🌸 DOMPET TERATAI - Database Schema untuk Supabase
-- ============================================================
-- Aplikasi Pencatat Pengeluaran Harian dengan AI
-- 
-- 📋 Cara Penggunaan:
-- 1. Buka Supabase Dashboard > SQL Editor
-- 2. Copy-paste seluruh isi file ini
-- 3. Klik "Run" untuk menjalankan
-- 4. Buat Storage Bucket "receipts" (lihat bagian 7)
-- ============================================================

-- ============================================================
-- 1. TABLE: users
-- ============================================================
-- Menyimpan data user dari Google OAuth

CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,                          -- Google User ID (sub dari JWT)
    email TEXT UNIQUE NOT NULL,                   -- Email dari Google
    full_name TEXT,                               -- Nama lengkap
    avatar_url TEXT,                              -- URL foto profil (Google/DiceBear)
    business_type TEXT,                           -- Pekerjaan user
    monthly_budget DECIMAL(15, 2) DEFAULT 0,      -- Budget bulanan dalam Rupiah
    onboarding_completed BOOLEAN DEFAULT FALSE,   -- Status onboarding
    dark_mode BOOLEAN DEFAULT FALSE,              -- Preferensi tema
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk pencarian cepat berdasarkan email
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

COMMENT ON TABLE public.users IS 'Tabel user dari Google OAuth';
COMMENT ON COLUMN public.users.id IS 'Google User ID (sub claim dari JWT)';
COMMENT ON COLUMN public.users.monthly_budget IS 'Target budget bulanan dalam Rupiah';

-- ============================================================
-- 2. TABLE: categories
-- ============================================================
-- Kategori pengeluaran (default sistem + custom per user)

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,  -- NULL = kategori default
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#43A047',        -- Warna hex untuk UI
    icon TEXT,                                    -- Nama icon (opsional)
    is_default BOOLEAN DEFAULT FALSE,             -- TRUE = kategori sistem
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk query kategori per user
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_is_default ON public.categories(is_default);

COMMENT ON TABLE public.categories IS 'Kategori pengeluaran (default + custom)';

-- ============================================================
-- 3. TABLE: expenses
-- ============================================================
-- Data pengeluaran/transaksi

CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),  -- Jumlah dalam Rupiah
    description TEXT,                              -- Catatan/deskripsi
    expense_date DATE NOT NULL,                    -- Tanggal pengeluaran
    receipt_url TEXT,                              -- Base64 gambar struk
    attachment_type TEXT,                          -- Tipe attachment: 'image' | 'pdf'
    attachment_data TEXT,                          -- Base64 data PDF
    ai_processed BOOLEAN DEFAULT FALSE,            -- Flag: diproses oleh AI
    ai_raw_response JSONB,                         -- Response mentah dari AI (opsional)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes untuk query yang sering digunakan
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON public.expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON public.expenses(user_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON public.expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON public.expenses(created_at DESC);

COMMENT ON TABLE public.expenses IS 'Data pengeluaran/transaksi user';

-- ============================================================
-- 4. FUNCTION & TRIGGER: Auto-update updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

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
-- ============================================================
-- Kategori default yang tersedia untuk semua user
-- Menggunakan warna yang eye-catching

INSERT INTO public.categories (user_id, name, color, icon, is_default) VALUES
    (NULL, 'Makanan & Minuman', '#E91E63', 'utensils', TRUE),
    (NULL, 'Transportasi', '#2196F3', 'car', TRUE),
    (NULL, 'Belanja', '#FF9800', 'shopping-bag', TRUE),
    (NULL, 'Tagihan', '#9C27B0', 'file-text', TRUE),
    (NULL, 'Hiburan', '#00BCD4', 'gamepad-2', TRUE),
    (NULL, 'Kesehatan', '#F44336', 'heart-pulse', TRUE),
    (NULL, 'Pendidikan', '#3F51B5', 'graduation-cap', TRUE),
    (NULL, 'Rumah Tangga', '#795548', 'home', TRUE),
    (NULL, 'Investasi', '#4CAF50', 'trending-up', TRUE),
    (NULL, 'Lainnya', '#757575', 'more-horizontal', TRUE)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================================
-- Keamanan data menggunakan Service Role Key di backend

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- ========== Policies untuk USERS ==========
DROP POLICY IF EXISTS "Enable all for service role" ON public.users;
CREATE POLICY "Enable all for service role" ON public.users
    FOR ALL USING (true) WITH CHECK (true);

-- ========== Policies untuk CATEGORIES ==========
DROP POLICY IF EXISTS "Enable read for all" ON public.categories;
CREATE POLICY "Enable read for all" ON public.categories
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated" ON public.categories;
CREATE POLICY "Enable insert for authenticated" ON public.categories
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update own categories" ON public.categories;
CREATE POLICY "Enable update own categories" ON public.categories
    FOR UPDATE USING (is_default = false);

DROP POLICY IF EXISTS "Enable delete own categories" ON public.categories;
CREATE POLICY "Enable delete own categories" ON public.categories
    FOR DELETE USING (is_default = false);

-- ========== Policies untuk EXPENSES ==========
DROP POLICY IF EXISTS "Enable all for service role" ON public.expenses;
CREATE POLICY "Enable all for service role" ON public.expenses
    FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 7. STORAGE BUCKET: receipts
-- ============================================================
-- ⚠️ PENTING: Buat bucket ini MANUAL di Supabase Dashboard!
-- 
-- Langkah-langkah:
-- 1. Buka Supabase Dashboard > Storage
-- 2. Klik "New Bucket"
-- 3. Nama bucket: receipts
-- 4. Public: TRUE (agar gambar bisa diakses)
-- 5. MIME Types: image/jpeg, image/png, image/webp
-- 6. Max file size: 5MB

-- Storage policies (jalankan di SQL Editor setelah bucket dibuat)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', true);

-- ============================================================
-- 8. VIEWS: Untuk Reporting
-- ============================================================

-- View: Total expenses per kategori
CREATE OR REPLACE VIEW public.v_expenses_by_category AS
SELECT 
    e.user_id,
    c.id AS category_id,
    c.name AS category_name,
    c.color AS category_color,
    COUNT(*) AS total_transactions,
    SUM(e.amount) AS total_amount
FROM public.expenses e
LEFT JOIN public.categories c ON e.category_id = c.id
GROUP BY e.user_id, c.id, c.name, c.color;

-- View: Monthly summary
CREATE OR REPLACE VIEW public.v_monthly_summary AS
SELECT 
    user_id,
    DATE_TRUNC('month', expense_date) AS month,
    COUNT(*) AS total_transactions,
    SUM(amount) AS total_amount,
    AVG(amount) AS avg_amount
FROM public.expenses
GROUP BY user_id, DATE_TRUNC('month', expense_date)
ORDER BY month DESC;

-- ============================================================
-- 9. FUNCTIONS: Helper Functions
-- ============================================================

-- Function: Get user's monthly spending
CREATE OR REPLACE FUNCTION get_monthly_spending(p_user_id TEXT, p_month DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
    total_spending DECIMAL,
    transaction_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(amount), 0)::DECIMAL AS total_spending,
        COUNT(*)::BIGINT AS transaction_count
    FROM public.expenses
    WHERE user_id = p_user_id
    AND DATE_TRUNC('month', expense_date) = DATE_TRUNC('month', p_month);
END;
$$ LANGUAGE plpgsql;

-- Function: Get daily spending for chart
CREATE OR REPLACE FUNCTION get_daily_spending(p_user_id TEXT, p_days INT DEFAULT 30)
RETURNS TABLE (
    date DATE,
    total DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        expense_date AS date,
        SUM(amount) AS total
    FROM public.expenses
    WHERE user_id = p_user_id
    AND expense_date >= CURRENT_DATE - p_days
    GROUP BY expense_date
    ORDER BY expense_date;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- ✅ SELESAI! Database schema siap digunakan
-- ============================================================
-- 
-- Untuk mengecek tabel sudah dibuat:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
--
-- Untuk mengecek kategori default:
-- SELECT * FROM public.categories WHERE is_default = true;
--
-- ============================================================
