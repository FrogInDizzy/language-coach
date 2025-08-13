/* eslint react-hooks/rules-of-hooks: off */
// We disable the rule above because Next.js App Router runs React components as
// Server Components by default.  This page is marked as a Client Component
// explicitly using 'use client'.

'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import Recorder from '@/components/Recorder';
import TranscriptWithHighlights from '@/components/TranscriptWithHighlights';
import MistakeCard from '@/components/MistakeCard';
import Link from 'next/link';

const SAMPLE_PROMPTS = [
  'Describe your favourite travel destination and why you love it.',
  'Tell me about a challenging situation you overcame at work.',
  'Explain how you would teach someone to cook your favorite dish.',
  'Describe what makes a good friend and give an example.',
  'Talk about a book or movie that changed your perspective on life.'
];

export default function PracticePage() {
  const { user } = useAuth();
  const [transcript, setTranscript] = useState('');
  const [mistakes, setMistakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [currentPromptIndex] = useState(0);
  const prompt = SAMPLE_PROMPTS[currentPromptIndex];
  
  const userName = user?.email?.split('@')[0] || 'there';

  const handleRecording = async (file: File) => {
    setError(null);
    setLoading(true);
    setShowResults(false);
    
    try {
      // Upload audio
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch('/api/upload-audio', { method: 'POST', body: formData });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadJson.error || 'Upload error');
      const { audio_url } = uploadJson;
      
      // Transcribe
      const transRes = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio_url })
      });
      const transJson = await transRes.json();
      if (!transRes.ok) throw new Error(transJson.error || 'Transcription error');
      const { transcript: text, durationSeconds } = transJson;
      setTranscript(text);
      
      // Analyse
      const analyseRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text })
      });
      const analyseJson = await analyseRes.json();
      if (!analyseRes.ok) throw new Error(analyseJson.error || 'Analysis error');
      setMistakes(analyseJson.mistakes || []);
      
      // Persist sample
      await fetch('/api/samples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt_id: null,
          audio_url,
          transcript: text,
          duration_seconds: durationSeconds,
          mistakes: analyseJson.mistakes
        })
      });
      
      setShowResults(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetSession = () => {
    setTranscript('');
    setMistakes([]);
    setShowResults(false);
    setError(null);
  };

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto py-8 px-4">
        <div className="card text-center">
          <div className="mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Processing your speech...</h2>
          <p className="text-neutral-600">This may take a few moments</p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-neutral-600">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
            <span>Transcribing</span>
            <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse animation-delay-200"></div>
            <span>Analyzing</span>
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse animation-delay-400"></div>
            <span>Generating feedback</span>
          </div>
        </div>
      </main>
    );
  }

  if (showResults && transcript) {
    return (
      <main className="max-w-4xl mx-auto py-8 px-4 space-y-6">
        {/* Success Header */}
        <div className="text-center">
          <div className="text-4xl mb-2">🎉</div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2 font-display">Great job, {userName}!</h1>
          <p className="text-neutral-600">Here's your personalized feedback</p>
        </div>

        {/* Transcript */}
        <div className="card">
          <h2 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center gap-2">
            <span>📝</span>
            Your Speech
          </h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <TranscriptWithHighlights transcript={transcript} mistakes={mistakes} />
          </div>
        </div>

        {/* Feedback Section */}
        {mistakes.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
              <span>💡</span>
              Focus Areas ({mistakes.length} found)
            </h3>
            
            {/* Show only top 3 mistakes to avoid overwhelm */}
            <div className="space-y-4">
              {mistakes.slice(0, 3).map((mistake, idx) => (
                <MistakeCard key={idx} mistake={mistake} />
              ))}
            </div>
            
            {mistakes.length > 3 && (
              <div className="card bg-accent-100/50 border-accent-200">
                <p className="text-sm text-neutral-600">
                  <strong>+{mistakes.length - 3} more areas</strong> to work on. Focus on these 3 first, then come back for more practice!
                </p>
              </div>
            )}
            
            {/* Success message with encouragement */}
            <div className="card bg-primary-50 border-primary-200">
              <div className="flex gap-3">
                <span className="text-2xl">🌟</span>
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-1">Progress Made!</h4>
                  <p className="text-sm text-neutral-600">
                    You're actively improving your English! Each practice session helps you identify and fix common mistakes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="card bg-primary-50 border-primary-200 text-center">
            <span className="text-4xl mb-2 block">🏆</span>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Perfect Session!</h3>
            <p className="text-neutral-600 mb-4">
              No grammar mistakes detected in your speech. Excellent work!
            </p>
            <div className="text-sm text-neutral-600">
              <strong>+50 XP</strong> • Keep up the great work!
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={resetSession}
            className="btn-accent flex items-center gap-2"
          >
            <span>🎤</span>
            Practice Another Prompt
          </button>
          <Link href="/dashboard" className="btn-secondary flex items-center gap-2 justify-center">
            <span>📊</span>
            View Progress
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2 font-display">
          Daily Speaking Practice 🎤
        </h1>
        <p className="text-neutral-600">
          Practice for 3-5 minutes and get personalized feedback
        </p>
      </div>

      {/* Today's Prompt */}
      <div className="card bg-accent-100/50 border-accent-200 mb-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-accent-500 rounded-full flex items-center justify-center">
            <span className="text-white">💭</span>
          </div>
          <div>
            <h2 className="font-semibold text-neutral-900 mb-2">Today's Prompt</h2>
            <p className="text-neutral-900 leading-relaxed">{prompt}</p>
            <div className="mt-3 text-sm text-neutral-600">
              <strong>Tip:</strong> Speak naturally for 1-3 minutes. Don't worry about perfect grammar - we'll help you improve!
            </div>
          </div>
        </div>
      </div>

      {/* Recorder */}
      <div className="card">
        <Recorder onRecorded={handleRecording} />
      </div>

      {/* Error State */}
      {error && (
        <div className="card bg-red-50 border-red-200 mt-6">
          <div className="flex gap-3">
            <span className="text-red-600 text-xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-red-600 mb-1">Something went wrong</h3>
              <p className="text-sm text-neutral-600 mb-3">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="btn-secondary !py-2 !px-3 text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="mt-8 space-y-4">
        <h3 className="font-semibold text-neutral-900">Tips for great practice:</h3>
        <div className="grid gap-3 text-sm">
          <div className="flex gap-2">
            <span>🎯</span>
            <span className="text-neutral-600">Speak clearly and at a comfortable pace</span>
          </div>
          <div className="flex gap-2">
            <span>⏱️</span>
            <span className="text-neutral-600">Aim for 1-3 minutes of natural speech</span>
          </div>
          <div className="flex gap-2">
            <span>💪</span>
            <span className="text-neutral-600">Don't worry about mistakes - they help you learn!</span>
          </div>
        </div>
      </div>
    </main>
  );
}
