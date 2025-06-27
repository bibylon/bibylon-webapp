import OpenAI from "openai";
import type { UserProfile } from "@shared/schema";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

export async function generateAIResponse(
  message: string, 
  userProfile?: UserProfile, 
  context?: any
): Promise<string> {
  try {
    const systemPrompt = `You are an AI mentor for competitive exam preparation in India. 
    ${userProfile ? `The student is preparing for ${userProfile.targetExam} exam.` : ''}
    ${userProfile?.strongSubjects ? `Their strong subjects: ${userProfile.strongSubjects.join(', ')}.` : ''}
    ${userProfile?.weakSubjects ? `Their weak subjects: ${userProfile.weakSubjects.join(', ')}.` : ''}
    
    You should be encouraging, knowledgeable, and provide helpful study advice. 
    Keep responses concise but informative. Use emojis when appropriate to make it friendly.
    Focus on Indian competitive exams like NEET, UPSC, SSC, JEE, etc.`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't process your request right now.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "I'm experiencing some technical difficulties. Please try again later.";
  }
}

export async function generateStudyPlan(
  userProfile: UserProfile, 
  date: Date
): Promise<{ tasks: any[] }> {
  try {
    const prompt = `Generate a personalized daily study plan for a ${userProfile.targetExam} aspirant.
    Strong subjects: ${userProfile.strongSubjects?.join(', ') || 'None specified'}
    Weak subjects: ${userProfile.weakSubjects?.join(', ') || 'None specified'}
    Daily study time: ${userProfile.dailyStudyTime || 120} minutes
    
    Create 3-5 study tasks for the day including:
    - Subject/topic name
    - Duration in minutes
    - Task type (reading, practice, revision, quiz)
    - Priority level (high, medium, low)
    
    Focus more time on weak subjects and include current affairs.
    Return as JSON format: {"tasks": [{"subject": "", "topic": "", "duration": 60, "type": "", "priority": ""}]}`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"tasks": []}');
    return result;
  } catch (error) {
    console.error("Error generating study plan:", error);
    // Return a default plan if AI fails
    return {
      tasks: [
        {
          subject: userProfile.weakSubjects?.[0] || "General Knowledge",
          topic: "Daily Revision",
          duration: 60,
          type: "reading",
          priority: "high"
        },
        {
          subject: "Current Affairs",
          topic: "Daily News Analysis",
          duration: 30,
          type: "reading",
          priority: "medium"
        }
      ]
    };
  }
}

export async function generateQuizQuestions(
  content: string, 
  subject: string, 
  numQuestions = 5
): Promise<Array<{
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}>> {
  try {
    const prompt = `Generate ${numQuestions} multiple choice questions based on this ${subject} content:

    "${content}"

    Each question should have:
    - Clear, concise question
    - 4 answer options
    - Correct answer index (0-3)
    - Brief explanation

    Return as JSON: {"questions": [{"question": "", "options": ["", "", "", ""], "correctAnswer": 0, "explanation": ""}]}`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"questions": []}');
    return result.questions || [];
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    return [];
  }
}

export async function generateFlashcards(
  content: string, 
  subject: string
): Promise<Array<{ front: string; back: string }>> {
  try {
    const prompt = `Create flashcards from this ${subject} content:

    "${content}"

    Generate 5-10 flashcards with:
    - Front: Question or key term
    - Back: Answer or explanation

    Focus on key concepts, definitions, and important facts.
    Return as JSON: {"flashcards": [{"front": "", "back": ""}]}`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"flashcards": []}');
    return result.flashcards || [];
  } catch (error) {
    console.error("Error generating flashcards:", error);
    return [];
  }
}

export async function generateCurrentAffairsSummary(
  article: string
): Promise<string> {
  try {
    const prompt = `Summarize this current affairs article for competitive exam preparation:

    "${article}"

    Create a concise summary highlighting:
    - Key facts and figures
    - Important names and dates
    - Exam-relevant points
    - Context and significance

    Keep it under 200 words.`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
      temperature: 0.3,
    });

    return response.choices[0].message.content || "Summary not available.";
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Summary not available due to technical error.";
  }
}
