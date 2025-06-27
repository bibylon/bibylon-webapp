import {
  users,
  userProfiles,
  studyPlans,
  currentAffairs,
  vocabulary,
  userVocabulary,
  quizQuestions,
  quizAttempts,
  notes,
  flashcards,
  userProgress,
  badges,
  userBadges,
  uploadedResources,
  aiChatHistory,
  type User,
  type UpsertUser,
  type UserProfile,
  type InsertUserProfile,
  type StudyPlan,
  type InsertStudyPlan,
  type CurrentAffair,
  type InsertCurrentAffair,
  type Vocabulary,
  type InsertVocabulary,
  type UserVocabulary,
  type InsertUserVocabulary,
  type QuizQuestion,
  type InsertQuizQuestion,
  type QuizAttempt,
  type InsertQuizAttempt,
  type Note,
  type InsertNote,
  type Flashcard,
  type InsertFlashcard,
  type UserProgress,
  type InsertUserProgress,
  type Badge,
  type UserBadge,
  type InsertUserBadge,
  type UploadedResource,
  type InsertUploadedResource,
  type AiChatHistory,
  type InsertAiChatHistory,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, inArray, like, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // User profile operations
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: string, updates: Partial<InsertUserProfile>): Promise<UserProfile>;
  
  // Study plan operations
  getStudyPlan(userId: string, date: Date): Promise<StudyPlan | undefined>;
  getStudyPlans(userId: string, startDate: Date, endDate: Date): Promise<StudyPlan[]>;
  createStudyPlan(plan: InsertStudyPlan): Promise<StudyPlan>;
  updateStudyPlan(id: number, updates: Partial<InsertStudyPlan>): Promise<StudyPlan>;
  
  // Current affairs operations
  getCurrentAffairs(limit?: number, category?: string): Promise<CurrentAffair[]>;
  getCurrentAffairsByDate(date: Date): Promise<CurrentAffair[]>;
  createCurrentAffair(affair: InsertCurrentAffair): Promise<CurrentAffair>;
  
  // Vocabulary operations
  getDailyVocabulary(): Promise<Vocabulary | undefined>;
  getVocabularyByDifficulty(difficulty: string, limit?: number): Promise<Vocabulary[]>;
  getUserVocabulary(userId: string, status?: string): Promise<(UserVocabulary & { vocabulary: Vocabulary })[]>;
  createVocabulary(vocab: InsertVocabulary): Promise<Vocabulary>;
  updateUserVocabulary(userId: string, vocabularyId: number, updates: Partial<InsertUserVocabulary>): Promise<UserVocabulary>;
  
  // Quiz operations
  getQuizQuestions(subject?: string, limit?: number): Promise<QuizQuestion[]>;
  getQuizQuestionsBySource(source: string, sourceId?: number, limit?: number): Promise<QuizQuestion[]>;
  createQuizQuestion(question: InsertQuizQuestion): Promise<QuizQuestion>;
  recordQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt>;
  getUserQuizStats(userId: string, timeframe?: string): Promise<any>;
  
  // Notes operations
  getUserNotes(userId: string, category?: string): Promise<Note[]>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, updates: Partial<InsertNote>): Promise<Note>;
  deleteNote(id: number, userId: string): Promise<boolean>;
  
  // Flashcard operations
  getUserFlashcards(userId: string, status?: string): Promise<Flashcard[]>;
  createFlashcard(flashcard: InsertFlashcard): Promise<Flashcard>;
  updateFlashcard(id: number, updates: Partial<InsertFlashcard>): Promise<Flashcard>;
  
  // Progress operations
  getUserProgress(userId: string, subject?: string): Promise<UserProgress[]>;
  updateUserProgress(userId: string, subject: string, updates: Partial<InsertUserProgress>): Promise<UserProgress>;
  
  // Gamification operations
  getUserBadges(userId: string): Promise<(UserBadge & { badge: Badge })[]>;
  awardBadge(userId: string, badgeId: number): Promise<UserBadge>;
  updateUserCoins(userId: string, coins: number): Promise<UserProfile>;
  updateUserStreak(userId: string): Promise<UserProfile>;
  
  // Resource operations
  createUploadedResource(resource: InsertUploadedResource): Promise<UploadedResource>;
  updateUploadedResource(id: number, updates: Partial<InsertUploadedResource>): Promise<UploadedResource>;
  getUserResources(userId: string): Promise<UploadedResource[]>;
  
  // AI chat operations
  saveAiChatHistory(chat: InsertAiChatHistory): Promise<AiChatHistory>;
  getUserChatHistory(userId: string, limit?: number): Promise<AiChatHistory[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // User profile operations
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile;
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [newProfile] = await db.insert(userProfiles).values(profile).returning();
    return newProfile;
  }

  async updateUserProfile(userId: string, updates: Partial<InsertUserProfile>): Promise<UserProfile> {
    const [updatedProfile] = await db
      .update(userProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return updatedProfile;
  }

  // Study plan operations
  async getStudyPlan(userId: string, date: Date): Promise<StudyPlan | undefined> {
    const [plan] = await db
      .select()
      .from(studyPlans)
      .where(and(eq(studyPlans.userId, userId), eq(studyPlans.date, date)));
    return plan;
  }

  async getStudyPlans(userId: string, startDate: Date, endDate: Date): Promise<StudyPlan[]> {
    return await db
      .select()
      .from(studyPlans)
      .where(
        and(
          eq(studyPlans.userId, userId),
          gte(studyPlans.date, startDate),
          lte(studyPlans.date, endDate)
        )
      )
      .orderBy(studyPlans.date);
  }

  async createStudyPlan(plan: InsertStudyPlan): Promise<StudyPlan> {
    const [newPlan] = await db.insert(studyPlans).values(plan).returning();
    return newPlan;
  }

  async updateStudyPlan(id: number, updates: Partial<InsertStudyPlan>): Promise<StudyPlan> {
    const [updatedPlan] = await db
      .update(studyPlans)
      .set(updates)
      .where(eq(studyPlans.id, id))
      .returning();
    return updatedPlan;
  }

  // Current affairs operations
  async getCurrentAffairs(limit = 10, category?: string): Promise<CurrentAffair[]> {
    let query = db.select().from(currentAffairs);
    
    if (category) {
      query = query.where(eq(currentAffairs.category, category));
    }
    
    return await query
      .orderBy(desc(currentAffairs.publishedDate))
      .limit(limit);
  }

  async getCurrentAffairsByDate(date: Date): Promise<CurrentAffair[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db
      .select()
      .from(currentAffairs)
      .where(
        and(
          gte(currentAffairs.publishedDate, startOfDay),
          lte(currentAffairs.publishedDate, endOfDay)
        )
      )
      .orderBy(desc(currentAffairs.publishedDate));
  }

  async createCurrentAffair(affair: InsertCurrentAffair): Promise<CurrentAffair> {
    const [newAffair] = await db.insert(currentAffairs).values(affair).returning();
    return newAffair;
  }

  // Vocabulary operations
  async getDailyVocabulary(): Promise<Vocabulary | undefined> {
    const [vocab] = await db
      .select()
      .from(vocabulary)
      .orderBy(sql`RANDOM()`)
      .limit(1);
    return vocab;
  }

  async getVocabularyByDifficulty(difficulty: string, limit = 10): Promise<Vocabulary[]> {
    return await db
      .select()
      .from(vocabulary)
      .where(eq(vocabulary.difficulty, difficulty))
      .limit(limit);
  }

  async getUserVocabulary(userId: string, status?: string): Promise<(UserVocabulary & { vocabulary: Vocabulary })[]> {
    let query = db
      .select({
        id: userVocabulary.id,
        userId: userVocabulary.userId,
        vocabularyId: userVocabulary.vocabularyId,
        status: userVocabulary.status,
        lastReviewed: userVocabulary.lastReviewed,
        createdAt: userVocabulary.createdAt,
        vocabulary: vocabulary,
      })
      .from(userVocabulary)
      .leftJoin(vocabulary, eq(userVocabulary.vocabularyId, vocabulary.id))
      .where(eq(userVocabulary.userId, userId));

    if (status) {
      query = query.where(eq(userVocabulary.status, status));
    }

    return await query;
  }

  async createVocabulary(vocab: InsertVocabulary): Promise<Vocabulary> {
    const [newVocab] = await db.insert(vocabulary).values(vocab).returning();
    return newVocab;
  }

  async updateUserVocabulary(userId: string, vocabularyId: number, updates: Partial<InsertUserVocabulary>): Promise<UserVocabulary> {
    const [updated] = await db
      .update(userVocabulary)
      .set(updates)
      .where(and(eq(userVocabulary.userId, userId), eq(userVocabulary.vocabularyId, vocabularyId)))
      .returning();
    return updated;
  }

  // Quiz operations
  async getQuizQuestions(subject?: string, limit = 10): Promise<QuizQuestion[]> {
    let query = db.select().from(quizQuestions);
    
    if (subject) {
      query = query.where(eq(quizQuestions.subject, subject));
    }
    
    return await query
      .orderBy(sql`RANDOM()`)
      .limit(limit);
  }

  async getQuizQuestionsBySource(source: string, sourceId?: number, limit = 10): Promise<QuizQuestion[]> {
    let query = db.select().from(quizQuestions).where(eq(quizQuestions.source, source));
    
    if (sourceId) {
      query = query.where(eq(quizQuestions.sourceId, sourceId));
    }
    
    return await query
      .orderBy(sql`RANDOM()`)
      .limit(limit);
  }

  async createQuizQuestion(question: InsertQuizQuestion): Promise<QuizQuestion> {
    const [newQuestion] = await db.insert(quizQuestions).values(question).returning();
    return newQuestion;
  }

  async recordQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const [newAttempt] = await db.insert(quizAttempts).values(attempt).returning();
    return newAttempt;
  }

  async getUserQuizStats(userId: string, timeframe = "week"): Promise<any> {
    const startDate = new Date();
    if (timeframe === "week") {
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeframe === "month") {
      startDate.setMonth(startDate.getMonth() - 1);
    }

    const stats = await db
      .select({
        totalAttempts: sql<number>`count(*)`,
        correctAttempts: sql<number>`sum(case when ${quizAttempts.isCorrect} then 1 else 0 end)`,
        accuracy: sql<number>`round(avg(case when ${quizAttempts.isCorrect} then 100.0 else 0.0 end), 2)`,
      })
      .from(quizAttempts)
      .where(
        and(
          eq(quizAttempts.userId, userId),
          gte(quizAttempts.attemptedAt, startDate)
        )
      );

    return stats[0];
  }

  // Notes operations
  async getUserNotes(userId: string, category?: string): Promise<Note[]> {
    let query = db.select().from(notes).where(eq(notes.userId, userId));
    
    if (category) {
      query = query.where(eq(notes.category, category));
    }
    
    return await query.orderBy(desc(notes.updatedAt));
  }

  async createNote(note: InsertNote): Promise<Note> {
    const [newNote] = await db.insert(notes).values(note).returning();
    return newNote;
  }

  async updateNote(id: number, updates: Partial<InsertNote>): Promise<Note> {
    const [updatedNote] = await db
      .update(notes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(notes.id, id))
      .returning();
    return updatedNote;
  }

  async deleteNote(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, userId)));
    return result.rowCount > 0;
  }

  // Flashcard operations
  async getUserFlashcards(userId: string, status?: string): Promise<Flashcard[]> {
    let query = db.select().from(flashcards).where(eq(flashcards.userId, userId));
    
    if (status) {
      query = query.where(eq(flashcards.status, status));
    }
    
    return await query.orderBy(flashcards.lastReviewed);
  }

  async createFlashcard(flashcard: InsertFlashcard): Promise<Flashcard> {
    const [newFlashcard] = await db.insert(flashcards).values(flashcard).returning();
    return newFlashcard;
  }

  async updateFlashcard(id: number, updates: Partial<InsertFlashcard>): Promise<Flashcard> {
    const [updatedFlashcard] = await db
      .update(flashcards)
      .set(updates)
      .where(eq(flashcards.id, id))
      .returning();
    return updatedFlashcard;
  }

  // Progress operations
  async getUserProgress(userId: string, subject?: string): Promise<UserProgress[]> {
    let query = db.select().from(userProgress).where(eq(userProgress.userId, userId));
    
    if (subject) {
      query = query.where(eq(userProgress.subject, subject));
    }
    
    return await query.orderBy(userProgress.subject);
  }

  async updateUserProgress(userId: string, subject: string, updates: Partial<InsertUserProgress>): Promise<UserProgress> {
    const [existing] = await db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.subject, subject)));

    if (existing) {
      const [updated] = await db
        .update(userProgress)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(userProgress.id, existing.id))
        .returning();
      return updated;
    } else {
      const [newProgress] = await db
        .insert(userProgress)
        .values({ userId, subject, ...updates })
        .returning();
      return newProgress;
    }
  }

  // Gamification operations
  async getUserBadges(userId: string): Promise<(UserBadge & { badge: Badge })[]> {
    return await db
      .select({
        id: userBadges.id,
        userId: userBadges.userId,
        badgeId: userBadges.badgeId,
        earnedAt: userBadges.earnedAt,
        badge: badges,
      })
      .from(userBadges)
      .leftJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId));
  }

  async awardBadge(userId: string, badgeId: number): Promise<UserBadge> {
    const [newBadge] = await db
      .insert(userBadges)
      .values({ userId, badgeId })
      .returning();
    return newBadge;
  }

  async updateUserCoins(userId: string, coins: number): Promise<UserProfile> {
    const [updated] = await db
      .update(userProfiles)
      .set({ coins, updatedAt: new Date() })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return updated;
  }

  async updateUserStreak(userId: string): Promise<UserProfile> {
    const profile = await this.getUserProfile(userId);
    if (!profile) throw new Error("User profile not found");

    const today = new Date();
    const lastStudy = profile.lastStudyDate;
    let newStreak = profile.streak || 0;

    if (lastStudy) {
      const daysDiff = Math.floor((today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        newStreak += 1;
      } else if (daysDiff > 1) {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    const [updated] = await db
      .update(userProfiles)
      .set({ 
        streak: newStreak, 
        lastStudyDate: today,
        updatedAt: new Date() 
      })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return updated;
  }

  // Resource operations
  async createUploadedResource(resource: InsertUploadedResource): Promise<UploadedResource> {
    const [newResource] = await db.insert(uploadedResources).values(resource).returning();
    return newResource;
  }

  async updateUploadedResource(id: number, updates: Partial<InsertUploadedResource>): Promise<UploadedResource> {
    const [updated] = await db
      .update(uploadedResources)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(uploadedResources.id, id))
      .returning();
    return updated;
  }

  async getUserResources(userId: string): Promise<UploadedResource[]> {
    return await db
      .select()
      .from(uploadedResources)
      .where(eq(uploadedResources.userId, userId))
      .orderBy(desc(uploadedResources.createdAt));
  }

  // AI chat operations
  async saveAiChatHistory(chat: InsertAiChatHistory): Promise<AiChatHistory> {
    const [newChat] = await db.insert(aiChatHistory).values(chat).returning();
    return newChat;
  }

  async getUserChatHistory(userId: string, limit = 50): Promise<AiChatHistory[]> {
    return await db
      .select()
      .from(aiChatHistory)
      .where(eq(aiChatHistory.userId, userId))
      .orderBy(desc(aiChatHistory.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
