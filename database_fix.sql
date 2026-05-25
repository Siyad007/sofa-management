-- ==========================================
-- FINAL TAILORED SCHEMA - SOFA SHOP SYSTEM
-- ==========================================

-- Clean start
DROP TABLE IF EXISTS daily_entry_operations CASCADE;
DROP TABLE IF EXISTS daily_entries CASCADE;
DROP TABLE IF EXISTS weekly_salary CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS pricing CASCADE;
DROP TABLE IF EXISTS work_types CASCADE;
DROP TABLE IF EXISTS operations CASCADE;
DROP TABLE IF EXISTS expense_categories CASCADE;

-- Enable UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Work Types (Exact match to user needs)
CREATE TABLE work_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  icon TEXT DEFAULT '🛋️',
  color TEXT DEFAULT '#0A84FF',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Operations (Base units of work)
CREATE TABLE operations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  icon TEXT DEFAULT '🛠️',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Pricing (Price per sofa type + operation)
CREATE TABLE pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_type_id UUID REFERENCES work_types(id) ON DELETE CASCADE,
  operation_id UUID REFERENCES operations(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  UNIQUE(work_type_id, operation_id)
);

-- 4. Daily Entries
CREATE TABLE daily_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL DEFAULT CURRENT_DATE UNIQUE,
  is_leave BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Daily Entry Items (Linking Sofa Type + Quantity)
CREATE TABLE daily_entry_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id UUID REFERENCES daily_entries(id) ON DELETE CASCADE,
  work_type_id UUID REFERENCES work_types(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Item Operations (Which operations were done for this specific item batch)
CREATE TABLE item_operations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES daily_entry_items(id) ON DELETE CASCADE,
  operation_id UUID REFERENCES operations(id) ON DELETE CASCADE,
  price_at_time DECIMAL(10,2), -- Snapshot of price
  UNIQUE(item_id, operation_id)
);

-- 7. Expenses
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- SEED DATA - EXACT WORK TYPES & OPERATIONS
-- ==========================================

INSERT INTO work_types (name, display_name, icon, color) VALUES
  ('oneside', 'One Side Diwan', '🛋️', '#3B82F6'),
  ('twoside', 'Two Side Diwan', '🛋️', '#8B5CF6'),
  ('fox', 'Fox Diwan', '🦊', '#EC4899'),
  ('big_oneside', 'Big Size One Side', '🛋️', '#10B981'),
  ('diwan_rop', 'Diwan Rop', '🪢', '#F59E0B'),
  ('plain', 'Plain Diwan', '📦', '#6B7280');

INSERT INTO operations (name, display_name, icon) VALUES
  ('cloth_cutting', 'Cloth Cutting', '✂️'),
  ('hardboard_fitting', 'Hardboard Fitting', '📏'),
  ('foaming', 'Foaming', '🧽'),
  ('covering', 'Covering', '🎨'),
  ('backside', 'Backside', '🔄');

-- Default Prices (Examples - User can update in UI)
INSERT INTO pricing (work_type_id, operation_id, price)
SELECT wt.id, op.id, 15.00 FROM work_types wt, operations op WHERE op.name = 'cloth_cutting';

INSERT INTO pricing (work_type_id, operation_id, price)
SELECT wt.id, op.id, 20.00 FROM work_types wt, operations op WHERE op.name = 'foaming';

INSERT INTO pricing (work_type_id, operation_id, price)
SELECT wt.id, op.id, 30.00 FROM work_types wt, operations op WHERE op.name = 'covering';

INSERT INTO pricing (work_type_id, operation_id, price)
SELECT wt.id, op.id, 10.00 FROM work_types wt, operations op WHERE op.name = 'backside';

INSERT INTO pricing (work_type_id, operation_id, price)
SELECT wt.id, op.id, 10.00 FROM work_types wt, operations op WHERE op.name = 'hardboard_fitting';

-- RLS
ALTER TABLE work_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_entry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read" ON work_types FOR SELECT USING (true);
CREATE POLICY "Public Read" ON operations FOR SELECT USING (true);
CREATE POLICY "Public Read" ON pricing FOR SELECT USING (true);
CREATE POLICY "Public All" ON daily_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public All" ON daily_entry_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public All" ON item_operations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public All" ON expenses FOR ALL USING (true) WITH CHECK (true);
