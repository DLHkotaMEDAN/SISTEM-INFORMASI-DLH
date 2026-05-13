-- SKEMA DATABASE SISTEM LAPORAN CLOUD DLH (VERSI AMAN)
-- Jalankan skrip ini di SQL Editor Supabase proyek baru Anda.

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABEL: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'user',
  category TEXT,
  username TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- 3. TABEL: reports
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  location JSONB,
  tasks JSONB,
  photos JSONB,
  volume INTEGER DEFAULT 0,
  unit TEXT,
  equipment JSONB DEFAULT '[]'::jsonb,
  heavyEquipment JSONB DEFAULT '[]'::jsonb,
  fuel JSONB,
  personnel JSONB,
  remarks TEXT,
  syncStatus TEXT DEFAULT 'synced',
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  vehicle TEXT,
  deleted_at TIMESTAMP WITH TIME ZONE,
  pimpinan_note TEXT
);

-- 4. TABEL: work_plans
CREATE TABLE IF NOT EXISTS public.work_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  items JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_visible BOOLEAN DEFAULT true,
  deleted_at TIMESTAMP WITH TIME ZONE,
  pimpinan_note TEXT
);

-- 5. TABEL: fuel_reports
CREATE TABLE IF NOT EXISTS public.fuel_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  region TEXT NOT NULL,
  team TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  pimpinan_note TEXT,
  price_pertamax NUMERIC DEFAULT 0,
  price_dexlite NUMERIC DEFAULT 0
);

-- 6. TABEL: fuel_spj_reports
CREATE TABLE IF NOT EXISTS public.fuel_spj_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE NOT NULL,
  region TEXT NOT NULL,
  entries JSONB NOT NULL,
  remarks TEXT,
  price_pertamax NUMERIC NOT NULL,
  price_dexlite NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  team TEXT
);

-- 7. TABEL: fuel_prices
CREATE TABLE IF NOT EXISTS public.fuel_prices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL UNIQUE,
  price NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TABEL: audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  username TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_spj_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 10. POLICIES (Hapus jika ada, lalu buat baru)

-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

-- Reports
DROP POLICY IF EXISTS "Laporan dapat dilihat publik" ON public.reports;
DROP POLICY IF EXISTS "Hanya user login yang bisa menambah" ON public.reports;
DROP POLICY IF EXISTS "Hanya user login yang bisa mengubah" ON public.reports;
DROP POLICY IF EXISTS "Hanya user login yang bisa menghapus" ON public.reports;
CREATE POLICY "Laporan dapat dilihat publik" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Hanya user login yang bisa menambah" ON public.reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Hanya user login yang bisa mengubah" ON public.reports FOR UPDATE USING (true);
CREATE POLICY "Hanya user login yang bisa menghapus" ON public.reports FOR DELETE USING (true);

-- Work Plans
DROP POLICY IF EXISTS "work_plans_select_policy" ON public.work_plans;
DROP POLICY IF EXISTS "work_plans_insert_policy" ON public.work_plans;
DROP POLICY IF EXISTS "work_plans_update_policy" ON public.work_plans;
DROP POLICY IF EXISTS "work_plans_delete_policy" ON public.work_plans;
CREATE POLICY "work_plans_select_policy" ON public.work_plans FOR SELECT USING (true);
CREATE POLICY "work_plans_insert_policy" ON public.work_plans FOR INSERT WITH CHECK (true);
CREATE POLICY "work_plans_update_policy" ON public.work_plans FOR UPDATE USING (true);
CREATE POLICY "work_plans_delete_policy" ON public.work_plans FOR DELETE USING (true);

-- Fuel Reports
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.fuel_reports;
CREATE POLICY "Allow all for authenticated users" ON public.fuel_reports FOR ALL USING (true);

-- Fuel SPJ Reports
DROP POLICY IF EXISTS "Allow read for all authenticated" ON public.fuel_spj_reports;
DROP POLICY IF EXISTS "Allow all for admin" ON public.fuel_spj_reports;
CREATE POLICY "Allow read for all authenticated" ON public.fuel_spj_reports FOR SELECT USING (true);
CREATE POLICY "Allow all for admin" ON public.fuel_spj_reports FOR ALL USING (true);

-- Fuel Prices
DROP POLICY IF EXISTS "Allow read for all authenticated_prices" ON public.fuel_prices;
DROP POLICY IF EXISTS "Allow all for admin_prices" ON public.fuel_prices;
CREATE POLICY "Allow read for all authenticated_prices" ON public.fuel_prices FOR SELECT USING (true);
CREATE POLICY "Allow all for admin_prices" ON public.fuel_prices FOR ALL USING (true);

-- Audit Logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can insert audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Users can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- 11. FUNCTIONS & TRIGGERS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, category, username)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'role', 'user'),
    new.raw_user_meta_data ->> 'category',
    new.raw_user_meta_data ->> 'username'
  );
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 12. STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-photos', 'report-photos', true),
       ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

-- 13. STORAGE POLICIES

-- report-photos
DROP POLICY IF EXISTS "Public Read Report Photos" ON storage.objects;
DROP POLICY IF EXISTS "Auth Insert Report Photos" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update Report Photos" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete Report Photos" ON storage.objects;
CREATE POLICY "Public Read Report Photos" ON storage.objects FOR SELECT TO public USING (bucket_id = 'report-photos');
CREATE POLICY "Auth Insert Report Photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'report-photos');
CREATE POLICY "Auth Update Report Photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'report-photos');
CREATE POLICY "Auth Delete Report Photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'report-photos');

-- assets
DROP POLICY IF EXISTS "Public Read Assets" ON storage.objects;
DROP POLICY IF EXISTS "Auth Manage Assets" ON storage.objects;
CREATE POLICY "Public Read Assets" ON storage.objects FOR SELECT TO public USING (bucket_id = 'assets');
CREATE POLICY "Auth Manage Assets" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'assets');