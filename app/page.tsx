import Link from 'next/link';
import { Card } from '@/components/ui/Card';

export default function Home() {
  return (
    <main className="max-w-6xl mx-auto px-6 bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-12 shadow-sm">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Perfect your{' '}
            <span className="bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">English speaking</span>{' '}
            with AI coaching
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Practice daily, get instant feedback, and track your progress. 
            Our AI identifies patterns in your speech to help you improve faster.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/practice" className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-2xl font-medium transition-colors">
              Start practicing
            </Link>
            <span className="text-sm text-gray-500">Free • No credit card required</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4 font-display">
            Everything you need to improve
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Comprehensive tools designed to accelerate your English learning journey
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card variant="solid" className="text-left">
            <div className="w-12 h-12 bg-accent-100 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">Daily Practice</h3>
            <p className="text-neutral-600 leading-relaxed">
              Structured speaking exercises with engaging prompts. Practice for just 5 minutes daily and see real progress.
            </p>
          </Card>

          <Card variant="solid" className="text-left">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">AI Analysis</h3>
            <p className="text-neutral-600 leading-relaxed">
              Advanced AI analyzes your speech patterns, grammar, and fluency to provide personalized improvement suggestions.
            </p>
          </Card>

          <Card variant="solid" className="text-left">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">Progress Tracking</h3>
            <p className="text-neutral-600 leading-relaxed">
              Detailed analytics show your improvement over time. See which areas you're excelling in and what needs work.
            </p>
          </Card>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16">
        <Card variant="solid" className="bg-gradient-to-br from-neutral-50 to-white">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4 font-display">
              Simple, effective process
            </h2>
            <p className="text-neutral-600">Get started in minutes and see results in days</p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-medium">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h4 className="text-lg font-semibold text-neutral-900 mb-3">Record your voice</h4>
              <p className="text-neutral-600">
                Answer daily prompts by speaking naturally for 1-3 minutes. No scripts or preparation needed.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-medium">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h4 className="text-lg font-semibold text-neutral-900 mb-3">Get AI feedback</h4>
              <p className="text-neutral-600">
                Our AI analyzes your speech for grammar, fluency, and common mistakes in real-time.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-medium">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h4 className="text-lg font-semibold text-neutral-900 mb-3">Track progress</h4>
              <p className="text-neutral-600">
                Watch your accuracy improve over time and focus on areas that need the most attention.
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4 font-display">
            Ready to improve your English?
          </h2>
          <p className="text-xl text-neutral-600 mb-8">
            Join thousands of learners who are already seeing results
          </p>
          <Link href="/practice" className="btn-accent text-lg px-8 py-4 rounded-2xl">
            Start your first session
          </Link>
        </div>
      </section>
    </main>
  );
}