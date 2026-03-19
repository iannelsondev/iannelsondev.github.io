<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  interface Props {
    delay?: number;
    children: import('svelte').Snippet;
  }

  let { delay = 0, children }: Props = $props();

  let el: HTMLElement;
  let visible = $state(!browser);
  let mounted = $state(false);

  // WCAG 2.3.3 — prefers-reduced-motion: when the user requests reduced
  // motion, skip the fade/translate animation entirely by treating the
  // element as immediately visible.
  let reducedMotion = $state(false);

  onMount(() => {
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
      // Show content immediately; no animation at all.
      visible = true;
      mounted = true;
      return;
    }

    visible = false;
    mounted = true;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        visible = true;
        obs.disconnect();
      }
    }, { threshold: 0.05, rootMargin: '50px' });
    obs.observe(el);
    return () => obs.disconnect();
  });
</script>

<div
  bind:this={el}
  class="transition-[opacity,transform] duration-700 ease-out"
  class:opacity-0={mounted && !visible && !reducedMotion}
  class:translate-y-8={mounted && !visible && !reducedMotion}
  class:opacity-100={!mounted || visible || reducedMotion}
  class:translate-y-0={!mounted || visible || reducedMotion}
  style="transition-delay: {reducedMotion ? '0ms' : delay + 'ms'}"
>
  {@render children()}
</div>
