<script lang="ts">
	import { board } from '$lib/board.svelte';
	import { LANES } from '$lib/data';
	import Lane from '$lib/components/Lane.svelte';
	import ProgressMeter from '$lib/components/ProgressMeter.svelte';

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
	<div class="eyebrow">3-Month Sprint · Frontend → Full-stack Builder</div>
	<h1>제품 하나를 <b>처음부터 끝까지</b> 출시하기</h1>

	{#if board.loading}
		<p class="state">불러오는 중…</p>
	{:else if !board.user}
		<!-- ── 로그인 화면 ────────────────────────────────── -->
		<div class="login">
			<p class="login-lead">진행 상황을 클라우드에 저장하고 어느 기기에서나 이어서 관리하세요.</p>
			<button class="gh" onclick={() => board.signInWithGitHub()}>
				<svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true" fill="currentColor">
					<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
				</svg>
				GitHub로 로그인
			</button>
			{#if board.error}<p class="err">{board.error}</p>{/if}
		</div>
	{:else}
		<!-- ── 보드 ──────────────────────────────────────── -->
		<ProgressMeter />

		<div class="controls">
			<label for="start">시작일</label>
			<input
				id="start"
				type="date"
				value={board.start}
				onchange={(e) => board.setStart(e.currentTarget.value)}
			/>
			{#if board.syncing}<span class="sync">동기화 중…</span>{/if}
			<span class="who">{greeting}</span>
			<button class="btn-ghost" onclick={() => board.signOut()}>로그아웃</button>
			<button class="btn-reset" onclick={onReset}>전체 초기화</button>
		</div>

		{#if board.error}<p class="err">{board.error}</p>{/if}

		{#each LANES as lane (lane.key)}
			<Lane {lane} />
		{/each}
	{/if}
</div>

<div class="saved" class:show={showSaved}>저장됨</div>

<style>
	.state {
		font-family: var(--mono);
		font-size: 13px;
		color: var(--muted);
		margin-top: 30px;
	}
	.login {
		margin: 40px 0;
		background: var(--card);
		border: 1px solid var(--line);
		border-radius: 12px;
		padding: 32px 24px;
		text-align: center;
	}
	.login-lead {
		font-size: 14px;
		color: var(--muted);
		margin: 0 0 20px;
	}
	.gh {
		display: inline-flex;
		align-items: center;
		gap: 9px;
		background: var(--ink);
		color: #fff;
		border: none;
		border-radius: 9px;
		padding: 11px 18px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
	}
	.gh:hover {
		background: #000;
	}
	.err {
		color: var(--warn);
		font-family: var(--mono);
		font-size: 12px;
		margin: 12px 0 0;
	}
	.controls {
		display: flex;
		gap: 8px;
		align-items: center;
		flex-wrap: wrap;
		margin: -8px 0 18px;
	}
	.controls label {
		font-family: var(--mono);
		font-size: 11px;
		color: var(--muted);
	}
	input[type='date'] {
		font-family: var(--mono);
		font-size: 12px;
		border: 1px solid var(--line);
		border-radius: 7px;
		padding: 5px 8px;
		background: var(--card);
	}
	.sync {
		font-family: var(--mono);
		font-size: 11px;
		color: var(--doing);
	}
	.who {
		margin-left: auto;
		font-family: var(--mono);
		font-size: 11px;
		color: var(--muted);
	}
	.btn-ghost,
	.btn-reset {
		font-family: var(--mono);
		font-size: 11px;
		color: var(--muted);
		background: none;
		border: 1px solid var(--line);
		border-radius: 7px;
		padding: 6px 10px;
		cursor: pointer;
	}
	.btn-ghost:hover {
		color: var(--ink);
		border-color: var(--ink);
	}
	.btn-reset:hover {
		color: var(--warn);
		border-color: var(--warn);
	}
	.saved {
		position: fixed;
		bottom: 16px;
		left: 50%;
		transform: translateX(-50%);
		background: var(--ink);
		color: #fff;
		font-family: var(--mono);
		font-size: 11px;
		padding: 6px 12px;
		border-radius: 999px;
		opacity: 0;
		transition: opacity 0.25s;
		pointer-events: none;
	}
	.saved.show {
		opacity: 0.92;
	}
</style>
