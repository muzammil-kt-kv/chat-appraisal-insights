import OpenAI from "openai";

// Competency matrix from the Python file
const COMPETENCY_MATRIX = {
  levels: {
    underperforming: { range: "< 6", description: "Underperforming" },
    needs_improvement: { range: "6.5 - 7", description: "Needs Improvement" },
    meets_expectation: { range: "7.5 - 8", description: "Meets Expectation" },
    above_expectation: { range: "8.5 - 9", description: "Above Expectation" },
    exceptional: { range: "9.5 - 10", description: "Exceptional Performance" },
  },
  categories: {
    technical: {
      underperforming: [
        "Not able to write code as per specifications.",
        "Checks in code that does not work but gives the impression that everything is done well.",
        "Repeats the same mistakes even after reviews and feedback.",
      ],
      needs_improvement: [
        "Heavy handholding needed technically and functionally to complete the work.",
        "Unit testing of the assigned task has to be improved.",
      ],
      meets_expectation: [
        "Delivers executable code on time but needs to improve to meet Company standards on quality or coding standards/guidelines or timelines.",
        "Additionally for QA: Fair handling of test data, both for automation and manual testing.",
      ],
      above_expectation: [
        "Delivers executable code in the specified time meeting Company standards on quality, coding standards/ guidelines/ best practices.",
        "Good Unit testing skills.",
        "Learns and improves on feedback.",
        "Only minimum handholding needed.",
        "Additionally for QA: Optimized handling of test data, both for automation and manual testing.",
        "Keeping the environment/data ready for every iteration of testing.",
        "Able to close-in on the areas of bottlenecks/issues.",
        "Able to identify the scenarios where overlapping features are being developed",
      ],
      exceptional: [
        "Fast learner, deep understanding on technology, constant improvement, takes code refactoring and tech debts on own initiative.",
        "Good understanding on overall architecture and the importance what his piece and every piece has in the overall system.",
        "Additionally for QA: Excellent knowledge on analyzing the performance metrics.",
        "Identifies performance bottlenecks and suggests improvement areas",
      ],
    },
    functional: {
      underperforming: [
        "Does not understand or show interest in understanding functionality or use cases.",
      ],
      needs_improvement: [
        "Does not try to understand the functionality.",
        "But completes the tasks with incomplete knowledge.",
      ],
      meets_expectation: [
        "Understands what one is trying to achieve in the task given to them, completes with good level feature testing.",
        "Misses dependent changes that will get affected due to this change as there is lack of overall knowledge.",
      ],
      above_expectation: [
        "Understanding the complete features & functionality of the specific component(s) that one is working on and how it fits in the big picture.",
        "Understands the connected pieces and the areas that would get affected due to this change.",
        "Additionally for QA: Good quality bugs, both functional and technical.",
        "Able to identify the scenarios where overlapping features are being developed.",
        "Tries to find the exact pattern/scenario where the defects occur, if they are occasional ones.",
      ],
      exceptional: [
        "Backward compatibility and data migration is thought over and handled.",
        "Tries to understand the product from the end customer perspective.",
        "Complete user empathy along with end to end understanding of the product.",
        "Gives suggestions to improve the overall experience, quality, efficiency or effectiveness of the Product.",
        "This could be UI Changes, performance improvements etc.",
        "Additionally for QA: Identifying the dependencies between components and features and proactively creating test scenarios for the same",
      ],
    },
    ai_adoption: {
      underperforming: [],
      needs_improvement: [],
      meets_expectation: [
        "Aware of common AI productivity tools available to developers (GitHub Copilot, Cursor, Windsurf, ChatGPT, etc.) and use at least one of them.",
        "Use AI tools for repetitive coding, testcase generation and documentation.",
        "Leverage AI tools for clean code and upskilling.",
      ],
      above_expectation: [
        "Effective in Prompt engineering.",
        "Actively seek to learn about new AI tools that could improve their productivity and use them.",
        "Share new AI tools or techniques they learn with their peers.",
        "Participate in team discussions about AI tool usage and best practices.",
        "Spread the awareness and be a sort of evangelist among their peers for using them.",
      ],
      exceptional: [
        "Excellent in Prompt engineering. Use a combination of AI tools in their work to increase their productivity.",
        "Effectively use their freed-up time to participate in GnT, upskill themselves, or make themselves available for the organisation.",
      ],
    },
    communication: {
      underperforming: [
        "Does not convey when taking leave or when unavailable. Often unavailable on chat platforms, slack and meetings.",
      ],
      needs_improvement: [
        "Does not convey when his task is completed or when he is unable to progress on the task.",
        "Does not give update on regarding the progress in stand up meetings.",
        "Cannot clearly communicate on the task assigned.",
        "Needs to involve more in discussions, grooming sessions.",
      ],
      meets_expectation: [
        "Clarifies doubts, ask questions and complete the tasks.",
        "Available on chat platforms.",
        "Interested in participating in discussions.",
        "Not proactive to start a discussion in a group/forum, but responds well when asked for.",
        "Raising concerns as and when required.",
        "Should improve on listening skills.",
      ],
      above_expectation: [
        "Actively participates in discussions individually/forum.",
        "Reads and understands the PRD well.",
        "Good listening skills - able to understand what is being told.",
        "Communicates clearly on expectations, as well as what was achieved and how it was achieved.",
        "Good written and verbal communication in English.",
        "Good at setting expectations and communicating what will and will not be done.",
      ],
      exceptional: [
        "Articulates well with clients and the team.",
        "Concisely writes down in Jira or project management tools.",
        "Good presentation and demo skills.",
        "Saying No politely when required.",
        "Smooth interaction within the team/colleagues/customer.",
        "Excellent written & verbal skills.",
        "Polished and objective communication.",
        "Communicating with empathy and with full understanding of the situation.",
        "Communicating using data points as well as using proper sequencing.",
      ],
    },
    energy_drive: {
      underperforming: [
        "Not open to feedback.",
        "No change even after providing feedback.",
      ],
      needs_improvement: [
        "Needs to be more proactive.",
        "Can be more open for feedback.",
        "Needs to take more initiative to learn and improve oneself.",
      ],
      meets_expectation: [
        "Proactive.",
        "Takes initiative to learn and improve oneself.",
        "Does whatever is in ones hands for the team to deliver expected goals on time.",
      ],
      above_expectation: [
        "Goes the extra mile to help the team deliver on time.",
        "Open to take up any kind of task to make it happen.",
        "Always available for the team.",
      ],
      exceptional: [
        "Positively accepts or seeks out new challenges and projects.",
        "Goes the extra mile proactively in providing better solutions/suggestions. Helps in training and mentoring others, takes sessions and workshops, give & take, KV chapters.",
        "Participates actively in KV activities.",
        "Gives feedback to the team as well as to the other team members.",
      ],
    },
    responsibilities_trust: {
      underperforming: [
        "Unable to stick by the commitments made for the deliverables assigned.",
        "Defends & unable to accept mistakes if pointed out.",
      ],
      needs_improvement: [
        "Usually sticks by the commitments made but there has been instances of missing out on things.",
        "Needs follow up.",
      ],
      meets_expectation: [
        "Does what he or she says will do without any follow ups.",
      ],
      above_expectation: [
        "Stands by and delivers to commitments made.",
        "Admits mistakes and takes personal accountability for correcting them.",
        "Handles feedback openly and constructively.",
        "Proactively does smoke testing after the release and keeps a watch on crashes.",
        "Actively gets involved in first line support mechanism.",
      ],
      exceptional: [
        "Spends extra effort to make sure the team delivers above expectations.",
        "Covers when there are issues in the team, Company or with team mates with extra effort.",
        "Additionally for QA: Taking ownership of the product and able to certify it's quality before the software gets into production.",
      ],
    },
    teamwork: {
      underperforming: [
        "Lacks in syncing/updating the team.",
        "Lacks in bonding or in creating a healthy co worker relationship.",
        "Makes themselves unavailable to plan or organize any company or team events",
      ],
      needs_improvement: [
        "Not very active but available for internal stand up calls.",
        "Can build more bonding among co workers.",
      ],
      meets_expectation: [
        "Interacts well within the team, helps others and is available to help.",
        "Good rapport with developers/testers/leads",
      ],
      above_expectation: [
        "Supports the team well.",
        "Shows empathy to the team (both professional and personal).",
        "Proactively supports other members who are loaded with their tasks.",
        "Active participation in organizing and planning events for the team and company.",
        "Sharing knowledge across the floor (KT session)",
      ],
      exceptional: [
        "Spends extra effort to make sure the team delivers above expectations.",
        "Covers when there are issues in the team, Company or with team mates with extra effort.",
      ],
    },
    managing_processes_work: {
      underperforming: [
        "Has consistent availability issues.",
        "Does not participate in daily stand ups and other meetings on time.",
      ],
      needs_improvement: [
        "Is not able to finish work on time.",
        "Has difficulty in understanding priorities, needs intervention at some cases.",
        "Does not consistently follow processes (like updating Jira board) on time.",
      ],
      meets_expectation: [
        "Participates in meetings and standups.",
        "Prioritizes tasks and does what is necessary to accomplish them on time.",
        "Clarifies and reorganize when priorities are not clear.",
        "Updates the progress of the task in Jira or other related tools",
        "Additionally for QA: Ready with acceptance criteria for all the features and validate them with the stakeholders.",
        "Tickets have clear 'steps to reproduce', including the details of the environment like OS, Browser version etc. with supporting screenshots.",
        "Follows up on tickets.",
        "Assesses criticality of the defects with help.",
      ],
      above_expectation: [
        "Plans upfront.",
        "Able to manage well the assigned tasks along with non-project related tasks(KT events, chapters etc.)",
        "Additionally for QA: Documenting the health of the software before release.",
        "Should be able to assess the criticality of defects without help, also should be able to reason out when required.",
      ],
      exceptional: [
        "Anticipates potential problems or concerns that may arise for upcoming tasks and takes action for their quick resolution.",
        "Maintain version history of every release/hotfixes with details of features rolled out",
      ],
    },
  },
};

