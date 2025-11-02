-- Create user profiles for existing users
INSERT INTO user_profiles (user_id, display_name)
SELECT id, COALESCE(raw_user_meta_data->>'name', email)
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM user_profiles WHERE user_profiles.user_id = auth.users.id
)
ON CONFLICT (user_id) DO NOTHING;

-- Create a function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
    )
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to run the function when a new user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

SELECT 'User profiles created and auto-creation trigger set up!' AS status;
SELECT COUNT(*) AS total_profiles FROM user_profiles;
