import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Home,
  Calendar,
  HelpCircle,
  TrendingUp,
  Newspaper
} from "lucide-react";

const navItems = [
  { id: "dashboard", path: "/", icon: Home, label: "Home" },
  { id: "planner", path: "/planner", icon: Calendar, label: "Planner" },
  { id: "quiz", path: "/quiz", icon: HelpCircle, label: "Quiz" },
  { id: "analytics", path: "/analytics", icon: TrendingUp, label: "Progress" },
  { id: "current-affairs", path: "/current-affairs", icon: Newspaper, label: "News" },
];

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const isActive = (path: string) => {
    if (path === "/") {
      return location === "/";
    }
    return location.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 safe-bottom">
      <div className="grid grid-cols-5 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => setLocation(item.path)}
              className={`p-4 h-auto flex flex-col items-center space-y-1 rounded-none transition-colors ${
                active 
                  ? "nav-item-active bg-primary bg-opacity-10" 
                  : "nav-item-inactive hover:bg-gray-50"
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? "text-primary" : "text-gray-600"}`} />
              <span className={`text-xs font-medium ${active ? "text-primary" : "text-gray-600"}`}>
                {item.label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
