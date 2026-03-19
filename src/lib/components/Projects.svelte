<script lang="ts">
  import ScrollReveal from './ScrollReveal.svelte';
  import { projects } from '$lib/data/content';
</script>

<section id="projects" class="py-16 md:py-24 lg:py-28 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto" aria-labelledby="projects-heading">
  <div class="font-mono text-[0.55rem] sm:text-[0.6rem] md:text-[0.65rem] tracking-[0.3em] uppercase text-[#6366f1] mb-2">04 // Projects</div>
  <h2 id="projects-heading" class="font-mono text-xl sm:text-2xl md:text-3xl font-bold tracking-wide text-[#f1f5f9] mb-12">
    Things I've <span style="background: linear-gradient(135deg, #6366f1, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Shipped</span>
  </h2>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
    {#each projects as project, i}
      <ScrollReveal delay={i % 3 === 0 ? 0 : i % 3 === 1 ? 100 : 200}>
        <article
          class="p-4 md:p-6 rounded-xl backdrop-blur-md flex flex-col gap-3 transition-all duration-250
            hover:-translate-y-1 hover:shadow-[0_12px_48px_rgba(99,102,241,0.12)] h-full"
          style="background: var(--card-bg); border: 1px solid var(--card-border);"
          onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-hover)'; }}
          onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-border)'; }}
        >
          <div class="flex items-center gap-2">
            <h3
              class="font-mono text-base font-bold"
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
          <p class="text-sm md:text-base text-[#94a3b8] leading-relaxed">{project.description}</p>
        </article>
      </ScrollReveal>
    {/each}
  </div>
</section>
