-- 1) profiles 테이블
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  username text unique,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (id),
  constraint username_length check (char_length(username) >= 3)
);

comment on table public.profiles is '회원가입 사용자의 프로필 정보. auth.users와 1:1 연결.';

-- 2) RLS 활성화
alter table public.profiles enable row level security;

-- 3) RLS 정책 (본인만 조회/삽입/수정/삭제)
create policy "본인 프로필 조회" on public.profiles
  for select using ((select auth.uid()) = id);

create policy "본인 프로필 삽입" on public.profiles
  for insert with check ((select auth.uid()) = id);

create policy "본인 프로필 수정" on public.profiles
  for update using ((select auth.uid()) = id);

create policy "본인 프로필 삭제" on public.profiles
  for delete using ((select auth.uid()) = id);

-- 4) 회원가입 시 프로필 자동 생성 트리거
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5) updated_at 자동 갱신 트리거
create function public.handle_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_profiles_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- 6) 트리거 전용 함수의 REST API(RPC) 직접 호출 권한 회수 (보안 강화)
revoke execute on function public.handle_new_user() from anon, authenticated, public;
revoke execute on function public.handle_updated_at() from anon, authenticated, public;
