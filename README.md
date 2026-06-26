# 학습 스프린트 보드 🛠️

프론트엔드 → **풀스택 빌더**로 성장하는 스프린트를 스스로 관리하는 칸반 보드.
직접 만든 학습 도구이자, 이 도구 자체가 풀스택(인증·DB·API·배포)을 배우는 첫 제품이다.

> **왜 만들었나** — 학습 계획을 "읽기만 하는 문서"가 아니라 **매일 카드를 옮기며 페이스를 확인하는 도구**로 만들기 위해. 그리고 만드는 과정에서 백엔드 사고를 직접 체득하기 위해.

## 핵심 기능

- **자유 구조 칸반 (Trello식)** — 섹션 → 리스트 → 카드 3계층을 자유롭게 추가/이름수정/삭제/정렬
- **드래그앤드롭** — 카드를 잡아 리스트·섹션 간 이동 및 순서 변경
- **카드 상세** — 카드를 클릭하면 모달에서 **완료 기준 · 상세 기록 · 하위 할 일(체크리스트)** 편집
- **기간 타임라인** — 시작일·종료일을 직접 지정(90일 고정 아님), 남은 일수·경과율·오늘 위치 표시
- **라이트/다크 테마** — 토글 + 선택 저장 (기본 라이트)
- **GitHub 로그인** — Supabase Auth(OAuth)
- **클라우드 영속** — 모든 변경이 Supabase에 즉시 저장(낙관적 업데이트), RLS로 본인 데이터만 접근

## 기술 스택

- [SvelteKit](https://svelte.dev/docs/kit) + **Svelte 5 (runes)** · TypeScript · Vite
- [Supabase](https://supabase.com) — Postgres + Auth(GitHub OAuth) + Row Level Security
- `@sveltejs/adapter-vercel` (Vercel 배포)

## 데이터 모델

```
auth.users
  └─ boards     (사용자당 1행: 제목, 시작일, 종료일)
  └─ sections   (보드의 큰 묶음)
       └─ lists      (섹션 안의 컬럼)
            └─ cards      (리스트 안의 카드: 제목·완료기준·상세기록)
                 └─ subtasks   (카드의 하위 할 일 체크리스트)
```

모든 테이블은 `user_id`로 소유자를 구분하고 **RLS로 "본인 데이터만"** 접근하도록 강제한다.
마이그레이션은 `supabase/migrations/`에 순서대로 들어 있다.

## 프로젝트 구조

```
src/
├─ app.css                       디자인 토큰(라이트/다크) + 전역 스타일
├─ app.html                      문서 셸 + FOUC 방지 테마 스크립트
├─ lib/
│  ├─ types.ts                   도메인 타입 (Section, List, Card, Subtask, …)
│  ├─ data.ts                    기본 시드 데이터 + 상수
│  ├─ supabase.ts                Supabase 클라이언트(PKCE)
│  ├─ board.svelte.ts            상태 + DB CRUD 싱글톤 ($state/$derived)
│  ├─ theme.svelte.ts            라이트/다크 테마 스토어
│  └─ components/
│     ├─ ProgressMeter.svelte    기간 타임라인
│     ├─ Section.svelte          섹션 1개 (가로 리스트 묶음)
│     ├─ List.svelte             리스트 1개 (드롭 타깃 + 카드들)
│     ├─ Card.svelte             카드 1장 (드래그 + 클릭→상세)
│     └─ CardDetail.svelte       카드 상세 모달 (기록 + 하위 할 일)
└─ routes/
   ├─ +layout.svelte             테마/보드 초기화
   ├─ +page.ts                   ssr=false (순수 SPA)
   └─ +page.svelte               전체 조립 + 헤더/툴바
```

## 로컬 실행

Node 22 필요 (`.nvmrc` 참고).

```bash
nvm use            # 22.x
npm install
cp .env.example .env   # Supabase URL/anon key 입력
npm run dev        # 개발 서버
npm run check      # 타입 체크
npm run build      # 프로덕션 빌드
```

### 환경변수 (`.env`)

```
PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ref.supabase.co
PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-OR-PUBLISHABLE-KEY
```

`PUBLIC_` 접두사가 붙어야 클라이언트 번들에 포함된다. anon/publishable 키는 공개돼도 안전 — RLS가 데이터를 보호한다.

## 배포 (Vercel)

1. 레포를 GitHub에 푸시
2. [vercel.com/new](https://vercel.com/new) → 레포 import (프레임워크 SvelteKit 자동 감지)
3. **Environment Variables** 에 `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY` 등록 후 Deploy
4. 배포 URL을 Supabase **Authentication → URL Configuration → Redirect URLs** 에 추가
   (예: `https://your-app.vercel.app/**`) — 배포본에서 OAuth 로그인이 되도록
5. 이후 `main`에 푸시할 때마다 자동 배포