const QUESTION_GEN_PROMPT = `You are an expert assistant conducting employee self-reviews. Your goal is to gather comprehensive information about an employee's performance across different competency areas.
Look at the competency matrix and generate questions for the employee to answer. The number of questions should be equal to the number of competency areas.

Competency matrix are:
${JSON.stringify(COMPETENCY_MATRIX, null, 2)}

Generated questions should be in the following format:
{
  "questions": [
    {
      "question": "Question text"
    }
  ]
}

Competency areas are:
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
Ask only one question at a time.`;

const ANSWER_EVAL_PROMPT = `
Analyze the following content and identify which competency areas are covered. Return your response in JSON format.

Competency Areas to evaluate:
1. Technical Skills - coding, testing, technical problem-solving, code quality, technical learning
2. Functional Understanding - business logic comprehension, feature understanding, user perspective
3. AI Adoption - use of AI tools, prompt engineering, AI productivity improvements
4. Communication - written/verbal communication, team interactions, stakeholder communication
5. Energy & Drive - initiative, proactiveness, learning attitude, feedback acceptance
6. Responsibilities & Trust - commitment delivery, accountability, reliability
7. Teamwork - collaboration, support for colleagues, team participation
8. Managing Processes & Work - time management, process adherence, prioritization

Respond with JSON in this exact format:
{
  "covered_areas": [
    {
      "area": "Technical Skills",
      "explanation": "Brief explanation of what technical aspects were mentioned"
    }
  ],
  "total_areas_covered": 1,
  "summary": "Brief overall summary of the content coverage"
}

If no specific areas are clearly covered, return:
{
  "covered_areas": [],
  "total_areas_covered": 0,
  "summary": "No specific competency areas clearly identified"
}

Don't add any preamble or postamble to your response.
Content to analyze:`;

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

  async questionGenPrompt(
    model: string = "gpt-4o-mini"
  ): Promise<string | null> {
    const messages = [
      { role: "assistant" as const, content: QUESTION_GEN_PROMPT },
    ];
    return this.chatCompletion(messages, model);
  }

  questionChatPrompt(questions: string): string {
    return `
      You are an expert assistant conducting employee self-reviews. Your goal is to gather comprehensive information about an employee's performance across different competency areas.
      Here are the questions for the employee to answer:
      ${questions}
      If the employee already answered the question which contains answer of all other questions do not continue just say thank you and end the conversation.
      Otherwise Please ask the next questions one by one.
      In the given format:  
      {"question": "Question text"}
      Please ask the questions one by one.
      Question:  
    `;
  }

  async conversationChat(
    questionPrompt: string,
    conversationHistory: Array<{ role: "user" | "assistant"; content: string }>,
    userMessage: string,
    model: string = "gpt-4o-mini"
  ): Promise<string | null> {
    const messages = [
      { role: "system" as const, content: questionPrompt },
      ...conversationHistory,
      { role: "user" as const, content: userMessage }
    ];
    return this.chatCompletion(messages, model);
  }

  async chatCoverage(
    userMessage: string,
    model: string = "gpt-4o-mini"
  ): Promise<string | null> {
    const messages = [
      { role: "user" as const, content: ANSWER_EVAL_PROMPT + "\n\n" + userMessage },
    ];
    return this.chatCompletion(messages, model);
  }

  async conversationChatLegacy(
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

// Create a singleton instance with API key validation
const getOpenAIApiKey = (): string => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey || apiKey === "sk-test") {
    console.warn("⚠️ OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in your environment variables.");
    return "sk-test"; // Fallback for development
  }
  
  return apiKey;
};

const openaiClient = new OpenAIClient(getOpenAIApiKey());

export { openaiClient, OpenAIClient, COMPETENCY_MATRIX };
export type { OpenAI };
