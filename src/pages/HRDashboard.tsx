import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  Users,
  TrendingUp,
  BarChart3,
  FileText,
  Settings,
} from "lucide-react";
import CompetencyScoreChart from "@/components/CompetencyScoreChart";

const HRDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-hr" />
                Total Employees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-hr">248</div>
              <p className="text-sm text-muted-foreground">
                Across all departments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-green-600" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">186</div>
              <p className="text-sm text-muted-foreground">
                75% completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Avg Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">4.2</div>
              <p className="text-sm text-muted-foreground">Out of 5.0</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="w-5 h-5 text-orange-500" />
                Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">24</div>
              <p className="text-sm text-muted-foreground">
                AI-generated insights
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Department Performance</CardTitle>
              <CardDescription>Average scores by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Engineering", score: 4.3, color: "bg-blue-500" },
                  { name: "Sales", score: 4.1, color: "bg-green-500" },
                  { name: "Marketing", score: 4.0, color: "bg-purple-500" },
                  { name: "Operations", score: 4.2, color: "bg-orange-500" },
                ].map((dept) => (
                  <div
                    key={dept.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${dept.color}`}
                      ></div>
                      <span className="text-sm font-medium">{dept.name}</span>
                    </div>
                    <Badge variant="secondary">{dept.score}/5.0</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Competency Analysis</CardTitle>
              <CardDescription>
                Areas of strength and improvement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { competency: "Technical Skills", score: 4.4, trend: "up" },
                  { competency: "Communication", score: 4.1, trend: "stable" },
                  { competency: "Energy & Drive", score: 4.3, trend: "up" },
                  { competency: "Functional", score: 3.9, trend: "down" },
                ].map((comp) => (
                  <div
                    key={comp.competency}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm font-medium">
                      {comp.competency}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{comp.score}/5.0</Badge>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          comp.trend === "up"
                            ? "bg-green-500"
                            : comp.trend === "down"
                            ? "bg-red-500"
                            : "bg-gray-400"
                        }`}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <CompetencyScoreChart />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="hr" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Generate Reports
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                System Settings
              </Button>
            </CardContent>
          </Card> */}

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="pb-2 border-b border-border">
                  <p className="font-medium">John Smith completed appraisal</p>
                  <p className="text-muted-foreground">2 hours ago</p>
                </div>
                <div className="pb-2 border-b border-border">
                  <p className="font-medium">
                    Engineering team review completed
                  </p>
                  <p className="text-muted-foreground">4 hours ago</p>
                </div>
                <div>
                  <p className="font-medium">AI analysis generated for Sales</p>
                  <p className="text-muted-foreground">6 hours ago</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">AI Analysis</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Data Sync</span>
                  <Badge className="bg-green-100 text-green-800">Synced</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Notifications</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    24 pending
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
