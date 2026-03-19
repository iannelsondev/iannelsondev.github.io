<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import Nav from '$lib/components/Nav.svelte';
  import PixelGrid from '$lib/components/PixelGrid.svelte';

  interface Props {
    children: import('svelte').Snippet;
  }

  let { children }: Props = $props();

  onMount(async () => {
    const fullpage = await import('fullpage.js');
    // @ts-ignore
    await import('fullpage.js/dist/fullpage.css');

    new fullpage.default('#fullpage', {
      licenseKey: 'gplv3-license',
      autoScrolling: true,
      scrollOverflow: true,
      scrollingSpeed: 700,
      fitToSection: true,
      anchors: ['home', 'about', 'experience', 'skills', 'projects', 'education', 'blog'],
      menu: '#fp-nav',
      css3: true,
      easing: 'easeInOutCubic',
      navigation: false,
      onLeave: (_origin: any, destination: any) => {
        // Dispatch custom event for Nav scrollspy
        window.dispatchEvent(new CustomEvent('fp-section-change', {
          detail: { index: destination.index, anchor: destination.anchor }
        }));
      }
    });

    return () => {
      // @ts-ignore
      if (window.fullpage_api) window.fullpage_api.destroy('all');
    };
  });
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
<div id="fullpage" class="relative z-10 main-content">
  {@render children()}
</div>

<style>
  @media (min-width: 768px) {
    .main-content {
      margin-left: clamp(180px, 14vw, 260px);
    }
  }
</style>
