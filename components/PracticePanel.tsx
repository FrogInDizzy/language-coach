'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth';

// Types
interface Prompt {
  id: string;
  text: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tips: string[];
}

interface PracticePanelProps {
  onRecording: (file: File) => void;
  loading: boolean;
  error: string | null;
  currentPrompt?: Prompt;
  onPromptChange?: (prompt: Prompt) => void;
}

type RecordingState = 'idle' | 'recording' | 'processing' | 'completed';

// Enhanced prompts with categories and tips
const PRACTICE_PROMPTS: Prompt[] = [
  {
    id: 'travel-1',
    text: 'Describe your favorite travel destination and why you love it.',
    category: 'Travel & Culture',
    difficulty: 'beginner',
    tips: [
      'Use descriptive adjectives (beautiful, exciting, peaceful)',
      'Practice past tense for experiences you had',
      'Include specific details about places, food, or activities'
    ]
  },
  {
    id: 'work-1',
    text: 'Tell me about a challenging situation you overcame at work.',
    category: 'Professional',
    difficulty: 'intermediate',
    tips: [
      'Use problem-solving vocabulary (challenge, solution, outcome)',
      'Practice narrative structure: situation → action → result',
      'Use past tense and present perfect appropriately'
    ]
  },
  {
    id: 'cooking-1',
    text: 'Explain how you would teach someone to cook your favorite dish.',
    category: 'Lifestyle',
    difficulty: 'beginner',
    tips: [
      'Use sequence words (first, then, next, finally)',
      'Practice imperative verbs (add, mix, cook, serve)',
      'Include measurements and cooking terms'
    ]
  },
  {
    id: 'friendship-1',
    text: 'Describe what makes a good friend and give an example.',
    category: 'Personal',
    difficulty: 'intermediate',
    tips: [
      'Use personality adjectives (loyal, supportive, trustworthy)',
      'Practice giving examples with "for instance" or "for example"',
      'Use present tense for general statements'
    ]
  },
  {
    id: 'books-1',
    text: 'Talk about a book or movie that changed your perspective on life.',
    category: 'Culture & Media',
    difficulty: 'advanced',
    tips: [
      'Use abstract concepts (perspective, influence, impact)',
      'Practice expressing opinions and reasoning',
      'Use past tense for the story, present for your current views'
    ]
  },
  {
    id: 'technology-1',
    text: 'Explain how technology has changed the way people communicate.',
    category: 'Technology',
    difficulty: 'advanced',
    tips: [
      'Compare past and present (used to vs. now)',
      'Use technology vocabulary (social media, instant messaging)',
      'Practice cause and effect language'
    ]
  },
  {
    id: 'hobbies-1',
    text: 'Describe a hobby you enjoy and why others should try it.',
    category: 'Lifestyle',
    difficulty: 'beginner',
    tips: [
      'Use action verbs related to your hobby',
      'Practice recommendation language (should, could, might)',
      'Express personal enjoyment and benefits'
    ]
  },
  {
    id: 'environment-1',
    text: 'Discuss ways people can help protect the environment.',
    category: 'Environment',
    difficulty: 'intermediate',
    tips: [
      'Use modal verbs (can, should, must, could)',
      'Practice environmental vocabulary (recycle, sustainable, carbon footprint)',
      'Give practical examples and suggestions'
    ]
  }
];

// Practice tips by category
const CONTEXTUAL_TIPS = {
  recording: [
    'Speak at a natural pace - not too fast or slow',
    'Find a quiet environment to minimize background noise',
    'Hold your device about 6 inches from your mouth',
    'Take a deep breath before you start speaking'
  ],
  speaking: [
    'Don\'t worry about making mistakes - they help you learn',
    'If you get stuck, pause and rephrase your thought',
    'Use gestures if they help you express yourself',
    'Think in English rather than translating from your native language'
  ],
  grammar: [
    'Focus on one grammar point at a time',
    'Pay attention to verb tenses and subject-verb agreement',
    'Use connecting words (and, but, because, however)',
    'Practice with simple sentences before attempting complex ones'
  ],
  vocabulary: [
    'Use words you know well rather than trying difficult new ones',
    'If you can\'t remember a word, describe it instead',
    'Practice using synonyms to avoid repetition',
    'Learn phrases and collocations, not just individual words'
  ]
};

// Daily prompt rotation logic
const getDailyPrompt = (): Prompt => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const promptIndex = dayOfYear % PRACTICE_PROMPTS.length;
  return PRACTICE_PROMPTS[promptIndex];
};

export default function PracticePanel({ 
  onRecording, 
  loading, 
  error, 
  currentPrompt,
  onPromptChange 
}: PracticePanelProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt>(currentPrompt || getDailyPrompt());
  const [recordingTime, setRecordingTime] = useState(0);
  const [showPromptSelector, setShowPromptSelector] = useState(false);
  const [micPermission, setMicPermission] = useState<'checking' | 'granted' | 'denied' | 'unknown'>('unknown');

  const userName = user?.email?.split('@')[0] || 'there';

  // Update recording state based on loading prop
  useEffect(() => {
    if (loading) {
      setRecordingState('processing');
    } else {
      setRecordingState('idle');
    }
  }, [loading]);

  // Handle prompt change
  useEffect(() => {
    if (onPromptChange) {
      onPromptChange(selectedPrompt);
    }
  }, [selectedPrompt, onPromptChange]);

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Keyboard shortcut for spacebar to start/stop recording
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Only trigger if not typing in an input field
    if (event.code === 'Space' && 
        !['INPUT', 'TEXTAREA', 'BUTTON'].includes((event.target as HTMLElement)?.tagName)) {
      event.preventDefault();
      if (recordingState === 'idle' && micPermission === 'granted') {
        startRecording();
      } else if (recordingState === 'recording') {
        stopRecording();
      }
    }
  }, [recordingState, micPermission]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Simulate recording timer (in real app, this would track actual recording)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (recordingState === 'recording') {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [recordingState]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setRecordingState('processing');
      onRecording(file);
    }
  };

  const handlePromptSelect = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setShowPromptSelector(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-amber-100 text-amber-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  const getStateIcon = () => {
    switch (recordingState) {
      case 'recording': return '🔴';
      case 'processing': return '⏳';
      case 'completed': return '✅';
      default: return '🎤';
    }
  };

  const getStateMessage = () => {
    switch (recordingState) {
      case 'recording': return 'Recording in progress...';
      case 'processing': return 'Processing your speech...';
      case 'completed': return 'Recording completed!';
      default: return 'Ready to start recording';
    }
  };

  // Check microphone permission
  useEffect(() => {
    const checkMicPermission = async () => {
      setMicPermission('checking');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicPermission('granted');
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        setMicPermission('denied');
      }
    };
    checkMicPermission();
  }, []);

  // Start recording function
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], 'recording.webm', { type: 'audio/webm' });
        setRecordingState('processing');
        onRecording(file);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecordingState('recording');
    } catch (error) {
      console.error('Error starting recording:', error);
      setMicPermission('denied');
    }
  };

  // Stop recording function
  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-8" role="main" aria-label="Daily Speaking Practice">
      {/* Skip Link */}
      <a href="#recording-cards" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-accent-600 text-white px-4 py-2 rounded-lg z-50">
        Skip to recording options
      </a>
      
      {/* Header */}
      <header className="text-center mb-8" role="banner">
        <h1 className="text-3xl font-bold text-neutral-900 mb-3">
          Daily Speaking Practice
        </h1>
        <p className="text-lg text-neutral-600">
          Hello {userName}! Choose how you'd like to practice today
        </p>
        
        {/* Session Info Bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
          <div className={`status-indicator ${
            micPermission === 'granted' ? 'status-success' : 
            micPermission === 'checking' ? 'status-warning' : 'status-error'
          }`}>
            <span className="text-sm font-medium" aria-hidden="true">
              {micPermission === 'granted' ? '✓' : 
               micPermission === 'checking' ? '⏳' : '⚠️'}
            </span>
            <span className="text-sm font-medium">
              {micPermission === 'granted' ? 'Microphone Ready' : 
               micPermission === 'checking' ? 'Checking Microphone...' : 'Microphone Access Needed'}
            </span>
          </div>
          <div className="status-indicator status-info">
            <span className="text-sm font-medium" aria-hidden="true">⏱️</span>
            <span className="text-sm font-medium">3-5 min session</span>
          </div>
          <div className="status-indicator status-neutral">
            <span className="text-sm font-medium" aria-hidden="true">🌐</span>
            <span className="text-sm font-medium">English (US)</span>
          </div>
        </div>
      </header>

      {/* Two-Card Layout */}
      <section id="recording-cards" className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" aria-labelledby="recording-options-heading">
        <h2 id="recording-options-heading" className="sr-only">Recording Options</h2>
        
        {/* Card 1: Record */}
        <article className="bg-white rounded-2xl border border-neutral-200 p-8 text-center shadow-lg hover:shadow-xl transition-shadow" aria-labelledby="record-card-heading" role="region">
          <h3 id="record-card-heading" className="sr-only">Record Audio</h3>
          <div className="mb-6">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl mb-4 transition-all duration-200 ${
              recordingState === 'recording' ? 'bg-red-100 animate-pulse' :
              recordingState === 'processing' ? 'bg-amber-100' :
              micPermission !== 'granted' ? 'bg-neutral-200' :
              'bg-accent-100 hover:bg-accent-200'
            }`}>
              {recordingState === 'recording' ? '🔴' :
               recordingState === 'processing' ? '⏳' : '🎤'}
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              {recordingState === 'recording' ? 'Recording...' :
               recordingState === 'processing' ? 'Processing...' : 'Start Recording'}
            </h3>
            <p className="text-neutral-600">
              {recordingState === 'recording' ? `Recording time: ${formatTime(recordingTime)}` :
               recordingState === 'processing' ? 'Transcribing with Whisper AI' :
               micPermission !== 'granted' ? 'Enable microphone to start' :
               'Record yourself speaking or press spacebar'}
            </p>
          </div>
          
          <div className="space-y-3">
            {recordingState === 'idle' && micPermission === 'granted' && (
              <button
                onClick={startRecording}
                className="w-full bg-accent-500 hover:bg-accent-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                aria-label="Start recording your speech"
                type="button"
              >
                <span className="flex items-center justify-center gap-2">
                  <span aria-hidden="true">🎤</span>
                  Start Recording
                </span>
              </button>
            )}
            {recordingState === 'recording' && (
              <button
                onClick={stopRecording}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                aria-label="Stop recording your speech"
                type="button"
              >
                <span className="flex items-center justify-center gap-2">
                  <span aria-hidden="true">⏹️</span>
                  Stop Recording
                </span>
              </button>
            )}
            {micPermission !== 'granted' && recordingState === 'idle' && (
              <button
                onClick={startRecording}
                className="w-full bg-neutral-300 text-neutral-600 font-semibold py-3 px-6 rounded-xl cursor-not-allowed"
                disabled
                aria-label={micPermission === 'checking' ? 'Checking microphone permissions' : 'Grant microphone access to enable recording'}
                type="button"
              >
                <span className="flex items-center justify-center gap-2">
                  <span aria-hidden="true">
                    {micPermission === 'checking' ? '⏳' : '🎤'}
                  </span>
                  {micPermission === 'checking' ? 'Checking Microphone...' : 'Grant Microphone Access'}
                </span>
              </button>
            )}
            <p className="text-sm text-neutral-600 font-medium">
              Press spacebar to quickly start recording
            </p>
          </div>
        </article>

        {/* Card 2: Upload */}
        <article className="bg-white rounded-2xl border border-neutral-200 p-8 text-center shadow-lg hover:shadow-xl transition-shadow" aria-labelledby="upload-card-heading" role="region">
          <h3 id="upload-card-heading" className="sr-only">Upload Audio File</h3>
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-4xl mb-4 hover:bg-blue-200 transition-colors">
              📁
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">Upload Audio</h3>
            <p className="text-neutral-600">
              Already have an audio file? Upload it for instant analysis
            </p>
          </div>
          
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="hidden"
              aria-label="Choose audio file for upload"
              tabIndex={-1}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={recordingState === 'processing'}
              className={`w-full font-semibold py-3 px-6 rounded-xl transition-colors ${
                recordingState === 'processing' 
                  ? 'bg-neutral-300 text-neutral-600 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
              aria-label="Choose an audio file to upload for analysis"
              type="button"
            >
              <span className="flex items-center justify-center gap-2">
                <span aria-hidden="true">📁</span>
                Choose Audio File
              </span>
            </button>
            <p className="text-sm text-neutral-600 font-medium">
              Supports MP3, WAV, M4A, and other audio formats
            </p>
          </div>
        </article>
      </section>

      {/* Processing State */}
      {recordingState === 'processing' && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div>
              <h4 className="font-semibold text-amber-900">Processing your audio...</h4>
              <p className="text-sm text-amber-700">Using Whisper AI to transcribe and analyze your speech</p>
            </div>
          </div>
          <div className="w-full bg-amber-200 rounded-full h-2 mt-4">
            <div className="bg-amber-500 h-2 rounded-full animate-pulse-progress"></div>
          </div>
        </div>
      )}

      {/* Current Prompt */}
      <section className="bg-white rounded-xl border border-neutral-200 p-6 mb-8" aria-labelledby="current-prompt-heading">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center" aria-hidden="true">
              <span className="text-lg">💭</span>
            </div>
            <div>
              <h3 id="current-prompt-heading" className="font-semibold text-neutral-900">Today's Practice Prompt</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`badge ${getDifficultyColor(selectedPrompt.difficulty)}`} role="status" aria-label={`Difficulty level: ${selectedPrompt.difficulty}`}>
                  {selectedPrompt.difficulty}
                </span>
                <span className="badge-neutral" role="status" aria-label={`Category: ${selectedPrompt.category}`}>{selectedPrompt.category}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowPromptSelector(!showPromptSelector)}
            className="btn-secondary !py-2 !px-3"
            disabled={recordingState === 'processing'}
            aria-label={showPromptSelector ? 'Hide prompt selector' : 'Show prompt selector to change practice prompt'}
            aria-expanded={showPromptSelector}
            type="button"
          >
            <span className="flex items-center gap-2">
              <span aria-hidden="true">{showPromptSelector ? '▲' : '▼'}</span>
              Change
            </span>
          </button>
        </div>
        
        <p className="text-neutral-900 text-lg leading-relaxed mb-4" role="article" aria-label="Practice prompt">{selectedPrompt.text}</p>
        
        {/* Tips */}
        <aside className="bg-accent-50 rounded-lg p-4 border border-accent-200" aria-labelledby="tips-heading">
          <h4 id="tips-heading" className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
            <span aria-hidden="true">💡</span>
            Tips for this prompt:
          </h4>
          <ul className="space-y-2 text-base text-neutral-700" role="list">
            {selectedPrompt.tips.slice(0, 2).map((tip, idx) => (
              <li key={idx} className="flex items-start gap-3" role="listitem">
                <span className="text-accent-600 font-bold mt-1" aria-hidden="true">•</span>
                <span className="leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      {/* Prompt Selector */}
      {showPromptSelector && (
        <section className="bg-white rounded-xl border border-neutral-200 p-6 mb-8" aria-labelledby="prompt-selector-heading" role="region">
          <h3 id="prompt-selector-heading" className="font-semibold text-neutral-900 mb-4">Choose a Different Prompt</h3>
          <div className="grid gap-3 max-h-64 overflow-y-auto" role="list" aria-label="Available practice prompts">
            {PRACTICE_PROMPTS.map((prompt) => (
              <button
                key={prompt.id}
                onClick={() => handlePromptSelect(prompt)}
                className={`text-left p-4 rounded-lg border transition-all hover:shadow-sm ${
                  prompt.id === selectedPrompt.id 
                    ? 'bg-accent-50 border-accent-200' 
                    : 'bg-white border-neutral-200 hover:border-accent-200'
                }`}
                role="listitem"
                aria-selected={prompt.id === selectedPrompt.id}
                aria-label={`Select ${prompt.category} prompt: ${prompt.text.slice(0, 50)}...`}
                type="button"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`badge ${getDifficultyColor(prompt.difficulty)}`} aria-label={`Difficulty: ${prompt.difficulty}`}>
                    {prompt.difficulty}
                  </span>
                  <span className="badge-neutral" aria-label={`Category: ${prompt.category}`}>{prompt.category}</span>
                </div>
                <p className="text-base text-neutral-900 leading-relaxed">{prompt.text}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 rounded-xl border border-red-200 p-6">
          <div className="flex gap-3">
            <span className="text-red-600 text-xl">⚠️</span>
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">Something went wrong</h3>
              <p className="text-sm text-red-700 mb-3">{error}</p>
              <button 
                onClick={() => setRecordingState('idle')}
                className="btn-secondary !py-2 !px-3 text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}