import { createClient } from '@/lib/supabase/server';

export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Response('Unauthorized', { status: 401 });
  }
  return { supabase, user };
}
