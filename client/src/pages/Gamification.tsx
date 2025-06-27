import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Trophy,
  Coins,
  Flame,
  Target,
  Award,
  Star,
  Crown,
  Zap,
  Calendar,
  TrendingUp
} from "lucide-react";

const achievements = [
  {
    id: 1,
    name: "Consistency Champ",
    description: "Study for 7 days in a row",
    icon: Flame,
    progress: 85,
    maxProgress: 100,
    coinsReward: 100,
    completed: false,
  },
  {
    id: 2,
    name: "Quiz Master",
    description: "Score 90% or higher in 5 quizzes",
    icon: Trophy,
    progress: 60,
    maxProgress: 100,
    coinsReward: 150,
    completed: false,
  },
  {
    id: 3,
    name: "Vocabulary Wizard",
    description: "Learn 50 new vocabulary words",
    icon: Star,
    progress: 100,
    maxProgress: 100,
    coinsReward: 75,
    completed: true,
  },
  {
    id: 4,
    name: "Study Streak",
    description: "Maintain a 30-day study streak",
    icon: Calendar,
    progress: 40,
    maxProgress: 100,
    coinsReward: 300,
    completed: false,
  },
  {
    id: 5,
    name: "AI Companion",
    description: "Have 10 conversations with AI mentor",
    icon: Zap,
    progress: 70,
    maxProgress: 100,
    coinsReward: 50,
    completed: false,
  },
];

const leaderboard = [
  { rank: 1, name: "Priya Sharma", coins: 2850, streak: 45, avatar: "🎯" },
  { rank: 2, name: "Rajesh Kumar", coins: 2640, streak: 38, avatar: "🚀" },
  { rank: 3, name: "You", coins: 1247, streak: 12, avatar: "⭐", isUser: true },
  { rank: 4, name: "Anita Singh", coins: 1180, streak: 22, avatar: "🏆" },
  { rank: 5, name: "Vikram Raj", coins: 1055, streak: 15, avatar: "💎" },
];

const coinTasks = [
  { task: "Complete daily study plan", coins: 50, icon: Target },
  { task: "Take a quiz", coins: 20, icon: Trophy },
  { task: "Review flashcards", coins: 15, icon: Star },
  { task: "Ask AI mentor a question", coins: 10, icon: Zap },
  { task: "Add a note", coins: 5, icon: Award },
];

export default function Gamification() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: userBadges } = useQuery({
    queryKey: ["/api/badges"],
  });

  const updateStreakMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/streak/update");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Streak Updated!",
        description: "Keep up the great work!",
      });
    },
  });

  const userCoins = user?.profile?.coins || 0;
  const userStreak = user?.profile?.streak || 0;
  const userRank = leaderboard.find(item => item.isUser)?.rank || 0;

  const nextLevel = Math.floor((userCoins + 500) / 500) * 500;
  const levelProgress = ((userCoins % 500) / 500) * 100;

  return (
    <div className="p-4 pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-poppins font-bold text-gray-800 mb-2">Rewards & Achievements</h1>
        <p className="text-gray-600">Track your progress and earn rewards</p>
      </div>

      {/* Coin Wallet */}
      <Card className="gradient-accent text-white mb-6 rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-poppins font-bold">Coin Wallet</h2>
              <p className="text-orange-100 text-sm">Your learning currency</p>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Coins className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-3xl font-bold">{userCoins}</div>
              <div className="text-xs text-orange-200">Total Coins</div>
            </div>
            <div>
              <div className="text-3xl font-bold">+75</div>
              <div className="text-xs text-orange-200">Earned Today</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Level Progress */}
      <Card className="card-shadow mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-amber-500" />
              <span className="font-medium text-gray-800">Level {Math.floor(userCoins / 500) + 1}</span>
            </div>
            <span className="text-sm text-gray-600">{userCoins}/{nextLevel} coins</span>
          </div>
          <Progress value={levelProgress} className="h-2" />
          <div className="text-xs text-gray-500 mt-1">
            {nextLevel - userCoins} coins until next level
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="card-shadow">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 bg-red-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Flame className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{userStreak}</div>
            <div className="text-xs text-gray-500">Day Streak</div>
          </CardContent>
        </Card>
        
        <Card className="card-shadow">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 bg-amber-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-gray-800">#{userRank}</div>
            <div className="text-xs text-gray-500">Rank</div>
          </CardContent>
        </Card>
        
        <Card className="card-shadow">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 bg-purple-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Award className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{achievements.filter(a => a.completed).length}</div>
            <div className="text-xs text-gray-500">Badges</div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <div className="mb-6">
        <h3 className="font-poppins font-bold text-gray-800 mb-4">Achievements</h3>
        <div className="space-y-3">
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <Card key={achievement.id} className="card-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      achievement.completed 
                        ? "bg-green-500 text-white" 
                        : "bg-gray-100 text-gray-400"
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-800">{achievement.name}</h4>
                        <div className="flex items-center space-x-1">
                          <Coins className="w-3 h-3 text-amber-500" />
                          <span className="text-sm font-medium text-amber-600">
                            {achievement.coinsReward}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                      
                      {achievement.completed ? (
                        <Badge className="bg-green-500 text-white text-xs">
                          Completed
                        </Badge>
                      ) : (
                        <div className="space-y-1">
                          <Progress value={achievement.progress} className="h-1" />
                          <div className="text-xs text-gray-500">
                            {achievement.progress}% complete
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Earn Coins */}
      <Card className="card-shadow mb-6">
        <CardContent className="p-4">
          <h3 className="font-poppins font-bold text-gray-800 mb-4">Earn Coins</h3>
          <div className="space-y-3">
            {coinTasks.map((task, index) => {
              const Icon = task.icon;
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary bg-opacity-20 rounded-full flex items-center justify-center">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-gray-800">{task.task}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Coins className="w-3 h-3 text-amber-500" />
                    <span className="text-sm font-bold text-amber-600">+{task.coins}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card className="card-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-poppins font-bold text-gray-800">Weekly Leaderboard</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            {leaderboard.map((user) => (
              <div
                key={user.rank}
                className={`flex items-center space-x-3 p-3 rounded-lg ${
                  user.isUser ? "bg-blue-50 border border-blue-200" : "bg-gray-50"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  user.rank === 1 ? "bg-amber-500 text-white" :
                  user.rank === 2 ? "bg-gray-400 text-white" :
                  user.rank === 3 ? "bg-amber-600 text-white" :
                  "bg-gray-200 text-gray-600"
                }`}>
                  {user.rank <= 3 ? (
                    <Trophy className="w-4 h-4" />
                  ) : (
                    user.rank
                  )}
                </div>
                
                <div className="text-2xl">{user.avatar}</div>
                
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{user.name}</div>
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Coins className="w-3 h-3" />
                      <span>{user.coins}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Flame className="w-3 h-3" />
                      <span>{user.streak} days</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
