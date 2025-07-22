-- Create security definer function to get current user's role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.user_profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create security definer function to get current user's profile id
CREATE OR REPLACE FUNCTION public.get_current_user_profile_id()
RETURNS uuid AS $$
  SELECT id FROM public.user_profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "HR can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Team leads can view their team members" ON public.user_profiles;

-- Create new policies using security definer functions
CREATE POLICY "HR can view all profiles" 
ON public.user_profiles 
FOR ALL
USING (public.get_current_user_role() = 'hr'::user_role);

CREATE POLICY "Team leads can view their team members" 
ON public.user_profiles 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  team_lead_id = public.get_current_user_profile_id()
);