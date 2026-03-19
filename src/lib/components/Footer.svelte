<script lang="ts">
  // Static footer — no props needed
</script>

<footer
  class="relative z-10 px-8 py-8 flex items-center justify-between flex-wrap gap-4
    border-t border-[rgba(99,102,241,0.1)] max-sm:flex-col max-sm:items-start"
  aria-label="Site footer"
>
  <div class="font-mono tracking-[0.18em] uppercase text-[#94a3b8]" style="font-size: clamp(0.55rem, 0.65vw, 0.7rem);">Ian Nelson</div>
  <div class="font-mono text-[#94a3b8]" style="font-size: clamp(0.55rem, 0.65vw, 0.7rem);">© 2026</div>
  <!--
    WCAG 2.4.4 — Each link has a descriptive accessible name.
    External links note that they open in a new tab (WCAG 2.4.4, advisory).
  -->
  <nav class="flex gap-5" aria-label="Social links">
    <a
      href="https://linkedin.com/in/iannelsondev"
      target="_blank"
      rel="noopener noreferrer"
      class="font-mono tracking-[0.12em] uppercase text-[#94a3b8] hover:text-[#6366f1] transition-colors duration-200"
      style="font-size: clamp(0.55rem, 0.65vw, 0.7rem);"
      aria-label="LinkedIn profile (opens in new tab)"
    >LinkedIn</a>
    <a
      href="https://github.com/iannelsondev"
      target="_blank"
      rel="noopener noreferrer"
      class="font-mono tracking-[0.12em] uppercase text-[#94a3b8] hover:text-[#6366f1] transition-colors duration-200"
      style="font-size: clamp(0.55rem, 0.65vw, 0.7rem);"
      aria-label="GitHub profile (opens in new tab)"
    >GitHub</a>
    <a
      href="mailto:iannelsondev@proton.me"
      class="font-mono tracking-[0.12em] uppercase text-[#94a3b8] hover:text-[#6366f1] transition-colors duration-200"
      style="font-size: clamp(0.55rem, 0.65vw, 0.7rem);"
      aria-label="Send email to iannelsondev@proton.me"
    >Email</a>
  </nav>
</footer>
