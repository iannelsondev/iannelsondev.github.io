<script lang="ts">
  interface Props {
    seed?: number;
    density?: number;
    fillColor?: string;
  }

  let { seed = 42, density = 0.25, fillColor = '#6366f1' }: Props = $props();

  const COLS = 26;
  const ROWS = 18;
  const CELL = 60;
  const W = COLS * CELL;
  const H = ROWS * CELL;

  function seededRandom(s: number) {
    let state = s;
    return () => {
      state = (state * 1664525 + 1013904223) & 0xffffffff;
      return (state >>> 0) / 0xffffffff;
    };
  }

  const cells = $derived.by(() => {
    const rand = seededRandom(seed);
    const result: Array<{ x: number; y: number; opacity: number; filled: boolean }> = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const r = rand();
        const filled = r < density;
        const opacity = filled ? 0.03 + rand() * 0.57 : 0.08;
        result.push({ x: col * CELL, y: row * CELL, opacity, filled });
      }
    }
    return result;
  });
</script>

<div
  class="fixed inset-0 pointer-events-none overflow-hidden"
  style="z-index: 0;"
  aria-hidden="true"
>
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 {W} {H}"
    preserveAspectRatio="xMidYMid slice"
    xmlns="http://www.w3.org/2000/svg"
    style="position: absolute; inset: 0; width: 100%; height: 100%;"
  >
    {#each cells as cell}
      {#if cell.filled}
        <rect
          x={cell.x}
          y={cell.y}
          width={CELL}
          height={CELL}
          fill={fillColor}
          fill-opacity={cell.opacity}
          stroke={fillColor}
          stroke-opacity="0.08"
          stroke-width="0.5"
        />
      {:else}
        <rect
          x={cell.x}
          y={cell.y}
          width={CELL}
          height={CELL}
          fill="none"
          stroke={fillColor}
          stroke-opacity="0.08"
          stroke-width="0.5"
        />
      {/if}
    {/each}
  </svg>
  <!-- Radial vignette overlay -->
  <div
    style="position: absolute; inset: 0; background: radial-gradient(ellipse at center, transparent 30%, rgba(10,10,15,0.85) 100%);"
  ></div>
</div>
