<script lang="ts">
	import { board } from '$lib/board.svelte';
	import { COL_LABEL, STATUSES, WIP_LIMIT } from '$lib/data';
	import type { LaneKey } from '$lib/types';
	import Card from './Card.svelte';

	let { lane }: { lane: { key: LaneKey; m: string; t: string } } = $props();

	const cards = $derived(board.cardsIn(lane.key));
	const done = $derived(cards.filter((c) => c.status === 'done').length);
</script>

<div class="lane">
	<div class="lane-head">
		<span class="m">{lane.m}</span>
		<span class="t">{lane.t}</span>
		<span class="g">{done}/{cards.length} 완료</span>
	</div>

	<div class="cols">
		{#each STATUSES as st (st)}
			{@const inCol = cards.filter((c) => c.status === st)}
			{@const over = st === 'doing' && board.doingCount > WIP_LIMIT}
			<div class="col">
				<div class="col-h" class:over>
					<span>{COL_LABEL[st]}</span>
					{#if st === 'doing'}<span>{board.doingCount}/{WIP_LIMIT}</span>{/if}
				</div>

				{#each inCol as card (card.id)}
					<Card {card} />
				{/each}

				{#if st === 'todo'}
					<button class="add" onclick={() => board.add(lane.key)}>+ 카드 추가</button>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.lane {
		margin-bottom: 14px;
		background: rgba(255, 255, 255, 0.55);
		border: 1px solid var(--line);
		border-radius: 12px;
		overflow: hidden;
	}
	.lane-head {
		display: flex;
		align-items: baseline;
		gap: 10px;
		padding: 12px 16px;
		border-bottom: 1px solid var(--line);
		background: rgba(255, 255, 255, 0.7);
	}
	.lane-head .m {
		font-family: var(--mono);
		font-size: 11px;
		letter-spacing: 0.12em;
		color: var(--build);
		font-weight: 700;
	}
	.lane-head .t {
		font-weight: 650;
		font-size: 14px;
	}
	.lane-head .g {
		margin-left: auto;
		font-family: var(--mono);
		font-size: 11px;
		color: var(--muted);
	}
	.cols {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 0;
	}
	.col {
		padding: 10px;
		border-right: 1px solid var(--line);
		min-height: 60px;
	}
	.col:last-child {
		border-right: none;
	}
	.col-h {
		font-family: var(--mono);
		font-size: 10px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--muted);
		margin: 2px 4px 8px;
		display: flex;
		justify-content: space-between;
	}
	.col-h.over {
		color: var(--warn);
		font-weight: 700;
	}
	.add {
		width: 100%;
		font-family: var(--mono);
		font-size: 11px;
		color: var(--muted);
		border: 1px dashed var(--line);
		background: none;
		border-radius: 7px;
		padding: 7px;
		cursor: pointer;
	}
	.add:hover {
		color: var(--build);
		border-color: var(--build);
	}

	@media (max-width: 680px) {
		.cols {
			grid-template-columns: 1fr;
		}
		.col {
			border-right: none;
			border-bottom: 1px solid var(--line);
		}
		.col:last-child {
			border-bottom: none;
		}
	}
</style>
