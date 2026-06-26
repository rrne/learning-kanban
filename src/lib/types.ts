// 칸반 도메인 타입 — 백엔드 사고로 전환하기 위한 첫 단계: "데이터 모델"을 먼저 정의한다.

/** 카드가 가질 수 있는 상태 (칸반 컬럼) */
export type Status = 'todo' | 'doing' | 'done';

/** 레인(달) 식별자. 1·2·3월차 또는 자유 도메인 레인. */
export type LaneKey = 1 | 2 | 3 | 'domain';

/** 학습 카드 한 장 (DB의 cards 행과 1:1) */
export interface Card {
	id: string;
	/** 레인 식별자. DB에는 문자열로 저장된다 ('1' | '2' | '3' | 'domain') */
	month: string;
	title: string;
	/** Definition of Done — 이 카드를 "완료"로 부를 수 있는 기준 */
	dod: string;
	status: Status;
	position: number;
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
