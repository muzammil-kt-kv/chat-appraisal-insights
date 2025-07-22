import OpenAI from "openai";

const SYSTEM_PROMPT = `You are an expert assistant conducting employee self-reviews. Your goal is to gather comprehensive information about an employee's performance across different competency areas.`;

const COMPETENCY_AREAS = `
1. Technical Skills
2. Functional Understanding
3. AI Adoption
4. Communication
5. Energy & Drive
6. Responsibilities & Trust
7. Teamwork
8. Managing Processes & Work

GUIDELINES FOR CREATING QUESTIONS:
1. **Start Broad, Then Dive Deep**: Begin with open-ended questions that allow employees to share their experiences, then follow up with specific probing questions.
2. **Use Behavioral Questions**: Ask for specific examples, situations, and outcomes rather than general opinions.
3. **Focus on Recent Performance**: Ask about the last few months of work.
4. **Encourage Self-Reflection**: Questions should prompt employees to think critically about their performance.
5. **Be Professional but Conversational**: Maintain a professional tone while being approachable.
6. **Ask for Quantifiable Examples**: When possible, ask for metrics, timelines, or specific achievements.
7. **Cover Both Strengths and Areas for Improvement**: Balance positive and developmental questions.

SAMPLE QUESTION FRAMEWORKS:
- What are your technical contributions?
- What are your functional contributions?

Generate questions that will help gather comprehensive information about the employee's performance while maintaining a professional and supportive conversation flow.
Ask only one question at a time.
Don't stick to one topic for more than 2 questions.
`;

class OpenAIClient {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true, // Note: In production, this should be handled server-side
    });
  }

  async chatCompletion(
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
    model: string = "gpt-4o-mini",
    maxTokens: number = 1000,
    temperature: number = 0.5
  ): Promise<string | null> {
    try {
      const response = await this.client.chat.completions.create({
        model: model,
        messages: messages,
        max_tokens: maxTokens,
        temperature: temperature,
      });
      return response.choices[0]?.message?.content || null;
    } catch (error) {
      console.error("Error in chat completion:", error);
      return null;
    }
  }

  async conversationChat(
    conversationHistory: Array<{ role: "user" | "assistant"; content: string }>,
    userMessage: string,
    model: string = "gpt-4o-mini"
  ): Promise<string | null> {
    const messages = [
      { role: "system" as const, content: SYSTEM_PROMPT + COMPETENCY_AREAS },
      ...conversationHistory,
      { role: "user" as const, content: userMessage },
    ];

    return this.chatCompletion(messages, model);
  }

  async generateFollowUpQuestion(
    competency: string,
    previousResponse: string,
    conversationHistory: Array<{ role: "user" | "assistant"; content: string }>,
    model: string = "gpt-4o-mini"
  ): Promise<string | null> {
    const prompt = `Based on the employee's response about ${competency}: "${previousResponse}", generate a thoughtful follow-up question that digs deeper into their ${competency} performance. The question should be specific, actionable, and help gather more detailed information.`;

    const messages = [
      { role: "system" as const, content: SYSTEM_PROMPT + COMPETENCY_AREAS },
      ...conversationHistory,
      { role: "user" as const, content: prompt },
    ];

    return this.chatCompletion(messages, model);
  }

  async analyzeResponses(
    responses: Record<string, string>,
    model: string = "gpt-4o-mini"
  ): Promise<string | null> {
    const prompt = `Analyze the following employee self-appraisal responses and provide a comprehensive analysis:

${Object.entries(responses)
  .map(([competency, response]) => `${competency}: ${response}`)
  .join("\n\n")}

Please provide:
1. Key strengths identified
2. Areas for improvement
3. Overall assessment
4. Recommendations for development

Keep the analysis professional and constructive.`;

    const messages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      { role: "user" as const, content: prompt },
    ];

    return this.chatCompletion(messages, model, 1500);
  }
}

// Create a singleton instance
const openaiClient = new OpenAIClient(
  "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"
);

export { openaiClient, OpenAIClient };
export type { OpenAI };
