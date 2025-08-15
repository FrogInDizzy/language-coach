# API Documentation

Complete reference for all API endpoints in the Language Coach App.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

## Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

Tokens are automatically managed by Supabase Auth on the client side.

## Core Endpoints

### Audio Processing

#### POST `/api/upload-audio`
Upload audio file for transcription and analysis.

**Request**: FormData with audio file
```typescript
const formData = new FormData();
formData.append('audio', audioFile);
```

**Response**:
```json
{
  "audio_url": "https://storage.supabase.co/...",
  "file_id": "uuid"
}
```

#### POST `/api/transcribe`
Transcribe audio using OpenAI Whisper.

**Request**:
```json
{
  "audio_url": "https://storage.supabase.co/audio.wav"
}
```

**Response**:
```json
{
  "transcript": "Hello, this is my practice session...",
  "durationSeconds": 45.2,
  "confidence": 0.95
}
```

#### POST `/api/analyze`
Analyze transcript for grammar mistakes using GPT-4.

**Request**:
```json
{
  "transcript": "I have went to the store yesterday.",
  "context": "casual_conversation"
}
```

**Response**:
```json
{
  "mistakes": [
    {
      "id": "uuid",
      "category": "verb_tense",
      "original_text": "have went",
      "corrected_text": "went",
      "explanation": "Use simple past tense for completed actions",
      "suggestion": "Say 'I went to the store yesterday'"
    }
  ],
  "accuracy_score": 78.5,
  "overall_feedback": "Good conversational flow with one grammar issue"
}
```

### Progress & Gamification

#### GET `/api/progress`
Get user's current progress and statistics.

**Response**:
```json
{
  "currentXP": 1250,
  "level": 5,
  "streak": 7,
  "totalSessions": 23,
  "averageAccuracy": 82.4,
  "improvementAreas": ["articles", "verb_tense"],
  "recentAchievements": [...]
}
```

#### POST `/api/progress`
Update progress after completing a practice session.

**Request**:
```json
{
  "duration_seconds": 120,
  "mistake_count": 3,
  "mistake_categories": ["verb_tense", "articles"],
  "accuracy_score": 85.2
}
```

**Response**:
```json
{
  "xp_earned": 50,
  "level": 5,
  "level_up": false,
  "streak": 8,
  "total_xp": 1300
}
```

### Session History

#### GET `/api/history`
Get user's practice session history with optional filtering.

**Query Parameters**:
- `limit` (number): Number of sessions to return (default: 20)
- `offset` (number): Pagination offset (default: 0)
- `category` (string): Filter by mistake category
- `from_date` (string): Start date filter (ISO 8601)
- `to_date` (string): End date filter (ISO 8601)

**Response**:
```json
{
  "sessions": [
    {
      "id": "uuid",
      "created_at": "2024-01-15T10:30:00Z",
      "duration_seconds": 180,
      "accuracy_score": 87.5,
      "mistake_count": 2,
      "transcript": "Today I want to practice...",
      "mistakes": [...]
    }
  ],
  "total_count": 145,
  "has_more": true
}
```

### Dashboard Data

#### GET `/api/dashboard`
Get summary data for the dashboard view.

**Response**:
```json
{
  "user_progress": {...},
  "recent_sessions": [...],
  "top_mistakes": [
    {
      "category": "articles",
      "count": 12,
      "trend": "improving"
    }
  ],
  "weekly_stats": {
    "sessions_completed": 5,
    "total_practice_time": 1200,
    "average_accuracy": 84.2
  }
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message description",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error context"
  }
}
```

### Common Error Codes

- `UNAUTHORIZED` (401): Invalid or missing authentication
- `FORBIDDEN` (403): Insufficient permissions
- `VALIDATION_ERROR` (400): Invalid request data
- `NOT_FOUND` (404): Resource not found
- `RATE_LIMITED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Audio endpoints**: 10 requests per minute
- **Analysis endpoints**: 20 requests per minute
- **Data endpoints**: 100 requests per minute

## TypeScript Types

All API types are available in the client code:

```typescript
import type { 
  AnalyzeRequest, 
  AnalyzeResponse,
  ProgressUpdateRequest,
  ProgressUpdateResponse 
} from '@/types/api';
```

## Usage Examples

### Complete Practice Session Flow

```typescript
// 1. Upload audio
const formData = new FormData();
formData.append('audio', audioBlob);
const { audio_url } = await fetch('/api/upload-audio', {
  method: 'POST',
  body: formData
}).then(r => r.json());

// 2. Transcribe
const { transcript } = await fetch('/api/transcribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ audio_url })
}).then(r => r.json());

// 3. Analyze
const { mistakes, accuracy_score } = await fetch('/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ transcript })
}).then(r => r.json());

// 4. Update progress
const { xp_earned } = await fetch('/api/progress', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    duration_seconds: 120,
    mistake_count: mistakes.length,
    accuracy_score
  })
}).then(r => r.json());
```