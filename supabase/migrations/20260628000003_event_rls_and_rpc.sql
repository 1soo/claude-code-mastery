-- RLS 활성화
alter table public.events enable row level security;
alter table public.rsvps enable row level security;
alter table public.announcements enable row level security;

-- events: host 본인 CRUD + admin 읽기 (공개 SELECT 정책 없음 → enumerate 차단)
create policy "host 본인 이벤트 조회" on public.events for select using ((select auth.uid()) = host_id);
create policy "host 본인 이벤트 삽입" on public.events for insert with check ((select auth.uid()) = host_id);
create policy "host 본인 이벤트 수정" on public.events for update using ((select auth.uid()) = host_id);
create policy "host 본인 이벤트 삭제" on public.events for delete using ((select auth.uid()) = host_id);
create policy "admin 전체 이벤트 조회" on public.events for select using (public.is_admin());

-- rsvps: 주최자 본인 이벤트 rsvp 조회 + admin 읽기 (anon insert/update 정책 없음 → RPC만)
create policy "주최자 본인 이벤트 rsvp 조회" on public.rsvps for select using (
  event_id in (select id from public.events where host_id = (select auth.uid()))
);
create policy "admin 전체 rsvp 조회" on public.rsvps for select using (public.is_admin());

-- announcements: host 본인 이벤트 작성/조회 + admin 읽기 (공개 읽기는 RPC가 처리)
create policy "host 본인 이벤트 공지 작성" on public.announcements for insert with check (
  event_id in (select id from public.events where host_id = (select auth.uid()))
);
create policy "host 본인 이벤트 공지 조회" on public.announcements for select using (
  event_id in (select id from public.events where host_id = (select auth.uid()))
);
create policy "admin 전체 공지 조회" on public.announcements for select using (public.is_admin());

-- 공개 조회 RPC: slug로 event(host_id 제거)+announcements(최신순)+rsvps(guest_token 제외) 묶음
create or replace function public.get_public_event(p_slug text)
returns jsonb language sql stable security definer set search_path = '' as $$
  select case when e.id is null then null else jsonb_build_object(
    'event', to_jsonb(e) - 'host_id',
    'announcements', coalesce((
      select jsonb_agg(to_jsonb(a) order by a.created_at desc)
      from public.announcements a where a.event_id = e.id
    ), '[]'::jsonb),
    'rsvps', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', r.id, 'name', r.name, 'status', r.status,
        'party_size', r.party_size, 'created_at', r.created_at
      ) order by r.created_at)
      from public.rsvps r where r.event_id = e.id
    ), '[]'::jsonb)
  ) end
  from public.events e
  where e.slug = p_slug;
$$;
revoke execute on function public.get_public_event(text) from public;
grant execute on function public.get_public_event(text) to anon, authenticated;

-- RSVP 제출 RPC: slug 검증 후 (event_id, guest_token) upsert
create or replace function public.submit_rsvp(
  p_slug text, p_name text, p_status public.rsvp_status,
  p_party_size int, p_guest_token text
) returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_event_id uuid;
  v_row public.rsvps;
begin
  if p_guest_token is null or char_length(p_guest_token) < 16 then
    raise exception 'invalid guest token';
  end if;
  if char_length(coalesce(trim(p_name), '')) = 0 then
    raise exception 'name required';
  end if;
  if p_party_size < 1 or p_party_size > 20 then
    raise exception 'invalid party size';
  end if;

  select id into v_event_id from public.events where slug = p_slug;
  if v_event_id is null then
    raise exception 'event not found';
  end if;

  if exists (
    select 1 from public.rsvps
    where event_id = v_event_id and guest_token = p_guest_token
      and created_at > now() - interval '2 seconds'
  ) then
    raise exception 'too many requests';
  end if;

  insert into public.rsvps (event_id, guest_token, name, status, party_size)
  values (v_event_id, p_guest_token, trim(p_name), p_status, p_party_size)
  on conflict (event_id, guest_token)
  do update set name = excluded.name, status = excluded.status, party_size = excluded.party_size
  returning * into v_row;

  return jsonb_build_object(
    'id', v_row.id, 'name', v_row.name, 'status', v_row.status,
    'party_size', v_row.party_size, 'created_at', v_row.created_at
  );
end;
$$;
revoke execute on function public.submit_rsvp(text, text, public.rsvp_status, int, text) from public;
grant execute on function public.submit_rsvp(text, text, public.rsvp_status, int, text) to anon, authenticated;
