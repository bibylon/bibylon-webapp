import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock,
  Target,
  Trophy,
  RotateCcw,
  Brain,
  CheckCircle,
  XCircle,
  Zap
} from "lucide-react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  subject: string;
  difficulty: string;
}

const quizTypes = [
  { id: "general", name: "General Quiz", description: "Mixed questions from all subjects" },
  { id: "subject", name: "Subject-wise", description: "Focus on specific subjects" },
  { id: "current-affairs", name: "Current Affairs", description: "Latest news and events" },
  { id: "vocabulary", name: "Vocabulary", description: "Word meanings and usage" },
];

const subjects = [
  "Biology", "Chemistry", "Physics", "Mathematics", 
  "Polity", "Economy", "Environment", "History", "Geography"
];

export default function QuizArena() {
  const [quizMode, setQuizMode] = useState<"setup" | "playing" | "result">("setup");
  const [quizType, setQuizType] = useState("general");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [numQuestions, setNumQuestions] = useState([10]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [quizResults, setQuizResults] = useState<any>(null);
  const { toast } = useToast();

  const { data: questions } = useQuery({
    queryKey: ["/api/quiz/questions", { 
      subject: quizType === "subject" ? selectedSubject : undefined,
      source: quizType === "current-affairs" ? "current_affairs" : 
              quizType === "vocabulary" ? "vocabulary" : undefined,
      limit: numQuestions[0]
    }],
    enabled: false,
  });

  const { data: quizStats } = useQuery({
    queryKey: ["/api/quiz/stats", { timeframe: "week" }],
  });

  const recordAttemptMutation = useMutation({
    mutationFn: async (attemptData: any) => {
      const response = await apiRequest("POST", "/api/quiz/attempt", attemptData);
      return response.json();
    },
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((time) => {
          if (time <= 1) {
            setTimerActive(false);
            handleNextQuestion();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining]);

  const startQuiz = async () => {
    try {
      const response = await queryClient.fetchQuery({
        queryKey: ["/api/quiz/questions", { 
          subject: quizType === "subject" ? selectedSubject : undefined,
          source: quizType === "current-affairs" ? "current_affairs" : 
                  quizType === "vocabulary" ? "vocabulary" : undefined,
          limit: numQuestions[0]
        }],
      });
      
      if (response && response.length > 0) {
        setQuizQuestions(response);
        setQuizMode("playing");
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setTimeRemaining(60); // 60 seconds per question
        setTimerActive(true);
      } else {
        toast({
          title: "No Questions Available",
          description: "No questions found for the selected criteria.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load quiz questions.",
        variant: "destructive",
      });
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answerIndex
    }));
  };

  const handleNextQuestion = async () => {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    const selectedAnswer = selectedAnswers[currentQuestionIndex];
    
    if (selectedAnswer !== undefined) {
      // Record the attempt
      await recordAttemptMutation.mutateAsync({
        questionId: currentQuestion.id,
        selectedAnswer,
        timeSpent: 60 - timeRemaining,
      });
    }

    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeRemaining(60);
      setTimerActive(true);
    } else {
      // Quiz completed
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    const results = calculateResults();
    setQuizResults(results);
    setQuizMode("result");
    setTimerActive(false);
    
    // Update stats
    queryClient.invalidateQueries({ queryKey: ["/api/quiz/stats"] });
  };

  const calculateResults = () => {
    let correct = 0;
    let total = quizQuestions.length;
    
    quizQuestions.forEach((question, index) => {
      const selectedAnswer = selectedAnswers[index];
      if (selectedAnswer === question.correctAnswer) {
        correct++;
      }
    });
    
    const percentage = Math.round((correct / total) * 100);
    
    return {
      correct,
      total,
      percentage,
      questionsWithAnswers: quizQuestions.map((question, index) => ({
        ...question,
        selectedAnswer: selectedAnswers[index],
        isCorrect: selectedAnswers[index] === question.correctAnswer,
      }))
    };
  };

  const resetQuiz = () => {
    setQuizMode("setup");
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizQuestions([]);
    setQuizResults(null);
    setTimerActive(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (quizMode === "setup") {
    return (
      <div className="p-4 pb-20 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-poppins font-bold text-gray-800 mb-2">Quiz Arena</h1>
          <p className="text-gray-600">Test your knowledge and earn coins!</p>
        </div>

        {/* Quiz Stats */}
        {quizStats && (
          <Card className="card-shadow mb-6">
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-800 mb-3">Your Performance</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-secondary">{quizStats.correctAttempts || 0}</div>
                  <div className="text-xs text-gray-500">Correct</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-500">{(quizStats.totalAttempts || 0) - (quizStats.correctAttempts || 0)}</div>
                  <div className="text-xs text-gray-500">Wrong</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent">{quizStats.accuracy || 0}%</div>
                  <div className="text-xs text-gray-500">Accuracy</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quiz Setup */}
        <Card className="card-shadow mb-6">
          <CardContent className="p-6">
            <h3 className="font-medium text-gray-800 mb-4">Quiz Setup</h3>
            
            {/* Quiz Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Type</label>
              <div className="space-y-2">
                {quizTypes.map((type) => (
                  <Card
                    key={type.id}
                    className={`cursor-pointer transition-all ${
                      quizType === type.id ? "border-primary bg-blue-50" : "border-gray-200"
                    }`}
                    onClick={() => setQuizType(type.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          quizType === type.id ? "bg-primary border-primary" : "border-gray-300"
                        }`} />
                        <div>
                          <div className="font-medium text-gray-800">{type.name}</div>
                          <div className="text-sm text-gray-600">{type.description}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Subject Selection */}
            {quizType === "subject" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Number of Questions */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Questions: {numQuestions[0]}
              </label>
              <Slider
                value={numQuestions}
                onValueChange={setNumQuestions}
                min={5}
                max={30}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5</span>
                <span>30</span>
              </div>
            </div>

            <Button
              onClick={startQuiz}
              disabled={quizType === "subject" && !selectedSubject}
              className="w-full gradient-primary text-white py-3 rounded-xl font-medium"
            >
              Start Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (quizMode === "playing" && quizQuestions.length > 0) {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;

    return (
      <div className="p-4 pb-20 bg-gray-50 min-h-screen">
        {/* Progress Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600">
            Question {currentQuestionIndex + 1} of {quizQuestions.length}
          </span>
          <div className="flex items-center space-x-2">
            <Clock className={`w-4 h-4 ${timeRemaining <= 10 ? "text-red-500" : "text-accent"}`} />
            <span className={`text-sm font-medium ${timeRemaining <= 10 ? "text-red-500" : "text-accent"}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        <Progress value={progress} className="h-2 mb-6" />

        {/* Question */}
        <Card className="card-shadow mb-6">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <Badge className="bg-primary text-white">
                {currentQuestion.subject}
              </Badge>
              <Badge variant="outline">
                {currentQuestion.difficulty}
              </Badge>
            </div>
            
            <h3 className="text-lg font-medium text-gray-800 mb-6">
              {currentQuestion.question}
            </h3>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswers[currentQuestionIndex] === index;
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-primary bg-blue-50"
                        : "border-gray-200 bg-white hover:border-primary hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? "border-primary bg-primary" : "border-gray-300"
                      }`}>
                        <span className={`text-sm font-medium ${
                          isSelected ? "text-white" : "text-gray-500"
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </span>
                      </div>
                      <span className="text-gray-800">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleNextQuestion}
                className="flex-1"
              >
                Skip
              </Button>
              <Button
                onClick={handleNextQuestion}
                disabled={selectedAnswers[currentQuestionIndex] === undefined}
                className="flex-1 gradient-primary text-white"
              >
                {currentQuestionIndex < quizQuestions.length - 1 ? "Next Question" : "Finish Quiz"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (quizMode === "result" && quizResults) {
    return (
      <div className="p-4 pb-20 bg-gray-50 min-h-screen">
        {/* Results Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-poppins font-bold text-gray-800 mb-2">Quiz Completed!</h1>
          <p className="text-gray-600">Here's how you performed</p>
        </div>

        {/* Score Card */}
        <Card className="card-shadow mb-6">
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-primary mb-2">
              {quizResults.percentage}%
            </div>
            <div className="text-gray-600 mb-4">
              {quizResults.correct} out of {quizResults.total} correct
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{quizResults.correct}</div>
                <div className="text-xs text-gray-500">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{quizResults.total - quizResults.correct}</div>
                <div className="text-xs text-gray-500">Wrong</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">+{quizResults.correct * 10}</div>
                <div className="text-xs text-gray-500">Coins</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Review Questions */}
        <div className="mb-6">
          <h3 className="font-poppins font-bold text-gray-800 mb-4">Review Answers</h3>
          <div className="space-y-3">
            {quizResults.questionsWithAnswers.map((question: any, index: number) => (
              <Card key={index} className="card-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    {question.isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 mb-2">
                        {question.question}
                      </p>
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Your answer:</span> {question.options[question.selectedAnswer]}
                      </div>
                      {!question.isCorrect && (
                        <div className="text-xs text-green-600">
                          <span className="font-medium">Correct answer:</span> {question.options[question.correctAnswer]}
                        </div>
                      )}
                      {question.explanation && (
                        <div className="text-xs text-gray-600 mt-1">
                          <span className="font-medium">Explanation:</span> {question.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={resetQuiz}
            className="flex-1"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button className="flex-1 gradient-secondary text-white">
            <Brain className="w-4 h-4 mr-2" />
            Review with AI
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
