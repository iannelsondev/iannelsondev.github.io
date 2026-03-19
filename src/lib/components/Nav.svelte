<script lang="ts">
  import { onMount } from 'svelte';

  const navLinks = [
    { href: '#home', label: 'Home', num: '00', index: 1 },
    { href: '#about', label: 'About', num: '01', index: 2 },
    { href: '#experience', label: 'Experience', num: '02', index: 3 },
    { href: '#skills', label: 'Skills', num: '03', index: 4 },
    { href: '#projects', label: 'Projects', num: '04', index: 5 },
    { href: '#education', label: 'Education', num: '05', index: 6 },
    { href: '#blog', label: 'Community', num: '06', index: 7 }
  ];

  let activeSection = $state('home');
  let mobileOpen = $state(false);

  function handleNavClick(e: MouseEvent | KeyboardEvent, href: string, sectionIndex: number) {
    if (e.type === 'keydown' && (e as KeyboardEvent).key !== 'Enter' && (e as KeyboardEvent).key !== ' ') return;
    e.preventDefault();
    // @ts-ignore
    if (window.fullpage_api) {
      // Use numeric index — avoids anchor name conflicts with slides
      // @ts-ignore
      window.fullpage_api.moveTo(sectionIndex, 0);
    }
    mobileOpen = false;
  }

  function closeMobileNav() {
    mobileOpen = false;
  }

  onMount(() => {
    // Set initial active from URL hash
    const hash = window.location.hash.replace('#', '').split('/')[0];
    if (hash) activeSection = hash;

    // Listen for fullPage.js section changes
    function onSectionChange(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.anchor) {
        activeSection = detail.anchor;
      }
    }

    // Also listen for browser back/forward
    function onHashChange() {
      const h = window.location.hash.replace('#', '').split('/')[0];
      if (h) activeSection = h;
    }

    // WCAG 2.1.2 — Allow Escape key to close the mobile nav, releasing
    // keyboard focus from the trap.
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && mobileOpen) {
        mobileOpen = false;
      }
    }

    window.addEventListener('fp-section-change', onSectionChange);
    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('fp-section-change', onSectionChange);
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('keydown', onKeyDown);
    };
  });
</script>

<!--
  WCAG 2.4.7 — Mobile hamburger button.
  Using a <button> element gives native keyboard access (Enter/Space),
  proper focus management, and correct role announcement to AT.
-->
<button
  class="md:hidden fixed top-4 left-4 z-[200] flex flex-col justify-center items-center w-11 h-11 rounded border border-[rgba(99,102,241,0.2)] bg-[rgba(10,10,15,0.9)] backdrop-blur-sm cursor-pointer transition-colors duration-200 hover:border-[rgba(99,102,241,0.5)]"
  aria-label="{mobileOpen ? 'Close' : 'Open'} navigation menu"
  aria-expanded={mobileOpen}
  aria-controls="sidebar-nav"
  onclick={() => mobileOpen = !mobileOpen}
>
  <span class="block w-5 h-px bg-[#94a3b8] transition-transform duration-200 {mobileOpen ? 'rotate-45 translate-y-[3px]' : ''}"></span>
  <span class="block w-5 h-px bg-[#94a3b8] my-1 transition-opacity duration-200 {mobileOpen ? 'opacity-0' : ''}"></span>
  <span class="block w-5 h-px bg-[#94a3b8] transition-transform duration-200 {mobileOpen ? '-rotate-45 -translate-y-[7px]' : ''}"></span>
</button>

<!--
  WCAG 1.3.1 — <nav> with aria-label distinguishes this from the footer nav.
  id="sidebar-nav" is referenced by aria-controls on the hamburger button.
-->
<nav
  id="sidebar-nav"
  class="nav-sidebar fixed top-0 left-0 h-full z-[100] flex flex-col
    bg-[rgba(10,10,15,0.9)] backdrop-blur-xl border-r border-[rgba(99,102,241,0.1)]
    transition-transform duration-300 ease-out
    max-md:-translate-x-full {mobileOpen ? 'max-md:translate-x-0' : ''}"
  aria-label="Primary navigation"
