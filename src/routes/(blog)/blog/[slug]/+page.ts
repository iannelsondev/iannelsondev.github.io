import { error } from '@sveltejs/kit';
import { getPost, posts } from '$lib/blog';
import type { BlogPost } from '$lib/blog/types';
import type { Component } from 'svelte';

export async function load({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) throw error(404, `Post not found: ${params.slug}`);

  const mod = await post.component();

  return {
    post,
    PostComponent: mod.default as Component,
  };
}

export function entries() {
  return posts.map((p: BlogPost) => ({ slug: p.slug }));
}
