import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AIChat from "./AIChat";
import { 
  Brain, 
  MessageCircle, 
  Calendar, 
  Lightbulb, 
  HelpCircle 
} from "lucide-react";

export default function FloatingAIButton() {
  const [showPopover, setShowPopover] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const handlePopoverAction = (action: string) => {
    setShowPopover(false);
    
    switch (action) {
      case 'chat':
        setShowChat(true);
        break;
      case 'question':
        setShowChat(true);
        // Pre-populate with question context
        break;
      case 'plan':
        // Handle plan adjustment
        break;
      case 'motivation':
        setShowChat(true);
        // Pre-populate with motivation request
        break;
    }
  };

  if (showChat) {
    return <AIChat onClose={() => setShowChat(false)} />;
  }

  return (
    <>
      {/* Popover */}
      {showPopover && (
        <div className="fixed bottom-36 right-4 z-50">
          <Card className="w-48 floating-shadow">
            <CardContent className="p-3">
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left h-10"
                  onClick={() => handlePopoverAction('question')}
                >
                  <HelpCircle className="w-4 h-4 mr-3 text-primary" />
                  <span className="text-sm">Ask Question</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left h-10"
                  onClick={() => handlePopoverAction('plan')}
                >
                  <Calendar className="w-4 h-4 mr-3 text-secondary" />
                  <span className="text-sm">Adjust Plan</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left h-10"
                  onClick={() => handlePopoverAction('motivation')}
                >
                  <Lightbulb className="w-4 h-4 mr-3 text-accent" />
                  <span className="text-sm">Get Motivation</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left h-10"
                  onClick={() => handlePopoverAction('chat')}
                >
                  <MessageCircle className="w-4 h-4 mr-3 text-purple-500" />
                  <span className="text-sm">Open Chat</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Floating Button */}
      <Button
        className="fixed bottom-20 right-4 w-14 h-14 gradient-primary rounded-full floating-shadow z-40 hover:scale-105 transition-transform"
        onClick={() => setShowPopover(!showPopover)}
      >
        <Brain className="w-6 h-6 text-white" />
      </Button>

      {/* Backdrop */}
      {showPopover && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setShowPopover(false)}
        />
      )}
    </>
  );
}
