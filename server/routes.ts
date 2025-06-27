import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertUserProfileSchema,
  insertStudyPlanSchema,
  insertCurrentAffairSchema,
  insertVocabularySchema,
  insertQuizQuestionSchema,
  insertNoteSchema,
  insertFlashcardSchema,
} from "@shared/schema";
import { generateAIResponse, generateStudyPlan, generateQuizQuestions, generateFlashcards } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const profile = await storage.getUserProfile(userId);
      res.json({ ...user, profile });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile routes
  app.post('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = insertUserProfileSchema.parse({ ...req.body, userId });
      const profile = await storage.createUserProfile(profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error creating profile:", error);
      res.status(400).json({ message: "Failed to create profile" });
    }
  });

  app.put('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = req.body;
      const profile = await storage.updateUserProfile(userId, updates);
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(400).json({ message: "Failed to update profile" });
    }
  });

  // AI-powered study plan generation
  app.post('/api/study-plan/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getUserProfile(userId);
      if (!profile) {
        return res.status(400).json({ message: "User profile not found" });
      }

      const { date } = req.body;
      const planDate = new Date(date);
      
      // Generate AI study plan
      const aiPlan = await generateStudyPlan(profile, planDate);
      
      const studyPlan = await storage.createStudyPlan({
        userId,
        date: planDate,
        tasks: aiPlan.tasks,
      });
      
      res.json(studyPlan);
    } catch (error) {
      console.error("Error generating study plan:", error);
      res.status(500).json({ message: "Failed to generate study plan" });
    }
  });

  app.get('/api/study-plans', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { startDate, endDate } = req.query;
      
      // Use default date range if not provided
      const start = startDate ? new Date(startDate as string) : new Date();
      const end = endDate ? new Date(endDate as string) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      
      const plans = await storage.getStudyPlans(userId, start, end);
      
      // If no plans exist, return dummy data for demonstration
      if (plans.length === 0) {
        const dummyPlans = [
          {
            id: 1,
            userId,
            date: new Date(),
            subject: "Physics",
            topic: "Thermodynamics",
            duration: 90,
            type: "theory",
            priority: "high",
            completed: false,
            createdAt: new Date()
          },
          {
            id: 2,
            userId,
            date: new Date(Date.now() + 24 * 60 * 60 * 1000),
            subject: "Mathematics",
            topic: "Calculus",
            duration: 120,
            type: "practice",
            priority: "medium",
            completed: false,
            createdAt: new Date()
          }
        ];
        return res.json(dummyPlans);
      }
      
      res.json(plans);
    } catch (error) {
      console.error("Error fetching study plans:", error);
      res.status(500).json({ message: "Failed to fetch study plans" });
    }
  });

  app.put('/api/study-plan/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const plan = await storage.updateStudyPlan(parseInt(id), updates);
      res.json(plan);
    } catch (error) {
      console.error("Error updating study plan:", error);
      res.status(400).json({ message: "Failed to update study plan" });
    }
  });

  // Current affairs routes
  app.get('/api/current-affairs', async (req, res) => {
    try {
      const { limit, category, date } = req.query;
      let affairs;
      
      if (date) {
        affairs = await storage.getCurrentAffairsByDate(new Date(date as string));
      } else {
        affairs = await storage.getCurrentAffairs(
          limit ? parseInt(limit as string) : undefined,
          category as string
        );
      }
      
      // If no affairs exist, return dummy data
      if (!affairs || affairs.length === 0) {
        const dummyAffairs = [
          {
            id: 1,
            title: "India's New Education Policy Update",
            content: "The Ministry of Education announced significant updates to the National Education Policy, focusing on digital literacy and skill development for competitive exam preparation.",
            category: "Education",
            source: "Ministry of Education",
            date: new Date(),
            importance: "high",
            createdAt: new Date()
          },
          {
            id: 2,
            title: "Space Mission Milestone",
            content: "ISRO successfully launches advanced satellite for earth observation, marking a significant achievement in India's space program.",
            category: "Science",
            source: "ISRO",
            date: new Date(),
            importance: "medium",
            createdAt: new Date()
          }
        ];
        return res.json(dummyAffairs);
      }
      
      res.json(affairs);
    } catch (error) {
      console.error("Error fetching current affairs:", error);
      res.status(500).json({ message: "Failed to fetch current affairs" });
    }
  });

  // Vocabulary routes
  app.get('/api/vocabulary/daily', async (req, res) => {
    try {
      const vocab = await storage.getDailyVocabulary();
      
      // Return dummy vocabulary if none exists
      if (!vocab) {
        const dummyVocab = {
          id: 1,
          word: "Perspicacious",
          meaning: "Having a ready insight into and understanding of things",
          pronunciation: "per-spi-KAY-shus",
          example: "The perspicacious student quickly grasped the complex concept.",
          difficulty: "advanced",
          category: "general",
          createdAt: new Date()
        };
        return res.json(dummyVocab);
      }
      
      res.json(vocab);
    } catch (error) {
      console.error("Error fetching daily vocabulary:", error);
      res.status(500).json({ message: "Failed to fetch daily vocabulary" });
    }
  });

  app.get('/api/vocabulary/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { status } = req.query;
      
      const userVocab = await storage.getUserVocabulary(userId, status as string);
      res.json(userVocab);
    } catch (error) {
      console.error("Error fetching user vocabulary:", error);
      res.status(500).json({ message: "Failed to fetch user vocabulary" });
    }
  });

  app.put('/api/vocabulary/:vocabularyId/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { vocabularyId } = req.params;
      const { status } = req.body;
      
      const updated = await storage.updateUserVocabulary(
        userId,
        parseInt(vocabularyId),
        { status, lastReviewed: new Date() }
      );
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating vocabulary status:", error);
      res.status(400).json({ message: "Failed to update vocabulary status" });
    }
  });

  // Quiz routes
  app.get('/api/quiz/questions', async (req, res) => {
    try {
      const { subject, source, sourceId, limit } = req.query;
      let questions;
      
      if (source) {
        questions = await storage.getQuizQuestionsBySource(
          source as string,
          sourceId ? parseInt(sourceId as string) : undefined,
          limit ? parseInt(limit as string) : undefined
        );
      } else {
        questions = await storage.getQuizQuestions(
          subject as string,
          limit ? parseInt(limit as string) : undefined
        );
      }
      
      // Return dummy questions if none exist
      if (!questions || questions.length === 0) {
        const dummyQuestions = [
          {
            id: 1,
            question: "What is the unit of electric current?",
            options: ["Volt", "Ampere", "Ohm", "Watt"],
            correctAnswer: 1,
            explanation: "The unit of electric current is Ampere, named after André-Marie Ampère.",
            subject: "Physics",
            difficulty: "easy",
            source: "textbook",
            createdAt: new Date()
          },
          {
            id: 2,
            question: "Which organ produces insulin in the human body?",
            options: ["Liver", "Kidney", "Pancreas", "Spleen"],
            correctAnswer: 2,
            explanation: "Insulin is produced by the pancreas, specifically by the beta cells in the islets of Langerhans.",
            subject: "Biology",
            difficulty: "medium",
            source: "textbook",
            createdAt: new Date()
          }
        ];
        return res.json(dummyQuestions);
      }
      
      res.json(questions);
    } catch (error) {
      console.error("Error fetching quiz questions:", error);
      res.status(500).json({ message: "Failed to fetch quiz questions" });
    }
  });

  app.post('/api/quiz/attempt', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { questionId, selectedAnswer, timeSpent } = req.body;
      
      // Define dummy questions that match our quiz API
      const dummyQuestions = [
        {
          id: 1,
          question: "What is the unit of electric current?",
          options: ["Volt", "Ampere", "Ohm", "Watt"],
          correctAnswer: 1,
          explanation: "The unit of electric current is Ampere, named after André-Marie Ampère.",
          subject: "Physics",
          difficulty: "easy"
        },
        {
          id: 2,
          question: "Which organ produces insulin in the human body?",
          options: ["Liver", "Kidney", "Pancreas", "Spleen"],
          correctAnswer: 2,
          explanation: "Insulin is produced by the pancreas, specifically by the beta cells in the islets of Langerhans.",
          subject: "Biology",
          difficulty: "medium"
        }
      ];
      
      // Find question in dummy data first, then try database
      let question = dummyQuestions.find(q => q.id === questionId);
      
      if (!question) {
        const questions = await storage.getQuizQuestions();
        question = questions.find(q => q.id === questionId);
      }
      
      if (!question) {
        return res.status(400).json({ message: "Question not found" });
      }
      
      const isCorrect = question.correctAnswer === selectedAnswer;
      
      // Create a mock attempt response since we're using dummy data
      const attempt = {
        id: Date.now(), // Use timestamp as mock ID
        userId,
        questionId,
        selectedAnswer,
        isCorrect,
        timeSpent: timeSpent || 0,
        createdAt: new Date()
      };
      
      // Award coins for correct answers
      if (isCorrect) {
        try {
          const profile = await storage.getUserProfile(userId);
          if (profile) {
            await storage.updateUserCoins(userId, (profile.coins || 0) + 10);
          }
        } catch (error) {
          console.log("Could not update coins (demo mode)");
        }
      }
      
      res.json({ 
        ...attempt, 
        explanation: question.explanation,
        isCorrect 
      });
    } catch (error) {
      console.error("Error recording quiz attempt:", error);
      res.status(400).json({ message: "Failed to record quiz attempt" });
    }
  });

  app.get('/api/quiz/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { timeframe } = req.query;
      
      const stats = await storage.getUserQuizStats(userId, timeframe as string);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching quiz stats:", error);
      res.status(500).json({ message: "Failed to fetch quiz stats" });
    }
  });

  // AI quiz generation from current affairs
  app.post('/api/quiz/generate-from-current-affairs/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { numQuestions = 5 } = req.body;
      
      // Get current affair article
      const affairs = await storage.getCurrentAffairs();
      const affair = affairs.find(a => a.id === parseInt(id));
      if (!affair) {
        return res.status(404).json({ message: "Current affair not found" });
      }
      
      // Generate questions using AI
      const questions = await generateQuizQuestions(
        affair.content,
        affair.category,
        numQuestions
      );
      
      // Save questions to database
      const savedQuestions = [];
      for (const q of questions) {
        const saved = await storage.createQuizQuestion({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          subject: affair.category,
          source: 'current_affairs',
          sourceId: affair.id,
          difficulty: 'Moderate',
        });
        savedQuestions.push(saved);
      }
      
      res.json(savedQuestions);
    } catch (error) {
      console.error("Error generating quiz from current affairs:", error);
      res.status(500).json({ message: "Failed to generate quiz" });
    }
  });

  // Notes routes
  app.get('/api/notes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { category } = req.query;
      
      const notes = await storage.getUserNotes(userId, category as string);
      
      // Return sample notes if none exist
      if (!notes || notes.length === 0) {
        const sampleNotes = [
          {
            id: 1,
            userId,
            title: "Thermodynamics Laws",
            content: "First Law: Energy cannot be created or destroyed, only transferred. Second Law: Entropy of isolated system always increases.",
            category: "Physics",
            tags: ["energy", "entropy", "laws"],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 2,
            userId,
            title: "Photosynthesis Process",
            content: "Light-dependent reactions occur in thylakoids, producing ATP and NADPH. Calvin cycle occurs in stroma, fixing CO2 into glucose.",
            category: "Biology",
            tags: ["photosynthesis", "plants", "energy"],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
        return res.json(sampleNotes);
      }
      
      res.json(notes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  app.post('/api/notes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const noteData = insertNoteSchema.parse({ ...req.body, userId });
      
      const note = await storage.createNote(noteData);
      res.json(note);
    } catch (error) {
      console.error("Error creating note:", error);
      res.status(400).json({ message: "Failed to create note" });
    }
  });

  app.put('/api/notes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const note = await storage.updateNote(parseInt(id), updates);
      res.json(note);
    } catch (error) {
      console.error("Error updating note:", error);
      res.status(400).json({ message: "Failed to update note" });
    }
  });

  app.delete('/api/notes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      const success = await storage.deleteNote(parseInt(id), userId);
      if (success) {
        res.json({ message: "Note deleted successfully" });
      } else {
        res.status(404).json({ message: "Note not found" });
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      res.status(400).json({ message: "Failed to delete note" });
    }
  });

  // Flashcard routes
  app.get('/api/flashcards', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { status } = req.query;
      
      const flashcards = await storage.getUserFlashcards(userId, status as string);
      
      // Return sample flashcards if none exist
      if (!flashcards || flashcards.length === 0) {
        const sampleFlashcards = [
          {
            id: 1,
            userId,
            front: "What is Newton's First Law of Motion?",
            back: "An object at rest stays at rest and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force.",
            subject: "Physics",
            status: "new",
            reviewCount: 0,
            lastReviewed: null,
            createdAt: new Date()
          },
          {
            id: 2,
            userId,
            front: "Define Mitosis",
            back: "A type of cell division that results in two daughter cells each having the same number and kind of chromosomes as the parent nucleus.",
            subject: "Biology",
            status: "learning",
            reviewCount: 2,
            lastReviewed: new Date(Date.now() - 86400000), // 1 day ago
            createdAt: new Date()
          },
          {
            id: 3,
            userId,
            front: "What is the derivative of x²?",
            back: "2x",
            subject: "Mathematics",
            status: "mastered",
            reviewCount: 5,
            lastReviewed: new Date(Date.now() - 172800000), // 2 days ago
            createdAt: new Date()
          }
        ];
        return res.json(sampleFlashcards);
      }
      
      res.json(flashcards);
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      res.status(500).json({ message: "Failed to fetch flashcards" });
    }
  });

  app.post('/api/flashcards', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const flashcardData = insertFlashcardSchema.parse({ ...req.body, userId });
      
      const flashcard = await storage.createFlashcard(flashcardData);
      res.json(flashcard);
    } catch (error) {
      console.error("Error creating flashcard:", error);
      res.status(400).json({ message: "Failed to create flashcard" });
    }
  });

  app.put('/api/flashcards/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const flashcard = await storage.updateFlashcard(parseInt(id), updates);
      res.json(flashcard);
    } catch (error) {
      console.error("Error updating flashcard:", error);
      res.status(400).json({ message: "Failed to update flashcard" });
    }
  });

  // AI-powered flashcard generation
  app.post('/api/flashcards/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { content, subject } = req.body;
      
      const flashcards = await generateFlashcards(content, subject);
      
      // Save flashcards to database
      const savedFlashcards = [];
      for (const fc of flashcards) {
        const saved = await storage.createFlashcard({
          userId,
          front: fc.front,
          back: fc.back,
          subject,
          status: 'review',
        });
        savedFlashcards.push(saved);
      }
      
      res.json(savedFlashcards);
    } catch (error) {
      console.error("Error generating flashcards:", error);
      res.status(500).json({ message: "Failed to generate flashcards" });
    }
  });

  // Progress routes
  app.get('/api/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { subject } = req.query;
      
      const progress = await storage.getUserProgress(userId, subject as string);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  // Gamification routes
  app.get('/api/badges', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const badges = await storage.getUserBadges(userId);
      res.json(badges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });

  app.post('/api/streak/update', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.updateUserStreak(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error updating streak:", error);
      res.status(500).json({ message: "Failed to update streak" });
    }
  });

  // AI Chat routes
  app.post('/api/ai/chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { message, context } = req.body;
      
      // Get user profile for context
      const profile = await storage.getUserProfile(userId);
      
      // Generate AI response
      const response = await generateAIResponse(message, profile, context);
      
      // Save chat history
      await storage.saveAiChatHistory({
        userId,
        message,
        response,
        context,
      });
      
      res.json({ response });
    } catch (error) {
      console.error("Error in AI chat:", error);
      res.status(500).json({ message: "Failed to get AI response" });
    }
  });

  app.get('/api/ai/chat/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { limit } = req.query;
      
      const history = await storage.getUserChatHistory(
        userId,
        limit ? parseInt(limit as string) : undefined
      );
      
      res.json(history);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
