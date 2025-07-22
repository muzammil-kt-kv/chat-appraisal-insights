import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  User,
  MessageSquare,
  Clock,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Calendar,
  Award,
  Bot,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

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
        .from("appraisal_submissions")
        .select("*")
        .eq("employee_id", userProfile?.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching appraisal:", error);
        toast({
          title: "Error",
          description: "Failed to load appraisal data.",
          variant: "destructive",
        });
        return;
      }

      setAppraisal(appraisalData);
    } catch (error) {
      console.error("Error loading appraisal data:", error);
      toast({
        title: "Error",
        description: "Failed to load appraisal data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getAppraisalProgress = () => {
    if (!appraisal)
      return {
        progress: 0,
        status: "Not Started",
        description: "Ready to begin",
        color: "text-blue-600",
      };

    switch (appraisal.status) {
      case "draft":
        return {
          progress: 20,
          status: "In Progress",
          description: "Chat appraisal in progress",
          color: "text-orange-600",
        };
      case "submitted":
        return {
          progress: 60,
          status: "Submitted",
          description: "Awaiting team lead review",
          color: "text-blue-600",
        };
      case "team_lead_review":
        return {
          progress: 80,
          status: "Under Review",
          description: "Team lead reviewing",
          color: "text-yellow-600",
        };
      case "team_lead_approved":
        return {
          progress: 90,
          status: "Approved",
          description: "Awaiting AI analysis",
          color: "text-green-600",
        };
      case "ai_analyzed":
      case "completed":
        return {
          progress: 100,
          status: "Completed",
          description: "Appraisal finalized",
          color: "text-green-600",
        };
      default:
        return {
          progress: 0,
          status: "Not Started",
          description: "Ready to begin",
          color: "text-blue-600",
        };
    }
  };

  const { progress, status, description, color } = getAppraisalProgress();

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
    navigate("/employee/chat-appraisal");
  };

  const handleContinueAppraisal = () => {
    navigate("/employee/chat-appraisal");
  };

  const canStartNewAppraisal = !appraisal || appraisal.status === "completed";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Chat Appraisal Card */}
          <Card className="hover:shadow-medium transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-600" />
                {canStartNewAppraisal
                  ? "Start Chat Appraisal"
                  : "Continue Chat Appraisal"}
              </CardTitle>
              <CardDescription>
                {canStartNewAppraisal
                  ? "Begin your interactive self-appraisal conversation with AI"
                  : "Continue your ongoing appraisal conversation"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={
                  canStartNewAppraisal
                    ? handleStartAppraisal
                    : handleContinueAppraisal
                }
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {canStartNewAppraisal
                  ? "Start Chat Appraisal"
                  : "Continue Appraisal"}
              </Button>
            </CardContent>
          </Card>

          {/* Appraisal Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className={`w-5 h-5 ${color}`} />
                Appraisal Status
              </CardTitle>
              <CardDescription>Track your appraisal progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Progress</span>
                  <span className={`text-sm font-medium ${color}`}>
                    {status}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Previous Reviews Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-muted-foreground" />
                Previous Reviews
              </CardTitle>
              <CardDescription>Access your appraisal history</CardDescription>
            </CardHeader>
            <CardContent>
              {appraisal ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Last Submission</span>
                    <span className="text-sm font-medium">
                      {new Date(appraisal.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Status</span>
                    <Badge variant="secondary">{status}</Badge>
                  </div>
                  {appraisal.conversation_history && (
                    <div className="flex justify-between">
                      <span className="text-sm">Messages</span>
                      <span className="text-sm font-medium">
                        {Array.isArray(appraisal.conversation_history)
                          ? appraisal.conversation_history.length
                          : "N/A"}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No previous appraisals found
                </p>
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
                    <h3 className="font-medium text-sm text-muted-foreground">
                      Employee Details
                    </h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Name:</span>
                        <span className="text-sm font-medium">
                          {userProfile?.first_name} {userProfile?.last_name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">ID:</span>
                        <span className="text-sm font-medium">
                          {userProfile?.id.slice(0, 8)}...
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Department:</span>
                        <span className="text-sm font-medium">
                          {userProfile?.department || "Not specified"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Salary Information */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Compensation
                    </h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Current Salary:</span>
                        <span className="text-sm font-medium">$75,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Last Review:</span>
                        <span className="text-sm font-medium">
                          6 months ago
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Next Review:</span>
                        <span className="text-sm font-medium">Due now</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Performance
                    </h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Rating:</span>
                        <span className="text-sm font-medium">4.2/5.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Projects:</span>
                        <span className="text-sm font-medium">
                          12 completed
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Skills:</span>
                        <span className="text-sm font-medium">
                          8 competencies
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-employee" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={handleStartAppraisal}
                >
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                  <span className="text-sm">Start Appraisal</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <Calendar className="w-6 h-6 text-green-600" />
                  <span className="text-sm">View Schedule</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                  <span className="text-sm">Performance</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <User className="w-6 h-6 text-orange-600" />
                  <span className="text-sm">Profile</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
