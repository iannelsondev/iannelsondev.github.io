<script lang="ts">
  import { experience } from '$lib/data/content';
</script>

<!-- Section header stays fixed, slides are horizontal -->
<div class="flex flex-col h-full">
  <div class="px-4 sm:px-6 md:px-8 pt-8 md:pt-12 max-w-6xl mx-auto w-full">
    <div class="font-mono text-[0.55rem] sm:text-[0.6rem] md:text-[0.65rem] tracking-[0.3em] uppercase text-[#6366f1] mb-2">02 // Experience</div>
    <h2 class="font-mono text-xl sm:text-2xl md:text-3xl font-bold tracking-wide text-[#f1f5f9] mb-2">
      Track <span class="gradient-text">Record</span>
    </h2>
    <div class="font-mono text-[0.6rem] md:text-[0.7rem] text-[#94a3b8] tracking-wide mb-4">
      ← scroll horizontally →
    </div>
  </div>

  <!-- Horizontal slides (fullPage.js picks up .slide class) -->
  {#each experience as entry, i}
    <div class="slide">
      <div class="flex items-center justify-center h-full px-4 sm:px-8 md:px-16 pb-8">
        <article
          class="exp-card w-full max-w-2xl p-5 md:p-8 rounded-xl"
        >
          <div class="flex items-start justify-between gap-4 mb-4 flex-wrap">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-mono text-xs md:text-sm font-bold text-white flex-shrink-0"
                style="background: linear-gradient(135deg, #6366f1, #06b6d4);"
                aria-hidden="true"
              >{entry.avatar}</div>
              <div>
                <div class="font-semibold text-base md:text-lg text-[#f1f5f9]">{entry.role}</div>
                <div class="font-mono text-xs md:text-sm tracking-wide text-[#6366f1]">{entry.company}</div>
              </div>
            </div>
            <div class="font-mono text-[0.65rem] md:text-[0.75rem] tracking-[0.1em] text-[#94a3b8] whitespace-nowrap pt-1">{entry.dates}</div>
          </div>

          <ul class="flex flex-col gap-2" aria-label="Responsibilities">
            {#each entry.bullets as bullet}
              <li class="text-sm md:text-base text-[#94a3b8] pl-5 relative leading-relaxed">
                <span class="absolute left-0 text-[#06b6d4] text-[0.75rem] top-[0.2rem]" aria-hidden="true">▸</span>
                {bullet}
              </li>
            {/each}
          </ul>

          <!-- Slide indicator -->
          <div class="mt-6 pt-4 border-t border-[rgba(99,102,241,0.1)] flex items-center justify-between">
            <div class="font-mono text-[0.6rem] text-[#94a3b8] tracking-wide">
              {i + 1} / {experience.length}
            </div>
            <div class="flex gap-1">
              {#each experience as _, j}
                <div
                  class="w-1.5 h-1.5 rounded-full transition-colors duration-200"
                  style="background: {j === i ? '#6366f1' : 'rgba(99,102,241,0.2)'};"
                ></div>
              {/each}
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
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .exp-card:hover {
    border-color: var(--card-hover);
    box-shadow: 0 8px 40px rgba(99, 102, 241, 0.08);
  }
</style>
