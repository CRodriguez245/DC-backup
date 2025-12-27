-- Re-enable email confirmations in Supabase
-- Run this when you're ready for production

-- Method 1: Remove the auto-confirmation trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS auth.handle_new_user();

-- Method 2: Reset the default for email_confirmed_at to NULL
ALTER TABLE auth.users 
ALTER COLUMN email_confirmed_at SET DEFAULT NULL;

-- Method 3: Optional - Reset existing users to unconfirmed (be careful!)
-- Only run this if you want to force all users to re-confirm their emails
-- UPDATE auth.users 
-- SET email_confirmed_at = NULL 
-- WHERE email_confirmed_at IS NOT NULL;

-- After running this SQL, you'll also need to:
-- 1. Go to Supabase Dashboard → Authentication → Settings
-- 2. Enable "Email confirmations" toggle
-- 3. Configure your email templates
-- 4. Set up custom SMTP if needed



