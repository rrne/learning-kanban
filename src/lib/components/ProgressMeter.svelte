<script lang="ts">
	import { board } from '$lib/board.svelte';

	const m = $derived(board.metrics);
</script>

<div class="meter">
	<div class="row">
		<span class="big">
			<strong>{m.remaining}일</strong> 남음 · 완료 <strong>{m.done}/{m.total}</strong>
		</span>
		{#if m.behind}
			<span class="verdict v-behind">뒤처짐 · 완료 {m.donePct}% &lt; 시간 {m.timePct}%</span>
		{:else}
			<span class="verdict v-ok">페이스 OK · 완료 {m.donePct}% / 시간 {m.timePct}%</span>
		{/if}
	</div>

	<div class="track">
		<div class="bar-done" style="width:{m.donePct}%"></div>
		<div class="now" style="left:{m.timePct}%"><span>오늘</span></div>
	</div>

	<div class="legend">
		<span><i style="background:var(--done-soft);border:1px solid var(--done)"></i>완료한 일 ({m.donePct}%)</span>
		<span><i style="background:var(--build)"></i>오늘 = 시간 경과 ({m.timePct}%)</span>
		<span>· 초록 막대가 주황 선보다 뒤면 뒤처지는 중</span>
	</div>
</div>

<style>
	.meter {
		margin: 18px 0 26px;
		background: var(--card);
		border: 1px solid var(--line);
		border-radius: 12px;
		padding: 16px 18px;
	}
	.row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 12px;
		flex-wrap: wrap;
	}
	.big {
		font-family: var(--mono);
		font-size: 13px;
		color: var(--muted);
	}
	.big strong {
		color: var(--ink);
	}
	.verdict {
		font-family: var(--mono);
		font-size: 12px;
		font-weight: 700;
		padding: 3px 9px;
		border-radius: 999px;
	}
	.v-ok {
		background: var(--done-soft);
		color: var(--done);
	}
	.v-behind {
		background: var(--warn-soft);
		color: var(--warn);
	}
	.track {
		position: relative;
		height: 30px;
		margin-top: 14px;
		border-radius: 7px;
		background: #eef1f6;
		border: 1px solid var(--line);
		overflow: hidden;
	}
	.bar-done {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		background: var(--done-soft);
		transition: width 0.3s ease;
	}
	.bar-done::after {
		content: '';
		position: absolute;
		right: 0;
		top: 0;
		height: 100%;
		width: 2px;
		background: var(--done);
	}
	.now {
		position: absolute;
		top: -5px;
		bottom: -5px;
		width: 2px;
		background: var(--build);
	}
	.now span {
		position: absolute;
		top: -17px;
		left: 50%;
		transform: translateX(-50%);
		font-family: var(--mono);
		font-size: 10px;
		color: var(--build);
		white-space: nowrap;
	}
	.legend {
		display: flex;
		gap: 16px;
		margin-top: 16px;
		font-family: var(--mono);
		font-size: 11px;
		color: var(--muted);
		flex-wrap: wrap;
	}
	.legend i {
		display: inline-block;
		width: 10px;
		height: 10px;
		border-radius: 2px;
		margin-right: 5px;
		vertical-align: -1px;
	}
</style>
