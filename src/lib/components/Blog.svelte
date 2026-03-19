<script lang="ts">
  import ScrollReveal from './ScrollReveal.svelte';
  import { posts } from '$lib/blog';

  interface Props {
    headingId?: string;
  }

  let { headingId = 'heading-blog' }: Props = $props();

  const recentPosts = $derived(posts.slice(0, 6));
</script>

<div class="flex items-center justify-center h-full px-4 sm:px-6 md:px-8">
  <div class="max-w-6xl mx-auto w-full">
    <div
      class="font-mono tracking-[0.3em] uppercase mb-2"
      style="font-size: clamp(0.6rem, 0.7vw, 0.75rem); color: var(--indigo-accessible);"
      aria-hidden="true"
    >06 // Community</div>
    <h2
      id={headingId}
      class="font-semibold tracking-tight text-[#f1f5f9] mb-6"
      style="font-size: clamp(1.5rem, 2.5vw, 2.25rem);"
    >
      <span style="background: linear-gradient(135deg, #6366f1, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Community</span>
    </h2>

    {#if recentPosts.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each recentPosts as post, i}
          <ScrollReveal delay={i * 80}>
            <a
              href="/blog/{post.slug}/"
              class="block rounded-xl transition-[border-color,box-shadow,transform] duration-200
                hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(99,102,241,0.1)] h-full group"
              style="background: var(--card-bg); border: 1px solid var(--card-border);"
              onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-hover)'; }}
              onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-border)'; }}
            >
              {#if post.coverImage}
                <div class="relative overflow-hidden rounded-t-xl">
                  <img
                    src={post.coverImage}
                    alt=""
                    class="w-full aspect-video object-cover"
                    loading="lazy"
                  />
                  <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(ellipse at 40% 50%, rgba(99,102,241,0.08) 0%, transparent 70%);"></div>
                </div>
              {:else}
                <div class="w-full aspect-video rounded-t-xl" style="background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.1));"></div>
              {/if}

              <div class="p-5 flex flex-col gap-2">
                <time
                  datetime={post.date}
                  class="font-mono text-[#94a3b8] tracking-wider uppercase"
                  style="font-size: clamp(0.55rem, 0.65vw, 0.7rem);"
                >
                  {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </time>

                <h3
                  class="font-semibold group-hover:text-[#f1f5f9] transition-colors duration-200"
                  style="font-size: clamp(0.875rem, 1.1vw, 1.05rem); background: linear-gradient(135deg, #6366f1, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;"
                >{post.title}</h3>

                <p class="font-light text-[#94a3b8] leading-[1.8] line-clamp-3" style="font-size: clamp(0.8rem, 0.9vw, 0.95rem);">{post.summary}</p>

                <div class="flex flex-wrap gap-1.5 mt-1">
                  {#each post.tags.slice(0, 3) as tag}
                    <span
                      class="px-2 py-0.5 rounded-full font-mono tracking-wider uppercase border border-[rgba(99,102,241,0.2)] text-[var(--indigo-accessible)] bg-[rgba(99,102,241,0.06)]"
                      style="font-size: clamp(0.5rem, 0.55vw, 0.6rem);"
                    >{tag}</span>
                  {/each}
                </div>
              </div>
            </a>
          </ScrollReveal>
        {/each}
      </div>
    {:else}
      <ScrollReveal>
        <div
          class="p-5 md:p-6 rounded-xl"
          style="background: var(--card-bg); border: 1px solid var(--card-border);"
        >
          <p class="font-light text-[#94a3b8] leading-[1.8]" style="font-size: clamp(0.875rem, 1vw, 1.05rem);">Coming soon.</p>
        </div>
      </ScrollReveal>
    {/if}
  </div>
</div>
