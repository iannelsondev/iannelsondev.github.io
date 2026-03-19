<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    delay?: number;
    children: import('svelte').Snippet;
  }

  let { delay = 0, children }: Props = $props();

  let el: HTMLElement;
  let visible = $state(false);

  onMount(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        visible = true;
        obs.disconnect();
      }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  });
</script>

<div
  bind:this={el}
  class="transition-all duration-700 ease-out {visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}"
  style="transition-delay: {delay}ms"
>
  {@render children()}
</div>
