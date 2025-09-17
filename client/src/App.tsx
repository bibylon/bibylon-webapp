import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import StudyPlanner from "@/pages/StudyPlanner";
import CurrentAffairs from "@/pages/CurrentAffairs";
import CurrentAffairsDetail from "@/pages/CurrentAffairsDetail";
import VocabularyBuilder from "@/pages/VocabularyBuilder";
import QuizArena from "@/pages/QuizArena";
import NotesVault from "@/pages/NotesVault";
import FlashcardCarousel from "@/pages/FlashcardCarousel";
import Analytics from "@/pages/Analytics";
import Gamification from "@/pages/Gamification";
import UploadCenter from "@/pages/UploadCenter";
import Settings from "@/pages/Settings";
import FloatingAIButton from "@/components/FloatingAIButton";
import BottomNavigation from "@/components/BottomNavigation";
import DesktopSidebar from "@/components/DesktopSidebar";
import Header from "@/components/Header";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="lg:max-w-7xl lg:mx-auto max-w-md mx-auto bg-white min-h-screen relative overflow-hidden">
      <Switch>
        {!isAuthenticated ? (
          <>
            <Route path="/" component={Landing} />
            <Route path="/onboarding" component={Onboarding} />
          </>
        ) : (
          <>
            {/* Check if user needs onboarding */}
            {!(user as any)?.firstName ? (
              <Route path="/" component={Onboarding} />
            ) : (
              <>
                {/* Header - shows across all authenticated pages */}
                <Header />
                
                {/* Desktop Sidebar */}
                <DesktopSidebar />
                
                {/* Main Content Area */}
                <div className="lg:pl-64 pt-16 lg:pt-16">
                  <div className="lg:max-w-none max-w-md lg:mx-0 mx-auto">
                    <Route path="/" component={Dashboard} />
                    <Route path="/study-planner" component={StudyPlanner} />
                    <Route path="/current-affairs" component={CurrentAffairs} />
                    <Route path="/current-affairs/:id" component={CurrentAffairsDetail} />
                    <Route path="/vocabulary" component={VocabularyBuilder} />
                    <Route path="/quiz" component={QuizArena} />
                    <Route path="/notes" component={NotesVault} />
                    <Route path="/flashcards" component={FlashcardCarousel} />
                    <Route path="/analytics" component={Analytics} />
                    <Route path="/gamification" component={Gamification} />
                    <Route path="/upload" component={UploadCenter} />
                    <Route path="/settings" component={Settings} />
                  </div>
                </div>
              </>
            )}
          </>
        )}
        <Route component={NotFound} />
      </Switch>
      
      {/* Mobile-only components - only show if authenticated and onboarded */}
      {isAuthenticated && (user as any)?.firstName && (
        <div className="lg:hidden">
          <FloatingAIButton />
          <BottomNavigation />
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
