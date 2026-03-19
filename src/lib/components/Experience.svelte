<script lang="ts">
  import { experience } from '$lib/data/content';
</script>

<div class="flex flex-col h-full">
  <div class="px-4 sm:px-6 md:px-8 pt-6 md:pt-10 max-w-7xl mx-auto w-full">
    <div class="font-mono text-[0.55rem] sm:text-[0.6rem] md:text-[0.65rem] tracking-[0.3em] uppercase text-[#6366f1] mb-2">02 // Experience</div>
    <h2 class="font-mono text-xl sm:text-2xl md:text-3xl font-bold tracking-wide text-[#f1f5f9] mb-1">
      Track <span class="gradient-text">Record</span>
    </h2>
    <div class="font-mono text-[0.55rem] md:text-[0.65rem] text-[#94a3b8] tracking-wide">
      ← scroll through positions →
    </div>
  </div>

  {#each experience as entry, i}
    <div class="slide">
      <div class="flex items-center justify-center h-full px-4 sm:px-6 md:px-12 lg:px-16 pb-6">
        <div class="exp-card w-full max-w-5xl grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-0 rounded-xl overflow-hidden">

          <!-- Left: content -->
          <div class="p-5 md:p-7 lg:p-8">
            <!-- Header -->
            <div class="flex items-start justify-between gap-4 mb-4 flex-wrap">
              <div class="flex items-center gap-3">
                <div
                  class="w-11 h-11 md:w-13 md:h-13 rounded-full flex items-center justify-center font-mono text-sm font-bold text-white flex-shrink-0"
                  style="background: linear-gradient(135deg, #6366f1, #06b6d4);"
                  aria-hidden="true"
                >{entry.avatar}</div>
                <div>
                  <div class="font-semibold text-base md:text-lg text-[#f1f5f9]">{entry.role}</div>
                  <div class="font-mono text-xs md:text-sm tracking-wide text-[#6366f1]">{entry.company}</div>
                </div>
              </div>
              <div class="font-mono text-[0.6rem] md:text-[0.7rem] tracking-[0.1em] text-[#94a3b8] whitespace-nowrap pt-1">{entry.dates}</div>
            </div>

            <!-- Company description -->
            <p class="text-[0.8rem] md:text-sm text-[#94a3b8]/70 leading-relaxed mb-4 italic">
              {entry.companyDesc}
            </p>

            <!-- Bullets -->
            <ul class="flex flex-col gap-1.5">
              {#each entry.bullets as bullet}
                <li class="text-sm md:text-base text-[#94a3b8] pl-5 relative leading-relaxed">
                  <span class="absolute left-0 text-[#06b6d4] text-[0.75rem] top-[0.2rem]" aria-hidden="true">▸</span>
                  {bullet}
                </li>
              {/each}
            </ul>

            <!-- Slide counter -->
            <div class="mt-5 pt-3 border-t border-[rgba(99,102,241,0.1)] flex items-center justify-between">
              <div class="font-mono text-[0.55rem] md:text-[0.6rem] text-[#94a3b8] tracking-wide">
                {i + 1} / {experience.length}
              </div>
              <div class="flex gap-1">
                {#each experience as _, j}
                  <div
                    class="w-1.5 h-1.5 rounded-full"
                    style="background: {j === i ? '#6366f1' : 'rgba(99,102,241,0.2)'};"
                  ></div>
                {/each}
              </div>
            </div>
          </div>

          <!-- Right: map + location -->
          <div class="map-panel flex flex-col">
            <div class="flex-1 min-h-[160px] lg:min-h-0 relative">
              <iframe
                title="Map showing {entry.location}"
                class="w-full h-full border-0"
                style="filter: grayscale(1) brightness(0.25) contrast(1.3) sepia(0.2) hue-rotate(200deg); pointer-events: none;"
                src="https://www.openstreetmap.org/export/embed.html?bbox={entry.lon - 1},{entry.lat - 0.5},{entry.lon + 1},{entry.lat + 0.5}&layer=mapnik"
                loading="lazy"
              ></iframe>
              <!-- Location overlay -->
              <div class="absolute bottom-0 left-0 right-0 p-3 md:p-4" style="background: linear-gradient(transparent, rgba(10,10,15,0.95));">
                <div class="font-mono text-[0.55rem] md:text-[0.6rem] tracking-[0.2em] uppercase text-[#6366f1] mb-0.5">Location</div>
                <div class="font-mono text-xs md:text-sm text-[#f1f5f9]">{entry.location}</div>
              </div>
            </div>
          </div>

        </div>
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
    background: rgba(10, 10, 15, 0.5);
    border-left: 1px solid var(--card-border);
  }

  @media (max-width: 1023px) {
    .map-panel {
      border-left: none;
      border-top: 1px solid var(--card-border);
    }
  }
</style>
