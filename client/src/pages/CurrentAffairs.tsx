import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AIChat from "@/components/AIChat";
import { 
  Filter,
  Bookmark,
  BookmarkCheck,
  Brain,
  HelpCircle,
  Clock,
  TrendingUp,
  Sparkles,
  Eye,
  MessageSquare,
  Calendar,
  ChevronRight,
  Star,
  Zap,
  Users
} from "lucide-react";
import { format, subDays, isToday, isYesterday } from "date-fns";

// Enhanced category configuration with colors and icons
const categories = [
  { id: "all", name: "All", color: "bg-gradient-to-r from-blue-500 to-indigo-600", icon: "📋" },
  { id: "Education", name: "Education", color: "bg-gradient-to-r from-green-500 to-emerald-600", icon: "🎓" },
  { id: "Economy", name: "Economy", color: "bg-gradient-to-r from-yellow-500 to-orange-600", icon: "💰" },
  { id: "Science & Technology", name: "Science & Tech", color: "bg-gradient-to-r from-purple-500 to-pink-600", icon: "🔬" },
  { id: "Environment", name: "Environment", color: "bg-gradient-to-r from-green-600 to-teal-600", icon: "🌱" },
  { id: "Polity", name: "Polity", color: "bg-gradient-to-r from-red-500 to-pink-600", icon: "🏛️" },
  { id: "International", name: "International", color: "bg-gradient-to-r from-indigo-500 to-purple-600", icon: "🌍" },
];

// AI-powered quiz options
const quizOptions = [
  { key: "today", label: "Today's Quiz", icon: Clock, description: "5 questions from today's articles" },
  { key: "week", label: "Weekly Quiz", icon: Calendar, description: "10 questions from this week" },
  { key: "month", label: "Monthly Quiz", icon: TrendingUp, description: "15 questions from this month" },
];

interface CurrentAffair {
  id: number;
  title: string;
  content: string;
  summary: string;
  category: string;
  source: string;
  publishedDate: string;
  tags: string[];
  imageUrl?: string;
  importance: string;
  examRelevance: string[];
  readTime: number;
  aiKeyPoints?: string[];
  aiSummary?: string;
  relatedTopics?: string[];
  isBookmarked?: boolean;
  hasNotes?: boolean;
  userInteractions?: number;
}

