<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import type { BlogSection } from '$lib/blog/types';

  interface Props {
    sections: BlogSection[];
    audioSrc: string;
  }

  let { sections, audioSrc }: Props = $props();

  let audioEl: HTMLAudioElement | undefined = $state();
  let playing = $state(false);
  let currentTime = $state(0);
  let duration = $state(0);
  let playbackRate = $state(1);
  let collapsed = $state(true);
  let followNarration = $state(true);
  let hasAudio = $state(false);
  let userScrolled = $state(false);

  const speeds = [0.75, 1, 1.25, 1.5, 2];

  const activeSection = $derived(() => {
    let active = sections[0];
    for (const s of sections) {
      if (currentTime >= s.startTime) active = s;
      else break;
    }
    return active;
  });

  const progress = $derived(duration > 0 ? (currentTime / duration) * 100 : 0);

  const timeDisplay = $derived(() => {
    const fmt = (t: number) => {
      const m = Math.floor(t / 60);
      const s = Math.floor(t % 60);
      return `${m}:${s.toString().padStart(2, '0')}`;
    };
    return `${fmt(currentTime)} / ${fmt(duration)}`;
  });

  function togglePlay() {
    if (!audioEl) return;
    if (playing) {
      audioEl.pause();
    } else {
      audioEl.play();
    }
  }

  function seek(e: MouseEvent) {
    if (!audioEl || !duration) return;
    const bar = e.currentTarget as HTMLElement;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioEl.currentTime = ratio * duration;
  }

  function cycleSpeed() {
    const idx = speeds.indexOf(playbackRate);
    playbackRate = speeds[(idx + 1) % speeds.length];
    if (audioEl) audioEl.playbackRate = playbackRate;
  }

  // Scroll active section into view when narrating
  $effect(() => {
    if (!browser || !followNarration || !playing || userScrolled) return;
    const section = activeSection();
    if (!section) return;
    const el = document.getElementById(section.id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add narrating highlight
      document.querySelectorAll('.narrating').forEach((n) => n.classList.remove('narrating'));
      el.classList.add('narrating');
    }
  });

  onMount(() => {
    // Check if audio file exists
    fetch(audioSrc, { method: 'HEAD' }).then((res) => {
      hasAudio = res.ok;
    }).catch(() => {
      hasAudio = false;
    });

    // Detect manual scroll to disable follow
    function onUserScroll() {
      if (playing && followNarration) {
        userScrolled = true;
      }
    }

    window.addEventListener('wheel', onUserScroll, { passive: true });
    window.addEventListener('touchmove', onUserScroll, { passive: true });

    return () => {
      window.removeEventListener('wheel', onUserScroll);
      window.removeEventListener('touchmove', onUserScroll);
      document.querySelectorAll('.narrating').forEach((n) => n.classList.remove('narrating'));
    };
  });

  function reEnableFollow() {
    userScrolled = false;
    followNarration = true;
  }
</script>

{#if hasAudio}
  <audio
    bind:this={audioEl}
    src={audioSrc}
    preload="metadata"
    onloadedmetadata={() => { if (audioEl) duration = audioEl.duration; }}
    ontimeupdate={() => { if (audioEl) currentTime = audioEl.currentTime; }}
    onplay={() => { playing = true; }}
    onpause={() => { playing = false; }}
    onended={() => { playing = false; document.querySelectorAll('.narrating').forEach((n) => n.classList.remove('narrating')); }}
  ></audio>

  <div
    class="fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out {collapsed ? 'translate-y-[calc(100%-2.5rem)]' : 'translate-y-0'}"
  >
    <!-- Collapse toggle tab -->
    <button
      class="absolute -top-0 left-1/2 -translate-x-1/2 -translate-y-full px-4 py-1 rounded-t-lg font-mono text-xs tracking-wider uppercase
        bg-[rgba(10,10,15,0.92)] border border-b-0 border-[rgba(99,102,241,0.2)] text-[#94a3b8] hover:text-[#f1f5f9] transition-colors duration-200"
      onclick={() => collapsed = !collapsed}
      aria-label="{collapsed ? 'Expand' : 'Collapse'} audio narrator"
    >
      {collapsed ? 'Narrator' : 'Collapse'}
      <span aria-hidden="true" class="ml-1">{collapsed ? '&#9650;' : '&#9660;'}</span>
    </button>

    <!-- Narrator bar -->
    <div class="bg-[rgba(10,10,15,0.95)] backdrop-blur-xl border-t border-[rgba(99,102,241,0.15)] px-4 py-3">
      <!-- Progress scrubber -->
      <button
        class="w-full h-1.5 rounded-full bg-[rgba(99,102,241,0.15)] mb-3 cursor-pointer relative overflow-hidden block border-0 p-0"
        onclick={seek}
        aria-label="Seek narration"
      >
        <div
          class="absolute inset-y-0 left-0 rounded-full"
          style="width: {progress}%; background: var(--grad);"
        ></div>
      </button>

      <div class="flex items-center gap-4 flex-wrap">
        <!-- Play/Pause -->
        <button
          class="w-9 h-9 flex items-center justify-center rounded-full border border-[rgba(99,102,241,0.3)] bg-[rgba(99,102,241,0.1)] text-[#f1f5f9] hover:bg-[rgba(99,102,241,0.2)] transition-colors duration-200"
          onclick={togglePlay}
          aria-label={playing ? 'Pause narration' : 'Play narration'}
        >
          {#if playing}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="2" y="1" width="3.5" height="12" rx="1"/><rect x="8.5" y="1" width="3.5" height="12" rx="1"/></svg>
          {:else}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><polygon points="3,1 12,7 3,13"/></svg>
          {/if}
        </button>

        <!-- Time -->
        <span class="font-mono text-xs text-[#94a3b8] min-w-24 tabular-nums">{timeDisplay()}</span>

        <!-- Section label -->
        <span class="font-mono text-xs text-[var(--indigo-accessible)] truncate flex-1">{activeSection()?.title ?? ''}</span>

        <!-- Speed -->
        <button
          class="font-mono text-xs text-[#94a3b8] hover:text-[#f1f5f9] transition-colors duration-200 px-2 py-1 rounded border border-[rgba(99,102,241,0.2)]"
          onclick={cycleSpeed}
          aria-label="Playback speed: {playbackRate}x"
        >{playbackRate}x</button>

        <!-- Follow toggle -->
        {#if userScrolled}
          <button
            class="font-mono text-xs text-[#94a3b8] hover:text-[var(--indigo-accessible)] transition-colors duration-200"
            onclick={reEnableFollow}
          >Follow</button>
        {/if}
      </div>
    </div>
  </div>
{/if}
