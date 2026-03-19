<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import Nav from '$lib/components/Nav.svelte';
  import PixelGrid from '$lib/components/PixelGrid.svelte';

  interface Props {
    children: import('svelte').Snippet;
  }

  let { children }: Props = $props();

  // WCAG 4.1.3 — live region announces section name to screen readers on navigation
  let currentSectionLabel = $state('');

  const sectionLabels: Record<string, string> = {
    home: 'Home',
    about: 'About',
    experience: 'Experience',
    skills: 'Skills',
    projects: 'Projects',
    education: 'Education',
    blog: 'Community',
  };

  onMount(async () => {
    const fullpage = await import('fullpage.js');

    const sectionAnchors = ['home', 'about', 'experience', 'skills', 'projects', 'education', 'blog'];

    new fullpage.default('#fullpage', {
      licenseKey: 'gplv3-license',
      autoScrolling: true,
      scrollOverflow: true,
      scrollingSpeed: 700,
      fitToSection: true,
      css3: true,
      easing: 'easeInOutCubic',
      navigation: false,
      controlArrows: true,
      slidesNavigation: false,
      anchors: sectionAnchors,
      recordHistory: true,
      lockAnchors: false,
      afterLoad: (_origin: any, destination: any) => {
        const anchor = sectionAnchors[destination.index] || '';
        // Announce section change to screen readers via live region
        currentSectionLabel = sectionLabels[anchor] ?? anchor;
        window.dispatchEvent(new CustomEvent('fp-section-change', {
          detail: { index: destination.index, anchor }
        }));
      },
      afterSlideLoad: (_section: any, _origin: any, destination: any) => {
        window.dispatchEvent(new CustomEvent('fp-slide-change', {
          detail: { slideIndex: destination.index }
        }));
      }
    });

    return () => {
      // @ts-ignore
      if (window.fullpage_api) window.fullpage_api.destroy('all');
    };
  });
</script>

<svelte:head>
  <title>Ian Nelson — AI Systems Architect & CTO | Multi-Agent AI</title>
  <meta name="description" content="CTO & AI architect with 20+ years in the Intelligence Community. Building multi-agent AI swarms, on-prem LLM inference, and knowledge graph pipelines." />
  <link rel="canonical" href="https://iannelsondev.github.io/" />

  <!-- Open Graph -->
  <meta property="og:type" content="profile" />
  <meta property="og:url" content="https://iannelsondev.github.io/" />
  <meta property="og:title" content="Ian Nelson — AI Systems Architect & CTO" />
  <meta property="og:description" content="20+ years building autonomous AI systems, multi-agent swarms, on-prem LLM inference, and knowledge graph pipelines. CTO at Clarity Innovations, CEO at Talon Black." />
  <meta property="og:image" content="https://iannelsondev.github.io/og-image.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Ian Nelson — AI Systems Architect" />
  <meta property="og:site_name" content="Ian Nelson" />
  <meta property="profile:first_name" content="Ian" />
  <meta property="profile:last_name" content="Nelson" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Ian Nelson — AI Systems Architect & CTO" />
  <meta name="twitter:description" content="20+ years building autonomous AI systems, multi-agent swarms, on-prem LLM inference, and knowledge graph pipelines." />
  <meta name="twitter:image" content="https://iannelsondev.github.io/og-image.png" />
  <meta name="twitter:image:alt" content="Ian Nelson — AI Systems Architect" />

  <!-- Structured Data -->
  {@html `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Ian Nelson",
    "url": "https://iannelsondev.github.io",
    "image": "https://iannelsondev.github.io/og-image.png",
    "jobTitle": "CTO, R&D",
    "worksFor": [
      { "@type": "Organization", "name": "Clarity Innovations", "url": "https://clarityinnovates.com" },
      { "@type": "Organization", "name": "Talon Black", "url": "https://www.talonblack.com" }
    ],
    "alumniOf": [
      { "@type": "CollegeOrUniversity", "name": "University of Maryland Global Campus", "url": "https://www.umgc.edu" }
    ],
    "knowsAbout": [
      "Multi-Agent AI Systems", "Autonomous Systems", "Edge AI Inference",
      "Knowledge Graphs", "LLM Orchestration", "Kubernetes", "Intelligence Community",
      "Retrieval-Augmented Generation"
    ],
    "sameAs": [
      "https://linkedin.com/in/iannelsondev",
      "https://github.com/iannelsondev"
    ],
    "email": "iannelsondev@proton.me",
    "description": "AI systems architect and CTO with 20+ years building autonomous multi-agent systems, on-prem LLM inference, and knowledge graph pipelines across the Intelligence Community and private sector."
  })}</script>`}
  {@html `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Ian Nelson",
    "url": "https://iannelsondev.github.io",
    "description": "Portfolio of Ian Nelson — AI systems architect and CTO",
    "author": { "@type": "Person", "name": "Ian Nelson" }
  })}</script>`}
</svelte:head>

<!-- WCAG 2.4.1 — Skip navigation link bypasses repeated nav block -->
<a href="#main-content" class="skip-link">Skip to main content</a>

<!-- Background pixel grid — decorative, aria-hidden set inside component -->
<PixelGrid seed={137} density={0.25} fillColor="#6366f1" />

<!-- Left sidebar nav -->
<Nav />

<!--
  WCAG 4.1.3 — Status Messages: aria-live region announces section changes
  to screen readers without moving focus.
-->
<div
  aria-live="polite"
  aria-atomic="true"
  class="sr-only"
>
  {#if currentSectionLabel}
    Section: {currentSectionLabel}
  {/if}
</div>

<!--
  WCAG 1.3.1 — Main landmark: wraps all primary page content so screen
  reader users can jump directly here via the skip link or landmarks list.
-->
<main id="main-content" tabindex="-1" class="relative z-10 main-content">
  <div id="fullpage">
    {@render children()}
  </div>
</main>

<style>
  @media (min-width: 768px) {
    .main-content {
      margin-left: clamp(180px, 14vw, 260px);
    }
  }

  /* sr-only utility — visually hidden but accessible to screen readers */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  /* Remove focus ring from main when programmatically focused via skip link */
  main:focus {
    outline: none;
  }
</style>
