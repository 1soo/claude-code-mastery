import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ComponentShowcase } from "@/components/demo/component-showcase";
import { ContactForm } from "@/components/demo/contact-form";

export const metadata: Metadata = {
  title: "컴포넌트",
};

export default function ComponentsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">컴포넌트 쇼케이스</h1>
        <p className="text-sm text-muted-foreground">
          스타터 킷에 포함된 shadcn/ui 컴포넌트를 직접 확인해보세요.
        </p>
      </div>

      <ComponentShowcase />

      {/* 폼 검증 데모 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Form · 검증</CardTitle>
          <CardDescription>
            react-hook-form 과 zod 로 검증하는 문의 폼 예시입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContactForm />
        </CardContent>
      </Card>
    </div>
  );
}
