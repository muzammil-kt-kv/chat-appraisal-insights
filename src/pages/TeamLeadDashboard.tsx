import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Clock, CheckCircle, AlertCircle, User } from 'lucide-react';

const TeamLeadDashboard = () => {
  // Mock data - replace with actual data from Supabase
  const teamMembers = [
    { id: 1, name: 'John Smith', status: 'pending-review', completedAt: '2024-01-15' },
    { id: 2, name: 'Sarah Johnson', status: 'completed', completedAt: '2024-01-14' },
    { id: 3, name: 'Mike Davis', status: 'in-progress', completedAt: null },
    { id: 4, name: 'Lisa Wilson', status: 'not-started', completedAt: null },
  ];

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
                {teamMembers.filter(m => m.status === 'pending-review').length}
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
                {teamMembers.filter(m => m.status === 'completed').length}
              </div>
              <p className="text-sm text-muted-foreground">Appraisals finalized</p>
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
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-team-lead-muted rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-team-lead" />
                    </div>
                    <div>
                      <h4 className="font-medium">{member.name}</h4>
                      {member.completedAt && (
                        <p className="text-sm text-muted-foreground">
                          Completed: {new Date(member.completedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {getStatusBadge(member.status)}
                    
                    {member.status === 'pending-review' && (
                      <Button variant="team-lead" size="sm">
                        Review
                      </Button>
                    )}
                    
                    {member.status === 'completed' && (
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    )}
                    
                    {(member.status === 'in-progress' || member.status === 'not-started') && (
                      <Button variant="ghost" size="sm" disabled>
                        Waiting
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamLeadDashboard;