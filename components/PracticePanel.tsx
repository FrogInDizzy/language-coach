'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt>(currentPrompt || getDailyPrompt());
  const [selectedTipCategory, setSelectedTipCategory] = useState<keyof typeof CONTEXTUAL_TIPS>('recording');
  const [recordingTime, setRecordingTime] = useState(0);
  const [showPromptSelector, setShowPromptSelector] = useState(false);

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

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
      {/* Main Recording Panel */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-neutral-900 mb-3 font-display">
            Daily Speaking Practice 🎤
          </h1>
          <p className="text-lg text-neutral-600">
            Hello {userName}! Practice for 3-5 minutes and get personalized feedback
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="card-solid bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                recordingState === 'recording' ? 'bg-red-100 animate-pulse' :
                recordingState === 'processing' ? 'bg-amber-100' :
                'bg-primary-100'
              }`}>
                {getStateIcon()}
              </div>
              <div>
                <div className="font-medium text-neutral-900">{getStateMessage()}</div>
                {recordingState === 'recording' && (
                  <div className="text-sm text-neutral-600">Duration: {formatTime(recordingTime)}</div>
                )}
              </div>
            </div>
            {recordingState === 'processing' && (
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse animation-delay-200"></div>
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse animation-delay-400"></div>
              </div>
            )}
          </div>
          
          {/* Progress bar for processing */}
          {recordingState === 'processing' && (
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-primary-400 to-accent-500 h-2 rounded-full animate-pulse-progress"></div>
            </div>
          )}
        </div>

        {/* Current Prompt */}
        <div className="card">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">💭</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Today's Prompt</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`badge text-xs ${getDifficultyColor(selectedPrompt.difficulty)}`}>
                    {selectedPrompt.difficulty}
                  </span>
                  <span className="badge-neutral text-xs">{selectedPrompt.category}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowPromptSelector(!showPromptSelector)}
              className="btn-secondary !py-2 !px-3 text-sm"
              disabled={recordingState === 'processing'}
            >
              Change Prompt
            </button>
          </div>
          
          <p className="text-neutral-900 text-lg leading-relaxed mb-4">{selectedPrompt.text}</p>
          
          {/* Prompt-specific tips */}
          <div className="bg-accent-50 rounded-lg p-4 border border-accent-200">
            <h4 className="font-medium text-neutral-900 mb-2 flex items-center gap-2">
              <span>💡</span>
              Tips for this prompt:
            </h4>
            <ul className="space-y-1 text-sm text-neutral-700">
              {selectedPrompt.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-accent-500 mt-1">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Prompt Selector Dropdown */}
        {showPromptSelector && (
          <div className="card border-2 border-primary-200">
            <h3 className="font-semibold text-neutral-900 mb-4">Choose a Different Prompt</h3>
            <div className="grid gap-3 max-h-64 overflow-y-auto">
              {PRACTICE_PROMPTS.map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => handlePromptSelect(prompt)}
                  className={`text-left p-3 rounded-lg border transition-all hover:shadow-sm ${
                    prompt.id === selectedPrompt.id 
                      ? 'bg-primary-50 border-primary-200' 
                      : 'bg-white border-neutral-200 hover:border-primary-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`badge text-xs ${getDifficultyColor(prompt.difficulty)}`}>
                      {prompt.difficulty}
                    </span>
                    <span className="badge-neutral text-xs">{prompt.category}</span>
                  </div>
                  <p className="text-sm text-neutral-900">{prompt.text}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recording Interface */}
        <div className="card text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="hidden"
          />
          
          {/* Main Record Button */}
          <div className="flex justify-center mb-6">
            <button
              onClick={handleFileUpload}
              disabled={recordingState === 'processing'}
              className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
                recordingState === 'processing' 
                  ? 'bg-neutral-300 cursor-not-allowed' 
                  : 'bg-accent-500 hover:bg-accent-600 active:scale-95'
              }`}
            >
              <span className="text-white text-3xl">
                {recordingState === 'processing' ? '⏳' : '🎤'}
              </span>
            </button>
          </div>
          
          {/* Instructions */}
          <div className="space-y-3">
            <p className="text-neutral-900 font-medium text-lg">
              {recordingState === 'processing' ? 'Processing...' : 'Ready to practice?'}
            </p>
            <p className="text-neutral-600">
              {recordingState === 'processing' 
                ? 'Please wait while we transcribe and analyze your speech' 
                : 'Upload an audio file to simulate recording and get personalized feedback'
              }
            </p>
            
            {recordingState === 'idle' && (
              <div className="bg-primary-50 rounded-lg p-4 border border-primary-200 text-sm">
                <p className="text-primary-700 mb-2"><strong>💡 In the full version:</strong></p>
                <p className="text-primary-600">
                  Tap the microphone to start recording, speak naturally for 1-3 minutes, 
                  then tap again to stop. Works on mobile and desktop with built-in microphone support.
                </p>
              </div>
            )}
          </div>
          
          {/* Alternative Upload Button */}
          {recordingState === 'idle' && (
            <button
              onClick={handleFileUpload}
              className="btn-secondary mt-4 !py-3 !px-6"
            >
              📎 Upload Audio File
            </button>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="card bg-red-50 border-red-200">
            <div className="flex gap-3">
              <span className="text-red-600 text-xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-red-600 mb-1">Something went wrong</h3>
                <p className="text-sm text-neutral-600 mb-3">{error}</p>
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
      </div>

      {/* Tips Sidebar */}
      <div className="space-y-6">
        <div className="card-solid">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <span>🎯</span>
            Practice Tips
          </h3>
          
          {/* Tip Categories */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {Object.keys(CONTEXTUAL_TIPS).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedTipCategory(category as keyof typeof CONTEXTUAL_TIPS)}
                className={`text-xs py-2 px-3 rounded-lg transition-colors ${
                  selectedTipCategory === category
                    ? 'bg-accent-100 text-accent-700 border border-accent-200'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Tips List */}
          <div className="space-y-3">
            {CONTEXTUAL_TIPS[selectedTipCategory].map((tip, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="text-accent-500 mt-1 text-sm">•</span>
                <span className="text-sm text-neutral-700 leading-relaxed">{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="card-solid bg-gradient-to-br from-primary-50 to-accent-50 border border-primary-200">
          <h4 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
            <span>📈</span>
            Today's Goal
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Practice sessions</span>
              <span className="text-sm font-medium text-neutral-900">2 / 3</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-primary-400 to-accent-500 h-2 rounded-full transition-all duration-500" style={{ width: '67%' }}></div>
            </div>
            <p className="text-xs text-neutral-600 text-center">1 more session to reach your daily goal!</p>
          </div>
        </div>

        {/* Encouragement Card */}
        <div className="card-solid bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
          <div className="text-center">
            <div className="text-2xl mb-2">🌟</div>
            <h4 className="font-semibold text-neutral-900 mb-2">You're doing great!</h4>
            <p className="text-sm text-neutral-600">
              Consistent practice is the key to fluency. Every session helps you improve!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}