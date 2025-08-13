import OpenAI from 'openai';

// This module contains helper functions for transcribing audio and analysing
// grammar mistakes.  It uses the OpenAI API for both Whisper (speech to text)
// and GPT‑4 to classify mistakes and generate coaching feedback.

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Build the classification prompt for the chat model.
 * It instructs the model to return strict JSON with mistakes and counts.
 */
function buildClassificationPrompt(transcript: string): string {
  // List of categories must mirror the enum defined in schema.sql.
  const categories = [
    'articles',
    'prepositions',
    'subject_verb_agreement',
    'verb_tense',
    'word_order',
    'run_on_fragment',
    'pluralization',
    'pronouns',
    'comparatives_superlatives',
    'conditionals',
    'modals',
    'filler_words',
    'other'
  ];
  return `TRANSCRIPT:\n${transcript}\n\nTASKS:\n1) Identify mistakes (max 30) with fields:\n   - category: one of ${categories.join(', ')}\n   - span: {start_char, end_char, text}\n   - severity: 1(low)–5(high)\n   - explanation: short\n   - suggestion: corrected phrase/sentence\n2) Summarise patterns: top 3 categories with counts.\n3) One‑sentence encouragement.\n\nRETURN JSON:\n{\n  "mistakes": [...],\n  "per_category_counts": {"articles": 3, ...},\n  "summary": "..."\n}`;
}

/**
 * Call Whisper to transcribe an audio file hosted at the given signed URL.
 * This is a thin wrapper around the OpenAI Speech to Text API.
 */
export async function transcribeAudioUrl(audioUrl: string): Promise<{ transcript: string; durationSeconds: number; }> {
  try {
    // Download the audio file
    console.log('Downloading audio from:', audioUrl);
    const response = await fetch(audioUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to download audio: ${response.status} ${response.statusText}`);
    }
    
    const buffer = await response.arrayBuffer();
    console.log('Audio buffer size:', buffer.byteLength);
    
    // Create a proper file object for OpenAI
    const blob = new Blob([buffer], { type: 'audio/webm' });
    
    // Add filename property to blob
    Object.defineProperty(blob, 'name', {
      value: 'audio.webm',
      writable: false
    });
    
    console.log('Calling OpenAI Whisper API...');
    const transcription = await openai.audio.transcriptions.create({
      file: blob as any,
      model: process.env.WHISPER_MODEL ?? 'whisper-1'
    });
    
    console.log('Transcription successful');
    return { transcript: transcription.text, durationSeconds: 0 };
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
}

/**
 * Analyse a transcript using the chat model and return structured feedback.
 */
export async function analyseTranscript(transcript: string) {
  const systemMessage = {
    role: 'system' as const,
    content: 'You classify English grammar mistakes for non‑native speakers. Output strict JSON matching the schema. No extra text.'
  };
  const userPrompt = buildClassificationPrompt(transcript);
  const userMessage = { role: 'user' as const, content: userPrompt };

  const resp = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [systemMessage, userMessage]
  });
  const content = resp.choices[0]?.message?.content ?? '{}';
  return JSON.parse(content);
}
