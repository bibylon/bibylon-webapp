import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus,
  Search,
  Brain,
  Calendar,
  Tag,
  Edit,
  Trash2,
  StickyNote,
  Archive
} from "lucide-react";
import { format } from "date-fns";

const categories = [
  { id: "all", name: "All Notes", icon: Archive },
  { id: "Current Affairs", name: "Current Affairs", icon: Calendar },
  { id: "Vocab Vault", name: "Vocab Vault", icon: Tag },
  { id: "AI Mentor Notes", name: "AI Mentor", icon: Brain },
  { id: "Mistakes", name: "Mistakes", icon: Edit },
];

const noteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  category: z.string().min(1, "Category is required"),
  tags: z.string().optional(),
});

type NoteFormData = z.infer<typeof noteSchema>;

export default function NotesVault() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const { toast } = useToast();

  const form = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "AI Mentor Notes",
      tags: "",
    },
  });

  const { data: notes, isLoading } = useQuery({
    queryKey: ["/api/notes", { 
      category: selectedCategory === "all" ? undefined : selectedCategory 
    }],
  });

  const createNoteMutation = useMutation({
    mutationFn: async (data: NoteFormData) => {
      const noteData = {
        ...data,
        tags: data.tags ? data.tags.split(",").map(tag => tag.trim()) : [],
        source: "manual",
      };
      await apiRequest("POST", "/api/notes", noteData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({
        title: "Note Created",
        description: "Your note has been saved successfully.",
      });
      setShowCreateDialog(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create note. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ noteId, data }: { noteId: number; data: NoteFormData }) => {
      const noteData = {
        ...data,
        tags: data.tags ? data.tags.split(",").map(tag => tag.trim()) : [],
      };
      await apiRequest("PUT", `/api/notes/${noteId}`, noteData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({
        title: "Note Updated",
        description: "Your note has been updated successfully.",
      });
      setEditingNote(null);
      form.reset();
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: number) => {
      await apiRequest("DELETE", `/api/notes/${noteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({
        title: "Note Deleted",
        description: "Your note has been deleted successfully.",
      });
    },
  });

  const filteredNotes = notes?.filter((note: any) => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  }) || [];

  const handleSubmit = (data: NoteFormData) => {
    if (editingNote) {
      updateNoteMutation.mutate({ noteId: editingNote.id, data });
    } else {
      createNoteMutation.mutate(data);
    }
  };

  const handleEdit = (note: any) => {
    setEditingNote(note);
    form.setValue("title", note.title);
    form.setValue("content", note.content);
    form.setValue("category", note.category);
    form.setValue("tags", note.tags?.join(", ") || "");
    setShowCreateDialog(true);
  };

  const handleCloseDialog = () => {
    setShowCreateDialog(false);
    setEditingNote(null);
    form.reset();
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.icon : StickyNote;
  };

  return (
    <div className="p-4 pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-poppins font-bold text-gray-800">Notes Vault</h1>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-white">
              <Plus className="w-4 h-4 mr-1" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle>{editingNote ? "Edit Note" : "Create New Note"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter note title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          {categories.slice(1).map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write your note content here..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags (comma-separated)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., important, biology, exam" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex space-x-3">
                  <Button type="button" variant="outline" onClick={handleCloseDialog} className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createNoteMutation.isPending || updateNoteMutation.isPending}
                    className="flex-1 gradient-primary text-white"
                  >
                    {editingNote ? "Update" : "Save"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
        <TabsList className="grid w-full grid-cols-5 bg-gray-100 text-xs">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="flex flex-col items-center p-2"
              >
                <Icon className="w-4 h-4 mb-1" />
                <span className="text-xs">{category.name.split(" ")[0]}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Notes List */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
          ))
        ) : filteredNotes.length > 0 ? (
          filteredNotes.map((note: any) => (
            <Card key={note.id} className="card-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {note.category}
                    </Badge>
                    {note.source && (
                      <Badge variant="secondary" className="text-xs">
                        {note.source === "ai_generated" ? "AI" : note.source === "current_affairs" ? "News" : "Manual"}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {format(new Date(note.updatedAt), "MMM d, h:mm a")}
                  </span>
                </div>
                
                <h3 className="font-medium text-gray-800 mb-2 line-clamp-1">
                  {note.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {note.content}
                </p>
                
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {note.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex space-x-3">
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
                      className="p-0 h-auto"
                    >
                      <Calendar className="w-4 h-4 mr-1" />
                      <span className="text-xs">Add to Plan</span>
                    </Button>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(note)}
                      className="p-1 h-auto"
                    >
                      <Edit className="w-4 h-4 text-gray-600" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNoteMutation.mutate(note.id)}
                      disabled={deleteNoteMutation.isPending}
                      className="p-1 h-auto"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="card-shadow">
            <CardContent className="p-6 text-center">
              <StickyNote className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="font-medium text-gray-800 mb-2">
                {searchQuery ? "No matching notes" : "No notes yet"}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {searchQuery 
                  ? `No notes found matching "${searchQuery}"`
                  : selectedCategory === "all" 
                    ? "Start organizing your study materials by creating your first note."
                    : `No notes in the ${categories.find(c => c.id === selectedCategory)?.name} category yet.`
                }
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="gradient-primary text-white"
                >
                  Create Your First Note
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Summary Stats */}
      {filteredNotes.length > 0 && (
        <Card className="card-shadow mt-6">
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-800 mb-3">Notes Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{filteredNotes.length}</div>
                <div className="text-xs text-gray-500">
                  {selectedCategory === "all" ? "Total Notes" : `${categories.find(c => c.id === selectedCategory)?.name} Notes`}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary">
                  {filteredNotes.filter((note: any) => 
                    new Date(note.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  ).length}
                </div>
                <div className="text-xs text-gray-500">This Week</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
