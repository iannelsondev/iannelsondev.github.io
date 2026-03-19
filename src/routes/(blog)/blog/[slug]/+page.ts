import { error } from '@sveltejs/kit';
import { getPost, posts } from '$lib/blog';
import type { BlogPost } from '$lib/blog/types';

export async function load({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) throw error(404, `Post not found: ${params.slug}`);

  // Only return the slug — everything else resolved in +page.svelte
  return { slug: params.slug };
}

export function entries() {
  return posts.map((p: BlogPost) => ({ slug: p.slug }));
}
