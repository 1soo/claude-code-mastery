// 견적서 공유 URL 생성 순수 함수 단위 테스트.
// UI/브라우저 의존 없이 입력→출력만 검증한다.
import { describe, it, expect } from "vitest";

import { buildShareUrl } from "@/lib/share";
import { siteConfig } from "@/config/site";

describe("buildShareUrl", () => {
  it("origin 이 주어지면 `${origin}/quotes/${id}` 를 생성한다", () => {
    expect(buildShareUrl("abc123", "https://example.com")).toBe(
      "https://example.com/quotes/abc123",
    );
  });

  it("origin 생략 시 siteConfig.url 로 폴백한다", () => {
    expect(buildShareUrl("abc123")).toBe(
      `${siteConfig.url}/quotes/abc123`,
    );
  });

  it("origin 이 undefined 면 siteConfig.url 로 폴백한다", () => {
    expect(buildShareUrl("abc123", undefined)).toBe(
      `${siteConfig.url}/quotes/abc123`,
    );
  });

  it("UUID 형태 id 를 그대로 경로에 넣는다", () => {
    const id = "550e8400-e29b-41d4-a716-446655440000";
    expect(buildShareUrl(id, "https://example.com")).toBe(
      `https://example.com/quotes/${id}`,
    );
  });

  it("빈 quoteId 면 경로 끝이 '/quotes/' 로 끝난다 (인코딩/검증 없이 기존 동작 유지)", () => {
    expect(buildShareUrl("", "https://example.com")).toBe(
      "https://example.com/quotes/",
    );
  });

  it("특수문자 포함 id 는 인코딩하지 않고 그대로 둔다 (기존 공개 버튼 동작과 일치)", () => {
    // 기존 인라인 구현이 encodeURIComponent 를 쓰지 않았으므로 그 동작을 그대로 검증한다.
    expect(buildShareUrl("a b/c?d", "https://example.com")).toBe(
      "https://example.com/quotes/a b/c?d",
    );
  });
});
