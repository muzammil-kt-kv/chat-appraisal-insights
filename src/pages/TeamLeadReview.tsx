import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle, XCircle, MessageSquare, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CompetencyData {
  technical: string;
  functional: string;
  communication: string;
  energy_drive: string;
}

interface ReviewQuestion {
  competency: keyof CompetencyData;
  question: string;
  employeeResponse: string;
  isCorrect?: boolean;
  reason?: string;
}

const competencyLabels = {
  technical: 'Technical',
  functional: 'Functional',
  communication: 'Communication',
  energy_drive: 'Energy & Drive'
};

const TeamLeadReview = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [appraisal, setAppraisal] = useState<any>(null);
  const [employee, setEmployee] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [reviews, setReviews] = useState<Record<string, { isCorrect: boolean; reason: string }>>({});
  const [generalComments, setGeneralComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (employeeId && userProfile) {
      fetchAppraisalData();
    }
  }, [employeeId, userProfile]);

  const fetchAppraisalData = async () => {
    try {
      // Fetch the employee's appraisal - look for submitted or team_lead_review status
      const { data: appraisalData, error: appraisalError } = await supabase
        .from('appraisal_submissions')
        .select(`
          *,
          employee:user_profiles!employee_id(*)
        `)
        .eq('employee_id', employeeId)
        .in('status', ['submitted', 'team_lead_review'])
        .maybeSingle();

      if (appraisalError) {
        console.error('Error fetching appraisal:', appraisalError);
        toast({
          title: "Error",
          description: "Failed to load appraisal data.",
          variant: "destructive"
        });
        return;
      }

      setAppraisal(appraisalData);
      setEmployee(appraisalData.employee);

      // Load existing review if any
      if (appraisalData.team_lead_review && typeof appraisalData.team_lead_review === 'object') {
        setReviews(appraisalData.team_lead_review as Record<string, { isCorrect: boolean; reason: string }>);
      }
      
      if (appraisalData.team_lead_comments) {
        setGeneralComments(appraisalData.team_lead_comments);
      }

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

  const questions: ReviewQuestion[] = appraisal?.raw_employee_text ? 
    Object.entries(appraisal.raw_employee_text as CompetencyData).map(([competency, response]) => ({
      competency: competency as keyof CompetencyData,
      question: `Review the employee's ${competencyLabels[competency as keyof CompetencyData]} response:`,
      employeeResponse: response
    })) : [];

  const currentQuestion = questions[currentQuestionIndex];

  const handleReviewResponse = (isCorrect: boolean, reason: string) => {
    if (!currentQuestion) return;

    setReviews(prev => ({
      ...prev,
      [currentQuestion.competency]: { isCorrect, reason }
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const submitReview = async () => {
    if (!appraisal || !userProfile) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('appraisal_submissions')
        .update({
          team_lead_review: reviews,
          team_lead_comments: generalComments,
          team_lead_reviewed_at: new Date().toISOString(),
          team_lead_reviewed_by: userProfile.id,
          status: 'team_lead_review'
        })
        .eq('id', appraisal.id);

      if (error) {
        console.error('Error submitting review:', error);
        toast({
          title: "Error",
          description: "Failed to submit review. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Review submitted successfully!",
        variant: "default"
      });

      navigate('/team-lead');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const reviewsCompleted = Object.keys(reviews).length;
  const allReviewsComplete = reviewsCompleted === questions.length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading appraisal data...</p>
        </div>
      </div>
    );
  }

  if (!appraisal || !employee) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Appraisal Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The requested appraisal could not be found or is not ready for review.
            </p>
            <Button onClick={() => navigate('/team-lead')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => navigate('/team-lead')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                Progress: {currentQuestionIndex + 1}/{questions.length}
              </p>
              <Progress value={progress} className="w-32 mt-1" />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-team-lead-muted rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-team-lead" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Review Appraisal</h1>
              <p className="text-muted-foreground">
                {employee.first_name} {employee.last_name} • {employee.role}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Review Content */}
      <div className="container mx-auto max-w-4xl p-4">
        {questions.length > 0 && currentQuestion && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-team-lead" />
                  {competencyLabels[currentQuestion.competency]}
                </CardTitle>
                <Badge variant="outline">
                  {currentQuestionIndex + 1} of {questions.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Employee Response */}
              <div>
                <h3 className="font-medium mb-2">Employee Response:</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{currentQuestion.employeeResponse}</p>
                </div>
              </div>

              {/* Review Questions */}
              <div className="space-y-4">
                <h3 className="font-medium">Your Review:</h3>
                
                <div className="space-y-3">
                  <p className="text-sm">Is this response appropriate and accurate?</p>
                  
                  <div className="flex gap-4">
                    <Button
                      variant={reviews[currentQuestion.competency]?.isCorrect === true ? "default" : "outline"}
                      onClick={() => handleReviewResponse(true, reviews[currentQuestion.competency]?.reason || '')}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Yes, it's correct
                    </Button>
                    
                    <Button
                      variant={reviews[currentQuestion.competency]?.isCorrect === false ? "destructive" : "outline"}
                      onClick={() => handleReviewResponse(false, reviews[currentQuestion.competency]?.reason || '')}
                      className="flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      No, needs improvement
                    </Button>
                  </div>
                </div>

                {reviews[currentQuestion.competency]?.isCorrect === false && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Why does this need improvement?</label>
                    <Textarea
                      value={reviews[currentQuestion.competency]?.reason || ''}
                      onChange={(e) => handleReviewResponse(false, e.target.value)}
                      placeholder="Explain what could be improved..."
                      className="min-h-[80px]"
                    />
                  </div>
                )}

                {reviews[currentQuestion.competency]?.isCorrect === true && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Additional comments (optional):</label>
                    <Textarea
                      value={reviews[currentQuestion.competency]?.reason || ''}
                      onChange={(e) => handleReviewResponse(true, e.target.value)}
                      placeholder="Any additional feedback..."
                      className="min-h-[60px]"
                    />
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={prevQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>
                
                <Button
                  onClick={nextQuestion}
                  disabled={currentQuestionIndex === questions.length - 1}
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* General Comments */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>General Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generalComments}
              onChange={(e) => setGeneralComments(e.target.value)}
              placeholder="Provide overall feedback on the employee's performance and appraisal..."
              className="min-h-[120px]"
            />
          </CardContent>
        </Card>

        {/* Submit Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span>Reviews Completed: {reviewsCompleted}/{questions.length}</span>
                {allReviewsComplete && <CheckCircle className="w-4 h-4 text-green-600" />}
              </div>
              
              <Button
                onClick={submitReview}
                disabled={!allReviewsComplete || isSubmitting}
                size="lg"
                className="bg-team-lead hover:bg-team-lead/90"
              >
                {isSubmitting ? 'Submitting Review...' : 'Submit Review'}
              </Button>
              
              {!allReviewsComplete && (
                <p className="text-sm text-muted-foreground">
                  Please complete reviews for all competencies before submitting.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamLeadReview;