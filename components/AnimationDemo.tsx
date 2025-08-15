'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { FadeInSection, SlideInSection, StaggerContainer, StaggerItem, AnimatedButton } from './PageTransition';

export default function AnimationDemo() {
  const [showDemo, setShowDemo] = useState(false);

  const demoItems = [
    { title: 'Fade In Animation', delay: 0.1, color: 'bg-blue-100' },
    { title: 'Slide In Animation', delay: 0.2, color: 'bg-green-100' },
    { title: 'Stagger Animation', delay: 0.3, color: 'bg-purple-100' },
    { title: 'Scale Animation', delay: 0.4, color: 'bg-orange-100' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🎭 Language Coach Animations
        </h1>
        <p className="text-gray-600 mb-8">
          Experience smooth, engaging transitions throughout the app
        </p>
        
        <AnimatedButton
          onClick={() => setShowDemo(!showDemo)}
          className="btn-accent"
        >
          {showDemo ? 'Hide Demo' : 'Show Animation Demo'}
        </AnimatedButton>
      </motion.div>

      {showDemo && (
        <>
          {/* Page Transition Examples */}
          <FadeInSection>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                🌟 Page Transition Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <strong>Route-based animations:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Dashboard: Fade & scale entrance</li>
                    <li>Practice: Slide up (feels like starting)</li>
                    <li>History: Slide from right</li>
                    <li>Navigation: Smooth directional transitions</li>
                  </ul>
                </div>
                <div>
                  <strong>Performance optimized:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>GPU-accelerated transforms</li>
                    <li>Respects reduced motion preferences</li>
                    <li>Smooth 60fps animations</li>
                    <li>Lightweight Framer Motion integration</li>
                  </ul>
                </div>
              </div>
            </div>
          </FadeInSection>

          {/* Component Animation Examples */}
          <SlideInSection direction="up" delay={0.2}>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                ⚡ Component Animations
              </h2>
              
              <StaggerContainer>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {demoItems.map((item, index) => (
                    <StaggerItem key={index}>
                      <motion.div
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        className={`${item.color} rounded-xl p-4 text-center cursor-pointer`}
                      >
                        <div className="text-2xl mb-2">
                          {index === 0 ? '✨' : index === 1 ? '🚀' : index === 2 ? '🎯' : '🎨'}
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {item.title}
                        </h3>
                      </motion.div>
                    </StaggerItem>
                  ))}
                </div>
              </StaggerContainer>
            </div>
          </SlideInSection>

          {/* Interactive Elements */}
          <FadeInSection delay={0.3}>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                🎪 Interactive Elements
              </h2>
              <div className="space-y-4">
                <motion.div
                  className="flex flex-wrap gap-3"
                >
                  <AnimatedButton className="btn-primary">
                    Primary Button
                  </AnimatedButton>
                  <AnimatedButton className="btn-secondary">
                    Secondary Button
                  </AnimatedButton>
                  <AnimatedButton className="btn-accent">
                    Accent Button
                  </AnimatedButton>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['Practice Session', 'Review History', 'Check Progress'].map((text, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ 
                        scale: 1.02, 
                        y: -2,
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                      }}
                      className="card cursor-pointer"
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">
                          {i === 0 ? '🎤' : i === 1 ? '📊' : '🏆'}
                        </div>
                        <h3 className="font-semibold text-gray-900">{text}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Hover me for animation
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </FadeInSection>

          {/* Animation Principles */}
          <SlideInSection direction="left" delay={0.4}>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                🎯 Animation Principles Applied
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">✨ Purposeful Motion</h3>
                  <p className="text-green-800">
                    Every animation serves a purpose - guiding attention, providing feedback, 
                    or enhancing the feeling of progression through learning.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">⚡ Performance First</h3>
                  <p className="text-green-800">
                    GPU-accelerated transforms, optimized timing functions, and respect 
                    for accessibility preferences ensure smooth experiences for everyone.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">🎨 Consistent Timing</h3>
                  <p className="text-green-800">
                    Consistent easing curves and duration patterns create a cohesive 
                    feel across all interactions and page transitions.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">🌊 Natural Flow</h3>
                  <p className="text-green-800">
                    Staggered animations and directional transitions create natural, 
                    intuitive navigation that feels effortless and engaging.
                  </p>
                </div>
              </div>
            </div>
          </SlideInSection>
        </>
      )}
    </div>
  );
}