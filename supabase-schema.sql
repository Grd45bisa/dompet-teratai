-- =====================================================
-- EXPENSE TRACKER UMKM - DATABASE SCHEMA
-- Direct Google OAuth (No Supabase Auth)
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- USERS TABLE (replaces auth.users)
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, -- Google User ID
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    business_type TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for now (since no Supabase Auth)
-- You should add API key validation in production
DROP POLICY IF EXISTS "Allow public access to users" ON users;
CREATE POLICY "Allow public access to users"
    ON users FOR ALL
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#43A047',
    icon VARCHAR(50),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Allow public access (validate user_id in app)
DROP POLICY IF EXISTS "Allow public access to categories" ON categories;
CREATE POLICY "Allow public access to categories"
    ON categories FOR ALL
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- EXPENSES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    receipt_url TEXT,
    ai_processed BOOLEAN DEFAULT FALSE,
    extracted_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Allow public access (validate user_id in app)
DROP POLICY IF EXISTS "Allow public access to expenses" ON expenses;
CREATE POLICY "Allow public access to expenses"
    ON expenses FOR ALL
    USING (true)
    WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_expenses_user_date 
    ON expenses(user_id, expense_date DESC);

CREATE INDEX IF NOT EXISTS idx_expenses_category 
    ON expenses(category_id);

-- =====================================================
-- INSERT DEFAULT CATEGORIES
-- =====================================================

INSERT INTO categories (user_id, name, color, icon, is_default)
SELECT NULL, name, color, icon, TRUE
FROM (VALUES
    ('Makanan & Minuman', '#E91E63', 'utensils'),
    ('Transportasi', '#2196F3', 'car'),
    ('Belanja', '#FF9800', 'shopping-bag'),
    ('Tagihan', '#9C27B0', 'file-text'),
    ('Hiburan', '#00BCD4', 'music'),
    ('Kesehatan', '#F44336', 'heart'),
    ('Pendidikan', '#4CAF50', 'book'),
    ('Lainnya', '#757575', 'more-horizontal')
) AS defaults(name, color, icon)
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE is_default = TRUE LIMIT 1);

-- =====================================================
-- STORAGE BUCKET FOR RECEIPTS
-- =====================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to storage
DROP POLICY IF EXISTS "Allow public upload receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow public view receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete receipts" ON storage.objects;

CREATE POLICY "Allow public upload receipts"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Allow public view receipts"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'receipts');

CREATE POLICY "Allow public delete receipts"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'receipts');

-- =====================================================
-- UPDATED_AT TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DONE! ✅
-- =====================================================

SELECT 'Database schema for direct Google OAuth created!' AS status;
