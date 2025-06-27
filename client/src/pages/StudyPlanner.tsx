import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import TaskCard from "@/components/TaskCard";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { format, startOfWeek, endOfWeek, addDays, isSameDay } from "date-fns";

export default function StudyPlanner() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"daily" | "weekly">("daily");
  const { toast } = useToast();

  const startDate = viewMode === "weekly" ? startOfWeek(selectedDate) : selectedDate;
  const endDate = viewMode === "weekly" ? endOfWeek(selectedDate) : selectedDate;

  const { data: studyPlans, isLoading } = useQuery({
    queryKey: ["/api/study-plans", {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }],
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ planId, updates }: { planId: number; updates: any }) => {
      await apiRequest("PUT", `/api/study-plan/${planId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/study-plans"] });
      toast({
        title: "Plan Updated",
        description: "Your study plan has been updated successfully.",
      });
    },
  });

  const generatePlanMutation = useMutation({
    mutationFn: async (date: Date) => {
      await apiRequest("POST", "/api/study-plan/generate", {
        date: date.toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/study-plans"] });
      toast({
        title: "Plan Generated",
        description: "New study plan has been created for the selected date.",
      });
    },
  });

  const getDatePlan = (date: Date) => {
    return studyPlans?.find((plan: any) => 
      isSameDay(new Date(plan.date), date)
    );
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    if (percentage > 0) return "bg-orange-500";
    return "bg-gray-300";
  };

  const todaysPlan = getDatePlan(selectedDate);
  const todaysTasks = todaysPlan?.tasks || [];

  return (
    <div className="p-4 pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-poppins font-bold text-gray-800">Study Planner</h1>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <Button
            size="sm"
            variant={viewMode === "daily" ? "default" : "ghost"}
            onClick={() => setViewMode("daily")}
            className="text-sm"
          >
            Daily
          </Button>
          <Button
            size="sm"
            variant={viewMode === "weekly" ? "default" : "ghost"}
            onClick={() => setViewMode("weekly")}
            className="text-sm"
          >
            Weekly
          </Button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedDate(addDays(selectedDate, viewMode === "weekly" ? -7 : -1))}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h2 className="font-poppins font-bold text-gray-800">
          {viewMode === "weekly" 
            ? `Week of ${format(startOfWeek(selectedDate), "MMM d")}`
            : format(selectedDate, "MMMM d, yyyy")
          }
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedDate(addDays(selectedDate, viewMode === "weekly" ? 7 : 1))}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {viewMode === "weekly" ? (
        /* Weekly Calendar Grid */
        <div className="grid grid-cols-7 gap-1 mb-6">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
          
          {Array.from({ length: 7 }, (_, i) => {
            const date = addDays(startOfWeek(selectedDate), i);
            const plan = getDatePlan(date);
            const completion = plan ? parseFloat(plan.completionPercentage) : 0;
            const isSelected = isSameDay(date, selectedDate);
            
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(date)}
                className={`aspect-square flex flex-col items-center justify-center text-sm rounded-lg relative transition-colors ${
                  isSelected 
                    ? "bg-primary text-white font-bold" 
                    : plan 
                      ? "bg-gray-100 hover:bg-gray-200"
                      : "hover:bg-gray-100"
                }`}
              >
                <span className={isSelected ? "text-white" : ""}>{format(date, "d")}</span>
                {plan && (
                  <div className={`w-1 h-1 rounded-full mt-1 ${
                    isSelected ? "bg-white" : getCompletionColor(completion)
                  }`} />
                )}
              </button>
            );
          })}
        </div>
      ) : (
        /* Daily Calendar */
        <Card className="card-shadow mb-6">
          <CardContent className="p-4">
            <Calendar
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="w-full"
            />
          </CardContent>
        </Card>
      )}

      {/* Selected Date Tasks */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-poppins font-bold text-gray-800">
            {isSameDay(selectedDate, new Date()) 
              ? "Today's Tasks" 
              : `Tasks for ${format(selectedDate, "MMM d")}`
            }
          </h3>
          {!todaysPlan && (
            <Button
              size="sm"
              onClick={() => generatePlanMutation.mutate(selectedDate)}
              disabled={generatePlanMutation.isPending}
              className="gradient-secondary text-white"
            >
              {generatePlanMutation.isPending ? "Generating..." : "Generate Plan"}
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : todaysTasks.length > 0 ? (
          <div className="space-y-3">
            {todaysTasks.map((task: any, index: number) => (
              <div key={index} className="relative">
                <TaskCard
                  task={task}
                  onComplete={() => {
                    const updatedTasks = todaysTasks.map((t: any, i: number) => 
                      i === index ? { ...t, completed: true } : t
                    );
                    const completedCount = updatedTasks.filter((t: any) => t.completed).length;
                    const completionPercentage = (completedCount / updatedTasks.length) * 100;
                    
                    updatePlanMutation.mutate({
                      planId: todaysPlan.id,
                      updates: {
                        tasks: updatedTasks,
                        completionPercentage: completionPercentage.toString(),
                        completed: completionPercentage === 100,
                      }
                    });
                  }}
                />
                
                <div className="absolute right-4 top-4">
                  {task.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                  )}
                </div>
              </div>
            ))}
            
            {/* Progress Summary */}
            <Card className="card-shadow mt-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">Daily Progress</div>
                    <div className="text-2xl font-bold text-primary">
                      {todaysPlan ? Math.round(parseFloat(todaysPlan.completionPercentage)) : 0}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      {todaysTasks.filter((t: any) => t.completed).length} of {todaysTasks.length} completed
                    </div>
                    <Badge variant={todaysPlan?.completed ? "default" : "secondary"}>
                      {todaysPlan?.completed ? "Complete" : "In Progress"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="card-shadow">
            <CardContent className="p-6 text-center">
              <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="font-medium text-gray-800 mb-2">No study plan for this date</h3>
              <p className="text-sm text-gray-600 mb-4">
                Generate a personalized study plan for {format(selectedDate, "MMMM d")}
              </p>
              <Button
                onClick={() => generatePlanMutation.mutate(selectedDate)}
                disabled={generatePlanMutation.isPending}
                className="gradient-primary text-white"
              >
                {generatePlanMutation.isPending ? "Generating..." : "Generate Plan"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* AI Suggestion Card */}
      {todaysPlan && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 mb-1">AI Suggestion</h4>
                <p className="text-sm text-gray-600">
                  Based on your progress, consider spending extra time on weak subjects. 
                  You're doing great with your current streak!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
