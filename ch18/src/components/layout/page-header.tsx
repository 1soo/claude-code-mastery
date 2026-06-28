import * as React from "react";

// 페이지 상단 제목/설명 + 우측 액션 영역 (대부분의 페이지에서 재사용)
interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode; // 우측 액션 버튼 등
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children ? (
        <div className="flex items-center gap-2">{children}</div>
      ) : null}
    </div>
  );
}
