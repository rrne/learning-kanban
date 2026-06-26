<script lang="ts">
	import { board } from '$lib/board.svelte';
	import type { Section } from '$lib/types';
	import List from './List.svelte';

	let { section }: { section: Section } = $props();

	const lists = $derived(board.listsIn(section.id));

	function onTitle(e: FocusEvent) {
		const el = e.currentTarget as HTMLElement;
		const v = el.textContent?.trim() || '제목 없음';
		el.textContent = v;
		board.renameSection(section.id, v);
	}
	function onRemove() {
		if (confirm(`'${section.title}' 섹션을 통째로 삭제할까요? (안의 리스트·카드도 함께 삭제)`))
			board.removeSection(section.id);
	}
</script>

<section class="section">
	<div class="sec-head">
		<span
			class="sec-title"
			contenteditable="true"
			role="textbox"
			tabindex="0"
			onblur={onTitle}
			onkeydown={(e) => {
				if (e.key === 'Enter') {
					e.preventDefault();
					(e.currentTarget as HTMLElement).blur();
				}
			}}>{section.title}</span
		>
		<button class="del" aria-label="섹션 삭제" title="섹션 삭제" onclick={onRemove}>
			<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
			</svg>
		</button>
	</div>

	<div class="lists">
		{#each lists as list (list.id)}
			<List {list} />
		{/each}
		<button class="add-list" onclick={() => board.addList(section.id)}>+ 리스트 추가</button>
	</div>
</section>

<style>
	.section {
		margin-bottom: 28px;
	}
	.sec-head {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 12px;
	}
	.sec-title {
		font-size: 16px;
		font-weight: 600;
		letter-spacing: -0.015em;
		color: var(--ink);
		outline: none;
		border-radius: 6px;
		padding: 3px 6px;
		margin: -3px -6px;
		max-width: 100%;
	}
	.sec-title:focus {
		box-shadow: 0 0 0 2px var(--build-soft);
	}
	.del {
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border: 1px solid transparent;
		background: none;
		color: var(--faint);
		cursor: pointer;
		border-radius: 7px;
		opacity: 0;
		transition:
			color 0.15s ease,
			background 0.15s ease,
			border-color 0.15s ease,
			opacity 0.15s ease;
	}
	.sec-head:hover .del {
		opacity: 1;
	}
	.del:hover {
		color: var(--warn);
		background: var(--warn-soft);
		border-color: var(--warn);
	}
	.lists {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		overflow-x: auto;
		padding: 4px 2px 14px;
	}
	.add-list {
		flex: 0 0 200px;
		align-self: flex-start;
		font-family: var(--sans);
		font-size: 12.5px;
		font-weight: 500;
		color: var(--muted);
		border: 1px dashed var(--line-strong);
		background: var(--tint);
		border-radius: 12px;
		padding: 12px;
		cursor: pointer;
		transition:
			color 0.15s ease,
			border-color 0.15s ease,
			background 0.15s ease;
	}
	.add-list:hover {
		color: var(--build);
		border-color: var(--build);
		background: var(--build-soft);
	}
</style>
