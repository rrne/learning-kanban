-- 3개월 풀스택 스프린트 보드 — 초기 스키마
-- 설계 원칙: 모든 행은 user_id로 소유자를 구분하고, RLS로 "본인 데이터만" 접근하게 강제한다.

-- ── boards: 사용자당 1행 (스프린트 시작일) ────────────────────────────
create table if not exists public.boards (
	user_id    uuid primary key references auth.users (id) on delete cascade,
	start_date date not null default current_date,
	created_at timestamptz not null default now()
);

-- ── cards: 학습 카드 ──────────────────────────────────────────────────
create table if not exists public.cards (
	id         uuid primary key default gen_random_uuid(),
	user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
	month      text not null,                       -- '1' | '2' | '3' | 'domain'
	title      text not null default '새 작업',
	dod        text not null default '완료 기준을 적기',
	status     text not null default 'todo' check (status in ('todo', 'doing', 'done')),
	position   integer not null default 0,          -- 같은 레인 내 정렬용
	created_at timestamptz not null default now()
);

create index if not exists cards_user_idx on public.cards (user_id);

-- ── RLS: 본인 데이터만 ────────────────────────────────────────────────
alter table public.boards enable row level security;
alter table public.cards  enable row level security;

-- boards 정책
create policy "boards_select_own" on public.boards
	for select using (auth.uid() = user_id);
create policy "boards_insert_own" on public.boards
	for insert with check (auth.uid() = user_id);
create policy "boards_update_own" on public.boards
	for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "boards_delete_own" on public.boards
	for delete using (auth.uid() = user_id);

-- cards 정책
create policy "cards_select_own" on public.cards
	for select using (auth.uid() = user_id);
create policy "cards_insert_own" on public.cards
	for insert with check (auth.uid() = user_id);
create policy "cards_update_own" on public.cards
	for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "cards_delete_own" on public.cards
	for delete using (auth.uid() = user_id);
