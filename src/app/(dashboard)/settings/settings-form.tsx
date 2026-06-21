"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// zod 스키마: 한 곳에서 검증 규칙 정의
const profileSchema = z.object({
  name: z.string().min(2, { message: "이름은 2자 이상 입력하세요." }),
  email: z.string().email({ message: "올바른 이메일 형식이 아닙니다." }),
  bio: z.string().max(160, { message: "소개는 160자 이내로 입력하세요." }).optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;

export function SettingsForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "관리자", email: "admin@example.com", bio: "" },
  });

  const onSubmit = async (values: ProfileValues) => {
    // 실제로는 API 호출. 데모에서는 토스트로 대체
    await new Promise((resolve) => setTimeout(resolve, 600));
    toast.success("저장되었습니다.", {
      description: `${values.name} (${values.email})`,
    });
  };

  return (
    <Tabs defaultValue="general" className="space-y-4">
      <TabsList>
        <TabsTrigger value="general">일반</TabsTrigger>
        <TabsTrigger value="notifications">알림</TabsTrigger>
      </TabsList>

      {/* 일반 탭: 프로필 폼 */}
      <TabsContent value="general">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>프로필</CardTitle>
              <CardDescription>
                공개 프로필 정보를 수정합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input id="name" {...register("name")} />
                {errors.name ? (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email ? (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">소개</Label>
                <Textarea
                  id="bio"
                  placeholder="자기소개를 입력하세요."
                  {...register("bio")}
                />
                {errors.bio ? (
                  <p className="text-sm text-destructive">
                    {errors.bio.message}
                  </p>
                ) : null}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "저장 중..." : "변경사항 저장"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </TabsContent>

      {/* 알림 탭: 스위치 데모 */}
      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>알림</CardTitle>
            <CardDescription>알림 수신 방식을 설정합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="email-noti">이메일 알림</Label>
                <p className="text-sm text-muted-foreground">
                  중요 업데이트를 이메일로 받습니다.
                </p>
              </div>
              <Switch id="email-noti" defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="push-noti">푸시 알림</Label>
                <p className="text-sm text-muted-foreground">
                  브라우저 푸시 알림을 받습니다.
                </p>
              </div>
              <Switch id="push-noti" />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
