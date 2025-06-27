import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Volume2,
  Bookmark,
  Brain,
  Plus,
  Play,
  Lightbulb,
  Clock,
  TrendingUp
} from "lucide-react";

const difficultyLevels = [
  { id: "Basic", name: "Basic", color: "bg-green-500" },
  { id: "Moderate", name: "Moderate", color: "bg-yellow-500" },
  { id: "Advanced", name: "Advanced", color: "bg-red-500" },
];

const statusOptions = [
  { id: "all", name: "All", color: "bg-gray-500" },
  { id: "learned", name: "Learned", color: "bg-green-500" },
  { id: "review", name: "Review", color: "bg-yellow-500" },
  { id: "difficult", name: "Difficult", color: "bg-red-500" },
];

export default function VocabularyBuilder() {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showAddWord, setShowAddWord] = useState(false);
  const { toast } = useToast();

  const { data: dailyVocab } = useQuery({
    queryKey: ["/api/vocabulary/daily"],
  });

  const { data: userVocabulary, isLoading } = useQuery({
    queryKey: ["/api/vocabulary/user", { 
      status: selectedStatus === "all" ? undefined : selectedStatus 
    }],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ vocabularyId, status }: { vocabularyId: number; status: string }) => {
      await apiRequest("PUT", `/api/vocabulary/${vocabularyId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vocabulary/user"] });
      toast({
        title: "Status Updated",
        description: "Vocabulary word status has been updated.",
      });
    },
  });

  const saveNoteMutation = useMutation({
    mutationFn: async ({ word, meaning, usage }: { word: string; meaning: string; usage: string }) => {
      await apiRequest("POST", "/api/notes", {
        title: `Vocabulary: ${word}`,
        content: `**Meaning:** ${meaning}\n\n**Usage:** ${usage}`,
        category: "Vocab Vault",
        tags: ["vocabulary", word.toLowerCase()],
      });
    },
    onSuccess: () => {
      toast({
        title: "Note Saved!",
        description: "Vocabulary word has been saved to your notes.",
      });
    },
  });

  const playPronunciation = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    const level = difficultyLevels.find(d => d.id === difficulty);
    return level ? level.color : "bg-gray-500";
  };

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(s => s.id === status);
    return statusOption ? statusOption.color : "bg-gray-500";
  };

  return (
    <div className="p-4 pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-poppins font-bold text-gray-800">Vocabulary Builder</h1>
        <Button
          size="sm"
          onClick={() => setShowAddWord(true)}
          className="gradient-primary text-white"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Word
        </Button>
      </div>

      {/* Daily Word of the Day */}
      {dailyVocab && (
        <Card className="gradient-secondary text-white mb-6 rounded-xl">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-xs text-green-200 mb-2">Word of the Day</div>
              <h2 className="text-2xl font-poppins font-bold mb-2">{dailyVocab.word}</h2>
              <p className="text-green-100 mb-4">{dailyVocab.meaning}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => playPronunciation(dailyVocab.word)}
                className="bg-white bg-opacity-20 text-white hover:bg-opacity-30"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Listen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Example */}
      {dailyVocab && (
        <Card className="card-shadow mb-6">
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-800 mb-2">Usage Example</h3>
            <p className="text-gray-600 text-sm mb-3">
              {dailyVocab.usage}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => saveNoteMutation.mutate({
                    word: dailyVocab.word,
                    meaning: dailyVocab.meaning,
                    usage: dailyVocab.usage
                  })}
                  disabled={saveNoteMutation.isPending}
                  className="p-0 h-auto"
                >
                  <Bookmark className="w-4 h-4 mr-1" />
                  <span className="text-xs">Save</span>
                </Button>
                <Button variant="ghost" size="sm" className="p-0 h-auto">
                  <Brain className="w-4 h-4 mr-1" />
                  <span className="text-xs">Ask AI</span>
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="p-0 h-auto text-primary">
                <span className="text-xs font-medium">Test Me</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Memory Trick */}
      {dailyVocab?.mnemonic && (
        <Card className="bg-amber-50 border-amber-200 mb-6">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 mb-1">Memory Trick</h4>
                <p className="text-sm text-gray-600">{dailyVocab.mnemonic}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Filter */}
      <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="mb-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100">
          {statusOptions.map((status) => (
            <TabsTrigger
              key={status.id}
              value={status.id}
              className="text-xs"
            >
              {status.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Vocabulary List */}
      <div className="mb-6">
        <h3 className="font-poppins font-bold text-gray-800 mb-4">Your Vocabulary</h3>
        
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : userVocabulary && userVocabulary.length > 0 ? (
          <div className="space-y-3">
            {userVocabulary.map((item: any) => (
              <Card key={item.id} className="card-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-800">{item.vocabulary.word}</h4>
                        <Badge 
                          className={`${getDifficultyColor(item.vocabulary.difficulty)} text-white text-xs`}
                        >
                          {item.vocabulary.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">{item.vocabulary.meaning}</p>
                      {item.vocabulary.category && (
                        <div className="mt-1">
                          <Badge variant="outline" className="text-xs">
                            {item.vocabulary.category}
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="flex flex-col space-y-1">
                        {statusOptions.slice(1).map((status) => (
                          <Button
                            key={status.id}
                            size="sm"
                            variant={item.status === status.id ? "default" : "outline"}
                            onClick={() => updateStatusMutation.mutate({
                              vocabularyId: item.vocabulary.id,
                              status: status.id
                            })}
                            disabled={updateStatusMutation.isPending}
                            className={`text-xs h-6 px-2 ${
                              item.status === status.id 
                                ? `${status.color} text-white` 
                                : ""
                            }`}
                          >
                            {status.name}
                          </Button>
                        ))}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => playPronunciation(item.vocabulary.word)}
                        className="w-8 h-8 p-0 bg-gray-100 hover:bg-gray-200 rounded-full"
                      >
                        <Play className="w-3 h-3 text-gray-600" />
                      </Button>
                    </div>
                  </div>
                  
                  {item.lastReviewed && (
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      Last reviewed: {new Date(item.lastReviewed).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="card-shadow">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="font-medium text-gray-800 mb-2">No vocabulary words yet</h3>
              <p className="text-sm text-gray-600 mb-4">
                Start building your vocabulary by learning the daily word or adding your own words.
              </p>
              <Button
                onClick={() => setShowAddWord(true)}
                className="gradient-primary text-white"
              >
                Add Your First Word
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Stats */}
      <Card className="card-shadow">
        <CardContent className="p-4">
          <h3 className="font-poppins font-bold text-gray-800 mb-4">Progress Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-500">
                {userVocabulary?.filter((item: any) => item.status === "learned").length || 0}
              </div>
              <div className="text-xs text-gray-500">Learned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-500">
                {userVocabulary?.filter((item: any) => item.status === "review").length || 0}
              </div>
              <div className="text-xs text-gray-500">Review</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-500">
                {userVocabulary?.filter((item: any) => item.status === "difficult").length || 0}
              </div>
              <div className="text-xs text-gray-500">Difficult</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
