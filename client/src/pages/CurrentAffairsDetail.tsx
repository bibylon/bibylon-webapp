import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, BookOpen, Calendar, Clock, Eye, Globe, Heart, MessageCircle, Share2, Star, Tag, Bookmark, BookmarkCheck, ChevronRight, Bot, StickyNote, ExternalLink, Award, Brain, Lightbulb, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AIChat from "@/components/AIChat";
import { useState } from "react";

interface DetailedCurrentAffair {
  id: number;
  title: string;
  content: string;
  summary: string;
  category: string;
  source: string;
  publishedDate: Date;
  tags: string[];
  imageUrl?: string;
  importance: string;
  examRelevance: string[];
  readTime: number;
  aiKeyPoints: string[];
  aiSummary: string;
  relatedTopics: string[];
  isBookmarked: boolean;
  hasNotes: boolean;
  userNotes: any[];
}

const importanceColors = {
  high: "bg-red-500",
  medium: "bg-yellow-500", 
  low: "bg-green-500"
};

const importanceTextColors = {
  high: "text-red-700 dark:text-red-300",
  medium: "text-yellow-700 dark:text-yellow-300",
  low: "text-green-700 dark:text-green-300"
};

const categoryGradients = {
  "Politics": "from-blue-500 to-blue-600",
  "Economy": "from-green-500 to-green-600", 
  "Environment": "from-emerald-500 to-emerald-600",
  "Sports": "from-orange-500 to-orange-600",
  "Science & Technology": "from-purple-500 to-purple-600",
  "Education": "from-indigo-500 to-indigo-600",
  "Health": "from-pink-500 to-pink-600",
  "International": "from-cyan-500 to-cyan-600",
  "Social Issues": "from-rose-500 to-rose-600"
};

