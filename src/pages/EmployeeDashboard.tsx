import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, MessageSquare, Clock, CheckCircle } from 'lucide-react';

const EmployeeDashboard = () => {
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
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
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

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Competency Areas</CardTitle>
              <CardDescription>
                Your appraisal will cover these key competencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  'Technical Skills',
                  'Functional Competence',
                  'Communication',
                  'Energy & Drive'
                ].map((competency) => (
                  <div key={competency} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium">{competency}</h4>
                    <p className="text-sm text-muted-foreground mt-1">Not started</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;