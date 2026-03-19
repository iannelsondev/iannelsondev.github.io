import { error } from '@sveltejs/kit';
import { getPost, posts } from '$lib/blog';
import type { BlogPost } from '$lib/blog/types';
import type { Component } from 'svelte';

export async function load({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) throw error(404, `Post not found: ${params.slug}`);

  // Await the dynamic import so the component is available for SSR
  const mod = await post.component();

  // Strip the non-serializable fields from post
  const { component, ...meta } = post;

  return {
    post: meta,
    // Pass component via a non-serializable property using the `state` pattern
    PostComponent: mod.default as Component,
  };
}

export function entries() {
  return posts.map((p: BlogPost) => ({ slug: p.slug }));
}
