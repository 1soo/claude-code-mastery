"use client"

import * as React from "react"
import { toast } from "sonner"
import { BellIcon, ChevronDownIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// 쇼케이스 섹션 래퍼
function Section({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-3">
        {children}
      </CardContent>
    </Card>
  )
}

export function ComponentShowcase() {
  return (
    <div className="grid gap-6">
      {/* 버튼 */}
      <Section title="Button" description="다양한 변형의 버튼">
        <Button>기본</Button>
        <Button variant="secondary">보조</Button>
        <Button variant="outline">외곽선</Button>
        <Button variant="ghost">고스트</Button>
        <Button variant="destructive">삭제</Button>
        <Button variant="link">링크</Button>
      </Section>

      {/* 배지 */}
      <Section title="Badge" description="상태와 라벨 표시">
        <Badge>기본</Badge>
        <Badge variant="secondary">보조</Badge>
        <Badge variant="outline">외곽선</Badge>
        <Badge variant="destructive">경고</Badge>
      </Section>

      {/* 입력 폼 요소 */}
      <Section title="Input · Select" description="텍스트 입력과 선택">
        <div className="grid w-full max-w-sm gap-2">
          <Label htmlFor="demo-email">이메일</Label>
          <Input id="demo-email" type="email" placeholder="you@example.com" />
        </div>
        <Select>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="과일 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">사과</SelectItem>
            <SelectItem value="banana">바나나</SelectItem>
            <SelectItem value="cherry">체리</SelectItem>
          </SelectContent>
        </Select>
      </Section>

      {/* 토글 요소 */}
      <Section title="Checkbox · Switch" description="불리언 입력 컨트롤">
        <div className="flex items-center gap-2">
          <Checkbox id="demo-check" defaultChecked />
          <Label htmlFor="demo-check">이메일 수신 동의</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="demo-switch" defaultChecked />
          <Label htmlFor="demo-switch">알림 켜기</Label>
        </div>
      </Section>

      {/* 오버레이 */}
      <Section
        title="Dialog · Dropdown · Tooltip"
        description="오버레이 및 메뉴 컴포넌트"
      >
        <Dialog>
          <DialogTrigger render={<Button variant="outline" />}>
            다이얼로그 열기
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>다이얼로그 예시</DialogTitle>
              <DialogDescription>
                접근성을 갖춘 모달 다이얼로그입니다.
              </DialogDescription>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              여기에 원하는 콘텐츠를 배치할 수 있습니다.
            </p>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                닫기
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>
            메뉴
            <ChevronDownIcon className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>내 계정</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>프로필</DropdownMenuItem>
            <DropdownMenuItem>설정</DropdownMenuItem>
            <DropdownMenuItem variant="destructive">로그아웃</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger render={<Button variant="outline" />}>
            툴팁 호버
          </TooltipTrigger>
          <TooltipContent>도움말 텍스트입니다.</TooltipContent>
        </Tooltip>
      </Section>

      {/* 피드백 */}
      <Section title="Sonner · Avatar · Skeleton" description="피드백과 표시 요소">
        <Button
          variant="outline"
          onClick={() =>
            toast("알림이 도착했습니다.", {
              description: "Sonner 토스트 예시입니다.",
              icon: <BellIcon className="size-4" />,
            })
          }
        >
          토스트 띄우기
        </Button>
        <Avatar>
          <AvatarImage src="" alt="사용자" />
          <AvatarFallback>CC</AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-2">
          <Skeleton className="size-10 rounded-full" />
          <div className="grid gap-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </Section>
    </div>
  )
}
