import type { Metadata } from "next";
import { CheckCircle2Icon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "소개",
};

// 스타터 킷에 포함된 기술 목록
const stack = [
  { name: "Next.js 16", desc: "App Router · 서버 컴포넌트 · Turbopack" },
  { name: "TypeScript", desc: "정적 타입으로 안정적인 개발" },
  { name: "Tailwind CSS v4", desc: "CSS-first 설정, 디자인 토큰 기반 스타일링" },
  { name: "shadcn/ui", desc: "소유 가능한 접근성 높은 컴포넌트" },
  { name: "lucide-react", desc: "일관된 오픈소스 아이콘 세트" },
  { name: "next-themes", desc: "라이트/다크/시스템 테마 관리" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Badge variant="secondary" className="mb-4">
        소개
      </Badge>
      <h1 className="text-3xl font-bold tracking-tight">
        스타터 킷에 대하여
      </h1>
      <p className="mt-4 text-muted-foreground">
        이 스타터 킷은 현대적인 웹 애플리케이션을 빠르게 시작할 수 있도록 검증된
        기술 조합과 기본 설정을 미리 구성해 둔 템플릿입니다. 반복적인 초기 설정
        대신 핵심 기능 개발에 집중할 수 있습니다.
      </p>

      <Card className="mt-10">
        <CardHeader>
          <CardTitle>포함된 기술 스택</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {stack.map((item) => (
            <div key={item.name} className="flex gap-3">
              <CheckCircle2Icon className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
