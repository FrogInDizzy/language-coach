import React from 'react';

interface WeeklyGoal {
  week_of: string;
  focus_categories: string[];
  narrative: string;
  metrics?: any;
}

const formatCategoryName = (category: string) => {
  return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default function WeeklyFocus({ goal }: { goal?: WeeklyGoal | null }) {
  if (!goal) return null;
  
  return (
    <div className="card bg-primary/5 border-primary/20">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-lg">🎯</span>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-ink mb-2 font-display">This Week's Focus</h3>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {goal.focus_categories.map((category, idx) => (
              <span key={idx} className={`chip mistake-${category}`}>
                {formatCategoryName(category)}
              </span>
            ))}
          </div>
          
          <p className="text-ink-secondary text-sm leading-relaxed">{goal.narrative}</p>
          
          {/* Progress indicator placeholder */}
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full w-1/3"></div>
            </div>
            <span className="text-xs text-ink-secondary">33% complete</span>
          </div>
        </div>
      </div>
    </div>
  );
}