>
  <!-- Brand — presentational, not a heading, to avoid disrupting heading hierarchy -->
  <div class="nav-brand" aria-hidden="true">
    <div class="font-mono font-bold tracking-[0.18em] text-[#f1f5f9] uppercase">
      IAN NELSON
    </div>
    <div class="font-mono text-[#94a3b8] tracking-wide leading-relaxed nav-subtitle">
      Autonomous Systems · Edge AI
    </div>
  </div>

  <!-- Nav links -->
  <ul class="flex flex-col flex-1 nav-links">
    {#each navLinks as link}
      <li>
        <!--
          WCAG 4.1.2 — aria-current="page" marks the active section link
          so AT users know which section is currently visible.
        -->
        <a
          href={link.href}
          class="flex items-center font-mono tracking-wider uppercase transition-[color,background-color,border-color] duration-200 group nav-link
            border-l-2 {activeSection === link.href.replace('#', '') ? 'border-[#6366f1] text-[#f1f5f9] bg-[rgba(99,102,241,0.08)]' : 'border-transparent text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[rgba(99,102,241,0.05)]'}"
          aria-current={activeSection === link.href.replace('#', '') ? 'true' : undefined}
          onclick={(e) => handleNavClick(e, link.href, link.index)}
          onkeydown={(e) => handleNavClick(e, link.href, link.index)}
        >
          <span class="nav-num" aria-hidden="true" style="color: var(--indigo-accessible); opacity: 0.7;">{link.num}</span>
          {link.label}
        </a>
      </li>
    {/each}
  </ul>

  <!-- Social links -->
  <div class="flex border-t border-[rgba(99,102,241,0.1)] nav-socials">
    <a
      href="https://linkedin.com/in/iannelsondev"
      target="_blank"
      rel="noopener noreferrer"
      class="font-mono tracking-widest uppercase text-[#94a3b8] hover:text-[#6366f1] transition-colors duration-200"
      aria-label="LinkedIn profile (opens in new tab)"
    >LI</a>
    <a
      href="https://github.com/iannelsondev"
      target="_blank"
      rel="noopener noreferrer"
      class="font-mono tracking-widest uppercase text-[#94a3b8] hover:text-[#6366f1] transition-colors duration-200"
      aria-label="GitHub profile (opens in new tab)"
    >GH</a>
    <a
      href="mailto:iannelsondev@proton.me"
      class="font-mono tracking-widest uppercase text-[#94a3b8] hover:text-[#6366f1] transition-colors duration-200"
      aria-label="Send email to iannelsondev@proton.me"
    >ML</a>
  </div>
</nav>

<!--
  WCAG 2.1.2 / 2.1.1 — Mobile overlay backdrop.
  Using a <button> instead of role="button" on a <div> provides native
  keyboard activation. tabindex="-1" keeps it out of the tab order since
  Escape (handled globally) is the intended dismissal path; clicking the
  dark backdrop is a pointer shortcut only.
-->
{#if mobileOpen}
  <button
    class="md:hidden fixed inset-0 z-[90] bg-black/50 cursor-default border-0 p-0"
    onclick={closeMobileNav}
    tabindex="-1"
    aria-hidden="true"
  ></button>
{/if}

<style>
  /* Nav scales with viewport using clamp() — works across all DPIs */
  .nav-sidebar {
    width: clamp(180px, 14vw, 260px);
    padding: clamp(1.5rem, 3vh, 2.5rem) clamp(1rem, 2vw, 1.75rem);
  }

  .nav-brand {
    margin-bottom: clamp(1.5rem, 3vh, 2.5rem);
  }

  .nav-brand > div:first-child {
    font-size: clamp(0.7rem, 0.9vw, 0.9rem);
  }

  .nav-subtitle {
    font-size: clamp(0.55rem, 0.65vw, 0.75rem);
    margin-top: 0.25rem;
  }

  .nav-links {
    gap: clamp(0.15rem, 0.4vh, 0.35rem);
  }

  .nav-link {
    font-size: clamp(0.65rem, 0.8vw, 0.85rem);
    padding: clamp(0.4rem, 0.6vh, 0.6rem) clamp(0.5rem, 0.8vw, 0.85rem);
    gap: clamp(0.35rem, 0.5vw, 0.6rem);
    border-radius: 0.25rem;
  }

  .nav-num {
    font-size: clamp(0.5rem, 0.6vw, 0.7rem);
  }

  .nav-socials {
    padding-top: clamp(1rem, 2vh, 1.5rem);
    gap: clamp(0.75rem, 1.5vw, 1.25rem);
  }

  .nav-socials a {
    font-size: clamp(0.55rem, 0.7vw, 0.75rem);
  }
</style>
