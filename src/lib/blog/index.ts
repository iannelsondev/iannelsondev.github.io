import type { BlogPost } from './types';
import { leaningIn } from './posts/leaning-in/meta';

export const posts: BlogPost[] = [
  leaningIn,
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export function getPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}
