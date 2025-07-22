import { supabase } from "@/integrations/supabase/client";
import { openaiClient } from "./openai";
import { Json } from "@/integrations/supabase/types";

export interface AppraisalData {
  id: string;
  employee_id: string;
  status:
    | "draft"
    | "submitted"
    | "team_lead_review"
    | "team_lead_approved"
    | "ai_analyzed"
    | "completed";
  raw_employee_text: Json | null;
  ai_analysis: Json | null;
  conversation_history?: Json | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export class AppraisalService {
  static async cancelAllAppraisals(employeeId: string): Promise<boolean> {
    try {
      // Update all draft appraisals to cancelled status
      const { error } = await supabase
        .from("appraisal_submissions")
        .update({
          status: "draft", // Reset to draft so they can be deleted
          raw_employee_text: null,
          ai_analysis: null,
          conversation_history: null,
        })
        .eq("employee_id", employeeId)
        .in("status", ["draft", "submitted"]);

      if (error) {
        console.error("Error cancelling appraisals:", error);
        return false;
      }

      // Delete draft appraisals
      const { error: deleteError } = await supabase
        .from("appraisal_submissions")
        .delete()
        .eq("employee_id", employeeId)
        .eq("status", "draft");

      if (deleteError) {
        console.error("Error deleting draft appraisals:", deleteError);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in cancelAllAppraisals:", error);
      return false;
    }
  }

  static async cancelCurrentAppraisal(appraisalId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("appraisal_submissions")
        .delete()
        .eq("id", appraisalId);

      if (error) {
        console.error("Error cancelling current appraisal:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in cancelCurrentAppraisal:", error);
      return false;
    }
  }

  static async getCurrentAppraisal(
    employeeId: string
  ): Promise<AppraisalData | null> {
    try {
      const { data, error } = await supabase
        .from("appraisal_submissions")
        .select("*")
        .eq("employee_id", employeeId)
        .eq("status", "draft")
        .maybeSingle();

      if (error) {
        console.error("Error fetching current appraisal:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in getCurrentAppraisal:", error);
      return null;
    }
  }

  static async saveAppraisalResponse(
    appraisalId: string,
    responses: Record<string, string>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("appraisal_submissions")
        .update({
          raw_employee_text: responses,
          updated_at: new Date().toISOString(),
        })
        .eq("id", appraisalId);

      if (error) {
        console.error("Error saving appraisal response:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in saveAppraisalResponse:", error);
      return false;
    }
  }

  static async saveConversationHistory(
    appraisalId: string,
    conversationHistory: ConversationMessage[]
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("appraisal_submissions")
        .update({
          conversation_history: conversationHistory,
          updated_at: new Date().toISOString(),
        })
        .eq("id", appraisalId);

      if (error) {
        console.error("Error saving conversation history:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in saveConversationHistory:", error);
      return false;
    }
  }

  static async submitAppraisal(appraisalId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("appraisal_submissions")
        .update({
          status: "submitted",
          submission_date: new Date().toISOString().split("T")[0],
          updated_at: new Date().toISOString(),
        })
        .eq("id", appraisalId);

      if (error) {
        console.error("Error submitting appraisal:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in submitAppraisal:", error);
      return false;
    }
  }

  static async generateAIAnalysis(
    responses: Record<string, string>
  ): Promise<string | null> {
    try {
      const analysis = await openaiClient.analyzeResponses(responses);
      return analysis;
    } catch (error) {
      console.error("Error generating AI analysis:", error);
      return null;
    }
  }

  static async generateAIAnalysisFromConversation(
    conversationHistory: ConversationMessage[]
  ): Promise<string | null> {
    try {
      // Extract user responses from conversation history
      const userResponses = conversationHistory
        .filter((msg) => msg.role === "user")
        .map((msg) => msg.content)
        .join("\n\n");

      const analysis = await openaiClient.analyzeResponses({
        conversation: userResponses,
      });
      return analysis;
    } catch (error) {
      console.error("Error generating AI analysis from conversation:", error);
      return null;
    }
  }

  static async updateAIAnalysis(
    appraisalId: string,
    analysis: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("appraisal_submissions")
        .update({
          ai_analysis: analysis,
          status: "ai_analyzed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", appraisalId);

      if (error) {
        console.error("Error updating AI analysis:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in updateAIAnalysis:", error);
      return false;
    }
  }

  static async getAppraisalWithConversation(
    appraisalId: string
  ): Promise<AppraisalData | null> {
    try {
      const { data, error } = await supabase
        .from("appraisal_submissions")
        .select("*")
        .eq("id", appraisalId)
        .single();

      if (error) {
        console.error("Error fetching appraisal with conversation:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in getAppraisalWithConversation:", error);
      return null;
    }
  }
}
