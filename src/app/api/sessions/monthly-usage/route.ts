import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const { supabase, user } = await getAuthUser();

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const nowIso = now.toISOString();

    // Fetch all sessions this month (completed and active)
    const { data, error } = await supabase
      .from('sessions')
      .select('duration_seconds, started_at')
      .eq('user_id', user.id)
      .gte('started_at', monthStart);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Sum duration: use duration_seconds for completed, calculate elapsed for active
    const totalSeconds = (data ?? []).reduce((sum, s) => {
      if (s.duration_seconds !== null) {
        return sum + s.duration_seconds;
      }
      // Active session: estimate from started_at to now
      const elapsed = Math.max(
        0,
        Math.floor((new Date(nowIso).getTime() - new Date(s.started_at).getTime()) / 1000),
      );
      return sum + elapsed;
    }, 0);

    return NextResponse.json({ totalSeconds });
  } catch (e) {
    if (e instanceof Response) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
