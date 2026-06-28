-- gen_event_slug에 search_path 고정 추가 (프로젝트 함수 컨벤션 정합 + linter 0011 해소).
-- search_path='' 이므로 pgcrypto의 gen_random_bytes는 extensions 스키마로 정규화.
create or replace function public.gen_event_slug()
returns text
language sql
volatile
set search_path = ''
as $$
  select translate(encode(extensions.gen_random_bytes(16), 'base64'), '+/=', '-_');
$$;
