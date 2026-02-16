-- Get monthly usage in seconds for a user
create or replace function public.get_monthly_usage(target_user_id uuid)
returns int as $$
  select coalesce(sum(duration_seconds), 0)::int
  from public.sessions
  where user_id = target_user_id
    and started_at >= date_trunc('month', now())
    and started_at < date_trunc('month', now()) + interval '1 month';
$$ language sql security definer;
