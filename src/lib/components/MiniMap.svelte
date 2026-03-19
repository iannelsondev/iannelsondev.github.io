<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    lat: number;
    lon: number;
    label: string;
  }

  let { lat, lon, label }: Props = $props();
  let mapEl: HTMLDivElement;

  onMount(async () => {
    const L = await import('leaflet');

    // Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    await new Promise(r => setTimeout(r, 100)); // let CSS load

    const map = L.map(mapEl, {
      center: [lat, lon],
      zoom: 11,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      keyboard: false
    });

    // Dark tiles from CartoDB
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Custom indigo pin marker
    const pinIcon = L.divIcon({
      className: '',
      html: `<svg width="28" height="40" viewBox="0 0 28 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.3 21.7 0 14 0z" fill="#6366f1" fill-opacity="0.9"/>
        <circle cx="14" cy="14" r="5" fill="#0a0a0f"/>
        <circle cx="14" cy="14" r="3" fill="#06b6d4" fill-opacity="0.8"/>
      </svg>`,
      iconSize: [28, 40],
      iconAnchor: [14, 40]
    });

    L.marker([lat, lon], { icon: pinIcon }).addTo(map);

    // Invalidate size after fullPage.js slide transition
    const observer = new MutationObserver(() => {
      map.invalidateSize();
    });
    observer.observe(mapEl.closest('.slide') || mapEl, { attributes: true, attributeFilter: ['class', 'style'] });

    // Also invalidate on window resize
    const resizeHandler = () => map.invalidateSize();
    window.addEventListener('resize', resizeHandler);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', resizeHandler);
      map.remove();
    };
  });
</script>

<!--
  WCAG 1.1.1 — The Leaflet map is an interactive widget but in this context
  it is used as a decorative location indicator (no user interaction enabled).
  role="img" with aria-label communicates the purpose to screen readers.
  The visible location name in the parent overlay provides the same info in text.
-->
<div
  bind:this={mapEl}
  class="w-full h-full min-h-[200px]"
  role="img"
  aria-label="Map showing location: {label}"
></div>
