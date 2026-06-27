create type public.user_role as enum ('host', 'admin');
alter table public.profiles add column role public.user_role not null default 'host';

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin');
$$;
revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
