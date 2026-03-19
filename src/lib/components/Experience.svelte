<script lang="ts">
  import ScrollReveal from './ScrollReveal.svelte';
  import { experience } from '$lib/data/content';
</script>

<section id="experience" class="py-16 md:py-24 lg:py-28 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto" aria-labelledby="exp-heading">
  <div class="font-mono text-[0.55rem] sm:text-[0.6rem] md:text-[0.65rem] tracking-[0.3em] uppercase text-[#6366f1] mb-2">02 // Experience</div>
  <h2 id="exp-heading" class="font-mono text-xl sm:text-2xl md:text-3xl font-bold tracking-wide text-[#f1f5f9] mb-12">
    Where I've <span style="background: linear-gradient(135deg, #6366f1, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Built</span>
  </h2>

  <div class="flex flex-col gap-4 relative">
    <!-- Timeline line -->
    <div
      class="absolute left-[20px] top-0 bottom-0 w-px hidden md:block"
      style="background: linear-gradient(to bottom, #6366f1, #06b6d4);"
      aria-hidden="true"
    ></div>

    {#each experience as entry, i}
      <ScrollReveal delay={i % 3 === 0 ? 0 : i % 3 === 1 ? 100 : 200}>
        <article
          class="p-4 md:p-6 rounded-xl backdrop-blur-md transition-all duration-250 hover:shadow-[0_8px_40px_rgba(99,102,241,0.1)] md:ml-10 relative"
          style="background: var(--card-bg); border: 1px solid var(--card-border);"
          onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-hover)'; }}
          onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-border)'; }}
          onfocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-hover)'; }}
          onblur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-border)'; }}
        >
          <!-- Timeline dot -->
          <div
            class="absolute left-0 top-6 w-3 h-3 rounded-full border-2 border-[#6366f1] bg-[#0a0a0f] -translate-x-[calc(2.5rem+6px)] hidden md:block"
            aria-hidden="true"
          ></div>

          <div class="flex items-start justify-between gap-4 mb-3 flex-wrap">
            <div class="flex items-center gap-3">
              <!-- Avatar -->
              <div
                class="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-mono text-xs font-bold text-white flex-shrink-0"
                style="background: linear-gradient(135deg, #6366f1, #06b6d4);"
                aria-hidden="true"
              >{entry.avatar}</div>
              <div>
                <div class="font-semibold text-[0.95rem] text-[#f1f5f9]">{entry.role}</div>
                <div class="font-mono text-xs tracking-wide text-[#6366f1]">{entry.company}</div>
              </div>
            </div>
            <div class="font-mono text-[0.6rem] md:text-[0.7rem] tracking-[0.1em] text-[#94a3b8] whitespace-nowrap pt-1">{entry.dates}</div>
          </div>

          <ul class="flex flex-col gap-1" aria-label="Responsibilities">
            {#each entry.bullets as bullet}
              <li class="text-sm md:text-base text-[#94a3b8] pl-4 relative leading-relaxed">
                <span class="absolute left-0 text-[#06b6d4] text-[0.7rem] top-[0.15rem]" aria-hidden="true">▸</span>
                {bullet}
              </li>
            {/each}
          </ul>
        </article>
      </ScrollReveal>
    {/each}
  </div>
</section>
