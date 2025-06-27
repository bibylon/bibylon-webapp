import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import TaskCard from "@/components/TaskCard";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar,
  Brain,
  BookOpen,
  Zap,
  Trophy,
  Flame,
  Target,
  TrendingUp
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: todaysStudyPlan, isLoading: planLoading } = useQuery({
    queryKey: ["/api/study-plans", { 
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    }],
  });

  const { data: quizStats } = useQuery({
    queryKey: ["/api/quiz/stats", { timeframe: "week" }],
  });

  const { data: userProgress } = useQuery({
    queryKey: ["/api/progress"],
  });

  const generatePlanMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/study-plan/generate", {
        date: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/study-plans"] });
      toast({
        title: "Study Plan Generated!",
        description: "Your personalized plan for today is ready.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate study plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateStreakMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/streak/update");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.firstName || "Student";
    
    if (hour < 12) return `Good Morning, ${name}! 🌅`;
    if (hour < 17) return `Good Afternoon, ${name}! ☀️`;
    return `Good Evening, ${name}! 🌅`;
  };

  const currentPlan = todaysStudyPlan?.[0];
  const todaysTasks = currentPlan?.tasks || [];
  const completionPercentage = currentPlan ? parseFloat(currentPlan.completionPercentage) : 0;

  return (
    <div className="p-4 pb-20 bg-gray-50 min-h-screen">
      {/* Header with Greeting */}
      <Card className="gradient-primary text-white mb-6 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-poppins font-bold mb-1">
                {getGreeting()}
              </h1>
              <p className="text-indigo-200 text-sm">Ready to conquer your goals today?</p>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{user?.profile?.streak || 0}</div>
              <div className="text-xs text-indigo-200">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{user?.profile?.coins || 0}</div>
              <div className="text-xs text-indigo-200">Coins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{quizStats?.accuracy || 0}%</div>
              <div className="text-xs text-indigo-200">Accuracy</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Plan */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-poppins font-bold text-gray-800">Today's Study Plan</h2>
          {!currentPlan && (
            <Button
              size="sm"
              onClick={() => generatePlanMutation.mutate()}
              disabled={generatePlanMutation.isPending}
              className="gradient-secondary text-white"
            >
              {generatePlanMutation.isPending ? "Generating..." : "Generate Plan"}
            </Button>
          )}
        </div>

        {planLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : todaysTasks.length > 0 ? (
          <div className="space-y-3">
            {todaysTasks.map((task: any, index: number) => (
              <TaskCard
                key={index}
                task={task}
                onComplete={() => {
                  // Handle task completion
                  updateStreakMutation.mutate();
                }}
              />
            ))}
          </div>
        ) : (
          <Card className="card-shadow">
            <CardContent className="p-6 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="font-medium text-gray-800 mb-2">No study plan yet</h3>
              <p className="text-sm text-gray-600 mb-4">
                Generate your personalized study plan for today
              </p>
              <Button
                onClick={() => generatePlanMutation.mutate()}
                disabled={generatePlanMutation.isPending}
                className="gradient-primary text-white"
              >
                {generatePlanMutation.isPending ? "Generating..." : "Generate Plan"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-lg font-poppins font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-20 flex-col space-y-2 bg-white hover:bg-gray-50"
          >
            <div className="w-12 h-12 bg-accent bg-opacity-20 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-accent" />
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-800">Ask AI</div>
              <div className="text-xs text-gray-500">Get instant help</div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="h-20 flex-col space-y-2 bg-white hover:bg-gray-50"
          >
            <div className="w-12 h-12 bg-primary bg-opacity-20 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-800">Take Quiz</div>
              <div className="text-xs text-gray-500">Test yourself</div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="h-20 flex-col space-y-2 bg-white hover:bg-gray-50"
          >
            <div className="w-12 h-12 bg-secondary bg-opacity-20 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-secondary" />
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-800">Notes</div>
              <div className="text-xs text-gray-500">Review & add</div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="h-20 flex-col space-y-2 bg-white hover:bg-gray-50"
          >
            <div className="w-12 h-12 bg-purple-500 bg-opacity-20 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-500" />
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-800">Flashcards</div>
              <div className="text-xs text-gray-500">Quick review</div>
            </div>
          </Button>
        </div>
      </div>

      {/* Motivation Strip */}
      <Card className="gradient-accent text-white mb-6 rounded-xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">"Success is not final, failure is not fatal."</p>
              <p className="text-xs text-orange-100">— Winston Churchill</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <Flame className="w-4 h-4 text-orange-200 mr-1" />
                <span className="text-sm font-bold">{user?.profile?.streak || 0}</span>
              </div>
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Snapshot */}
      <Card className="card-shadow">
        <CardContent className="p-4">
          <h3 className="font-poppins font-bold text-gray-800 mb-4">This Week's Progress</h3>
          <div className="flex items-center justify-between mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">{Math.round(completionPercentage)}%</div>
              <div className="text-xs text-gray-500">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{quizStats?.accuracy || 0}%</div>
              <div className="text-xs text-gray-500">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{quizStats?.totalAttempts || 0}</div>
              <div className="text-xs text-gray-500">Questions</div>
            </div>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </CardContent>
      </Card>
    </div>
  );
}
