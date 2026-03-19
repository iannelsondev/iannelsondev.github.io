<script lang="ts">
  import { experience } from '$lib/data/content';
</script>

<div class="flex flex-col h-full">
  <div class="px-4 sm:px-6 md:px-8 pt-4 md:pt-6 max-w-7xl mx-auto w-full">
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
      <div class="flex items-center justify-center h-full px-4 sm:px-6 md:px-12 lg:px-16 py-2">
        <div class="exp-card w-full max-w-5xl grid grid-cols-1 lg:grid-cols-[1fr_300px] rounded-xl overflow-hidden" style="min-height: 70vh;">

          <!-- Left: content -->
          <div class="p-5 md:p-8 lg:p-10 flex flex-col justify-center">
            <!-- Header -->
            <div class="flex items-start justify-between gap-4 mb-5 flex-wrap">
              <div class="flex items-center gap-4">
                <div
                  class="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-mono text-sm md:text-base font-bold text-white flex-shrink-0"
                  style="background: linear-gradient(135deg, #6366f1, #06b6d4);"
                  aria-hidden="true"
                >{entry.avatar}</div>
                <div>
                  <div class="font-semibold text-lg md:text-xl text-[#f1f5f9]">{entry.role}</div>
                  <div class="font-mono text-sm md:text-base tracking-wide text-[#6366f1]">{entry.company}</div>
                </div>
              </div>
              <div class="font-mono text-[0.65rem] md:text-[0.75rem] tracking-[0.1em] text-[#94a3b8] whitespace-nowrap pt-2">{entry.dates}</div>
            </div>

            <!-- Company description -->
            <p class="text-sm md:text-base text-[#94a3b8]/60 leading-relaxed mb-5 italic">
              {entry.companyDesc}
            </p>

            <!-- Bullets -->
            <ul class="flex flex-col gap-2.5 mb-6">
              {#each entry.bullets as bullet}
                <li class="text-sm md:text-base text-[#94a3b8] pl-5 relative leading-relaxed">
                  <span class="absolute left-0 text-[#06b6d4] text-[0.8rem] top-[0.2rem]" aria-hidden="true">▸</span>
                  {bullet}
                </li>
              {/each}
            </ul>

            <!-- Slide counter -->
            <div class="mt-auto pt-4 border-t border-[rgba(99,102,241,0.1)] flex items-center justify-between">
              <div class="font-mono text-[0.6rem] md:text-[0.65rem] text-[#94a3b8] tracking-wide">
                {i + 1} / {experience.length}
              </div>
              <div class="flex gap-1.5">
                {#each experience as _, j}
                  <div
                    class="w-2 h-2 rounded-full transition-colors duration-300"
                    style="background: {j === i ? '#6366f1' : 'rgba(99,102,241,0.15)'};"
                  ></div>
                {/each}
              </div>
            </div>
          </div>

          <!-- Right: location panel with SVG map -->
          <div class="map-panel flex flex-col justify-center items-center p-6 md:p-8 relative">
            <!-- Decorative concentric circles (radar/location feel) -->
            <svg class="w-full max-w-[240px] aspect-square opacity-60 mb-4" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="90" fill="none" stroke="#6366f1" stroke-opacity="0.08" stroke-width="0.5"/>
              <circle cx="100" cy="100" r="70" fill="none" stroke="#6366f1" stroke-opacity="0.12" stroke-width="0.5"/>
              <circle cx="100" cy="100" r="50" fill="none" stroke="#6366f1" stroke-opacity="0.18" stroke-width="0.5"/>
              <circle cx="100" cy="100" r="30" fill="none" stroke="#6366f1" stroke-opacity="0.25" stroke-width="0.5"/>
              <!-- Crosshairs -->
              <line x1="100" y1="5" x2="100" y2="195" stroke="#6366f1" stroke-opacity="0.06" stroke-width="0.5"/>
              <line x1="5" y1="100" x2="195" y2="100" stroke="#6366f1" stroke-opacity="0.06" stroke-width="0.5"/>
              <!-- Pin -->
              <g transform="translate(100, 90)">
                <path d="M0-18c-6.6 0-12 5.4-12 12 0 9 12 22 12 22s12-13 12-22c0-6.6-5.4-12-12-12z" fill="#6366f1" fill-opacity="0.9"/>
                <circle cx="0" cy="-6" r="4.5" fill="#0a0a0f"/>
              </g>
              <!-- Pulse ring -->
              <circle cx="100" cy="90" r="8" fill="none" stroke="#06b6d4" stroke-opacity="0.4" stroke-width="1">
                <animate attributeName="r" from="8" to="30" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="stroke-opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite"/>
              </circle>
            </svg>

            <!-- Location text -->
            <div class="text-center">
              <div class="font-mono text-[0.6rem] md:text-[0.65rem] tracking-[0.25em] uppercase text-[#6366f1] mb-1">Location</div>
              <div class="font-mono text-sm md:text-base text-[#f1f5f9] font-medium">{entry.location}</div>
            </div>

            <!-- Coordinates -->
            <div class="font-mono text-[0.5rem] md:text-[0.55rem] text-[#94a3b8]/40 mt-2 tracking-wider">
              {entry.lat.toFixed(4)}°N {Math.abs(entry.lon).toFixed(4)}°W
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
