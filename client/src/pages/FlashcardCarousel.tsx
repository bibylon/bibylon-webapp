import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  AlertTriangle,
  Brain,
  Shuffle,
  Target
} from "lucide-react";

interface Flashcard {
  id: number;
  front: string;
  back: string;
  status: string;
  subject?: string;
  reviewCount: number;
  lastReviewed?: string;
}

const statusOptions = [
  { id: "all", name: "All Cards", color: "bg-gray-500" },
  { id: "review", name: "Need Review", color: "bg-yellow-500" },
  { id: "learned", name: "Learned", color: "bg-green-500" },
  { id: "difficult", name: "Difficult", color: "bg-red-500" },
];

export default function FlashcardCarousel() {
  const [selectedStatus, setSelectedStatus] = useState("review");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studySession, setStudySession] = useState<{
    cards: Flashcard[];
    reviewed: number;
    correct: number;
  } | null>(null);
  const { toast } = useToast();

  const { data: flashcards, isLoading } = useQuery({
    queryKey: ["/api/flashcards", { 
      status: selectedStatus === "all" ? undefined : selectedStatus 
    }],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ cardId, status }: { cardId: number; status: string }) => {
      await apiRequest("PUT", `/api/flashcards/${cardId}`, { 
        status,
        lastReviewed: new Date().toISOString(),
        reviewCount: 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/flashcards"] });
    },
  });

  const generateFlashcardsMutation = useMutation({
    mutationFn: async ({ content, subject }: { content: string; subject: string }) => {
      await apiRequest("POST", "/api/flashcards/generate", { content, subject });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/flashcards"] });
      toast({
        title: "Flashcards Generated!",
        description: "New flashcards have been created from your content.",
      });
    },
  });

  // Initialize study session when flashcards change
  useEffect(() => {
    if (flashcards && flashcards.length > 0) {
      setStudySession({
        cards: [...flashcards],
        reviewed: 0,
        correct: 0,
      });
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [flashcards]);

  const currentCard = studySession?.cards[currentIndex];
  const totalCards = studySession?.cards.length || 0;
  const progress = totalCards > 0 ? ((studySession?.reviewed || 0) / totalCards) * 100 : 0;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleStatusUpdate = (status: "learned" | "difficult" | "review") => {
    if (!currentCard || !studySession) return;

    updateStatusMutation.mutate({ cardId: currentCard.id, status });
    
    const isCorrect = status === "learned";
    setStudySession(prev => ({
      ...prev!,
      reviewed: prev!.reviewed + 1,
      correct: prev!.correct + (isCorrect ? 1 : 0),
    }));

    // Move to next card
    handleNext();
  };

  const handleNext = () => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      // Study session completed
      toast({
        title: "Study Session Complete!",
        description: `You reviewed ${studySession?.reviewed} cards with ${Math.round(((studySession?.correct || 0) / (studySession?.reviewed || 1)) * 100)}% accuracy.`,
      });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const shuffleCards = () => {
    if (studySession) {
      const shuffled = [...studySession.cards].sort(() => Math.random() - 0.5);
      setStudySession(prev => ({ ...prev!, cards: shuffled }));
      setCurrentIndex(0);
      setIsFlipped(false);
      toast({
        title: "Cards Shuffled",
        description: "Flashcards have been shuffled for better learning.",
      });
    }
  };

  const resetSession = () => {
    if (flashcards) {
      setStudySession({
        cards: [...flashcards],
        reviewed: 0,
        correct: 0,
      });
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(s => s.id === status);
    return statusOption ? statusOption.color : "bg-gray-500";
  };

  if (isLoading) {
    return (
      <div className="p-4 pb-20 bg-gray-50 min-h-screen">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-12 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-poppins font-bold text-gray-800">Flashcards</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={shuffleCards}
            disabled={!studySession || totalCards === 0}
          >
            <Shuffle className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetSession}
            disabled={!studySession}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Status Filter */}
      <div className="mb-6">
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select card status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((status) => (
              <SelectItem key={status.id} value={status.id}>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${status.color}`} />
                  <span>{status.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {studySession && totalCards > 0 ? (
        <>
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Card {currentIndex + 1} of {totalCards}
              </span>
              <span className="text-sm font-medium text-gray-600">
                {studySession.reviewed > 0 && 
                  `${Math.round((studySession.correct / studySession.reviewed) * 100)}% accuracy`
                }
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Flashcard */}
          <div className="mb-6 perspective-1000">
            <Card 
              className={`card-shadow cursor-pointer transition-transform duration-500 transform-style-preserve-3d ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
              onClick={handleFlip}
            >
              <CardContent className="p-8 min-h-[300px] flex flex-col justify-center relative">
                {/* Front of card */}
                <div className={`absolute inset-0 p-8 flex flex-col justify-center backface-hidden ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-4">
                      <Badge className="bg-primary text-white">
                        Question
                      </Badge>
                      {currentCard.subject && (
                        <Badge variant="outline" className="ml-2">
                          {currentCard.subject}
                        </Badge>
                      )}
                    </div>
                    <h2 className="text-lg font-medium text-gray-800 mb-4">
                      {currentCard.front}
                    </h2>
                    <p className="text-sm text-gray-500">Tap to reveal answer</p>
                  </div>
                </div>

                {/* Back of card */}
                <div className={`absolute inset-0 p-8 flex flex-col justify-center backface-hidden rotate-y-180 ${
                  isFlipped ? '' : 'rotate-y-180'
                }`}>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-4">
                      <Badge className="bg-secondary text-white">
                        Answer
                      </Badge>
                    </div>
                    <h2 className="text-lg font-medium text-gray-800 mb-4">
                      {currentCard.back}
                    </h2>
                    <p className="text-sm text-gray-500">How well did you know this?</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation and Actions */}
          <div className="space-y-4">
            {/* Knowledge Assessment (only show when flipped) */}
            {isFlipped && (
              <div className="grid grid-cols-3 gap-3">
                <Button
                  onClick={() => handleStatusUpdate("difficult")}
                  disabled={updateStatusMutation.isPending}
                  className="flex flex-col items-center p-4 h-auto bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                >
                  <X className="w-5 h-5 mb-1" />
                  <span className="text-xs">Difficult</span>
                </Button>
                
                <Button
                  onClick={() => handleStatusUpdate("review")}
                  disabled={updateStatusMutation.isPending}
                  className="flex flex-col items-center p-4 h-auto bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200"
                >
                  <AlertTriangle className="w-5 h-5 mb-1" />
                  <span className="text-xs">Review</span>
                </Button>
                
                <Button
                  onClick={() => handleStatusUpdate("learned")}
                  disabled={updateStatusMutation.isPending}
                  className="flex flex-col items-center p-4 h-auto bg-green-50 hover:bg-green-100 text-green-700 border border-green-200"
                >
                  <Check className="w-5 h-5 mb-1" />
                  <span className="text-xs">Learned</span>
                </Button>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>

              <div className="flex items-center space-x-4">
                <Badge 
                  className={`${getStatusColor(currentCard.status)} text-white`}
                >
                  {currentCard.status}
                </Badge>
                <span className="text-sm text-gray-500">
                  Reviewed {currentCard.reviewCount} times
                </span>
              </div>

              <Button
                variant="outline"
                onClick={handleNext}
                disabled={currentIndex === totalCards - 1}
                className="flex items-center space-x-2"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Session Stats */}
          <Card className="card-shadow mt-6">
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-800 mb-3">Session Progress</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{studySession.reviewed}</div>
                  <div className="text-xs text-gray-500">Reviewed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-500">{studySession.correct}</div>
                  <div className="text-xs text-gray-500">Correct</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent">
                    {totalCards - studySession.reviewed}
                  </div>
                  <div className="text-xs text-gray-500">Remaining</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        /* Empty State */
        <Card className="card-shadow">
          <CardContent className="p-6 text-center">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="font-medium text-gray-800 mb-2">No flashcards available</h3>
            <p className="text-sm text-gray-600 mb-4">
              {selectedStatus === "all" 
                ? "Create flashcards to start studying with spaced repetition."
                : `No ${statusOptions.find(s => s.id === selectedStatus)?.name.toLowerCase()} flashcards found.`
              }
            </p>
            <div className="space-y-3">
              <Button className="gradient-primary text-white w-full">
                <Brain className="w-4 h-4 mr-2" />
                Generate from Notes
              </Button>
              {selectedStatus !== "all" && (
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedStatus("all")}
                  className="w-full"
                >
                  View All Cards
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
