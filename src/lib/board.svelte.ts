import { browser } from '$app/environment';
import { SEED, TOTAL_DAYS } from './data';
import type { BoardState, Card, LaneKey, Metrics, Status } from './types';

const KEY = 'fs3m-kanban-v2';

function uid(): string {
	if (browser && 'randomUUID' in crypto) return crypto.randomUUID();
	return 'c' + Math.floor(Math.random() * 1e9).toString(36);
}

function todayISO(): string {
	const d = new Date();
	d.setHours(0, 0, 0, 0);
	return d.toISOString().slice(0, 10);
}

function freshState(): BoardState {
	return {
		start: todayISO(),
		cards: SEED.map(([month, title, dod]) => ({
			id: uid(),
			month,
			title,
			dod,
			status: 'todo' as Status
		}))
	};
}

function loadInitial(): BoardState {
	if (browser) {
		try {
			const raw = localStorage.getItem(KEY);
			if (raw) return JSON.parse(raw) as BoardState;
		} catch {
			/* 손상된 데이터는 무시하고 새로 시작 */
		}
	}
	return freshState();
}

function daysBetween(a: Date, b: Date): number {
	return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

function computeMetrics(s: BoardState): Metrics {
	const start = new Date(s.start + 'T00:00:00');
	const now = new Date();
	now.setHours(0, 0, 0, 0);
	const elapsed = Math.max(0, Math.min(TOTAL_DAYS, daysBetween(start, now)));
	const timePct = Math.round((elapsed / TOTAL_DAYS) * 100);
	const done = s.cards.filter((c) => c.status === 'done').length;
	const total = s.cards.length;
	const donePct = total ? Math.round((done / total) * 100) : 0;
	return {
		timePct,
		donePct,
		remaining: Math.max(0, TOTAL_DAYS - elapsed),
		done,
		total,
		// 시간 경과보다 완료율이 8%p 넘게 뒤처지면 "뒤처짐"
		behind: donePct < timePct - 8
	};
}

/**
 * 보드 상태 + 동작을 한곳에 모은 싱글톤.
 * Svelte 5 룬($state/$derived)으로 반응성을 갖고, 변경 시마다 localStorage에 저장한다.
 */
class Board {
	data = $state<BoardState>(loadInitial());
	/** 방금 저장됨 토스트 트리거용 카운터 */
	savedTick = $state(0);

	metrics = $derived.by<Metrics>(() => computeMetrics(this.data));
	doingCount = $derived(this.data.cards.filter((c) => c.status === 'doing').length);

	private save() {
		if (!browser) return;
		try {
			localStorage.setItem(KEY, JSON.stringify(this.data));
			this.savedTick++;
		} catch {
			/* 저장 실패는 조용히 무시 */
		}
	}

	cardsIn(lane: LaneKey): Card[] {
		return this.data.cards.filter((c) => String(c.month) === String(lane));
	}

	setStart(date: string) {
		this.data.start = date;
		this.save();
	}

	move(id: string, status: Status) {
		const c = this.data.cards.find((x) => x.id === id);
		if (c) {
			c.status = status;
			this.save();
		}
	}

	add(month: LaneKey) {
		this.data.cards.push({ id: uid(), month, title: '새 작업', dod: '완료 기준을 적기', status: 'todo' });
		this.save();
	}

	remove(id: string) {
		this.data.cards = this.data.cards.filter((x) => x.id !== id);
		this.save();
	}

	edit(id: string, field: 'title' | 'dod', value: string) {
		const c = this.data.cards.find((x) => x.id === id);
		if (c && c[field] !== value) {
			c[field] = value;
			this.save();
		}
	}

	reset() {
		this.data = freshState();
		this.save();
	}
}

export const board = new Board();
