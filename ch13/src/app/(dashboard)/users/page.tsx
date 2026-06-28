import type { Metadata } from "next";
import { UserPlus } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/common/data-table";
import { Button } from "@/components/ui/button";
import { users } from "@/lib/mock-data";
import { userColumns } from "./columns";

export const metadata: Metadata = {
  title: "사용자",
};

export default function UsersPage() {
  return (
    <>
      <PageHeader title="사용자" description="서비스 사용자를 관리합니다.">
        <Button>
          <UserPlus className="size-4" />
          사용자 추가
        </Button>
      </PageHeader>

      <DataTable
        columns={userColumns}
        data={users}
        searchColumn="name"
        searchPlaceholder="이름으로 검색..."
      />
    </>
  );
}
