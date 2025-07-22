import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CompetencyScoreChart from "@/components/CompetencyScoreChart";

const HRDashboard = () => {
  const { toast } = useToast();
  const [statistics, setStatistics] = useState({
    totalEmployees: 0,
    completedAppraisals: 0,
    avgScore: 0,
    insights: 0,
  });
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const [competencyData, setCompetencyData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch total employees
      const { count: totalEmployees } = await supabase
        .from("user_profiles")
        .select("*", { count: "exact", head: true });

      // Fetch completed appraisals
      const { count: completedAppraisals } = await supabase
        .from("appraisal_submissions")
        .select("*", { count: "exact", head: true })
        .in("status", ["completed", "ai_analyzed", "team_lead_approved"]);

      // Fetch appraisals with AI analysis for scoring
      const { data: appraisals } = await supabase
        .from("appraisal_submissions")
        .select("ai_analysis")
        .not("ai_analysis", "is", null);

      // Calculate average score
      let avgScore = 0;
      if (appraisals && appraisals.length > 0) {
        const scores = appraisals.map((a) => {
          if (a.ai_analysis && typeof a.ai_analysis === "object") {
            const analysis = a.ai_analysis as any;
            return analysis.overall_score || 0;
          }
          return 0;
        });
        avgScore =
          scores.reduce((sum, score) => sum + score, 0) / scores.length;
      }

      // Fetch department performance data
      const { data: departments } = await supabase
        .from("user_profiles")
        .select("department")
        .not("department", "is", null);

      const departmentGroups = departments?.reduce((acc: any, curr) => {
        const dept = curr.department || "Unassigned";
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      }, {});

      const deptData = Object.entries(departmentGroups || {}).map(
        ([name, count]: [string, any]) => ({
          name,
          score: (Math.random() * 2 + 3).toFixed(1), // Mock scores for now
          color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
        })
      );

      setStatistics({
        totalEmployees: totalEmployees || 0,
        completedAppraisals: completedAppraisals || 0,
        avgScore: Number(avgScore.toFixed(1)),
        insights: appraisals?.length || 0,
      });

      setDepartmentData(deptData);

      // Mock competency data - would need to analyze ai_analysis JSON for real data
      setCompetencyData([
        { competency: "Technical Skills", score: 4.4, trend: "up" },
        { competency: "Communication", score: 4.1, trend: "stable" },
        { competency: "Energy & Drive", score: 4.3, trend: "up" },
        { competency: "Functional", score: 3.9, trend: "down" },
      ]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
              <div className="text-3xl font-bold text-hr">
                {statistics.totalEmployees}
              </div>
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
              <div className="text-3xl font-bold text-green-600">
                {statistics.completedAppraisals}
              </div>
              <p className="text-sm text-muted-foreground">
                {statistics.totalEmployees > 0
                  ? Math.round(
                      (statistics.completedAppraisals /
                        statistics.totalEmployees) *
                        100
                    )
                  : 0}
                % completion rate
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
              <div className="text-3xl font-bold text-blue-600">
                {statistics.avgScore || "N/A"}
              </div>
              <p className="text-sm text-muted-foreground">Out of 10.0</p>
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
              <div className="text-3xl font-bold text-orange-500">
                {statistics.insights}
              </div>
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
                {departmentData.length > 0 ? (
                  departmentData.map((dept) => (
                    <div
                      key={dept.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: dept.color }}
                        ></div>
                        <span className="text-sm font-medium">{dept.name}</span>
                      </div>
                      <Badge variant="secondary">{dept.score}/5.0</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No department data available
                  </p>
                )}
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
                {competencyData.map((comp) => (
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
          <CompetencyScoreChart data={chartData} />
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
