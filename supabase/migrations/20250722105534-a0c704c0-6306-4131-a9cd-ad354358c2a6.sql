-- Create role enum
CREATE TYPE public.user_role AS ENUM ('employee', 'team-lead', 'hr');

-- Create appraisal status enum  
CREATE TYPE public.appraisal_status AS ENUM ('draft', 'submitted', 'team_lead_review', 'team_lead_approved', 'ai_analyzed', 'completed');

-- Create user_profiles table
CREATE TABLE public.user_profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    role user_role NOT NULL DEFAULT 'employee',
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    department TEXT,
    team_lead_id UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appraisal_submissions table
CREATE TABLE public.appraisal_submissions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    submission_date DATE NOT NULL DEFAULT CURRENT_DATE,
    raw_employee_text JSONB,
    raw_team_lead_text TEXT,
    status appraisal_status NOT NULL DEFAULT 'draft',
    ai_analysis JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appraisal_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Team leads can view their team members" 
ON public.user_profiles 
FOR SELECT 
USING (
    auth.uid() = user_id OR 
    team_lead_id = (SELECT id FROM public.user_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "HR can view all profiles" 
ON public.user_profiles 
FOR ALL 
USING (
    (SELECT role FROM public.user_profiles WHERE user_id = auth.uid()) = 'hr'
);

-- RLS Policies for appraisal_submissions
CREATE POLICY "Employees can view their own appraisals" 
ON public.appraisal_submissions 
FOR SELECT 
USING (
    employee_id = (SELECT id FROM public.user_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Employees can create their own appraisals" 
ON public.appraisal_submissions 
FOR INSERT 
WITH CHECK (
    employee_id = (SELECT id FROM public.user_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Employees can update their own draft appraisals" 
ON public.appraisal_submissions 
FOR UPDATE 
USING (
    employee_id = (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()) 
    AND status = 'draft'
);

CREATE POLICY "Team leads can view their team's appraisals" 
ON public.appraisal_submissions 
FOR SELECT 
USING (
    employee_id IN (
        SELECT id FROM public.user_profiles 
        WHERE team_lead_id = (SELECT id FROM public.user_profiles WHERE user_id = auth.uid())
    )
);

CREATE POLICY "Team leads can update appraisals for review" 
ON public.appraisal_submissions 
FOR UPDATE 
USING (
    employee_id IN (
        SELECT id FROM public.user_profiles 
        WHERE team_lead_id = (SELECT id FROM public.user_profiles WHERE user_id = auth.uid())
    )
    AND status IN ('submitted', 'team_lead_review')
);

CREATE POLICY "HR can view all appraisals" 
ON public.appraisal_submissions 
FOR ALL 
USING (
    (SELECT role FROM public.user_profiles WHERE user_id = auth.uid()) = 'hr'
);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appraisal_submissions_updated_at
    BEFORE UPDATE ON public.appraisal_submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, first_name, last_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'first_name', 'User'),
        COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
        COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'employee')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();