import React from 'react';

export interface Mistake {
  category: string;
  span: { start_char: number; end_char: number; text: string };
  explanation: string;
  suggestion: string;
  severity: number;
}

interface Props {
  transcript: string;
  mistakes: Mistake[];
}

// Assign each category a distinct CSS class.  Feel free to customise colours.
const categoryStyles: Record<string, string> = {
  articles: 'bg-yellow-200',
  prepositions: 'bg-green-200',
  subject_verb_agreement: 'bg-red-200',
  verb_tense: 'bg-blue-200',
  word_order: 'bg-purple-200',
  run_on_fragment: 'bg-pink-200',
  pluralization: 'bg-indigo-200',
  pronouns: 'bg-teal-200',
  comparatives_superlatives: 'bg-orange-200',
  conditionals: 'bg-gray-200',
  modals: 'bg-lime-200',
  filler_words: 'bg-rose-200',
  other: 'bg-slate-200'
};

export default function TranscriptWithHighlights({ transcript, mistakes }: Props) {
  if (!transcript) return null;
  // Sort mistakes by start_char to highlight sequentially
  const sorted = [...mistakes].sort((a, b) => a.span.start_char - b.span.start_char);
  const segments: React.ReactNode[] = [];
  let cursor = 0;
  sorted.forEach((mistake, index) => {
    const { start_char, end_char } = mistake.span;
    if (start_char > cursor) {
      segments.push(<span key={`plain-${index}-${cursor}`}>{transcript.slice(cursor, start_char)}</span>);
    }
    const style = categoryStyles[mistake.category] || 'bg-yellow-100';
    segments.push(
      <span key={`highlight-${index}`} className={`px-1 ${style}`} title={`${mistake.category}: ${mistake.explanation}`}>
        {transcript.slice(start_char, end_char)}
      </span>
    );
    cursor = end_char;
  });
  if (cursor < transcript.length) {
    segments.push(<span key={`tail`}>{transcript.slice(cursor)}</span>);
  }
  return <p className="whitespace-pre-wrap leading-relaxed">{segments}</p>;
}