<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { getPost } from '$lib/blog';
  import AudioNarrator from '$lib/components/AudioNarrator.svelte';
  import type { Component } from 'svelte';

  // Eagerly import all post components at build time
  const postModules = import.meta.glob('/src/lib/blog/posts/*/Post.svelte', { eager: true }) as Record<string, { default: Component }>;

  interface Props {
    data: { slug: string };
  }

  let { data }: Props = $props();

  const post = getPost(data.slug)!;
  const PostComponent = postModules[`/src/lib/blog/posts/${data.slug}/Post.svelte`]?.default;

  let scrollProgress = $state(0);
  let activeSection = $state(post.sections[0]?.id ?? '');

  onMount(() => {
    const sectionEls = post.sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean) as HTMLElement[];

    function onScroll() {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress = docHeight > 0 ? Math.min(window.scrollY / docHeight, 1) : 0;

      // Update active TOC section based on scroll position
      for (let i = sectionEls.length - 1; i >= 0; i--) {
        if (sectionEls[i].getBoundingClientRect().top <= 120) {
          activeSection = post.sections[i].id;
          break;
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  });

  const formattedDate = $derived(
    new Date(post.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  );
</script>

<svelte:head>
  <title>{post.title} — Ian Nelson</title>
  <meta name="description" content={post.summary} />
  <link rel="canonical" href="https://iannelsondev.github.io/blog/{post.slug}/" />

  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://iannelsondev.github.io/blog/{post.slug}/" />
  <meta property="og:title" content="{post.title} — Ian Nelson" />
  <meta property="og:description" content={post.summary} />
  {#if post.coverImage}
    <meta property="og:image" content="https://iannelsondev.github.io{post.coverImage}" />
  {/if}
  <meta property="article:published_time" content={post.date} />
  {#each post.tags as tag}
    <meta property="article:tag" content={tag} />
  {/each}

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{post.title} — Ian Nelson" />
  <meta name="twitter:description" content={post.summary} />
  {#if post.coverImage}
    <meta name="twitter:image" content="https://iannelsondev.github.io{post.coverImage}" />
  {/if}

  {@html `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.summary,
    "datePublished": post.date,
    "author": { "@type": "Person", "name": "Ian Nelson", "url": "https://iannelsondev.github.io" },
    "publisher": { "@type": "Person", "name": "Ian Nelson" },
    "mainEntityOfPage": `https://iannelsondev.github.io/blog/${post.slug}/`,
    ...(post.coverImage ? { "image": `https://iannelsondev.github.io${post.coverImage}` } : {})
  })}</script>`}
</svelte:head>

<!-- Reading progress bar -->
<div
  class="fixed top-0 left-0 h-0.5 z-[60] pointer-events-none"
  style="width: {scrollProgress * 100}%; background: var(--grad);"
  role="progressbar"
  aria-valuenow={Math.round(scrollProgress * 100)}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="Reading progress"
></div>

<div class="blog-layout">
  <!-- Sticky TOC sidebar (desktop only) -->
  {#if post.sections.length > 0}
    <aside class="toc-sidebar" aria-label="Table of contents">
      <nav>
        <div class="font-mono text-xs tracking-[0.3em] uppercase text-[var(--indigo-accessible)] mb-4">Contents</div>
        <ol class="flex flex-col gap-1">
          {#each post.sections as section, i}
            <li>
              <a
                href="#{section.id}"
                class="toc-link {activeSection === section.id ? 'toc-active' : ''}"
              >
                <span class="toc-num">{String(i + 1).padStart(2, '0')}</span>
                {section.title}
              </a>
            </li>
          {/each}
        </ol>
      </nav>

      <!-- Back link at bottom of TOC -->
      <a
        href="/#blog"
        class="toc-back"
      >
        <span aria-hidden="true">&larr;</span>
        Community
      </a>
    </aside>
  {/if}

  <!-- Main content column -->
  <article class="blog-content">
    <!-- Header -->
    <header class="mb-10">
      {#if post.coverImage}
        <img
          src={post.coverImage}
          alt=""
          class="w-full aspect-video object-cover rounded-xl mb-8 border border-[rgba(99,102,241,0.15)]"
        />
      {/if}

      <h1
        class="font-['Bebas_Neue'] tracking-wide text-[#f1f5f9] mb-4"
        style="font-size: clamp(2.5rem, 5vw, 4rem); line-height: 1.1;"
      >
        <span style="background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
          {post.title}
        </span>
      </h1>

      <div class="flex flex-wrap items-center gap-4 font-mono text-[#94a3b8]" style="font-size: clamp(0.75rem, 0.9vw, 0.85rem);">
        <time datetime={post.date}>{formattedDate}</time>
        <span aria-hidden="true">&middot;</span>
        <span>{post.readingTime} min read</span>
      </div>

      <div class="flex flex-wrap gap-2 mt-4">
        {#each post.tags as tag}
          <span
            class="px-2.5 py-1 rounded-full font-mono text-xs tracking-wider uppercase border border-[rgba(99,102,241,0.25)] text-[var(--indigo-accessible)] bg-[rgba(99,102,241,0.08)]"
          >{tag}</span>
        {/each}
      </div>
    </header>

    <!-- Mobile TOC (shown below header on small screens) -->
    {#if post.sections.length > 0}
      <nav
        class="mb-10 p-5 rounded-xl md:hidden"
        style="background: var(--card-bg); border: 1px solid var(--card-border);"
        aria-label="Table of contents"
      >
        <h2 class="font-mono text-xs tracking-[0.3em] uppercase text-[var(--indigo-accessible)] mb-3">Contents</h2>
        <ol class="flex flex-col gap-1.5">
          {#each post.sections as section, i}
            <li>
              <a
                href="#{section.id}"
                class="font-mono text-sm text-[#94a3b8] hover:text-[#f1f5f9] transition-colors duration-200"
              >
                <span class="text-[var(--indigo-accessible)] opacity-60 mr-2">{String(i + 1).padStart(2, '0')}</span>
                {section.title}
              </a>
            </li>
          {/each}
        </ol>
      </nav>
    {/if}

    <!-- Post content -->
    <div class="prose-blog">
      {#if PostComponent}
        <PostComponent />
      {/if}
    </div>

    <!-- Back to Community (mobile) -->
    <div class="mt-16 pt-8 border-t border-[rgba(99,102,241,0.1)] md:hidden">
      <a
        href="/#blog"
        class="inline-flex items-center gap-2 font-mono text-sm tracking-wider uppercase text-[#94a3b8] hover:text-[var(--indigo-accessible)] transition-colors duration-200"
      >
        <span aria-hidden="true">&larr;</span>
        Back to Community
      </a>
    </div>
  </article>
</div>

<!-- Audio narrator -->
<AudioNarrator sections={post.sections} audioSrc="/blog/{post.slug}/narration.mp3" />

<style>
  /* Two-column layout: sticky TOC left, content right */
  .blog-layout {
    display: grid;
    grid-template-columns: 1fr;
    max-width: 72rem;
    margin: 0 auto;
    padding: 3rem 1rem;
  }

  @media (min-width: 768px) {
    .blog-layout {
      grid-template-columns: 13rem 1fr;
      gap: 3rem;
      padding: 3rem 2rem;
    }
  }

  @media (min-width: 1024px) {
    .blog-layout {
      grid-template-columns: 14rem 1fr;
      gap: 4rem;
      padding: 3rem 3rem;
    }
  }

  /* Sticky TOC sidebar */
  .toc-sidebar {
    display: none;
  }

  @media (min-width: 768px) {
    .toc-sidebar {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: sticky;
      top: 5rem;
      align-self: start;
      max-height: calc(100vh - 7rem);
    }
  }

  .toc-link {
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
    font-family: var(--mono);
    font-size: 0.75rem;
    padding: 0.35rem 0.5rem;
    border-radius: 0.25rem;
    color: #94a3b8;
    transition: color 0.2s, background-color 0.2s;
    text-decoration: none;
    line-height: 1.4;
  }

  .toc-link:hover {
    color: #f1f5f9;
    background: rgba(99, 102, 241, 0.06);
  }

  .toc-active {
    color: #f1f5f9;
    background: rgba(99, 102, 241, 0.1);
    border-left: 2px solid #6366f1;
    padding-left: calc(0.5rem - 2px);
  }

  .toc-num {
    color: var(--indigo-accessible);
    opacity: 0.5;
    font-size: 0.65rem;
    min-width: 1.2rem;
  }

  .toc-back {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-family: var(--mono);
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #94a3b8;
    transition: color 0.2s;
    margin-top: 2rem;
    text-decoration: none;
  }

  .toc-back:hover {
    color: var(--indigo-accessible);
  }

  /* Content column */
  .blog-content {
    min-width: 0;
    max-width: 48rem;
  }

  /* Prose styles — readable body text */
  .prose-blog :global(h2) {
    font-family: 'Bebas Neue', cursive;
    font-size: clamp(1.75rem, 3vw, 2.5rem);
    color: #f1f5f9;
    margin-top: 3rem;
    margin-bottom: 1.25rem;
    letter-spacing: 0.02em;
    line-height: 1.2;
    scroll-margin-top: 5rem;
  }

  .prose-blog :global(h3) {
    font-weight: 600;
    font-size: clamp(1.1rem, 1.4vw, 1.35rem);
    color: #f1f5f9;
    margin-top: 2rem;
    margin-bottom: 0.75rem;
  }

  .prose-blog :global(p) {
    color: #cbd5e1;
    font-weight: 300;
    line-height: 1.9;
    margin-bottom: 1.5rem;
    font-size: clamp(1rem, 1.15vw, 1.2rem);
  }

  .prose-blog :global(strong) {
    color: #f1f5f9;
    font-weight: 600;
  }

  .prose-blog :global(em) {
    color: var(--indigo-accessible);
    font-style: italic;
  }

  .prose-blog :global(ul),
  .prose-blog :global(ol) {
    color: #cbd5e1;
    padding-left: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .prose-blog :global(li) {
    margin-bottom: 0.5rem;
    line-height: 1.9;
    font-size: clamp(1rem, 1.15vw, 1.2rem);
  }

  .prose-blog :global(blockquote) {
    border-left: 3px solid var(--indigo);
    padding-left: 1.5rem;
    margin: 2rem 0;
    color: #cbd5e1;
    font-style: italic;
    font-size: clamp(1.05rem, 1.2vw, 1.25rem);
    line-height: 1.8;
  }

  .prose-blog :global(.narrating) {
    background: rgba(99, 102, 241, 0.08);
    border-radius: 0.5rem;
    padding: 0.5rem;
    margin: -0.5rem;
    transition: background 0.3s ease;
  }
</style>
