<script lang="ts">
	import { board } from '$lib/board.svelte';
	import { LANES } from '$lib/data';
	import Lane from '$lib/components/Lane.svelte';
	import ProgressMeter from '$lib/components/ProgressMeter.svelte';

	// "저장됨" 토스트: savedTick이 바뀔 때마다 잠깐 보여준다.
	let showSaved = $state(false);
	let timer: ReturnType<typeof setTimeout>;
	$effect(() => {
		if (board.savedTick === 0) return;
		showSaved = true;
		clearTimeout(timer);
		timer = setTimeout(() => (showSaved = false), 900);
	});

	function onReset() {
		if (confirm('모든 카드와 진행상황을 초기화할까요?')) board.reset();
	}
</script>

<div class="wrap">
	<div class="eyebrow">3-Month Sprint · Frontend → Full-stack Builder</div>
	<h1>제품 하나를 <b>처음부터 끝까지</b> 출시하기</h1>

	<ProgressMeter />

	<div class="controls">
		<label for="start">시작일</label>
		<input
			id="start"
			type="date"
			value={board.data.start}
			onchange={(e) => board.setStart(e.currentTarget.value)}
		/>
		<button class="btn-reset" onclick={onReset}>전체 초기화</button>
	</div>

	{#each LANES as lane (lane.key)}
		<Lane {lane} />
	{/each}
</div>

<div class="saved" class:show={showSaved}>저장됨</div>

<style>
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
	.btn-reset {
		margin-left: auto;
		font-family: var(--mono);
		font-size: 11px;
		color: var(--muted);
		background: none;
		border: 1px solid var(--line);
		border-radius: 7px;
		padding: 6px 10px;
		cursor: pointer;
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
