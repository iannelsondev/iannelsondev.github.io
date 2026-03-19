<script lang="ts">
  import { onMount } from 'svelte';
  import AudioNarrator from '$lib/components/AudioNarrator.svelte';
  import type { BlogPost } from '$lib/blog/types';
  import type { Component } from 'svelte';

  interface Props {
    data: {
      post: BlogPost;
      PostComponent: Component;
    };
  }

  let { data }: Props = $props();

  let scrollProgress = $state(0);

  onMount(() => {
    function onScroll() {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress = docHeight > 0 ? Math.min(window.scrollY / docHeight, 1) : 0;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  });

  const formattedDate = $derived(
    new Date(data.post.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  );
</script>

<svelte:head>
  <title>{data.post.title} — Ian Nelson</title>
  <meta name="description" content={data.post.summary} />
  <link rel="canonical" href="https://iannelsondev.github.io/blog/{data.post.slug}/" />

  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://iannelsondev.github.io/blog/{data.post.slug}/" />
  <meta property="og:title" content="{data.post.title} — Ian Nelson" />
  <meta property="og:description" content={data.post.summary} />
  {#if data.post.coverImage}
    <meta property="og:image" content="https://iannelsondev.github.io{data.post.coverImage}" />
  {/if}
  <meta property="article:published_time" content={data.post.date} />
  {#each data.post.tags as tag}
    <meta property="article:tag" content={tag} />
  {/each}

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{data.post.title} — Ian Nelson" />
  <meta name="twitter:description" content={data.post.summary} />
  {#if data.post.coverImage}
    <meta name="twitter:image" content="https://iannelsondev.github.io{data.post.coverImage}" />
  {/if}

  {@html `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": data.post.title,
    "description": data.post.summary,
    "datePublished": data.post.date,
    "author": { "@type": "Person", "name": "Ian Nelson", "url": "https://iannelsondev.github.io" },
    "publisher": { "@type": "Person", "name": "Ian Nelson" },
    "mainEntityOfPage": `https://iannelsondev.github.io/blog/${data.post.slug}/`,
    ...(data.post.coverImage ? { "image": `https://iannelsondev.github.io${data.post.coverImage}` } : {})
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

<article class="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-12">
  <!-- Header -->
  <header class="mb-12">
    {#if data.post.coverImage}
      <img
        src={data.post.coverImage}
        alt=""
        class="w-full aspect-video object-cover rounded-xl mb-8 border border-[rgba(99,102,241,0.15)]"
      />
    {/if}

    <h1
      class="font-['Bebas_Neue'] tracking-wide text-[#f1f5f9] mb-4"
      style="font-size: clamp(2.5rem, 5vw, 4rem); line-height: 1.1;"
    >
      <span style="background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
        {data.post.title}
      </span>
    </h1>

    <div class="flex flex-wrap items-center gap-4 font-mono text-[#94a3b8]" style="font-size: clamp(0.7rem, 0.8vw, 0.8rem);">
      <time datetime={data.post.date}>{formattedDate}</time>
      <span aria-hidden="true">&middot;</span>
      <span>{data.post.readingTime} min read</span>
    </div>

    <div class="flex flex-wrap gap-2 mt-4">
      {#each data.post.tags as tag}
        <span
          class="px-2 py-0.5 rounded-full font-mono text-xs tracking-wider uppercase border border-[rgba(99,102,241,0.25)] text-[var(--indigo-accessible)] bg-[rgba(99,102,241,0.08)]"
        >{tag}</span>
      {/each}
    </div>
  </header>

  <!-- Table of Contents -->
  {#if data.post.sections.length > 0}
    <nav class="mb-12 p-5 rounded-xl" style="background: var(--card-bg); border: 1px solid var(--card-border);" aria-label="Table of contents">
      <h2 class="font-mono text-xs tracking-[0.3em] uppercase text-[var(--indigo-accessible)] mb-3">Contents</h2>
      <ol class="flex flex-col gap-1.5">
        {#each data.post.sections as section, i}
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
    <data.PostComponent />
  </div>

  <!-- Back to Community -->
  <div class="mt-16 pt-8 border-t border-[rgba(99,102,241,0.1)]">
    <a
      href="/#blog"
      class="inline-flex items-center gap-2 font-mono text-sm tracking-wider uppercase text-[#94a3b8] hover:text-[var(--indigo-accessible)] transition-colors duration-200"
    >
      <span aria-hidden="true">&larr;</span>
      Back to Community
    </a>
  </div>
</article>

<!-- Audio narrator -->
<AudioNarrator sections={data.post.sections} audioSrc="/blog/{data.post.slug}/narration.mp3" />

<style>
  /* Blog prose styles — scoped to post content */
  .prose-blog :global(h2) {
    font-family: 'Bebas Neue', cursive;
    font-size: clamp(1.5rem, 3vw, 2.25rem);
    color: #f1f5f9;
    margin-top: 3rem;
    margin-bottom: 1rem;
    letter-spacing: 0.02em;
    line-height: 1.2;
    scroll-margin-top: 5rem;
  }

  .prose-blog :global(h3) {
    font-weight: 600;
    font-size: clamp(1rem, 1.3vw, 1.25rem);
    color: #f1f5f9;
    margin-top: 2rem;
    margin-bottom: 0.75rem;
  }

  .prose-blog :global(p) {
    color: #94a3b8;
    font-weight: 300;
    line-height: 1.8;
    margin-bottom: 1.25rem;
    font-size: clamp(0.875rem, 1vw, 1.05rem);
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
    color: #94a3b8;
    padding-left: 1.5rem;
    margin-bottom: 1.25rem;
  }

  .prose-blog :global(li) {
    margin-bottom: 0.5rem;
    line-height: 1.8;
    font-size: clamp(0.875rem, 1vw, 1.05rem);
  }

  .prose-blog :global(blockquote) {
    border-left: 3px solid var(--indigo);
    padding-left: 1.25rem;
    margin: 1.5rem 0;
    color: #94a3b8;
    font-style: italic;
  }

  .prose-blog :global(.narrating) {
    background: rgba(99, 102, 241, 0.08);
    border-radius: 0.5rem;
    padding: 0.5rem;
    margin: -0.5rem;
    transition: background 0.3s ease;
  }
</style>
