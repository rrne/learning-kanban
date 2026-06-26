<script lang="ts">
	import { board } from '$lib/board.svelte';
	import { theme } from '$lib/theme.svelte';
	import Section from '$lib/components/Section.svelte';
	import ProgressMeter from '$lib/components/ProgressMeter.svelte';
	import CardDetail from '$lib/components/CardDetail.svelte';

	// 제목 인라인 편집
	let editingTitle = $state(false);
	let titleDraft = $state('');
	function startEditTitle() {
		titleDraft = board.title;
		editingTitle = true;
	}
	function saveTitle() {
		if (!editingTitle) return;
		board.setTitle(titleDraft);
		editingTitle = false;
	}
	function cancelTitle() {
		editingTitle = false;
	}
	function focusInput(node: HTMLInputElement) {
		node.focus();
		node.select();
	}

	// "저장됨" 토스트
	let showSaved = $state(false);
	let timer: ReturnType<typeof setTimeout>;
	$effect(() => {
		if (board.savedTick === 0) return;
		showSaved = true;
		clearTimeout(timer);
		timer = setTimeout(() => (showSaved = false), 900);
	});

	const greeting = $derived(
		board.user?.user_metadata?.user_name ??
			board.user?.user_metadata?.name ??
			board.user?.email ??
			''
	);

	function onReset() {
		if (confirm('모든 카드와 진행상황을 초기화할까요? (DB에서 삭제 후 시드 재생성)')) board.reset();
	}
</script>

