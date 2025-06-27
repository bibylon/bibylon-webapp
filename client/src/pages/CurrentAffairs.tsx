import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Filter,
  Bookmark,
  Brain,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Calendar
} from "lucide-react";
import { format, subDays } from "date-fns";

const categories = [
  { id: "all", name: "All", color: "bg-gray-500" },
  { id: "Polity", name: "Polity", color: "bg-red-500" },
  { id: "Economy", name: "Economy", color: "bg-green-600" },
  { id: "Environment", name: "Environment", color: "bg-green-500" },
  { id: "Science", name: "Science", color: "bg-blue-600" },
  { id: "International", name: "International", color: "bg-purple-500" },
];

export default function CurrentAffairs() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [expandedArticles, setExpandedArticles] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const { data: currentAffairs, isLoading } = useQuery({
    queryKey: ["/api/current-affairs", { 
      category: selectedCategory === "all" ? undefined : selectedCategory,
      date: format(selectedDate, "yyyy-MM-dd")
    }],
  });

  const generateQuizMutation = useMutation({
    mutationFn: async (articleId: number) => {
      await apiRequest("POST", `/api/quiz/generate-from-current-affairs/${articleId}`, {
        numQuestions: 5
      });
    },
    onSuccess: () => {
      toast({
        title: "Quiz Generated!",
        description: "New quiz questions have been created from this article.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate quiz. Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveNoteMutation = useMutation({
    mutationFn: async ({ title, content, sourceId }: { title: string; content: string; sourceId: number }) => {
      await apiRequest("POST", "/api/notes", {
        title,
        content,
        category: "Current Affairs",
        source: "current_affairs",
        sourceId,
        tags: [selectedCategory],
      });
    },
    onSuccess: () => {
      toast({
        title: "Note Saved!",
        description: "Article has been saved to your notes.",
      });
    },
  });

  const toggleExpanded = (articleId: number) => {
    const newExpanded = new Set(expandedArticles);
    if (newExpanded.has(articleId)) {
      newExpanded.delete(articleId);
    } else {
      newExpanded.add(articleId);
    }
    setExpandedArticles(newExpanded);
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.color : "bg-gray-500";
  };

  const dateTabs = [
    { label: "Today", date: new Date() },
    { label: "Yesterday", date: subDays(new Date(), 1) },
    { label: format(subDays(new Date(), 2), "MMM d"), date: subDays(new Date(), 2) },
    { label: format(subDays(new Date(), 3), "MMM d"), date: subDays(new Date(), 3) },
  ];

  return (
    <div className="p-4 pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-poppins font-bold text-gray-800">Current Affairs</h1>
        <Button variant="ghost" size="sm" className="p-2">
          <Filter className="w-5 h-5 text-gray-600" />
        </Button>
      </div>

      {/* Category Filters */}
      <div className="flex space-x-2 mb-6 overflow-x-auto scrollbar-hide">
        {categories.map((category) => (
          <Button
            key={category.id}
            size="sm"
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.id)}
            className={`whitespace-nowrap ${
              selectedCategory === category.id 
                ? "bg-primary text-white" 
                : "bg-white text-gray-600"
            }`}
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Date Tabs */}
      <Tabs value={format(selectedDate, "yyyy-MM-dd")} className="mb-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100">
          {dateTabs.map((tab) => (
            <TabsTrigger
              key={format(tab.date, "yyyy-MM-dd")}
              value={format(tab.date, "yyyy-MM-dd")}
              onClick={() => setSelectedDate(tab.date)}
              className="text-xs"
            >
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">{tab.label}</div>
                <div className="font-bold">{format(tab.date, "d")}</div>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* News Feed */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))
        ) : Array.isArray(currentAffairs) && currentAffairs.length > 0 ? (
          currentAffairs.map((article: any) => {
            const isExpanded = expandedArticles.has(article.id);
            return (
              <Card key={article.id} className="card-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <Badge 
                      className={`${getCategoryColor(article.category)} text-white text-xs`}
                    >
                      {article.category}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {format(new Date(article.date || article.publishedDate), "h:mm a")}
                    </span>
                  </div>
                  
                  <h3 className="font-medium text-gray-800 mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {isExpanded ? article.content : article.summary}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => saveNoteMutation.mutate({
                          title: article.title,
                          content: article.content,
                          sourceId: article.id
                        })}
                        disabled={saveNoteMutation.isPending}
                        className="p-0 h-auto"
                      >
                        <Bookmark className="w-4 h-4 mr-1" />
                        <span className="text-xs">Save</span>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto"
                      >
                        <Brain className="w-4 h-4 mr-1" />
                        <span className="text-xs">Ask AI</span>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => generateQuizMutation.mutate(article.id)}
                        disabled={generateQuizMutation.isPending}
                        className="p-0 h-auto"
                      >
                        <HelpCircle className="w-4 h-4 mr-1" />
                        <span className="text-xs">
                          {generateQuizMutation.isPending ? "Generating..." : "Quiz"}
                        </span>
                      </Button>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(article.id)}
                      className="p-0 h-auto text-primary"
                    >
                      <span className="text-xs font-medium mr-1">
                        {isExpanded ? "Show Less" : "Read Full"}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                  
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {article.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="card-shadow">
            <CardContent className="p-6 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="font-medium text-gray-800 mb-2">No articles found</h3>
              <p className="text-sm text-gray-600">
                No current affairs articles available for {format(selectedDate, "MMMM d, yyyy")}
                {selectedCategory !== "all" && ` in ${selectedCategory}`}.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
