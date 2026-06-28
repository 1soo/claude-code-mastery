create or replace function public.get_my_rsvp(p_slug text, p_guest_token text)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'id', r.id, 'name', r.name, 'status', r.status,
    'party_size', r.party_size, 'created_at', r.created_at
  )
  from public.rsvps r
  join public.events e on e.id = r.event_id
  where e.slug = p_slug and r.guest_token = p_guest_token;
$$;
revoke execute on function public.get_my_rsvp(text, text) from public;
grant execute on function public.get_my_rsvp(text, text) to anon, authenticated;
