'use client';

import { useState } from 'react';
import SessionCelebrationModal from '@/components/SessionCelebrationModal';

export default function TestCelebrationPage() {
  const [isOpen, setIsOpen] = useState(false);

  // Test data for different scenarios
  const mockSessionResult = {
    xp_earned: 85,
    total_xp: 1250,
    level: 12,
    level_up: true,
    streak: 7
  };

  const mockSessionData = {
    mistakeCount: 3,
    mistakeCategories: ['articles', 'verb_tense', 'prepositions'],
    durationSeconds: 180
  };

  const handleQuickDrill = (category: string) => {
    console.log('Quick drill selected:', category);
    setIsOpen(false);
  };

  return (
    <main className="max-w-2xl mx-auto py-12 px-6">
      <div className="text-center space-y-8">
        <h1 className="text-3xl font-bold text-neutral-900">
          Session Celebration Test
        </h1>
        
        <div className="space-y-4">
          <button
            onClick={() => setIsOpen(true)}
            className="btn-primary"
          >
            Test Level Up Celebration 🎉
          </button>
          
          <div className="text-sm text-neutral-600 max-w-md mx-auto">
            This will show the full celebration modal with:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>XP gain animation (+85 XP)</li>
              <li>Streak flame animation (7 days)</li>
              <li>Level up confetti (Level 12)</li>
              <li>Specific feedback generation</li>
              <li>Quick drill suggestions</li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <div className="card">
            <h3 className="font-semibold text-neutral-900 mb-2">Features Tested</h3>
            <ul className="text-sm text-neutral-600 space-y-1">
              <li>✅ XP animation with bounce effect</li>
              <li>✅ Confetti particles for level-ups</li>
              <li>✅ Streak flame animation</li>
              <li>✅ GPU-accelerated animations</li>
              <li>✅ Specific feedback generation</li>
              <li>✅ Quick drill suggestions</li>
            </ul>
          </div>

          <div className="card">
            <h3 className="font-semibold text-neutral-900 mb-2">Performance</h3>
            <ul className="text-sm text-neutral-600 space-y-1">
              <li>🚀 GPU acceleration with translateZ(0)</li>
              <li>🚀 will-change for optimal performance</li>
              <li>🚀 Staggered animations to prevent jank</li>
              <li>🚀 Hardware-accelerated transforms</li>
            </ul>
          </div>
        </div>
      </div>

      <SessionCelebrationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        sessionResult={mockSessionResult}
        sessionData={mockSessionData}
        onQuickDrill={handleQuickDrill}
      />
    </main>
  );
}