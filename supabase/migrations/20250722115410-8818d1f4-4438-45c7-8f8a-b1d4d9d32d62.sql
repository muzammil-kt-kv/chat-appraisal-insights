-- Add team lead review fields to appraisal_submissions table
ALTER TABLE public.appraisal_submissions 
ADD COLUMN team_lead_review jsonb,
ADD COLUMN team_lead_comments text,
ADD COLUMN team_lead_reviewed_at timestamp with time zone,
ADD COLUMN team_lead_reviewed_by uuid;

-- Add foreign key reference for team lead who reviewed
ALTER TABLE public.appraisal_submissions 
ADD CONSTRAINT fk_team_lead_reviewed_by 
FOREIGN KEY (team_lead_reviewed_by) 
REFERENCES public.user_profiles(id);

-- Update appraisal_status enum to include team_lead_review status
ALTER TYPE appraisal_status ADD VALUE IF NOT EXISTS 'team_lead_review';

-- Create index for better performance on team lead queries
CREATE INDEX idx_appraisal_submissions_team_lead_review 
ON public.appraisal_submissions(team_lead_reviewed_by, status);

-- Add RLS policy for team leads to update reviews
CREATE POLICY "Team leads can add their review comments" 
ON public.appraisal_submissions 
FOR UPDATE 
USING (
  employee_id IN (
    SELECT user_profiles.id
    FROM user_profiles
    WHERE user_profiles.team_lead_id = (
      SELECT user_profiles_1.id
      FROM user_profiles user_profiles_1
      WHERE user_profiles_1.user_id = auth.uid()
    )
  )
  AND status IN ('submitted', 'team_lead_review')
);