---
name: recurring-patterns
description: ch13 코드베이스 전체 리뷰에서 발견된 반복 이슈 패턴 및 주의사항
metadata:
  type: project
---

# 반복 발생 패턴 및 주의사항

## 1. 날짜 파싱 패턴 (Critical)
- **위치:** `columns.tsx:70`, `recent-sales.tsx:44`
- **패턴:** `new Date(isoString)` 직접 사용
- **문제:** YYYY-MM-DD 형식은 UTC 파싱 → KST에서 하루 빠르게 표시, Safari에서 Invalid Date
- **올바른 패턴:** `parseISO(isoString)` from date-fns 사용

## 2. 비동기 에러 무시 (Critical)
- **위치:** `columns.tsx:88`
- **패턴:** `navigator.clipboard.writeText()` Promise 반환값 무시
- **올바른 패턴:** try/catch + sonner toast로 성공/실패 피드백 제공

## 3. StatCard 절대 위치 아이콘 (High)
- **위치:** `stat-card.tsx:24`
- **패턴:** `absolute right-6 top-6` 아이콘에 부모 `relative` 미보장
- **올바른 패턴:** CardHeader를 flex row로 변경

## 4. 잘 사용된 패턴들 (참고)
- `useSyncExternalStore`로 하이드레이션 안전한 미디어 쿼리 구현
- `Intl.NumberFormat` 으로 통화 포맷 (바퀴 재발명 없음)
- CSS 변수 `var(--chart-*)` 기반 다크모드 차트 색상
- `"use no memo"` 지시어로 React Compiler / TanStack Table 호환성 처리

## 5. 미구현 기능 (데모 한계)
- 알림 탭 Switch: uncontrolled 상태, 저장 버튼 없음 (settings-form.tsx)
- "상세 보기", "삭제" 드롭다운 메뉴 액션 미구현 (columns.tsx)
- AppHeader의 "프로필", "로그아웃" 메뉴 액션 미구현 (app-header.tsx)
- 인증/인가 로직 전무 (스타터킷이므로 의도적)

**How to apply:** 날짜 파싱 코드 작성 시 항상 parseISO 사용 여부 확인, 클립보드/fetch 등 비동기 API에 반드시 에러 핸들링 추가.
