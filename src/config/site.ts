import {
  LayoutDashboard,
  Users,
  Settings,
  type LucideIcon,
} from "lucide-react";

// 사이트 전역 메타 정보 (단일 소스)
export const siteConfig = {
  name: "Starter Kit",
  description: "Next.js + TypeScript + Tailwind + shadcn/ui 어드민 스타터킷",
  url: "http://localhost:3000",
} as const;

// 네비게이션 항목 타입
export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

// 사이드바/브레드크럼이 공유하는 네비게이션 정의 (여기 한 곳에서만 관리)
export const mainNav: NavItem[] = [
  {
    title: "대시보드",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "사용자",
    href: "/users",
    icon: Users,
  },
  {
    title: "설정",
    href: "/settings",
    icon: Settings,
  },
];
