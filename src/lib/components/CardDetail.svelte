<script lang="ts">
	import { board } from '$lib/board.svelte';

	const card = $derived(board.openCard);
	const subs = $derived(card ? board.subtasksIn(card.id) : []);
	const doneCount = $derived(subs.filter((s) => s.done).length);

	let newSub = $state('');

	function close() {
		board.closeCardDetail();
	}
	function addSub() {
		const v = newSub.trim();
		if (!v || !card) return;
		board.addSubtask(card.id, v);
		newSub = '';
	}

	function focusOnMount(node: HTMLElement) {
		node.focus();
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape' && card) close();
	}}
/>

{#if card}
	<div class="modal">
		<button class="backdrop" aria-label="닫기" onclick={close}></button>
		<div class="panel" role="dialog" aria-modal="true" aria-label="카드 상세">
			<div class="head">
				<input
					class="title"
					value={card.title}
					placeholder="카드 제목"
					use:focusOnMount
					onkeydown={(e) => {
						if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur();
					}}
					onchange={(e) => board.editCard(card.id, 'title', e.currentTarget.value.trim())}
				/>
				<button class="close" aria-label="닫기" title="닫기" onclick={close}>×</button>
			</div>

			<label class="field">
				<span class="lbl">완료 기준</span>
				<input
					class="dod"
					value={card.dod}
					placeholder="이 카드를 '완료'로 부를 수 있는 기준"
					onchange={(e) => board.editCard(card.id, 'dod', e.currentTarget.value.trim())}
				/>
			</label>

			<label class="field">
				<span class="lbl">상세 기록</span>
				<textarea
					class="notes"
					rows="10"
					value={card.notes}
					placeholder="진행 상황, 메모, 배운 점, 막힌 부분 등을 자유롭게 기록하세요."
					onchange={(e) => board.editCard(card.id, 'notes', e.currentTarget.value)}
				></textarea>
			</label>

			<div class="field">
				<span class="lbl">
					하위 할 일
					{#if subs.length > 0}<em class="prog">{doneCount}/{subs.length}</em>{/if}
				</span>

				{#if subs.length > 0}
					<div class="progress"><div class="fill" style="width:{(doneCount / subs.length) * 100}%"></div></div>
				{/if}

				<ul class="subs">
					{#each subs as s (s.id)}
						<li class="sub" class:done={s.done}>
							<input
								type="checkbox"
								checked={s.done}
								aria-label="완료 토글"
								onchange={() => board.toggleSubtask(s.id)}
							/>
							<input
								class="sub-title"
								value={s.title}
								placeholder="할 일 내용"
								onkeydown={(e) => {
									if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur();
								}}
								onchange={(e) => board.editSubtask(s.id, e.currentTarget.value.trim())}
							/>
							<button class="sub-del" aria-label="삭제" title="삭제" onclick={() => board.removeSubtask(s.id)}>×</button>
						</li>
					{/each}
				</ul>

				<div class="add-sub">
					<input
						bind:value={newSub}
						placeholder="+ 하위 할 일 추가"
						onkeydown={(e) => {
							if (e.key === 'Enter') addSub();
						}}
					/>
					<button class="add-btn" onclick={addSub} disabled={!newSub.trim()}>추가</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: flex;
		overflow-y: auto;
		padding: 28px 20px;
		-webkit-overflow-scrolling: touch;
	}
	.backdrop {
		position: fixed;
		inset: 0;
		border: none;
		background: rgba(0, 0, 0, 0.55);
		backdrop-filter: blur(3px);
		cursor: pointer;
	}
	.panel {
		position: relative;
		width: 100%;
		max-width: 760px;
		margin: auto;
		background: var(--card);
		border: 1px solid var(--line-strong);
		border-radius: 16px;
		box-shadow: var(--shadow);
		padding: 26px 30px 30px;
		animation: pop 0.16s ease;
	}
	@keyframes pop {
		from {
			opacity: 0;
			transform: translateY(8px) scale(0.99);
		}
	}
	.head {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		margin-bottom: 18px;
	}
	.title {
		flex: 1;
		min-width: 0;
		font-family: var(--sans);
		font-size: 19px;
		font-weight: 600;
		letter-spacing: -0.02em;
		color: var(--ink);
		background: none;
		border: 1px solid transparent;
		border-radius: 8px;
		padding: 6px 8px;
		margin: -6px -8px;
		outline: none;
	}
	.title:hover {
		background: var(--tint);
	}
	.title:focus {
		background: var(--bg-soft);
		border-color: var(--build);
	}
	.close {
		flex-shrink: 0;
		border: none;
		background: none;
		color: var(--muted);
		font-size: 22px;
		line-height: 1;
		cursor: pointer;
		padding: 2px 6px;
		border-radius: 8px;
		transition:
			color 0.15s ease,
			background 0.15s ease;
	}
	.close:hover {
		color: var(--ink);
		background: var(--card-hover);
	}
	.field {
		display: block;
		margin-top: 18px;
	}
	.lbl {
		display: flex;
		align-items: center;
		gap: 8px;
		font-family: var(--mono);
		font-size: 10.5px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--muted);
		margin-bottom: 8px;
	}
	.prog {
		font-style: normal;
		color: var(--build);
		background: var(--build-soft);
		border-radius: 999px;
		padding: 1px 8px;
		letter-spacing: 0;
	}
	.dod,
	.notes,
	.sub-title,
	.add-sub input {
		width: 100%;
		font-family: var(--sans);
		font-size: 13.5px;
		color: var(--ink);
		background: var(--bg-soft);
		border: 1px solid var(--line);
		border-radius: 9px;
		padding: 10px 12px;
		outline: none;
		transition: border-color 0.15s ease;
	}
	.notes {
		font-family: var(--mono);
		font-size: 12.5px;
		line-height: 1.65;
		resize: vertical;
		min-height: 200px;
	}
	.dod:focus,
	.notes:focus,
	.sub-title:focus,
	.add-sub input:focus {
		border-color: var(--build);
	}
	.progress {
		height: 6px;
		background: var(--bg-soft);
		border: 1px solid var(--line);
		border-radius: 999px;
		overflow: hidden;
		margin-bottom: 12px;
	}
	.fill {
		height: 100%;
		background: var(--done);
		transition: width 0.3s ease;
	}
	.subs {
		list-style: none;
		margin: 0 0 10px;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.sub {
		display: flex;
		align-items: center;
		gap: 9px;
	}
	.sub input[type='checkbox'] {
		flex-shrink: 0;
		width: 16px;
		height: 16px;
		accent-color: var(--build-fill);
		cursor: pointer;
	}
	.sub-title {
		border-color: transparent;
		background: transparent;
		padding: 7px 9px;
	}
	.sub-title:hover {
		background: var(--bg-soft);
	}
	.sub.done .sub-title {
		text-decoration: line-through;
		color: var(--muted);
	}
	.sub-del {
		flex-shrink: 0;
		border: none;
		background: none;
		color: var(--faint);
		font-size: 16px;
		line-height: 1;
		cursor: pointer;
		padding: 2px 6px;
		border-radius: 6px;
		opacity: 0;
		transition:
			color 0.15s ease,
			background 0.15s ease,
			opacity 0.15s ease;
	}
	.sub:hover .sub-del {
		opacity: 1;
	}
	.sub-del:hover {
		color: var(--warn);
		background: var(--warn-soft);
	}
	.add-sub {
		display: flex;
		gap: 8px;
		margin-top: 4px;
	}
	.add-btn {
		flex-shrink: 0;
		font-family: var(--sans);
		font-size: 13px;
		font-weight: 600;
		color: #fff;
		background: var(--build-fill);
		border: none;
		border-radius: 9px;
		padding: 0 16px;
		cursor: pointer;
		transition:
			opacity 0.15s ease,
			background 0.15s ease;
	}
	.add-btn:hover:not(:disabled) {
		background: #6b77e0;
	}
	.add-btn:disabled {
		opacity: 0.4;
		cursor: default;
	}

	@media (max-width: 600px) {
		.modal {
			padding: 16px 12px;
		}
		.panel {
			padding: 20px 16px 22px;
			border-radius: 14px;
		}
		.title {
			font-size: 17px;
		}
		.notes {
			min-height: 150px;
		}
	}
</style>
