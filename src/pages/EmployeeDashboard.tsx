import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { User, MessageSquare, Clock, CheckCircle, DollarSign, TrendingUp, Calendar, Award } from 'lucide-react';

const EmployeeDashboard = () => {
  const navigate = useNavigate();

  // Mock employee data - replace with actual data from Supabase/API
  const employeeData = {
    name: "John Doe",
    employeeId: "EMP001",
    department: "Engineering",
    position: "Senior Software Developer",
    currentSalary: 75000,
    previousHike: 12,
    performanceRating: 85,
    joiningDate: "2022-01-15",
    lastAppraisal: "2023-12-31",
    nextAppraisal: "2024-12-31"
  };

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
                  <span className="text-sm text-muted-foreground">0/5 competencies</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full w-0"></div>
                </div>
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
              <p className="text-sm text-muted-foreground">No previous appraisals found</p>
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
                        <span className="text-sm font-medium">{employeeData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">ID:</span>
                        <span className="text-sm font-medium">{employeeData.employeeId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Department:</span>
                        <span className="text-sm font-medium">{employeeData.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Position:</span>
                        <span className="text-sm font-medium">{employeeData.position}</span>
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
                            ${employeeData.currentSalary.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-sm text-muted-foreground">Previous Hike</p>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-blue-600">
                              {employeeData.previousHike}%
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
                          <span className="text-sm font-medium">{employeeData.performanceRating}%</span>
                        </div>
                        <Progress 
                          value={employeeData.performanceRating} 
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
                          <span className="text-sm font-medium">{employeeData.previousHike}%</span>
                        </div>
                        <Progress 
                          value={employeeData.previousHike * 2} 
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
                  <p className="font-medium">{new Date(employeeData.joiningDate).toLocaleDateString()}</p>
                </div>
                
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Award className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Last Appraisal</p>
                  <p className="font-medium">{new Date(employeeData.lastAppraisal).toLocaleDateString()}</p>
                </div>
                
                <div className="text-center p-4 bg-employee/10 border border-employee/20 rounded-lg">
                  <Clock className="w-6 h-6 text-employee mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Next Appraisal</p>
                  <p className="font-medium text-employee">{new Date(employeeData.nextAppraisal).toLocaleDateString()}</p>
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