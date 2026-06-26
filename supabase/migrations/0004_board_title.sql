-- 보드 상단 제목을 사용자가 직접 수정할 수 있도록 boards에 title 컬럼 추가.
alter table public.boards
	add column if not exists title text not null default '제품 하나를 처음부터 끝까지 출시하기';
