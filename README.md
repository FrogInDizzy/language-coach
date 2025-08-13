# Language Coach App

This repository contains the initial scaffolding for a personalised language‑learning web application. The goal of this MVP is to provide a system that accepts a user’s audio response to daily prompts, transcribes it, categorises grammar mistakes and surfaces common error patterns over time. Based on these patterns it generates weekly focus goals to help the learner improve.

The stack outlined here uses **Next.js 14** with the App Router, **Supabase** for authentication, storage and database, and **OpenAI** for transcription and grammar analysis. Feel free to adapt it to your preferred providers if needed.

## Contents

- `supabase/schema.sql` – SQL schema and RLS policies for Supabase.
- `app/` – Next.js app directory with API route handlers.
- `lib/` – Shared helpers (Supabase client, analysis prompts, etc.).
- `components/` – Placeholder React components (to be fleshed out).

## Getting started

1. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

2. **Set up your `.env.local`:** copy `.env.example` to `.env.local` and fill in your Supabase and OpenAI credentials.

3. **Apply the database schema:** Use the SQL in `supabase/schema.sql` to create tables and policies in your Supabase project. You can run it via the Supabase dashboard SQL editor or `supabase db reset`.

4. **Run the development server:**

   ```bash
   npm run dev
   ```

This will start the Next.js development server at `http://localhost:3000`.

## Note

This is only a starting point. Components are intentionally minimal and lack styling. You should build on this structure by adding UI, error handling, state management and deeper analysis logic. The API route handlers demonstrate how to hook up Whisper for transcription and GPT for analysis but leave implementation details such as file uploads and storage for you to complete.
