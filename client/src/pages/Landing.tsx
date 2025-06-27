import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Target, Trophy, Users } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Hero Section */}
        <div className="text-center py-12">
          <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-poppins font-bold text-gray-800 mb-3">
            My AI Mentor
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Your Personalized Competitive Exam Companion
          </p>
          <p className="text-sm text-gray-500">
            Master NEET, UPSC, SSC, JEE & more with AI-powered learning
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-8">
          <Card className="card-shadow">
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="w-12 h-12 gradient-secondary rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Personalized Study Plans</h3>
                <p className="text-sm text-gray-600">AI-generated daily plans tailored to your exam</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="w-12 h-12 gradient-accent rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Gamified Learning</h3>
                <p className="text-sm text-gray-600">Earn coins, badges, and maintain streaks</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Smart Content</h3>
                <p className="text-sm text-gray-600">Current affairs, vocabulary & adaptive quizzes</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <Button 
            onClick={handleLogin}
            className="w-full gradient-primary text-white py-4 rounded-xl font-medium text-lg hover:opacity-90 transition-opacity"
          >
            Start Your Journey
          </Button>
          
          <p className="text-center text-xs text-gray-500">
            Join thousands of students achieving their exam goals
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">10K+</div>
            <div className="text-xs text-gray-500">Students</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary">95%</div>
            <div className="text-xs text-gray-500">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">50+</div>
            <div className="text-xs text-gray-500">Exams Covered</div>
          </div>
        </div>
      </div>
    </div>
  );
}