export default function CurrentAffairs() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showQuizOptions, setShowQuizOptions] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiChatContext, setAiChatContext] = useState<any>(null);
  const { toast } = useToast();

  // Enhanced current affairs query with user-specific data
  const { data: currentAffairs, isLoading, error } = useQuery({
    queryKey: ["/api/current-affairs", { 
      category: selectedCategory === "all" ? undefined : selectedCategory,
      date: format(selectedDate, "yyyy-MM-dd"),
      limit: 20
    }],
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 30 * 60 * 1000, // 30 minutes in memory
  });

  // Personalized recommendations query
  const { data: recommendations } = useQuery({
    queryKey: ["/api/current-affairs/recommendations", { limit: 3 }],
    staleTime: 15 * 60 * 1000, // 15 minutes cache
  }) as { data: any[] | undefined };

  // Bookmarking mutation
  const bookmarkMutation = useMutation({
    mutationFn: async ({ articleId, isBookmarked }: { articleId: number; isBookmarked: boolean }) => {
      const method = isBookmarked ? "DELETE" : "POST";
      await apiRequest(method, `/api/current-affairs/${articleId}/bookmark`);
    },
    onSuccess: (_, { articleId, isBookmarked }) => {
      // Update cache optimistically
      queryClient.setQueriesData({ queryKey: ["/api/current-affairs"] }, (old: any) => {
        if (!old) return old;
        return old.map((article: CurrentAffair) => 
          article.id === articleId 
            ? { ...article, isBookmarked: !isBookmarked }
            : article
        );
      });
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["/api/current-affairs"] });
      
      toast({
        title: isBookmarked ? "Bookmark Removed" : "Article Bookmarked",
        description: isBookmarked 
          ? "Article removed from your bookmarks" 
          : "Article saved to your bookmarks",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update bookmark. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Enhanced quiz generation mutation
  const generateQuizMutation = useMutation({
    mutationFn: async (timeframe: string) => {
      await apiRequest("POST", "/api/current-affairs/quiz/generate", {
        timeframe,
        numQuestions: timeframe === "today" ? 5 : timeframe === "week" ? 10 : 15,
        categories: selectedCategory === "all" ? [] : [selectedCategory],
      });
    },
    onSuccess: () => {
      toast({
        title: "Quiz Generated! 🎉",
        description: "Your personalized quiz is ready. Good luck!",
      });
      setShowQuizOptions(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate quiz. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Date navigation helpers
  const getDateTabs = () => {
    const today = new Date();
    const tabs = [];
    
    for (let i = 0; i < 7; i++) {
      const date = subDays(today, i);
      tabs.push({
        date,
        label: i === 0 ? "Today" : i === 1 ? "Yesterday" : format(date, "MMM d"),
        dayNumber: format(date, "d"),
        dayName: format(date, "EEE"),
      });
    }
    
    return tabs;
  };

  const getCategoryInfo = (category: string) => {
    return categories.find(c => c.id === category) || categories[0];
  };

  const getImportanceBadge = (importance: string) => {
    const styles = {
      high: "bg-red-100 text-red-800 border-red-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200", 
      low: "bg-green-100 text-green-800 border-green-200",
    };
    return styles[importance as keyof typeof styles] || styles.medium;
  };

  const formatReadTime = (minutes: number) => {
    return `${minutes} min read`;
  };

  const dateTabs = getDateTabs();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        
        {/* Enhanced Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Current Affairs
              </h1>
              <p className="text-sm text-gray-600 mt-1">Stay ahead with AI-powered insights</p>
            </div>
          </div>
        </div>

        {/* Personalized Recommendations Section */}
        {Array.isArray(recommendations) && recommendations.length > 0 && (
          <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Recommended For You
                </h2>
                <Badge variant="secondary" className="ml-2">AI Powered</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="w-full">
                <div className="flex space-x-4 pb-4">
                  {recommendations?.slice(0, 3).map((rec: any) => (
                    <Card 
                      key={rec.id} 
                      className="min-w-[280px] bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                            <Brain className="w-6 h-6 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2 mb-1">
                              {rec.currentAffair?.title}
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                              {rec.reason}
                            </p>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                {rec.recommendationType.replace('_', ' ')}
                              </Badge>
                              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Filter Section */}
        <div className="space-y-4">
          {/* Category Filter */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Filter by Category
            </h3>
            <ScrollArea className="w-full">
              <div className="flex space-x-3 pb-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    size="sm"
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`whitespace-nowrap transition-all duration-300 ${
                      selectedCategory === category.id 
                        ? `${category.color} text-white shadow-lg scale-105 border-0` 
                        : "bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:scale-105 border border-gray-200 dark:border-gray-700"
                    }`}
                    data-testid={`category-${category.id}`}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          {/* Date Filter */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Filter by Date
            </h3>
            <ScrollArea className="w-full">
              <div className="flex space-x-3 pb-2">
                {dateTabs.map((dateTab, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant={format(selectedDate, "yyyy-MM-dd") === format(dateTab.date, "yyyy-MM-dd") ? "default" : "outline"}
                    onClick={() => setSelectedDate(dateTab.date)}
                    className={`whitespace-nowrap min-w-[80px] transition-all duration-300 ${
                      format(selectedDate, "yyyy-MM-dd") === format(dateTab.date, "yyyy-MM-dd")
                        ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg scale-105 border-0"
                        : "bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:scale-105 border border-gray-200 dark:border-gray-700"
                    }`}
                    data-testid={`date-${format(dateTab.date, "yyyy-MM-dd")}`}
                  >
                    <div className="text-center">
                      <div className="text-xs font-medium">{dateTab.label}</div>
                      <div className="text-xs opacity-75">{dateTab.dayName}</div>
                    </div>
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          {/* AI Quiz Generation */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Button
                onClick={() => setShowQuizOptions(!showQuizOptions)}
                variant="outline"
                className="w-full bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:shadow-md transition-all duration-300"
                data-testid="quiz-generator-toggle"
              >
                <Zap className="w-4 h-4 mr-2" />
                Generate AI Quiz
              </Button>
            </div>
            
            {showQuizOptions && (
              <div className="flex flex-wrap gap-2">
                {quizOptions.map((option) => (
                  <Button
                    key={option.key}
                    size="sm"
                    variant="outline"
                    onClick={() => generateQuizMutation.mutate(option.key)}
                    disabled={generateQuizMutation.isPending}
                    className="bg-white/80 dark:bg-gray-800/80 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all duration-300"
                    data-testid={`quiz-${option.key}`}
                  >
                    <option.icon className="w-3 h-3 mr-1" />
                    {option.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Articles Grid */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="border-0 shadow-md">
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-20 w-full" />
                      <div className="flex justify-between">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
              <CardContent className="p-6 text-center">
                <div className="text-red-600 dark:text-red-400 mb-4">
                  <Calendar className="w-12 h-12 mx-auto mb-2" />
                  <h3 className="font-semibold">Unable to load articles</h3>
                  <p className="text-sm mt-2">Please check your connection and try again.</p>
                </div>
              </CardContent>
            </Card>
          ) : Array.isArray(currentAffairs) && currentAffairs.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {currentAffairs.map((article: CurrentAffair) => {
                const categoryInfo = getCategoryInfo(article.category);
                
                return (
                  <Card 
                    key={article.id} 
                    className="group border-0 shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 bg-white dark:bg-gray-900"
                    data-testid={`article-card-${article.id}`}
                  >
                    <CardContent className="p-0">
                      {/* Article Image */}
                      <div className="relative overflow-hidden rounded-t-lg">
                        {article.imageUrl ? (
                          <img
                            src={article.imageUrl}
                            alt={article.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                            <span className="text-4xl opacity-60">{categoryInfo.icon}</span>
                          </div>
                        )}
                        
                        {/* Floating badges */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                          <Badge className={`${categoryInfo.color} text-white text-xs shadow-lg`}>
                            {article.category}
                          </Badge>
                          {article.importance && (
                            <Badge variant="secondary" className={`${getImportanceBadge(article.importance)} text-xs`}>
                              {article.importance.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Quick bookmark */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => bookmarkMutation.mutate({ 
                            articleId: article.id, 
                            isBookmarked: article.isBookmarked || false 
                          })}
                          className="absolute top-3 right-3 w-8 h-8 p-0 bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-900 shadow-md"
                          data-testid={`bookmark-${article.id}`}
                        >
                          {article.isBookmarked ? (
                            <BookmarkCheck className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Bookmark className="w-4 h-4 text-gray-600" />
                          )}
                        </Button>
                      </div>

                      {/* Article Content */}
                      <div className="p-6 space-y-4">
                        {/* Meta information */}
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatReadTime(article.readTime)}
                            </div>
                            {(article.userInteractions ?? 0) > 0 && (
                              <div className="flex items-center">
                                <Eye className="w-3 h-3 mr-1" />
                                {article.userInteractions ?? 0}
                              </div>
                            )}
                          </div>
                          <span>
                            {format(new Date(article.publishedDate), "MMM d")}
                          </span>
                        </div>

                        {/* Title */}
                        <Link href={`/current-affairs/${article.id}`}>
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                            {article.title}
                          </h3>
                        </Link>

                        {/* AI Summary */}
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                          {article.aiSummary || article.summary}
                        </p>

                        {/* AI Key Points */}
                        {article.aiKeyPoints && article.aiKeyPoints.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center">
                              <Brain className="w-3 h-3 mr-1 text-purple-600" />
                              Key Points
                            </h4>
                            <ul className="space-y-1">
                              {article.aiKeyPoints.slice(0, 2).map((point, index) => (
                                <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-start">
                                  <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                  <span className="line-clamp-1">{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Exam Relevance */}
                        {article.examRelevance && article.examRelevance.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {article.examRelevance.slice(0, 3).map((exam, index) => (
                              <Badge 
                                key={index} 
                                variant="outline" 
                                className="text-xs bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                              >
                                {exam}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setAiChatContext({
                                  articleId: article.id,
                                  title: article.title,
                                  summary: article.aiSummary || article.summary,
                                  category: article.category
                                });
                                setShowAIChat(true);
                              }}
                              className="text-xs h-8 px-3 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                              data-testid={`ai-help-${article.id}`}
                            >
                              <Brain className="w-3 h-3 mr-1" />
                              Ask AI
                            </Button>
                            
                            {article.hasNotes && (
                              <Link href={`/notes?articleId=${article.id}`}>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-xs h-8 px-3 text-blue-600 dark:text-blue-400"
                                  data-testid={`notes-${article.id}`}
                                >
                                  <MessageSquare className="w-3 h-3 mr-1" />
                                  Notes
                                </Button>
                              </Link>
                            )}
                          </div>

                          <Link href={`/current-affairs/${article.id}`}>
                            <Button 
                              size="sm" 
                              className="h-8 text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                              data-testid={`read-more-${article.id}`}
                            >
                              Read More
                              <ChevronRight className="w-3 h-3 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-0 shadow-md bg-gray-50 dark:bg-gray-900">
              <CardContent className="p-12 text-center">
                <div className="text-gray-400 dark:text-gray-600 mb-4">
                  <Calendar className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-300 mb-2">
                    No articles found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    No current affairs articles available
                    {selectedCategory !== "all" && ` in the ${selectedCategory} category`}.
                    Try adjusting your filters or check back later.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* AI Chat Modal */}
      {showAIChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-4xl h-[80vh] mx-4">
            <AIChat
              onClose={() => {
                setShowAIChat(false);
                setAiChatContext(null);
              }}
              initialMessage={`Help me understand this current affairs article: "${aiChatContext?.title}". ${aiChatContext?.summary ? `Here's the summary: ${aiChatContext.summary}` : ''}`}
              context={aiChatContext}
            />
          </div>
        </div>
      )}
    </div>
  );
}