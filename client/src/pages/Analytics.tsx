import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { 
  TrendingUp,
  Target,
  Clock,
  Brain,
  BarChart3,
  Calendar,
  Award,
  Zap
} from "lucide-react";

const subjects = [
  { name: "Biology", color: "bg-green-500", progress: 92 },
  { name: "Physics", color: "bg-blue-500", progress: 78 },
  { name: "Chemistry", color: "bg-purple-500", progress: 85 },
  { name: "Mathematics", color: "bg-amber-500", progress: 71 },
  { name: "Polity", color: "bg-red-500", progress: 88 },
  { name: "Economy", color: "bg-green-600", progress: 82 },
];

const weeklyData = [
  { day: "Mon", hours: 2.5, completion: 80 },
  { day: "Tue", hours: 3.2, completion: 95 },
  { day: "Wed", hours: 2.8, completion: 75 },
  { day: "Thu", hours: 3.5, completion: 100 },
  { day: "Fri", hours: 3.0, completion: 90 },
  { day: "Sat", hours: 1.8, completion: 60 },
  { day: "Sun", hours: 2.2, completion: 70 },
];

export default function Analytics() {
  const { user } = useAuth();

  const { data: progressData } = useQuery({
    queryKey: ["/api/progress"],
  });

  const { data: quizStats } = useQuery({
    queryKey: ["/api/quiz/stats", { timeframe: "month" }],
  });

  const { data: weeklyQuizStats } = useQuery({
    queryKey: ["/api/quiz/stats", { timeframe: "week" }],
  });

  const overallAccuracy = quizStats?.accuracy || 0;
  const totalQuestions = quizStats?.totalAttempts || 0;
  const correctAnswers = quizStats?.correctAttempts || 0;

  return (
    <div className="p-4 pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-poppins font-bold text-gray-800">Progress Analytics</h1>
        <Tabs defaultValue="week" className="w-auto">
          <TabsList className="bg-gray-100">
            <TabsTrigger value="week" className="text-xs">Week</TabsTrigger>
            <TabsTrigger value="month" className="text-xs">Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Overall Progress */}
      <Card className="gradient-primary text-white mb-6 rounded-xl">
        <CardContent className="p-6">
          <h2 className="text-lg font-poppins font-bold mb-4">Overall Progress</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">73%</div>
              <div className="text-sm text-indigo-200">Study Plan Complete</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{overallAccuracy}%</div>
              <div className="text-sm text-indigo-200">Average Accuracy</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="card-shadow">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-secondary bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Target className="w-6 h-6 text-secondary" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{user?.profile?.streak || 0}</div>
            <div className="text-xs text-gray-500">Day Streak</div>
          </CardContent>
        </Card>
        
        <Card className="card-shadow">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-accent bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Zap className="w-6 h-6 text-accent" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{totalQuestions}</div>
            <div className="text-xs text-gray-500">Questions Solved</div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Performance */}
      <Card className="card-shadow mb-6">
        <CardContent className="p-4">
          <h3 className="font-poppins font-bold text-gray-800 mb-4">Subject Performance</h3>
          <div className="space-y-3">
            {subjects.map((subject) => (
              <div key={subject.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 ${subject.color} rounded-full`} />
                  <span className="text-sm font-medium text-gray-700">{subject.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${subject.color} h-2 rounded-full`}
                      style={{ width: `${subject.progress}%` }}
                    />
                  </div>
                  <span className={`text-sm font-bold ${subject.color.replace('bg-', 'text-')}`}>
                    {subject.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card className="bg-blue-50 border-blue-200 mb-6">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-800 mb-2">AI Insights</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                  <span>Your Physics accuracy improved by 12% this week</span>
                </div>
                <div className="flex items-center">
                  <Target className="w-3 h-3 mr-1 text-amber-500" />
                  <span>Consider more practice in Organic Chemistry</span>
                </div>
                <div className="flex items-center">
                  <Award className="w-3 h-3 mr-1 text-green-500" />
                  <span>You're strongest in Cell Biology - keep it up!</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Study Pattern */}
      <Card className="card-shadow mb-6">
        <CardContent className="p-4">
          <h3 className="font-poppins font-bold text-gray-800 mb-4">Study Streak</h3>
          <div className="flex justify-between items-end mb-2">
            {weeklyData.map((day, index) => {
              const maxHours = Math.max(...weeklyData.map(d => d.hours));
              const height = (day.hours / maxHours) * 60; // Max height 60px
              
              return (
                <div key={day.day} className="flex flex-col items-center">
                  <div 
                    className={`w-8 rounded-t-lg mb-2 transition-colors ${
                      day.completion >= 80 ? 'bg-secondary' : 
                      day.completion >= 60 ? 'bg-amber-500' : 'bg-gray-300'
                    }`}
                    style={{ height: `${height}px` }}
                  />
                  <span className="text-xs text-gray-500">{day.day}</span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>Hours studied this week</span>
            <span>{weeklyData.reduce((sum, day) => sum + day.hours, 0).toFixed(1)}h total</span>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="card-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-gray-400" />
              <Badge variant="outline" className="text-xs">This Week</Badge>
            </div>
            <div className="text-2xl font-bold text-gray-800">2.8h</div>
            <div className="text-xs text-gray-500">Avg. Daily Study</div>
            <div className="text-xs text-green-600 mt-1">+15% from last week</div>
          </CardContent>
        </Card>
        
        <Card className="card-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-5 h-5 text-gray-400" />
              <Badge variant="outline" className="text-xs">Quiz Performance</Badge>
            </div>
            <div className="text-2xl font-bold text-gray-800">{weeklyQuizStats?.accuracy || 0}%</div>
            <div className="text-xs text-gray-500">Weekly Accuracy</div>
            <div className="text-xs text-green-600 mt-1">
              {correctAnswers}/{totalQuestions} correct
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Improvement Suggestions */}
      <Card className="card-shadow">
        <CardContent className="p-4">
          <h3 className="font-poppins font-bold text-gray-800 mb-4">Recommended Actions</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
              <Target className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <div className="font-medium text-gray-800 text-sm">Focus on Mathematics</div>
                <div className="text-xs text-gray-600">Your lowest performing subject needs attention</div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <div className="font-medium text-gray-800 text-sm">Increase Study Time</div>
                <div className="text-xs text-gray-600">Try to study 30 minutes more per day</div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <Award className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium text-gray-800 text-sm">Maintain Biology Momentum</div>
                <div className="text-xs text-gray-600">You're excelling here - keep up the great work!</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
