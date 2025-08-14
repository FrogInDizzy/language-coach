/* eslint react-hooks/rules-of-hooks: off */
// We disable the rule above because Next.js App Router runs React components as
// Server Components by default.  This page is marked as a Client Component
// explicitly using 'use client'.

'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useProgress } from '@/hooks/useProgress';
import PracticePanel from '@/components/PracticePanel';
import TranscriptWithHighlights from '@/components/TranscriptWithHighlights';
import MistakeCard from '@/components/MistakeCard';
import Link from 'next/link';

export default function PracticePage() {
  const { user } = useAuth();
  const { updateProgress } = useProgress();
  const [transcript, setTranscript] = useState('');
  const [mistakes, setMistakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<any>(null);
  const [sessionResult, setSessionResult] = useState<any>(null);
  
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
      
      // Persist sample with prompt info
      await fetch('/api/samples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt_id: currentPrompt?.id || null,
          audio_url,
          transcript: text,
          duration_seconds: durationSeconds,
          mistakes: analyseJson.mistakes
        })
      });
      
      // Update user progress with real-time XP and streak calculation
      try {
        const mistakeCategories = analyseJson.mistakes?.map((m: any) => m.category) || [];
        const progressResult = await updateProgress({
          duration_seconds: durationSeconds,
          mistake_count: analyseJson.mistakes?.length || 0,
          mistake_categories: mistakeCategories
        });
        
        setSessionResult(progressResult);
      } catch (progressError) {
        console.error('Failed to update progress:', progressError);
        // Don't fail the whole session if progress update fails
      }
      
      setShowResults(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePromptChange = (prompt: any) => {
    setCurrentPrompt(prompt);
  };

  const resetSession = () => {
    setTranscript('');
    setMistakes([]);
    setShowResults(false);
    setError(null);
    setSessionResult(null);
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
        {/* Success Header with XP Results */}
        <div className="text-center">
          <div className="text-4xl mb-2">🎉</div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2 font-display">Great job, {userName}!</h1>
          <p className="text-neutral-600">Here's your personalized feedback</p>
          
          {/* XP and Level Progress */}
          {sessionResult && (
            <div className="mt-6 bg-gradient-to-r from-accent-50 to-primary-50 border border-accent-200 rounded-2xl p-6">
              <div className="flex items-center justify-center gap-6 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-600">+{sessionResult.xp_earned}</div>
                  <div className="text-sm text-neutral-600">XP Earned</div>
                </div>
                {sessionResult.level_up && (
                  <div className="text-center">
                    <div className="text-2xl">🌟</div>
                    <div className="text-sm font-semibold text-primary-600">Level Up!</div>
                    <div className="text-xs text-neutral-600">Level {sessionResult.level}</div>
                  </div>
                )}
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">{sessionResult.streak}</div>
                  <div className="text-sm text-neutral-600">Day Streak</div>
                </div>
              </div>
              
              {sessionResult.level_up ? (
                <p className="text-sm text-primary-700 font-medium">
                  🎊 Congratulations! You've reached Level {sessionResult.level}!
                </p>
              ) : (
                <p className="text-sm text-accent-700">
                  Keep practicing to earn more XP and level up!
                </p>
              )}
            </div>
          )}
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
              <strong>+{sessionResult?.xp_earned || 50} XP</strong> • Keep up the great work!
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
    <main className="py-8 px-6">
      <PracticePanel
        onRecording={handleRecording}
        loading={loading}
        error={error}
        currentPrompt={currentPrompt}
        onPromptChange={handlePromptChange}
      />
    </main>
  );
}
