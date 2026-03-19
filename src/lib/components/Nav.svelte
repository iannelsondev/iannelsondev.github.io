<script lang="ts">
  import { onMount } from 'svelte';

  const navLinks = [
    { href: '#home', label: 'Home', num: '00' },
    { href: '#about', label: 'About', num: '01' },
    { href: '#experience', label: 'Experience', num: '02' },
    { href: '#skills', label: 'Skills', num: '03' },
    { href: '#projects', label: 'Projects', num: '04' },
    { href: '#education', label: 'Education', num: '05' },
    { href: '#blog', label: 'Blog', num: '06' }
  ];

  let activeSection = $state('home');
  let mobileOpen = $state(false);

  function handleNavClick(e: MouseEvent | KeyboardEvent, href: string) {
    if (e.type === 'keydown' && (e as KeyboardEvent).key !== 'Enter' && (e as KeyboardEvent).key !== ' ') return;
    e.preventDefault();
    const id = href.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    mobileOpen = false;
  }

  onMount(() => {
    const sections = document.querySelectorAll<HTMLElement>('section[id]');

    const obs = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeSection = entry.target.id;
        }
      }
    }, { threshold: 0.3, rootMargin: '-10% 0px -60% 0px' });

    sections.forEach(sec => obs.observe(sec));
    return () => obs.disconnect();
  });
</script>

<!-- Mobile hamburger button -->
<button
  class="md:hidden fixed top-4 left-4 z-[200] flex flex-col justify-center items-center w-10 h-10 rounded border border-[rgba(99,102,241,0.2)] bg-[rgba(10,10,15,0.9)] backdrop-blur-sm cursor-pointer transition-colors duration-200 hover:border-[rgba(99,102,241,0.5)]"
  aria-label="Toggle navigation"
  aria-expanded={mobileOpen}
  onclick={() => mobileOpen = !mobileOpen}
  onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); mobileOpen = !mobileOpen; } }}
>
  <span class="block w-5 h-px bg-[#94a3b8] transition-transform duration-200 {mobileOpen ? 'rotate-45 translate-y-[3px]' : ''}"></span>
  <span class="block w-5 h-px bg-[#94a3b8] my-1 transition-opacity duration-200 {mobileOpen ? 'opacity-0' : ''}"></span>
  <span class="block w-5 h-px bg-[#94a3b8] transition-transform duration-200 {mobileOpen ? '-rotate-45 -translate-y-[7px]' : ''}"></span>
</button>

<!-- Sidebar nav -->
<nav
  class="fixed top-0 left-0 h-full z-[100] flex flex-col py-8 px-6 w-[220px]
    bg-[rgba(10,10,15,0.9)] backdrop-blur-xl border-r border-[rgba(99,102,241,0.1)]
    transition-transform duration-300 ease-out
    max-md:-translate-x-full {mobileOpen ? 'max-md:translate-x-0' : ''}"
  aria-label="Primary navigation"
>
  <!-- Brand -->
  <div class="mb-8">
    <div class="font-mono text-xs font-bold tracking-[0.18em] text-[#f1f5f9] uppercase">
      IAN NELSON
    </div>
    <div class="font-mono text-[0.6rem] text-[#94a3b8] tracking-wide mt-1 leading-relaxed">
      Autonomous Systems · Edge AI
    </div>
  </div>

  <!-- Nav links -->
  <ul class="flex flex-col gap-1 flex-1" role="list">
    {#each navLinks as link}
      <li>
        <a
          href={link.href}
          class="flex items-center gap-2 px-3 py-2 rounded text-xs font-mono tracking-wider uppercase transition-all duration-200 group
            border-l-2 {activeSection === link.href.replace('#', '') ? 'border-[#6366f1] text-[#f1f5f9] bg-[rgba(99,102,241,0.08)]' : 'border-transparent text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[rgba(99,102,241,0.05)]'}"
          onclick={(e) => handleNavClick(e, link.href)}
          onkeydown={(e) => handleNavClick(e, link.href)}
        >
          <span class="text-[#6366f1] opacity-50 text-[0.6rem]">{link.num}</span>
          {link.label}
        </a>
      </li>
    {/each}
  </ul>

  <!-- Social links -->
  <div class="flex gap-4 pt-6 border-t border-[rgba(99,102,241,0.1)]">
    <a
      href="https://linkedin.com/in/iannelsondev"
      target="_blank"
      rel="noopener noreferrer"
      class="font-mono text-[0.6rem] tracking-widest uppercase text-[#94a3b8] hover:text-[#6366f1] transition-colors duration-200"
      aria-label="LinkedIn"
    >LI</a>
    <a
      href="https://github.com/iannelsondev"
      target="_blank"
      rel="noopener noreferrer"
      class="font-mono text-[0.6rem] tracking-widest uppercase text-[#94a3b8] hover:text-[#6366f1] transition-colors duration-200"
      aria-label="GitHub"
    >GH</a>
    <a
      href="mailto:iannelsondev@proton.me"
      class="font-mono text-[0.6rem] tracking-widest uppercase text-[#94a3b8] hover:text-[#6366f1] transition-colors duration-200"
      aria-label="Email"
    >ML</a>
  </div>
</nav>

<!-- Mobile overlay backdrop -->
{#if mobileOpen}
  <div
    class="md:hidden fixed inset-0 z-[90] bg-black/50"
    onclick={() => mobileOpen = false}
    onkeydown={(e) => { if (e.key === 'Escape') mobileOpen = false; }}
    role="button"
    tabindex="-1"
    aria-label="Close navigation"
  ></div>
{/if}
