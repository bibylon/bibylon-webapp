import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LogOut, GraduationCap, Clock } from "lucide-react";
import { navigationItems } from "./navigation";

interface MobileMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

export default function MobileMenu({
  isOpen,
  onOpenChange,
  onClose,
}: MobileMenuProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  // Fetch user profile data
  const { data: userWithProfile } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const userProfile = (userWithProfile as any)?.profile;
  const coins = userProfile?.coins || 0;
  const streak = userProfile?.streak || 0;

  // Close menu on route change
  // useEffect(() => {
  //   onClose();
  // }, [location, onClose]);

  // useEffect(() => {
  //   if (isOpen) {
  //     onClose();
  //   }
  // }, [location, isOpen, onClose]);

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-80 p-0 bg-white border-r border-gray-200"
        aria-describedby="mobile-navigation-description"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
          <SheetDescription id="mobile-navigation-description">
            Access all app features and navigate to different sections
          </SheetDescription>
        </SheetHeader>

        {/* Header */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AI Mentor
            </h1>
          </div>
        </div>

        {/* User Profile with Greeting */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center border-2 border-blue-200 shadow-sm">
              {(userWithProfile as any)?.profileImageUrl ? (
                <img
                  src={(userWithProfile as any).profileImageUrl}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-blue-600 font-bold text-lg">
                  {(userWithProfile as any)?.firstName?.charAt(0) ||
                    (userWithProfile as any)?.email?.charAt(0) ||
                    "U"}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {getGreeting()},{" "}
                {(userWithProfile as any)?.firstName || "Student"}!
              </div>
              <div className="text-xs text-gray-500 truncate">
                {userProfile?.targetExam || "Competitive Exam"}
              </div>
              <div className="flex items-center space-x-3 mt-1">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"></div>
                  <span className="text-xs font-medium text-amber-700">
                    {coins}
                  </span>
                </div>
                {streak > 0 && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-orange-500" />
                    <span className="text-xs font-medium text-orange-700">
                      {streak}d
                    </span>
                  </div>
                )}
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
                <div
                  data-testid={item.testId}
                  className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer touch-target ${
                    isActive
                      ? "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-900 shadow-sm border border-blue-200"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100"
                  }`}
                  onClick={() => onClose()}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 transition-colors ${
                      isActive
                        ? "text-blue-600"
                        : "text-gray-500 group-hover:text-gray-700"
                    }`}
                  />
                  {item.label}
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <Separator />

        {/* Logout */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors touch-target"
            onClick={() => (window.location.href = "/api/logout")}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
