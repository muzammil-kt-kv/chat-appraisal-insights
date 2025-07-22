import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Clock, CheckCircle, AlertCircle, User, MessageSquare, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  appraisal_submissions?: Array<{
    id: string;
    status: 'draft' | 'submitted' | 'team_lead_review' | 'team_lead_approved' | 'ai_analyzed' | 'completed';
    submission_date: string;
    team_lead_reviewed_at?: string;
  }>;
}

const TeamLeadDashboard = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [myAppraisal, setMyAppraisal] = useState<any>(null);

  useEffect(() => {
    if (userProfile) {
      fetchTeamData();
      fetchMyAppraisal();
    }
  }, [userProfile]);

  const fetchTeamData = async () => {
    try {
      // Fetch team members and their appraisals
      const { data: members, error: membersError } = await supabase
        .from('user_profiles')
        .select(`
          id,
          first_name,
          last_name,
          role,
          appraisal_submissions!employee_id(
            id,
            status,
            submission_date,
            team_lead_reviewed_at
          )
        `)
        .eq('team_lead_id', userProfile?.id);

      if (membersError) {
        console.error('Error fetching team members:', membersError);
        toast({
          title: "Error",
          description: "Failed to load team data.",
          variant: "destructive"
        });
        return;
      }

      setTeamMembers(members || []);
    } catch (error) {
      console.error('Error loading team data:', error);
      toast({
        title: "Error",
        description: "Failed to load team data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyAppraisal = async () => {
    try {
      const { data: appraisal, error } = await supabase
        .from('appraisal_submissions')
        .select('*')
        .eq('employee_id', userProfile?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching my appraisal:', error);
        return;
      }

      setMyAppraisal(appraisal);
    } catch (error) {
      console.error('Error loading my appraisal:', error);
    }
  };

  const mapAppraisalStatusToDisplayStatus = (member: TeamMember) => {
    if (!member.appraisal_submissions || (Array.isArray(member.appraisal_submissions) && member.appraisal_submissions.length === 0)) {
      return 'not-started';
    }
    
    const appraisal = Array.isArray(member.appraisal_submissions) ? member.appraisal_submissions[0] : member.appraisal_submissions;
    
    switch (appraisal.status) {
      case 'draft':
        return 'in-progress';
      case 'submitted':
        return 'pending-review';
      case 'team_lead_review':
        return 'pending-review';
      case 'team_lead_approved':
      case 'ai_analyzed':
      case 'completed':
        return 'completed';
      default:
        return 'not-started';
    }
  };

  const getMemberCompletedAt = (member: TeamMember) => {
    if (!member.appraisal_submissions) return null;
    
    const appraisal = Array.isArray(member.appraisal_submissions) ? member.appraisal_submissions[0] : member.appraisal_submissions;
    
    return appraisal.team_lead_reviewed_at || appraisal.submission_date;
  };

  const getMemberDisplayName = (member: TeamMember) => {
    return `${member.first_name} ${member.last_name}`;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: any; icon: any }> = {
      'pending-review': { label: 'Pending Review', variant: 'default', icon: AlertCircle },
      'completed': { label: 'Completed', variant: 'secondary', icon: CheckCircle },
      'in-progress': { label: 'In Progress', variant: 'outline', icon: Clock },
      'not-started': { label: 'Not Started', variant: 'outline', icon: Clock }
    };
    
    const { label, variant, icon: Icon } = config[status] || config['not-started'];
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {label}
      </Badge>
    );
  };

  const getMyAppraisalStatus = () => {
    if (!myAppraisal) return 'not-started';
    
    switch (myAppraisal.status) {
      case 'draft':
        return 'in-progress';
      case 'submitted':
        return 'submitted';
      case 'team_lead_review':
        return 'under-review';
      case 'team_lead_approved':
      case 'ai_analyzed':
      case 'completed':
        return 'completed';
      default:
        return 'not-started';
    }
  };

  const getMyAppraisalBadge = () => {
    const status = getMyAppraisalStatus();
    const config: Record<string, { label: string; variant: any; icon: any }> = {
      'not-started': { label: 'Not Started', variant: 'outline', icon: Clock },
      'in-progress': { label: 'In Progress', variant: 'outline', icon: Clock },
      'submitted': { label: 'Submitted', variant: 'default', icon: CheckCircle },
      'under-review': { label: 'Under Review', variant: 'secondary', icon: AlertCircle },
      'completed': { label: 'Completed', variant: 'secondary', icon: CheckCircle }
    };
    
    const { label, variant, icon: Icon } = config[status];
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {label}
      </Badge>
    );
  };

  const handleStartAppraisal = () => {
    navigate('/team-lead/chat-appraisal');
  };

  const handleReviewEmployee = (employeeId: string) => {
    navigate(`/team-lead/review/${employeeId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-team-lead" />
                Team Size
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-team-lead">{teamMembers.length}</div>
              <p className="text-sm text-muted-foreground">Active team members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                Pending Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">
                {teamMembers.filter(m => mapAppraisalStatusToDisplayStatus(m) === 'pending-review').length}
              </div>
              <p className="text-sm text-muted-foreground">Awaiting your review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {teamMembers.filter(m => mapAppraisalStatusToDisplayStatus(m) === 'completed').length}
              </div>
              <p className="text-sm text-muted-foreground">Appraisals finalized</p>
            </CardContent>
          </Card>
        </div>

        {/* Team Lead's Own Appraisal Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-team-lead/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-team-lead" />
                My Self-Appraisal
              </CardTitle>
              <CardDescription>
                Complete your own performance evaluation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleStartAppraisal}
                className="w-full bg-team-lead hover:bg-team-lead/90"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Start Chat Appraisal
              </Button>
            </CardContent>
          </Card>

          <Card className="border-team-lead/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-team-lead" />
                My Appraisal Status
              </CardTitle>
              <CardDescription>
                Track your appraisal progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {getMyAppraisalBadge()}
                <span className="text-sm text-muted-foreground">Ready to begin</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Team Appraisal Status</CardTitle>
            <CardDescription>
              Review and approve your team members' self-appraisals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading team data...</p>
                </div>
              ) : teamMembers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No team members found.</p>
                </div>
              ) : (
                teamMembers.map((member) => {
                  const memberStatus = mapAppraisalStatusToDisplayStatus(member);
                  const completedAt = getMemberCompletedAt(member);
                  
                  return (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-team-lead-muted rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-team-lead" />
                        </div>
                        <div>
                          <h4 className="font-medium">{getMemberDisplayName(member)}</h4>
                          {completedAt && (
                            <p className="text-sm text-muted-foreground">
                              Completed: {new Date(completedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {getStatusBadge(memberStatus)}
                        
                        {memberStatus === 'pending-review' && (
                          <Button 
                            variant="outline"
                            className="border-team-lead text-team-lead hover:bg-team-lead hover:text-white"
                            size="sm"
                            onClick={() => handleReviewEmployee(member.id)}
                          >
                            Review
                          </Button>
                        )}
                        
                        {memberStatus === 'completed' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleReviewEmployee(member.id)}
                          >
                            View Details
                          </Button>
                        )}
                        
                        {(memberStatus === 'in-progress' || memberStatus === 'not-started') && (
                          <Button variant="ghost" size="sm" disabled>
                            Waiting
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamLeadDashboard;