export interface MockSession {
  id: string;
  date: string;
  duration: number;
  score: number;
  mistakes: Array<{
    category: string;
    count: number;
    examples: string[];
  }>;
  transcript: string;
  feedback: string;
}

export interface MockProgress {
  streak: number;
  currentXP: number;
  level: number;
  dailyGoal: number;
  totalSessions: number;
  averageScore: number;
  improvementAreas: string[];
  recentSessions: MockSession[];
  weeklyStats: Array<{
    week: string;
    sessions: number;
    avgScore: number;
  }>;
}

export const mockProgressData: MockProgress = {
  streak: 7,
  currentXP: 2450,
  level: 5,
  dailyGoal: 100,
  totalSessions: 23,
  averageScore: 87,
  improvementAreas: ['Articles', 'Prepositions', 'Verb Tense'],
  recentSessions: [
    {
      id: '1',
      date: '2024-01-15',
      duration: 180,
      score: 92,
      mistakes: [
        {
          category: 'articles',
          count: 1,
          examples: ['I went to *the* store yesterday']
        }
      ],
      transcript: 'I went to store yesterday and bought some groceries.',
      feedback: 'Great job! Just remember to use "the" before specific nouns.'
    },
    {
      id: '2', 
      date: '2024-01-14',
      duration: 165,
      score: 85,
      mistakes: [
        {
          category: 'prepositions',
          count: 2,
          examples: ['I arrived *at* the meeting', 'The book is *on* the table']
        }
      ],
      transcript: 'I arrived in the meeting and put the book at the table.',
      feedback: 'Good progress! Pay attention to preposition usage.'
    },
    {
      id: '3',
      date: '2024-01-13', 
      duration: 200,
      score: 78,
      mistakes: [
        {
          category: 'verb_tense',
          count: 3,
          examples: ['I *have been* working', 'She *went* to school', 'They *will arrive* soon']
        }
      ],
      transcript: 'I am working here for three years and she goes to school yesterday.',
      feedback: 'Focus on matching verb tenses with the time context.'
    }
  ],
  weeklyStats: [
    { week: 'This week', sessions: 5, avgScore: 89 },
    { week: 'Last week', sessions: 7, avgScore: 85 },
    { week: '2 weeks ago', sessions: 6, avgScore: 82 },
    { week: '3 weeks ago', sessions: 5, avgScore: 79 }
  ]
};

export const mockTodaysSessions: MockSession[] = [
  {
    id: 'today-1',
    date: new Date().toISOString().split('T')[0],
    duration: 195,
    score: 94,
    mistakes: [
      {
        category: 'filler_words',
        count: 2,
        examples: ['Remove excessive "um" and "uh"']
      }
    ],
    transcript: 'Um, I think the weather is, uh, really nice today.',
    feedback: 'Excellent clarity! Try to reduce filler words for more confident speech.'
  }
];

export const mockRecentMistakes = [
  {
    category: 'articles',
    count: 12,
    percentage: 25,
    trend: 'improving',
    examples: [
      'I went to *the* store',
      'She is *a* teacher', 
      'Do you have *an* apple?'
    ]
  },
  {
    category: 'prepositions', 
    count: 8,
    percentage: 18,
    trend: 'stable',
    examples: [
      'I arrived *at* the meeting',
      'The book is *on* the table',
      'She lives *in* New York'
    ]
  },
  {
    category: 'verb_tense',
    count: 6,
    percentage: 15,
    trend: 'worsening',
    examples: [
      'I *have been* working here for 3 years',
      'She *went* to school yesterday',
      'They *will arrive* tomorrow'
    ]
  }
];