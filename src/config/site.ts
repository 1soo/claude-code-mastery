import { FileText, LayoutDashboard, type LucideIcon } from "lucide-react";

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
  // 공개/어드민 구분. 어드민 사이드바는 이 필드로 그룹을 나눠 렌더할 수 있다.
  section?: "public" | "admin";
}

// 앱 네비게이션 정의 (헤더·사이드바·링크가 공유하는 단일 소스).
// 공개 페이지와 어드민 페이지 항목을 한 소스에 혼재한다 (section 으로 구분).
export const mainNav: NavItem[] = [
  {
    title: "견적서 목록",
    href: "/",
    icon: FileText,
    section: "public",
  },
  {
    title: "견적 관리",
    href: "/admin/quotes",
    icon: LayoutDashboard,
    section: "admin",
  },
];
