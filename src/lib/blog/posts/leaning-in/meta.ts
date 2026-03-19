import type { BlogPost } from '../../types';

export const leaningIn: BlogPost = {
  slug: 'leaning-in',
  title: 'Leaning In',
  date: '2026-03-19',
  summary:
    'How a catastrophic vision loss became the catalyst for building autonomous AI systems — and why the future of accessibility is local-first intelligence.',
  // coverImage: '/blog/leaning-in/cover.webp', // TODO: add cover image
  tags: ['AI', 'Accessibility', 'Autonomous Systems', 'Personal'],
  readingTime: 12,
  sections: [
    { id: 'the-io-problem', title: 'The I/O Problem', startTime: 0 },
    { id: 'the-overhaul', title: 'The Overhaul', startTime: 90 },
    { id: 'leaning-in', title: 'Leaning In', startTime: 180 },
    { id: 'building-the-stack', title: 'Building the Stack', startTime: 270 },
    { id: 'the-snowball', title: 'The Snowball', startTime: 390 },
    { id: 'the-takeaway', title: 'The Takeaway', startTime: 480 },
  ],
  component: () => import('./Post.svelte'),
};
