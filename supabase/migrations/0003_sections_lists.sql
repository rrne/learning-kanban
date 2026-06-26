-- 고정 레인/상태 칸반 → 자유 구조(Trello식)로 전환.
-- 구조: sections(섹션) → lists(리스트/컬럼) → cards(카드)
-- 기존 cards.month/status 데이터를 새 구조로 이전한 뒤 두 컬럼을 제거한다.

-- ── sections ──────────────────────────────────────────────────────────
create table if not exists public.sections (
	id         uuid primary key default gen_random_uuid(),
	user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
	title      text not null default '새 섹션',
	position   integer not null default 0,
	created_at timestamptz not null default now()
);

-- ── lists ─────────────────────────────────────────────────────────────
create table if not exists public.lists (
	id         uuid primary key default gen_random_uuid(),
	user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
	section_id uuid not null references public.sections (id) on delete cascade,
	title      text not null default '새 리스트',
	position   integer not null default 0,
	created_at timestamptz not null default now()
);

create index if not exists sections_user_idx on public.sections (user_id);
create index if not exists lists_section_idx on public.lists (section_id);

-- ── cards: list_id 추가 ───────────────────────────────────────────────
alter table public.cards add column if not exists list_id uuid references public.lists (id) on delete cascade;
create index if not exists cards_list_idx on public.cards (list_id);

-- ── RLS: 본인 데이터만 ────────────────────────────────────────────────
alter table public.sections enable row level security;
alter table public.lists    enable row level security;

create policy "sections_select_own" on public.sections for select using (auth.uid() = user_id);
create policy "sections_insert_own" on public.sections for insert with check (auth.uid() = user_id);
create policy "sections_update_own" on public.sections for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "sections_delete_own" on public.sections for delete using (auth.uid() = user_id);

create policy "lists_select_own" on public.lists for select using (auth.uid() = user_id);
create policy "lists_insert_own" on public.lists for insert with check (auth.uid() = user_id);
create policy "lists_update_own" on public.lists for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "lists_delete_own" on public.lists for delete using (auth.uid() = user_id);

-- ── 기존 데이터 이전: (user, month) → 섹션 1개 + 리스트 3개, status → 리스트 ──
do $$
declare
	r record;
	sec_id uuid;
	todo_id uuid;
	doing_id uuid;
	done_id uuid;
begin
	for r in select distinct user_id, month from public.cards where list_id is null loop
		insert into public.sections (user_id, title, position)
		values (
			r.user_id,
			case r.month
				when '1' then '1개월차 · 백엔드 사고 전환 — 데이터 + API'
				when '2' then '2개월차 · 끝까지 연결 + 배포 + 운영 기초'
				when '3' then '3개월차 · 이해 깊이 + 이직 무기화'
				else '도메인 · 내 제품 핵심 기능'
			end,
			case r.month when '1' then 0 when '2' then 1 when '3' then 2 else 3 end
		)
		returning id into sec_id;

		insert into public.lists (user_id, section_id, title, position)
		values (r.user_id, sec_id, '할 일', 0) returning id into todo_id;
		insert into public.lists (user_id, section_id, title, position)
		values (r.user_id, sec_id, '진행 중', 1) returning id into doing_id;
		insert into public.lists (user_id, section_id, title, position)
		values (r.user_id, sec_id, '완료', 2) returning id into done_id;

		update public.cards
		set list_id = case status when 'doing' then doing_id when 'done' then done_id else todo_id end
		where user_id = r.user_id and month = r.month and list_id is null;
	end loop;
end $$;

-- ── 이전 완료 후 list_id 필수화 + 구 컬럼 제거 ────────────────────────
alter table public.cards alter column list_id set not null;
alter table public.cards drop column if exists month;
alter table public.cards drop column if exists status;
