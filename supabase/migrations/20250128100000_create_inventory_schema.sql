-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
CREATE TABLE IF NOT EXISTS public.streets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    street_id UUID REFERENCES public.streets(id),
    name TEXT NOT NULL,
    needs_recount BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    type TEXT,
    min_stock INTEGER DEFAULT 0,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id TEXT NOT NULL,
    material_id UUID REFERENCES public.materials(id),
    material_name TEXT,
    description TEXT,
    quantity INTEGER DEFAULT 0,
    type TEXT,
    entry_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "user" TEXT,
    type TEXT,
    material_type TEXT,
    material_name TEXT,
    quantity INTEGER,
    location_name TEXT,
    street_name TEXT,
    image TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.equipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    model TEXT,
    image TEXT,
    status TEXT DEFAULT 'available',
    operator TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    system_name TEXT DEFAULT 'Depósito de Fardamento',
    low_stock_threshold INTEGER DEFAULT 10,
    high_occupancy_threshold INTEGER DEFAULT 80,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    name TEXT,
    email TEXT,
    role TEXT DEFAULT 'VIEWER',
    preferences JSONB DEFAULT '{"lowStockAlerts": true, "movementAlerts": true, "emailNotifications": false}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.oms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.guias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    om_id UUID REFERENCES public.oms(id),
    title TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ballistic_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    serial_number TEXT,
    identification TEXT,
    model TEXT,
    om_id UUID,
    notes TEXT,
    image TEXT,
    expiration_date TIMESTAMP WITH TIME ZONE,
    manufacturing_date TIMESTAMP WITH TIME ZONE,
    history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.streets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ballistic_items ENABLE ROW LEVEL SECURITY;

-- Create policies (Allow all for authenticated users)
DO $$
BEGIN
    EXECUTE 'CREATE POLICY "Allow all for authenticated" ON public.streets FOR ALL USING (auth.role() = ''authenticated'');';
    EXECUTE 'CREATE POLICY "Allow all for authenticated" ON public.locations FOR ALL USING (auth.role() = ''authenticated'');';
    EXECUTE 'CREATE POLICY "Allow all for authenticated" ON public.materials FOR ALL USING (auth.role() = ''authenticated'');';
    EXECUTE 'CREATE POLICY "Allow all for authenticated" ON public.pallets FOR ALL USING (auth.role() = ''authenticated'');';
    EXECUTE 'CREATE POLICY "Allow all for authenticated" ON public.history FOR ALL USING (auth.role() = ''authenticated'');';
    EXECUTE 'CREATE POLICY "Allow all for authenticated" ON public.equipments FOR ALL USING (auth.role() = ''authenticated'');';
    EXECUTE 'CREATE POLICY "Allow all for authenticated" ON public.settings FOR ALL USING (auth.role() = ''authenticated'');';
    EXECUTE 'CREATE POLICY "Allow all for authenticated" ON public.users FOR ALL USING (auth.role() = ''authenticated'');';
    EXECUTE 'CREATE POLICY "Allow all for authenticated" ON public.oms FOR ALL USING (auth.role() = ''authenticated'');';
    EXECUTE 'CREATE POLICY "Allow all for authenticated" ON public.guias FOR ALL USING (auth.role() = ''authenticated'');';
    EXECUTE 'CREATE POLICY "Allow all for authenticated" ON public.ballistic_items FOR ALL USING (auth.role() = ''authenticated'');';
EXCEPTION
    WHEN duplicate_object THEN NULL;
END
$$;

-- Trigger for users sync
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'name', 'Novo Usuário'), new.email, 'VIEWER');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
