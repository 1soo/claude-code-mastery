# 웹 스타터 킷

Next.js 16 App Router 기반의 웹 개발 스타터 킷입니다. 최신 기술 스택과 기본
설정이 미리 구성되어 있어, 복잡한 초기 세팅 없이 바로 기능 개발을 시작할 수
있습니다.

## 기술 스택

| 구분        | 기술                                                       |
| ----------- | ---------------------------------------------------------- |
| 프레임워크  | [Next.js 16](https://nextjs.org) (App Router)              |
| 언어        | TypeScript                                                 |
| 스타일링    | [Tailwind CSS v4](https://tailwindcss.com) (설정 파일 없음) |
| UI 컴포넌트 | [shadcn/ui](https://ui.shadcn.com) (base-nova)             |
| 아이콘      | [lucide-react](https://lucide.dev)                         |
| 다크 모드   | [next-themes](https://github.com/pacocoursey/next-themes)  |
| 폼 / 검증   | react-hook-form + zod                                      |

## 요구 사항

- **Node.js 20.9 이상**
- 패키지 매니저: **pnpm** (corepack 으로 활성화 가능)

```bash
corepack enable pnpm
```

## 시작하기

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행 (http://localhost:3000)
pnpm dev
```

## 사용 가능한 스크립트

| 명령어       | 설명                       |
| ------------ | -------------------------- |
| `pnpm dev`   | 개발 서버 실행 (Turbopack) |
| `pnpm build` | 프로덕션 빌드              |
| `pnpm start` | 프로덕션 서버 실행         |
| `pnpm lint`  | ESLint 검사                |

> Next.js 16 부터는 `next build` 시 린트가 자동 실행되지 않으므로, `pnpm lint`
> 를 별도로 실행해야 합니다.

## 프로젝트 구조

```
.
├── app/                      # App Router 라우트
│   ├── layout.tsx            # 루트 레이아웃 (테마/헤더/토스트)
│   ├── page.tsx              # 랜딩 페이지
│   ├── dashboard/            # 대시보드 데모
│   ├── about/                # 소개 페이지
│   ├── components/           # 컴포넌트 쇼케이스
│   └── globals.css           # Tailwind v4 + 디자인 토큰 (설정 파일 없음)
├── components/
│   ├── ui/                   # shadcn/ui 컴포넌트
│   ├── demo/                 # 데모용 컴포넌트 (폼, 쇼케이스)
│   ├── theme-provider.tsx    # 테마 프로바이더
│   ├── mode-toggle.tsx       # 다크 모드 토글
│   └── site-header.tsx       # 상단 네비게이션
├── lib/
│   └── utils.ts              # cn() 등 유틸리티
└── components.json           # shadcn/ui 설정
```

## 스타일링 (Tailwind CSS v4)

Tailwind v4 는 별도의 `tailwind.config.js` 파일을 사용하지 않습니다. 모든 설정은
`app/globals.css` 안에서 이루어집니다.

- `@import "tailwindcss";` 로 Tailwind 를 불러옵니다.
- `@theme inline { ... }` 블록에서 디자인 토큰을 Tailwind 유틸리티에 매핑합니다.
- `:root` 와 `.dark` 에 정의된 CSS 변수로 라이트/다크 테마를 제어합니다.

## 컴포넌트 추가하기

shadcn/ui 컴포넌트는 다음 명령어로 추가합니다.

```bash
pnpm dlx shadcn@latest add <컴포넌트명>
# 예시
pnpm dlx shadcn@latest add accordion
```

추가된 컴포넌트는 `components/ui/` 에 생성되며 프로젝트 코드의 일부로 자유롭게
수정할 수 있습니다.

## 다크 모드

`next-themes` 기반으로 라이트 / 다크 / 시스템 테마를 지원합니다. 상단 헤더의
테마 토글 버튼으로 전환할 수 있으며, 새 컴포넌트는 `bg-background`,
`text-foreground` 같은 디자인 토큰 클래스를 사용하면 별도 작업 없이 다크 모드에
대응됩니다.

## 환경 변수

`.env.example` 을 `.env.local` 로 복사해 사용하세요.

```bash
cp .env.example .env.local
```
