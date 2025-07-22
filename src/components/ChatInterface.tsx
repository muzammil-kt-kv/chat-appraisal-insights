import React, { useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Bot, User, Loader2 } from "lucide-react";

interface Message {
  id: string;
  type: "ai" | "user";
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface ChatInterfaceProps {
  messages: Message[];
  currentInput: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  isLoading?: boolean;
  isComplete?: boolean;
  onSubmit?: () => void;
  submitText?: string;
  placeholder?: string;
  disabled?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  currentInput,
  onInputChange,
  onSendMessage,
  isLoading = false,
  isComplete = false,
  onSubmit,
  submitText = "Submit",
  placeholder = "Type your message...",
  disabled = false,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && !disabled) {
        onSendMessage();
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 pb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.type === "user" ? "justify-end" : "justify-start"
            } animate-fade-in px-2 sm:px-0`}
          >
            <div
              className={`flex items-start space-x-2 max-w-[90%] sm:max-w-[80%] ${
                message.type === "user"
                  ? "flex-row-reverse space-x-reverse"
                  : ""
              }`}
            >
              <div
                className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                  message.type === "ai" ? "bg-primary" : "bg-blue-600"
                }`}
              >
                {message.type === "ai" ? (
                  message.isTyping ? (
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 text-white animate-spin" />
                  ) : (
                    <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  )
                ) : (
                  <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                )}
              </div>
              <Card
                className={`${
                  message.type === "user" ? "bg-blue-600 text-white" : "bg-card"
                }`}
              >
                <CardContent className="p-2 sm:p-3">
                  {message.isTyping ? (
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  )}
                  <p
                    className={`text-xs mt-1 ${
                      message.type === "user"
                        ? "text-blue-100"
                        : "text-muted-foreground"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-card p-2 sm:p-4">
        {isComplete ? (
          <div className="text-center space-y-4">
            <p className="text-sm sm:text-base text-muted-foreground px-2">
              Your conversation is complete! Review your responses above and
              submit when ready.
            </p>
            {onSubmit && (
              <Button
                onClick={onSubmit}
                size="lg"
                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
              >
                {submitText}
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <Textarea
              value={currentInput}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="flex-1 min-h-[60px] resize-none text-sm"
              rows={2}
              disabled={isLoading || disabled}
            />
            <Button
              onClick={onSendMessage}
              disabled={!currentInput.trim() || isLoading || disabled}
              size="lg"
              className="px-6 w-full sm:w-auto"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span className="ml-2 sm:hidden">
                {isLoading ? "Sending..." : "Send"}
              </span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
