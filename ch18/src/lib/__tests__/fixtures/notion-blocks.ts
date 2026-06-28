// 노션 본문 block 응답 표본(fixture) 빌더.
// parseQuoteItems 검증용. 실 API 호출 없이 BlockObjectResponse[] 를 구성한다.

import type {
  BlockObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client";

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

// 블록 공통(타입별 페이로드 외) 필드.
function blockBase(id: string) {
  return {
    object: "block" as const,
    id,
    parent: { type: "page_id" as const, page_id: "page-1" },
    created_time: "2026-06-01T00:00:00.000Z",
    last_edited_time: "2026-06-01T00:00:00.000Z",
    created_by: { object: "user" as const, id: "user-1" },
    last_edited_by: { object: "user" as const, id: "user-1" },
    has_children: false,
    in_trash: false,
    archived: false,
  };
}

// 여러 plain_text 조각으로 나뉜 code 블록을 만든다(이어붙이기 검증).
export function codeBlock(...textRuns: string[]): BlockObjectResponse {
  return {
    ...blockBase("block-code"),
    type: "code",
    code: {
      rich_text: textRuns.map(richText),
      caption: [],
      language: "json",
    },
  } as BlockObjectResponse;
}

// code 가 아닌 단락 블록(파서가 무시해야 하는 노이즈).
export function paragraphBlock(text: string): BlockObjectResponse {
  return {
    ...blockBase("block-para"),
    type: "paragraph",
    paragraph: {
      rich_text: text === "" ? [] : [richText(text)],
      color: "default",
    },
  } as BlockObjectResponse;
}

// JSON 문자열 하나를 단일 런 code 블록으로 감싼다(가장 흔한 케이스).
export function codeBlockFromJson(json: string): BlockObjectResponse {
  return codeBlock(json);
}
