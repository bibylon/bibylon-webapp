import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  GraduationCap, 
  Target, 
  BookOpen, 
  Brain, 
  Calculator,
  Landmark,
  Briefcase,
  TestTube
} from "lucide-react";

const step1Schema = z.object({
  targetExam: z.string().min(1, "Please select an exam"),
  strongSubjects: z.array(z.string()).min(1, "Please select at least one strong subject"),
  weakSubjects: z.array(z.string()).optional(),
});

const step2Schema = z.object({
  dailyStudyTime: z.number().min(30, "Minimum 30 minutes required"),
  studyStyle: z.string().min(1, "Please select a learning style"),
  goalDate: z.string().optional(),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

const exams = [
  { id: "NEET", name: "NEET", icon: TestTube, subjects: ["Biology", "Chemistry", "Physics"] },
  { id: "JEE", name: "JEE", icon: Calculator, subjects: ["Physics", "Chemistry", "Mathematics"] },
  { id: "UPSC", name: "UPSC", icon: Landmark, subjects: ["History", "Geography", "Polity", "Economy"] },
  { id: "SSC", name: "SSC", icon: Briefcase, subjects: ["English", "Mathematics", "Reasoning", "General Knowledge"] },
];

const studyStyles = [
  { id: "visual", name: "Visual", icon: "👁️", description: "Learn through images and diagrams" },
  { id: "auditory", name: "Auditory", icon: "👂", description: "Learn through listening and discussion" },
  { id: "kinesthetic", name: "Kinesthetic", icon: "✋", description: "Learn through hands-on practice" },
  { id: "reading", name: "Reading/Writing", icon: "📖", description: "Learn through reading and notes" },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const form1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      strongSubjects: [],
      weakSubjects: [],
    },
  });

  const form2 = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      dailyStudyTime: 120,
      studyStyle: "",
    },
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Created!",
        description: "Welcome to My AI Mentor. Let's start your learning journey!",
      });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      });
      console.error("Profile creation error:", error);
    },
  });

  const selectedExam = form1.watch("targetExam");
  const examSubjects = exams.find(exam => exam.id === selectedExam)?.subjects || [];

  const handleStep1Submit = (data: Step1Data) => {
    setStep1Data(data);
    setCurrentStep(2);
  };

  const handleStep2Submit = (data: Step2Data) => {
    if (!step1Data) return;
    
    const profileData = {
      ...step1Data,
      ...data,
      goalDate: data.goalDate ? new Date(data.goalDate) : null,
    };
    
    createProfileMutation.mutate(profileData);
  };

  const progress = (currentStep / 2) * 100;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            {currentStep === 1 ? (
              <GraduationCap className="w-8 h-8 text-white" />
            ) : (
              <Target className="w-8 h-8 text-white" />
            )}
          </div>
          <h1 className="text-2xl font-poppins font-bold text-gray-800 mb-2">
            {currentStep === 1 ? "Set Your Goals" : "Customize Learning"}
          </h1>
          <p className="text-gray-600">
            {currentStep === 1 
              ? "Tell us about your exam and strengths" 
              : "How do you prefer to study?"
            }
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2 mb-2" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Exam Details</span>
            <span>Study Preferences</span>
          </div>
        </div>

        {/* Step 1: Exam and Subjects */}
        {currentStep === 1 && (
          <form onSubmit={form1.handleSubmit(handleStep1Submit)} className="space-y-6">
            {/* Target Exam */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">Target Exam</Label>
              <div className="grid grid-cols-2 gap-3">
                {exams.map((exam) => {
                  const Icon = exam.icon;
                  return (
                    <Card 
                      key={exam.id}
                      className={`cursor-pointer transition-all ${
                        form1.watch("targetExam") === exam.id
                          ? "border-primary bg-primary text-white"
                          : "border-gray-200 hover:border-primary"
                      }`}
                      onClick={() => {
                        form1.setValue("targetExam", exam.id);
                        form1.setValue("strongSubjects", []);
                        form1.setValue("weakSubjects", []);
                      }}
                    >
                      <CardContent className="p-4 text-center">
                        <Icon className="w-8 h-8 mx-auto mb-2" />
                        <div className="font-medium">{exam.name}</div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              {form1.formState.errors.targetExam && (
                <p className="text-sm text-red-500 mt-1">{form1.formState.errors.targetExam.message}</p>
              )}
            </div>

            {/* Strong Subjects */}
            {examSubjects.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">Strong Subjects</Label>
                <div className="flex flex-wrap gap-2">
                  {examSubjects.map((subject) => {
                    const isSelected = form1.watch("strongSubjects").includes(subject);
                    return (
                      <button
                        key={subject}
                        type="button"
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          isSelected
                            ? "bg-secondary text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                        onClick={() => {
                          const current = form1.watch("strongSubjects");
                          const updated = isSelected
                            ? current.filter(s => s !== subject)
                            : [...current, subject];
                          form1.setValue("strongSubjects", updated);
                        }}
                      >
                        {subject}
                      </button>
                    );
                  })}
                </div>
                {form1.formState.errors.strongSubjects && (
                  <p className="text-sm text-red-500 mt-1">{form1.formState.errors.strongSubjects.message}</p>
                )}
              </div>
            )}

            {/* Weak Subjects */}
            {examSubjects.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">Subjects to Improve (Optional)</Label>
                <div className="flex flex-wrap gap-2">
                  {examSubjects.map((subject) => {
                    const isSelected = form1.watch("weakSubjects")?.includes(subject) || false;
                    return (
                      <button
                        key={subject}
                        type="button"
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          isSelected
                            ? "bg-red-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                        onClick={() => {
                          const current = form1.watch("weakSubjects") || [];
                          const updated = isSelected
                            ? current.filter(s => s !== subject)
                            : [...current, subject];
                          form1.setValue("weakSubjects", updated);
                        }}
                      >
                        {subject}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <Button 
              type="submit"
              className="w-full gradient-primary text-white py-4 rounded-xl font-medium"
              disabled={!form1.watch("targetExam") || form1.watch("strongSubjects").length === 0}
            >
              Continue
            </Button>
          </form>
        )}

        {/* Step 2: Study Preferences */}
        {currentStep === 2 && (
          <form onSubmit={form2.handleSubmit(handleStep2Submit)} className="space-y-6">
            {/* Daily Study Time */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Daily Study Time: {form2.watch("dailyStudyTime")} minutes
              </Label>
              <input
                type="range"
                min="30"
                max="480"
                step="30"
                value={form2.watch("dailyStudyTime")}
                onChange={(e) => form2.setValue("dailyStudyTime", parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>30 min</span>
                <span>8 hours</span>
              </div>
            </div>

            {/* Learning Style */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">Learning Style</Label>
              <div className="space-y-3">
                {studyStyles.map((style) => (
                  <Card
                    key={style.id}
                    className={`cursor-pointer transition-all ${
                      form2.watch("studyStyle") === style.id
                        ? "border-primary bg-blue-50"
                        : "border-gray-200 hover:border-primary"
                    }`}
                    onClick={() => form2.setValue("studyStyle", style.id)}
                  >
                    <CardContent className="p-4 flex items-center space-x-3">
                      <div className="text-2xl">{style.icon}</div>
                      <div>
                        <div className="font-medium text-gray-800">{style.name}</div>
                        <div className="text-sm text-gray-600">{style.description}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {form2.formState.errors.studyStyle && (
                <p className="text-sm text-red-500 mt-1">{form2.formState.errors.studyStyle.message}</p>
              )}
            </div>

            {/* Goal Date */}
            <div>
              <Label htmlFor="goalDate" className="text-sm font-medium text-gray-700 mb-2 block">
                Target Exam Date (Optional)
              </Label>
              <Input
                id="goalDate"
                type="date"
                {...form2.register("goalDate")}
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="flex-1 py-4 rounded-xl"
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1 gradient-primary text-white py-4 rounded-xl font-medium"
                disabled={createProfileMutation.isPending || !form2.watch("studyStyle")}
              >
                {createProfileMutation.isPending ? "Creating..." : "Complete Setup"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
