import { Link, useLocation } from "wouter";
import { 
  Home, 
  Calendar, 
  Newspaper, 
  BookOpen, 
  Brain, 
  StickyNote, 
  Zap, 
  BarChart3, 
  Trophy, 
  Upload, 
  Settings, 
  LogOut,
  GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const navigationItems = [
  { path: "/", icon: Home, label: "Dashboard" },
  { path: "/study-planner", icon: Calendar, label: "Study Planner" },
  { path: "/current-affairs", icon: Newspaper, label: "Current Affairs" },
  { path: "/vocabulary", icon: BookOpen, label: "Vocabulary" },
  { path: "/quiz", icon: Brain, label: "Quiz Arena" },
  { path: "/notes", icon: StickyNote, label: "Notes Vault" },
  { path: "/flashcards", icon: Zap, label: "Flashcards" },
  { path: "/analytics", icon: BarChart3, label: "Analytics" },
  { path: "/gamification", icon: Trophy, label: "Achievements" },
  { path: "/upload", icon: Upload, label: "Upload Center" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export default function DesktopSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-white lg:border-r lg:border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <GraduationCap className="w-8 h-8 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">AI Mentor</h1>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold">
              {(user as any)?.firstName?.charAt(0) || (user as any)?.email?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              {(user as any)?.firstName || 'Student'}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {(user as any)?.profile?.examType || 'Competitive Exam'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Link key={item.path} href={item.path}>
              <div className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                isActive
                  ? 'bg-blue-100 text-blue-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}>
                <Icon className={`mr-3 h-5 w-5 ${
                  isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                }`} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-600 hover:text-gray-900"
          onClick={() => window.location.href = '/api/logout'}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}