<div class="wrap">
	<div class="topbar">
		{#if board.user}
			<div class="headings">
				<div class="eyebrow">Sprint Board · Frontend → Full-stack Builder</div>
				{#if editingTitle}
					<div class="title-edit">
						<input
							class="title-input"
							bind:value={titleDraft}
							use:focusInput
							spellcheck="false"
							onblur={saveTitle}
							onkeydown={(e) => {
								if (e.key === 'Enter') saveTitle();
								else if (e.key === 'Escape') cancelTitle();
							}}
						/>
						<button
							class="title-save"
							title="저장"
							aria-label="제목 저장"
							onmousedown={(e) => e.preventDefault()}
							onclick={saveTitle}
						>
							<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
								<polyline points="20 6 9 17 4 12" />
							</svg>
						</button>
					</div>
				{:else}
					<button class="title editable" title="클릭해서 제목 수정" onclick={startEditTitle}>
						{board.title}
					</button>
				{/if}
			</div>
		{:else}
			<div class="brand">
				<span class="brand-mark" aria-hidden="true">
					<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
						<rect x="2" y="4" width="5.5" height="16" rx="1.6" />
						<rect x="9.25" y="4" width="5.5" height="11" rx="1.6" />
						<rect x="16.5" y="4" width="5.5" height="7" rx="1.6" />
					</svg>
				</span>
				<span class="brand-name">Momentum</span>
			</div>
		{/if}
		<div class="top-actions">
			{#if board.user}
				<div class="user">
					{#if board.user.user_metadata?.avatar_url}
						<img class="avatar" src={board.user.user_metadata.avatar_url} alt="" referrerpolicy="no-referrer" />
					{/if}
					<span class="who">{greeting}</span>
				</div>
				<button class="btn-ghost" onclick={() => board.signOut()}>로그아웃</button>
			{/if}
			<button
				class="theme-toggle"
				onclick={() => theme.toggle()}
				aria-label="테마 전환"
				title={theme.current === 'light' ? '다크 모드로' : '라이트 모드로'}
			>
				{#if theme.current === 'light'}
					<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
					</svg>
				{:else}
					<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<circle cx="12" cy="12" r="4" />
						<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
					</svg>
				{/if}
			</button>
		</div>
	</div>

	{#if board.loading}
		<p class="state">불러오는 중…</p>
	{:else if !board.user}
		<!-- ── 랜딩 / 로그인 ──────────────────────────────── -->
		<section class="hero">
			<p class="hero-eyebrow">CARD · LIST · KANBAN</p>
			<h1 class="hero-title">할 일을,<br /><span class="grad">흐르게.</span></h1>
			<p class="hero-sub">
				섹션 · 리스트 · 카드로 목표를 쪼개고, 드래그로 옮기며 매일의 진행을 봅니다.
				카드마다 상세 기록과 하위 할 일까지 — 모든 건 클라우드에 안전하게 저장돼요.
			</p>

			<div class="hero-cta">
				<button class="gh" onclick={() => board.signInWithGitHub()}>
					<svg viewBox="0 0 16 16" width="19" height="19" aria-hidden="true" fill="currentColor">
						<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
					</svg>
					GitHub로 시작하기
				</button>
				<span class="cta-note">처음이면 자동으로 가입돼요 · 30초면 끝</span>
			</div>

			{#if board.error}<p class="err">{board.error}</p>{/if}

			<ul class="features">
				<li>
					<strong>자유로운 구조</strong>
					<span>섹션·리스트·카드를 원하는 대로 추가하고 드래그로 정리</span>
				</li>
				<li>
					<strong>깊이 있는 카드</strong>
					<span>완료 기준 · 상세 기록 · 하위 할 일 체크리스트</span>
				</li>
				<li>
					<strong>어디서나 이어서</strong>
					<span>클라우드 저장 · 라이트/다크 · 기간 타임라인</span>
				</li>
			</ul>

			<!-- 장식용 미니 보드 미리보기 -->
			<div class="preview" aria-hidden="true">
				<div class="p-col">
					<div class="p-h">할 일</div>
					<div class="p-card">데이터 모델링 <i></i></div>
					<div class="p-card">API 설계</div>
				</div>
				<div class="p-col">
					<div class="p-h">진행 중</div>
					<div class="p-card accent">인증 붙이기 <i></i></div>
				</div>
				<div class="p-col">
					<div class="p-h">완료</div>
					<div class="p-card done">Supabase 연결</div>
				</div>
			</div>
		</section>
	{:else}
		<!-- ── 보드 ──────────────────────────────────────── -->
		<ProgressMeter />

		<div class="controls">
			<label for="start">시작</label>
			<input
				id="start"
				type="date"
				value={board.start}
				max={board.end}
				onchange={(e) => board.setStart(e.currentTarget.value)}
			/>
			<span class="dash">→</span>
			<label for="end">종료</label>
			<input
				id="end"
				type="date"
				value={board.end}
				min={board.start}
				onchange={(e) => board.setEnd(e.currentTarget.value)}
			/>
			<span class="days">{board.metrics.totalDays}일</span>
			{#if board.syncing}<span class="sync">동기화 중…</span>{/if}
			<button class="btn-reset" onclick={onReset}>전체 초기화</button>
		</div>

		{#if board.error}<p class="err">{board.error}</p>{/if}

		{#each board.orderedSections as section (section.id)}
			<Section {section} />
		{/each}

		<button class="add-section" onclick={() => board.addSection()}>+ 새 섹션 추가</button>
	{/if}
</div>

<CardDetail />

<div class="saved" class:show={showSaved}>저장됨</div>

<style>
	/* ── 헤더 ───────────────────────────────────────── */
	.topbar {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 16px;
		margin-bottom: 28px;
	}
	.headings {
		flex: 1;
		min-width: 0;
	}
	.top-actions {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-top: 4px;
		flex-shrink: 0;
	}
	.user {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.avatar {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		border: 1px solid var(--line);
		object-fit: cover;
	}
	.who {
		font-size: 13px;
		font-weight: 500;
		color: var(--text-2);
		max-width: 140px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.theme-toggle {
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 38px;
		height: 38px;
		color: var(--text-2);
		background: var(--card);
		border: 1px solid var(--line);
		border-radius: 10px;
		cursor: pointer;
		transition:
			color 0.15s ease,
			border-color 0.15s ease,
			background 0.15s ease,
			transform 0.15s ease;
	}
	.theme-toggle:hover {
		color: var(--build);
		border-color: var(--line-strong);
		background: var(--card-hover);
		transform: translateY(-1px);
	}

	/* ── 편집 가능한 제목 ───────────────────────────── */
	.title {
		display: block;
		width: 100%;
		max-width: 100%;
		font-family: var(--sans);
		font-size: 30px;
		line-height: 1.18;
		font-weight: 600;
		letter-spacing: -0.025em;
		color: var(--ink);
		text-align: left;
		background: none;
		border: 1px solid transparent;
		border-radius: 9px;
		padding: 3px 9px;
		margin: 8px -9px 0;
		outline: none;
	}
	button.title.editable {
		cursor: pointer;
		transition:
			background 0.15s ease,
			border-color 0.15s ease;
	}
	.title.editable:hover {
		background: var(--tint);
		border-color: var(--line-strong);
	}
	.title.editable:focus-visible {
		background: var(--card);
		border-color: var(--build);
	}
	.title-edit {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 8px 0 0;
	}
	.title-input {
		flex: 1;
		min-width: 0;
		font-family: var(--sans);
		font-size: 30px;
		line-height: 1.18;
		font-weight: 600;
		letter-spacing: -0.025em;
		color: var(--ink);
		background: var(--card);
		border: 1px solid var(--build);
		border-radius: 9px;
		padding: 3px 9px;
		outline: none;
		box-shadow: 0 0 0 2px var(--build-soft);
	}
	.title-save {
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		color: #fff;
		background: var(--build-fill);
		border: none;
		border-radius: 10px;
		cursor: pointer;
		box-shadow: 0 2px 10px rgba(94, 106, 210, 0.4);
		transition: background 0.15s ease;
	}
	.title-save:hover {
		background: #6b77e0;
	}

	.add-section {
		display: block;
		width: 100%;
		font-family: var(--sans);
		font-size: 13.5px;
		font-weight: 600;
		color: var(--muted);
		border: 1px dashed var(--line-strong);
		background: var(--tint);
		border-radius: 12px;
		padding: 16px;
		margin-top: 6px;
		margin-bottom: 40px;
		cursor: pointer;
		transition:
			color 0.15s ease,
			border-color 0.15s ease,
			background 0.15s ease;
	}
	.add-section:hover {
		color: var(--build);
		border-color: var(--build);
		background: var(--build-soft);
	}

	.state {
		font-family: var(--mono);
		font-size: 13px;
		color: var(--muted);
		margin-top: 36px;
	}

	/* ── 로그인 ─────────────────────────────────────── */
	/* ── 브랜드 (로그아웃 헤더) ─────────────────────── */
	.brand {
		display: flex;
		align-items: center;
		gap: 9px;
		margin-top: 2px;
	}
	.brand-mark {
		display: inline-flex;
		color: var(--build);
	}
	.brand-name {
		font-size: 19px;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--ink);
	}

	/* ── 랜딩 히어로 ─────────────────────────────────── */
	.hero {
		text-align: center;
		max-width: 780px;
		margin: clamp(28px, 7vh, 84px) auto 0;
	}
	.hero-eyebrow {
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.24em;
		color: var(--muted);
		margin: 0 0 22px;
	}
	.hero-title {
		font-size: clamp(44px, 8vw, 78px);
		font-weight: 700;
		letter-spacing: -0.045em;
		line-height: 1.03;
		margin: 0;
		color: var(--ink);
	}
	.grad {
		background: linear-gradient(100deg, #a5abff, #5e6ad2);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}
	.hero-sub {
		font-size: clamp(15px, 2.4vw, 18px);
		line-height: 1.65;
		color: var(--text-2);
		max-width: 560px;
		margin: 24px auto 0;
	}
	.hero-cta {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		margin-top: 38px;
	}
	.gh {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		background: var(--build-fill);
		color: #fff;
		border: 1px solid rgba(255, 255, 255, 0.16);
		border-radius: 999px;
		padding: 15px 30px;
		font-family: var(--sans);
		font-size: 15.5px;
		font-weight: 600;
		cursor: pointer;
		box-shadow: 0 1px 0 rgba(255, 255, 255, 0.12) inset, 0 6px 20px rgba(94, 106, 210, 0.4);
		transition:
			transform 0.12s ease,
			background 0.15s ease,
			box-shadow 0.15s ease;
	}
	.gh:hover {
		background: #6b77e0;
		transform: translateY(-2px);
		box-shadow: 0 1px 0 rgba(255, 255, 255, 0.14) inset, 0 10px 28px rgba(94, 106, 210, 0.5);
	}
	.gh:active {
		transform: translateY(0);
	}
	.cta-note {
		font-size: 12.5px;
		color: var(--faint);
	}
	.err {
		color: var(--warn);
		font-family: var(--mono);
		font-size: 12px;
		margin: 14px 0 0;
	}
	.features {
		list-style: none;
		margin: 64px auto 0;
		padding: 0;
		max-width: 760px;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 14px;
		text-align: left;
	}
	.features li {
		background: var(--card);
		border: 1px solid var(--line);
		border-radius: 12px;
		padding: 16px 16px 18px;
	}
	.features strong {
		display: block;
		font-size: 14px;
		font-weight: 600;
		color: var(--ink);
		margin-bottom: 5px;
	}
	.features span {
		font-size: 12.5px;
		line-height: 1.55;
		color: var(--muted);
	}

	/* ── 미니 보드 미리보기 ─────────────────────────── */
	.preview {
		display: flex;
		gap: 12px;
		justify-content: center;
		max-width: 660px;
		margin: 56px auto 40px;
		padding: 16px;
		background: var(--card);
		border: 1px solid var(--line);
		border-radius: 16px;
		box-shadow: var(--shadow);
	}
	.p-col {
		flex: 1;
		min-width: 0;
		background: var(--bg-soft);
		border: 1px solid var(--line);
		border-radius: 12px;
		padding: 10px;
	}
	.p-h {
		font-family: var(--mono);
		font-size: 9.5px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--faint);
		margin: 2px 2px 9px;
	}
	.p-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		background: var(--card);
		border: 1px solid var(--line);
		border-radius: 8px;
		padding: 9px 10px;
		margin-bottom: 7px;
		font-size: 12px;
		font-weight: 550;
		color: var(--text-2);
		box-shadow: var(--shadow-sm);
	}
	.p-card i {
		flex-shrink: 0;
		width: 20px;
		height: 5px;
		border-radius: 3px;
		background: var(--line-strong);
	}
	.p-card.accent {
		box-shadow: inset 3px 0 0 var(--doing), var(--shadow-sm);
	}
	.p-card.done {
		box-shadow: inset 3px 0 0 var(--done), var(--shadow-sm);
		color: var(--muted);
		text-decoration: line-through;
		text-decoration-color: var(--faint);
	}

	@media (max-width: 640px) {
		.features {
			grid-template-columns: 1fr;
		}
	}

	/* ── 툴바 ───────────────────────────────────────── */
	.controls {
		display: flex;
		gap: 8px;
		align-items: center;
		flex-wrap: wrap;
		margin: 0 0 22px;
		padding: 8px 10px;
		background: var(--card);
		border: 1px solid var(--line);
		border-radius: 12px;
	}
	.controls label {
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.04em;
		color: var(--muted);
		padding-left: 4px;
	}
	input[type='date'] {
		font-family: var(--mono);
		font-size: 12px;
		color: var(--ink);
		border: 1px solid var(--line);
		border-radius: 8px;
		padding: 6px 9px;
		background: var(--card-2);
		transition: border-color 0.15s ease;
	}
	input[type='date']:hover {
		border-color: var(--line-strong);
	}
	input[type='date']:focus-visible {
		outline: none;
		border-color: var(--build);
	}
	.dash {
		color: var(--faint);
		font-size: 12px;
	}
	.days {
		font-family: var(--mono);
		font-size: 11px;
		color: var(--build);
		background: var(--build-soft);
		padding: 3px 8px;
		border-radius: 6px;
	}
	.sync {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-family: var(--mono);
		font-size: 11px;
		color: var(--doing);
	}
	.sync::before {
		content: '';
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--doing);
		box-shadow: 0 0 0 0 rgba(91, 140, 255, 0.5);
		animation: pulse 1.4s ease-out infinite;
	}
	@keyframes pulse {
		0% {
			box-shadow: 0 0 0 0 rgba(91, 140, 255, 0.5);
		}
		100% {
			box-shadow: 0 0 0 7px rgba(91, 140, 255, 0);
		}
	}
	.btn-reset {
		margin-left: auto;
	}
	.btn-ghost,
	.btn-reset {
		font-family: var(--sans);
		font-size: 12px;
		font-weight: 500;
		color: var(--text-2);
		background: var(--card-2);
		border: 1px solid var(--line);
		border-radius: 8px;
		padding: 6px 12px;
		cursor: pointer;
		transition:
			color 0.15s ease,
			border-color 0.15s ease,
			background 0.15s ease;
	}
	.btn-ghost:hover {
		color: var(--ink);
		border-color: var(--line-strong);
		background: var(--card-hover);
	}
	.btn-reset:hover {
		color: var(--warn);
		border-color: var(--warn);
		background: var(--warn-soft);
	}

	/* ── 저장됨 토스트 ──────────────────────────────── */
	.saved {
		position: fixed;
		bottom: 22px;
		left: 50%;
		transform: translateX(-50%) translateY(8px);
		background: var(--card-2);
		color: var(--ink);
		border: 1px solid var(--line-strong);
		font-family: var(--mono);
		font-size: 11px;
		padding: 8px 14px;
		border-radius: 999px;
		box-shadow: var(--shadow);
		opacity: 0;
		transition:
			opacity 0.25s ease,
			transform 0.25s ease;
		pointer-events: none;
	}
	.saved::before {
		content: '✓ ';
		color: var(--done);
	}
	.saved.show {
		opacity: 1;
		transform: translateX(-50%) translateY(0);
	}

	/* ── 모바일 ──────────────────────────────────────── */
	@media (max-width: 600px) {
		.topbar {
			gap: 10px;
			margin-bottom: 22px;
		}
		.title,
		.title-input {
			font-size: 23px;
			margin-top: 6px;
		}
		.title {
			padding: 3px 7px;
			margin-left: -7px;
			margin-right: -7px;
		}
		.who {
			display: none;
		}
		.theme-toggle {
			width: 36px;
			height: 36px;
		}
		.controls {
			gap: 6px;
		}
		.btn-reset {
			margin-left: 0;
		}
		.hero {
			margin-top: 24px;
		}
		.features {
			margin-top: 40px;
		}
		.preview {
			margin-top: 40px;
			padding: 12px;
			gap: 8px;
		}
		.p-h {
			font-size: 9px;
		}
		.p-card {
			font-size: 11px;
			padding: 8px;
		}
	}
</style>
