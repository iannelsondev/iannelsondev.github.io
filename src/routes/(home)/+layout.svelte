<script lang="ts">
  import { onMount } from 'svelte';
  import Nav from '$lib/components/Nav.svelte';

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

  onMount(() => {
    // fullPage.js needs overflow:hidden on html — scoped to this layout
    document.documentElement.style.overflow = 'hidden';

    let fpInstance: any;

    import('fullpage.js').then((fullpage) => {
      const sectionAnchors = ['home', 'about', 'experience', 'skills', 'projects', 'education', 'blog'];

      fpInstance = new fullpage.default('#fullpage', {
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
    });

    return () => {
      document.documentElement.style.overflow = '';
      // @ts-ignore
      if (window.fullpage_api) window.fullpage_api.destroy('all');
    };
  });
</script>

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
