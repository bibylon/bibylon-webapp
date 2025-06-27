# My AI Mentor - Competitive Exam Learning Platform

## Overview

This is a full-stack web application designed to help students prepare for competitive exams in India (NEET, UPSC, SSC, JEE, etc.). The platform provides personalized AI-powered study assistance, gamified learning experiences, and comprehensive tools for exam preparation.

The application follows a modern full-stack architecture using React for the frontend, Express.js for the backend, PostgreSQL for data persistence, and integrates with OpenAI for AI-powered features.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **UI Components**: Radix UI primitives with shadcn/ui styling
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with RESTful API design
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **API Structure**: Route handlers organized by feature domains

### Data Layer
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations
- **Session Storage**: PostgreSQL-backed session store

## Key Components

### Authentication System
- Replit Auth integration with OpenID Connect
- Session-based authentication with PostgreSQL storage
- User profile management with exam-specific customization
- Mandatory session and user tables for Replit Auth compatibility

### AI Integration
- OpenAI GPT-4o integration for personalized mentoring
- Context-aware responses based on user profiles and exam types
- AI-generated study plans, quiz questions, and flashcards
- Chat interface for interactive learning assistance

### Learning Management Features
- **Study Planner**: AI-generated daily/weekly study schedules
- **Quiz Arena**: Dynamic quiz generation with multiple question types
- **Vocabulary Builder**: Spaced repetition system for word learning
- **Notes Vault**: Organized note-taking with categorization
- **Flashcard System**: Interactive flashcard carousel with progress tracking
- **Current Affairs**: Daily news updates relevant to competitive exams

### Gamification System
- Coin-based reward system
- Achievement badges and progress tracking
- Study streaks and milestone celebrations
- Leaderboards and social features

### Analytics Dashboard
- Study time tracking and analysis
- Subject-wise progress monitoring
- Quiz performance analytics
- Weekly/monthly progress reports

## Data Flow

1. **User Authentication**: Users authenticate via Replit Auth, creating sessions stored in PostgreSQL
2. **Profile Setup**: New users complete onboarding to set exam preferences and study goals
3. **AI Study Planning**: System generates personalized study plans based on user profile and preferences
4. **Content Interaction**: Users engage with quizzes, flashcards, and study materials
5. **Progress Tracking**: All interactions are logged for analytics and adaptive learning
6. **AI Assistance**: Chat interface provides contextual help and explanations

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database operations
- **openai**: AI model integration for personalized learning
- **passport**: Authentication middleware
- **express-session**: Session management

### UI Dependencies
- **@radix-ui/***: Accessible UI component primitives
- **@tanstack/react-query**: Server state management
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Type safety and development experience
- **drizzle-kit**: Database schema management

## Deployment Strategy

### Development Environment
- Replit-hosted development with hot reloading
- Vite development server with Express backend
- PostgreSQL database provisioned via Replit

### Production Deployment
- Build process creates optimized static assets and server bundle
- Express server serves both API routes and static frontend
- Database migrations handled via Drizzle Kit
- Environment variables for sensitive configuration

### Configuration
- **Port**: 5000 (configurable via environment)
- **Database**: PostgreSQL via DATABASE_URL environment variable
- **Sessions**: Secure session management with configurable secrets
- **API Keys**: OpenAI integration via environment variables

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- June 26, 2025. Initial setup