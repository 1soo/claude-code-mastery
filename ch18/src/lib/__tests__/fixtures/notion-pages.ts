// 노션 page 응답 표본(fixture) 빌더.
// 실 API 호출 없이 normalizeQuote 를 검증하기 위한 표본 데이터.
//
// ⚠️ 실제 노션 properties 구조를 정확히 따른다:
//   - properties["견적번호"].type === "title"   (노션 필수 title 프로퍼티)
//   - properties["제목"].type === "rich_text"   (PRD 가정과 반대)
//   - email/number/date/select 는 미입력 시 각 필드가 null
//
// 타입은 @notionhq/client v5 의 PageObjectResponse 를 따른다.

import type {
  PageObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client";

// rich_text/title 항목 1건을 만든다(plain_text 보존 검증용으로 한글도 그대로 담는다).
function richText(text: string): RichTextItemResponse {
  return {
    type: "text",
    text: { content: text, link: null },
    annotations: {
      bold: false,
      italic: false,
      strikethrough: false,
      underline: false,
      code: false,
      color: "default",
    },
    plain_text: text,
    href: null,
  };
}

// 여러 조각으로 나뉜 rich_text 배열(이어붙이기 검증용).
function richTextRuns(...texts: string[]): RichTextItemResponse[] {
  return texts.map(richText);
}

// PageObjectResponse 의 공통(properties 외) 필드를 채운 베이스.
// 정규화 로직은 properties 와 id 만 사용하므로 나머지는 형식상 채운다.
function basePage(id: string): Omit<PageObjectResponse, "properties"> {
  return {
    object: "page",
    id,
    created_time: "2026-06-01T00:00:00.000Z",
    last_edited_time: "2026-06-01T00:00:00.000Z",
    created_by: { object: "user", id: "user-1" },
    last_edited_by: { object: "user", id: "user-1" },
    cover: null,
    icon: null,
    parent: { type: "data_source_id", data_source_id: "ds-1", database_id: "db-1" },
    in_trash: false,
    archived: false,
    is_archived: false,
    is_locked: false,
    url: `https://www.notion.so/${id}`,
    public_url: null,
  } as Omit<PageObjectResponse, "properties">;
}

// 프로퍼티 빌더들. each builder returns the exact union member shape with an id.
function titleProp(text: string) {
  return { id: "p-num", type: "title" as const, title: text === "" ? [] : richTextRuns(text) };
}
function richTextProp(text: string) {
  return { id: "p-rt", type: "rich_text" as const, rich_text: text === "" ? [] : richTextRuns(text) };
}
// 조각난 rich_text(이어붙이기 검증용).
function richTextPropRuns(...texts: string[]) {
  return { id: "p-rt", type: "rich_text" as const, rich_text: richTextRuns(...texts) };
}
function emailProp(email: string | null) {
  return { id: "p-email", type: "email" as const, email };
}
function numberProp(n: number | null) {
  return { id: "p-num2", type: "number" as const, number: n };
}
function dateProp(start: string | null) {
  return {
    id: "p-date",
    type: "date" as const,
    date: start === null ? null : { start, end: null, time_zone: null },
  };
}
function selectProp(name: string | null) {
  return {
    id: "p-sel",
    type: "select" as const,
    select:
      name === null
        ? null
        : { id: "opt-1", name, color: "default" as const },
  };
}

// 케이스 (a): 전 필드 정상.
export const pageAllFilled: PageObjectResponse = {
  ...basePage("page-a"),
  properties: {
    제목: richTextProp("2026년 6월 웹사이트 구축 견적서"),
    견적번호: titleProp("Q-2026-001"),
    고객명: richTextProp("메타넷글로벌"),
    "고객 이메일": emailProp("client@example.com"),
    발행일: dateProp("2026-06-01"),
    유효기간: dateProp("2026-06-30"),
    합계금액: numberProp(3300000),
    상태: selectProp("발행"),
    메모: richTextProp("부가세 포함 금액입니다."),
  },
} as PageObjectResponse;

// 케이스 (b): 제목 rich_text 빈 배열 → '제목 없음' fallback. quoteNumber 도 빈 title → ''.
export const pageEmptyTitle: PageObjectResponse = {
  ...basePage("page-b"),
  properties: {
    제목: richTextProp(""), // 빈 배열
    견적번호: titleProp(""), // 빈 배열 → ''
    고객명: richTextProp(""), // 빈 배열 → ''
    "고객 이메일": emailProp("only@example.com"),
    발행일: dateProp("2026-06-10"),
    유효기간: dateProp(null),
    합계금액: numberProp(0),
    상태: selectProp("검토중"),
    메모: richTextProp(""), // 빈 배열 → ''
  },
} as PageObjectResponse;

// 케이스 (c): email/number/date 가 모두 null(미입력).
export const pageNullNullable: PageObjectResponse = {
  ...basePage("page-c"),
  properties: {
    제목: richTextProp("초안 견적서"),
    견적번호: titleProp("Q-DRAFT"),
    고객명: richTextProp("미정 고객"),
    "고객 이메일": emailProp(null), // null
    발행일: dateProp(null), // null
    유효기간: dateProp(null), // null
    합계금액: numberProp(null), // null
    상태: selectProp("승인"),
    메모: richTextProp("협의 중"),
  },
} as PageObjectResponse;

// 케이스 (d): status 미선택(select null) → null. 매핑 밖 값은 별도 케이스.
export const pageNoStatus: PageObjectResponse = {
  ...basePage("page-d"),
  properties: {
    제목: richTextProp("상태 미지정 견적서"),
    견적번호: titleProp("Q-2026-004"),
    고객명: richTextProp("테스트 고객"),
    "고객 이메일": emailProp("noselect@example.com"),
    발행일: dateProp("2026-06-15"),
    유효기간: dateProp("2026-07-15"),
    합계금액: numberProp(1500000),
    상태: selectProp(null), // 미선택 → null
    메모: richTextProp(""),
  },
} as PageObjectResponse;

// 케이스 (d-2): status 가 매핑에 없는 값 → null(미분류).
export const pageUnknownStatus: PageObjectResponse = {
  ...basePage("page-d2"),
  properties: {
    제목: richTextProp("미분류 상태 견적서"),
    견적번호: titleProp("Q-2026-005"),
    고객명: richTextProp("테스트 고객"),
    "고객 이메일": emailProp(null),
    발행일: dateProp(null),
    유효기간: dateProp(null),
    합계금액: numberProp(null),
    상태: selectProp("보류"), // STATUS_FROM_NOTION 에 없음 → null
    메모: richTextProp(""),
  },
} as PageObjectResponse;

// 케이스 (e): 한글 plain_text 보존 + 조각난 rich_text 이어붙이기 검증.
export const pageKoreanRuns: PageObjectResponse = {
  ...basePage("page-e"),
  properties: {
    // 여러 텍스트 런으로 분할된 제목(서식 적용 등으로 노션이 쪼개는 상황 모사).
    제목: richTextPropRuns("주식회사 ", "한글컴퍼니 ", "견적서 🧾"),
    견적번호: titleProp("견적-2026-한글-001"),
    고객명: richTextProp("홍길동 고객님"),
    "고객 이메일": emailProp("hong@example.kr"),
    발행일: dateProp("2026-06-20"),
    유효기간: dateProp("2026-07-20"),
    합계금액: numberProp(550000),
    상태: selectProp("만료"),
    메모: richTextPropRuns("비고: ", "긴급 ", "처리 요망"),
  },
} as PageObjectResponse;
