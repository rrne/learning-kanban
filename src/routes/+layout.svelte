<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import favicon from '$lib/assets/favicon.svg';
	import { board } from '$lib/board.svelte';
	import { theme } from '$lib/theme.svelte';

	let { children } = $props();

	onMount(() => {
		theme.init();
		board.init();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
