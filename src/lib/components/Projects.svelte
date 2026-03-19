<script lang="ts">
  import ScrollReveal from './ScrollReveal.svelte';
  import { projects } from '$lib/data/content';
</script>

<div class="flex items-center justify-center h-full px-4 sm:px-6 md:px-8">
  <div class="max-w-6xl mx-auto w-full">
    <div class="font-mono text-[0.55rem] sm:text-[0.6rem] md:text-[0.65rem] tracking-[0.3em] uppercase text-[#6366f1] mb-2">04 // Projects</div>
    <h2 class="font-mono text-xl sm:text-2xl md:text-3xl font-bold tracking-wide text-[#f1f5f9] mb-6">
      Things I've <span style="background: linear-gradient(135deg, #6366f1, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Shipped</span>
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each projects as project, i}
        <ScrollReveal delay={i * 80}>
          <article
            class="p-4 md:p-5 rounded-xl flex flex-col gap-2 transition-[border-color,box-shadow,transform] duration-200
              hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(99,102,241,0.1)] h-full"
            style="background: var(--card-bg); border: 1px solid var(--card-border);"
            onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-hover)'; }}
            onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-border)'; }}
          >
            <div class="flex items-center gap-2">
              <h3
                class="font-mono text-sm md:text-base font-bold"
                style="background: linear-gradient(135deg, #6366f1, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;"
              >{project.title}</h3>
              {#if project.link}
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-sm text-[#06b6d4] hover:opacity-100 transition-opacity duration-200 opacity-70"
                  aria-label={project.linkLabel ?? `Visit ${project.title}`}
                  style="-webkit-text-fill-color: #06b6d4;"
                >↗</a>
              {/if}
            </div>
            <p class="text-xs md:text-sm text-[#94a3b8] leading-relaxed">{project.description}</p>
          </article>
        </ScrollReveal>
      {/each}
    </div>
  </div>
</div>
