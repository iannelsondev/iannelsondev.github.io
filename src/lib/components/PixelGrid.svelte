<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    seed?: number;
    density?: number;
    fillColor?: string;
  }

  let { seed = 42, density = 0.25, fillColor = '#6366f1' }: Props = $props();
  let el: HTMLDivElement;

  function seededRandom(s: number) {
    let state = s;
    return () => {
      state = (state * 1664525 + 1013904223) & 0xffffffff;
      return (state >>> 0) / 0xffffffff;
    };
  }

  onMount(() => {
    const COLS = 26, ROWS = 18, CELL = 60;
    const W = COLS * CELL, H = ROWS * CELL;
    const rand = seededRandom(seed);
    let rects = '';
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const x = col * CELL, y = row * CELL;
        const r = rand();
        if (r < density) {
          const opacity = (0.03 + rand() * 0.57).toFixed(3);
          rects += `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" fill="${fillColor}" fill-opacity="${opacity}" stroke="${fillColor}" stroke-opacity="0.08" stroke-width="0.5"/>`;
        } else {
          rand(); // consume to keep sequence consistent
          rects += `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" fill="none" stroke="${fillColor}" stroke-opacity="0.08" stroke-width="0.5"/>`;
        }
      }
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${rects}</svg>`;
    const encoded = 'data:image/svg+xml;base64,' + btoa(svg);
    el.style.backgroundImage = `url("${encoded}")`;
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = 'center';
    el.style.backgroundAttachment = 'fixed';
  });
</script>

<div
  bind:this={el}
  class="fixed inset-0 pointer-events-none"
  style="z-index: 0;"
  aria-hidden="true"
>
  <!-- Radial vignette overlay -->
  <div
    class="absolute inset-0"
    style="background: radial-gradient(ellipse at center, transparent 20%, rgba(10,10,15,0.5) 45%, rgba(10,10,15,0.9) 100%);"
  ></div>
</div>
