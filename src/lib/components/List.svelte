<script lang="ts">
	import { board } from '$lib/board.svelte';
	import type { List } from '$lib/types';
	import Card from './Card.svelte';

	let { list }: { list: List } = $props();

	const cards = $derived(board.cardsIn(list.id));
	let dropActive = $state(false);

	function onTitle(e: FocusEvent) {
		const el = e.currentTarget as HTMLElement;
		const v = el.textContent?.trim() || '제목 없음';
		el.textContent = v;
		board.renameList(list.id, v);
	}
	function onRemove() {
		const n = cards.length;
		if (n === 0 || confirm(`'${list.title}' 리스트와 카드 ${n}개를 삭제할까요?`)) board.removeList(list.id);
	}
	function onOver(e: DragEvent) {
		if (!board.dragId) return;
		e.preventDefault();
		dropActive = true;
	}
	function onDrop(e: DragEvent) {
		e.preventDefault();
		const id = board.dragId;
		dropActive = false;
		board.dragId = null;
		if (id) board.moveCard(id, list.id, null);
	}
</script>

<div class="list" class:drop-active={dropActive}>
	<div class="list-head">
		<span
			class="list-title"
			contenteditable="true"
			role="textbox"
			tabindex="0"
			onblur={onTitle}
			onkeydown={(e) => {
				if (e.key === 'Enter') {
					e.preventDefault();
					(e.currentTarget as HTMLElement).blur();
				}
			}}>{list.title}</span
		>
		<span class="count">{cards.length}</span>
		<button class="x" aria-label="리스트 삭제" title="리스트 삭제" onclick={onRemove}>×</button>
	</div>

	<div
		class="list-body"
		ondragover={onOver}
		ondragleave={() => (dropActive = false)}
		ondrop={onDrop}
		role="list"
	>
		{#each cards as card (card.id)}
			<Card {card} />
		{/each}

		<button class="add" onclick={() => board.addCard(list.id)}>+ 카드</button>
	</div>
</div>

<style>
	.list {
		flex: 0 0 280px;
		width: 280px;
		background: var(--bg-soft);
		border: 1px solid var(--line);
		border-radius: 12px;
		display: flex;
		flex-direction: column;
		max-height: 70vh;
		transition:
			box-shadow 0.15s ease,
			background 0.15s ease;
	}
	.list.drop-active {
		box-shadow: inset 0 0 0 1.5px var(--build);
		background: var(--build-soft);
	}
	.list-head {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 10px 8px 12px;
	}
	.list-title {
		flex: 1;
		min-width: 0;
		font-size: 12.5px;
		font-weight: 600;
		letter-spacing: 0.01em;
		color: var(--text-2);
		outline: none;
		border-radius: 5px;
		padding: 2px 4px;
		margin: -2px -4px;
	}
	.list-title:focus {
		box-shadow: 0 0 0 2px var(--build-soft);
		color: var(--ink);
	}
	.count {
		flex-shrink: 0;
		font-family: var(--mono);
		font-size: 10px;
		color: var(--muted);
		background: var(--tint);
		border: 1px solid var(--line);
		border-radius: 999px;
		padding: 1px 7px;
	}
	.x {
		flex-shrink: 0;
		border: none;
		background: none;
		color: var(--faint);
		cursor: pointer;
		font-size: 15px;
		line-height: 1;
		padding: 0 3px;
		border-radius: 5px;
		opacity: 0;
		transition:
			color 0.15s ease,
			background 0.15s ease,
			opacity 0.15s ease;
	}
	.list:hover .x {
		opacity: 1;
	}
	.x:hover {
		color: var(--warn);
		background: var(--warn-soft);
	}
	.list-body {
		flex: 1;
		overflow-y: auto;
		padding: 4px 8px 10px;
		min-height: 48px;
	}
	.add {
		width: 100%;
		font-family: var(--sans);
		font-size: 12px;
		font-weight: 500;
		color: var(--muted);
		border: 1px dashed var(--line-strong);
		background: none;
		border-radius: 8px;
		padding: 8px;
		margin-top: 2px;
		cursor: pointer;
		transition:
			color 0.15s ease,
			border-color 0.15s ease,
			background 0.15s ease;
	}
	.add:hover {
		color: var(--build);
		border-color: var(--build);
		background: var(--build-soft);
	}

	@media (max-width: 600px) {
		.list {
			flex-basis: 80vw;
			width: 80vw;
			max-width: 300px;
			max-height: none;
		}
	}
</style>
