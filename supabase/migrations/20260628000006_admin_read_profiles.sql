-- 관리자가 전체 이벤트의 주최자 표시명(profiles.full_name)을 읽을 수 있도록 RLS 보강.
-- 기존 "본인 프로필 조회" 정책과 OR로 합쳐진다. is_admin()은 SECURITY DEFINER라
-- profiles를 정책 우회로 읽으므로 정책 평가 재귀가 발생하지 않는다.
create policy "admin 전체 프로필 조회" on public.profiles
  for select using (public.is_admin());
