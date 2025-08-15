'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { parseUserName, getTimeBasedGreeting, getWelcomeMessage } from '@/lib/userUtils';
import { Achievement, MicroWin } from '@/lib/achievements';

interface PersonalizedGreetingProps {
  className?: string;
  showProgressWidget?: boolean;
  variant?: 'dashboard' | 'compact';
}

interface GreetingData {
  achievements: Achievement[];
  microWins: MicroWin[];
  mostImpressive: Achievement | null;
}

export default function PersonalizedGreeting({ 
  className = "",
  showProgressWidget = true,
  variant = 'dashboard'
}: PersonalizedGreetingProps) {
  const { user } = useAuth();
  const [greetingData, setGreetingData] = useState<GreetingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  // Parse user name
  const parsedName = parseUserName(
    user?.email,
    user?.user_metadata?.full_name,
    user?.user_metadata?.first_name,
    user?.user_metadata?.last_name
  );

  useEffect(() => {
    const fetchGreetingData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch achievements and micro-wins
        const achievementsResponse = await fetch('/api/achievements');
        if (achievementsResponse.ok) {
          const data = await achievementsResponse.json();
          setGreetingData(data);
        }

        // Check if user is new (created within last 24 hours)
        const userCreatedAt = new Date(user.created_at);
        const now = new Date();
        const hoursSinceCreation = (now.getTime() - userCreatedAt.getTime()) / (1000 * 60 * 60);
        setIsNewUser(hoursSinceCreation < 24);

      } catch (error) {
        console.error('Error fetching greeting data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGreetingData();
  }, [user]);

  // Greeting message based on user status and achievements
  const getGreetingMessage = () => {
    const timeGreeting = getTimeBasedGreeting();
    const welcomeMessage = getWelcomeMessage(isNewUser, parsedName.firstName);
    
    return { timeGreeting, welcomeMessage };
  };

  // Get achievement message for display
  const getAchievementMessage = () => {
    if (!greetingData) return null;

    // Show most impressive achievement if available
    if (greetingData.mostImpressive) {
      return {
        message: greetingData.mostImpressive.description,
        icon: greetingData.mostImpressive.icon,
        type: 'achievement'
      };
    }

    // Show most recent micro-win
    if (greetingData.microWins.length > 0) {
      const win = greetingData.microWins[0];
      return {
        message: win.message,
        icon: win.icon,
        type: 'microwin'
      };
    }

    return null;
  };

  // Get encouraging message for new users or users without recent achievements
  const getEncouragingMessage = () => {
    if (isNewUser) {
      return {
        message: "Time to unlock your English speaking confidence!",
        icon: "🌟",
        type: "welcome"
      };
    }

    // Check if user has no recent activity
    const hasRecentActivity = greetingData?.achievements?.length || greetingData?.microWins?.length;
    
    if (!hasRecentActivity) {
      const welcomeBackMessages = [
        { message: "Ready to continue your English learning journey?", icon: "🚀" },
        { message: "Ready for a quick practice session?", icon: "📚" },
        { message: "Your next breakthrough is just one session away", icon: "💡" },
        { message: "Every expert was once a beginner—your turn!", icon: "🌱" }
      ];
      
      return {
        ...welcomeBackMessages[Math.floor(Math.random() * welcomeBackMessages.length)],
        type: "welcome_back"
      };
    }

    const encouragingMessages = [
      { message: "Every rep brings you closer to fluency", icon: "🎯" },
      { message: "You're building English fluency one rep at a time", icon: "📈" },
      { message: "Your dedication to practice is paying off", icon: "💪" },
      { message: "Keep building your speaking confidence", icon: "🗣️" }
    ];

    return {
      ...encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)],
      type: "encouragement"
    };
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl border border-gray-100 p-6 ${className}`}>
        <div className="space-y-3">
          <div className="skeleton h-8 w-64"></div>
          <div className="skeleton h-6 w-48"></div>
          <div className="skeleton h-4 w-80"></div>
        </div>
      </div>
    );
  }

  const { timeGreeting, welcomeMessage } = getGreetingMessage();
  const achievementMessage = getAchievementMessage();
  const encouragingMessage = getEncouragingMessage();
  const displayMessage = achievementMessage || encouragingMessage;

  if (variant === 'compact') {
    return (
      <div className={`bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl border border-primary-200 p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="text-2xl">{displayMessage?.icon}</div>
          <div>
            <h3 className="font-semibold text-gray-900">{welcomeMessage}</h3>
            {displayMessage && (
              <p className="text-sm text-gray-600">{displayMessage.message}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-8 ${className}`}>
      {/* Main Greeting */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {timeGreeting}, {parsedName.firstName}!
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          {welcomeMessage}
        </p>
      </div>

      {/* Achievement/Encouragement Message */}
      {displayMessage && (
        <div className={`rounded-xl p-4 mb-6 border ${
          displayMessage.type === 'achievement' 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
            : displayMessage.type === 'microwin'
            ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200'
            : displayMessage.type === 'welcome'
            ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200'
            : displayMessage.type === 'welcome_back'
            ? 'bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200'
            : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
        }`}>
          <div className="flex items-start gap-3">
            <div className="text-2xl">{displayMessage.icon}</div>
            <div>
              <p className="text-gray-700 leading-relaxed">
                {displayMessage.message}
              </p>
              {displayMessage.type === 'achievement' && greetingData?.mostImpressive?.value && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm font-semibold text-green-700">
                    {greetingData.mostImpressive.percentage 
                      ? `${greetingData.mostImpressive.percentage}% improvement`
                      : `${greetingData.mostImpressive.value} ${greetingData.mostImpressive.type === 'streak' ? 'days' : 'sessions'}`
                    }
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Micro-Wins */}
      {greetingData?.microWins && greetingData.microWins.length > 1 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span>🏅</span>
            Recent Wins
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {greetingData.microWins.slice(1, 3).map((win) => (
              <div 
                key={win.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="text-lg">{win.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {win.title}
                  </p>
                  <p className="text-xs text-gray-600">
                    {win.value}{win.unit} 
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Focus Message for Today */}
      {!isNewUser && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            <strong>Today's focus:</strong> {getFocusMessage()}
          </p>
        </div>
      )}
    </div>
  );
}

// Helper function to get focus message
function getFocusMessage(): string {
  const focuses = [
    "Practice speaking naturally and confidently",
    "Focus on clear pronunciation and rhythm",
    "Work on reducing filler words",
    "Pay attention to grammar accuracy",
    "Build vocabulary through conversation"
  ];
  
  // Use date-based selection for consistency
  const today = new Date();
  const dayIndex = today.getDate() % focuses.length;
  return focuses[dayIndex];
}