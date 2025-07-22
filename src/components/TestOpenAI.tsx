import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { testOpenAIFunctionality } from '@/lib/test-openai';

const TestOpenAI: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleTest = async () => {
    setIsLoading(true);
    try {
      const success = await testOpenAIFunctionality();
      if (success) {
        toast({
          title: "Success",
          description: "OpenAI integration is working correctly!",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: "OpenAI integration test failed. Check console for details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Test error:", error);
      toast({
        title: "Error",
        description: "Failed to run OpenAI test. Make sure your API key is configured.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-2">OpenAI Integration Test</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Click the button below to test if the OpenAI integration is working properly.
      </p>
      <Button onClick={handleTest} disabled={isLoading}>
        {isLoading ? "Testing..." : "Test OpenAI"}
      </Button>
    </div>
  );
};

export default TestOpenAI;