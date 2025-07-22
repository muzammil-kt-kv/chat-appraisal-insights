-- Create the user_role enum type first
CREATE TYPE public.user_role AS ENUM ('employee', 'team_lead', 'hr');

-- Create the appraisal_status enum type
CREATE TYPE public.appraisal_status AS ENUM ('draft', 'submitted', 'team_lead_review', 'completed');

-- Update the user_profiles table to use the enum type
ALTER TABLE public.user_profiles 
ALTER COLUMN role TYPE user_role USING role::user_role;

-- Update the appraisal_submissions table to use the enum type  
ALTER TABLE public.appraisal_submissions 
ALTER COLUMN status TYPE appraisal_status USING status::appraisal_status;

-- Recreate the handle_new_user function with proper enum casting
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    INSERT INTO public.user_profiles (user_id, first_name, last_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'first_name', 'User'),
        COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
        COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'employee'::user_role)
    );
    RETURN NEW;
END;
$function$;

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();