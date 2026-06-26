# 3개월 풀스택 스프린트 보드 🛠️

프론트엔드 → **풀스택 빌더**로 전환하는 90일 스프린트를 스스로 체크·관리하는 칸반 보드.
직접 만든 학습 도구로, 진행 상황은 브라우저 `localStorage`에 저장된다.

> **왜 만들었나** — 학습 계획을 "읽기만 하는 문서"가 아니라 **매일 카드를 옮기며 페이스를 확인하는 도구**로 바꾸기 위해. 그리고 이 도구 자체가 Svelte를 배우는 첫 제품이다.

## 핵심 기능

- **3개월 × 컬럼(할 일 / 진행 중 / 완료) 칸반** — 달별 레인 + 자유 도메인 레인
- **페이스 게이지** — 경과한 시간(%)과 완료율(%)을 비교해 "뒤처짐 / OK" 판정
- **WIP 제한(≤2)** — 동시에 진행하는 일을 강제로 줄여 "끝내는 힘" 훈련
- **카드 인라인 편집** — 제목·완료기준(Definition of Done)을 클릭해서 바로 수정
- **시작일 조정 · 전체 초기화**
- **자동 저장** — 모든 변경이 즉시 `localStorage`에 기록 ("저장됨" 토스트)

## 기술 스택

- [SvelteKit](https://svelte.dev/docs/kit) + **Svelte 5 (runes)**
- TypeScript
- Vite 8
- `@sveltejs/adapter-vercel` (Vercel 배포)

## 구조

```
src/
├─ app.css                       전역 디자인 토큰 + 배경/레이아웃
├─ app.html                      문서 셸 (title/메타)
├─ lib/
│  ├─ types.ts                   도메인 타입 (Card, BoardState, …)
│  ├─ data.ts                    상수 + 초기 시드 데이터
│  ├─ board.svelte.ts            상태 + 동작 싱글톤 ($state/$derived, localStorage 저장)
│  └─ components/
│     ├─ ProgressMeter.svelte    페이스 게이지
│     ├─ Lane.svelte             레인 1개 (3컬럼)
│     └─ Card.svelte             카드 1장
└─ routes/
   ├─ +layout.svelte             전역 CSS import
   ├─ +page.ts                   ssr=false (순수 SPA) + prerender
   └─ +page.svelte               전체 조립
```

**설계 메모**
- 상태는 전부 클라이언트에 있으므로 `+page.ts`에서 `ssr = false`로 두어 하이드레이션 불일치를 피한다.
- 상태/로직을 `board.svelte.ts` 한 곳에 모으고 컴포넌트는 그것을 읽기만 한다 → 백엔드로 확장할 때 이 모듈만 API 호출로 바꾸면 된다.

## 로컬 실행

Node 22 필요 (`.nvmrc` 참고).

```bash
nvm use            # 22.17.0
npm install
npm run dev        # 개발 서버
npm run build      # 프로덕션 빌드
npm run preview    # 빌드 결과 미리보기
npm run check      # 타입 체크
```

## Vercel 배포

1. 이 레포를 GitHub에 푸시
2. [vercel.com/new](https://vercel.com/new) → 레포 import
3. 프레임워크는 **SvelteKit**으로 자동 감지됨. 별도 설정 없이 Deploy
4. 이후 `main`에 푸시할 때마다 자동 배포

## 다음 단계 (학습 로드맵과 연결)

이 앱은 지금 순수 프론트엔드 SPA다. 스프린트 2개월차 "FE를 내 백엔드에 연결"에 도달하면
`board.svelte.ts`의 `localStorage` 저장부를 Supabase/API 호출로 교체해 **이 도구 자체를 풀스택으로** 만든다.
