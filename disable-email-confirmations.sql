-- Disable email confirmations in Supabase
-- This will auto-confirm users on signup, bypassing email rate limits
-- Run this in Supabase Dashboard → SQL Editor

-- Step 1: Create a function that auto-confirms new users
CREATE OR REPLACE FUNCTION auth.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-confirm email immediately
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create a trigger to call this function when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auth.handle_new_user();

-- Step 3: Set default for email_confirmed_at to current timestamp (backup method)
ALTER TABLE auth.users 
ALTER COLUMN email_confirmed_at SET DEFAULT NOW();

-- Step 4: Confirm all existing unconfirmed users (optional - be careful!)
-- Uncomment the next two lines if you want to confirm all existing users
-- UPDATE auth.users 
-- SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
-- WHERE email_confirmed_at IS NULL;

-- After running this SQL:
-- 1. Go to Supabase Dashboard → Authentication → Settings
-- 2. Turn OFF "Enable email confirmations" toggle (optional, but recommended)
-- 3. Users will now be auto-confirmed on signup without sending emails


