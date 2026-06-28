import Link from "next/link";
import {
  ArrowRightIcon,
  ComponentIcon,
  GaugeIcon,
  MoonIcon,
  PaletteIcon,
  TypeIcon,
  ZapIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// 기술스택 / 기능 카드 데이터
const features = [
  {
    icon: ZapIcon,
    title: "Next.js 16 App Router",
    description: "서버 컴포넌트와 Turbopack 기반의 빠른 개발 환경",
  },
  {
    icon: TypeIcon,
    title: "TypeScript",
    description: "타입 안전성으로 견고한 코드베이스 유지",
  },
  {
    icon: PaletteIcon,
    title: "Tailwind CSS v4",
    description: "설정 파일 없는 CSS-first 구성과 디자인 토큰",
  },
  {
    icon: ComponentIcon,
    title: "shadcn/ui",
    description: "복사해서 소유하는 접근성 높은 UI 컴포넌트",
  },
  {
    icon: MoonIcon,
    title: "다크 모드",
    description: "next-themes 기반 라이트/다크/시스템 테마 전환",
  },
  {
    icon: GaugeIcon,
    title: "즉시 시작",
    description: "데모 페이지와 컴포넌트 쇼케이스로 바로 개발 시작",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* 히어로 섹션 */}
      <section className="flex flex-col items-center gap-6 py-20 text-center sm:py-28">
        <Badge variant="secondary" className="gap-1">
          <ZapIcon className="size-3" />
          Next.js 16 · Tailwind v4 · shadcn/ui
        </Badge>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-6xl">
          웹 개발을 빠르게 시작하는 스타터 킷
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground text-pretty sm:text-lg">
          최신 Next.js App Router, TypeScript, Tailwind CSS v4, shadcn/ui가
          미리 구성된 프로덕션급 템플릿입니다. 복잡한 설정 없이 바로 기능
          개발에 집중하세요.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href="/components" />}
          >
            컴포넌트 둘러보기
            <ArrowRightIcon className="size-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={<Link href="/dashboard" />}
          >
            대시보드 데모
          </Button>
        </div>
      </section>

      {/* 기능 카드 그리드 */}
      <section className="grid gap-4 pb-20 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="size-5" />
              </div>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              검증된 기본 설정으로 추가 구성 없이 사용할 수 있습니다.
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
