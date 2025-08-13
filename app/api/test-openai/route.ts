import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET(req: NextRequest) {
  try {
    // Check if API key exists
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not found' }, { status: 500 });
    }

    const openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 10000 // 10 second timeout
    });

    // Simple test call to OpenAI
    console.log('Testing OpenAI connection...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Say "Hello"' }],
      max_tokens: 5
    });

    return NextResponse.json({ 
      success: true, 
      response: completion.choices[0]?.message?.content,
      apiKeyExists: !!process.env.OPENAI_API_KEY,
      apiKeyStart: process.env.OPENAI_API_KEY?.substring(0, 7) + '...'
    });
  } catch (error: any) {
    console.error('OpenAI test failed:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message,
      type: error.constructor.name,
      apiKeyExists: !!process.env.OPENAI_API_KEY,
      apiKeyStart: process.env.OPENAI_API_KEY?.substring(0, 7) + '...'
    }, { status: 500 });
  }
}