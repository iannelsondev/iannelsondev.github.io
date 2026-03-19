<script lang="ts">
  import { education } from '$lib/data/content';
  import MiniMap from './MiniMap.svelte';

  interface Props {
    headingId?: string;
  }

  let { headingId = 'heading-education' }: Props = $props();
</script>

<div class="flex flex-col h-full">
  <div class="px-4 sm:px-6 md:px-8 pt-4 md:pt-6 max-w-7xl mx-auto w-full">
    <div
      class="font-mono tracking-[0.3em] uppercase mb-2"
      style="font-size: clamp(0.6rem, 0.7vw, 0.75rem); color: var(--indigo-accessible);"
      aria-hidden="true"
    >05 // Education</div>
    <h2
      id={headingId}
      class="font-semibold tracking-tight text-[#f1f5f9] mb-1"
      style="font-size: clamp(1.5rem, 2.5vw, 2.25rem);"
    >
      Academic <span class="gradient-text">Foundation</span>
    </h2>
    <div class="font-mono text-[#94a3b8] tracking-wide" style="font-size: clamp(0.6rem, 0.7vw, 0.75rem);" aria-hidden="true">
      ← scroll through institutions →
    </div>
  </div>

  {#each education as entry, i}
    <div class="slide">
      <div class="flex items-center justify-center h-full px-4 sm:px-6 md:px-12 lg:px-16 py-2">
        <article
          class="edu-card w-full max-w-5xl grid grid-cols-1 lg:grid-cols-[1fr_300px] rounded-xl overflow-hidden"
          style="min-height: 60vh;"
          aria-label="{entry.degree} at {entry.school}"
        >

          <!-- Left: content -->
          <div class="p-5 md:p-8 lg:p-10 flex flex-col justify-center">
            <div class="flex items-start justify-between gap-4 mb-5 flex-wrap">
              <div class="flex items-center gap-4">
                <div
                  class="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-mono text-sm md:text-base font-bold text-white flex-shrink-0"
                  style="background: linear-gradient(135deg, #6366f1, #06b6d4);"
                  aria-hidden="true"
                >{entry.avatar}</div>
                <div>
                  <h3 class="font-semibold text-[#f1f5f9]" style="font-size: clamp(1.1rem, 1.3vw, 1.35rem);">{entry.degree}</h3>
                  <div class="font-mono tracking-wide" style="font-size: clamp(0.875rem, 1vw, 1.05rem); color: var(--indigo-accessible);">
                    {#if entry.schoolUrl}
                      @ <a href={entry.schoolUrl} target="_blank" rel="noopener noreferrer" class="hover:text-[#06b6d4] transition-colors duration-150 underline decoration-[rgba(99,102,241,0.3)] underline-offset-2 hover:decoration-[#06b6d4]">{entry.school}</a>
                    {:else}
                      @ {entry.school}
                    {/if}
                  </div>
                </div>
              </div>
              <div class="font-mono tracking-[0.1em] text-[#94a3b8] whitespace-nowrap pt-2" style="font-size: clamp(0.6rem, 0.7vw, 0.75rem);">{entry.years}</div>
            </div>

            <!--
              WCAG 1.4.3 — Removed /60 opacity modifier. Base #94a3b8 = 7.7:1
              contrast; the /60 variant dropped to ~3.4:1 which fails AA.
            -->
            <p class="font-light text-[#94a3b8] leading-relaxed mb-5 italic" style="font-size: clamp(0.875rem, 1vw, 1.05rem);">
              {entry.schoolDesc}
            </p>

            <div class="font-light text-[#94a3b8] leading-[1.8] mb-6" style="font-size: clamp(0.875rem, 1vw, 1.05rem);">
              {entry.detail}
            </div>

            <div class="mt-auto pt-4 border-t border-[rgba(99,102,241,0.1)] flex items-center justify-between">
              <div class="font-mono text-[0.6rem] md:text-[0.65rem] text-[#94a3b8] tracking-wide" aria-label="Institution {i + 1} of {education.length}">
                {i + 1} / {education.length}
              </div>
              <div class="flex gap-1.5" aria-hidden="true">
                {#each education as _, j}
                  <div
                    class="w-2 h-2 rounded-full transition-colors duration-300"
                    style="background: {j === i ? '#6366f1' : 'rgba(99,102,241,0.15)'};"
                  ></div>
                {/each}
              </div>
            </div>
          </div>

          <!-- Right: map -->
          <div class="map-panel flex flex-col relative">
            <div class="flex-1 min-h-[200px]">
              <MiniMap lat={entry.lat} lon={entry.lon} label={entry.location} />
            </div>
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

  .edu-card {
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
