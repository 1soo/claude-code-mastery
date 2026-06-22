import { FileText, type LucideIcon } from "lucide-react";

// 사이트 전역 메타 정보 (단일 소스)
export const siteConfig = {
  name: "견적서 공유",
  description: "노션 기반 견적서를 웹에서 확인하고 PDF로 저장하는 공유 서비스",
  url: "http://localhost:3000",
} as const;

// 네비게이션 항목 타입
export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

// 앱 네비게이션 정의 (헤더·링크가 공유하는 단일 소스).
// 견적서 앱은 인증 없는 공개 2페이지 구조이므로 진입점인 목록 페이지만 노출한다.
export const mainNav: NavItem[] = [
  {
    title: "견적서 목록",
    href: "/",
    icon: FileText,
  },
];
