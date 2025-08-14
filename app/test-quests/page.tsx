'use client';

import { useState } from 'react';
import DailyQuestPanel from '@/components/DailyQuestPanel';
import StreakShieldModal from '@/components/StreakShieldModal';

export default function TestQuestsPage() {
  const [showShieldModal, setShowShieldModal] = useState(false);
  const [testScenario, setTestScenario] = useState<'fresh' | 'partial' | 'complete'>('fresh');

  const testScenarios = {
    fresh: {
      name: 'Fresh Daily Quests',
      description: 'New user with no quest progress'
    },
    partial: {
      name: 'Partially Complete',
      description: 'Some quests completed, others in progress'
    },
    complete: {
      name: 'All Complete',
      description: 'All daily quests finished with streak shield'
    }
  };

  const handleQuestComplete = (questId: string, xpEarned: number) => {
    console.log(`Quest ${questId} completed! +${xpEarned} XP`);
  };

  const handleAllQuestsComplete = (totalXp: number, streakShield: boolean) => {
    console.log(`All quests complete! +${totalXp} XP, Shield: ${streakShield}`);
    if (streakShield) {
      setTimeout(() => setShowShieldModal(true), 1000);
    }
  };

  return (
    <main className="max-w-4xl mx-auto py-12 px-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">
          Daily Quest System Test
        </h1>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          Test the complete daily quest flow with different scenarios, progress tracking, 
          and reward animations.
        </p>
      </div>

      {/* Test Scenario Selector */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Test Scenarios</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(testScenarios).map(([key, scenario]) => (
            <button
              key={key}
              onClick={() => setTestScenario(key as any)}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                testScenario === key 
                  ? 'border-primary-300 bg-primary-50' 
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
            >
              <h3 className="font-semibold text-neutral-900 mb-1">{scenario.name}</h3>
              <p className="text-sm text-neutral-600">{scenario.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Test Actions */}
      <div className="mb-8 bg-neutral-50 rounded-xl p-4">
        <h3 className="font-medium text-neutral-900 mb-3">Test Actions</h3>
        <div className="flex gap-3">
          <button
            onClick={() => setShowShieldModal(true)}
            className="btn-secondary text-sm"
          >
            Test Streak Shield Modal
          </button>
          <button
            onClick={() => window.location.reload()}
            className="btn-ghost text-sm"
          >
            Reset State
          </button>
        </div>
      </div>

      {/* Quest Implementation Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">✅ Implemented Features</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <div>
                <strong>3 Quest Types:</strong>
                <div className="text-neutral-600 ml-2">• Warm-up Practice (2-min speaking)</div>
                <div className="text-neutral-600 ml-2">• Mistake Review (Fix 5 errors)</div>
                <div className="text-neutral-600 ml-2">• Vocabulary Challenge (Learn 3 words)</div>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <div>
                <strong>Real-time Progress Tracking:</strong>
                <div className="text-neutral-600 ml-2">• Animated progress bars</div>
                <div className="text-neutral-600 ml-2">• Session integration</div>
                <div className="text-neutral-600 ml-2">• Automatic quest updates</div>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <div>
                <strong>Completion Rewards:</strong>
                <div className="text-neutral-600 ml-2">• XP bonus system</div>
                <div className="text-neutral-600 ml-2">• Celebration animations</div>
                <div className="text-neutral-600 ml-2">• Progress notifications</div>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <div>
                <strong>Streak Shield System:</strong>
                <div className="text-neutral-600 ml-2">• Daily completion tracking</div>
                <div className="text-neutral-600 ml-2">• Shield earned at 7-day intervals</div>
                <div className="text-neutral-600 ml-2">• Particle animation rewards</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">🔧 Technical Implementation</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">⚙️</span>
              <div>
                <strong>Database Design:</strong>
                <div className="text-neutral-600 ml-2">• PostgreSQL schema with RLS</div>
                <div className="text-neutral-600 ml-2">• Daily quest sets & progress tracking</div>
                <div className="text-neutral-600 ml-2">• Timezone-aware date handling</div>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">⚙️</span>
              <div>
                <strong>Quest Generation:</strong>
                <div className="text-neutral-600 ml-2">• Intelligent difficulty scaling</div>
                <div className="text-neutral-600 ml-2">• User performance analysis</div>
                <div className="text-neutral-600 ml-2">• Dynamic quest content</div>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">⚙️</span>
              <div>
                <strong>Performance Optimization:</strong>
                <div className="text-neutral-600 ml-2">• GPU-accelerated animations</div>
                <div className="text-neutral-600 ml-2">• React hooks for state management</div>
                <div className="text-neutral-600 ml-2">• Efficient API integration</div>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">⚙️</span>
              <div>
                <strong>Daily Reset Logic:</strong>
                <div className="text-neutral-600 ml-2">• Timezone support</div>
                <div className="text-neutral-600 ml-2">• Automatic quest refresh</div>
                <div className="text-neutral-600 ml-2">• Streak persistence</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Quest Panel */}
      <div className="card">
        <h2 className="text-xl font-semibold text-neutral-900 mb-6">Live Daily Quest Panel</h2>
        <DailyQuestPanel
          variant="page"
          onQuestComplete={handleQuestComplete}
          onAllQuestsComplete={handleAllQuestsComplete}
        />
      </div>

      {/* Streak Shield Modal */}
      {showShieldModal && (
        <StreakShieldModal
          isOpen={showShieldModal}
          onClose={() => setShowShieldModal(false)}
          streakLength={7}
          xpBonus={50}
          shieldType="bronze"
        />
      )}
    </main>
  );
}