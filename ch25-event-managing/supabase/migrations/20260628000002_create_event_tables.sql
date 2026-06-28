create extension if not exists pgcrypto;

create type public.rsvp_status as enum ('going', 'not_going', 'maybe');

create or replace function public.gen_event_slug()
returns text language sql volatile as $$
  select translate(encode(gen_random_bytes(16), 'base64'), '+/=', '-_');
$$;

create table public.events (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references auth.users on delete cascade,
  slug text not null unique default public.gen_event_slug(),
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location text,
  capacity int,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events on delete cascade,
  guest_token text not null,
  name text not null,
  status public.rsvp_status not null,
  party_size int not null default 1,
  created_at timestamptz not null default now(),
  unique (event_id, guest_token)
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_events_host_id on public.events(host_id);
create index if not exists idx_rsvps_event_id on public.rsvps(event_id);
create index if not exists idx_announcements_event_id on public.announcements(event_id);

create trigger on_events_updated before update on public.events
  for each row execute procedure public.handle_updated_at();
