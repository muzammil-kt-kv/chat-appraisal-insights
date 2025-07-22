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
  isTyping?: boolean;
}

interface Question {
  question: string;
}

interface QuestionsResponse {
  questions: Question[];
}

interface CoverageAnalysis {
  covered_areas: Array<{
    area: string;
    explanation: string;
  }>;
  total_areas_covered: number;
  summary: string;
}

export const useQuestionBasedChat = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appraisalId, setAppraisalId] = useState<string>("");
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [coverageAnalysis, setCoverageAnalysis] =
    useState<CoverageAnalysis | null>(null);
  const [questionPrompt, setQuestionPrompt] = useState<string>("");

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

  const generateQuestions = async (): Promise<Question[]> => {
    try {
      const response = await openaiClient.questionGenPrompt();
      if (response) {
        const questionsData: QuestionsResponse = JSON.parse(response);
        return questionsData.questions || [];
      }
    } catch (error) {
      console.error("Error generating questions:", error);
    }
    return [];
  };

  const analyzeCoverage = async (
    userResponse: string
  ): Promise<CoverageAnalysis | null> => {
    try {
      const coverageResponse = await openaiClient.chatCoverage(userResponse);
      if (coverageResponse) {
        const analysis = JSON.parse(coverageResponse) as CoverageAnalysis;
        setCoverageAnalysis(analysis);
        return analysis;
      }
    } catch (error) {
      console.error("Error analyzing coverage:", error);
    }
    return null;
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

      // Load existing conversation history if any
      if (appraisal.conversation_history) {
        const history = appraisal.conversation_history as Array<{
          role: "user" | "assistant";
          content: string;
        }>;
        setConversationHistory(history);

        // Reconstruct messages from history
        const reconstructedMessages: Message[] = [];
        history.forEach((entry, index) => {
          const message: Message = {
            id: index.toString(),
            type: entry.role === "user" ? "user" : "ai",
            content: entry.content,
            timestamp: new Date(),
          };
          reconstructedMessages.push(message);
        });
        setMessages(reconstructedMessages);

        // Check if conversation is complete
        if (
          history.length > 0 &&
          history[history.length - 1].content
            .toLowerCase()
            .includes("thank you")
        ) {
          setIsComplete(true);
        }
      } else {
        // Generate new questions
        const generatedQuestions = await generateQuestions();
        setQuestions(generatedQuestions);

        if (generatedQuestions.length > 0) {
          const firstQuestion = generatedQuestions[0].question;
          setQuestionPrompt(
            openaiClient.questionChatPrompt(
              JSON.stringify({ questions: generatedQuestions })
            )
          );

          const welcomeMessage: Message = {
            id: "1",
            type: "ai",
            content: `Hello ${userProfile.first_name}! Welcome to your self-appraisal. I'm here to help you reflect on your performance across different areas. Let's start with our first question:\n\n${firstQuestion}`,
            timestamp: new Date(),
          };

          setMessages([welcomeMessage]);
        } else {
          // Fallback welcome message
          const welcomeMessage: Message = {
            id: "1",
            type: "ai",
            content: `Hello ${userProfile.first_name}! Welcome to your self-appraisal. I'm here to help you reflect on your performance across different areas. Let's start with a conversation about your work experience. What would you like to tell me about your recent contributions and achievements?`,
            timestamp: new Date(),
          };

          setMessages([welcomeMessage]);
        }
      }
    } catch (error) {
      console.error("Error initializing appraisal:", error);
      toast({
        title: "Error",
        description: "Failed to initialize appraisal. Please try again.",
        variant: "destructive",
      });
    }
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
      await analyzeCoverage(currentInput);

      // Use the question-based conversation chat
      const aiResponse = await openaiClient.conversationChat(
        questionPrompt,
        newHistory,
        currentInput
      );

      removeTypingIndicator();

      if (aiResponse) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: aiResponse,
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
          // Move to next question
          setCurrentQuestionIndex((prev) => prev + 1);
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
    (currentQuestionIndex / Math.max(questions.length, 8)) * 100,
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
    currentQuestionIndex,
    totalQuestions: questions.length,
    initializeAppraisal,
    handleSendMessage,
    handleSubmitAppraisal,
  };
};
