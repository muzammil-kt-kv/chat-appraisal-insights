import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { User, MessageSquare, Clock, CheckCircle, DollarSign, TrendingUp, Calendar, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [appraisal, setAppraisal] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userProfile) {
      fetchAppraisalData();
    }
  }, [userProfile]);

  const fetchAppraisalData = async () => {
    try {
      const { data: appraisalData, error } = await supabase
        .from('appraisal_submissions')
        .select('*')
        .eq('employee_id', userProfile?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching appraisal:', error);
        toast({
          title: "Error",
          description: "Failed to load appraisal data.",
          variant: "destructive"
        });
        return;
      }

      setAppraisal(appraisalData);
    } catch (error) {
      console.error('Error loading appraisal data:', error);
      toast({
        title: "Error",
        description: "Failed to load appraisal data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getAppraisalProgress = () => {
    if (!appraisal) return { progress: 0, status: 'Not Started', description: 'Ready to begin' };
    
    switch (appraisal.status) {
      case 'draft':
        return { progress: 20, status: 'In Progress', description: 'Draft created' };
      case 'submitted':
        return { progress: 60, status: 'Submitted', description: 'Awaiting team lead review' };
      case 'team_lead_review':
        return { progress: 80, status: 'Under Review', description: 'Team lead reviewing' };
      case 'team_lead_approved':
        return { progress: 90, status: 'Approved', description: 'Awaiting AI analysis' };
      case 'ai_analyzed':
      case 'completed':
        return { progress: 100, status: 'Completed', description: 'Appraisal finalized' };
      default:
        return { progress: 0, status: 'Not Started', description: 'Ready to begin' };
    }
  };

  const { progress, status, description } = getAppraisalProgress();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const handleStartAppraisal = () => {
    navigate('/employee/chat-appraisal');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-medium transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Start Appraisal
              </CardTitle>
              <CardDescription>
                Begin your interactive self-appraisal conversation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleStartAppraisal}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Start Chat Appraisal
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                Appraisal Status
              </CardTitle>
              <CardDescription>
                Track your appraisal progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Progress</span>
                  <span className="text-sm text-muted-foreground">{status}</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-muted-foreground" />
                Previous Reviews
              </CardTitle>
              <CardDescription>
                Access your appraisal history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {appraisal ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Last Submission</span>
                    <span className="text-sm font-medium">{new Date(appraisal.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Status</span>
                    <Badge variant="secondary">{status}</Badge>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No previous appraisals found</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 space-y-6">
          {/* Employee Profile & Salary Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-employee" />
                Employee Profile
              </CardTitle>
              <CardDescription>
                Your current employment details and compensation information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Employee Details</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Name:</span>
                        <span className="text-sm font-medium">{userProfile?.first_name} {userProfile?.last_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">ID:</span>
                        <span className="text-sm font-medium">{userProfile?.id.slice(0, 8)}...</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Department:</span>
                        <span className="text-sm font-medium">{userProfile?.department || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Role:</span>
                        <span className="text-sm font-medium capitalize">{userProfile?.role.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Salary Information */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Compensation</h3>
                    <div className="mt-2 space-y-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-sm text-muted-foreground">Current Salary</p>
                          <p className="text-xl font-bold text-green-600">
                            Contact HR
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-sm text-muted-foreground">Previous Hike</p>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-blue-600">
                              N/A
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              Last Year
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Performance</h3>
                    <div className="mt-2 space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">Overall Rating</span>
                          <span className="text-sm font-medium">{progress}%</span>
                        </div>
                        <Progress 
                          value={progress} 
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Poor</span>
                          <span>Excellent</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">Salary Growth</span>
                          <span className="text-sm font-medium">N/A</span>
                        </div>
                        <Progress 
                          value={0} 
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>0%</span>
                          <span>25%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appraisal Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-employee" />
                Appraisal Timeline
              </CardTitle>
              <CardDescription>
                Important dates for your performance review cycle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Calendar className="w-6 h-6 text-employee mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Joining Date</p>
                  <p className="font-medium">{new Date().toLocaleDateString()}</p>
                </div>
                
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Award className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Last Appraisal</p>
                  <p className="font-medium">{appraisal ? new Date(appraisal.created_at).toLocaleDateString() : 'No appraisals yet'}</p>
                </div>
                
                <div className="text-center p-4 bg-employee/10 border border-employee/20 rounded-lg">
                  <Clock className="w-6 h-6 text-employee mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Next Appraisal</p>
                  <p className="font-medium text-employee">When scheduled</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;