import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { SEED_SECTIONS, DEFAULT_LISTS, DEFAULT_DAYS } from './data';
import type { Card, List, Metrics, Section, Subtask } from './types';

function todayISO(): string {
	const d = new Date();
	d.setHours(0, 0, 0, 0);
	return d.toISOString().slice(0, 10);
}

/** ISO 날짜에 n일을 더한 ISO 날짜 */
function addDaysISO(iso: string, n: number): string {
	const d = new Date(iso + 'T00:00:00');
	d.setDate(d.getDate() + n);
	return d.toISOString().slice(0, 10);
}

function daysBetween(a: Date, b: Date): number {
	return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

function bySortPos<T extends { position: number }>(a: T, b: T): number {
	return a.position - b.position;
}

const DEFAULT_TITLE = '제품 하나를 처음부터 끝까지 출시하기';

/**
 * 보드 상태 + 동작 싱글톤. Supabase와 대화한다.
 * 구조는 자유 3계층: sections → lists → cards.
 * RLS 덕분에 쿼리에 user_id 조건을 빼먹어도 남의 데이터는 안 보인다(이중 안전).
 */
class Board {
	user = $state<User | null>(null);
	loading = $state(true);
	syncing = $state(false);
	error = $state<string | null>(null);

	sections = $state<Section[]>([]);
	lists = $state<List[]>([]);
	cards = $state<Card[]>([]);
	subtasks = $state<Subtask[]>([]);

	title = $state<string>(DEFAULT_TITLE);
	start = $state<string>(todayISO());
	end = $state<string>(addDaysISO(todayISO(), DEFAULT_DAYS));
	savedTick = $state(0);
	/** 드래그 중인 카드 id */
	dragId = $state<string | null>(null);
	/** 상세 화면이 열린 카드 id (null = 닫힘) */
	openCardId = $state<string | null>(null);

	metrics = $derived.by<Metrics>(() => {
		const startDate = new Date(this.start + 'T00:00:00');
		const endDate = new Date(this.end + 'T00:00:00');
		const now = new Date();
		now.setHours(0, 0, 0, 0);
		const totalDays = Math.max(1, daysBetween(startDate, endDate));
		const elapsed = Math.max(0, Math.min(totalDays, daysBetween(startDate, now)));
		return {
			timePct: Math.round((elapsed / totalDays) * 100),
			remaining: Math.max(0, daysBetween(now, endDate)),
			totalDays
		};
	});

	cardCount = $derived(this.cards.length);

	/** 정렬된 섹션 목록 */
	get orderedSections(): Section[] {
		return [...this.sections].sort(bySortPos);
	}
	listsIn(sectionId: string): List[] {
		return this.lists.filter((l) => l.section_id === sectionId).sort(bySortPos);
	}
	cardsIn(listId: string): Card[] {
		return this.cards.filter((c) => c.list_id === listId).sort(bySortPos);
	}
	subtasksIn(cardId: string): Subtask[] {
		return this.subtasks.filter((s) => s.card_id === cardId).sort(bySortPos);
	}
	/** 현재 상세가 열린 카드 (없으면 null) */
	get openCard(): Card | null {
		return this.cards.find((c) => c.id === this.openCardId) ?? null;
	}

	// ── 초기화/인증 ───────────────────────────────────────────────────
	async init() {
		const {
			data: { session }
		} = await supabase.auth.getSession();
		this.user = session?.user ?? null;
		if (this.user) await this.loadData();
		this.loading = false;

		supabase.auth.onAuthStateChange((_event, session: Session | null) => {
			const prevId = this.user?.id;
			this.user = session?.user ?? null;
			if (this.user && this.user.id !== prevId) {
				this.loadData();
			} else if (!this.user) {
				this.sections = [];
				this.lists = [];
				this.cards = [];
				this.subtasks = [];
				this.openCardId = null;
				this.title = DEFAULT_TITLE;
				this.start = todayISO();
				this.end = addDaysISO(todayISO(), DEFAULT_DAYS);
			}
		});
	}

	async signInWithGitHub() {
		this.error = null;
		const { error } = await supabase.auth.signInWithOAuth({
			provider: 'github',
			options: { redirectTo: location.origin }
		});
		if (error) this.error = error.message;
	}

	async signOut() {
		await supabase.auth.signOut();
		this.sections = [];
		this.lists = [];
		this.cards = [];
		this.subtasks = [];
		this.openCardId = null;
		this.user = null;
	}

	// ── 데이터 로드 ───────────────────────────────────────────────────
	async loadData() {
		if (!this.user) return;
		this.syncing = true;
		this.error = null;
		try {
			const uid = this.user.id;

			// boards 행(시작/종료일) 보장
			const { data: boardRow } = await supabase
				.from('boards')
				.select('title, start_date, end_date')
				.eq('user_id', uid)
				.maybeSingle();
			if (boardRow) {
				this.title = (boardRow.title as string | null) ?? DEFAULT_TITLE;
				this.start = boardRow.start_date as string;
				this.end =
					(boardRow.end_date as string | null) ??
					addDaysISO(boardRow.start_date as string, DEFAULT_DAYS);
			} else {
				const today = todayISO();
				const end = addDaysISO(today, DEFAULT_DAYS);
				await supabase.from('boards').insert({ user_id: uid, start_date: today, end_date: end });
				this.start = today;
				this.end = end;
			}

			await this.fetchAll(uid);
			if (this.sections.length === 0) {
				await this.seed(uid);
				await this.fetchAll(uid);
			}
		} catch (e) {
			this.error = e instanceof Error ? e.message : '데이터를 불러오지 못했습니다.';
		} finally {
			this.syncing = false;
		}
	}

	private async fetchAll(uid: string) {
		const [secs, lists, cards, subs] = await Promise.all([
			supabase.from('sections').select('*').eq('user_id', uid).order('position'),
			supabase.from('lists').select('*').eq('user_id', uid).order('position'),
			supabase.from('cards').select('*').eq('user_id', uid).order('position'),
			supabase.from('subtasks').select('*').eq('user_id', uid).order('position')
		]);
		if (secs.error) throw secs.error;
		if (lists.error) throw lists.error;
		if (cards.error) throw cards.error;
		if (subs.error) throw subs.error;
		this.sections = (secs.data ?? []) as Section[];
		this.lists = (lists.data ?? []) as List[];
		this.cards = (cards.data ?? []) as Card[];
		this.subtasks = (subs.data ?? []) as Subtask[];
	}

	private async seed(uid: string) {
		for (let i = 0; i < SEED_SECTIONS.length; i++) {
			const s = SEED_SECTIONS[i];
			const { data: sec, error: e1 } = await supabase
				.from('sections')
				.insert({ user_id: uid, title: s.title, position: i })
				.select()
				.single();
			if (e1 || !sec) throw e1 ?? new Error('섹션 시드 실패');

			const listRows = DEFAULT_LISTS.map((title, j) => ({
				user_id: uid,
				section_id: sec.id,
				title,
				position: j
			}));
			const { data: lists, error: e2 } = await supabase.from('lists').insert(listRows).select();
			if (e2 || !lists) throw e2 ?? new Error('리스트 시드 실패');

			const todo = lists.find((l) => l.position === 0) ?? lists[0];
			if (s.cards.length) {
				const cardRows = s.cards.map(([title, dod], k) => ({
					user_id: uid,
					list_id: todo.id,
					title,
					dod,
					position: k
				}));
				const { error: e3 } = await supabase.from('cards').insert(cardRows);
				if (e3) throw e3;
			}
		}
	}

	private flash() {
		this.savedTick++;
	}

	// ── 제목 ─────────────────────────────────────────────────────────
	async setTitle(title: string) {
		if (!this.user) return;
		const next = title.trim() || DEFAULT_TITLE;
		if (next === this.title) return;
		const prev = this.title;
		this.title = next;
		const { error } = await supabase
			.from('boards')
			.update({ title: next })
			.eq('user_id', this.user.id);
		if (error) {
			this.title = prev;
			this.error = error.message;
		} else this.flash();
	}

	// ── 날짜 ─────────────────────────────────────────────────────────
	async setStart(date: string) {
		if (!this.user || !date) return;
		this.start = date;
		if (this.end < date) this.end = addDaysISO(date, DEFAULT_DAYS);
		await supabase
			.from('boards')
			.update({ start_date: this.start, end_date: this.end })
			.eq('user_id', this.user.id);
		this.flash();
	}

	async setEnd(date: string) {
		if (!this.user || !date) return;
		if (date <= this.start) {
			this.error = '종료일은 시작일보다 뒤여야 합니다.';
			return;
		}
		this.error = null;
		this.end = date;
		await supabase.from('boards').update({ end_date: date }).eq('user_id', this.user.id);
		this.flash();
	}

	// ── 섹션 CRUD ────────────────────────────────────────────────────
	async addSection() {
		if (!this.user) return;
		const position = this.sections.length;
		const { data: sec, error } = await supabase
			.from('sections')
			.insert({ user_id: this.user.id, title: '새 섹션', position })
			.select()
			.single();
		if (error || !sec) {
			this.error = error?.message ?? '섹션 추가 실패';
			return;
		}
		this.sections.push(sec as Section);
		// 기본 리스트 한 개 깔아줌
		const { data: list } = await supabase
			.from('lists')
			.insert({ user_id: this.user.id, section_id: sec.id, title: '할 일', position: 0 })
			.select()
			.single();
		if (list) this.lists.push(list as List);
		this.flash();
	}

	async renameSection(id: string, title: string) {
		const s = this.sections.find((x) => x.id === id);
		if (!s || s.title === title) return;
		const prev = s.title;
		s.title = title;
		const { error } = await supabase.from('sections').update({ title }).eq('id', id);
		if (error) {
			s.title = prev;
			this.error = error.message;
		} else this.flash();
	}

	async removeSection(id: string) {
		const secs = [...this.sections];
		const lists = [...this.lists];
		const cards = [...this.cards];
		const listIds = this.lists.filter((l) => l.section_id === id).map((l) => l.id);
		this.sections = this.sections.filter((s) => s.id !== id);
		this.lists = this.lists.filter((l) => l.section_id !== id);
		this.cards = this.cards.filter((c) => !listIds.includes(c.list_id));
		const { error } = await supabase.from('sections').delete().eq('id', id);
		if (error) {
			this.sections = secs;
			this.lists = lists;
			this.cards = cards;
			this.error = error.message;
		} else this.flash();
	}

	// ── 리스트 CRUD ──────────────────────────────────────────────────
	async addList(sectionId: string) {
		if (!this.user) return;
		const position = this.lists.filter((l) => l.section_id === sectionId).length;
		const { data, error } = await supabase
			.from('lists')
			.insert({ user_id: this.user.id, section_id: sectionId, title: '새 리스트', position })
			.select()
			.single();
		if (error || !data) {
			this.error = error?.message ?? '리스트 추가 실패';
			return;
		}
		this.lists.push(data as List);
		this.flash();
	}

	async renameList(id: string, title: string) {
		const l = this.lists.find((x) => x.id === id);
		if (!l || l.title === title) return;
		const prev = l.title;
		l.title = title;
		const { error } = await supabase.from('lists').update({ title }).eq('id', id);
		if (error) {
			l.title = prev;
			this.error = error.message;
		} else this.flash();
	}

	async removeList(id: string) {
		const lists = [...this.lists];
		const cards = [...this.cards];
		this.lists = this.lists.filter((l) => l.id !== id);
		this.cards = this.cards.filter((c) => c.list_id !== id);
		const { error } = await supabase.from('lists').delete().eq('id', id);
		if (error) {
			this.lists = lists;
			this.cards = cards;
			this.error = error.message;
		} else this.flash();
	}

	// ── 카드 CRUD ────────────────────────────────────────────────────
	async addCard(listId: string) {
		if (!this.user) return;
		const position = this.cards.filter((c) => c.list_id === listId).length;
		const { data, error } = await supabase
			.from('cards')
			.insert({ user_id: this.user.id, list_id: listId, position })
			.select()
			.single();
		if (error || !data) {
			this.error = error?.message ?? '카드 추가 실패';
			return;
		}
		this.cards.push(data as Card);
		this.flash();
	}

	async editCard(id: string, field: 'title' | 'dod' | 'notes', value: string) {
		const c = this.cards.find((x) => x.id === id);
		if (!c || c[field] === value) return;
		const prev = c[field];
		c[field] = value;
		const { error } = await supabase.from('cards').update({ [field]: value }).eq('id', id);
		if (error) {
			c[field] = prev;
			this.error = error.message;
		} else this.flash();
	}

	async removeCard(id: string) {
		const idx = this.cards.findIndex((x) => x.id === id);
		if (idx === -1) return;
		const [removed] = this.cards.splice(idx, 1);
		this.subtasks = this.subtasks.filter((s) => s.card_id !== id);
		if (this.openCardId === id) this.openCardId = null;
		const { error } = await supabase.from('cards').delete().eq('id', id);
		if (error) {
			this.cards.splice(idx, 0, removed);
			this.error = error.message;
		} else this.flash();
	}

	// ── 카드 상세 / 하위 할 일 ──────────────────────────────────────
	openCardDetail(id: string) {
		this.openCardId = id;
	}
	closeCardDetail() {
		this.openCardId = null;
	}

	async addSubtask(cardId: string, title = '') {
		if (!this.user) return;
		const position = this.subtasks.filter((s) => s.card_id === cardId).length;
		const { data, error } = await supabase
			.from('subtasks')
			.insert({ user_id: this.user.id, card_id: cardId, title, position })
			.select()
			.single();
		if (error || !data) {
			this.error = error?.message ?? '하위 할 일 추가 실패';
			return;
		}
		this.subtasks.push(data as Subtask);
		this.flash();
	}

	async toggleSubtask(id: string) {
		const s = this.subtasks.find((x) => x.id === id);
		if (!s) return;
		s.done = !s.done;
		const { error } = await supabase.from('subtasks').update({ done: s.done }).eq('id', id);
		if (error) {
			s.done = !s.done;
			this.error = error.message;
		} else this.flash();
	}

	async editSubtask(id: string, title: string) {
		const s = this.subtasks.find((x) => x.id === id);
		if (!s || s.title === title) return;
		const prev = s.title;
		s.title = title;
		const { error } = await supabase.from('subtasks').update({ title }).eq('id', id);
		if (error) {
			s.title = prev;
			this.error = error.message;
		} else this.flash();
	}

	async removeSubtask(id: string) {
		const idx = this.subtasks.findIndex((x) => x.id === id);
		if (idx === -1) return;
		const [removed] = this.subtasks.splice(idx, 1);
		const { error } = await supabase.from('subtasks').delete().eq('id', id);
		if (error) {
			this.subtasks.splice(idx, 0, removed);
			this.error = error.message;
		} else this.flash();
	}

	/**
	 * 드래그앤드롭: 카드를 다른 리스트/위치로 옮긴다.
	 * @param toListId 목적지 리스트
	 * @param beforeId 이 카드 앞에 삽입(리스트 빈 곳이면 null → 맨 뒤)
	 */
	async moveCard(id: string, toListId: string, beforeId: string | null) {
		const card = this.cards.find((c) => c.id === id);
		if (!card) return;
		const fromListId = card.list_id;
		if (fromListId === toListId && beforeId === id) return;
		const snapshot = this.cards.map((c) => ({ ...c }));

		card.list_id = toListId;

		// 목적지 리스트 재정렬
		const target = this.cards.filter((c) => c.list_id === toListId && c.id !== id).sort(bySortPos);
		let at = target.length;
		if (beforeId && beforeId !== id) {
			const i = target.findIndex((c) => c.id === beforeId);
			if (i !== -1) at = i;
		}
		target.splice(at, 0, card);

		const changed: Card[] = [];
		target.forEach((c, i) => {
			if (c.position !== i) {
				c.position = i;
				if (!changed.includes(c)) changed.push(c);
			}
		});
		if (!changed.includes(card)) changed.push(card); // list_id만 바뀐 경우 보장

		// 원래 리스트도 빈 자리 메우며 재정렬
		if (fromListId !== toListId) {
			const src = this.cards.filter((c) => c.list_id === fromListId).sort(bySortPos);
			src.forEach((c, i) => {
				if (c.position !== i) {
					c.position = i;
					if (!changed.includes(c)) changed.push(c);
				}
			});
		}
		this.cards = [...this.cards];

		try {
			const results = await Promise.all(
				changed.map((c) =>
					supabase.from('cards').update({ list_id: c.list_id, position: c.position }).eq('id', c.id)
				)
			);
			const failed = results.find((r) => r.error);
			if (failed?.error) throw failed.error;
			this.flash();
		} catch (e) {
			this.cards = snapshot;
			this.error = e instanceof Error ? e.message : '카드 이동에 실패했습니다.';
		}
	}

	// ── 전체 초기화 ──────────────────────────────────────────────────
	async reset() {
		if (!this.user) return;
		const uid = this.user.id;
		this.syncing = true;
		try {
			// 섹션 삭제 → 리스트/카드는 ON DELETE CASCADE로 함께 삭제됨
			await supabase.from('sections').delete().eq('user_id', uid);
			await this.seed(uid);
			const today = todayISO();
			const end = addDaysISO(today, DEFAULT_DAYS);
			await supabase.from('boards').update({ start_date: today, end_date: end }).eq('user_id', uid);
			this.start = today;
			this.end = end;
			await this.fetchAll(uid);
			this.flash();
		} catch (e) {
			this.error = e instanceof Error ? e.message : '초기화에 실패했습니다.';
		} finally {
			this.syncing = false;
		}
	}
}

export const board = new Board();
