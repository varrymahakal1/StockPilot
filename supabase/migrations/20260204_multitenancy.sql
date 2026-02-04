-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Update profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('owner', 'employee')) DEFAULT 'owner';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Add organization_id to data tables
ALTER TABLE products ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE sales ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE inventory_ledger ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Backfill existing data
DO $$
DECLARE
  user_record RECORD;
  org_id UUID;
BEGIN
  FOR user_record IN SELECT id FROM auth.users LOOP
    -- Check if user already has an org (idempotency)
    SELECT organization_id INTO org_id FROM profiles WHERE id = user_record.id;
    
    IF org_id IS NULL THEN
        -- Create org
        INSERT INTO organizations (name, owner_id)
        VALUES ('My Organization', user_record.id)
        RETURNING id INTO org_id;

        -- Update profile
        UPDATE profiles 
        SET organization_id = org_id, role = 'owner' 
        WHERE id = user_record.id;

        -- Update data
        UPDATE products SET organization_id = org_id WHERE user_id = user_record.id;
        UPDATE sales SET organization_id = org_id WHERE user_id = user_record.id;
        UPDATE financial_transactions SET organization_id = org_id WHERE user_id = user_record.id;
        UPDATE inventory_ledger SET organization_id = org_id WHERE user_id = user_record.id;
    END IF;
  END LOOP;
END $$;

-- Enable RLS on organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own organization" ON organizations;
CREATE POLICY "Users can view their own organization" ON organizations
  FOR SELECT USING (
    id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );
  
DROP POLICY IF EXISTS "Owner can update their organization" ON organizations;
CREATE POLICY "Owner can update their organization" ON organizations
  FOR UPDATE USING (
    owner_id = auth.uid()
  );
  
DROP POLICY IF EXISTS "Authenticated users can create organization" ON organizations;
CREATE POLICY "Authenticated users can create organization" ON organizations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- UPDATE RLS Policies for Data Tables to use organization_id

-- Products
DROP POLICY IF EXISTS "Users can view their own products" ON products;
DROP POLICY IF EXISTS "Users can insert their own products" ON products;
DROP POLICY IF EXISTS "Users can update their own products" ON products;
DROP POLICY IF EXISTS "Users can delete their own products" ON products;

DROP POLICY IF EXISTS "Org members can view products" ON products;
CREATE POLICY "Org members can view products" ON products
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Org members can insert products" ON products;
CREATE POLICY "Org members can insert products" ON products
  FOR INSERT WITH CHECK (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Org members can update products" ON products;
CREATE POLICY "Org members can update products" ON products
  FOR UPDATE USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Org members can delete products" ON products;
CREATE POLICY "Org members can delete products" ON products
  FOR DELETE USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- Sales
DROP POLICY IF EXISTS "Users can view their own sales" ON sales;
DROP POLICY IF EXISTS "Users can insert their own sales" ON sales;

DROP POLICY IF EXISTS "Org members can view sales" ON sales;
CREATE POLICY "Org members can view sales" ON sales
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Org members can insert sales" ON sales;
CREATE POLICY "Org members can insert sales" ON sales
  FOR INSERT WITH CHECK (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- Financial Transactions
DROP POLICY IF EXISTS "Users can view their own financial_transactions" ON financial_transactions;
DROP POLICY IF EXISTS "Users can insert their own financial_transactions" ON financial_transactions;

DROP POLICY IF EXISTS "Org members can view financial_transactions" ON financial_transactions;
CREATE POLICY "Org members can view financial_transactions" ON financial_transactions
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Org members can insert financial_transactions" ON financial_transactions;
CREATE POLICY "Org members can insert financial_transactions" ON financial_transactions
  FOR INSERT WITH CHECK (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- Inventory Ledger
DROP POLICY IF EXISTS "Users can view their own inventory_ledger" ON inventory_ledger;
DROP POLICY IF EXISTS "Users can insert their own inventory_ledger" ON inventory_ledger;

DROP POLICY IF EXISTS "Org members can view inventory_ledger" ON inventory_ledger;
CREATE POLICY "Org members can view inventory_ledger" ON inventory_ledger
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Org members can insert inventory_ledger" ON inventory_ledger;
CREATE POLICY "Org members can insert inventory_ledger" ON inventory_ledger
  FOR INSERT WITH CHECK (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- Invitations Table
CREATE TABLE IF NOT EXISTS invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  email TEXT NOT NULL,
  role TEXT DEFAULT 'employee',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can view invitations" ON invitations;
CREATE POLICY "Org members can view invitations" ON invitations
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Owners can insert invitations" ON invitations;
CREATE POLICY "Owners can insert invitations" ON invitations
  FOR INSERT WITH CHECK (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );
