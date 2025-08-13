import React from 'react';
import type { Mistake } from './TranscriptWithHighlights';

interface Props {
  mistake: Mistake;
  onRetry?: () => void;
}

const formatCategoryName = (category: string) => {
  return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const getCategoryIcon = (category: string) => {
  const iconMap: Record<string, string> = {
    articles: '📰',
    prepositions: '🔗',
    subject_verb_agreement: '⚖️',
    verb_tense: '⏰',
    word_order: '🔀',
    run_on_fragment: '✂️',
    pluralization: '📊',
    pronouns: '👤',
    filler_words: '🗣️',
    other: '💬'
  };
  return iconMap[category] || '💬';
};

export default function MistakeCard({ mistake, onRetry }: Props) {
  return (
    <div className="card border-l-4 border-l-warning">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-warning/20 rounded-full flex items-center justify-center">
            <span className="text-sm">{getCategoryIcon(mistake.category)}</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-ink">{formatCategoryName(mistake.category)}</h4>
            <span className={`chip mistake-${mistake.category}`}>
              {formatCategoryName(mistake.category)}
            </span>
          </div>
          
          <p className="text-sm text-ink-secondary mb-2 leading-relaxed">
            {mistake.explanation}
          </p>
          
          <div className="bg-primary/5 rounded-1 p-3 border border-primary/20">
            <p className="text-sm text-ink">
              <strong className="text-primary">💡 Try this:</strong> {mistake.suggestion}
            </p>
          </div>
          
          {onRetry && (
            <button
              onClick={onRetry}
              className="btn-secondary !py-2 !px-3 text-sm mt-3"
            >
              Practice This
            </button>
          )}
        </div>
      </div>
    </div>
  );
}