export default function CurrentAffairsDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showAIChat, setShowAIChat] = useState(false);

  // Fetch article details
  const { data: article, isLoading, error } = useQuery({
    queryKey: ["/api/current-affairs", id],
    staleTime: 10 * 60 * 1000, // 10 minutes cache for detailed view
  }) as { data: DetailedCurrentAffair | undefined, isLoading: boolean, error: any };

  // Bookmarking mutation
  const bookmarkMutation = useMutation({
    mutationFn: async ({ articleId, isBookmarked }: { articleId: number; isBookmarked: boolean }) => {
      if (isBookmarked) {
        return apiRequest(`/api/current-affairs/${articleId}/bookmark`, 'DELETE');
      } else {
        return apiRequest(`/api/current-affairs/${articleId}/bookmark`, 'POST');
      }
    },
    onSuccess: (_, { isBookmarked }) => {
      // Update cache for this specific article
      queryClient.setQueryData(["/api/current-affairs", id], (old: any) => 
        old ? { ...old, isBookmarked: !isBookmarked } : old
      );
      
      // Invalidate current affairs list to keep consistency
      queryClient.invalidateQueries({ queryKey: ["/api/current-affairs"] });
      
      toast({
        title: isBookmarked ? "Bookmark removed" : "Article bookmarked",
        description: isBookmarked ? "Removed from your bookmarks" : "Added to your bookmarks",
      });
    }
  });

  const handleBookmark = () => {
    if (!article) return;
    bookmarkMutation.mutate({ articleId: article.id, isBookmarked: article.isBookmarked });
  };

  const handleAskAI = () => {
    setShowAIChat(true);
  };

  const handleNotesClick = () => {
    setLocation(`/notes?articleId=${article?.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-6">
            <div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="flex space-x-2">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
          
          {/* Content skeleton */}
          <div className="space-y-6">
            <div className="w-3/4 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="space-y-3">
              <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="w-5/6 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="w-4/5 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Article not found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The article you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => setLocation("/current-affairs")} data-testid="button-back-to-list">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Current Affairs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const gradient = categoryGradients[article.category as keyof typeof categoryGradients] || "from-gray-500 to-gray-600";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header with navigation and actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/current-affairs")}
            className="flex items-center hover:bg-gray-100 dark:hover:bg-gray-800"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Current Affairs
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={article.isBookmarked ? "default" : "outline"}
              size="sm"
              onClick={handleBookmark}
              disabled={bookmarkMutation.isPending}
              className={article.isBookmarked ? "bg-yellow-500 hover:bg-yellow-600" : ""}
              data-testid={`bookmark-${article.id}`}
            >
              {article.isBookmarked ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleAskAI} data-testid={`ask-ai-${article.id}`}>
              <Bot className="w-4 h-4" />
            </Button>
            
            {article.hasNotes && (
              <Button variant="outline" size="sm" onClick={handleNotesClick} data-testid={`notes-${article.id}`}>
                <StickyNote className="w-4 h-4" />
              </Button>
            )}
            
            <Button variant="outline" size="sm" data-testid={`share-${article.id}`}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Main article content */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            {/* Article metadata */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className={`bg-gradient-to-r ${gradient} text-white border-0`}>
                {article.category}
              </Badge>
              
              <Badge variant="outline" className={`${importanceTextColors[article.importance as keyof typeof importanceTextColors]} border-current`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${importanceColors[article.importance as keyof typeof importanceColors]}`}></div>
                {article.importance.toUpperCase()} Priority
              </Badge>
              
              {article.examRelevance.map((exam) => (
                <Badge key={exam} variant="secondary" className="bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  <Award className="w-3 h-3 mr-1" />
                  {exam}
                </Badge>
              ))}
            </div>

            {/* Title */}
            <CardTitle className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
              {article.title}
            </CardTitle>

            {/* Article meta info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 pt-4">
              <div className="flex items-center">
                <Globe className="w-4 h-4 mr-2" />
                {article.source}
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {format(new Date(article.publishedDate), "MMM d, yyyy")}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                {article.readTime} min read
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Hero image */}
            {article.imageUrl && (
              <div className="relative">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-64 lg:h-80 object-cover rounded-lg shadow-sm"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
              </div>
            )}

            {/* AI Summary section */}
            {article.aiSummary && (
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-lg text-blue-800 dark:text-blue-200">AI Summary</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-700 dark:text-blue-300 leading-relaxed">{article.aiSummary}</p>
                </CardContent>
              </Card>
            )}

            {/* AI Key Points */}
            {article.aiKeyPoints && article.aiKeyPoints.length > 0 && (
              <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <Lightbulb className="w-5 h-5 text-amber-600" />
                    <CardTitle className="text-lg text-amber-800 dark:text-amber-200">Key Points</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {article.aiKeyPoints.map((point, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-amber-700 dark:text-amber-300 leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Main content */}
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {article.content}
              </div>
            </div>

            {/* Tags and related topics */}
            <div className="space-y-4">
              {article.tags && article.tags.length > 0 && (
                <div>
                  <div className="flex items-center mb-2">
                    <Tag className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {article.relatedTopics && article.relatedTopics.length > 0 && (
                <div>
                  <div className="flex items-center mb-2">
                    <Target className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">Related Topics</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {article.relatedTopics.map((topic) => (
                      <Badge key={topic} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleAskAI}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white flex-1"
            data-testid={`ask-ai-detail-${article.id}`}
          >
            <Bot className="w-4 h-4 mr-2" />
            Ask AI about this article
          </Button>
          
          <Button
            variant="outline"
            onClick={handleNotesClick}
            className="flex-1"
            data-testid={`notes-detail-${article.id}`}
          >
            <StickyNote className="w-4 h-4 mr-2" />
            {article.hasNotes ? "View Notes" : "Add Notes"}
          </Button>
        </div>
      </div>

      {/* AI Chat Modal */}
      {showAIChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <AIChat
              initialMessage={`I'm reading the Current Affairs article "${article.title}". Can you help me understand this topic better and its relevance for competitive exams?`}
              context={{
                type: "current-affairs",
                articleId: article.id,
                title: article.title,
                summary: article.summary,
                category: article.category,
                examRelevance: article.examRelevance
              }}
              onClose={() => setShowAIChat(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}