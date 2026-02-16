import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const { supabase, user } = await getAuthUser();

    // Get sum of duration_seconds for sessions this month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data, error } = await supabase
      .from('sessions')
      .select('duration_seconds')
      .eq('user_id', user.id)
      .gte('started_at', monthStart)
      .not('duration_seconds', 'is', null);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const totalSeconds = (data ?? []).reduce(
      (sum, s) => sum + (s.duration_seconds ?? 0),
      0,
    );

    return NextResponse.json({ totalSeconds });
  } catch (e) {
    if (e instanceof Response) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
