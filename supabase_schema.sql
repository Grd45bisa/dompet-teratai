-- ============================================================-- DOMPET TERATAI / EXPENSE TRACKER - SUPABASE DATABASE SCHEMA
-- ============================================================
-- Cara pakai:
-- 1. Buka Supabase Dashboard > SQL Editor.
-- 2. Copy semua isi file ini.
-- 3. Klik Run.
--
-- Catatan:
-- - Backend memakai SUPABASE_SERVICE_KEY, jadi policy dibuat permisif untuk kebutuhan backend.
-- - File gambar/PDF saat ini disimpan sebagai base64 di kolom receipt_url / attachment_data.
-- ============================================================

-- ============================================================
-- 0. EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. TABLE: users
-- ============================================================

CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    business_type TEXT,
    occupation TEXT,
    monthly_budget NUMERIC(15, 2) NOT NULL DEFAULT 0,
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    dark_mode BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS occupation TEXT,
    ADD COLUMN IF NOT EXISTS monthly_budget NUMERIC(15, 2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS dark_mode BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

COMMENT ON TABLE public.users IS 'User aplikasi dari Google OAuth';
COMMENT ON COLUMN public.users.id IS 'Google user id / sub claim';
COMMENT ON COLUMN public.users.monthly_budget IS 'Budget bulanan user dalam Rupiah';

-- ============================================================
-- 2. TABLE: categories
-- ============================================================

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#43A047',
    icon TEXT,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.categories
    ADD COLUMN IF NOT EXISTS icon TEXT,
    ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_is_default ON public.categories(is_default);
CREATE INDEX IF NOT EXISTS idx_categories_name ON public.categories(name);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_default_categories_name
    ON public.categories(LOWER(name))
    WHERE user_id IS NULL AND is_default = TRUE;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_user_categories_name
    ON public.categories(user_id, LOWER(name))
    WHERE user_id IS NOT NULL;

COMMENT ON TABLE public.categories IS 'Kategori pengeluaran default sistem dan custom user';

-- ============================================================
-- 3. TABLE: expenses
-- ============================================================

CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    description TEXT,
    expense_date DATE NOT NULL,
    receipt_url TEXT,
    attachment_type TEXT CHECK (attachment_type IS NULL OR attachment_type IN ('image', 'pdf')),
    attachment_data TEXT,
    ai_processed BOOLEAN NOT NULL DEFAULT FALSE,
    ai_raw_response JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.expenses
    ADD COLUMN IF NOT EXISTS receipt_url TEXT,
    ADD COLUMN IF NOT EXISTS attachment_type TEXT,
    ADD COLUMN IF NOT EXISTS attachment_data TEXT,
    ADD COLUMN IF NOT EXISTS ai_processed BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS ai_raw_response JSONB,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'expenses_attachment_type_check'
    ) THEN
        ALTER TABLE public.expenses
            ADD CONSTRAINT expenses_attachment_type_check
            CHECK (attachment_type IS NULL OR attachment_type IN ('image', 'pdf'));
    END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON public.expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON public.expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON public.expenses(user_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON public.expenses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_ai_processed ON public.expenses(ai_processed);

COMMENT ON TABLE public.expenses IS 'Data transaksi pengeluaran user';

-- ============================================================
-- 4. TRIGGERS: updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_expenses_updated_at ON public.expenses;
CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 5. DEFAULT CATEGORIES
-- ============================================================

INSERT INTO public.categories (user_id, name, color, icon, is_default)
VALUES
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
-- 6. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_service_role_all" ON public.users;
CREATE POLICY "users_service_role_all" ON public.users
    FOR ALL
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "categories_select_all" ON public.categories;
CREATE POLICY "categories_select_all" ON public.categories
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "categories_insert_all" ON public.categories;
CREATE POLICY "categories_insert_all" ON public.categories
    FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "categories_update_custom" ON public.categories;
CREATE POLICY "categories_update_custom" ON public.categories
    FOR UPDATE
    USING (is_default = FALSE)
    WITH CHECK (is_default = FALSE);

DROP POLICY IF EXISTS "categories_delete_custom" ON public.categories;
CREATE POLICY "categories_delete_custom" ON public.categories
    FOR DELETE
    USING (is_default = FALSE);

DROP POLICY IF EXISTS "expenses_service_role_all" ON public.expenses;
CREATE POLICY "expenses_service_role_all" ON public.expenses
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================================
-- 7. VIEWS
-- ============================================================

CREATE OR REPLACE VIEW public.v_expenses_by_category AS
SELECT
    e.user_id,
    c.id AS category_id,
    COALESCE(c.name, 'Tanpa Kategori') AS category_name,
    COALESCE(c.color, '#757575') AS category_color,
    COUNT(e.id) AS total_transactions,
    COALESCE(SUM(e.amount), 0) AS total_amount
FROM public.expenses e
LEFT JOIN public.categories c ON e.category_id = c.id
GROUP BY e.user_id, c.id, c.name, c.color;

CREATE OR REPLACE VIEW public.v_monthly_summary AS
SELECT
    user_id,
    DATE_TRUNC('month', expense_date)::DATE AS month,
    COUNT(id) AS total_transactions,
    COALESCE(SUM(amount), 0) AS total_amount,
    COALESCE(AVG(amount), 0) AS avg_amount
FROM public.expenses
GROUP BY user_id, DATE_TRUNC('month', expense_date)
ORDER BY month DESC;

CREATE OR REPLACE VIEW public.v_daily_summary AS
SELECT
    user_id,
    expense_date,
    COUNT(id) AS total_transactions,
    COALESCE(SUM(amount), 0) AS total_amount
FROM public.expenses
GROUP BY user_id, expense_date
ORDER BY expense_date DESC;

-- ============================================================
-- 8. HELPER FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_monthly_spending(
    p_user_id TEXT,
    p_month DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_spending NUMERIC,
    transaction_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM(e.amount), 0)::NUMERIC AS total_spending,
        COUNT(e.id)::BIGINT AS transaction_count
    FROM public.expenses e
    WHERE e.user_id = p_user_id
      AND DATE_TRUNC('month', e.expense_date) = DATE_TRUNC('month', p_month);
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION public.get_daily_spending(
    p_user_id TEXT,
    p_days INT DEFAULT 30
)
RETURNS TABLE (
    date DATE,
    total NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.expense_date AS date,
        COALESCE(SUM(e.amount), 0)::NUMERIC AS total
    FROM public.expenses e
    WHERE e.user_id = p_user_id
      AND e.expense_date >= CURRENT_DATE - p_days
    GROUP BY e.expense_date
    ORDER BY e.expense_date;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION public.get_category_spending(
    p_user_id TEXT,
    p_from DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE)::DATE,
    p_to DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    category_id UUID,
    category_name TEXT,
    category_color TEXT,
    total_transactions BIGINT,
    total_amount NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id AS category_id,
        COALESCE(c.name, 'Tanpa Kategori') AS category_name,
        COALESCE(c.color, '#757575') AS category_color,
        COUNT(e.id)::BIGINT AS total_transactions,
        COALESCE(SUM(e.amount), 0)::NUMERIC AS total_amount
    FROM public.expenses e
    LEFT JOIN public.categories c ON e.category_id = c.id
    WHERE e.user_id = p_user_id
      AND e.expense_date BETWEEN p_from AND p_to
    GROUP BY c.id, c.name, c.color
    ORDER BY total_amount DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================
-- 9. OPTIONAL STORAGE BUCKET
-- ============================================================
-- Saat ini aplikasi menyimpan attachment sebagai base64 di database.
-- Jika nanti mau pindah ke Supabase Storage, bucket ini bisa dipakai.

INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "receipts_public_read" ON storage.objects;
CREATE POLICY "receipts_public_read" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'receipts');

DROP POLICY IF EXISTS "receipts_service_insert" ON storage.objects;
CREATE POLICY "receipts_service_insert" ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'receipts');

DROP POLICY IF EXISTS "receipts_service_update" ON storage.objects;
CREATE POLICY "receipts_service_update" ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'receipts')
    WITH CHECK (bucket_id = 'receipts');

DROP POLICY IF EXISTS "receipts_service_delete" ON storage.objects;
CREATE POLICY "receipts_service_delete" ON storage.objects
    FOR DELETE
    USING (bucket_id = 'receipts');

-- ============================================================
-- 10. QUICK CHECKS
-- ============================================================
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- SELECT * FROM public.categories WHERE is_default = TRUE ORDER BY name;
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';
-- ============================================================

-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
--
-- Untuk mengecek kategori default:
-- SELECT * FROM public.categories WHERE is_default = true;
--
-- ============================================================
