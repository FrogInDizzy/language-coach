/**
 * Daily Quest System - Generate engaging micro-challenges for habit formation
 */

export interface DailyQuest {
  id: string;
  type: 'warmup' | 'mistake_review' | 'vocabulary';
  title: string;
  description: string;
  icon: string;
  target: number;
  progress: number;
  completed: boolean;
  xpReward: number;
  category?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedMinutes: number;
}

export interface QuestProgress {
  questId: string;
  progress: number;
  completed: boolean;
  completedAt?: string;
}

export interface DailyQuestSet {
  date: string;
  quests: DailyQuest[];
  allCompleted: boolean;
  streakShieldEarned: boolean;
  totalXpAvailable: number;
  totalXpEarned: number;
}

export interface UserQuestData {
  level: number;
  streak: number;
  recentMistakes: Array<{
    category: string;
    count: number;
  }>;
  completedSessions: number;
  averageSessionLength: number;
  strongCategories: string[];
  weakCategories: string[];
}

// Vocabulary themes for different levels and contexts
const VOCABULARY_THEMES = {
  beginner: [
    { theme: 'food verbs', words: ['cook', 'eat', 'drink', 'taste', 'serve'] },
    { theme: 'daily actions', words: ['wake up', 'shower', 'work', 'sleep', 'drive'] },
    { theme: 'family terms', words: ['mother', 'father', 'sister', 'brother', 'cousin'] }
  ],
  intermediate: [
    { theme: 'business terms', words: ['negotiate', 'collaborate', 'delegate', 'analyze', 'strategize'] },
    { theme: 'emotions', words: ['frustrated', 'confident', 'anxious', 'grateful', 'overwhelmed'] },
    { theme: 'technology', words: ['synchronize', 'optimize', 'integrate', 'automate', 'customize'] }
  ],
  advanced: [
    { theme: 'academic writing', words: ['substantiate', 'corroborate', 'elucidate', 'synthesize', 'extrapolate'] },
    { theme: 'professional skills', words: ['facilitate', 'streamline', 'consolidate', 'implement', 'orchestrate'] },
    { theme: 'nuanced expressions', words: ['ambivalent', 'pragmatic', 'eloquent', 'discerning', 'resilient'] }
  ]
};

// Mistake categories with user-friendly names and focus areas
const MISTAKE_CATEGORIES = {
  'articles': {
    name: 'Article Usage',
    description: 'Master when to use "a", "an", and "the"',
    icon: '📰',
    commonMistakes: ['missing articles', 'wrong article choice', 'unnecessary articles']
  },
  'verb_tense': {
    name: 'Verb Tenses',
    description: 'Perfect your past, present, and future tenses',
    icon: '⏰',
    commonMistakes: ['wrong tense', 'irregular verbs', 'tense consistency']
  },
  'prepositions': {
    name: 'Prepositions',
    description: 'Navigate in, on, at, by, for, and more',
    icon: '🔗',
    commonMistakes: ['wrong preposition', 'missing preposition', 'extra preposition']
  },
  'subject_verb_agreement': {
    name: 'Subject-Verb Agreement',
    description: 'Ensure subjects and verbs work together',
    icon: '🤝',
    commonMistakes: ['plural/singular mismatch', 'complex subject agreement']
  },
  'word_order': {
    name: 'Sentence Structure',
    description: 'Build clear, well-organized sentences',
    icon: '🔄',
    commonMistakes: ['adjective order', 'question formation', 'complex sentences']
  },
  'pluralization': {
    name: 'Plural Forms',
    description: 'Handle singular and plural nouns correctly',
    icon: '📊',
    commonMistakes: ['irregular plurals', 'uncountable nouns', 'plural markers']
  },
  'pronouns': {
    name: 'Pronoun Usage',
    description: 'Use he, she, it, they, and possessives correctly',
    icon: '👤',
    commonMistakes: ['wrong pronoun', 'unclear reference', 'possessive forms']
  },
  'run_on_fragment': {
    name: 'Sentence Flow',
    description: 'Create complete, well-connected sentences',
    icon: '✂️',
    commonMistakes: ['run-on sentences', 'sentence fragments', 'comma splices']
  },
  'filler_words': {
    name: 'Speaking Fluency',
    description: 'Reduce "um", "uh", and hesitation words',
    icon: '🤐',
    commonMistakes: ['excessive fillers', 'hesitation patterns', 'speech flow']
  }
};

/**
 * Generate three daily quests based on user data and progress
 */
export function generateDailyQuests(
  userData: UserQuestData,
  date: string = new Date().toISOString().split('T')[0]
): DailyQuestSet {
  const quests: DailyQuest[] = [];
  
  // Quest 1: Warm-up Practice (Always present, varies by user level)
  const warmupQuest = generateWarmupQuest(userData);
  quests.push(warmupQuest);
  
  // Quest 2: Mistake Review (Based on recent performance)
  const mistakeQuest = generateMistakeReviewQuest(userData);
  quests.push(mistakeQuest);
  
  // Quest 3: Vocabulary Challenge (Themed learning)
  const vocabularyQuest = generateVocabularyQuest(userData);
  quests.push(vocabularyQuest);
  
  const totalXpAvailable = quests.reduce((sum, quest) => sum + quest.xpReward, 0);
  
  return {
    date,
    quests,
    allCompleted: quests.every(q => q.completed),
    streakShieldEarned: false, // Will be updated based on completion
    totalXpAvailable,
    totalXpEarned: quests.filter(q => q.completed).reduce((sum, quest) => sum + quest.xpReward, 0)
  };
}

/**
 * Generate warm-up quest - quick practice to start the day
 */
function generateWarmupQuest(userData: UserQuestData): DailyQuest {
  const difficulty = getUserDifficulty(userData.level);
  const baseTarget = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4;
  
  const warmupTemplates = [
    {
      title: `${baseTarget}-Minute Speaking Warm-up`,
      description: `Get your voice ready with a quick ${baseTarget}-minute speaking session`,
      target: baseTarget * 60, // seconds
      xpReward: 15,
      estimatedMinutes: baseTarget
    },
    {
      title: `Quick ${baseTarget} Sentence Practice`,
      description: `Speak ${baseTarget} complete sentences to warm up your English`,
      target: baseTarget,
      xpReward: 12,
      estimatedMinutes: 2
    },
    {
      title: `${baseTarget * 30} Second Voice Check`,
      description: `Quick pronunciation practice to start your day strong`,
      target: baseTarget * 30,
      xpReward: 10,
      estimatedMinutes: 1
    }
  ];
  
  const template = warmupTemplates[Math.floor(Math.random() * warmupTemplates.length)];
  
  return {
    id: `warmup_${Date.now()}`,
    type: 'warmup',
    icon: '🌅',
    difficulty,
    progress: 0,
    completed: false,
    category: 'general',
    ...template
  };
}

/**
 * Generate mistake review quest based on user's recent errors
 */
function generateMistakeReviewQuest(userData: UserQuestData): DailyQuest {
  const difficulty = getUserDifficulty(userData.level);
  
  // Find most common mistake category
  const topMistake = userData.recentMistakes[0] || { 
    category: 'articles', 
    count: 1 
  };
  
  const categoryInfo = MISTAKE_CATEGORIES[topMistake.category as keyof typeof MISTAKE_CATEGORIES] || 
                       MISTAKE_CATEGORIES.articles;
  
  const baseTarget = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 7;
  const xpReward = difficulty === 'easy' ? 20 : difficulty === 'medium' ? 25 : 30;
  
  const mistakeTemplates = [
    {
      title: `Fix ${baseTarget} ${categoryInfo.name} Errors`,
      description: `Practice avoiding ${categoryInfo.name.toLowerCase()} mistakes in your speech`,
      target: baseTarget,
      estimatedMinutes: 3
    },
    {
      title: `${categoryInfo.name} Challenge`,
      description: `Focus on ${categoryInfo.description.toLowerCase()} - speak ${baseTarget} error-free sentences`,
      target: baseTarget,
      estimatedMinutes: 4
    },
    {
      title: `Master ${categoryInfo.name}`,
      description: `Demonstrate improvement in ${categoryInfo.name.toLowerCase()} with ${baseTarget} practice rounds`,
      target: baseTarget,
      estimatedMinutes: 5
    }
  ];
  
  const template = mistakeTemplates[Math.floor(Math.random() * mistakeTemplates.length)];
  
  return {
    id: `mistake_${topMistake.category}_${Date.now()}`,
    type: 'mistake_review',
    icon: categoryInfo.icon,
    difficulty,
    progress: 0,
    completed: false,
    category: topMistake.category,
    xpReward,
    ...template
  };
}

/**
 * Generate vocabulary quest with thematic learning
 */
function generateVocabularyQuest(userData: UserQuestData): DailyQuest {
  const difficulty = getUserDifficulty(userData.level);
  
  // Select vocabulary theme based on user level
  const levelKey = userData.level <= 5 ? 'beginner' : 
                   userData.level <= 15 ? 'intermediate' : 'advanced';
  
  const themes = VOCABULARY_THEMES[levelKey];
  const selectedTheme = themes[Math.floor(Math.random() * themes.length)];
  
  const baseTarget = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 5;
  const xpReward = difficulty === 'easy' ? 18 : difficulty === 'medium' ? 22 : 28;
  
  const vocabularyTemplates = [
    {
      title: `Learn ${baseTarget} ${selectedTheme.theme}`,
      description: `Practice using ${baseTarget} new words related to ${selectedTheme.theme} in sentences`,
      target: baseTarget,
      estimatedMinutes: 4
    },
    {
      title: `${selectedTheme.theme.charAt(0).toUpperCase() + selectedTheme.theme.slice(1)} Mastery`,
      description: `Use ${baseTarget} ${selectedTheme.theme} correctly in your speaking practice`,
      target: baseTarget,
      estimatedMinutes: 5
    },
    {
      title: `Expand Your ${selectedTheme.theme} Vocabulary`,
      description: `Demonstrate fluency with ${baseTarget} ${selectedTheme.theme} in conversation`,
      target: baseTarget,
      estimatedMinutes: 6
    }
  ];
  
  const template = vocabularyTemplates[Math.floor(Math.random() * vocabularyTemplates.length)];
  
  return {
    id: `vocabulary_${selectedTheme.theme.replace(/\s+/g, '_')}_${Date.now()}`,
    type: 'vocabulary',
    icon: getVocabularyIcon(selectedTheme.theme),
    difficulty,
    progress: 0,
    completed: false,
    category: selectedTheme.theme,
    xpReward,
    ...template
  };
}

/**
 * Determine user difficulty based on level and performance
 */
function getUserDifficulty(level: number): 'easy' | 'medium' | 'hard' {
  if (level <= 3) return 'easy';
  if (level <= 10) return 'medium';
  return 'hard';
}

/**
 * Get appropriate icon for vocabulary theme
 */
function getVocabularyIcon(theme: string): string {
  const iconMap: Record<string, string> = {
    'food verbs': '🍽️',
    'daily actions': '📅',
    'family terms': '👨‍👩‍👧‍👦',
    'business terms': '💼',
    'emotions': '😊',
    'technology': '💻',
    'academic writing': '📚',
    'professional skills': '🎯',
    'nuanced expressions': '🎭'
  };
  
  return iconMap[theme] || '📖';
}

/**
 * Update quest progress based on user activity
 */
export function updateQuestProgress(
  questId: string, 
  increment: number, 
  quests: DailyQuest[]
): DailyQuest[] {
  return quests.map(quest => {
    if (quest.id === questId) {
      const newProgress = Math.min(quest.progress + increment, quest.target);
      return {
        ...quest,
        progress: newProgress,
        completed: newProgress >= quest.target
      };
    }
    return quest;
  });
}

