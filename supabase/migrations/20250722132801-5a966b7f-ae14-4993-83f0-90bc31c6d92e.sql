-- Assign all employees to the team lead with email lead@keyvalue.systems
UPDATE public.user_profiles 
SET team_lead_id = 'f416ac5c-9608-44e4-9188-706d05bc1e28'
WHERE role = 'employee';