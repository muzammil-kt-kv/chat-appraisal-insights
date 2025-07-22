import { openaiClient } from "./openai";

// Test function to verify the new functionality
export const testOpenAIFunctionality = async () => {
  console.log("Testing OpenAI functionality...");

  try {
    // Test question generation
    console.log("Testing question generation...");
    const questionsResponse = await openaiClient.questionGenPrompt();
    console.log("Questions response:", questionsResponse);

    // Test coverage analysis
    console.log("Testing coverage analysis...");
    const testResponse =
      "I have been working on improving my technical skills by writing clean code and following best practices. I also communicate well with my team and take initiative on projects.";
    const coverageResponse = await openaiClient.chatCoverage(testResponse);
    console.log("Coverage response:", coverageResponse);

    // Test conversation chat
    console.log("Testing conversation chat...");
    const questionPrompt = openaiClient.questionChatPrompt(
      questionsResponse || ""
    );
    const conversationResponse = await openaiClient.conversationChat(
      questionPrompt,
      [],
      "I have been working on improving my technical skills."
    );
    console.log("Conversation response:", conversationResponse);

    console.log("All tests completed successfully!");
    return true;
  } catch (error) {
    console.error("Test failed:", error);
    return false;
  }
};
