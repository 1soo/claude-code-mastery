// 스타터킷 데모용 샘플 데이터 (실제 API 연동 시 교체)

import { DollarSign, Users, CreditCard, Activity } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// 통계 카드
export interface Stat {
  title: string;
  value: string;
  change: number; // 전월 대비 증감률(%)
  icon: LucideIcon;
}

export const stats: Stat[] = [
  { title: "총 매출", value: "₩45,231,890", change: 20.1, icon: DollarSign },
  { title: "신규 사용자", value: "+2,350", change: 18.1, icon: Users },
  { title: "판매 건수", value: "+12,234", change: 19.0, icon: CreditCard },
  { title: "활성 세션", value: "573", change: -4.3, icon: Activity },
];

// 월별 차트 데이터
export interface MonthlyData {
  month: string;
  revenue: number;
  orders: number;
}

export const monthlyData: MonthlyData[] = [
  { month: "1월", revenue: 4000, orders: 240 },
  { month: "2월", revenue: 3000, orders: 198 },
  { month: "3월", revenue: 5000, orders: 320 },
  { month: "4월", revenue: 4780, orders: 290 },
  { month: "5월", revenue: 5890, orders: 410 },
  { month: "6월", revenue: 4390, orders: 305 },
  { month: "7월", revenue: 6490, orders: 480 },
];

// 사용자 목록
export type UserRole = "관리자" | "편집자" | "뷰어";
export type UserStatus = "활성" | "비활성" | "대기";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string; // ISO 날짜
}

export const users: User[] = [
  { id: "u_01", name: "김민준", email: "minjun@example.com", role: "관리자", status: "활성", createdAt: "2025-11-02" },
  { id: "u_02", name: "이서윤", email: "seoyun@example.com", role: "편집자", status: "활성", createdAt: "2025-12-15" },
  { id: "u_03", name: "박지호", email: "jiho@example.com", role: "뷰어", status: "대기", createdAt: "2026-01-09" },
  { id: "u_04", name: "최하은", email: "haeun@example.com", role: "편집자", status: "비활성", createdAt: "2026-02-21" },
  { id: "u_05", name: "정도윤", email: "doyun@example.com", role: "뷰어", status: "활성", createdAt: "2026-03-03" },
  { id: "u_06", name: "강수아", email: "sua@example.com", role: "관리자", status: "활성", createdAt: "2026-03-18" },
  { id: "u_07", name: "조은우", email: "eunwoo@example.com", role: "뷰어", status: "대기", createdAt: "2026-04-07" },
  { id: "u_08", name: "윤지안", email: "jian@example.com", role: "편집자", status: "활성", createdAt: "2026-05-12" },
];

// 최근 판매
export interface Sale {
  id: string;
  name: string;
  email: string;
  amount: number;
  date: string; // ISO 날짜
}

export const recentSales: Sale[] = [
  { id: "s_01", name: "김민준", email: "minjun@example.com", amount: 1999000, date: "2026-06-21" },
  { id: "s_02", name: "이서윤", email: "seoyun@example.com", amount: 39000, date: "2026-06-21" },
  { id: "s_03", name: "박지호", email: "jiho@example.com", amount: 299000, date: "2026-06-20" },
  { id: "s_04", name: "최하은", email: "haeun@example.com", amount: 99000, date: "2026-06-19" },
  { id: "s_05", name: "정도윤", email: "doyun@example.com", amount: 599000, date: "2026-06-18" },
];
