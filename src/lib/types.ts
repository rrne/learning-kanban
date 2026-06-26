// 칸반 도메인 타입 — 자유 구조(Trello식): 섹션 → 리스트 → 카드.
// 모든 행은 user_id로 소유자를 구분하고 RLS로 "본인 데이터만" 접근하게 강제한다.

/** 섹션: 보드 안의 큰 묶음 (예: "1개월차", "내 제품 기능") */
export interface Section {
	id: string;
	title: string;
	position: number;
}

/** 리스트: 섹션 안의 컬럼 (예: "할 일", "진행 중", "완료" — 자유롭게 추가/이름변경) */
export interface List {
	id: string;
	section_id: string;
	title: string;
	position: number;
}

/** 카드: 리스트 안의 한 장 */
export interface Card {
	id: string;
	list_id: string;
	title: string;
	/** Definition of Done — 이 카드를 "완료"로 부를 수 있는 기준 (선택) */
	dod: string;
	/** 상세 기록/메모 (카드 상세 화면에서 작성) */
	notes: string;
	position: number;
}

/** 하위 할 일: 카드 안의 체크리스트 항목 */
export interface Subtask {
	id: string;
	card_id: string;
	title: string;
	done: boolean;
	position: number;
}

/** 진행 타임라인 지표 (시작일~종료일 기준) */
export interface Metrics {
	/** 경과 시간 비율 (%) */
	timePct: number;
	/** 종료일까지 남은 일수 */
	remaining: number;
	/** 시작일~종료일 전체 일수 */
	totalDays: number;
}
