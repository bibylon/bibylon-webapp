import {
  users,
  userProfiles,
  studyPlans,
  currentAffairs,
  currentAffairsBookmarks,
  currentAffairsInteractions,
  currentAffairsRecommendations,
  currentAffairsNotes,
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
  type CurrentAffairsBookmark,
  type InsertCurrentAffairsBookmark,
  type CurrentAffairsInteraction,
  type InsertCurrentAffairsInteraction,
  type CurrentAffairsRecommendation,
  type InsertCurrentAffairsRecommendation,
  type CurrentAffairsNote,
  type InsertCurrentAffairsNote,
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
  getCurrentAffairsWithUserData(userId: string, limit?: number, category?: string): Promise<(CurrentAffair & { isBookmarked: boolean; hasNotes: boolean; userInteractions: number; })[]>;
  getCurrentAffairById(id: number): Promise<CurrentAffair | undefined>;
  createCurrentAffair(affair: InsertCurrentAffair): Promise<CurrentAffair>;
  
  // Current affairs bookmarks
  getUserBookmarkedAffairs(userId: string): Promise<(CurrentAffairsBookmark & { currentAffair: CurrentAffair })[]>;
  bookmarkCurrentAffair(userId: string, currentAffairId: number): Promise<CurrentAffairsBookmark>;
  removeBookmark(userId: string, currentAffairId: number): Promise<boolean>;
  isArticleBookmarked(userId: string, currentAffairId: number): Promise<boolean>;
  
  // Current affairs interactions
  recordCurrentAffairsInteraction(interaction: InsertCurrentAffairsInteraction): Promise<CurrentAffairsInteraction>;
  getUserCurrentAffairsInteractions(userId: string, currentAffairId?: number): Promise<CurrentAffairsInteraction[]>;
  
  // Current affairs recommendations
  generatePersonalizedRecommendations(userId: string): Promise<CurrentAffairsRecommendation[]>;
  getUserRecommendations(userId: string, limit?: number): Promise<(CurrentAffairsRecommendation & { currentAffair: CurrentAffair })[]>;
  markRecommendationViewed(userId: string, recommendationId: number): Promise<CurrentAffairsRecommendation>;
  
  // Current affairs notes
  getCurrentAffairsNotes(userId: string, currentAffairId?: number): Promise<CurrentAffairsNote[]>;
  createCurrentAffairsNote(note: InsertCurrentAffairsNote): Promise<CurrentAffairsNote>;
  updateCurrentAffairsNote(id: number, updates: Partial<InsertCurrentAffairsNote>): Promise<CurrentAffairsNote>;
  deleteCurrentAffairsNote(id: number, userId: string): Promise<boolean>;
  
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
    const baseQuery = db.select().from(currentAffairs);
    
    if (category) {
      return await baseQuery
        .where(eq(currentAffairs.category, category))
        .orderBy(desc(currentAffairs.publishedDate))
        .limit(limit);
    }
    
    return await baseQuery
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

  async getCurrentAffairsWithUserData(userId: string, limit = 10, category?: string): Promise<(CurrentAffair & { isBookmarked: boolean; hasNotes: boolean; userInteractions: number; })[]> {
    let query = db
      .select({
        id: currentAffairs.id,
        title: currentAffairs.title,
        content: currentAffairs.content,
        summary: currentAffairs.summary,
        category: currentAffairs.category,
        source: currentAffairs.source,
        publishedDate: currentAffairs.publishedDate,
        tags: currentAffairs.tags,
        imageUrl: currentAffairs.imageUrl,
        importance: currentAffairs.importance,
        examRelevance: currentAffairs.examRelevance,
        readTime: currentAffairs.readTime,
        aiKeyPoints: currentAffairs.aiKeyPoints,
        aiSummary: currentAffairs.aiSummary,
        relatedTopics: currentAffairs.relatedTopics,
        createdAt: currentAffairs.createdAt,
        updatedAt: currentAffairs.updatedAt,
        isBookmarked: sql<boolean>`CASE WHEN ${currentAffairsBookmarks.id} IS NOT NULL THEN true ELSE false END`,
        hasNotes: sql<boolean>`CASE WHEN ${currentAffairsNotes.id} IS NOT NULL THEN true ELSE false END`,
        userInteractions: sql<number>`COALESCE(interaction_counts.count, 0)`,
      })
      .from(currentAffairs)
      .leftJoin(
        currentAffairsBookmarks, 
        and(
          eq(currentAffairsBookmarks.currentAffairId, currentAffairs.id),
          eq(currentAffairsBookmarks.userId, userId)
        )
      )
      .leftJoin(
        currentAffairsNotes,
        and(
          eq(currentAffairsNotes.currentAffairId, currentAffairs.id),
          eq(currentAffairsNotes.userId, userId)
        )
      )
      .leftJoin(
        sql`(SELECT current_affair_id, COUNT(*) as count FROM current_affairs_interactions WHERE user_id = ${userId} GROUP BY current_affair_id) AS interaction_counts`,
        sql`interaction_counts.current_affair_id = ${currentAffairs.id}`
      );

    if (category) {
      return await query
        .where(eq(currentAffairs.category, category))
        .orderBy(desc(currentAffairs.publishedDate))
        .limit(limit);
    }

    return await query
      .orderBy(desc(currentAffairs.publishedDate))
      .limit(limit);
  }

  async getCurrentAffairById(id: number): Promise<CurrentAffair | undefined> {
    const [affair] = await db.select().from(currentAffairs).where(eq(currentAffairs.id, id));
    return affair;
  }

  async createCurrentAffair(affair: InsertCurrentAffair): Promise<CurrentAffair> {
    const [newAffair] = await db.insert(currentAffairs).values(affair).returning();
    return newAffair;
  }

  // Current affairs bookmarks
  async getUserBookmarkedAffairs(userId: string): Promise<(CurrentAffairsBookmark & { currentAffair: CurrentAffair })[]> {
    const results = await db
      .select({
        id: currentAffairsBookmarks.id,
        userId: currentAffairsBookmarks.userId,
        currentAffairId: currentAffairsBookmarks.currentAffairId,
        bookmarkedAt: currentAffairsBookmarks.bookmarkedAt,
        currentAffair: currentAffairs,
      })
      .from(currentAffairsBookmarks)
      .leftJoin(currentAffairs, eq(currentAffairsBookmarks.currentAffairId, currentAffairs.id))
      .where(eq(currentAffairsBookmarks.userId, userId))
      .orderBy(desc(currentAffairsBookmarks.bookmarkedAt));
    
    // Filter out any results where currentAffair is null (shouldn't happen with proper data)
    return results.filter(result => result.currentAffair !== null) as (CurrentAffairsBookmark & { currentAffair: CurrentAffair })[];
  }

  async bookmarkCurrentAffair(userId: string, currentAffairId: number): Promise<CurrentAffairsBookmark> {
    const [bookmark] = await db
      .insert(currentAffairsBookmarks)
      .values({ userId, currentAffairId })
      .returning();
    return bookmark;
  }

  async removeBookmark(userId: string, currentAffairId: number): Promise<boolean> {
    const result = await db
      .delete(currentAffairsBookmarks)
      .where(
        and(
          eq(currentAffairsBookmarks.userId, userId),
          eq(currentAffairsBookmarks.currentAffairId, currentAffairId)
        )
      );
    return (result.rowCount ?? 0) > 0;
  }

  async isArticleBookmarked(userId: string, currentAffairId: number): Promise<boolean> {
    const [bookmark] = await db
      .select()
      .from(currentAffairsBookmarks)
      .where(
        and(
          eq(currentAffairsBookmarks.userId, userId),
          eq(currentAffairsBookmarks.currentAffairId, currentAffairId)
        )
      );
    return !!bookmark;
  }

  // Current affairs interactions
  async recordCurrentAffairsInteraction(interaction: InsertCurrentAffairsInteraction): Promise<CurrentAffairsInteraction> {
    const [newInteraction] = await db
      .insert(currentAffairsInteractions)
      .values(interaction)
      .returning();
    return newInteraction;
  }

  async getUserCurrentAffairsInteractions(userId: string, currentAffairId?: number): Promise<CurrentAffairsInteraction[]> {
    if (currentAffairId) {
      return await db
        .select()
        .from(currentAffairsInteractions)
        .where(and(
          eq(currentAffairsInteractions.userId, userId),
          eq(currentAffairsInteractions.currentAffairId, currentAffairId)
        ))
        .orderBy(desc(currentAffairsInteractions.createdAt));
    }

    return await db
      .select()
      .from(currentAffairsInteractions)
      .where(eq(currentAffairsInteractions.userId, userId))
      .orderBy(desc(currentAffairsInteractions.createdAt));
  }

  // Current affairs recommendations
  async generatePersonalizedRecommendations(userId: string): Promise<CurrentAffairsRecommendation[]> {
    // This is a placeholder for AI-powered recommendation logic
    // In a real implementation, this would analyze user behavior, exam goals, weak subjects, etc.
    const userProfile = await this.getUserProfile(userId);
    
    if (!userProfile) return [];

    // Simple algorithm: recommend articles based on user's target exam and weak subjects
    let relevantArticles = await db
      .select()
      .from(currentAffairs)
      .where(sql`${currentAffairs.examRelevance} && ARRAY[${userProfile.targetExam}]`)
      .limit(10);

    const recommendations: InsertCurrentAffairsRecommendation[] = relevantArticles.map(article => ({
      userId,
      currentAffairId: article.id,
      recommendationType: 'exam_relevant',
      score: '0.8', // Base relevance score (string for numeric type)
      reason: `Relevant for ${userProfile.targetExam} preparation`,
    }));

    if (recommendations.length === 0) return [];

    return await db
      .insert(currentAffairsRecommendations)
      .values(recommendations)
      .returning();
  }

  async getUserRecommendations(userId: string, limit = 10): Promise<(CurrentAffairsRecommendation & { currentAffair: CurrentAffair })[]> {
    const results = await db
      .select({
        id: currentAffairsRecommendations.id,
        userId: currentAffairsRecommendations.userId,
        currentAffairId: currentAffairsRecommendations.currentAffairId,
        recommendationType: currentAffairsRecommendations.recommendationType,
        score: currentAffairsRecommendations.score,
        reason: currentAffairsRecommendations.reason,
        generatedAt: currentAffairsRecommendations.generatedAt,
        viewed: currentAffairsRecommendations.viewed,
        currentAffair: currentAffairs,
      })
      .from(currentAffairsRecommendations)
      .leftJoin(currentAffairs, eq(currentAffairsRecommendations.currentAffairId, currentAffairs.id))
      .where(eq(currentAffairsRecommendations.userId, userId))
      .orderBy(desc(currentAffairsRecommendations.score), desc(currentAffairsRecommendations.generatedAt))
      .limit(limit);
    
    // Filter out any results where currentAffair is null (shouldn't happen with proper data)
    return results.filter(result => result.currentAffair !== null) as (CurrentAffairsRecommendation & { currentAffair: CurrentAffair })[];
  }

  async markRecommendationViewed(userId: string, recommendationId: number): Promise<CurrentAffairsRecommendation> {
    const [updated] = await db
      .update(currentAffairsRecommendations)
      .set({ viewed: true })
      .where(
        and(
          eq(currentAffairsRecommendations.id, recommendationId),
          eq(currentAffairsRecommendations.userId, userId)
        )
      )
      .returning();
    return updated;
  }

  // Current affairs notes
  async getCurrentAffairsNotes(userId: string, currentAffairId?: number): Promise<CurrentAffairsNote[]> {
    if (currentAffairId) {
      return await db
        .select()
        .from(currentAffairsNotes)
        .where(and(
          eq(currentAffairsNotes.userId, userId),
          eq(currentAffairsNotes.currentAffairId, currentAffairId)
        ))
        .orderBy(desc(currentAffairsNotes.updatedAt));
    }

    return await db
      .select()
      .from(currentAffairsNotes)
      .where(eq(currentAffairsNotes.userId, userId))
      .orderBy(desc(currentAffairsNotes.updatedAt));
  }

  async createCurrentAffairsNote(note: InsertCurrentAffairsNote): Promise<CurrentAffairsNote> {
    const [newNote] = await db.insert(currentAffairsNotes).values(note).returning();
    return newNote;
  }

  async updateCurrentAffairsNote(id: number, updates: Partial<InsertCurrentAffairsNote>): Promise<CurrentAffairsNote> {
    const [updatedNote] = await db
      .update(currentAffairsNotes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(currentAffairsNotes.id, id))
      .returning();
    return updatedNote;
  }

  async deleteCurrentAffairsNote(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(currentAffairsNotes)
      .where(
        and(
          eq(currentAffairsNotes.id, id),
          eq(currentAffairsNotes.userId, userId)
        )
      );
    return (result.rowCount ?? 0) > 0;
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
    if (status) {
      const results = await db
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
        .where(and(
          eq(userVocabulary.userId, userId),
          eq(userVocabulary.status, status)
        ));
      
      return results.filter(result => result.vocabulary !== null) as (UserVocabulary & { vocabulary: Vocabulary })[];
    }

    const results = await db
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
    
    return results.filter(result => result.vocabulary !== null) as (UserVocabulary & { vocabulary: Vocabulary })[];
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
    const baseQuery = db.select().from(quizQuestions);
    
    if (subject) {
      return await baseQuery
        .where(eq(quizQuestions.subject, subject))
        .orderBy(sql`RANDOM()`)
        .limit(limit);
    }
    
    return await baseQuery
      .orderBy(sql`RANDOM()`)
      .limit(limit);
  }

  async getQuizQuestionsBySource(source: string, sourceId?: number, limit = 10): Promise<QuizQuestion[]> {
    if (sourceId) {
      return await db.select().from(quizQuestions)
        .where(and(
          eq(quizQuestions.source, source),
          eq(quizQuestions.sourceId, sourceId)
        ))
        .orderBy(sql`RANDOM()`)
        .limit(limit);
    }
    
    return await db.select().from(quizQuestions)
      .where(eq(quizQuestions.source, source))
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
    if (category) {
      return await db.select().from(notes)
        .where(and(
          eq(notes.userId, userId),
          eq(notes.category, category)
        ))
        .orderBy(desc(notes.updatedAt));
    }
    
    return await db.select().from(notes)
      .where(eq(notes.userId, userId))
      .orderBy(desc(notes.updatedAt));
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
    return (result.rowCount ?? 0) > 0;
  }

  // Flashcard operations
  async getUserFlashcards(userId: string, status?: string): Promise<Flashcard[]> {
    if (status) {
      return await db.select().from(flashcards)
        .where(and(
          eq(flashcards.userId, userId),
          eq(flashcards.status, status)
        ))
        .orderBy(flashcards.lastReviewed);
    }
    
    return await db.select().from(flashcards)
      .where(eq(flashcards.userId, userId))
      .orderBy(flashcards.lastReviewed);
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
    if (subject) {
      return await db.select().from(userProgress)
        .where(and(
          eq(userProgress.userId, userId),
          eq(userProgress.subject, subject)
        ))
        .orderBy(userProgress.subject);
    }
    
    return await db.select().from(userProgress)
      .where(eq(userProgress.userId, userId))
      .orderBy(userProgress.subject);
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
    const results = await db
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
    
    // Filter out any results where badge is null (shouldn't happen with proper data)
    return results.filter(result => result.badge !== null) as (UserBadge & { badge: Badge })[];
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
