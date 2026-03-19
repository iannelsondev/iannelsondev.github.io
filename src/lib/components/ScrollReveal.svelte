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

  onMount(() => {
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
  class:opacity-0={mounted && !visible}
  class:translate-y-8={mounted && !visible}
  class:opacity-100={!mounted || visible}
  class:translate-y-0={!mounted || visible}
  style="transition-delay: {delay}ms"
>
  {@render children()}
</div>
