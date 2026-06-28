---
name: quote-components-structure
description: 견적서 도메인 컴포넌트(quotes/) 구조와 상태 배지 공용화, 상세 페이지 인쇄 컨테이너 규약
metadata:
  type: project
---

견적서 도메인 컴포넌트는 `src/components/quotes/`에 위치한다.

- `status-badge.tsx` (RSC): 상태 배지 단일 소스. `STATUS_BADGE_VARIANT` 매핑 + null fallback("미분류"/outline)을 여기에만 둔다. 라벨은 `quoteStatusLabel`(types.ts) 재사용. 카드(`quote-card.tsx`)·상세(`quote-detail.tsx`)가 공유한다 — 배지 매핑을 컴포넌트마다 중복 정의하지 말 것.
- `quote-detail.tsx` (RSC): 상세 본문. **단일 인쇄 컨테이너 `<article data-print-area>`** 로 본문을 감싼다. Phase 5의 react-to-print가 이 컨테이너를 ref로 인쇄하므로 뒤로가기 Link 등 인쇄 비대상 요소는 article **바깥**에 둔다.
- `quote-card.tsx` (RSC): 목록 카드. 공유 버튼만 클라이언트(`quote-share-button.tsx`).

**Why:** 단일 소스 원칙(shrimp-rules.md). 상태 라벨·배지 매핑 중복 금지.
**How to apply:** 견적서 상태 표기가 필요하면 `<StatusBadge status={...} />` 사용. 새 상세 영역 추가 시 인쇄 대상이면 article 안, 아니면 바깥에 배치.

만료 판정: `date-fns isBefore(new Date(expiresAt), new Date())`. status select의 '만료'(QuoteStatus.expired)와 **별개 개념** — 유효기간 옆에 "기한 만료" Badge(variant destructive)로 상태 배지와 구분 표기. 만료여도 열람 차단하지 않음.

ui/table·separator는 `"use client"` 프리미티브지만 RSC에서 import해 렌더 가능(빌드 통과 확인). badge는 RSC 호환.
