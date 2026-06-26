<script lang="ts">
	import { board } from '$lib/board.svelte';
	import type { Card } from '$lib/types';

	let { card }: { card: Card } = $props();
	let dragOver = $state(false);

	const subs = $derived(board.subtasksIn(card.id));
	const doneCount = $derived(subs.filter((s) => s.done).length);
	const hasNotes = $derived(card.notes.trim().length > 0);

	function dragStart(e: DragEvent) {
		board.dragId = card.id;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', card.id);
		}
	}
	function dragEnd() {
		board.dragId = null;
		dragOver = false;
	}
	function onDragOver(e: DragEvent) {
		if (!board.dragId || board.dragId === card.id) return;
		e.preventDefault();
		e.stopPropagation();
		dragOver = true;
	}
	function onDrop(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		const id = board.dragId;
		dragOver = false;
		board.dragId = null;
		if (id && id !== card.id) board.moveCard(id, card.list_id, card.id);
	}
	function open() {
		board.openCardDetail(card.id);
	}
</script>

<div
	class="card"
	class:drag-over={dragOver}
	class:dragging={board.dragId === card.id}
	draggable="true"
	ondragstart={dragStart}
	ondragend={dragEnd}
	ondragover={onDragOver}
	ondragleave={() => (dragOver = false)}
	ondrop={onDrop}
	onclick={open}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			open();
		}
	}}
	role="button"
	tabindex="0"
>
	<div class="row-top">
		<span class="grip" aria-hidden="true">
			<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
				<circle cx="5" cy="3" r="1.4" /><circle cx="11" cy="3" r="1.4" />
				<circle cx="5" cy="8" r="1.4" /><circle cx="11" cy="8" r="1.4" />
				<circle cx="5" cy="13" r="1.4" /><circle cx="11" cy="13" r="1.4" />
			</svg>
		</span>
		<div class="ttl">{card.title}</div>
		<button
			class="del"
			aria-label="카드 삭제"
			title="삭제"
			onclick={(e) => {
				e.stopPropagation();
				board.removeCard(card.id);
			}}>×</button
		>
	</div>

	{#if card.dod?.trim()}
		<div class="dod">{card.dod}</div>
	{/if}

	{#if subs.length > 0 || hasNotes}
		<div class="meta">
			{#if subs.length > 0}
				<span class="badge" class:all-done={doneCount === subs.length}>
					<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<polyline points="20 6 9 17 4 12" />
					</svg>
					{doneCount}/{subs.length}
				</span>
			{/if}
			{#if hasNotes}
				<span class="badge" title="기록 있음">
					<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="14" y2="17" />
					</svg>
				</span>
			{/if}
		</div>
	{/if}
</div>

<style>
	.card {
		position: relative;
		background: var(--card);
		border: 1px solid var(--line);
		border-radius: 10px;
		padding: 10px 11px;
		margin-bottom: 8px;
		box-shadow: var(--shadow-sm);
		cursor: pointer;
		text-align: left;
		transition:
			transform 0.13s ease,
			border-color 0.15s ease,
			box-shadow 0.15s ease;
	}
	.card:hover {
		transform: translateY(-1px);
		border-color: var(--line-strong);
		box-shadow: var(--shadow);
	}
	.card:focus-visible {
		outline: none;
		border-color: var(--build);
		box-shadow: 0 0 0 2px var(--build-soft);
	}
	.card:active {
		cursor: grabbing;
	}
	.card.dragging {
		opacity: 0.4;
	}
	.card.drag-over {
		border-color: var(--build);
		box-shadow: inset 0 3px 0 -1px var(--build);
	}
	.row-top {
		display: flex;
		align-items: flex-start;
		gap: 6px;
	}
	.grip {
		flex-shrink: 0;
		display: inline-flex;
		margin: 1px -2px 0 -3px;
		padding: 1px;
		color: var(--faint);
		opacity: 0.5;
		cursor: grab;
	}
	.card:hover .grip {
		opacity: 1;
		color: var(--build);
	}
	.ttl {
		flex: 1;
		min-width: 0;
		font-size: 13.5px;
		font-weight: 550;
		line-height: 1.4;
		letter-spacing: -0.01em;
		color: var(--ink);
		word-break: break-word;
	}
	.dod {
		font-family: var(--mono);
		font-size: 10.5px;
		color: var(--muted);
		margin: 6px 0 0 20px;
		line-height: 1.5;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.dod::before {
		content: '완료 기준 ';
		color: var(--build);
		font-weight: 500;
	}
	.meta {
		display: flex;
		align-items: center;
		gap: 6px;
		margin: 8px 0 0 20px;
	}
	.badge {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		font-family: var(--mono);
		font-size: 10px;
		color: var(--muted);
		background: var(--tint);
		border: 1px solid var(--line);
		border-radius: 6px;
		padding: 2px 6px;
	}
	.badge.all-done {
		color: var(--done);
		background: var(--done-soft);
		border-color: transparent;
	}
	.del {
		flex-shrink: 0;
		border: none;
		background: none;
		color: var(--faint);
		cursor: pointer;
		font-size: 16px;
		line-height: 1;
		padding: 0 3px;
		border-radius: 6px;
		opacity: 0;
		transition:
			color 0.15s ease,
			background 0.15s ease,
			opacity 0.15s ease;
	}
	.card:hover .del {
		opacity: 1;
	}
	.del:hover {
		color: var(--warn);
		background: var(--warn-soft);
	}
</style>
