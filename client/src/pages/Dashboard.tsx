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
      await apiRequest("POST", "/api/progress/streak");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    const firstName = (user as any)?.firstName || "Student";
    
    if (hour < 12) return `Good Morning, ${firstName}!`;
    if (hour < 17) return `Good Afternoon, ${firstName}!`;
    return `Good Evening, ${firstName}!`;
  };

  const currentPlan = (todaysStudyPlan as any)?.[0];
  const todaysTasks = currentPlan?.tasks || [];
  const completionPercentage = currentPlan ? parseFloat(currentPlan.completionPercentage) : 0;

  return (
    <div className="p-4 lg:p-8 pb-20 lg:pb-8 bg-gray-50 min-h-screen">
      {/* Header with Greeting */}
      <Card className="gradient-primary text-white mb-6 lg:mb-8 rounded-2xl">
        <CardContent className="p-6 lg:p-8">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <div>
              <h1 className="text-xl lg:text-3xl font-poppins font-bold mb-1">
                {getGreeting()}
              </h1>
              <p className="text-indigo-200 text-sm lg:text-base">Ready to conquer your goals today?</p>
            </div>
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold">{(user as any)?.profile?.streak || 0}</div>
              <div className="text-xs lg:text-sm text-indigo-200">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold">{(user as any)?.profile?.coins || 0}</div>
              <div className="text-xs lg:text-sm text-indigo-200">Coins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold">{(quizStats as any)?.accuracy || 0}%</div>
              <div className="text-xs lg:text-sm text-indigo-200">Accuracy</div>
            </div>
            <div className="text-center hidden lg:block">
              <div className="text-2xl lg:text-3xl font-bold">{completionPercentage}%</div>
              <div className="text-xs lg:text-sm text-indigo-200">Today's Progress</div>
            </div>
            <div className="text-center hidden lg:block">
              <div className="text-2xl lg:text-3xl font-bold">{todaysTasks.length}</div>
              <div className="text-xs lg:text-sm text-indigo-200">Total Tasks</div>
            </div>
            <div className="text-center hidden lg:block">
              <div className="text-2xl lg:text-3xl font-bold">{todaysTasks.filter((t:any) => t.completed).length}</div>
              <div className="text-xs lg:text-sm text-indigo-200">Completed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-8 space-y-6 lg:space-y-0">
        {/* Today's Plan */}
        <div className="mb-6 lg:mb-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg lg:text-xl font-poppins font-bold text-gray-800">Today's Study Plan</h2>
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

        {/* Quick Actions and Progress */}
        <div className="mb-6">
          <h2 className="text-lg lg:text-xl font-poppins font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
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
          </div>

          {/* Progress Card */}
          <Card className="card-shadow">
            <CardContent className="p-6">
              <h3 className="font-medium text-gray-800 mb-4">Today's Progress</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{completionPercentage}%</div>
                  <div className="text-xs text-gray-500">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{(quizStats as any)?.accuracy || 0}%</div>
                  <div className="text-xs text-gray-500">Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{(quizStats as any)?.totalAttempts || 0}</div>
                  <div className="text-xs text-gray-500">Questions</div>
                </div>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}