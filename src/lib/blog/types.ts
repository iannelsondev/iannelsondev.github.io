import type { Component } from 'svelte';

export interface BlogSection {
  id: string;
  title: string;
  startTime: number; // seconds into narration audio
}

export interface BlogPost {
  slug: string;
  title: string;
  date: string; // ISO date
  summary: string;
  coverImage?: string; // path relative to /blog/[slug]/
  tags: string[];
  readingTime: number; // minutes
  sections: BlogSection[];
  component: () => Promise<{ default: Component }>;
}
