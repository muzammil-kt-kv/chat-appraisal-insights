import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AppraisalService } from "@/lib/appraisalService";
import { openaiClient } from "@/lib/openai";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  type: "ai" | "user";
  content: string;
  timestamp: Date;
  competency?: string;
  isTyping?: boolean;
}

interface CompetencyData {
  technical: string;
  functional: string;
  ai_adoption: string;
  communication: string;
  energy_drive: string;
  responsibilities_trust: string;
  teamwork: string;
  managing_processes_work: string;
}

interface CoverageAnalysis {
  covered_areas: Array<{
    area: string;
    explanation: string;
  }>;
  total_areas_covered: number;
  summary: string;
}

export const useChatAppraisal = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responses, setResponses] = useState<CompetencyData>({
    technical: "",
    functional: "",
    ai_adoption: "",
    communication: "",
    energy_drive: "",
    responsibilities_trust: "",
    teamwork: "",
    managing_processes_work: "",
  });
  const [appraisalId, setAppraisalId] = useState<string>("");
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<string>("");
  const [coverageAnalysis, setCoverageAnalysis] =
    useState<CoverageAnalysis | null>(null);

  const addTypingIndicator = () => {
    const typingMessage: Message = {
      id: `typing-${Date.now()}`,
      type: "ai",
      content: "",
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages((prev) => [...prev, typingMessage]);
  };

  const removeTypingIndicator = () => {
    setMessages((prev) => prev.filter((msg) => !msg.isTyping));
  };

  const initializeAppraisal = async () => {
    if (!userProfile) return;

    try {
      // Check for existing draft appraisal
      const existingAppraisal = await AppraisalService.getCurrentAppraisal(
        userProfile.id
      );

      let appraisal = existingAppraisal;

      if (!appraisal) {
        // Create new draft appraisal
        const { data: newAppraisal, error: createError } = await supabase
          .from("appraisal_submissions")
          .insert({
            employee_id: userProfile.id,
            status: "draft",
            raw_employee_text: {},
          })
          .select()
          .single();

        if (createError) {
          console.error("Error creating appraisal:", createError);
          toast({
            title: "Error",
            description: "Failed to initialize appraisal. Please try again.",
            variant: "destructive",
          });
          return;
        }
        appraisal = newAppraisal;
      }

      setAppraisalId(appraisal.id);

      // Load existing responses if any
      if (
        appraisal.raw_employee_text &&
        typeof appraisal.raw_employee_text === "object"
      ) {
        const existingResponses =
          appraisal.raw_employee_text as Partial<CompetencyData>;
        setResponses((prev) => ({ ...prev, ...existingResponses }));

        // Reconstruct conversation history from existing responses
        const history: Array<{ role: "user" | "assistant"; content: string }> =
          [];
        Object.entries(existingResponses).forEach(([competency, response]) => {
          if (response) {
            history.push({
              role: "assistant",
              content: `Tell me about your ${competency}.`,
            });
            history.push({ role: "user", content: response });
          }
        });
        setConversationHistory(history);
      }

      // Generate questions using the new functionality
      try {
        const questionsResponse = await openaiClient.questionGenPrompt();
        if (questionsResponse) {
          setGeneratedQuestions(questionsResponse);

          // Parse questions and start with the first one
          try {
            const questionsData = JSON.parse(questionsResponse);
            if (questionsData.questions && questionsData.questions.length > 0) {
              const firstQuestion = questionsData.questions[0].question;

              const welcomeMessage: Message = {
                id: "1",
                type: "ai",
                content: `Hello ${userProfile.first_name}! Welcome to your self-appraisal. I'm here to help you reflect on your performance across different areas. Let's start with our first question:\n\n${firstQuestion}`,
                timestamp: new Date(),
              };

              setMessages([welcomeMessage]);
              return;
            }
          } catch (parseError) {
            console.error("Error parsing questions:", parseError);
          }
        }
      } catch (error) {
        console.error("Error generating questions:", error);
      }

      // Fallback welcome message
      const welcomeMessage: Message = {
        id: "1",
        type: "ai",
        content: `Hello ${userProfile.first_name}! Welcome to your self-appraisal. I'm here to help you reflect on your performance across different areas. Let's start with a conversation about your work experience. What would you like to tell me about your recent contributions and achievements?`,
        timestamp: new Date(),
      };

      setMessages([welcomeMessage]);
    } catch (error) {
      console.error("Error initializing appraisal:", error);
      toast({
        title: "Error",
        description: "Failed to initialize appraisal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const analyzeCoverage = async (
    userResponse: string
  ): Promise<CoverageAnalysis | null> => {
    try {
      const coverageResponse = await openaiClient.chatCoverage(userResponse);
      if (coverageResponse) {
        try {
          const analysis = JSON.parse(coverageResponse) as CoverageAnalysis;
          setCoverageAnalysis(analysis);
          return analysis;
        } catch (parseError) {
          console.error("Error parsing coverage analysis:", parseError);
        }
      }
    } catch (error) {
      console.error("Error analyzing coverage:", error);
    }
    return null;
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim() || isComplete || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: currentInput,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Update conversation history
    const newHistory = [
      ...conversationHistory,
      { role: "user" as const, content: currentInput },
    ];
    setConversationHistory(newHistory);

    // Clear input immediately
    setCurrentInput("");
    setIsLoading(true);
    addTypingIndicator();

    try {
      // Analyze coverage of the user's response
      const coverage = await analyzeCoverage(currentInput);

      // Use the new conversation chat with question prompt
      const questionPrompt =
        openaiClient.questionChatPrompt(generatedQuestions);
      const aiResponse = await openaiClient.conversationChat(
        questionPrompt,
        newHistory,
        currentInput
      );

      removeTypingIndicator();

      if (aiResponse) {
        // Parse JSON question format if present
        let displayContent = aiResponse;
        try {
          const parsed = JSON.parse(aiResponse);
          if (parsed.question) {
            displayContent = parsed.question;
          }
        } catch {
          // Not JSON, use as is
        }

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: displayContent,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMessage]);

        // Update conversation history with AI response
        const updatedHistory = [
          ...newHistory,
          { role: "assistant" as const, content: aiResponse },
        ];
        setConversationHistory(updatedHistory);

        // Save conversation history
        if (appraisalId) {
          await AppraisalService.saveConversationHistory(
            appraisalId,
            updatedHistory
          );
        }

        // Check if the conversation is complete
        if (
          aiResponse.toLowerCase().includes("thank you") &&
          aiResponse.toLowerCase().includes("end")
        ) {
          const completionMessage: Message = {
            id: (Date.now() + 2).toString(),
            type: "ai",
            content:
              "Thank you for sharing your experiences! I have enough information to complete your self-appraisal. Would you like to review your responses and submit your appraisal?",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, completionMessage]);
          setIsComplete(true);
        } else {
        }
      } else {
        removeTypingIndicator();
        toast({
          title: "Error",
          description: "Failed to get AI response. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      removeTypingIndicator();
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAppraisal = async () => {
    if (!appraisalId) return;

    setIsSubmitting(true);
    try {
      const success = await AppraisalService.submitAppraisal(appraisalId);

      if (!success) {
        toast({
          title: "Error",
          description: "Failed to submit appraisal. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Generate AI analysis from conversation history
      try {
        const analysis =
          await AppraisalService.generateAIAnalysisFromConversation(
            conversationHistory
          );
        if (analysis) {
          await AppraisalService.updateAIAnalysis(appraisalId, analysis);
        }
      } catch (error) {
        console.error("Error generating AI analysis:", error);
      }

      toast({
        title: "Success",
        description: "Your appraisal has been submitted successfully!",
        variant: "default",
      });

      return true;
    } catch (error) {
      console.error("Error submitting appraisal:", error);
      toast({
        title: "Error",
        description: "Failed to submit appraisal. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = Math.min(
    (Object.values(responses).filter((r) => r.trim() !== "").length / 8) * 100,
    100
  );

  return {
    messages,
    currentInput,
    setCurrentInput,
    isComplete,
    isSubmitting,
    isLoading,
    progress,
    appraisalId,
    coverageAnalysis,
    initializeAppraisal,
    handleSendMessage,
    handleSubmitAppraisal,
  };
};
