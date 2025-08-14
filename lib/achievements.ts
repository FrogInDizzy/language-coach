/**
 * Achievement tracking system for micro-wins and accomplishments
 */

export interface Achievement {
  id: string;
  type: 'improvement' | 'milestone' | 'streak' | 'accuracy' | 'consistency';
  category: string;
  title: string;
  description: string;
  icon: string;
  value?: number;
  previousValue?: number;
  percentage?: number;
  isNew: boolean;
  earnedAt: string; // ISO date string
}

export interface MicroWin {
  id: string;
  type: 'error_reduction' | 'accuracy_improvement' | 'streak_milestone' | 'session_count' | 'speed_improvement';
  title: string;
  message: string;
  icon: string;
  value: number;
  unit: string;
  earnedAt: string;
}

/**
 * Calculate achievements based on session data and historical progress
 */
export function calculateSessionAchievements(
  sessionData: {
    mistakeCategories: string[];
    mistakeCount: number;
    durationSeconds: number;
    accuracyScore: number;
  },
  historicalData: {
    previousSessions: Array<{
      mistakeCount: number;
      accuracyScore: number;
      categories: string[];
      date: string;
    }>;
    totalSessions: number;
    currentStreak: number;
    averageAccuracy: number;
  }
): Achievement[] {
  const achievements: Achievement[] = [];
  const now = new Date().toISOString();

  // 1. Error Reduction Achievements
  if (historicalData.previousSessions.length >= 3) {
    const recentSessions = historicalData.previousSessions.slice(-3);
    const avgRecentErrors = recentSessions.reduce((sum, s) => sum + s.mistakeCount, 0) / recentSessions.length;
    
    if (sessionData.mistakeCount < avgRecentErrors * 0.7) { // 30% improvement
      const improvement = Math.round(((avgRecentErrors - sessionData.mistakeCount) / avgRecentErrors) * 100);
      achievements.push({
        id: `error_reduction_${Date.now()}`,
        type: 'improvement',
        category: 'error_reduction',
        title: 'Fewer Mistakes!',
        description: `You reduced your error count by ${improvement}% compared to recent sessions`,
        icon: '📉',
        percentage: improvement,
        isNew: true,
        earnedAt: now
      });
    }
  }

  // 2. Category-specific improvements
  sessionData.mistakeCategories.forEach(category => {
    const categoryHistory = historicalData.previousSessions
      .filter(s => s.categories.includes(category))
      .slice(-5); // Last 5 sessions with this category

    if (categoryHistory.length >= 3) {
      const avgCategoryErrors = categoryHistory.reduce((sum, s) => 
        sum + s.categories.filter(c => c === category).length, 0) / categoryHistory.length;
      
      const currentCategoryErrors = sessionData.mistakeCategories.filter(c => c === category).length;
      
      if (currentCategoryErrors < avgCategoryErrors * 0.8) { // 20% improvement
        const improvement = Math.round(((avgCategoryErrors - currentCategoryErrors) / avgCategoryErrors) * 100);
        achievements.push({
          id: `category_improvement_${category}_${Date.now()}`,
          type: 'improvement',
          category: category,
          title: `${formatCategoryName(category)} Progress!`,
          description: `You reduced ${formatCategoryName(category).toLowerCase()} errors by ${improvement}%`,
          icon: getCategoryIcon(category),
          percentage: improvement,
          isNew: true,
          earnedAt: now
        });
      }
    }
  });

  // 3. Accuracy Milestones
  if (sessionData.accuracyScore >= 95 && sessionData.accuracyScore > historicalData.averageAccuracy) {
    achievements.push({
      id: `accuracy_milestone_${Date.now()}`,
      type: 'milestone',
      category: 'accuracy',
      title: 'Excellent Accuracy!',
      description: `You achieved ${sessionData.accuracyScore}% accuracy in this session`,
      icon: '🎯',
      value: sessionData.accuracyScore,
      isNew: true,
      earnedAt: now
    });
  }

  // 4. Streak Achievements
  if (historicalData.currentStreak > 0 && historicalData.currentStreak % 7 === 0) {
    achievements.push({
      id: `streak_milestone_${historicalData.currentStreak}_${Date.now()}`,
      type: 'streak',
      category: 'consistency',
      title: 'Streak Champion!',
      description: `You've maintained a ${historicalData.currentStreak}-day practice streak`,
      icon: '🔥',
      value: historicalData.currentStreak,
      isNew: true,
      earnedAt: now
    });
  }

  // 5. Session Count Milestones
  const milestones = [5, 10, 25, 50, 100, 200, 500];
  if (milestones.includes(historicalData.totalSessions)) {
    achievements.push({
      id: `session_milestone_${historicalData.totalSessions}_${Date.now()}`,
      type: 'milestone',
      category: 'consistency',
      title: 'Practice Milestone!',
      description: `You've completed ${historicalData.totalSessions} practice sessions`,
      icon: '🏆',
      value: historicalData.totalSessions,
      isNew: true,
      earnedAt: now
    });
  }

  return achievements;
}

/**
 * Generate micro-wins for recent achievements to show in greeting
 */
export function generateMicroWins(achievements: Achievement[]): MicroWin[] {
  return achievements
    .filter(a => a.isNew)
    .slice(0, 3) // Show only top 3 recent wins
    .map(achievement => ({
      id: achievement.id,
      type: mapAchievementTypeToMicroWin(achievement.type, achievement.category),
      title: achievement.title,
      message: achievement.description,
      icon: achievement.icon,
      value: achievement.value || achievement.percentage || 0,
      unit: achievement.percentage ? '%' : achievement.type === 'streak' ? 'days' : 'sessions',
      earnedAt: achievement.earnedAt
    }));
}

/**
 * Get the most impressive recent achievement for greeting
 */
export function getMostImpressiveAchievement(achievements: Achievement[]): Achievement | null {
  if (!achievements.length) return null;

  // Priority order: streak > milestone > improvement > accuracy
  const priorityOrder = ['streak', 'milestone', 'improvement', 'accuracy'];
  
  for (const type of priorityOrder) {
    const achievement = achievements.find(a => a.type === type && a.isNew);
    if (achievement) return achievement;
  }

  return achievements.find(a => a.isNew) || null;
}

// Helper functions
function formatCategoryName(category: string): string {
  return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'articles': '📰',
    'verb_tense': '⏰',
    'prepositions': '🔗',
    'pluralization': '📊',
    'pronouns': '👤',
    'subject_verb_agreement': '🤝',
    'word_order': '🔄',
    'run_on_fragment': '✂️',
    'filler_words': '🤐'
  };
  return icons[category] || '💬';
}

function mapAchievementTypeToMicroWin(
  type: Achievement['type'], 
  category: string
): MicroWin['type'] {
  if (type === 'improvement' && category === 'error_reduction') return 'error_reduction';
  if (type === 'improvement') return 'accuracy_improvement';
  if (type === 'streak') return 'streak_milestone';
  if (type === 'milestone') return 'session_count';
  return 'accuracy_improvement';
}