'use client';

import { useEffect, useState } from 'react';

interface StreakShieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakLength: number;
  xpBonus: number;
  shieldType?: 'bronze' | 'silver' | 'gold' | 'diamond';
}

interface ShieldParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
}

export default function StreakShieldModal({
  isOpen,
  onClose,
  streakLength,
  xpBonus,
  shieldType = 'bronze'
}: StreakShieldModalProps) {
  const [animationPhase, setAnimationPhase] = useState<'shield' | 'xp' | 'complete'>('shield');
  const [particles, setParticles] = useState<ShieldParticle[]>([]);
  const [showParticles, setShowParticles] = useState(false);

  // Shield configuration based on type
  const getShieldConfig = (type: 'bronze' | 'silver' | 'gold' | 'diamond') => {
    const configs = {
      bronze: {
        emoji: '🛡️',
        color: 'from-amber-400 to-amber-600',
        bgColor: 'from-amber-50 to-orange-50',
        borderColor: 'border-amber-200',
        textColor: 'text-amber-700',
        title: 'Bronze Shield',
        particles: ['#f59e0b', '#d97706', '#92400e']
      },
      silver: {
        emoji: '⚔️',
        color: 'from-gray-400 to-gray-600',
        bgColor: 'from-gray-50 to-slate-50',
        borderColor: 'border-gray-200',
        textColor: 'text-gray-700',
        title: 'Silver Shield',
        particles: ['#6b7280', '#4b5563', '#374151']
      },
      gold: {
        emoji: '🏆',
        color: 'from-yellow-400 to-yellow-600',
        bgColor: 'from-yellow-50 to-amber-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-700',
        title: 'Gold Shield',
        particles: ['#fbbf24', '#f59e0b', '#d97706']
      },
      diamond: {
        emoji: '💎',
        color: 'from-cyan-400 to-blue-600',
        bgColor: 'from-cyan-50 to-blue-50',
        borderColor: 'border-cyan-200',
        textColor: 'text-cyan-700',
        title: 'Diamond Shield',
        particles: ['#06b6d4', '#0891b2', '#0e7490']
      }
    };
    return configs[type] || configs.bronze;
  };

  const shieldConfig = getShieldConfig(shieldType);

  // Create shield particles
  const createShieldParticles = () => {
    const newParticles: ShieldParticle[] = [];
    const colors = shieldConfig.particles;
    
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30;
      const radius = 100 + Math.random() * 50;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      newParticles.push({
        id: i,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: Math.cos(angle) * 2,
        vy: Math.sin(angle) * 2,
        size: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0
      });
    }
    
    setParticles(newParticles);
  };

  // Animate particles
  useEffect(() => {
    if (!showParticles) return;

    const interval = setInterval(() => {
      setParticles(prev => 
        prev.map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vy: particle.vy + 0.1, // gravity
          life: particle.life - 0.02
        })).filter(particle => particle.life > 0)
      );
    }, 16);

    return () => clearInterval(interval);
  }, [showParticles]);

  // Animation sequence
  useEffect(() => {
    if (!isOpen) {
      setAnimationPhase('shield');
      setShowParticles(false);
      setParticles([]);
      return;
    }

    // Phase 1: Shield appears
    setTimeout(() => {
      setShowParticles(true);
      createShieldParticles();
    }, 500);

    // Phase 2: XP animation
    setTimeout(() => {
      setAnimationPhase('xp');
    }, 2000);

    // Phase 3: Complete
    setTimeout(() => {
      setAnimationPhase('complete');
      setShowParticles(false);
    }, 3500);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      
      {/* Shield Particles */}
      {showParticles && (
        <div className="fixed inset-0 pointer-events-none z-[60]">
          {particles.map(particle => (
            <div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                left: particle.x,
                top: particle.y,
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                opacity: particle.life
              }}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[55] p-4">
        <div className={`bg-gradient-to-br ${shieldConfig.bgColor} rounded-3xl shadow-2xl max-w-md w-full border-2 ${shieldConfig.borderColor} animate-celebration-bounce gpu-accelerated`}>
          
          {/* Header */}
          <div className="text-center p-8 pb-4">
            <div className={`text-8xl mb-4 ${animationPhase === 'shield' ? 'animate-level-up-pulse' : 'animate-bounce'}`}>
              {shieldConfig.emoji}
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${shieldConfig.textColor}`}>
              {shieldConfig.title} Earned!
            </h2>
            <p className="text-neutral-600">
              {streakLength} days of consistent practice
            </p>
          </div>

          {/* Shield Stats */}
          <div className="px-8 pb-6">
            <div className={`bg-gradient-to-r ${shieldConfig.color} rounded-2xl p-6 mb-6 text-white`}>
              
              {/* Shield Level */}
              <div className="text-center mb-4">
                <div className="text-4xl font-bold mb-1">
                  {streakLength}
                </div>
                <div className="text-sm opacity-90">
                  Day Streak Shield
                </div>
              </div>

              {/* Shield Features */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl mb-1">🔥</div>
                  <div className="text-xs opacity-90">Streak Protected</div>
                </div>
                <div>
                  <div className="text-2xl mb-1">⚡</div>
                  <div className="text-xs opacity-90">XP Multiplier</div>
                </div>
              </div>
            </div>

            {/* XP Bonus */}
            {animationPhase >= 'xp' && (
              <div className="text-center mb-6 animate-fade-in">
                <div className="inline-flex items-center gap-3 bg-white/50 rounded-xl px-6 py-3">
                  <div className="text-2xl animate-xp-counter">✨</div>
                  <div>
                    <div className="text-2xl font-bold text-amber-600">
                      +{xpBonus}
                    </div>
                    <div className="text-sm text-neutral-600">Bonus XP</div>
                  </div>
                </div>
              </div>
            )}

            {/* Shield Benefits */}
            {animationPhase === 'complete' && (
              <div className="space-y-3 mb-6 animate-fade-in">
                <h3 className="font-semibold text-neutral-900 text-center mb-3">
                  Shield Benefits:
                </h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3 p-2 bg-white/50 rounded-lg">
                    <span className="text-lg">🛡️</span>
                    <span className="text-neutral-700">
                      One "miss day" forgiveness in your streak
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-white/50 rounded-lg">
                    <span className="text-lg">⚡</span>
                    <span className="text-neutral-700">
                      10% XP bonus for the next 7 days
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-white/50 rounded-lg">
                    <span className="text-lg">🎯</span>
                    <span className="text-neutral-700">
                      Special quest rewards this week
                    </span>
                  </div>
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
                  View Progress
                </button>
                <button
                  onClick={onClose}
                  className={`flex-1 btn-primary bg-gradient-to-r ${shieldConfig.color} border-0 hover:opacity-90`}
                >
                  Keep Practicing!
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}