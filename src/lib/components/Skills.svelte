<script lang="ts">
  import ScrollReveal from './ScrollReveal.svelte';
  import { skillCategories } from '$lib/data/content';
</script>

<section id="skills" class="py-16 md:py-24 lg:py-28 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto" aria-labelledby="skills-heading">
  <div class="font-mono text-[0.55rem] sm:text-[0.6rem] md:text-[0.65rem] tracking-[0.3em] uppercase text-[#6366f1] mb-2">03 // Skills</div>
  <h2 id="skills-heading" class="font-mono text-xl sm:text-2xl md:text-3xl font-bold tracking-wide text-[#f1f5f9] mb-12">
    Core <span style="background: linear-gradient(135deg, #6366f1, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Capabilities</span>
  </h2>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    {#each skillCategories as category, i}
      <ScrollReveal delay={i % 2 === 0 ? 0 : 100}>
        <div
          class="p-4 md:p-6 rounded-xl backdrop-blur-md transition-all duration-250 hover:shadow-[0_8px_40px_rgba(99,102,241,0.1)] h-full"
          style="background: var(--card-bg); border: 1px solid var(--card-border);"
          role="region"
          aria-label="{category.label} skills"
          onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-hover)'; }}
          onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-border)'; }}
        >
          <h3 class="font-mono text-sm font-semibold tracking-wider text-[#f1f5f9] mb-4 uppercase">
            {category.label}
          </h3>
          <div class="flex flex-wrap gap-2" role="list" aria-label="{category.label} skills">
            {#each category.skills as skill}
              <span
                class="text-[0.65rem] md:text-xs font-mono px-3 py-1 rounded-full text-[#94a3b8] transition-colors duration-150 hover:text-[#f1f5f9]"
                style="background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.25);"
                role="listitem"
              >{skill}</span>
            {/each}
          </div>
        </div>
      </ScrollReveal>
    {/each}
  </div>
</section>
