<script lang="ts">
  import '../app.css';
  import PixelGrid from '$lib/components/PixelGrid.svelte';

  interface Props {
    children: import('svelte').Snippet;
  }

  let { children }: Props = $props();
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

{@render children()}
