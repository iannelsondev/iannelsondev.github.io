<script lang="ts">
  import '../app.css';
  import Nav from '$lib/components/Nav.svelte';
  import PixelGrid from '$lib/components/PixelGrid.svelte';

  interface Props {
    children: import('svelte').Snippet;
  }

  let { children }: Props = $props();
</script>

<svelte:head>
  <title>Ian Nelson — Autonomous Systems · Edge AI · Intelligence</title>
  <meta name="description" content="Ian Nelson — Building autonomous AI systems, multi-agent architectures, and on-prem capabilities that match frontier models." />
</svelte:head>

<!-- Background pixel grid -->
<PixelGrid seed={137} density={0.25} fillColor="#6366f1" />

<!-- Left sidebar nav -->
<Nav />

<!-- Main content, offset for sidebar on md+ -->
<div class="relative z-10 md:ml-[220px]">
  {@render children()}
</div>
