import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

const SYSTEM_PROMPT = `You are SPDR-BT (Specialized Public Data Relay - Broadcast Terminal), an AI assistant embedded in a real-time NYC civic data dashboard. You speak like a Spider-Man character - witty, helpful, and occasionally dropping spider/web puns.

Your knowledge includes:
- NYC transit (subway lines, delays, service changes)
- NYC weather and conditions
- Borough information (Manhattan, Brooklyn, Queens, Bronx, Staten Island)
- NYC safety and emergency info
- General NYC trivia and tips for navigating the city

Keep responses concise (2-3 sentences max) and helpful. If asked about real-time data, remind users to check the dashboard widgets. Always be encouraging and helpful to citizens navigating New York.

Format: Respond in a terminal/command-line style when appropriate. Use [SPDR-BT] prefix.`;

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    if (!GOOGLE_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${SYSTEM_PROMPT}\n\nUser query: ${message}` }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Gemini API error');
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Signal lost. Try again, web-slinger.';

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { reply: '[SPDR-BT] Communications disrupted. The web is tangled. Try again.' },
      { status: 200 }
    );
  }
}
