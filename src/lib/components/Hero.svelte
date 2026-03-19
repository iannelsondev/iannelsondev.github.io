<script lang="ts">
  // No props needed — hero is static content
</script>

<section
  id="home"
  class="min-h-screen flex flex-col items-center justify-center text-center px-8 py-24 relative"
  aria-label="Introduction"
>
  <h1 class="font-mono font-bold leading-none tracking-tight mb-4" style="font-size: clamp(3rem, 10vw, 7rem);">
    <span
      class="block"
      style="background: linear-gradient(135deg, #6366f1, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        text-shadow: none;
        filter: drop-shadow(0 0 40px rgba(99,102,241,0.4)) drop-shadow(0 0 80px rgba(6,182,212,0.2));"
    >IAN</span>
    <span
      class="block"
      style="background: linear-gradient(135deg, #6366f1, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        filter: drop-shadow(0 0 40px rgba(99,102,241,0.4)) drop-shadow(0 0 80px rgba(6,182,212,0.2));"
    >NELSON</span>
  </h1>

  <p
    class="font-mono uppercase tracking-[0.35em] text-[#94a3b8] mb-6"
    style="font-size: clamp(0.7rem, 1.8vw, 0.95rem);"
  >
    AUTONOMOUS SYSTEMS · EDGE AI · INTELLIGENCE
  </p>

  <p class="text-[#94a3b8] max-w-lg mx-auto mb-10 leading-relaxed text-sm">
    Building multi-agent swarms, on-prem AI matching frontier models, knowledge graph pipelines, and edge inference systems.
  </p>

  <div class="flex flex-wrap gap-3 justify-center mb-16">
    <a
      href="https://linkedin.com/in/iannelsondev"
      target="_blank"
      rel="noopener noreferrer"
      class="font-mono text-[0.7rem] tracking-[0.14em] uppercase text-[#f1f5f9] px-6 py-3 rounded-md
        transition-all duration-200 hover:-translate-y-0.5"
      style="border: 1px solid transparent; background: linear-gradient(#0a0a0f, #0a0a0f) padding-box, linear-gradient(135deg, #6366f1, #06b6d4) border-box;"
      onmouseover={(e) => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #6366f1, #06b6d4)'; }}
      onfocus={(e) => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #6366f1, #06b6d4)'; }}
      onmouseout={(e) => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(#0a0a0f, #0a0a0f) padding-box, linear-gradient(135deg, #6366f1, #06b6d4) border-box'; }}
      onblur={(e) => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(#0a0a0f, #0a0a0f) padding-box, linear-gradient(135deg, #6366f1, #06b6d4) border-box'; }}
    >LinkedIn</a>
    <a
      href="https://github.com/iannelsondev"
      target="_blank"
      rel="noopener noreferrer"
      class="font-mono text-[0.7rem] tracking-[0.14em] uppercase text-[#f1f5f9] px-6 py-3 rounded-md
        transition-all duration-200 hover:-translate-y-0.5"
      style="border: 1px solid transparent; background: linear-gradient(#0a0a0f, #0a0a0f) padding-box, linear-gradient(135deg, #6366f1, #06b6d4) border-box;"
      onmouseover={(e) => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #6366f1, #06b6d4)'; }}
      onfocus={(e) => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #6366f1, #06b6d4)'; }}
      onmouseout={(e) => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(#0a0a0f, #0a0a0f) padding-box, linear-gradient(135deg, #6366f1, #06b6d4) border-box'; }}
      onblur={(e) => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(#0a0a0f, #0a0a0f) padding-box, linear-gradient(135deg, #6366f1, #06b6d4) border-box'; }}
    >GitHub</a>
    <a
      href="mailto:iannelsondev@proton.me"
      class="font-mono text-[0.7rem] tracking-[0.14em] uppercase text-[#f1f5f9] px-6 py-3 rounded-md
        transition-all duration-200 hover:-translate-y-0.5"
      style="border: 1px solid transparent; background: linear-gradient(#0a0a0f, #0a0a0f) padding-box, linear-gradient(135deg, #6366f1, #06b6d4) border-box;"
      onmouseover={(e) => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #6366f1, #06b6d4)'; }}
      onfocus={(e) => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #6366f1, #06b6d4)'; }}
      onmouseout={(e) => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(#0a0a0f, #0a0a0f) padding-box, linear-gradient(135deg, #6366f1, #06b6d4) border-box'; }}
      onblur={(e) => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(#0a0a0f, #0a0a0f) padding-box, linear-gradient(135deg, #6366f1, #06b6d4) border-box'; }}
    >iannelsondev@proton.me</a>
  </div>

  <!-- Scroll indicator -->
  <div class="flex flex-col items-center gap-2 opacity-40 animate-bounce" aria-hidden="true">
    <span class="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-[#94a3b8]">SCROLL</span>
    <div class="w-px h-8" style="background: linear-gradient(to bottom, #6366f1, transparent);"></div>
  </div>
</section>