/**
 * Check if user activity contributes to quest progress
 */
export function getQuestUpdatesFromSession(
  sessionData: {
    durationSeconds: number;
    mistakeCount: number;
    mistakeCategories: string[];
    wordsSpoken: number;
  },
  quests: DailyQuest[]
): Array<{ questId: string; increment: number; reason: string }> {
  const updates: Array<{ questId: string; increment: number; reason: string }> = [];
  
  quests.forEach(quest => {
    if (quest.completed) return;
    
    switch (quest.type) {
      case 'warmup':
        // Warmup quests track speaking time or sentences
        if (quest.title.includes('Minute')) {
          const minutes = Math.floor(sessionData.durationSeconds / 60);
          if (minutes > 0) {
            updates.push({
              questId: quest.id,
              increment: minutes,
              reason: `Spoke for ${minutes} minute${minutes !== 1 ? 's' : ''}`
            });
          }
        } else if (quest.title.includes('Sentence')) {
          const sentences = Math.floor(sessionData.wordsSpoken / 10); // Approximate
          updates.push({
            questId: quest.id,
            increment: sentences,
            reason: `Completed ${sentences} sentence${sentences !== 1 ? 's' : ''}`
          });
        } else {
          // Time-based warm-up
          updates.push({
            questId: quest.id,
            increment: sessionData.durationSeconds,
            reason: `${sessionData.durationSeconds} seconds of speaking`
          });
        }
        break;
        
      case 'mistake_review':
        // Track improvement in specific mistake categories
        const categoryMatches = sessionData.mistakeCategories.filter(
          cat => cat === quest.category
        ).length;
        
        // If few/no mistakes in the target category, award progress
        const previousMistakes = quest.target; // Assume user had issues before
        const improvement = Math.max(0, previousMistakes - categoryMatches);
        
        if (improvement > 0) {
          updates.push({
            questId: quest.id,
            increment: improvement,
            reason: `Improved ${quest.category?.replace(/_/g, ' ')} accuracy`
          });
        }
        break;
        
      case 'vocabulary':
        // Award progress for longer sessions with varied vocabulary
        const complexityBonus = Math.floor(sessionData.wordsSpoken / 20);
        if (complexityBonus > 0) {
          updates.push({
            questId: quest.id,
            increment: Math.min(complexityBonus, quest.target - quest.progress),
            reason: `Used varied vocabulary (${sessionData.wordsSpoken} words)`
          });
        }
        break;
    }
  });
  
  return updates;
}

/**
 * Calculate streak shield eligibility
 */
export function calculateStreakShield(
  completedQuests: number,
  totalQuests: number,
  currentStreak: number
): { earned: boolean; nextMilestone: number } {
  const allCompleted = completedQuests === totalQuests;
  const nextMilestone = Math.ceil((currentStreak + 1) / 7) * 7; // Next multiple of 7
  
  return {
    earned: allCompleted && currentStreak > 0 && currentStreak % 7 === 0,
    nextMilestone
  };
}

/**
 * Generate quest rewards for completion
 */
export function generateQuestRewards(quest: DailyQuest): {
  xp: number;
  streakBonus: number;
  achievements: string[];
} {
  const baseXp = quest.xpReward;
  const streakBonus = Math.floor(baseXp * 0.1); // 10% streak bonus
  
  const achievements: string[] = [];
  
  // Add achievement messages based on quest type
  switch (quest.type) {
    case 'warmup':
      achievements.push('Early Bird! 🌅');
      break;
    case 'mistake_review':
      achievements.push(`${quest.category?.replace(/_/g, ' ')} Master! ⭐`);
      break;
    case 'vocabulary':
      achievements.push('Word Wizard! 📚');
      break;
  }
  
  return {
    xp: baseXp,
    streakBonus,
    achievements
  };
}