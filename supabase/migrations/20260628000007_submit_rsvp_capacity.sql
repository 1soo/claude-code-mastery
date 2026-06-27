-- submit_rsvp에 정원(capacity) 마감 체크를 보강한다 (대기/waitlist 없음).
-- 시그니처·반환 형태·기존 검증·연타가드·upsert는 모두 그대로 두고,
-- event 조회 시 capacity를 함께 가져와 going 총 인원이 capacity를 넘으면 막는다.
-- 본인의 기존 going은 제외 계산하므로 본인 수정/감소·not_going·maybe 전환은 자연 허용.
create or replace function public.submit_rsvp(
  p_slug text,
  p_name text,
  p_status rsvp_status,
  p_party_size integer,
  p_guest_token text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_event_id uuid;
  v_capacity integer;
  v_others integer;
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

  select id, capacity into v_event_id, v_capacity from public.events where slug = p_slug;
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

  -- 정원 마감 체크: going 전환 시에만, 본인 기존 going은 제외하고 합산.
  if p_status = 'going' and v_capacity is not null then
    v_others := coalesce((
      select sum(party_size) from public.rsvps
      where event_id = v_event_id and status = 'going' and guest_token <> p_guest_token
    ), 0);
    if v_others + p_party_size > v_capacity then
      raise exception '정원이 마감되었습니다';
    end if;
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
$function$;
