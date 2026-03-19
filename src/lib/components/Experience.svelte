<script lang="ts">
  import { experience } from '$lib/data/content';
  import MiniMap from './MiniMap.svelte';

  interface Props {
    headingId?: string;
  }

  let { headingId = 'heading-experience' }: Props = $props();
</script>

<div class="flex flex-col h-full">
  <div class="px-4 sm:px-6 md:px-8 pt-4 md:pt-6 max-w-7xl mx-auto w-full">
    <div
      class="font-mono tracking-[0.3em] uppercase mb-2"
      style="font-size: clamp(0.6rem, 0.7vw, 0.75rem); color: var(--indigo-accessible);"
      aria-hidden="true"
    >02 // Experience</div>
    <h2
      id={headingId}
      class="font-semibold tracking-tight text-[#f1f5f9] mb-1"
      style="font-size: clamp(1.5rem, 2.5vw, 2.25rem);"
    >
      Track <span class="gradient-text">Record</span>
    </h2>
    <!--
      WCAG 1.3.1 — Scroll hint is informational for sighted users; the
      aria-label on the parent <section> conveys section context to AT.
    -->
    <div class="font-mono text-[#94a3b8] tracking-wide" style="font-size: clamp(0.6rem, 0.7vw, 0.75rem);" aria-hidden="true">
      ← scroll through positions →
    </div>
  </div>

  {#each experience as entry, i}
    <!--
      WCAG 1.3.1 / 4.1.2 — Each experience entry is an <article> (self-
      contained content). aria-label provides a machine-readable name that
      includes the role and company so AT users understand context.
    -->
    <div class="slide">
      <div class="flex items-center justify-center h-full px-4 sm:px-6 md:px-12 lg:px-16 py-2">
        <article
          class="exp-card w-full max-w-5xl grid grid-cols-1 lg:grid-cols-[1fr_300px] rounded-xl overflow-hidden"
          style="min-height: 70vh;"
          aria-label="{entry.role} at {entry.company}"
        >

          <!-- Left: content -->
          <div class="p-5 md:p-8 lg:p-10 flex flex-col justify-center">
            <!-- Header -->
            <div class="flex items-start justify-between gap-4 mb-5 flex-wrap">
              <div class="flex items-center gap-4">
                <!--
                  aria-hidden: avatar initials are decorative; the role+company
                  heading below conveys the same information.
                -->
                <div
                  class="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-mono text-sm md:text-base font-bold text-white flex-shrink-0"
                  style="background: linear-gradient(135deg, #6366f1, #06b6d4);"
                  aria-hidden="true"
                >{entry.avatar}</div>
                <div>
                  <h3 class="font-semibold text-[#f1f5f9]" style="font-size: clamp(1.1rem, 1.3vw, 1.35rem);">{entry.role}</h3>
                  <div class="font-mono tracking-wide" style="font-size: clamp(0.875rem, 1vw, 1.05rem); color: var(--indigo-accessible);">
                    {#if entry.companyUrl}
                      @ <a href={entry.companyUrl} target="_blank" rel="noopener noreferrer" class="hover:text-[#06b6d4] transition-colors duration-150 underline decoration-[rgba(99,102,241,0.3)] underline-offset-2 hover:decoration-[#06b6d4]">{entry.company}</a>
                    {:else}
                      @ {entry.company}
                    {/if}
                  </div>
                </div>
              </div>
              <div class="font-mono tracking-[0.1em] text-[#94a3b8] whitespace-nowrap pt-2" style="font-size: clamp(0.6rem, 0.7vw, 0.75rem);">{entry.dates}</div>
            </div>

            <!-- Company description
                 WCAG 1.4.3 — #94a3b8/60 (≈3.4:1) fails AA; remove the opacity
                 modifier and rely on the base #94a3b8 (7.7:1) at full opacity.
            -->
            <p class="font-light text-[#94a3b8] leading-relaxed mb-5 italic" style="font-size: clamp(0.875rem, 1vw, 1.05rem);">
              {entry.companyDesc}
            </p>

            <!-- Bullets -->
            <ul class="flex flex-col gap-2.5 mb-6" aria-label="Responsibilities">
              {#each entry.bullets as bullet}
                <li class="font-light text-[#94a3b8] pl-5 relative leading-[1.75]" style="font-size: clamp(0.875rem, 1vw, 1.05rem);">
                  <span class="absolute left-0 text-[#06b6d4] text-[0.8rem] top-[0.2rem]" aria-hidden="true">▸</span>
                  {bullet}
                </li>
              {/each}
            </ul>

            <!-- Slide counter
                 WCAG 4.1.2 — Progress dots are decorative; the visible "N / total"
                 counter provides the same information in text form. The dot container
                 carries aria-hidden so AT skips the purely visual indicator.
            -->
            <div class="mt-auto pt-4 border-t border-[rgba(99,102,241,0.1)] flex items-center justify-between">
              <div class="font-mono text-[0.6rem] md:text-[0.65rem] text-[#94a3b8] tracking-wide" aria-label="Position {i + 1} of {experience.length}">
                {i + 1} / {experience.length}
              </div>
              <div class="flex gap-1.5" aria-hidden="true">
                {#each experience as _, j}
                  <div
                    class="w-2 h-2 rounded-full transition-colors duration-300"
                    style="background: {j === i ? '#6366f1' : 'rgba(99,102,241,0.15)'};"
                  ></div>
                {/each}
              </div>
            </div>
          </div>

          <!-- Right: real map + location -->
          <div class="map-panel flex flex-col relative">
            <div class="flex-1 min-h-[200px]">
              <MiniMap lat={entry.lat} lon={entry.lon} label={entry.location} />
            </div>
            <!-- Location overlay -->
            <div class="absolute bottom-0 left-0 right-0 p-3 md:p-4" style="background: linear-gradient(transparent, rgba(10,10,15,0.95) 40%);">
              <div
                class="font-mono text-[0.55rem] md:text-[0.6rem] tracking-[0.2em] uppercase mb-0.5"
                style="color: var(--indigo-accessible);"
                aria-hidden="true"
              >
                <svg class="inline-block w-3 h-3 mr-1 -mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                Location
              </div>
              <div class="font-mono text-xs md:text-sm text-[#f1f5f9]">{entry.location}</div>
            </div>
          </div>

        </article>
      </div>
    </div>
  {/each}
</div>

<style>
  .gradient-text {
    background: linear-gradient(135deg, #6366f1, #06b6d4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .exp-card {
    background: rgba(15, 15, 20, 0.85);
    border: 1px solid var(--card-border);
  }

  .map-panel {
    background: rgba(8, 8, 14, 0.6);
    border-left: 1px solid var(--card-border);
  }

  @media (max-width: 1023px) {
    .map-panel {
      border-left: none;
      border-top: 1px solid var(--card-border);
    }
  }
</style>
