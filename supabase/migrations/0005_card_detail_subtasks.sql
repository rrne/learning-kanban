-- 카드 상세: 자유 기록(notes) + 하위 할 일(subtasks 체크리스트).

-- 카드에 상세 기록 컬럼 추가
alter table public.cards add column if not exists notes text not null default '';

-- ── subtasks: 카드 하위 할 일 ─────────────────────────────────────────
create table if not exists public.subtasks (
	id         uuid primary key default gen_random_uuid(),
	user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
	card_id    uuid not null references public.cards (id) on delete cascade,
	title      text not null default '',
	done       boolean not null default false,
	position   integer not null default 0,
	created_at timestamptz not null default now()
);

create index if not exists subtasks_card_idx on public.subtasks (card_id);

alter table public.subtasks enable row level security;

create policy "subtasks_select_own" on public.subtasks for select using (auth.uid() = user_id);
create policy "subtasks_insert_own" on public.subtasks for insert with check (auth.uid() = user_id);
create policy "subtasks_update_own" on public.subtasks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "subtasks_delete_own" on public.subtasks for delete using (auth.uid() = user_id);
