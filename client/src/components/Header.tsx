import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import MobileMenu from "@/components/MobileMenu";
import { 
  GraduationCap, 
  Coins, 
  Menu, 
  Bell,
  User
} from "lucide-react";

interface HeaderProps {}

export default function Header(): JSX.Element {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch user profile data to get coins
  const { data: userWithProfile } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const userProfile = (userWithProfile as any)?.profile;
  const coins = userProfile?.coins || 0;
  const streak = userProfile?.streak || 0;

  return (
    <>
      <header className="sticky top-0 z-50 lg:ml-64 w-full lg:w-[calc(100%-16rem)] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-200">
        {/* Mobile & Tablet Layout (< lg) */}
        <div className="lg:hidden">
          <div className="grid grid-cols-3 items-center h-16 px-4">
            {/* Left - Menu Button */}
            <div className="flex justify-start">
              <Button
                variant="ghost"
                size="sm"
                className="p-2 touch-target"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsMobileMenuOpen(true);
                }}
                aria-label="Open navigation menu"
                data-testid="mobile-menu-toggle"
              >
                <Menu className="h-5 w-5 text-gray-700" />
              </Button>
            </div>

            {/* Center - Logo */}
            <div className="flex justify-center">
              <Link href="/">
                <div className="flex items-center cursor-pointer group">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg group-hover:shadow-xl transition-shadow">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="hidden sm:block ml-2 text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    AI Mentor
                  </h1>
                </div>
              </Link>
            </div>

            {/* Right - Coins */}
            <div className="flex justify-end">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-full px-2 py-1 hover:from-yellow-100 hover:to-amber-100 transition-colors cursor-pointer">
                    <Coins className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-semibold text-amber-700">
                      {coins.toLocaleString()}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Study coins earned through learning activities</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Desktop Layout (>= lg) */}
        <div className="hidden lg:flex h-16 items-center justify-between px-6">
          {/* Left - Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer group">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg group-hover:shadow-xl transition-shadow">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  AI Mentor
                </h1>
                <p className="text-xs text-gray-500">
                  Competitive Exam Prep
                </p>
              </div>
            </div>
          </Link>

          {/* Right - User Info & Actions */}
          <div className="flex items-center space-x-4">
            {/* Coins Display */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-full px-4 py-2 hover:from-yellow-100 hover:to-amber-100 transition-colors cursor-pointer">
                  <Coins className="w-5 h-5 text-amber-600" />
                  <span className="text-base font-semibold text-amber-700">
                    {coins.toLocaleString()}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Study coins earned through learning activities</p>
                <p className="text-xs text-gray-500">
                  Complete tasks and quizzes to earn more coins!
                </p>
              </TooltipContent>
            </Tooltip>

            {/* Study Streak */}
            {streak > 0 && (
              <div className="flex items-center space-x-1 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-full px-3 py-1.5">
                <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-orange-700">
                  {streak} day{streak !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="relative p-2 hover:bg-gray-100"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {/* Notification dot */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
            </Button>

            {/* User Profile */}
            <div className="flex items-center space-x-2 pl-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center border border-blue-200">
                {(userWithProfile as any)?.profileImageUrl ? (
                  <img 
                    src={(userWithProfile as any).profileImageUrl} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-blue-600 font-semibold text-sm">
                    {(userWithProfile as any)?.firstName?.charAt(0) || (userWithProfile as any)?.email?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <div className="hidden xl:block min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {(userWithProfile as any)?.firstName || 'Student'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {userProfile?.targetExam || 'Competitive Exam'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onOpenChange={setIsMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </>
  );
}