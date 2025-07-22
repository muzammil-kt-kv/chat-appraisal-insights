import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Send, Bot, User, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
  competency?: string;
}

interface CompetencyData {
  technical: string;
  functional: string;
  communication: string;
  energy_drive: string;
}

const competencyQuestions = {
  technical: "Please describe your key technical achievements, projects you worked on, and any new technologies you learned during this appraisal period. Be as specific as possible!",
  functional: "Great! Now, let's talk about your **Functional** contributions. How well did you understand the business requirements and user needs for your tasks? Provide examples of how your work impacted the product or user experience.",
  communication: "Next, let's focus on **Communication**. How effectively did you communicate with your team, stakeholders, or customers? Share examples of how you kept others informed or resolved misunderstandings.",
  energy_drive: "Lastly, tell me about your **Energy & Drive**. How proactive were you in learning, taking initiative, and contributing to team goals beyond your direct tasks? How do you adapt to feedback?"
};

const competencyOrder = ['technical', 'functional', 'communication', 'energy_drive'] as const;
const competencyLabels = {
  technical: 'Technical',
  functional: 'Functional',
  communication: 'Communication',
  energy_drive: 'Energy & Drive'
};

const ChatAppraisal = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentCompetency, setCurrentCompetency] = useState<keyof CompetencyData>('technical');
  const [competencyIndex, setCompetencyIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responses, setResponses] = useState<CompetencyData>({
    technical: '',
    functional: '',
    communication: '',
    energy_drive: ''
  });
  const [appraisalId, setAppraisalId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    initializeAppraisal();
  }, [userProfile]);

  const initializeAppraisal = async () => {
    if (!userProfile) return;

    try {
      // Check for existing draft appraisal
      const { data: existingAppraisal, error: fetchError } = await supabase
        .from('appraisal_submissions')
        .select('*')
        .eq('employee_id', userProfile.id)
        .eq('status', 'draft')
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching existing appraisal:', fetchError);
      }

      let appraisal = existingAppraisal;

      if (!appraisal) {
        // Create new draft appraisal
        const { data: newAppraisal, error: createError } = await supabase
          .from('appraisal_submissions')
          .insert({
            employee_id: userProfile.id,
            status: 'draft',
            raw_employee_text: {}
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating appraisal:', createError);
          toast({
            title: "Error",
            description: "Failed to initialize appraisal. Please try again.",
            variant: "destructive"
          });
          return;
        }
        appraisal = newAppraisal;
      }

      setAppraisalId(appraisal.id);

      // Load existing responses if any
      if (appraisal.raw_employee_text && typeof appraisal.raw_employee_text === 'object') {
        const existingResponses = appraisal.raw_employee_text as Partial<CompetencyData>;
        setResponses(prev => ({ ...prev, ...existingResponses }));
        
        // Find where we left off
        let lastCompetencyIndex = 0;
        competencyOrder.forEach((comp, index) => {
          if (existingResponses[comp]) {
            lastCompetencyIndex = index + 1;
          }
        });
        
        if (lastCompetencyIndex >= competencyOrder.length) {
          setIsComplete(true);
          setCompetencyIndex(competencyOrder.length);
        } else {
          setCompetencyIndex(lastCompetencyIndex);
          setCurrentCompetency(competencyOrder[lastCompetencyIndex]);
        }
      }

      // Initialize welcome message
      const welcomeMessage: Message = {
        id: '1',
        type: 'ai',
        content: `Hello ${userProfile.first_name}! Welcome to your self-appraisal. I'll guide you through different areas of your performance. Let's start with your **Technical** contributions.`,
        timestamp: new Date()
      };

      const firstQuestion: Message = {
        id: '2',
        type: 'ai',
        content: competencyQuestions.technical,
        timestamp: new Date(),
        competency: 'technical'
      };

      setMessages([welcomeMessage, firstQuestion]);

    } catch (error) {
      console.error('Error initializing appraisal:', error);
      toast({
        title: "Error",
        description: "Failed to initialize appraisal. Please try again.",
        variant: "destructive"
      });
    }
  };

  const saveResponse = async (competency: keyof CompetencyData, response: string) => {
    if (!appraisalId) return;

    const updatedResponses = { ...responses, [competency]: response };
    setResponses(updatedResponses);

    try {
      const { error } = await supabase
        .from('appraisal_submissions')
        .update({
          raw_employee_text: updatedResponses
        })
        .eq('id', appraisalId);

      if (error) {
        console.error('Error saving response:', error);
        toast({
          title: "Error",
          description: "Failed to save your response. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error saving response:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim() || isComplete) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentInput,
      timestamp: new Date(),
      competency: currentCompetency
    };

    setMessages(prev => [...prev, userMessage]);

    // Save the response
    await saveResponse(currentCompetency, currentInput);

    // Clear input
    setCurrentInput('');

    // Move to next competency
    const nextIndex = competencyIndex + 1;
    
    if (nextIndex >= competencyOrder.length) {
      // All competencies complete
      const completionMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "Excellent! You've completed all competency areas. Please review your responses and click 'Submit Appraisal' when you're ready to finalize your self-appraisal.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, completionMessage]);
      setIsComplete(true);
    } else {
      // Ask next question
      const nextCompetency = competencyOrder[nextIndex];
      const nextQuestion: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: competencyQuestions[nextCompetency],
        timestamp: new Date(),
        competency: nextCompetency
      };
      
      setMessages(prev => [...prev, nextQuestion]);
      setCurrentCompetency(nextCompetency);
      setCompetencyIndex(nextIndex);
    }
  };

  const handleSubmitAppraisal = async () => {
    if (!appraisalId) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('appraisal_submissions')
        .update({
          status: 'submitted',
          submission_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', appraisalId);

      if (error) {
        console.error('Error submitting appraisal:', error);
        toast({
          title: "Error",
          description: "Failed to submit appraisal. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Your appraisal has been submitted successfully!",
        variant: "default"
      });

      navigate('/employee');
    } catch (error) {
      console.error('Error submitting appraisal:', error);
      toast({
        title: "Error",
        description: "Failed to submit appraisal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const progress = (competencyIndex / competencyOrder.length) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Self-Appraisal Chat</h1>
              <p className="text-muted-foreground">Complete your performance evaluation</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                Competencies Covered: {competencyIndex}/{competencyOrder.length}
              </p>
              <Progress value={progress} className="w-32 mt-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 container mx-auto max-w-4xl p-4 overflow-hidden">
        <div className="h-full overflow-y-auto space-y-4 pb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div className={`flex items-start space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'ai' ? 'bg-primary' : 'bg-blue-600'
                }`}>
                  {message.type === 'ai' ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
                </div>
                <Card className={`${message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-card'}`}>
                  <CardContent className="p-3">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-blue-100' : 'text-muted-foreground'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
          
          {/* Competency Progress Indicators */}
          {competencyIndex > 0 && (
            <div className="flex justify-center space-x-4 py-4">
              {competencyOrder.map((comp, index) => (
                <div
                  key={comp}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
                    index < competencyIndex
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : index === competencyIndex
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index < competencyIndex && <CheckCircle className="w-3 h-3" />}
                  <span>{competencyLabels[comp]}</span>
                </div>
              ))}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-card p-4">
        <div className="container mx-auto max-w-4xl">
          {isComplete ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Your self-appraisal is complete! Review your responses above and submit when ready.
              </p>
              <Button
                onClick={handleSubmitAppraisal}
                disabled={isSubmitting}
                size="lg"
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Appraisal'}
              </Button>
            </div>
          ) : (
            <div className="flex space-x-4">
              <Textarea
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your response..."
                className="flex-1 min-h-[60px] resize-none"
                rows={2}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!currentInput.trim()}
                size="lg"
                className="px-6"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatAppraisal;