<script lang="ts">
  // Pure CSS animated hex grid — no JS rendering, no DOM bloat
</script>

<div class="hex-bg" aria-hidden="true">
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
    /* Hex grid via repeating SVG pattern */
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100'%3E%3Cpath d='M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100' fill='none' stroke='%236366f1' stroke-opacity='0.07' stroke-width='0.5'/%3E%3Cpath d='M28 0L28 34L0 50L0 84L28 100L56 84L56 50L28 34' fill='none' stroke='%236366f1' stroke-opacity='0.04' stroke-width='0.5'/%3E%3C/svg%3E");
    background-size: 56px 100px;
    animation: hexDrift 25s linear infinite;
  }

  @keyframes hexDrift {
    0% { background-position: 0 0; }
    100% { background-position: 56px 100px; }
  }

  .hex-vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at center, transparent 20%, rgba(10,10,15,0.5) 50%, rgba(10,10,15,0.92) 100%);
  }
</style>
