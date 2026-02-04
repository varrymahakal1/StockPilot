-- Allow public to see organizations (for signup list)
DROP POLICY IF EXISTS "Public can view organization names" ON organizations;
CREATE POLICY "Public can view organization names" ON organizations
  FOR SELECT USING (true);

-- Update the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  org_id UUID;
BEGIN
  -- Check if organization_id is provided (Employee)
  IF new.raw_user_meta_data->>'organization_id' IS NOT NULL THEN
    org_id := (new.raw_user_meta_data->>'organization_id')::UUID;
  
  -- Check if organization_name is provided (Owner - Create new org)
  ELSIF new.raw_user_meta_data->>'organization_name' IS NOT NULL THEN
    INSERT INTO organizations (name, owner_id)
    VALUES (new.raw_user_meta_data->>'organization_name', new.id)
    RETURNING id INTO org_id;
  
  -- Default (Fallback)
  ELSE
    -- Maybe create a default one or leave null?
    -- For now, let's create a default if nothing provided (legacy behavior)
    INSERT INTO organizations (name, owner_id)
    VALUES ('My Organization', new.id)
    RETURNING id INTO org_id;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role, organization_id)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'owner'),
    org_id
  );
  RETURN new;
END;
$$;
