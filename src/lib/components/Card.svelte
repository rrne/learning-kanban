<script lang="ts">
	import { board } from '$lib/board.svelte';
	import type { Card } from '$lib/types';

	let { card }: { card: Card } = $props();

	function onEdit(field: 'title' | 'dod', e: FocusEvent) {
		const el = e.currentTarget as HTMLElement;
		board.edit(card.id, field, el.textContent?.trim() ?? '');
	}
</script>

<div class="card s-{card.status}">
	<div class="ttl" contenteditable="true" onblur={(e) => onEdit('title', e)}>{card.title}</div>
	<div class="dod" contenteditable="true" onblur={(e) => onEdit('dod', e)}>{card.dod}</div>

	<div class="foot">
		{#if card.status === 'todo'}
			<button class="mv" onclick={() => board.move(card.id, 'doing')}>시작 ▶</button>
		{:else if card.status === 'doing'}
			<button class="mv" onclick={() => board.move(card.id, 'todo')}>◀</button>
			<button class="mv" onclick={() => board.move(card.id, 'done')}>완료 ▶</button>
		{:else}
			<button class="mv" onclick={() => board.move(card.id, 'doing')}>◀ 되돌리기</button>
		{/if}
		<button class="del" aria-label="카드 삭제" onclick={() => board.remove(card.id)}>×</button>
	</div>
</div>

<style>
	.card {
		background: var(--card);
		border: 1px solid var(--line);
		border-left: 3px solid var(--line);
		border-radius: 8px;
		padding: 9px 10px;
		margin-bottom: 8px;
		box-shadow: 0 1px 0 rgba(20, 24, 31, 0.03);
	}
	.s-doing {
		border-left-color: var(--doing);
	}
	.s-done {
		border-left-color: var(--done);
		opacity: 0.72;
	}
	.ttl {
		font-size: 13px;
		font-weight: 600;
		line-height: 1.35;
		outline: none;
	}
	.s-done .ttl {
		text-decoration: line-through;
		text-decoration-color: var(--muted);
	}
	.dod {
		font-family: var(--mono);
		font-size: 10.5px;
		color: var(--muted);
		margin-top: 5px;
		line-height: 1.45;
		outline: none;
	}
	.dod::before {
		content: '완료기준 ';
		color: var(--build);
		font-weight: 700;
	}
	.foot {
		display: flex;
		gap: 6px;
		margin-top: 8px;
		align-items: center;
	}
	.mv {
		font-family: var(--mono);
		font-size: 11px;
		border: 1px solid var(--line);
		background: #f7f9fc;
		border-radius: 6px;
		padding: 2px 8px;
		cursor: pointer;
		color: var(--ink);
	}
	.mv:hover {
		border-color: var(--build);
		color: var(--build);
	}
	.del {
		margin-left: auto;
		border: none;
		background: none;
		color: var(--muted);
		cursor: pointer;
		font-size: 14px;
		line-height: 1;
		padding: 2px 4px;
	}
	.del:hover {
		color: var(--warn);
	}
</style>
