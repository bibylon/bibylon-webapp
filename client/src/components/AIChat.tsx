import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft,
  Send,
  Mic,
  Paperclip,
  Brain,
  Lightbulb,
  HelpCircle,
  Calendar
} from "lucide-react";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  context?: any;
}

interface AIChatProps {
  onClose: () => void;
  initialMessage?: string;
  context?: any;
}

const quickActions = [
  { id: "explain", label: "Explain", icon: Lightbulb, prompt: "Can you explain this concept in simple terms?" },
  { id: "tricks", label: "Memory Tricks", icon: Brain, prompt: "Give me memory tricks for this topic" },
  { id: "quiz", label: "Quiz Me", icon: HelpCircle, prompt: "Create a quick quiz on this topic" },
  { id: "schedule", label: "Schedule", icon: Calendar, prompt: "Help me schedule this in my study plan" },
];

export default function AIChat({ onClose, initialMessage, context }: AIChatProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [selectedMode, setSelectedMode] = useState<"normal" | "simple" | "detailed">("normal");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: chatHistory } = useQuery({
    queryKey: ["/api/ai/chat/history", { limit: 10 }],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, context }: { message: string; context?: any }) => {
      const response = await apiRequest("POST", "/api/ai/chat", { message, context });
      return response.json();
    },
    onSuccess: (data, variables) => {
      const aiMessage: Message = {
        id: Date.now().toString() + "-ai",
        type: "ai",
        content: data.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: "welcome",
      type: "ai",
      content: `Hi ${user?.firstName || "there"}! I'm your AI mentor. How can I help you study today? 🤖`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);

    // If there's an initial message, send it
    if (initialMessage) {
      handleSendMessage(initialMessage);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (messageText?: string) => {
    const text = messageText || inputMessage.trim();
    if (!text) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");

    // Add context based on selected mode
    const messageContext = {
      ...context,
      responseStyle: selectedMode,
      userProfile: {
        targetExam: user?.profile?.targetExam,
        strongSubjects: user?.profile?.strongSubjects,
        weakSubjects: user?.profile?.weakSubjects,
      },
    };

    sendMessageMutation.mutate({ message: text, context: messageContext });
  };

  const handleQuickAction = (action: typeof quickActions[0]) => {
    handleSendMessage(action.prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast({
          title: "Voice Input Error",
          description: "Could not access microphone. Please try typing instead.",
          variant: "destructive",
        });
      };

      recognition.start();
    } else {
      toast({
        title: "Voice Input Unavailable",
        description: "Your browser doesn't support voice input.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm border-b flex items-center space-x-3">
        <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Button>
        
        <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-medium text-gray-800">AI Mentor</h3>
          <p className="text-xs text-gray-500">Always here to help you learn</p>
        </div>
        
        <div className="flex space-x-1">
          <Button
            size="sm"
            variant={selectedMode === "simple" ? "default" : "outline"}
            onClick={() => setSelectedMode("simple")}
            className="text-xs px-2 py-1 h-auto"
          >
            Simple
          </Button>
          <Button
            size="sm"
            variant={selectedMode === "detailed" ? "default" : "outline"}
            onClick={() => setSelectedMode("detailed")}
            className="text-xs px-2 py-1 h-auto"
          >
            Detailed
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[80%] ${message.type === "user" ? "order-1" : ""}`}>
                {message.type === "ai" && (
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Brain className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs text-gray-500">AI Mentor</span>
                  </div>
                )}
                
                <div
                  className={`p-3 rounded-xl ${
                    message.type === "user"
                      ? "bg-primary text-white"
                      : "bg-white border border-gray-200 shadow-sm"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                
                <div className={`text-xs text-gray-500 mt-1 ${
                  message.type === "user" ? "text-right" : "text-left"
                }`}>
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          
          {sendMessageMutation.isPending && (
            <div className="flex justify-start">
              <div className="max-w-[80%]">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Brain className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs text-gray-500">AI Mentor is typing...</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex space-x-2 mb-3 overflow-x-auto scrollbar-hide">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action)}
                className="flex items-center space-x-1 whitespace-nowrap bg-white"
              >
                <Icon className="w-3 h-3" />
                <span className="text-xs">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Input */}
      <div className="bg-white p-4 border-t">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            className="p-2 bg-gray-100 hover:bg-gray-200"
          >
            <Paperclip className="w-4 h-4 text-gray-600" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              placeholder="Ask me anything..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sendMessageMutation.isPending}
              className="pr-12"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={startVoiceInput}
              disabled={isListening || sendMessageMutation.isPending}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 ${
                isListening ? "text-red-500" : "text-gray-600"
              }`}
            >
              <Mic className="w-4 h-4" />
            </Button>
          </div>
          
          <Button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || sendMessageMutation.isPending}
            className="gradient-primary text-white p-2"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
