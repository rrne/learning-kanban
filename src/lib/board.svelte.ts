import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { SEED, TOTAL_DAYS } from './data';
import type { Card, LaneKey, Metrics, Status } from './types';

function todayISO(): string {
	const d = new Date();
	d.setHours(0, 0, 0, 0);
	return d.toISOString().slice(0, 10);
}

function daysBetween(a: Date, b: Date): number {
	return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

function computeMetrics(cards: Card[], start: string): Metrics {
	const startDate = new Date(start + 'T00:00:00');
	const now = new Date();
	now.setHours(0, 0, 0, 0);
	const elapsed = Math.max(0, Math.min(TOTAL_DAYS, daysBetween(startDate, now)));
	const timePct = Math.round((elapsed / TOTAL_DAYS) * 100);
	const done = cards.filter((c) => c.status === 'done').length;
	const total = cards.length;
	const donePct = total ? Math.round((done / total) * 100) : 0;
	return {
		timePct,
		donePct,
		remaining: Math.max(0, TOTAL_DAYS - elapsed),
		done,
		total,
		behind: donePct < timePct - 8
	};
}

/**
 * 보드 상태 + 동작 싱글톤.
 * 이제 진짜 백엔드(Supabase)와 대화한다:
 *  - 인증(GitHub OAuth) 상태를 들고 있고
 *  - cards/boards 테이블을 읽고, 변경은 낙관적 업데이트 후 DB에 반영하며
 *  - 첫 로그인 사용자에게는 시드 카드를 만들어준다.
 * RLS 덕분에 쿼리에 user_id 조건을 빼먹어도 남의 데이터는 절대 안 보인다(이중 안전).
 */
class Board {
	user = $state<User | null>(null);
	/** 초기 세션/데이터 로딩 중 여부 */
	loading = $state(true);
	/** 카드를 DB에서 불러오는 중 */
	syncing = $state(false);
	error = $state<string | null>(null);

	cards = $state<Card[]>([]);
	start = $state<string>(todayISO());
	/** "저장됨" 토스트 트리거 */
	savedTick = $state(0);

	metrics = $derived.by<Metrics>(() => computeMetrics(this.cards, this.start));
	doingCount = $derived(this.cards.filter((c) => c.status === 'doing').length);

	/** 앱 시작 시 1회: 세션 복원 + 인증 변화 구독 */
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
				this.cards = [];
				this.start = todayISO();
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
		this.cards = [];
		this.user = null;
	}

	/** 로그인된 사용자의 보드/카드 로드 (없으면 생성·시드) */
	async loadData() {
		if (!this.user) return;
		this.syncing = true;
		this.error = null;
		try {
			const uid = this.user.id;

			// 1) boards 행 보장
			const { data: boardRow } = await supabase
				.from('boards')
				.select('start_date')
				.eq('user_id', uid)
				.maybeSingle();
			if (boardRow) {
				this.start = boardRow.start_date as string;
			} else {
				await supabase.from('boards').insert({ user_id: uid });
				this.start = todayISO();
			}

			// 2) cards 로드 (없으면 시드)
			const { data: rows, error } = await supabase
				.from('cards')
				.select('*')
				.eq('user_id', uid)
				.order('position', { ascending: true });
			if (error) throw error;

			this.cards = rows && rows.length > 0 ? (rows as Card[]) : await this.seed(uid);
		} catch (e) {
			this.error = e instanceof Error ? e.message : '데이터를 불러오지 못했습니다.';
		} finally {
			this.syncing = false;
		}
	}

	private async seed(uid: string): Promise<Card[]> {
		const payload = SEED.map(([month, title, dod], i) => ({
			user_id: uid,
			month: String(month),
			title,
			dod,
			status: 'todo' as Status,
			position: i
		}));
		const { data, error } = await supabase.from('cards').insert(payload).select();
		if (error) throw error;
		return (data ?? []) as Card[];
	}

	private flash() {
		this.savedTick++;
	}

	cardsIn(lane: LaneKey): Card[] {
		return this.cards.filter((c) => c.month === String(lane));
	}

	async setStart(date: string) {
		if (!this.user) return;
		this.start = date;
		await supabase.from('boards').update({ start_date: date }).eq('user_id', this.user.id);
		this.flash();
	}

	async move(id: string, status: Status) {
		const c = this.cards.find((x) => x.id === id);
		if (!c) return;
		const prev = c.status;
		c.status = status; // 낙관적
		const { error } = await supabase.from('cards').update({ status }).eq('id', id);
		if (error) {
			c.status = prev; // 롤백
			this.error = error.message;
		} else {
			this.flash();
		}
	}

	async add(month: LaneKey) {
		if (!this.user) return;
		const position = this.cards.length;
		const { data, error } = await supabase
			.from('cards')
			.insert({ user_id: this.user.id, month: String(month), position })
			.select()
			.single();
		if (error) {
			this.error = error.message;
			return;
		}
		this.cards.push(data as Card);
		this.flash();
	}

	async remove(id: string) {
		const idx = this.cards.findIndex((x) => x.id === id);
		if (idx === -1) return;
		const [removed] = this.cards.splice(idx, 1); // 낙관적
		const { error } = await supabase.from('cards').delete().eq('id', id);
		if (error) {
			this.cards.splice(idx, 0, removed); // 롤백
			this.error = error.message;
		} else {
			this.flash();
		}
	}

	async edit(id: string, field: 'title' | 'dod', value: string) {
		const c = this.cards.find((x) => x.id === id);
		if (!c || c[field] === value) return;
		const prev = c[field];
		c[field] = value; // 낙관적
		const { error } = await supabase.from('cards').update({ [field]: value }).eq('id', id);
		if (error) {
			c[field] = prev;
			this.error = error.message;
		} else {
			this.flash();
		}
	}

	/** 전체 초기화: 내 카드 전부 삭제 후 시드 재생성 + 시작일 오늘로 */
	async reset() {
		if (!this.user) return;
		const uid = this.user.id;
		this.syncing = true;
		try {
			await supabase.from('cards').delete().eq('user_id', uid);
			this.cards = await this.seed(uid);
			const today = todayISO();
			await supabase.from('boards').update({ start_date: today }).eq('user_id', uid);
			this.start = today;
			this.flash();
		} catch (e) {
			this.error = e instanceof Error ? e.message : '초기화에 실패했습니다.';
		} finally {
			this.syncing = false;
		}
	}
}

export const board = new Board();
