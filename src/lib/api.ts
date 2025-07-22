import { supabase } from '@/integrations/supabase/client';

export interface AppraisalSubmission {
  id: string;
  employee_id: string;
  submission_date: string;
  raw_employee_text: any;
  raw_team_lead_text: string | null;
  status: 'draft' | 'submitted' | 'team_lead_review' | 'team_lead_approved' | 'ai_analyzed' | 'completed';
  ai_analysis: any;
  created_at: string;
  updated_at: string;
  user_profiles?: {
    first_name: string;
    last_name: string;
    department: string;
  };
}

// Employee APIs
export const getMyAppraisals = async () => {
  const { data, error } = await supabase
    .from('appraisal_submissions')
    .select(`
      *,
      user_profiles!appraisal_submissions_employee_id_fkey (
        first_name,
        last_name,
        department
      )
    `)
    .order('created_at', { ascending: false });
    
  return { data, error };
};

export const createAppraisal = async (appraisalData: any) => {
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!userProfile) throw new Error('User profile not found');

  const { data, error } = await supabase
    .from('appraisal_submissions')
    .insert({
      employee_id: userProfile.id,
      raw_employee_text: appraisalData,
      status: 'draft'
    })
    .select()
    .single();
    
  return { data, error };
};

export const updateAppraisal = async (id: string, appraisalData: any, status?: 'draft' | 'submitted' | 'team_lead_review' | 'team_lead_approved' | 'ai_analyzed' | 'completed') => {
  const updateData: any = {
    raw_employee_text: appraisalData,
    updated_at: new Date().toISOString()
  };
  
  if (status) {
    updateData.status = status;
  }

  const { data, error } = await supabase
    .from('appraisal_submissions')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
    
  return { data, error };
};

// Team Lead APIs
export const getTeamAppraisals = async () => {
  const { data, error } = await supabase
    .from('appraisal_submissions')
    .select(`
      *,
      user_profiles!appraisal_submissions_employee_id_fkey (
        first_name,
        last_name,
        department
      )
    `)
    .in('status', ['submitted', 'team_lead_review'])
    .order('created_at', { ascending: false });
    
  return { data, error };
};

export const updateTeamLeadReview = async (id: string, teamLeadText: string, status: 'team_lead_review' | 'team_lead_approved') => {
  const { data, error } = await supabase
    .from('appraisal_submissions')
    .update({
      raw_team_lead_text: teamLeadText,
      status: status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
    
  return { data, error };
};

// HR APIs
export const getAllAppraisals = async () => {
  const { data, error } = await supabase
    .from('appraisal_submissions')
    .select(`
      *,
      user_profiles!appraisal_submissions_employee_id_fkey (
        first_name,
        last_name,
        department,
        role
      )
    `)
    .order('created_at', { ascending: false });
    
  return { data, error };
};

export const getAppraisalStats = async () => {
  const { data: allAppraisals, error } = await getAllAppraisals();
  
  if (error || !allAppraisals) return { data: null, error };
  
  const stats = {
    total: allAppraisals.length,
    draft: allAppraisals.filter(a => a.status === 'draft').length,
    submitted: allAppraisals.filter(a => a.status === 'submitted').length,
    inReview: allAppraisals.filter(a => a.status === 'team_lead_review').length,
    completed: allAppraisals.filter(a => a.status === 'completed').length,
    byDepartment: allAppraisals.reduce((acc: any, appraisal) => {
      const dept = appraisal.user_profiles?.department || 'Unknown';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {}),
    byStatus: allAppraisals.reduce((acc: any, appraisal) => {
      acc[appraisal.status] = (acc[appraisal.status] || 0) + 1;
      return acc;
    }, {})
  };
  
  return { data: stats, error: null };
};

export const getAllEmployees = async () => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('role', 'employee')
    .order('first_name');
    
  return { data, error };
};

export const getTeamMembers = async () => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('first_name');
    
  return { data, error };
};