<script lang="ts">
  import ScrollReveal from './ScrollReveal.svelte';
</script>

<div class="flex items-center justify-center h-full px-4 sm:px-6 md:px-8">
  <div class="max-w-6xl mx-auto w-full">
    <div class="font-mono text-[0.55rem] sm:text-[0.6rem] md:text-[0.65rem] tracking-[0.3em] uppercase text-[#6366f1] mb-2">06 // Community</div>
    <h2 class="font-mono text-xl sm:text-2xl md:text-3xl font-bold tracking-wide text-[#f1f5f9] mb-8">
      <span style="background: linear-gradient(135deg, #6366f1, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Community</span>
    </h2>

    <ScrollReveal>
      <div
        class="p-4 md:p-6 lg:p-8 rounded-xl"
        style="background: var(--card-bg); border: 1px solid var(--card-border);"
      >
        <p class="text-[#94a3b8] text-sm md:text-base leading-relaxed mb-3">Coming soon.</p>
        <p class="text-[#94a3b8] text-sm md:text-base leading-relaxed">
          Topics will include autonomous systems, multi-agent architectures, edge inference, and knowledge graphs — the practical realities of running frontier-grade AI on your own hardware.
        </p>
      </div>
    </ScrollReveal>
  </div>
</div>
