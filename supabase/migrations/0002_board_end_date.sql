-- 스프린트 기간을 90일 고정에서 "시작일 ~ 종료일" 자유 지정으로 변경.
-- boards에 end_date 컬럼 추가 (기본값: 시작일로부터 90일 뒤).

alter table public.boards add column if not exists end_date date;

-- 기존 행 백필: 종료일 = 시작일 + 90일
update public.boards set end_date = start_date + 90 where end_date is null;

-- 새 보드 기본값 + NOT NULL
alter table public.boards alter column end_date set default (current_date + 90);
alter table public.boards alter column end_date set not null;
