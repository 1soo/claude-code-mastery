---
name: reference-notion-data-source-migration
description: Notion API 2025-09-03 데이터 소스 모델 전환 — 신규 프로젝트의 올바른 쿼리 방식
metadata:
  type: reference
---

Notion API는 2025-09-03 버전부터 database(컨테이너)와 data source(쿼리 대상)를 분리함 ([FACT], developers.notion.com 확인 2026-06-23).

- 쿼리 엔드포인트 이동: `databases.query(database_id)` → `dataSources.query(data_source_id)`.
- `@notionhq/client` **v5.0.0+** 필요(이하 버전은 `notion.request()` 수동 호출).
- `Notion-Version: 2025-09-03` 헤더 사용.
- data source ID는 Get Database로 1회 조회 후 env var(예: `NOTION_DATA_SOURCE_ID`)로 고정 권장(ISR 페이지마다 discovery 호출 회피).
- Rate limit: 통합당 평균 3 req/s, 429 반환. ISR 캐시 쓰는 소규모 프로젝트엔 비이슈.

출처: https://developers.notion.com/docs/upgrade-guide-2025-09-03
