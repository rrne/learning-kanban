// 칸반 도메인 타입 — 백엔드 사고로 전환하기 위한 첫 단계: "데이터 모델"을 먼저 정의한다.

/** 카드가 가질 수 있는 상태 (칸반 컬럼) */
export type Status = 'todo' | 'doing' | 'done';

/** 레인(달) 식별자. 1·2·3월차 또는 자유 도메인 레인. */
export type LaneKey = 1 | 2 | 3 | 'domain';

/** 학습 카드 한 장 */
export interface Card {
	id: string;
	month: LaneKey;
	title: string;
	/** Definition of Done — 이 카드를 "완료"로 부를 수 있는 기준 */
	dod: string;
	status: Status;
}

/** 보드 전체 상태 (localStorage에 직렬화되는 단위) */
export interface BoardState {
	/** 스프린트 시작일 (YYYY-MM-DD) */
	start: string;
	cards: Card[];
}

/** 진행 페이스 지표 */
export interface Metrics {
	timePct: number;
	donePct: number;
	remaining: number;
	done: number;
	total: number;
	behind: boolean;
}
