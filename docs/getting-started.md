# Getting Started Guide

This guide will help you set up the Language Coach App for development and understand the project structure.

## Prerequisites

- **Node.js** 18.x or later
- **npm** 9.x or later
- **Supabase Account** with project created
- **OpenAI API Key** with access to Whisper and GPT-4

## Environment Setup

### 1. Clone and Install

```bash
git clone https://github.com/your-username/language-coach-app.git
cd language-coach-app
npm install
```

### 2. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env.local
```

Add your credentials to `.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
```

### 3. Database Setup

Apply the schema to your Supabase project:

**Option 1: Supabase CLI (recommended)**
```bash
supabase db reset
```

**Option 2: Manual via Dashboard**
1. Open your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste contents of `supabase/schema.sql`
4. Execute the SQL

### 4. Start Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Verification Steps

1. **Authentication**: Visit `/` and create a test account
2. **Practice**: Navigate to `/practice` and test audio recording
3. **API**: Check browser network tab for successful API calls
4. **Database**: Verify data appears in Supabase dashboard

## Troubleshooting

### Common Issues

**"Invalid JWT token"**
- Check environment variables are correctly set
- Verify Supabase project URL and keys

**Audio recording fails**
- Check microphone permissions in browser
- Ensure HTTPS for production (required for microphone access)

**Database connection errors**
- Verify Supabase project is active
- Check RLS policies are correctly applied

### Debug Mode

Enable debug logging:
```bash
DEBUG=language-coach:* npm run dev
```

## Next Steps

- Review [Architecture Guide](architecture.md) to understand the system
- Check [API Documentation](api.md) for endpoint details
- See [Contributing Guide](contributing.md) for development workflow