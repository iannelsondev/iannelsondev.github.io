<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    seed?: number;
    density?: number;
    fillColor?: string;
  }

  let { seed = 42, density = 0.25, fillColor = '#6366f1' }: Props = $props();

  // Hex cell dimensions (flat-top pointy-side hex in a repeating tile)
  // The SVG pattern tile is 56×100 — each tile contains one hex cell
  // We scatter filled rects across a grid of tiles client-side only
  const COLS = 40;
  const ROWS = 24;

  interface FilledCell {
    x: number;
    y: number;
    opacity: number;
  }

  let filledCells = $state<FilledCell[]>([]);

  onMount(() => {
    // Seeded PRNG (mulberry32) — deterministic per seed but runs only client-side
    // so there's no SSR/hydration mismatch (the SVG is not rendered on the server)
    let s = seed;
    function rand(): number {
      s |= 0;
      s = s + 0x6d2b79f5 | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    const cells: FilledCell[] = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (rand() < density) {
          // Opacity tiers: light wash, mid, accent
          const r = rand();
          const opacity = r < 0.5 ? 0.06 + rand() * 0.06 : r < 0.85 ? 0.12 + rand() * 0.1 : 0.22 + rand() * 0.12;
          cells.push({ x: col, y: row, opacity });
        }
      }
    }
    filledCells = cells;
  });

  // Convert grid col/row to pixel position in the SVG viewBox
  // Hex tile: 56px wide, 100px tall — offset every other row by 28px
  function cellX(col: number, row: number): number {
    return col * 56 + (row % 2 === 1 ? 28 : 0);
  }
  function cellY(row: number): number {
    return row * 75; // hex rows overlap: 100 * 0.75
  }
</script>

<!-- aria-hidden: purely decorative -->
<div class="hex-bg" aria-hidden="true">
  {#if filledCells.length > 0}
    <!-- Filled cells rendered as an SVG overlay, client-side only -->
    <svg
      class="hex-fills"
      viewBox="0 0 {COLS * 56} {ROWS * 75}"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      {#each filledCells as cell (cell.x + '-' + cell.y)}
        <!--
          Pointy-top hex polygon centered at (cx, cy) with radius ~28px.
          For a flat-top hex in a 56×100 tile the six vertices relative
          to the cell center are at angles 0°,60°,…,300° with r=28.
          Center of each tile: cx = col*56+28 (+28 offset if odd row),
          cy = row*75+50 (50 = half of 100px tile height).
        -->
        {@const cx = cellX(cell.x, cell.y) + 28}
        {@const cy = cellY(cell.y) + 50}
        {@const r = 27}
        <polygon
          points="{cx + r},{ cy}
                  {cx + r/2},{cy - r * 0.866}
                  {cx - r/2},{cy - r * 0.866}
                  {cx - r  },{cy}
                  {cx - r/2},{cy + r * 0.866}
                  {cx + r/2},{cy + r * 0.866}"
          fill={fillColor}
          fill-opacity={cell.opacity}
        />
      {/each}
    </svg>
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
    /* Hex grid via repeating SVG pattern — strokes are visible now */
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100'%3E%3Cpolygon points='28,2 54,17 54,83 28,98 2,83 2,17' fill='none' stroke='%236366f1' stroke-opacity='0.35' stroke-width='1'/%3E%3C/svg%3E");
    background-size: 56px 100px;
    animation: hexDrift 30s linear infinite;
  }

  /* Filled-cell SVG stretches to cover the full fixed element */
  .hex-fills {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    animation: hexDrift 30s linear infinite;
  }

  @keyframes hexDrift {
    0%   { background-position: 0 0;       transform: translate(0, 0); }
    100% { background-position: 56px 75px; transform: translate(56px, 75px); }
  }

  /* Vignette: darkens only the edges, leaves center transparent */
  .hex-vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      ellipse 80% 70% at 50% 50%,
      transparent 0%,
      transparent 40%,
      rgba(10, 10, 15, 0.55) 70%,
      rgba(10, 10, 15, 0.88) 100%
    );
    pointer-events: none;
  }
</style>
