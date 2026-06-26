import type { LaneKey, Status } from './types';

/** 스프린트 총 기간 (일) */
export const TOTAL_DAYS = 90;

/** 칸반 컬럼 순서 */
export const STATUSES: Status[] = ['todo', 'doing', 'done'];

/** WIP(동시 진행) 상한 — "끝내는 힘"을 기르기 위한 제약 */
export const WIP_LIMIT = 2;

/** 컬럼 라벨 */
export const COL_LABEL: Record<Status, string> = {
	todo: '할 일',
	doing: `진행 중 (WIP≤${WIP_LIMIT})`,
	done: '완료'
};

/** 레인(달) 정의 */
export const LANES: { key: LaneKey; m: string; t: string }[] = [
	{ key: 1, m: 'MONTH 01', t: '백엔드 사고로 전환 — 데이터 + API' },
	{ key: 2, m: 'MONTH 02', t: '끝까지 연결 + 배포 + 운영 기초' },
	{ key: 3, m: 'MONTH 03', t: '이해 깊이 + 이직 무기화' },
	{ key: 'domain', m: 'DOMAIN', t: '내 제품 핵심 기능 — 직접 채우기' }
];

/** 초기 카드 시드: [레인, 제목, 완료기준] */
export const SEED: [LaneKey, string, string][] = [
	[1, '제품 1개 선정 (내가 실제 쓸 것)', '도메인·핵심 기능을 3줄로 적었다'],
	[1, '데이터 모델링: 테이블·관계·정규화', 'ERD 그림 1장 완성'],
	[1, 'SQL 기본 + Supabase로 DB 구축', '테이블 생성 + 쿼리 직접 작성'],
	[1, 'Next.js route handler로 API 설계', 'CRUD 엔드포인트가 동작'],
	[1, '인증 붙이기 (Supabase Auth)', '로그인/로그아웃이 된다'],
	[2, '내 FE를 내 백엔드에 연결 (전체 루프)', '화면에서 생성→저장→조회가 흐른다'],
	[2, 'Vercel 배포 + 환경변수/시크릿 관리', '공개 URL로 접속된다'],
	[2, '에러 핸들링 + 기본 로깅/관측', '실패 케이스가 사용자에게 안내된다'],
	[2, 'AWS는 교양 수준만 (DB위치·스토리지·환경·비용)', '무엇이 추상화됐는지 말로 설명 가능'],
	[3, '보안: RLS · 입력 검증 · 인증 엣지케이스', '남의 데이터 접근이 차단됨을 확인'],
	[3, '성능 점검 + 리팩터링', '명백한 병목 1개를 개선'],
	[3, '아키텍처 README ("왜 이렇게 설계했나")', '기술적 의사결정 3개의 이유를 기술'],
	[3, '화이트보드 설명 연습', '5분 안에 시스템 구조 설명 가능'],
	[3, '경력기술서 "백엔드 기반 풀스택" 정체성 선언', '성과 수치 1개 이상 포함'],
	['domain', '(여기 클릭해 핵심 기능 1을 적기)', '이 기능의 완료 기준을 적기'],
	['domain', '(핵심 기능 2)', '완료 기준']
];
