import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';

export async function POST() {
  try {
    await getAuthUser();

    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Deepgram API key not configured' }, { status: 500 });
    }

    const res = await fetch('https://api.deepgram.com/v1/auth/grant', {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        time_to_live_in_seconds: 600,
      }),
    });

    if (res.status === 429) {
      const retryAfter = res.headers.get('Retry-After') ?? '5';
      return NextResponse.json(
        { error: 'Rate limited', retryAfter: Number(retryAfter) },
        { status: 429 },
      );
    }

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Deepgram token request failed: ${text}` },
        { status: 502 },
      );
    }

    const data = await res.json();

    return NextResponse.json({
      token: data.access_token ?? data.token,
      expiresIn: 600,
    });
  } catch (e) {
    if (e instanceof Response) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
