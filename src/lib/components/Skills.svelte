<script lang="ts">
  import ScrollReveal from './ScrollReveal.svelte';
  import { skillCategories } from '$lib/data/content';

  interface Props {
    headingId?: string;
  }

  let { headingId = 'heading-skills' }: Props = $props();
</script>

<div class="flex items-center justify-center h-full px-4 sm:px-6 md:px-8">
  <div class="max-w-6xl mx-auto w-full">
    <div
      class="font-mono tracking-[0.3em] uppercase mb-2"
      style="font-size: clamp(0.6rem, 0.7vw, 0.75rem); color: var(--indigo-accessible);"
      aria-hidden="true"
    >03 // Skills</div>
    <h2
      id={headingId}
      class="font-semibold tracking-tight text-[#f1f5f9] mb-6"
      style="font-size: clamp(1.5rem, 2.5vw, 2.25rem);"
    >
      Core <span style="background: linear-gradient(135deg, #6366f1, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Capabilities</span>
    </h2>

    <!--
      WCAG 1.3.1 — The outer grid does not need role="list"; the individual
      cards carry role="region" with an aria-labelledby for each category
      heading. The inner tag list uses role="list" on a <ul> which is
      semantically correct and removes the need for the explicit role attribute.
    -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {#each skillCategories as category, i}
        <ScrollReveal delay={i * 60}>
          <div
            class="p-5 rounded-xl transition-[border-color,box-shadow,transform] duration-200 hover:shadow-[0_4px_20px_rgba(99,102,241,0.08)] h-full"
            style="background: var(--card-bg); border: 1px solid var(--card-border);"
            role="region"
            aria-labelledby="skill-cat-{i}"
            onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-hover)'; }}
            onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-border)'; }}
          >
            <h3
              id="skill-cat-{i}"
              class="font-mono font-semibold tracking-wider text-[#f1f5f9] mb-3 uppercase"
              style="font-size: clamp(0.55rem, 0.65vw, 0.7rem);"
            >
              {category.label}
            </h3>
            <!--
              WCAG 1.3.1 — Use a real <ul> for the skill tags. role="list"
              on a <ul> is redundant but harmless; removing it gives cleaner
              semantics. Each <li> represents one skill tag.
            -->
            <ul class="flex flex-wrap gap-1.5">
              {#each category.skills as skill}
                <li
                  class="font-mono px-2.5 py-0.5 rounded-full text-[#94a3b8] transition-colors duration-150 hover:text-[#f1f5f9]"
                  style="font-size: clamp(0.55rem, 0.6vw, 0.7rem); background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.25);"
                >{skill}</li>
              {/each}
            </ul>
          </div>
        </ScrollReveal>
      {/each}
    </div>
  </div>
</div>
