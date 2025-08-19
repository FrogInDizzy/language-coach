# Language Coach App

> AI-powered English speaking practice with real-time feedback and progress tracking.

A modern web application that helps users improve their English speaking skills through daily practice sessions, AI-powered grammar analysis, and gamified progress tracking.

## Features

- **Speech Analysis** - Record yourself and get instant grammar feedback
- **Daily Practice** - Curated prompts for consistent learning
- **Progress Tracking** - XP system, streaks, and detailed analytics
- **Smooth Animations** - Modern, engaging user interface

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env.local
   # Add your Supabase and OpenAI API keys
   ```

3. **Apply database schema**
   ```bash
   # Run supabase/schema.sql in your Supabase project
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to start practicing!

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI**: OpenAI (Whisper, GPT-4)
- **Animations**: Framer Motion

## Project Structure

```
├── app/                 # Next.js pages and API routes
├── components/          # React components
├── lib/                # Utilities and configurations
├── hooks/              # Custom React hooks
├── supabase/           # Database schema and migrations
└── docs/               # Technical documentation
```

## Documentation

- **[Getting Started Guide](docs/getting-started.md)** - Detailed setup instructions
- **[API Documentation](docs/api.md)** - Complete API reference
- **[Architecture Guide](docs/architecture.md)** - System design and patterns
- **[Contributing Guide](docs/contributing.md)** - Development workflow

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit: `git commit -m 'feat: add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request


## License

MIT License - see [LICENSE](LICENSE) file for details.

---

*Built with ❤️ for language learners worldwide.*
