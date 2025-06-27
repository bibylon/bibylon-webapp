import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  User,
  Bell,
  Shield,
  Target,
  Clock,
  BookOpen,
  Brain,
  LogOut,
  Trash2,
  Download,
  RefreshCw,
  Settings as SettingsIcon
} from "lucide-react";

const profileSchema = z.object({
  targetExam: z.string().min(1, "Target exam is required"),
  strongSubjects: z.array(z.string()).min(1, "At least one strong subject is required"),
  weakSubjects: z.array(z.string()).optional(),
  dailyStudyTime: z.number().min(30, "Minimum 30 minutes required"),
  studyStyle: z.string().min(1, "Study style is required"),
  goalDate: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const exams = [
  { id: "NEET", name: "NEET", subjects: ["Biology", "Chemistry", "Physics"] },
  { id: "JEE", name: "JEE", subjects: ["Physics", "Chemistry", "Mathematics"] },
  { id: "UPSC", name: "UPSC", subjects: ["History", "Geography", "Polity", "Economy"] },
  { id: "SSC", name: "SSC", subjects: ["English", "Mathematics", "Reasoning", "General Knowledge"] },
];

const studyStyles = [
  { id: "visual", name: "Visual" },
  { id: "auditory", name: "Auditory" },
  { id: "kinesthetic", name: "Kinesthetic" },
  { id: "reading", name: "Reading/Writing" },
];

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    dailyReminders: true,
    quizAlerts: true,
    streakReminders: true,
    weeklyReports: false,
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      targetExam: user?.profile?.targetExam || "",
      strongSubjects: user?.profile?.strongSubjects || [],
      weakSubjects: user?.profile?.weakSubjects || [],
      dailyStudyTime: user?.profile?.dailyStudyTime || 120,
      studyStyle: user?.profile?.studyStyle || "",
      goalDate: user?.profile?.goalDate ? new Date(user.profile.goalDate).toISOString().split('T')[0] : "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      await apiRequest("PUT", "/api/profile", {
        ...data,
        goalDate: data.goalDate ? new Date(data.goalDate) : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profile Updated",
        description: "Your study preferences have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetProgressMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/reset-progress");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      toast({
        title: "Progress Reset",
        description: "Your study progress has been reset successfully.",
      });
    },
  });

  const exportDataMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/export-data", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Export failed");
      return response.blob();
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `study-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Data Exported",
        description: "Your study data has been downloaded.",
      });
    },
  });

  const selectedExam = form.watch("targetExam");
  const examSubjects = exams.find(exam => exam.id === selectedExam)?.subjects || [];

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handleSubjectToggle = (subject: string, field: "strongSubjects" | "weakSubjects") => {
    const current = form.getValues(field) || [];
    const updated = current.includes(subject)
      ? current.filter(s => s !== subject)
      : [...current, subject];
    form.setValue(field, updated);
  };

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  return (
    <div className="p-4 pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center">
          <SettingsIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-poppins font-bold text-gray-800">Settings</h1>
          <p className="text-sm text-gray-600">Manage your account and preferences</p>
        </div>
      </div>

      {/* Profile Information */}
      <Card className="card-shadow mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-primary bg-opacity-20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="font-medium text-gray-800">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-sm text-gray-600">{user?.email}</p>
              <Badge className="bg-secondary text-white mt-1">
                {user?.profile?.targetExam} Aspirant
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center pt-4 border-t border-gray-200">
            <div>
              <div className="text-2xl font-bold text-primary">{user?.profile?.streak || 0}</div>
              <div className="text-xs text-gray-500">Day Streak</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">{user?.profile?.coins || 0}</div>
              <div className="text-xs text-gray-500">Total Coins</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary">
                {Math.floor(((user?.profile?.dailyStudyTime || 0) / 60) * 10) / 10}h
              </div>
              <div className="text-xs text-gray-500">Daily Goal</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Study Preferences */}
      <Card className="card-shadow mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Target className="w-5 h-5 text-gray-400" />
            <h3 className="font-medium text-gray-800">Study Preferences</h3>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="targetExam"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Exam</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select exam" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {exams.map((exam) => (
                          <SelectItem key={exam.id} value={exam.id}>
                            {exam.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {examSubjects.length > 0 && (
                <>
                  <FormField
                    control={form.control}
                    name="strongSubjects"
                    render={() => (
                      <FormItem>
                        <FormLabel>Strong Subjects</FormLabel>
                        <div className="flex flex-wrap gap-2">
                          {examSubjects.map((subject) => {
                            const isSelected = form.watch("strongSubjects")?.includes(subject);
                            return (
                              <button
                                key={subject}
                                type="button"
                                onClick={() => handleSubjectToggle(subject, "strongSubjects")}
                                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                  isSelected
                                    ? "bg-secondary text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                              >
                                {subject}
                              </button>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weakSubjects"
                    render={() => (
                      <FormItem>
                        <FormLabel>Subjects to Improve</FormLabel>
                        <div className="flex flex-wrap gap-2">
                          {examSubjects.map((subject) => {
                            const isSelected = form.watch("weakSubjects")?.includes(subject);
                            return (
                              <button
                                key={subject}
                                type="button"
                                onClick={() => handleSubjectToggle(subject, "weakSubjects")}
                                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                  isSelected
                                    ? "bg-red-500 text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                              >
                                {subject}
                              </button>
                            );
                          })}
                        </div>
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="dailyStudyTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily Study Time: {field.value} minutes</FormLabel>
                    <FormControl>
                      <input
                        type="range"
                        min="30"
                        max="480"
                        step="30"
                        value={field.value}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </FormControl>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>30 min</span>
                      <span>8 hours</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="studyStyle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Learning Style</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select learning style" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {studyStyles.map((style) => (
                          <SelectItem key={style.id} value={style.id}>
                            {style.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="goalDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Exam Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="w-full gradient-primary text-white"
              >
                {updateProfileMutation.isPending ? "Updating..." : "Update Preferences"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="card-shadow mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Bell className="w-5 h-5 text-gray-400" />
            <h3 className="font-medium text-gray-800">Notifications</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-800">Daily Study Reminders</div>
                <div className="text-sm text-gray-600">Get reminded to study daily</div>
              </div>
              <Switch
                checked={notifications.dailyReminders}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, dailyReminders: checked }))
                }
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-800">Quiz Alerts</div>
                <div className="text-sm text-gray-600">Notifications for new quizzes</div>
              </div>
              <Switch
                checked={notifications.quizAlerts}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, quizAlerts: checked }))
                }
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-800">Streak Reminders</div>
                <div className="text-sm text-gray-600">Maintain your study streak</div>
              </div>
              <Switch
                checked={notifications.streakReminders}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, streakReminders: checked }))
                }
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-800">Weekly Reports</div>
                <div className="text-sm text-gray-600">Progress summary emails</div>
              </div>
              <Switch
                checked={notifications.weeklyReports}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, weeklyReports: checked }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Data */}
      <Card className="card-shadow mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="w-5 h-5 text-gray-400" />
            <h3 className="font-medium text-gray-800">Privacy & Data</h3>
          </div>
          
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={() => exportDataMutation.mutate()}
              disabled={exportDataMutation.isPending}
              className="w-full justify-start"
            >
              <Download className="w-4 h-4 mr-2" />
              {exportDataMutation.isPending ? "Exporting..." : "Export My Data"}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => resetProgressMutation.mutate()}
              disabled={resetProgressMutation.isPending}
              className="w-full justify-start text-orange-600 hover:text-orange-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {resetProgressMutation.isPending ? "Resetting..." : "Reset Progress"}
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Study Goal Re-planning */}
      <Card className="card-shadow mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="w-5 h-5 text-gray-400" />
            <h3 className="font-medium text-gray-800">AI Study Planning</h3>
          </div>
          
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Target className="w-4 h-4 mr-2" />
              Regenerate Study Plan
            </Button>
            
            <Button variant="outline" className="w-full justify-start">
              <Clock className="w-4 h-4 mr-2" />
              Adjust Schedule
            </Button>
            
            <Button variant="outline" className="w-full justify-start">
              <BookOpen className="w-4 h-4 mr-2" />
              Review Study Strategy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card className="card-shadow">
        <CardContent className="p-4">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
