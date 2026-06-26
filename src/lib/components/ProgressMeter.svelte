<script lang="ts">
	import { board } from '$lib/board.svelte';

	const m = $derived(board.metrics);
</script>

<div class="meter">
	<div class="row">
		<span class="big">
			<strong>{m.remaining}일</strong> 남음 · 전체 {m.totalDays}일 · 카드 {board.cardCount}장
		</span>
		<span class="pct">{m.timePct}% 경과</span>
	</div>

	<div class="track">
		<div class="bar" style="width:{m.timePct}%"></div>
		<div class="now" style="left:{m.timePct}%"><span>오늘</span></div>
	</div>
</div>

<style>
	.meter {
		margin: 0 0 26px;
		background: var(--card);
		border: 1px solid var(--line);
		border-radius: var(--radius);
		padding: 18px 22px 20px;
		box-shadow: var(--shadow-sm);
	}
	.row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 12px;
		flex-wrap: wrap;
	}
	.big {
		font-size: 14px;
		color: var(--muted);
		letter-spacing: -0.01em;
	}
	.big strong {
		color: var(--ink);
		font-weight: 600;
	}
	.pct {
		font-family: var(--mono);
		font-size: 11.5px;
		font-weight: 500;
		color: var(--build);
		background: var(--build-soft);
		border: 1px solid transparent;
		padding: 4px 11px;
		border-radius: 999px;
	}
	.track {
		position: relative;
		height: 10px;
		margin-top: 16px;
		border-radius: 999px;
		background: var(--bg-soft);
		border: 1px solid var(--line);
		overflow: hidden;
	}
	.bar {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		background: linear-gradient(90deg, rgba(94, 106, 210, 0.5), var(--build-fill));
		transition: width 0.45s cubic-bezier(0.4, 0, 0.2, 1);
	}
	.now {
		position: absolute;
		top: -5px;
		bottom: -5px;
		width: 2px;
		background: var(--build);
		box-shadow: 0 0 10px rgba(141, 147, 255, 0.7);
		transition: left 0.45s cubic-bezier(0.4, 0, 0.2, 1);
	}
	.now span {
		position: absolute;
		top: -18px;
		left: 50%;
		transform: translateX(-50%);
		font-family: var(--mono);
		font-size: 10px;
		color: var(--build);
		white-space: nowrap;
	}
</style>
