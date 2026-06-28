# 노션 데이터베이스 구조 (검증 완료본)

> Phase 0-T2 검증 산출물. 실제 노션 DB(data source `invoices`)를 조회해 확정한 구조다.
> 코드 매핑은 `src/lib/notion-schema.ts`가 단일 소스이며, 이 문서는 운영자 셋업 가이드 겸 근거 기록이다.

## ID 체계 (2025-09-03 API)

- **database ID**: `387de2a3-846c-8050-9ae2-e5a99575084a` (컨테이너)
- **data source ID**: `387de2a3-846c-80a4-97a2-000bf4b4b3f7` (name: `invoices`) ← **쿼리 대상, `NOTION_DATA_SOURCE_ID`에 넣을 값**
- 통합(integration): `claude-lecture` (bot) — DB에 연결(공유)됨 ✅
- 환경변수 `NOTION_DATA_SOURCE_ID`에는 **data source ID**를 넣는다. database ID를 넣으면 `object_not_found` 발생.

## 프로퍼티(헤더 9필드) — 실측 결과

| 노션 프로퍼티명 | 실제 타입 | 코드 필드 | 비고 |
|---|---|---|---|
| `제목` | **rich_text** | `title` | ⚠️ PRD는 title로 가정했으나 실제는 rich_text |
| `견적번호` | **title** | `quoteNumber` | ⚠️ 노션 필수 title 프로퍼티를 견적번호로 사용 |
| `고객명` | rich_text | `clientName` | |
| `고객 이메일` | email | `clientEmail` | 이름에 **공백 포함** |
| `발행일` | date | `issuedAt` | |
| `유효기간` | date | `expiresAt` | |
| `합계금액` | number | `totalAmount` | VAT 포함 |
| `상태` | select | `status` | 옵션 4종(아래) |
| `메모` | rich_text | `memo` | |

> **핵심 주의**: `제목`(rich_text) ↔ `견적번호`(title) 타입이 PRD 가정과 **반대**다.
> `normalizeQuote`는 노션 **title 프로퍼티에서 `quoteNumber`**, **rich_text `제목`에서 `title`**을 추출해야 한다.

## 상태(select) 옵션 → enum

| 노션 옵션값 | 코드값 |
|---|---|
| `발행` | `issued` |
| `검토중` | `reviewing` |
| `승인` | `approved` |
| `만료` | `expired` |
| (미선택) | `null` (미분류) |

4개 옵션 모두 PRD/`types.ts`와 일치 ✅ (노션상 표시 순서만 만료/승인/검토중/발행).

## 견적 항목 — 본문 JSON 코드 블록 (방식 A 확정)

페이지 본문에 language=`json` 코드 블록 1개로 저장:

```json
[
  { "name": "품목명", "quantity": 1, "unitPrice": 1500000, "amount": 1500000, "note": "선택" }
]
```

- `note`만 선택, 나머지 필수. `amount`는 `quantity × unitPrice`로 파서에서 검산·보정.
- 파싱: 본문 code 블록 → `rich_text[].plain_text` 이어붙임 → `JSON.parse` → 스키마 가드 → 실패 시 `[]` fallback.

## 미해결 / 후속

- **DB에 견적 데이터 0건** — 견적 행 기반 한글 `plain_text` 보존은 행 추가 후 Phase 1/2에서 재확인 필요(스키마 한글명 보존은 확인됨).
- 발행자(회사) 정보·세액 분리 표시는 ROADMAP 미해결 질문 3·4번 참조(현재 9필드 구조엔 영향 없음).
