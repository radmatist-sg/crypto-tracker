-- keepalive_ping.sql
--
-- Supabase pauses Free Plan projects after ~7 days of low database activity.
-- InvestTrack has never paused because it gets used most days, but that is a
-- habit, not a guarantee — two quiet weeks and it pauses like any other.
--
-- A pause here is an inconvenience rather than a disaster: every device keeps a
-- full copy in localStorage and Supabase is only the sync layer, so nothing is
-- lost, sync just errors until the project is restored. The reason to bother is
-- that the ping is already running for the Character Sheet project, so covering
-- this one too costs one extra line in the Worker.
--
-- Run this in the SQL editor of project ecybxggndoqmumxagtoe.
--
-- Note this database's tables are RLS-locked to authenticated users, so the
-- anon key cannot read any of them — an anon REST call would be REJECTED, and
-- a rejected call may not count as activity. Hence a function anon is allowed
-- to execute, which touches no data and always succeeds.

create or replace function rq_ping()
returns timestamptz
language sql
security definer set search_path = public as $$
  select now();
$$;

grant execute on function rq_ping() to anon;
