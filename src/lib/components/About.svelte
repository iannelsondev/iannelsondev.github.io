<script lang="ts">
  import ScrollReveal from './ScrollReveal.svelte';
  import { bio, metaCards } from '$lib/data/content';
</script>

<div class="flex items-center justify-center h-full px-4 sm:px-6 md:px-8">
  <div class="max-w-6xl mx-auto w-full">
    <div class="font-mono text-[0.55rem] sm:text-[0.6rem] md:text-[0.65rem] tracking-[0.3em] uppercase text-[#6366f1] mb-2">01 // About</div>
    <h2 class="font-mono text-xl sm:text-2xl md:text-3xl font-bold tracking-wide text-[#f1f5f9] mb-6">
      Who I <span style="background: linear-gradient(135deg, #6366f1, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Am</span>
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-[1fr_280px] lg:grid-cols-[1fr_320px] gap-6 lg:gap-10 items-start">
      <!-- Bio text -->
      <ScrollReveal>
        <div class="flex flex-col gap-3">
          {#each bio as paragraph}
            <p class="text-[#94a3b8] text-sm md:text-base leading-[1.7]">{paragraph}</p>
          {/each}
        </div>
      </ScrollReveal>

      <!-- Meta cards -->
      <ScrollReveal delay={150}>
        <div class="flex flex-col gap-2">
          {#each metaCards as card}
            <div
              class="px-4 py-3 rounded-r-lg transition-[border-color,box-shadow,transform] duration-200 hover:shadow-[0_4px_20px_rgba(99,102,241,0.08)]"
              style="background: var(--card-bg); border: 1px solid var(--card-border); border-left: 3px solid #6366f1;"
            >
              <div class="font-mono text-[0.5rem] md:text-[0.6rem] tracking-[0.22em] uppercase text-[#6366f1] mb-0.5">{card.label}</div>
              {#if card.isHtml}
                <div class="text-xs md:text-sm text-[#f1f5f9] leading-relaxed" style="-webkit-text-fill-color: #f1f5f9;">{@html card.value}</div>
              {:else}
                <div class="text-xs md:text-sm text-[#f1f5f9] leading-relaxed">{card.value}</div>
              {/if}
            </div>
          {/each}
        </div>
      </ScrollReveal>
    </div>
  </div>
</div>
