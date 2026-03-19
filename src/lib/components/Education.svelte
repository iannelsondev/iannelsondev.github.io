<script lang="ts">
  import ScrollReveal from './ScrollReveal.svelte';
  import { education } from '$lib/data/content';
</script>

<section id="education" class="py-16 md:py-24 lg:py-28 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto" aria-labelledby="edu-heading">
  <div class="font-mono text-[0.55rem] sm:text-[0.6rem] md:text-[0.65rem] tracking-[0.3em] uppercase text-[#6366f1] mb-2">05 // Education</div>
  <h2 id="edu-heading" class="font-mono text-xl sm:text-2xl md:text-3xl font-bold tracking-wide text-[#f1f5f9] mb-12">
    Academic <span style="background: linear-gradient(135deg, #6366f1, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Foundation</span>
  </h2>

  <div class="flex flex-col gap-4">
    {#each education as entry, i}
      <ScrollReveal delay={i * 100}>
        <div
          class="p-4 md:px-6 md:py-5 rounded-xl backdrop-blur-md flex items-center justify-between gap-6 flex-wrap
            transition-all duration-250 hover:shadow-[0_4px_20px_rgba(99,102,241,0.08)]
            max-md:flex-col max-md:items-start"
          style="background: var(--card-bg); border: 1px solid var(--card-border);"
          role="article"
          onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-hover)'; }}
          onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-border)'; }}
        >
          <div>
            <div class="font-semibold text-[0.95rem] text-[#f1f5f9]">{entry.degree}</div>
            <div class="font-mono text-xs tracking-wide text-[#6366f1] mt-0.5">{entry.school}</div>
            <div class="text-xs text-[#94a3b8] mt-1">{entry.detail}</div>
          </div>
          <div class="font-mono text-[0.6rem] md:text-[0.7rem] tracking-[0.1em] text-[#94a3b8] whitespace-nowrap max-md:mt-1">{entry.years}</div>
        </div>
      </ScrollReveal>
    {/each}
  </div>
</section>
