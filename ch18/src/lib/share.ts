// 견적서 공유 URL 생성 (단일 소스).
// 공개 상세 페이지의 공유 버튼(F005)과 어드민 테이블 행 액션(F009)이 함께 사용한다.
// UI/브라우저 API/server-only 의존이 없는 순수 함수 → 클라이언트·테스트 양쪽에서 import 가능.
import { siteConfig } from "@/config/site";

// 견적서 상세 절대 URL 을 만든다.
// origin 이 주어지면(클라이언트 클릭 시점의 window.location.origin) 그것을,
// 없으면 siteConfig.url 로 폴백한다. (기존 공유 버튼 동작과 동일하게 인코딩은 하지 않는다.)
export function buildShareUrl(quoteId: string, origin?: string): string {
  return `${origin ?? siteConfig.url}/quotes/${quoteId}`;
}
