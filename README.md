# Language Coach App

> A sophisticated AI-powered language learning platform with real-time speech analysis, personalized feedback, and gamified progress tracking.

This repository contains a production-ready language learning web application that leverages advanced AI technologies to provide personalized English speaking practice. The platform accepts user audio responses to daily prompts, transcribes speech using OpenAI Whisper, analyzes grammar patterns with GPT-4, and provides detailed feedback with gamified progress tracking.

## 🚀 Live Demo

- **Production URL**: [Coming Soon]
- **Development Server**: `http://localhost:3000`

## 📋 Table of Contents

- [Technology Stack](#technology-stack)
- [Architecture Overview](#architecture-overview)
- [Features](#features)
- [Getting Started](#getting-started)
- [Development Guide](#development-guide)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Authentication & Security](#authentication--security)
- [Performance & Optimization](#performance--optimization)
- [Testing Strategy](#testing-strategy)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)

## 🛠 Technology Stack

### Core Framework
- **Next.js 14** - App Router with Server Components
- **React 18** - Latest features including Suspense and Concurrent Features
- **TypeScript** - Full type safety across the application

### Styling & UI
- **Tailwind CSS 4.x** - Utility-first CSS framework
- **Framer Motion** - Advanced animations and page transitions
- **Custom CSS** - Performance-optimized animations and GPU acceleration

### Backend & Database
- **Supabase** - PostgreSQL database, authentication, and real-time subscriptions
- **Row Level Security (RLS)** - Secure data access patterns
- **Database Functions** - Custom SQL functions for complex queries

### AI & Analysis
- **OpenAI Whisper** - Speech-to-text transcription
- **GPT-4** - Grammar analysis and feedback generation
- **Custom Prompts** - Specialized prompts for language learning context

### State Management & Hooks
- **React Context** - Global state management
- **Custom Hooks** - Reusable logic for progress tracking, authentication
- **SWR Pattern** - Client-side data fetching and caching

### Development Tools
- **ESLint** - Code linting and best practices
- **Prettier** - Code formatting
- **TypeScript** - Static type checking
- **Git Hooks** - Pre-commit validation

## 🏗 Architecture Overview

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

        ┌─────────────────────────────┐
        │      Data Layer             │
        ├─────────────────────────────┤
        │ • User Profiles             │
        │ • Audio Samples & Metadata  │
        │ • Grammar Mistake Analysis  │
        │ • Progress & Achievements   │
        │ • Quest & Gamification     │
        └─────────────────────────────┘
```

### Key Architectural Decisions

1. **Server-First Approach**: Leveraging Next.js App Router for optimal performance
2. **Type-Safe API**: Full TypeScript coverage from database to frontend
3. **Modular Components**: Reusable UI components with consistent design system
4. **Performance Optimization**: GPU-accelerated animations, lazy loading, and caching
5. **Security-First**: RLS policies, input validation, and secure authentication flows

## ✨ Features

### 🎯 Core Learning Features
- **Daily Practice Prompts** - Curated speaking exercises across multiple topics
- **Real-time Speech Analysis** - Instant grammar feedback and mistake categorization
- **Progress Tracking** - Detailed analytics on improvement areas and trends
- **Personalized Feedback** - AI-generated suggestions based on individual patterns

### 🎮 Gamification System
- **XP System** - Points for practice sessions and improvements
- **Streak Tracking** - Daily practice motivation with streak shields
- **Daily Quests** - Micro-challenges for targeted skill improvement
- **Achievement System** - Milestone rewards and progress celebrations
- **Level Progression** - Visual progression system with animations

### 🎨 User Experience
- **Smooth Page Transitions** - Framer Motion powered route animations
- **Responsive Design** - Mobile-first approach with desktop enhancements
- **Accessibility** - WCAG 2.1 AA compliance with screen reader support
- **Dark Mode Support** - [Coming Soon]

### 📊 Analytics & Insights
- **Mistake Pattern Analysis** - Identification of recurring grammar issues
- **Weekly Focus Goals** - Automated goal generation based on patterns
- **Progress Visualization** - Charts and graphs for learning trends
- **Session History** - Detailed view of past practice sessions

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or later
- **npm** 9.x or later (or yarn/pnpm equivalent)
- **Supabase Account** with project created
- **OpenAI API Key** with access to Whisper and GPT-4

### Environment Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/language-coach-app.git
   cd language-coach-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or with specific versions
   npm ci
   ```

3. **Environment Configuration:**
   ```bash
   cp .env.example .env.local
   ```

   Fill in your environment variables:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key

   # Optional: Analytics and Monitoring
   NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id
   ```

4. **Database Setup:**
   
   Apply the schema to your Supabase project:
   ```bash
   # Option 1: Via Supabase CLI (recommended)
   supabase db reset
   
   # Option 2: Manual application via Supabase Dashboard
   # Copy contents of supabase/schema.sql to SQL Editor
   ```

5. **Start Development Server:**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

### Quick Verification

1. **Authentication**: Visit `/` and sign up with a test account
2. **Audio Upload**: Navigate to `/practice` and test audio recording
3. **API Endpoints**: Check browser network tab for successful API calls
4. **Database**: Verify data persistence in Supabase dashboard

## 🔧 Development Guide

### Project Structure

```
language-coach-app/
├── app/                          # Next.js App Router
│   ├── api/                      # API route handlers
│   │   ├── analyze/             # Grammar analysis endpoint
│   │   ├── transcribe/          # Audio transcription
│   │   ├── history/             # Session history
│   │   ├── progress/            # Progress tracking
│   │   └── ...
│   ├── dashboard/               # Dashboard page
│   ├── practice/                # Practice session page
│   ├── history/                 # Session history page
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── components/                   # React components
│   ├── ui/                      # Reusable UI components
│   ├── illustrations/           # SVG illustrations
│   ├── PageTransition.tsx       # Animation components
│   ├── PracticePanel.tsx        # Core practice interface
│   └── ...
├── lib/                         # Utility libraries
│   ├── auth.tsx                 # Authentication context
│   ├── supabase.ts             # Supabase client
│   ├── openai.ts               # OpenAI integration
│   └── ...
├── hooks/                       # Custom React hooks
│   ├── useProgress.ts          # Progress tracking
│   ├── useAuth.ts              # Authentication
│   └── ...
├── supabase/                    # Database schema and migrations
│   ├── schema.sql              # Database schema
│   └── migrations/             # Schema migrations
└── docs/                       # Local documentation (gitignored)
    ├── accessibility-reports/  # A11y compliance reports
    ├── performance-audits/     # Performance analysis
    └── claude-code-logs/       # Development logs
```

### Component Architecture

#### Design System
- **Consistent spacing**: 4px grid system
- **Color palette**: Primary (green), secondary (neutral), accent colors
- **Typography**: System fonts with appropriate hierarchy
- **Interactive states**: Hover, focus, active with smooth transitions

#### Component Categories
1. **Layout Components**: Page structure and navigation
2. **UI Components**: Buttons, inputs, cards, modals
3. **Feature Components**: Practice panel, progress widgets, gamification
4. **Animation Components**: Page transitions, micro-interactions

### State Management Patterns

#### Global State (React Context)
```typescript
// Authentication State
const AuthContext = createContext<{
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}>({});

// Progress State
const ProgressContext = createContext<{
  progress: ProgressData | null;
  updateProgress: (data: SessionData) => Promise<ProgressResult>;
  refreshProgress: () => Promise<void>;
}>({});
```

#### Local State Patterns
- **Form State**: Controlled components with validation
- **UI State**: Loading, error, success states
- **Animation State**: Transition and interaction states

### API Design Patterns

#### Request/Response Types
```typescript
// Grammar Analysis API
interface AnalyzeRequest {
  transcript: string;
  context?: string;
}

interface AnalyzeResponse {
  mistakes: GrammarMistake[];
  suggestions: string[];
  accuracy_score: number;
}

// Progress Update API
interface ProgressUpdateRequest {
  duration_seconds: number;
  mistake_count: number;
  mistake_categories: string[];
}

interface ProgressUpdateResponse {
  xp_earned: number;
  level: number;
  level_up: boolean;
  streak: number;
}
```

#### Error Handling
```typescript
// Consistent error response format
interface APIError {
  error: string;
  code: string;
  details?: any;
}

// Client-side error handling
try {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error: APIError = await response.json();
    throw new Error(error.error);
  }
  
  return await response.json();
} catch (error) {
  console.error('API Error:', error);
  // Handle error appropriately
}
```

### Animation System

#### Performance Optimizations
```css
/* GPU acceleration for smooth animations */
.animated-element {
  transform: translateZ(0);
  will-change: transform, opacity;
  backface-visibility: hidden;
}

/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

#### Animation Components
```typescript
// Page transition wrapper
<PageTransition>
  {children}
</PageTransition>

// Staggered list animations
<StaggerContainer>
  {items.map(item => (
    <StaggerItem key={item.id}>
      <ItemComponent {...item} />
    </StaggerItem>
  ))}
</StaggerContainer>
```

## 📡 API Documentation

### Authentication Endpoints

#### POST `/api/auth/sign-up`
Creates a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "user": { "id": "...", "email": "..." },
  "session": { "access_token": "...", "refresh_token": "..." }
}
```

#### POST `/api/auth/sign-in`
Authenticates existing user.

### Core Learning Endpoints

#### POST `/api/upload-audio`
Uploads audio file for processing.

**Request:** FormData with audio file
**Response:**
```json
{
  "audio_url": "https://storage.supabase.co/...",
  "file_id": "uuid"
}
```

#### POST `/api/transcribe`
Transcribes audio using OpenAI Whisper.

**Request:**
```json
{
  "audio_url": "https://storage.supabase.co/..."
}
```

**Response:**
```json
{
  "transcript": "The transcribed text...",
  "durationSeconds": 45.2,
  "confidence": 0.95
}
```

#### POST `/api/analyze`
Analyzes transcript for grammar mistakes.

**Request:**
```json
{
  "transcript": "I have went to the store yesterday.",
  "context": "casual_conversation"
}
```

**Response:**
```json
{
  "mistakes": [
    {
      "id": "uuid",
      "category": "verb_tense",
      "original_text": "have went",
      "corrected_text": "went",
      "explanation": "Past tense should use 'went' not 'have went'",
      "suggestion": "Use simple past tense for completed actions"
    }
  ],
  "accuracy_score": 78.5,
  "overall_feedback": "Good conversational flow..."
}
```

### Progress & Gamification Endpoints

#### GET `/api/progress`
Retrieves user progress data.

**Response:**
```json
{
  "currentXP": 1250,
  "level": 5,
  "streak": 7,
  "totalSessions": 23,
  "averageAccuracy": 82.4,
  "improvementAreas": ["articles", "verb_tense"],
  "achievements": [...]
}
```

#### POST `/api/progress`
Updates progress after session.

#### GET `/api/daily-quests`
Retrieves today's quests.

#### POST `/api/daily-quests/complete`
Marks quest as completed.

### Analytics Endpoints

#### GET `/api/dashboard`
Dashboard summary data.

#### GET `/api/history`
Session history with filtering.

**Query Parameters:**
- `limit`: Number of sessions (default: 20)
- `offset`: Pagination offset
- `category`: Filter by mistake category
- `from_date`: Start date filter
- `to_date`: End date filter

## 🗄 Database Schema

### Core Tables

#### `users`
Extends Supabase auth.users with profile data.
```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  profile JSONB DEFAULT '{}'::jsonb
);
```

#### `audio_samples`
Stores audio recordings and metadata.
```sql
CREATE TABLE audio_samples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  audio_url TEXT NOT NULL,
  transcript TEXT,
  duration_seconds REAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  prompt_id UUID REFERENCES practice_prompts(id),
  analysis_completed BOOLEAN DEFAULT FALSE
);
```

#### `grammar_mistakes`
Individual mistake records.
```sql
CREATE TABLE grammar_mistakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sample_id UUID REFERENCES audio_samples(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  original_text TEXT NOT NULL,
  corrected_text TEXT NOT NULL,
  explanation TEXT NOT NULL,
  suggestion TEXT,
  position_start INTEGER,
  position_end INTEGER,
  confidence REAL DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `user_progress`
Progress tracking and gamification.
```sql
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  current_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_count INTEGER DEFAULT 0,
  last_practice_date DATE,
  total_sessions INTEGER DEFAULT 0,
  total_practice_time INTEGER DEFAULT 0, -- seconds
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes and Performance

```sql
-- Performance indexes
CREATE INDEX idx_audio_samples_user_created ON audio_samples(user_id, created_at DESC);
CREATE INDEX idx_grammar_mistakes_category ON grammar_mistakes(category);
CREATE INDEX idx_grammar_mistakes_sample ON grammar_mistakes(sample_id);

-- Composite indexes for common queries
CREATE INDEX idx_mistakes_user_category_date ON grammar_mistakes(
  (SELECT user_id FROM audio_samples WHERE id = sample_id),
  category,
  created_at DESC
);
```

### Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE audio_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE grammar_mistakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can only see their own audio samples" ON audio_samples
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own mistakes" ON grammar_mistakes
  FOR ALL USING (
    auth.uid() = (SELECT user_id FROM audio_samples WHERE id = sample_id)
  );

CREATE POLICY "Users can only see their own progress" ON user_progress
  FOR ALL USING (auth.uid() = user_id);
```

## 🔐 Authentication & Security

### Supabase Authentication Flow

1. **Sign Up**: Email verification with secure password requirements
2. **Sign In**: JWT token-based authentication
3. **Session Management**: Automatic token refresh
4. **Protected Routes**: Middleware-based route protection

### Security Measures

#### Input Validation
```typescript
// Zod schemas for type-safe validation
const transcribeSchema = z.object({
  audio_url: z.string().url(),
  language: z.string().optional().default('en')
});

// API route validation
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = transcribeSchema.parse(body);
    // Process validated data...
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid input' },
      { status: 400 }
    );
  }
}
```

#### Rate Limiting
```typescript
// Simple rate limiting implementation
const rateLimiter = new Map();

function checkRateLimit(userId: string, limit: number = 10) {
  const now = Date.now();
  const windowStart = now - 60000; // 1 minute window
  
  const requests = rateLimiter.get(userId) || [];
  const validRequests = requests.filter(time => time > windowStart);
  
  if (validRequests.length >= limit) {
    throw new Error('Rate limit exceeded');
  }
  
  validRequests.push(now);
  rateLimiter.set(userId, validRequests);
}
```

#### CORS Configuration
```typescript
// Next.js API routes CORS headers
export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
        ? 'https://yourdomain.com' 
        : '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
```

## ⚡ Performance & Optimization

### Frontend Optimizations

#### Code Splitting
```typescript
// Dynamic imports for route-based code splitting
const DashboardPage = dynamic(() => import('./dashboard/page'), {
  loading: () => <LoadingSkeleton />,
});

// Component-level splitting
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  ssr: false,
  loading: () => <ComponentSkeleton />,
});
```

#### Image Optimization
```typescript
// Next.js Image component with optimization
import Image from 'next/image';

<Image
  src="/illustration.svg"
  alt="Practice illustration"
  width={400}
  height={300}
  priority={false}
  placeholder="blur"
  blurDataURL="data:image/svg+xml;base64,..."
/>
```

#### Bundle Analysis
```bash
# Analyze bundle size
npm run build
npm run analyze

# Performance audit
npm run lighthouse
```

### Backend Optimizations

#### Database Query Optimization
```sql
-- Efficient pagination with cursor-based pagination
SELECT * FROM audio_samples 
WHERE user_id = $1 
  AND created_at < $2 
ORDER BY created_at DESC 
LIMIT $3;

-- Aggregated queries for dashboard
SELECT 
  category,
  COUNT(*) as mistake_count,
  AVG(confidence) as avg_confidence
FROM grammar_mistakes gm
JOIN audio_samples as ON gm.sample_id = as.id
WHERE as.user_id = $1 
  AND gm.created_at > NOW() - INTERVAL '30 days'
GROUP BY category
ORDER BY mistake_count DESC;
```

#### Caching Strategy
```typescript
// SWR for client-side caching
import useSWR from 'swr';

function useUserProgress() {
  const { data, error, mutate } = useSWR(
    '/api/progress',
    fetcher,
    {
      refreshInterval: 60000, // 1 minute
      revalidateOnFocus: false,
    }
  );
  
  return {
    progress: data,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  };
}
```

### Monitoring & Analytics

#### Performance Metrics
```typescript
// Custom performance monitoring
export function trackPageView(page: string) {
  if (typeof window !== 'undefined') {
    // Track Core Web Vitals
    getCLS(console.log);
    getFID(console.log);
    getFCP(console.log);
    getLCP(console.log);
    getTTFB(console.log);
  }
}

// Error monitoring
export function trackError(error: Error, context?: string) {
  console.error('Application Error:', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
}
```

## 🧪 Testing Strategy

### Testing Stack
- **Jest** - Unit testing framework
- **React Testing Library** - Component testing
- **Playwright** - End-to-end testing
- **MSW** - API mocking

### Test Structure
```
tests/
├── __mocks__/              # Mock implementations
├── unit/                   # Unit tests
│   ├── components/         # Component tests
│   ├── hooks/             # Custom hook tests
│   └── utils/             # Utility function tests
├── integration/           # Integration tests
│   ├── api/              # API route tests
│   └── flows/            # User flow tests
└── e2e/                  # End-to-end tests
    ├── auth.spec.ts      # Authentication flows
    ├── practice.spec.ts  # Practice session flows
    └── progress.spec.ts  # Progress tracking flows
```

### Example Tests

#### Component Testing
```typescript
// components/PracticePanel.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { PracticePanel } from './PracticePanel';

describe('PracticePanel', () => {
  it('displays record button when not recording', () => {
    render(<PracticePanel onRecording={jest.fn()} loading={false} />);
    
    expect(screen.getByText('Start 3-min session')).toBeInTheDocument();
  });

  it('handles recording start', async () => {
    const mockOnRecording = jest.fn();
    render(<PracticePanel onRecording={mockOnRecording} loading={false} />);
    
    fireEvent.click(screen.getByText('Start 3-min session'));
    
    // Assert recording state changes
  });
});
```

#### API Testing
```typescript
// api/analyze.test.ts
import { POST } from '@/app/api/analyze/route';
import { NextRequest } from 'next/server';

describe('/api/analyze', () => {
  it('analyzes transcript correctly', async () => {
    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        transcript: 'I have went to the store.',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.mistakes).toHaveLength(1);
    expect(data.mistakes[0].category).toBe('verb_tense');
  });
});
```

### Running Tests
```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e

# All tests
npm run test:all
```

## 🚀 Deployment

### Vercel Deployment (Recommended)

#### Prerequisites
- Vercel account connected to GitHub
- Environment variables configured in Vercel dashboard

#### Deployment Steps
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

#### Environment Variables
Configure in Vercel dashboard:
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```

### Self-Hosted Deployment

#### Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
# Build and run
docker build -t language-coach-app .
docker run -p 3000:3000 language-coach-app
```

#### Production Considerations
- **SSL Certificate**: Use Let's Encrypt or CloudFlare
- **CDN**: Configure for static assets
- **Database**: Use connection pooling (PgBouncer)
- **Monitoring**: Set up logging and error tracking
- **Backup**: Automated database backups

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and add tests
4. Run linting and tests: `npm run test && npm run lint`
5. Commit with conventional commits: `feat: add amazing feature`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open Pull Request

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Extended from Next.js and Prettier configs
- **Prettier**: Consistent code formatting
- **Conventional Commits**: Standardized commit messages

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console.log statements
```

## 🐛 Troubleshooting

### Common Issues

#### Authentication Problems
```bash
# Issue: "Invalid JWT token"
# Solution: Check environment variables and token expiry

# Issue: RLS policy blocks access
# Solution: Verify user_id matches auth.uid() in policies
```

#### Audio Upload Issues
```bash
# Issue: Large file upload fails
# Solution: Check Supabase storage limits and file size validation

# Issue: CORS errors on file upload
# Solution: Configure Supabase storage CORS settings
```

#### Performance Issues
```bash
# Issue: Slow page loads
# Solution: Check bundle size and implement code splitting

# Issue: Animation lag
# Solution: Verify GPU acceleration and reduce animation complexity
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=language-coach:* npm run dev

# Database query logging
SUPABASE_DEBUG=true npm run dev
```

### Support Resources
- **GitHub Issues**: Bug reports and feature requests
- **Documentation**: Comprehensive guides and API reference
- **Community**: Discord server for discussions

---

## 📞 Contact & Support

- **GitHub**: [Repository Issues](https://github.com/your-username/language-coach-app/issues)
- **Email**: support@languagecoach.app
- **Documentation**: [Full Documentation](./docs/)

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Built with ❤️ and cutting-edge AI technology for language learners worldwide.*