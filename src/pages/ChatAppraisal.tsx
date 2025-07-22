import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { X, ArrowLeft, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AppraisalService } from "@/lib/appraisalService";
import ChatInterface from "@/components/ChatInterface";
import { useChatAppraisal } from "@/hooks/useChatAppraisal";

const ChatAppraisal = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const {
    messages,
    currentInput,
    setCurrentInput,
    isComplete,
    isSubmitting,
    isLoading,
    progress,
    initializeAppraisal,
    handleSendMessage,
    handleSubmitAppraisal,
  } = useChatAppraisal();

  useEffect(() => {
    initializeAppraisal();
  }, [userProfile]);

  const handleCancelAppraisal = async () => {
    if (!userProfile) return;

    setIsCancelling(true);
    try {
      const success = await AppraisalService.cancelAllAppraisals(
        userProfile.id
      );

      if (success) {
        toast({
          title: "Success",
          description: "All your appraisal chats have been cancelled.",
          variant: "default",
        });
        navigate("/employee");
      } else {
        toast({
          title: "Error",
          description: "Failed to cancel appraisals. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error cancelling appraisals:", error);
      toast({
        title: "Error",
        description: "Failed to cancel appraisals. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
      setShowCancelDialog(false);
    }
  };

  const handleSubmitAndNavigate = async () => {
    const success = await handleSubmitAppraisal();
    if (success) {
      navigate("/employee");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card p-2 sm:p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/employee")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">
                  Self-Appraisal Chat
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Interactive performance evaluation
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right flex items-center gap-4">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Progress: {Math.round(progress)}%
                </p>
                <Progress value={progress} className="w-full sm:w-32 mt-1" />
              </div>
              <AlertDialog
                open={showCancelDialog}
                onOpenChange={setShowCancelDialog}
              >
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      Cancel Appraisal
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel your appraisal chat? This
                      action cannot be undone and all your progress will be
                      lost.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Working</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancelAppraisal}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={isCancelling}
                    >
                      {isCancelling ? "Cancelling..." : "Cancel Chat"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelDialog(true)}
                className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                disabled={isCancelling}
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {isCancelling ? "Cancelling..." : "Cancel"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 container mx-auto max-w-4xl p-2 sm:p-4">
        <ChatInterface
          messages={messages}
          currentInput={currentInput}
          onInputChange={setCurrentInput}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          isComplete={isComplete}
          onSubmit={handleSubmitAndNavigate}
          submitText={isSubmitting ? "Submitting..." : "Submit Appraisal"}
          placeholder="Type your response..."
          disabled={isSubmitting}
        />
      </div>
    </div>
  );
};

export default ChatAppraisal;
