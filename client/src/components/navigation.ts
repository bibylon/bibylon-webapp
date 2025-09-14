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
  Settings
} from "lucide-react";

export interface NavigationItem {
  path: string;
  icon: React.ComponentType<any>;
  label: string;
  testId?: string;
}

export const navigationItems: NavigationItem[] = [
  { path: "/", icon: Home, label: "Dashboard", testId: "nav-dashboard" },
  { path: "/study-planner", icon: Calendar, label: "Study Planner", testId: "nav-study-planner" },
  { path: "/current-affairs", icon: Newspaper, label: "Current Affairs", testId: "nav-current-affairs" },
  { path: "/vocabulary", icon: BookOpen, label: "Vocabulary", testId: "nav-vocabulary" },
  { path: "/quiz", icon: Brain, label: "Quiz Arena", testId: "nav-quiz" },
  { path: "/notes", icon: StickyNote, label: "Notes Vault", testId: "nav-notes" },
  { path: "/flashcards", icon: Zap, label: "Flashcards", testId: "nav-flashcards" },
  { path: "/analytics", icon: BarChart3, label: "Analytics", testId: "nav-analytics" },
  { path: "/gamification", icon: Trophy, label: "Achievements", testId: "nav-gamification" },
  { path: "/upload", icon: Upload, label: "Upload Center", testId: "nav-upload" },
  { path: "/settings", icon: Settings, label: "Settings", testId: "nav-settings" },
];