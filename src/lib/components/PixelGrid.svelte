<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    seed?: number;
  }

  let { seed = 42 }: Props = $props();

  let svgContent = $state('');

  onMount(() => {
    // Seeded PRNG (mulberry32)
    let s = seed;
    function rand(): number {
      s |= 0;
      s = s + 0x6d2b79f5 | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    const W = 2400, H = 1600;
    let hexes = '';

    // Scatter hex clusters organically across the viewport
    // Create ~120 hexes of varying size, loosely clustered
    const clusterCenters = [];
    for (let i = 0; i < 12; i++) {
      clusterCenters.push({ x: rand() * W, y: rand() * H });
    }

    for (let i = 0; i < 140; i++) {
      // Pick a cluster to gravitate toward (or go free)
      const free = rand() < 0.3;
      let cx: number, cy: number;
      if (free) {
        cx = rand() * W;
        cy = rand() * H;
      } else {
        const cluster = clusterCenters[Math.floor(rand() * clusterCenters.length)];
        cx = cluster.x + (rand() - 0.5) * 350;
        cy = cluster.y + (rand() - 0.5) * 280;
      }

      // Varying sizes: small (12-18), medium (22-35), large (40-60)
      const sizeRoll = rand();
      const r = sizeRoll < 0.35 ? 10 + rand() * 10
              : sizeRoll < 0.75 ? 20 + rand() * 18
              : 38 + rand() * 25;

      // Hex vertices (flat-top)
      const points = [];
      for (let a = 0; a < 6; a++) {
        const angle = (Math.PI / 3) * a - Math.PI / 6;
        points.push(`${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`);
      }
      const pts = points.join(' ');

      // Style: filled dark, outlined, or thin outline
      const styleRoll = rand();
      if (styleRoll < 0.18) {
        // Filled with indigo at medium opacity
        const opacity = (0.15 + rand() * 0.25).toFixed(3);
        hexes += `<polygon points="${pts}" fill="#6366f1" fill-opacity="${opacity}" stroke="#6366f1" stroke-opacity="0.3" stroke-width="1"/>`;
      } else if (styleRoll < 0.5) {
        // Thick outlined hex
        const strokeOp = (0.15 + rand() * 0.25).toFixed(3);
        const sw = (1 + rand() * 1.5).toFixed(1);
        hexes += `<polygon points="${pts}" fill="none" stroke="#6366f1" stroke-opacity="${strokeOp}" stroke-width="${sw}"/>`;
      } else {
        // Thin outlined hex
        const strokeOp = (0.08 + rand() * 0.15).toFixed(3);
        hexes += `<polygon points="${pts}" fill="none" stroke="#6366f1" stroke-opacity="${strokeOp}" stroke-width="0.5"/>`;
      }
    }

    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%">${hexes}</svg>`;
  });
</script>

<div class="hex-bg" aria-hidden="true">
  {#if svgContent}
    {@html svgContent}
  {/if}
  <div class="hex-vignette"></div>
</div>

<style>
  .hex-bg {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
    background-color: #0a0a0f;
    animation: hexFloat 40s ease-in-out infinite alternate;
  }

  .hex-bg :global(svg) {
    position: absolute;
    inset: -5% -5%;
    width: 110%;
    height: 110%;
    animation: hexFloat 40s ease-in-out infinite alternate;
  }

  @keyframes hexFloat {
    0%   { transform: translate(0, 0) scale(1); }
    50%  { transform: translate(-15px, -10px) scale(1.02); }
    100% { transform: translate(10px, 8px) scale(1); }
  }

  .hex-vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      ellipse 85% 75% at 50% 50%,
      transparent 0%,
      transparent 35%,
      rgba(10, 10, 15, 0.45) 60%,
      rgba(10, 10, 15, 0.85) 100%
    );
    pointer-events: none;
  }
</style>
