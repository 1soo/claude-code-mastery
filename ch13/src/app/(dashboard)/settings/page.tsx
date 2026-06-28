import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = {
  title: "설정",
};

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="설정"
        description="계정 및 환경설정을 관리합니다."
      />
      <SettingsForm />
    </>
  );
}
