<script lang="ts">
  import { onMount } from 'svelte';

  let canvasEl = $state<HTMLCanvasElement | null>(null);
  let glassEl = $state<HTMLDivElement | null>(null);

  onMount(() => {
    if (!canvasEl || !glassEl) return;

    let stopped = false;
    let cleanupFn: (() => void) | null = null;

    // Wait for the container to have dimensions (fullPage.js needs a tick)
    function waitForSize(cb: () => void) {
      const check = () => {
        if (stopped) return;
        const w = glassEl!.offsetWidth;
        const h = glassEl!.offsetHeight;
        if (w > 0 && h > 0) { cb(); return; }
        requestAnimationFrame(check);
      };
      requestAnimationFrame(check);
    }

    waitForSize(() => {
      import('three').then((THREE) => {
        if (stopped || !canvasEl || !glassEl) return;

        try {
          const dpr = Math.min(window.devicePixelRatio, 2);
          const w = glassEl.offsetWidth;
          const h = glassEl.offsetHeight;

          canvasEl.width = w * dpr;
          canvasEl.height = h * dpr;
          canvasEl.style.width = w + 'px';
          canvasEl.style.height = h + 'px';

          const renderer = new THREE.WebGLRenderer({
            canvas: canvasEl,
            alpha: true,
            antialias: false,
          });
          renderer.setPixelRatio(dpr);
          renderer.setSize(w, h, false);

          const scene = new THREE.Scene();
          const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
          camera.position.z = 8;

          // --- Glow texture via canvas gradient ---
          function createGlowTexture(): THREE.CanvasTexture {
            const size = 128;
            const c = document.createElement('canvas');
            c.width = size;
            c.height = size;
            const ctx = c.getContext('2d')!;
            const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
            gradient.addColorStop(0,   'rgba(255,255,255,1)');
            gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
            gradient.addColorStop(0.5, 'rgba(99,102,241,0.4)');
            gradient.addColorStop(1,   'rgba(99,102,241,0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, size, size);
            return new THREE.CanvasTexture(c);
          }

          const glowTexture = createGlowTexture();

          const INDIGO = 0x6366f1;
          const CYAN   = 0x06b6d4;
          const WHITE  = 0xffffff;
          // Weighted toward indigo/cyan — white used for small accent nodes
          const COLORS = [INDIGO, INDIGO, INDIGO, CYAN, CYAN, WHITE];

          // --- Edges ---
          const MAX_EDGES = 400;
          const edgeArr = new Float32Array(MAX_EDGES * 6);
          const edgeGeo = new THREE.BufferGeometry();
          edgeGeo.setAttribute('position', new THREE.BufferAttribute(edgeArr, 3));
          edgeGeo.setDrawRange(0, 0);
          const edgeMat = new THREE.LineBasicMaterial({
            color: INDIGO,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          });
          scene.add(new THREE.LineSegments(edgeGeo, edgeMat));

          const nodeGroup = new THREE.Group();
          scene.add(nodeGroup);

          interface Node {
            sprite: THREE.Sprite;
            mat: THREE.SpriteMaterial;
            vx: number; vy: number; vz: number;
            born: number;
            lifetime: number;
            baseScale: number;
            color: number;
          }

          const nodes: Node[] = [];
          const COUNT  = 45;
          const EDGE_DIST = 3.5;
          const SPREAD = 6;

          function spawn(scatter = false): Node {
            const colorIndex = Math.floor(Math.random() * COLORS.length);
            const color = COLORS[colorIndex];
            // White nodes are small accent dots; colored nodes are larger
            const baseScale = color === WHITE
              ? 0.3 + Math.random() * 0.25
              : 0.55 + Math.random() * 0.95;

            const mat = new THREE.SpriteMaterial({
              map: glowTexture,
              color,
              transparent: true,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
            });
            const sprite = new THREE.Sprite(mat);
            sprite.scale.set(baseScale, baseScale, 1);

            let x: number, y: number, z: number;
            if (scatter) {
              x = (Math.random() - 0.5) * SPREAD * 2;
              y = (Math.random() - 0.5) * SPREAD * 1.5;
              z = (Math.random() - 0.5) * 5;
            } else {
              const side = Math.floor(Math.random() * 4);
              z = (Math.random() - 0.5) * 5;
              if (side === 0)      { x = -SPREAD - 2; y = (Math.random() - 0.5) * SPREAD * 2; }
              else if (side === 1) { x =  SPREAD + 2; y = (Math.random() - 0.5) * SPREAD * 2; }
              else if (side === 2) { y = -SPREAD;     x = (Math.random() - 0.5) * SPREAD * 2; }
              else                 { y =  SPREAD;     x = (Math.random() - 0.5) * SPREAD * 2; }
            }
            sprite.position.set(x, y, z);
            nodeGroup.add(sprite);

            const speed = 0.006 + Math.random() * 0.01;
            const angle = Math.atan2(-y, -x) + (Math.random() - 0.5) * 1;

            return {
              sprite,
              mat,
              vx: scatter ? (Math.random() - 0.5) * 0.012 : Math.cos(angle) * speed,
              vy: scatter ? (Math.random() - 0.5) * 0.012 : Math.sin(angle) * speed,
              vz: (Math.random() - 0.5) * 0.004,
              born: performance.now() - (scatter ? Math.random() * 15000 : 0),
              lifetime: 10000 + Math.random() * 12000,
              baseScale,
              color,
            };
          }

          // Seed initial nodes
          for (let i = 0; i < COUNT; i++) nodes.push(spawn(true));

          let targetCX = 0, targetCY = 0;
          let lastSpawn = performance.now();

          function onMouse(e: MouseEvent) {
            const rect = glassEl!.getBoundingClientRect();
            targetCX = ((e.clientX - rect.left) / rect.width  - 0.5) * 1.5;
            targetCY = -((e.clientY - rect.top)  / rect.height - 0.5) * 1.5;
          }
          window.addEventListener('mousemove', onMouse);

          function onResize() {
            if (!glassEl || !canvasEl) return;
            const nw = glassEl.offsetWidth;
            const nh = glassEl.offsetHeight;
            if (nw === 0 || nh === 0) return;
            const d = Math.min(window.devicePixelRatio, 2);
            canvasEl.width  = nw * d;
            canvasEl.height = nh * d;
            canvasEl.style.width  = nw + 'px';
            canvasEl.style.height = nh + 'px';
            camera.aspect = nw / nh;
            camera.updateProjectionMatrix();
            renderer.setSize(nw, nh, false);
          }
          window.addEventListener('resize', onResize);

          let edgeFrame = 0;

          renderer.setAnimationLoop(() => {
            const now = performance.now();

            // Spawn replacement nodes
            if (nodes.length < COUNT && now - lastSpawn > 350) {
              nodes.push(spawn(false));
              lastSpawn = now;
            }

            // Update nodes
            for (let i = nodes.length - 1; i >= 0; i--) {
              const n = nodes[i];
              const t = (now - n.born) / n.lifetime;
              // Fade in over first 5%, fade out over last 15%
              const fadeIn  = t < 0.05 ? t / 0.05 : 1;
              const fadeOut = t > 0.85 ? 1 - (t - 0.85) / 0.15 : 1;
              const alpha = fadeIn * fadeOut;

              n.mat.opacity = alpha;
              const sc = n.baseScale * (t > 0.85 ? fadeOut : 1);
              n.sprite.scale.set(sc, sc, 1);

              if (t >= 1) {
                nodeGroup.remove(n.sprite);
                n.mat.dispose();
                nodes.splice(i, 1);
                continue;
              }

              const p = n.sprite.position;

              // Gentle centre-pull
              n.vx -= p.x * 0.0004;
              n.vy -= p.y * 0.0004;
              n.vz -= p.z * 0.0002;

              // Neighbour repulsion
              for (let j = 0; j < nodes.length; j++) {
                if (i === j) continue;
                const o = nodes[j].sprite.position;
                const dx = p.x - o.x, dy = p.y - o.y, dz = p.z - o.z;
                const d2 = dx * dx + dy * dy + dz * dz;
                if (d2 < 3 && d2 > 0.01) {
                  const d = Math.sqrt(d2);
                  const f = 0.0015 / d2;
                  n.vx += (dx / d) * f;
                  n.vy += (dy / d) * f;
                  n.vz += (dz / d) * f;
                }
              }

              n.vx *= 0.985; n.vy *= 0.985; n.vz *= 0.985;
              p.x += n.vx; p.y += n.vy; p.z += n.vz;
            }

            // Rebuild edges every 3 frames
            if (++edgeFrame >= 3) {
              edgeFrame = 0;
              let ec = 0;
              const pos = edgeGeo.attributes.position as THREE.BufferAttribute;
              const a = pos.array as Float32Array;
              for (let i = 0; i < nodes.length && ec < MAX_EDGES; i++) {
                const pa = nodes[i].sprite.position;
                for (let j = i + 1; j < nodes.length && ec < MAX_EDGES; j++) {
                  const pb = nodes[j].sprite.position;
                  const dx = pa.x - pb.x, dy = pa.y - pb.y, dz = pa.z - pb.z;
                  if (Math.sqrt(dx * dx + dy * dy + dz * dz) < EDGE_DIST) {
                    const b = ec * 6;
                    a[b]   = pa.x; a[b+1] = pa.y; a[b+2] = pa.z;
                    a[b+3] = pb.x; a[b+4] = pb.y; a[b+5] = pb.z;
                    ec++;
                  }
                }
              }
              pos.needsUpdate = true;
              edgeGeo.setDrawRange(0, ec * 2);
            }

            // Slow auto-rotation + mouse parallax
            nodeGroup.rotation.y += 0.0008;
            camera.position.x += (targetCX - camera.position.x) * 0.025;
            camera.position.y += (targetCY - camera.position.y) * 0.025;
            renderer.render(scene, camera);
          });

          cleanupFn = () => {
            renderer.setAnimationLoop(null);
            window.removeEventListener('mousemove', onMouse);
            window.removeEventListener('resize', onResize);
            for (const n of nodes) {
              nodeGroup.remove(n.sprite);
              n.mat.dispose();
            }
            glowTexture.dispose();
            edgeGeo.dispose();
            edgeMat.dispose();
            renderer.dispose();
          };

        } catch (e) {
          console.warn('WebGL not available, skipping Three.js hero graph', e);
          // Glass panel dark background still shows — no further action needed
        }
      });
    });

    return () => { stopped = true; cleanupFn?.(); };
  });
</script>

<section id="home" class="relative h-full w-full overflow-hidden" aria-label="Introduction">
  <div class="relative z-10 flex items-center justify-center h-full px-4 sm:px-6 md:px-8">
    <div bind:this={glassEl} class="hero-glass relative w-full max-w-4xl rounded-2xl overflow-hidden">

      <!-- Dark opaque background layer — blocks hex grid -->
      <div class="absolute inset-0 rounded-2xl" style="background: rgba(8, 8, 14, 0.9); z-index: 0;"></div>

      <!-- Three.js canvas — renders glowing nodes on transparent background above the dark layer -->
      <canvas bind:this={canvasEl} class="absolute inset-0 w-full h-full" style="z-index: 1;" aria-hidden="true"></canvas>

      <!-- Text content on top of everything -->
      <div class="hero-content relative flex flex-col items-center justify-center text-center px-6 sm:px-10 md:px-16 py-14 md:py-20" style="z-index: 2;">

        <h1 class="hero-name leading-[0.9] mb-5">
          <span class="hero-first">IAN</span> <span class="hero-last">NELSON</span>
        </h1>

        <p class="font-mono uppercase tracking-[0.3em] text-[#94a3b8] mb-5" style="font-size: clamp(0.55rem, 0.75vw, 0.8rem);">
          Autonomous Systems · Edge AI · Intelligence
        </p>

        <p class="text-[#94a3b8] max-w-lg mx-auto mb-8 font-light leading-[1.8]" style="font-size: clamp(0.85rem, 0.95vw, 1rem);">
          Building multi-agent swarms, on-prem AI matching frontier models, knowledge graph pipelines, and edge inference systems.
        </p>

        <div class="flex flex-wrap gap-3 justify-center">
          <a href="https://linkedin.com/in/iannelsondev" target="_blank" rel="noopener noreferrer" class="hero-btn">LinkedIn</a>
          <a href="https://github.com/iannelsondev" target="_blank" rel="noopener noreferrer" class="hero-btn">GitHub</a>
          <a href="mailto:iannelsondev@proton.me" class="hero-btn">iannelsondev@proton.me</a>
        </div>
      </div>
    </div>
  </div>

  <div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-bounce" aria-hidden="true" style="opacity: 0.35;">
    <span class="font-mono text-[0.5rem] tracking-[0.2em] uppercase text-[#94a3b8]">SCROLL</span>
    <div class="w-px h-6" style="background: linear-gradient(to bottom, #6366f1, transparent);"></div>
  </div>
</section>

<style>
  .hero-glass {
    background: transparent;
    border: 1px solid rgba(99, 102, 241, 0.15);
    box-shadow:
      0 0 80px rgba(99, 102, 241, 0.06),
      0 30px 80px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }

  .hero-name {
    font-family: 'Bebas Neue', sans-serif;
    font-weight: 400;
    font-size: clamp(4rem, 9vw, 8rem);
    letter-spacing: 0.04em;
  }

  .hero-first {
    color: #f1f5f9;
  }

  .hero-last {
    background: linear-gradient(135deg, #6366f1, #06b6d4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-btn {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #f1f5f9;
    padding: 0.6rem 1.4rem;
    border-radius: 0.5rem;
    border: 1px solid transparent;
    background:
      linear-gradient(rgba(10, 10, 16, 0.8), rgba(10, 10, 16, 0.8)) padding-box,
      linear-gradient(135deg, #6366f1, #06b6d4) border-box;
    transition: transform 0.2s, background 0.2s;
  }

  .hero-btn:hover {
    background: linear-gradient(135deg, #6366f1, #06b6d4);
    transform: translateY(-2px);
  }
</style>
