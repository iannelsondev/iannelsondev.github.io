import { error } from '@sveltejs/kit';
import { getPost, posts } from '$lib/blog';
import type { BlogPost } from '$lib/blog/types';

export async function load({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) throw error(404, `Post not found: ${params.slug}`);

  // Return only serializable fields
  const { component, ...meta } = post;

  return { post: meta };
}

export function entries() {
  return posts.map((p: BlogPost) => ({ slug: p.slug }));
}
