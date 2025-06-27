import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload,
  FileText,
  Youtube,
  Brain,
  CheckCircle,
  AlertCircle,
  Clock,
  Download,
  Eye,
  Trash2,
  Loader2
} from "lucide-react";

const fileTypes = [
  { id: "pdf", name: "PDF Document", icon: FileText, accept: ".pdf", maxSize: "10MB" },
  { id: "text", name: "Text Notes", icon: FileText, accept: ".txt,.doc,.docx", maxSize: "5MB" },
];

export default function UploadCenter() {
  const [uploadType, setUploadType] = useState<"file" | "youtube" | "text">("file");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [textContent, setTextContent] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: userResources, isLoading } = useQuery({
    queryKey: ["/api/resources"],
    enabled: false, // This endpoint would need to be implemented
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) throw new Error("Upload failed");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      toast({
        title: "Upload Successful!",
        description: "Your file is being processed. Results will be available shortly.",
      });
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive",
      });
    },
  });

  const processContentMutation = useMutation({
    mutationFn: async ({ content, title, type }: { content: string; title: string; type: string }) => {
      await apiRequest("POST", "/api/process-content", { content, title, type });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      toast({
        title: "Content Processed!",
        description: "Your content has been processed and saved.",
      });
      setTextContent("");
      setTextTitle("");
      setYoutubeUrl("");
    },
  });

  const generateFlashcardsMutation = useMutation({
    mutationFn: async ({ content, subject }: { content: string; subject: string }) => {
      await apiRequest("POST", "/api/flashcards/generate", { content, subject });
    },
    onSuccess: () => {
      toast({
        title: "Flashcards Generated!",
        description: "New flashcards have been created from your content.",
      });
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", file.name);
    formData.append("fileType", file.type);
    
    uploadMutation.mutate(formData);
  };

  const handleYoutubeSubmit = () => {
    if (!youtubeUrl.trim()) return;
    
    processContentMutation.mutate({
      content: youtubeUrl,
      title: `YouTube: ${youtubeUrl}`,
      type: "youtube",
    });
  };

  const handleTextSubmit = () => {
    if (!textContent.trim() || !textTitle.trim()) return;
    
    processContentMutation.mutate({
      content: textContent,
      title: textTitle,
      type: "text",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "processing":
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case "failed":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "processing":
        return "bg-blue-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  return (
    <div className="p-4 pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-poppins font-bold text-gray-800 mb-2">Upload Resource Center</h1>
        <p className="text-gray-600">Transform your study materials into smart learning tools</p>
      </div>

      {/* Upload Methods */}
      <Tabs value={uploadType} onValueChange={(value) => setUploadType(value as any)} className="mb-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100">
          <TabsTrigger value="file" className="text-xs">
            <FileText className="w-4 h-4 mr-1" />
            File
          </TabsTrigger>
          <TabsTrigger value="youtube" className="text-xs">
            <Youtube className="w-4 h-4 mr-1" />
            YouTube
          </TabsTrigger>
          <TabsTrigger value="text" className="text-xs">
            <Brain className="w-4 h-4 mr-1" />
            Text
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="mt-4">
          <Card className="card-shadow">
            <CardContent className="p-6">
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive ? "border-primary bg-blue-50" : "border-gray-300"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-800 mb-2">Drop your files here</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Support for PDF, DOC, TXT files up to 10MB
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadMutation.isPending}
                  className="gradient-primary text-white"
                >
                  {uploadMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Choose File"
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                {fileTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <div key={type.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Icon className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-800">{type.name}</div>
                        <div className="text-xs text-gray-500">Max {type.maxSize}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="youtube" className="mt-4">
          <Card className="card-shadow">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <Youtube className="w-12 h-12 text-red-500 mx-auto mb-2" />
                <h3 className="font-medium text-gray-800 mb-2">YouTube Video</h3>
                <p className="text-sm text-gray-600">
                  Extract content from educational YouTube videos
                </p>
              </div>
              
              <div className="space-y-4">
                <Input
                  placeholder="Paste YouTube URL here..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                />
                <Button
                  onClick={handleYoutubeSubmit}
                  disabled={!youtubeUrl.trim() || processContentMutation.isPending}
                  className="w-full gradient-primary text-white"
                >
                  {processContentMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Process Video"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="text" className="mt-4">
          <Card className="card-shadow">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <Brain className="w-12 h-12 text-purple-500 mx-auto mb-2" />
                <h3 className="font-medium text-gray-800 mb-2">Type or Paste Notes</h3>
                <p className="text-sm text-gray-600">
                  Convert your text notes into study materials
                </p>
              </div>
              
              <div className="space-y-4">
                <Input
                  placeholder="Enter a title for your notes..."
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Paste or type your notes here..."
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="min-h-[150px]"
                />
                <Button
                  onClick={handleTextSubmit}
                  disabled={!textContent.trim() || !textTitle.trim() || processContentMutation.isPending}
                  className="w-full gradient-primary text-white"
                >
                  {processContentMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Process Notes"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Uploads */}
      <div className="mb-6">
        <h3 className="font-poppins font-bold text-gray-800 mb-4">Recent Uploads</h3>
        
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : userResources && userResources.length > 0 ? (
          <div className="space-y-3">
            {userResources.map((resource: any) => (
              <Card key={resource.id} className="card-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(resource.processingStatus)}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 line-clamp-1">
                          {resource.fileName}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge 
                            className={`${getStatusColor(resource.processingStatus)} text-white text-xs`}
                          >
                            {resource.processingStatus}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(resource.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {resource.processingStatus === "completed" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedResult(resource)}
                            className="p-1 h-auto"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => generateFlashcardsMutation.mutate({
                              content: resource.extractedContent,
                              subject: "General"
                            })}
                            disabled={generateFlashcardsMutation.isPending}
                            className="p-1 h-auto"
                          >
                            <Brain className="w-4 h-4 text-purple-600" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {resource.processingStatus === "processing" && (
                    <Progress value={65} className="h-1 mt-3" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="card-shadow">
            <CardContent className="p-6 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="font-medium text-gray-800 mb-2">No uploads yet</h3>
              <p className="text-sm text-gray-600">
                Upload your first study material to get started
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Processing Results Modal */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg max-h-[80vh] overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-poppins font-bold text-gray-800">Processing Results</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedResult(null)}
                  className="p-1 h-auto"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <Tabs defaultValue="summary" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
                  <TabsTrigger value="questions">Questions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="summary" className="mt-4 max-h-64 overflow-y-auto">
                  <div className="prose prose-sm">
                    {selectedResult.generatedSummary || "No summary available"}
                  </div>
                </TabsContent>
                
                <TabsContent value="flashcards" className="mt-4 max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {selectedResult.generatedFlashcards?.map((card: any, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-sm">{card.front}</div>
                        <div className="text-sm text-gray-600 mt-1">{card.back}</div>
                      </div>
                    )) || "No flashcards generated"}
                  </div>
                </TabsContent>
                
                <TabsContent value="questions" className="mt-4 max-h-64 overflow-y-auto">
                  <div className="space-y-3">
                    {selectedResult.generatedQuestions?.map((q: any, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-sm mb-2">{q.question}</div>
                        <div className="space-y-1">
                          {q.options?.map((option: string, optIndex: number) => (
                            <div key={optIndex} className="text-xs text-gray-600">
                              {String.fromCharCode(65 + optIndex)}. {option}
                            </div>
                          ))}
                        </div>
                      </div>
                    )) || "No questions generated"}
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setSelectedResult(null)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button className="flex-1 gradient-secondary text-white">
                  <Download className="w-4 h-4 mr-2" />
                  Save to Notes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
