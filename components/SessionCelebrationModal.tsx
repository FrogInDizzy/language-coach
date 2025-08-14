'use client';

import { useEffect, useState } from 'react';
import { SessionResult } from '@/hooks/useProgress';

interface SessionCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionResult: SessionResult;
  sessionData: {
    mistakeCount: number;
    mistakeCategories: string[];
    durationSeconds: number;
    specificFeedback?: string;
  };
  onQuickDrill?: (category: string) => void;
}

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
}

export default function SessionCelebrationModal({
  isOpen,
  onClose,
  sessionResult,
  sessionData,
  onQuickDrill
}: SessionCelebrationModalProps) {
  const [animationPhase, setAnimationPhase] = useState<'xp' | 'streak' | 'levelup' | 'complete'>('xp');
  const [animatedXP, setAnimatedXP] = useState(0);
  const [confetti, setConfetti] = useState<ConfettiParticle[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  // Generate specific feedback based on session performance
  const generateSpecificFeedback = (): string => {
    const { mistakeCount, mistakeCategories } = sessionData;
    
    if (mistakeCount === 0) {
      return "Perfect session! Your grammar accuracy was flawless.";
    }
    
    if (mistakeCount <= 2) {
      const category = mistakeCategories[0];
      const categoryMap: Record<string, string> = {
        'articles': 'article usage (a, an, the)',
        'verb_tense': 'verb tenses',
        'prepositions': 'preposition choices',
        'subject_verb_agreement': 'subject-verb agreement',
        'word_order': 'word order',
        'pluralization': 'plural forms',
        'pronouns': 'pronoun usage',
        'run_on_fragment': 'sentence structure',
        'filler_words': 'filler word reduction'
      };
      
      return `Great progress! You mainly struggled with ${categoryMap[category] || category}. Keep practicing!`;
    }
    
    const mostCommon = mistakeCategories.reduce((acc, cat) => {
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topCategory = Object.entries(mostCommon).sort(([,a], [,b]) => b - a)[0][0];
    const categoryMap: Record<string, string> = {
      'articles': 'articles',
      'verb_tense': 'verb tenses', 
      'prepositions': 'prepositions',
      'subject_verb_agreement': 'subject-verb agreement',
      'word_order': 'sentence structure',
      'pluralization': 'pluralization',
      'pronouns': 'pronouns',
      'run_on_fragment': 'sentence flow',
      'filler_words': 'speaking fluency'
    };
    
    return `You're improving! Focus on ${categoryMap[topCategory] || topCategory} - that's your biggest opportunity.`;
  };

  // Generate quick drill suggestions
  const getQuickDrillSuggestions = (): Array<{category: string, title: string, icon: string}> => {
    const suggestions = [];
    const categoryInfo = {
      'articles': { title: 'Article Drills', icon: '📰' },
      'verb_tense': { title: 'Verb Tense Practice', icon: '⏰' },
      'prepositions': { title: 'Preposition Exercises', icon: '🔗' },
      'subject_verb_agreement': { title: 'Subject-Verb Drills', icon: '🤝' },
      'word_order': { title: 'Sentence Structure', icon: '🔄' },
      'pluralization': { title: 'Plural Forms', icon: '📊' },
      'pronouns': { title: 'Pronoun Practice', icon: '👤' },
      'run_on_fragment': { title: 'Sentence Flow', icon: '✂️' },
      'filler_words': { title: 'Fluency Training', icon: '🤐' }
    };

    // Get unique categories from mistakes
    const uniqueCategories = [...new Set(sessionData.mistakeCategories)];
    
    // Add suggestions for mistake categories
    uniqueCategories.slice(0, 2).forEach(category => {
      const info = categoryInfo[category as keyof typeof categoryInfo];
      if (info) {
        suggestions.push({ category, ...info });
      }
    });

    // Fill remaining spots with general practice if needed
    if (suggestions.length < 2) {
      if (!suggestions.some(s => s.category === 'articles')) {
        suggestions.push({ category: 'articles', ...categoryInfo.articles });
      }
      if (!suggestions.some(s => s.category === 'verb_tense') && suggestions.length < 2) {
        suggestions.push({ category: 'verb_tense', ...categoryInfo.verb_tense });
      }
    }

    return suggestions.slice(0, 3);
  };

  // Create confetti particles for level up
  const createConfetti = () => {
    const particles: ConfettiParticle[] = [];
    const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    
    for (let i = 0; i < 50; i++) {
      particles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -10,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 6
      });
    }
    setConfetti(particles);
  };

  // Animate confetti
  useEffect(() => {
    if (!showConfetti) return;

    const interval = setInterval(() => {
      setConfetti(prev => 
        prev.map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vy: particle.vy + 0.1, // gravity
          rotation: particle.rotation + particle.rotationSpeed
        })).filter(particle => particle.y < window.innerHeight + 50)
      );
    }, 16);

    return () => clearInterval(interval);
  }, [showConfetti]);

  // Animation sequence
  useEffect(() => {
    if (!isOpen) {
      setAnimationPhase('xp');
      setAnimatedXP(0);
      setShowConfetti(false);
      setConfetti([]);
      return;
    }

    // Phase 1: XP animation
    const xpTimer = setTimeout(() => {
      let current = 0;
      const target = sessionResult.xp_earned;
      const duration = 1000;
      const steps = 60;
      const increment = target / steps;

      const xpInterval = setInterval(() => {
        current += increment;
        if (current >= target) {
          setAnimatedXP(target);
          clearInterval(xpInterval);
          
          // Phase 2: Move to streak
          setTimeout(() => setAnimationPhase('streak'), 300);
        } else {
          setAnimatedXP(Math.floor(current));
        }
      }, duration / steps);
    }, 500);

    // Phase 3: Level up celebration
    if (sessionResult.level_up) {
      setTimeout(() => {
        setAnimationPhase('levelup');
        setShowConfetti(true);
        createConfetti();
        
        // Clear confetti after 3 seconds
        setTimeout(() => {
          setShowConfetti(false);
          setAnimationPhase('complete');
        }, 3000);
      }, 2500);
    } else {
      setTimeout(() => {
        setAnimationPhase('complete');
      }, 2500);
    }

    return () => clearTimeout(xpTimer);
  }, [isOpen, sessionResult]);

  if (!isOpen) return null;

  const specificFeedback = generateSpecificFeedback();
  const quickDrills = getQuickDrillSuggestions();

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[60]">
          {confetti.map(particle => (
            <div
              key={particle.id}
              className="absolute w-2 h-2 opacity-80"
              style={{
                left: particle.x,
                top: particle.y,
                backgroundColor: particle.color,
                transform: `rotate(${particle.rotation}deg)`,
                width: particle.size,
                height: particle.size,
                borderRadius: Math.random() > 0.5 ? '50%' : '0%'
              }}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[55] p-4 celebration-container">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-celebration-bounce gpu-accelerated">
          
          {/* Header */}
          <div className="text-center p-8 pb-4">
            <div className="text-6xl mb-4 animate-bounce">
              {animationPhase === 'levelup' ? '🌟' : '🎉'}
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              {animationPhase === 'levelup' ? 'Level Up!' : 'Session Complete!'}
            </h2>
            <p className="text-neutral-600">{specificFeedback}</p>
          </div>

          {/* XP and Progress Section */}
          <div className="px-8 pb-6">
            <div className="bg-gradient-to-r from-accent-50 to-primary-50 rounded-2xl p-6 mb-6">
              
              {/* XP Earned */}
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-3 mb-2">
                  <div className="text-3xl gpu-accelerated">✨</div>
                  <div>
                    <div className="text-3xl font-bold text-accent-600 animate-xp-counter">
                      +{animatedXP}
                    </div>
                    <div className="text-sm text-neutral-600">XP Earned</div>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex items-center justify-center gap-6">
                {sessionResult.level_up && (
                  <div className="text-center">
                    <div className="text-2xl mb-1 animate-level-up-pulse gpu-accelerated">🏆</div>
                    <div className="text-sm font-semibold text-primary-600">Level {sessionResult.level}</div>
                  </div>
                )}
                
                {/* Streak with flame animation */}
                <div className="text-center relative">
                  <div className={`text-3xl mb-1 ${animationPhase >= 'streak' ? 'animate-streak-flame' : ''} gpu-accelerated`}>
                    {sessionResult.streak > 0 ? '🔥' : '⚡'}
                  </div>
                  <div className="text-sm text-neutral-600">
                    {sessionResult.streak > 0 ? `${sessionResult.streak} Day Streak` : 'Start Your Streak!'}
                  </div>
                  
                  {/* Flame trail effect for consecutive days */}
                  {sessionResult.streak >= 3 && animationPhase >= 'streak' && (
                    <div className="absolute -inset-2 opacity-30">
                      <div className="text-lg animate-pulse animation-delay-200">🔥</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Level up message */}
              {sessionResult.level_up && (
                <div className="text-center mt-4 p-3 bg-white/50 rounded-xl">
                  <p className="text-sm font-medium text-primary-700">
                    🎊 Congratulations! You've reached Level {sessionResult.level}!
                  </p>
                </div>
              )}
            </div>

            {/* Quick Drill Suggestions */}
            {animationPhase === 'complete' && quickDrills.length > 0 && (
              <div className="animate-fade-in">
                <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                  <span>🎯</span>
                  Keep the momentum going!
                </h3>
                
                <div className="space-y-2 mb-6">
                  {quickDrills.map((drill, index) => (
                    <button
                      key={drill.category}
                      onClick={() => onQuickDrill?.(drill.category)}
                      className="w-full flex items-center gap-3 p-3 bg-neutral-50 hover:bg-neutral-100 rounded-xl transition-all duration-200 hover:scale-[1.02]"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="text-xl">{drill.icon}</div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-neutral-900">{drill.title}</div>
                        <div className="text-sm text-neutral-600">1-tap quick practice</div>
                      </div>
                      <div className="text-primary-500">→</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {animationPhase === 'complete' && (
              <div className="flex gap-3 animate-fade-in">
                <button
                  onClick={onClose}
                  className="flex-1 btn-secondary"
                >
                  Continue Practicing
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 btn-primary"
                >
                  View Progress
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}