"use client";

import * as React from "react";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

// 전역 프로바이더 통합: 테마 + 툴팁 + 토스트
// 새 전역 컨텍스트가 생기면 이곳에 한 번만 추가한다.
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>{children}</TooltipProvider>
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );
}
