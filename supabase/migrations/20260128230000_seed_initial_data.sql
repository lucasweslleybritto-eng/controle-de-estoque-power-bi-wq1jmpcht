-- Clean up existing data to avoid duplicates/conflicts (optional, handle with care)
-- TRUNCATE public.materials, public.streets, public.locations, public.pallets, public.oms, public.equipments CASCADE;

-- 1. Settings
INSERT INTO public.settings (id, system_name, low_stock_threshold, high_occupancy_threshold)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Depósito de Fardamento - 8º B Sup Sl', 10, 80)
ON CONFLICT (id) DO NOTHING;

-- 2. Streets
INSERT INTO public.streets (id, name, "order") VALUES
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'Rua A - Fardamento Leve', 0),
  ('b2eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'Rua B - Calçados', 1),
  ('b3eebc99-9c0b-4ef8-bb6d-6bb9bd380b33', 'Rua C - Equipamentos', 2),
  ('b4eebc99-9c0b-4ef8-bb6d-6bb9bd380b44', 'Corredor 1 - Diversos', 3)
ON CONFLICT DO NOTHING;

-- 3. Locations (Prédios/Posições)
INSERT INTO public.locations (id, street_id, name, needs_recount) VALUES
  -- Rua A
  (gen_random_uuid(), 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'A-01', false),
  (gen_random_uuid(), 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'A-02', false),
  (gen_random_uuid(), 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'A-03', false),
  (gen_random_uuid(), 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'A-04', false),
  -- Rua B
  (gen_random_uuid(), 'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'B-01', false),
  (gen_random_uuid(), 'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'B-02', false),
  (gen_random_uuid(), 'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'B-03', false),
  -- Rua C
  (gen_random_uuid(), 'b3eebc99-9c0b-4ef8-bb6d-6bb9bd380b33', 'C-01', true), -- Marked for recount
  (gen_random_uuid(), 'b3eebc99-9c0b-4ef8-bb6d-6bb9bd380b33', 'C-02', false)
ON CONFLICT DO NOTHING;

-- 4. Materials (Catalog)
INSERT INTO public.materials (id, name, description, type, min_stock, image) VALUES
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 'Gandola Camuflada G', 'Gandola de combate padrão camuflado', 'TRD', 20, 'https://img.usecurling.com/p/200/200?q=military%20jacket%20camouflage'),
  ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c22', 'Coturno Preto 40', 'Coturno de couro preto tam 40', 'TRD', 15, 'https://img.usecurling.com/p/200/200?q=military%20black%20boots'),
  ('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', 'Boina Verde Olíva 56', 'Boina de feltro verde', 'TRD', 50, 'https://img.usecurling.com/p/200/200?q=green%20military%20beret'),
  ('c4eebc99-9c0b-4ef8-bb6d-6bb9bd380c44', 'Cinto NA Verde', 'Cinto de nylon verde oliva', 'TRP', 30, 'https://img.usecurling.com/p/200/200?q=green%20belt%20military'),
  ('c5eebc99-9c0b-4ef8-bb6d-6bb9bd380c55', 'Cantil Plástico', 'Cantil padrão 900ml', 'TRP', 100, 'https://img.usecurling.com/p/200/200?q=military%20canteen')
ON CONFLICT DO NOTHING;

-- 5. OMs (Military Organizations)
INSERT INTO public.oms (id, name, image) VALUES
  ('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380d11', '12º GAC', 'https://img.usecurling.com/i?q=artillery&color=red'),
  ('d2eebc99-9c0b-4ef8-bb6d-6bb9bd380d22', '23º BI', 'https://img.usecurling.com/i?q=infantry&color=green'),
  ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380d33', 'Base Adm Ap', 'https://img.usecurling.com/i?q=administration&color=blue')
ON CONFLICT DO NOTHING;

-- 6. Equipments
INSERT INTO public.equipments (id, name, model, status, image) VALUES
  (gen_random_uuid(), 'Empilhadeira 01', 'Toyota 8FBE', 'available', 'https://img.usecurling.com/p/300/200?q=forklift&color=yellow'),
  (gen_random_uuid(), 'Transpaleteira Elétrica', 'Linde T20', 'in-use', 'https://img.usecurling.com/p/300/200?q=pallet%20jack&color=red'),
  (gen_random_uuid(), 'Carrinho Hidráulico', 'Paletrans', 'available', 'https://img.usecurling.com/p/300/200?q=hydraulic%20cart')
ON CONFLICT DO NOTHING;

-- 7. Ballistic Items (Samples)
INSERT INTO public.ballistic_items (id, category, status, serial_number, identification, model, om_id, expiration_date) VALUES
  (gen_random_uuid(), 'vest', 'active', 'SN-293842', 'CL-001', 'Colete Nível III-A', NULL, NOW() + INTERVAL '4 years'),
  (gen_random_uuid(), 'vest', 'in-use', 'SN-293843', 'CL-002', 'Colete Nível III-A', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380d11', NOW() + INTERVAL '3 years'),
  (gen_random_uuid(), 'helmet', 'active', 'SN-998877', 'CP-101', 'Capacete Kevlar', NULL, NOW() + INTERVAL '5 years'),
  (gen_random_uuid(), 'plate', 'obsolete', 'SN-OLD-001', 'PL-OBS-01', 'Placa Cerâmica Antiga', NULL, NOW() - INTERVAL '1 year')
ON CONFLICT DO NOTHING;

-- 8. Seed some initial Pallets (Stock)
-- Note: We need valid location IDs. Since we generated them with gen_random_uuid(), we'll select them dynamically or insert fixed ones for simplicity.
-- For this migration, let's insert a pallet into 'TRP_AREA' which is a virtual location handled by the app logic, or link to a real location if we knew the ID.
-- We will use a DO block to insert pallets linking to the first available location of 'Rua A'.

DO $$
DECLARE
  loc_id UUID;
  mat_id UUID;
BEGIN
  -- Get a location from Rua A
  SELECT id INTO loc_id FROM public.locations WHERE name = 'A-01' LIMIT 1;
  -- Get material
  SELECT id INTO mat_id FROM public.materials WHERE name = 'Gandola Camuflada G' LIMIT 1;

  IF loc_id IS NOT NULL AND mat_id IS NOT NULL THEN
    INSERT INTO public.pallets (location_id, material_id, material_name, description, quantity, type, entry_date)
    VALUES (loc_id::text, mat_id, 'Gandola Camuflada G', 'Lote Inicial 2026', 100, 'TRD', NOW());
  END IF;

  -- Insert some TRP (Entrada) items
  SELECT id INTO mat_id FROM public.materials WHERE name = 'Cantil Plástico' LIMIT 1;
  IF mat_id IS NOT NULL THEN
     INSERT INTO public.pallets (location_id, material_id, material_name, description, quantity, type, entry_date)
    VALUES ('TRP_AREA', mat_id, 'Cantil Plástico', 'Chegada recente', 500, 'TRP', NOW());
  END IF;
END $$;

