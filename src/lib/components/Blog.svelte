<script lang="ts">
  import ScrollReveal from './ScrollReveal.svelte';

  interface Props {
    headingId?: string;
  }

  let { headingId = 'heading-blog' }: Props = $props();
</script>

<div class="flex items-center justify-center h-full px-4 sm:px-6 md:px-8">
  <div class="max-w-6xl mx-auto w-full">
    <div
      class="font-mono tracking-[0.3em] uppercase mb-2"
      style="font-size: clamp(0.6rem, 0.7vw, 0.75rem); color: var(--indigo-accessible);"
      aria-hidden="true"
    >06 // Community</div>
    <h2
      id={headingId}
      class="font-semibold tracking-tight text-[#f1f5f9] mb-6"
      style="font-size: clamp(1.5rem, 2.5vw, 2.25rem);"
    >
      <span style="background: linear-gradient(135deg, #6366f1, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Community</span>
    </h2>

    <ScrollReveal>
      <div
        class="p-5 md:p-6 rounded-xl"
        style="background: var(--card-bg); border: 1px solid var(--card-border);"
      >
        <p class="font-light text-[#94a3b8] leading-[1.8] mb-3" style="font-size: clamp(0.875rem, 1vw, 1.05rem);">Coming soon.</p>
        <p class="font-light text-[#94a3b8] leading-[1.8]" style="font-size: clamp(0.875rem, 1vw, 1.05rem);">
          Topics will include autonomous systems, multi-agent architectures, edge inference, and knowledge graphs — the practical realities of running frontier-grade AI on your own hardware.
        </p>
      </div>
    </ScrollReveal>
  </div>
</div>
