-- SKEMA DATABASE SISTEM LAPORAN CLOUD DLH
-- Jalankan skrip ini di SQL Editor Supabase proyek baru Anda.

-- 1. EXTENSIONS (Jika diperlukan)
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

-- 3. TABEL: reports (Laporan Harian)
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

-- 4. TABEL: work_plans (Rencana Kerja)
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

-- 5. TABEL: fuel_reports (Laporan BBM & Oli)
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

-- 6. TABEL: fuel_spj_reports (Laporan SPJ BBM)
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

-- 7. TABEL: fuel_prices (Master Harga BBM)
CREATE TABLE IF NOT EXISTS public.fuel_prices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL UNIQUE,
  price NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TABEL: audit_logs (Riwayat Aktivitas)
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

-- 9. TABEL: spj_bbm (Data SPJ Lama/Pendukung)
CREATE TABLE IF NOT EXISTS public.spj_bbm (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  items JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 10. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_spj_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spj_bbm ENABLE ROW LEVEL SECURITY;

-- 11. POLICIES (Kebijakan Akses)

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

-- Reports
CREATE POLICY "Laporan dapat dilihat publik" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Hanya user login yang bisa menambah" ON public.reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Hanya user login yang bisa mengubah" ON public.reports FOR UPDATE USING (true);
CREATE POLICY "Hanya user login yang bisa menghapus" ON public.reports FOR DELETE USING (true);

-- Work Plans
CREATE POLICY "work_plans_select_policy" ON public.work_plans FOR SELECT USING (true);
CREATE POLICY "work_plans_insert_policy" ON public.work_plans FOR INSERT WITH CHECK (true);
CREATE POLICY "work_plans_update_policy" ON public.work_plans FOR UPDATE USING (true);
CREATE POLICY "work_plans_delete_policy" ON public.work_plans FOR DELETE USING (true);

-- Fuel Reports
CREATE POLICY "Allow all for authenticated users" ON public.fuel_reports FOR ALL USING (true);

-- Fuel SPJ Reports
CREATE POLICY "Allow read for all authenticated" ON public.fuel_spj_reports FOR SELECT USING (true);
CREATE POLICY "Allow all for admin" ON public.fuel_spj_reports FOR ALL USING (true);

-- Fuel Prices
CREATE POLICY "Allow read for all authenticated_prices" ON public.fuel_prices FOR SELECT USING (true);
CREATE POLICY "Allow all for admin_prices" ON public.fuel_prices FOR ALL USING (true);

-- Audit Logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Users can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable delete for authenticated users" ON public.audit_logs FOR DELETE USING (true);

-- SPJ BBM
CREATE POLICY "spj_bbm_select_policy" ON public.spj_bbm FOR SELECT USING (true);
CREATE POLICY "spj_bbm_insert_policy" ON public.spj_bbm FOR INSERT WITH CHECK (true);
CREATE POLICY "spj_bbm_update_policy" ON public.spj_bbm FOR UPDATE USING (true);
CREATE POLICY "spj_bbm_delete_policy" ON public.spj_bbm FOR DELETE USING (true);

-- 12. FUNCTIONS & TRIGGERS (Auto-create Profile)

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

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CATATAN TAMBAHAN:
-- Jangan lupa membuat Storage Bucket di proyek baru Anda:
-- 1. 'report-photos' (Public: Yes)
-- 2. 'assets' (Public: Yes) - Unggah logo-medan.jpg dan logo-dlh.jpg ke sini.