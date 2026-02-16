-- Monthly usage tracking RPC function
CREATE OR REPLACE FUNCTION public.get_monthly_usage(
  user_uuid UUID,
  target_month DATE DEFAULT CURRENT_DATE
)
RETURNS INTERVAL AS $$
  SELECT COALESCE(
    SUM(
      COALESCE(ended_at, now()) - started_at
    ),
    INTERVAL '0 seconds'
  )
  FROM public.sessions
  WHERE user_id = user_uuid
    AND started_at >= date_trunc('month', target_month)
    AND started_at < date_trunc('month', target_month) + INTERVAL '1 month';
$$ LANGUAGE sql SECURITY DEFINER;
