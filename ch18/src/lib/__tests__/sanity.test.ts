import { describe, expect, it } from "vitest";

// 환경 검증용 sanity 테스트.
// 목적: vitest 환경에서 `@/*` 경로 별칭이 해석되는지 + 기본 동작 검증.
// (후속 작업으로 대체하지 말고 환경 검증용으로 남겨둘 것)
import { cn } from "@/lib/utils";

describe("sanity: vitest 환경 + @/* alias 해석", () => {
  it("@/lib/utils의 cn을 import해 클래스를 병합한다", () => {
    // 기본 병합 동작
    expect(cn("a", "b")).toBe("a b");
  });

  it("cn이 falsy 값을 무시하고 tailwind 중복 클래스를 병합한다", () => {
    // clsx의 조건부 처리 + twMerge의 충돌 해소
    expect(cn("px-2", false && "hidden", "px-4")).toBe("px-4");
  });
});
