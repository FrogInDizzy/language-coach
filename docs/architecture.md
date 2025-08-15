# Architecture Guide

This document outlines the system architecture, design decisions, and technical patterns used in the Language Coach App.

## System Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │    │   Next.js API   │    │   External      │
│   (React/TS)    │───▶│   Routes        │───▶│   Services      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
│                       │                      │
│ • Authentication      │ • Audio Processing   │ • OpenAI Whisper
│ • Progress Tracking   │ • Grammar Analysis   │ • GPT-4 Analysis
│ • Gamification       │ • Data Validation    │ • Supabase Auth
│ • Animations         │ • Error Handling     │ • PostgreSQL
└─────────────────     └─────────────────     └─────────────────
```

## Technology Stack

### Frontend
- **Next.js 14** - App Router with Server Components
- **React 18** - UI framework with latest features
- **TypeScript** - Type safety across the application
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animations and transitions

### Backend
- **Supabase** - PostgreSQL database, authentication, storage
- **Row Level Security** - Database-level security
- **OpenAI APIs** - Whisper (transcription) and GPT-4 (analysis)

### State Management
- **React Context** - Global state (auth, progress)
- **Custom Hooks** - Reusable logic patterns
- **SWR Pattern** - Data fetching and caching

## Key Design Decisions

### 1. Server-First Architecture
We use Next.js App Router to leverage server components for optimal performance and SEO.

### 2. Type-Safe API Design
Full TypeScript coverage from database to frontend ensures reliability and developer experience.

### 3. Security-First Approach
- Row Level Security (RLS) policies protect user data
- Input validation on all API endpoints
- Secure authentication with JWT tokens

### 4. Performance Optimization
- GPU-accelerated animations
- Code splitting and lazy loading
- Optimized database queries with proper indexing

## Component Architecture

### Design System
- **4px grid system** for consistent spacing
- **Semantic color palette** with accessibility compliance
- **Modular components** with clear separation of concerns

### Component Categories
1. **Layout**: Page structure and navigation
2. **UI**: Reusable interface elements (buttons, inputs, cards)
3. **Feature**: Domain-specific components (practice, progress)
4. **Animation**: Motion and transition components

## Data Flow

### Authentication Flow
1. User signs up/in via Supabase Auth
2. JWT token stored in secure session
3. RLS policies enforce data access control
4. Automatic token refresh handling

### Practice Session Flow
1. User records audio via Web Audio API
2. Audio uploaded to Supabase Storage
3. Transcription via OpenAI Whisper API
4. Grammar analysis via GPT-4
5. Results stored in database
6. Progress updated with XP and streaks

## Database Design

### Core Tables
- `users` - User profiles and preferences
- `audio_samples` - Recording metadata and transcripts
- `grammar_mistakes` - Individual error analysis
- `user_progress` - XP, streaks, and gamification data

### Key Patterns
- **UUID primary keys** for security and scalability
- **JSONB columns** for flexible metadata storage
- **Composite indexes** for common query patterns
- **Timestamp tracking** for all records

## Performance Considerations

### Frontend Optimization
- Bundle splitting by route and component
- Image optimization with Next.js Image component
- Animation performance with GPU acceleration
- Lazy loading for non-critical components

### Backend Optimization
- Database connection pooling
- Query optimization with proper indexes
- Caching strategy for frequently accessed data
- Rate limiting for API endpoints

## Security Model

### Authentication
- Email/password authentication via Supabase
- JWT token-based session management
- Automatic token refresh

### Authorization
- Row Level Security policies at database level
- API route protection with middleware
- Input validation with Zod schemas

### Data Protection
- Encrypted data at rest in Supabase
- HTTPS enforcement in production
- Sensitive data excluded from client bundles

## Monitoring and Observability

### Performance Metrics
- Core Web Vitals tracking
- API response time monitoring
- Database query performance
- User engagement analytics

### Error Handling
- Centralized error logging
- User-friendly error messages
- Graceful degradation patterns
- Retry mechanisms for transient failures

## Deployment Architecture

### Production Environment
- Vercel hosting for optimal Next.js performance
- Global CDN for static assets
- Supabase managed database and auth
- Environment-based configuration

### Development Workflow
- Feature branch development
- Automated testing on pull requests
- Preview deployments for testing
- Continuous deployment to production