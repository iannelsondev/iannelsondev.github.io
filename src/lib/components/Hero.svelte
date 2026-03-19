<script lang="ts">
  import { onMount } from 'svelte';

  let canvasEl = $state<HTMLCanvasElement | null>(null);
  let glassEl = $state<HTMLDivElement | null>(null);
  let webglReady = $state(false);

  onMount(() => {
    if (!canvasEl || !glassEl) return;

    // WCAG 2.3.3 / SC 2.3.1 — Respect prefers-reduced-motion.
    // Users who prefer reduced motion get a static canvas with no animation.
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      // Skip the Three.js animation loop entirely; leave canvas blank (transparent).
      return;
    }

    let stopped = false;
    let cleanupFn: (() => void) | null = null;

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
            antialias: true,
          });
          renderer.setPixelRatio(dpr);
          renderer.setSize(w, h, false);

          const scene = new THREE.Scene();
          const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
          camera.position.z = 16;

          // Community palette (from VIPR)
          const COMMUNITY_PALETTE = [
            0x60a5fa, 0xf472b6, 0x34d399, 0xfbbf24, 0xa78bfa, 0xfb923c,
            0x22d3ee, 0xe879f9,
          ];
          const NUM_COMMUNITIES = 8;

          // --- Community hulls (VIPR-style bounding cubes) ---
          interface CommunityZone {
            id: number;
            color: number;
            center: THREE.Vector3;
            fillMesh: THREE.Mesh;
            wireMesh: THREE.LineSegments;
          }

          const communityGroup = new THREE.Group();
          scene.add(communityGroup);

          const zones: CommunityZone[] = [];
          // Spread across the full panel
          const zonePositions = [
            new THREE.Vector3(-6, 3, -1),
            new THREE.Vector3(0, 4, 0.5),
            new THREE.Vector3(6, 3, -0.5),
            new THREE.Vector3(-5, -1, 0),
            new THREE.Vector3(5, -0.5, -1),
            new THREE.Vector3(-6, -4.5, 0.5),
            new THREE.Vector3(0.5, -4, -0.5),
            new THREE.Vector3(6, -4, 0),
          ];

          for (let c = 0; c < NUM_COMMUNITIES; c++) {
            const color = COMMUNITY_PALETTE[c];
            const size = 3 + Math.random() * 2;
            const geo = new THREE.BoxGeometry(size, size, size);

            // Transparent fill
            const fillMat = new THREE.MeshBasicMaterial({
              color,
              transparent: true,
              opacity: 0.035,
              depthWrite: false,
              side: THREE.DoubleSide,
            });
            const fillMesh = new THREE.Mesh(geo, fillMat);
            fillMesh.position.copy(zonePositions[c]);
            communityGroup.add(fillMesh);

            // Wireframe edges — more visible
            const edgesGeo = new THREE.EdgesGeometry(geo);
            const wireMat = new THREE.LineBasicMaterial({
              color,
              transparent: true,
              opacity: 0.3,
            });
            const wireMesh = new THREE.LineSegments(edgesGeo, wireMat);
            wireMesh.position.copy(zonePositions[c]);
            communityGroup.add(wireMesh);

            zones.push({ id: c, color, center: zonePositions[c], fillMesh, wireMesh });
          }

          // --- Nodes (spheres inside communities) ---
          const nodeGroup = new THREE.Group();
          scene.add(nodeGroup);

          interface Node {
            mesh: THREE.Mesh;
            glowMesh: THREE.Mesh;
            mat: THREE.MeshBasicMaterial;
            glowMat: THREE.MeshBasicMaterial;
            community: number;
            vx: number; vy: number; vz: number;
            born: number;
            lifetime: number;
            baseRadius: number;
          }

          const nodes: Node[] = [];
          const COUNT = 90;
          const EDGE_DIST = 5;

          const sphereGeo = new THREE.SphereGeometry(1, 12, 12);

          function spawn(scatter = false): Node {
            const community = Math.floor(Math.random() * NUM_COMMUNITIES);
            const zone = zones[community];
            const color = zone.color;
            const baseRadius = 0.08 + Math.random() * 0.14;

            const mat = new THREE.MeshBasicMaterial({
              color,
              transparent: true,
              opacity: 0,
            });
            const mesh = new THREE.Mesh(sphereGeo, mat);
            mesh.scale.set(baseRadius, baseRadius, baseRadius);

            const glowMat = new THREE.MeshBasicMaterial({
              color,
              transparent: true,
              opacity: 0,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
            });
            const glowMesh = new THREE.Mesh(sphereGeo, glowMat);
            glowMesh.scale.set(baseRadius * 2, baseRadius * 2, baseRadius * 2);

            // Position near community center with wider spread
            const spread = 1.8;
            const x = zone.center.x + (Math.random() - 0.5) * spread * 2;
            const y = zone.center.y + (Math.random() - 0.5) * spread * 2;
            const z = zone.center.z + (Math.random() - 0.5) * spread * 2;
            mesh.position.set(x, y, z);
            glowMesh.position.set(x, y, z);

            nodeGroup.add(mesh);
            nodeGroup.add(glowMesh);

            return {
              mesh, glowMesh, mat, glowMat, community,
              vx: (Math.random() - 0.5) * 0.008,
              vy: (Math.random() - 0.5) * 0.008,
              vz: (Math.random() - 0.5) * 0.004,
              born: performance.now() - (scatter ? Math.random() * 15000 : 0),
              lifetime: 12000 + Math.random() * 14000,
              baseRadius,
            };
          }

          for (let i = 0; i < COUNT; i++) nodes.push(spawn(true));

          // --- Solid intra-community edges ---
          const MAX_SOLID = 600;
          const solidArr = new Float32Array(MAX_SOLID * 6);
          const solidGeo = new THREE.BufferGeometry();
          solidGeo.setAttribute('position', new THREE.BufferAttribute(solidArr, 3));
          solidGeo.setDrawRange(0, 0);
          const solidMat = new THREE.LineBasicMaterial({
            color: 0x6366f1,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          });
          scene.add(new THREE.LineSegments(solidGeo, solidMat));

          // --- Dashed cross-community edges ---
          const MAX_DASHED = 400;
          const dashedArr = new Float32Array(MAX_DASHED * 6);
          const dashedGeo = new THREE.BufferGeometry();
          dashedGeo.setAttribute('position', new THREE.BufferAttribute(dashedArr, 3));
          dashedGeo.setDrawRange(0, 0);
          const dashedMat = new THREE.LineDashedMaterial({
            color: 0x94a3b8,
            transparent: true,
            opacity: 0.18,
            dashSize: 0.15,
            gapSize: 0.1,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          });
          const dashedLines = new THREE.LineSegments(dashedGeo, dashedMat);
          scene.add(dashedLines);

          let targetCX = 0, targetCY = 0;
          let lastSpawn = performance.now();

          function onMouse(e: MouseEvent) {
            const rect = glassEl!.getBoundingClientRect();
            targetCX = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
            targetCY = -((e.clientY - rect.top)  / rect.height - 0.5) * 2;
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
            if (nodes.length < COUNT && now - lastSpawn > 250) {
              nodes.push(spawn(false));
              lastSpawn = now;
            }

            // Update nodes
            for (let i = nodes.length - 1; i >= 0; i--) {
              const n = nodes[i];
              const t = (now - n.born) / n.lifetime;
              const fadeIn  = t < 0.05 ? t / 0.05 : 1;
              const fadeOut = t > 0.85 ? 1 - (t - 0.85) / 0.15 : 1;
              const alpha = fadeIn * fadeOut;

              n.mat.opacity = alpha;
              n.glowMat.opacity = alpha * 0.35;
              const sc = n.baseRadius * (t > 0.85 ? fadeOut : 1);
              n.mesh.scale.set(sc, sc, sc);
              n.glowMesh.scale.set(sc * 2, sc * 2, sc * 2);

              if (t >= 1) {
                nodeGroup.remove(n.mesh);
                nodeGroup.remove(n.glowMesh);
                n.mat.dispose();
                n.glowMat.dispose();
                nodes.splice(i, 1);
                continue;
              }

              const p = n.mesh.position;
              const zone = zones[n.community];

              // Pull toward community center
              n.vx -= (p.x - zone.center.x) * 0.0005;
              n.vy -= (p.y - zone.center.y) * 0.0005;
              n.vz -= (p.z - zone.center.z) * 0.0003;

              // Neighbour repulsion
              for (let j = 0; j < nodes.length; j++) {
                if (i === j) continue;
                const o = nodes[j].mesh.position;
                const dx = p.x - o.x, dy = p.y - o.y, dz = p.z - o.z;
                const d2 = dx * dx + dy * dy + dz * dz;
                if (d2 < 2 && d2 > 0.01) {
                  const d = Math.sqrt(d2);
                  const f = 0.001 / d2;
                  n.vx += (dx / d) * f;
                  n.vy += (dy / d) * f;
                  n.vz += (dz / d) * f;
                }
              }

              n.vx *= 0.985; n.vy *= 0.985; n.vz *= 0.985;
              p.x += n.vx; p.y += n.vy; p.z += n.vz;
              n.glowMesh.position.copy(p);
            }

            // Rebuild edges every 3 frames
            if (++edgeFrame >= 3) {
              edgeFrame = 0;

              let sc = 0; // solid count
              let dc = 0; // dashed count
              const sa = (solidGeo.attributes.position as THREE.BufferAttribute).array as Float32Array;
              const da = (dashedGeo.attributes.position as THREE.BufferAttribute).array as Float32Array;

              for (let i = 0; i < nodes.length; i++) {
                const pa = nodes[i].mesh.position;
                for (let j = i + 1; j < nodes.length; j++) {
                  const pb = nodes[j].mesh.position;
                  const dx = pa.x - pb.x, dy = pa.y - pb.y, dz = pa.z - pb.z;
                  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                  if (dist > EDGE_DIST) continue;

                  const sameCommunity = nodes[i].community === nodes[j].community;

                  if (sameCommunity && sc < MAX_SOLID) {
                    const b = sc * 6;
                    sa[b]   = pa.x; sa[b+1] = pa.y; sa[b+2] = pa.z;
                    sa[b+3] = pb.x; sa[b+4] = pb.y; sa[b+5] = pb.z;
                    sc++;
                  } else if (!sameCommunity && dc < MAX_DASHED) {
                    const b = dc * 6;
                    da[b]   = pa.x; da[b+1] = pa.y; da[b+2] = pa.z;
                    da[b+3] = pb.x; da[b+4] = pb.y; da[b+5] = pb.z;
                    dc++;
                  }
                }
              }

              (solidGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
              solidGeo.setDrawRange(0, sc * 2);

              (dashedGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
              dashedGeo.setDrawRange(0, dc * 2);
              dashedLines.computeLineDistances();
            }

            // Gentle rotation + mouse parallax
            communityGroup.rotation.y += 0.0005;
            nodeGroup.rotation.y = communityGroup.rotation.y;
            camera.position.x += (targetCX - camera.position.x) * 0.025;
            camera.position.y += (targetCY - camera.position.y) * 0.025;
            renderer.render(scene, camera);
          });

          webglReady = true;

          cleanupFn = () => {
            renderer.setAnimationLoop(null);
            window.removeEventListener('mousemove', onMouse);
            window.removeEventListener('resize', onResize);
            for (const n of nodes) {
              nodeGroup.remove(n.mesh);
              nodeGroup.remove(n.glowMesh);
              n.mat.dispose();
              n.glowMat.dispose();
            }
            for (const z of zones) {
              communityGroup.remove(z.fillMesh);
              communityGroup.remove(z.wireMesh);
              z.fillMesh.geometry.dispose();
              (z.fillMesh.material as THREE.Material).dispose();
              z.wireMesh.geometry.dispose();
              (z.wireMesh.material as THREE.Material).dispose();
            }
            sphereGeo.dispose();
            solidGeo.dispose();
            solidMat.dispose();
            dashedGeo.dispose();
            dashedMat.dispose();
            renderer.dispose();
          };

        } catch (e) {
          console.warn('WebGL not available, skipping Three.js hero graph', e);
        }
      });
    });

    return () => { stopped = true; cleanupFn?.(); };
  });
</script>

<!--
  WCAG 1.3.1 — This is the top-level section of the page. The <section> in
  +page.svelte carries aria-label="Home — Introduction".
  The <h1> here is the only <h1> on the page; all other sections use <h2>.
-->
<section class="relative h-full w-full overflow-hidden" aria-label="Introduction">
  <div class="relative z-10 flex items-center justify-center h-full px-4 sm:px-6 md:px-8">
    <div bind:this={glassEl} class="hero-glass relative w-full max-w-4xl rounded-2xl overflow-hidden">

      <!-- Dark opaque background layer -->
      <div class="absolute inset-0 rounded-2xl" style="background: rgba(8, 8, 14, 0.92); z-index: 0;"></div>

      <!--
        WCAG 1.1.1 — The canvas is purely decorative (animated network graph).
        aria-hidden="true" ensures screen readers skip it entirely.
      -->
      <canvas bind:this={canvasEl} class="absolute inset-0 w-full h-full" style="z-index: 1;" aria-hidden="true"></canvas>

      <!-- Text content — in flow so the glass panel gets intrinsic height -->
      <div class="relative flex items-center justify-center" style="z-index: 2;">
        <div class="{webglReady ? 'hero-text-glass' : ''} rounded-xl px-8 sm:px-12 md:px-16 py-14 md:py-20 max-w-2xl w-full mx-4">
          <div class="flex flex-col items-center text-center">
            <!--
              WCAG 1.4.3 — Gradient text on h1: the gradient spans #6366f1
              to #06b6d4 on a very dark background. The -webkit-text-fill-color
              approach means the text colour for AT and fallback rendering is
              the background fill of the element. We rely on the gradient being
              light enough; the lighter end (#06b6d4) is 5.8:1 on #0a0a0f.
              The -webkit-text-fill-color transparent is presentation-only;
              the plain color fallback on hero-last is set via color property
              in the style block below for non-webkit engines.
            -->
            <h1 class="hero-name leading-[0.9] mb-5">
              <span class="hero-first">IAN</span> <span class="hero-last">NELSON</span>
            </h1>

            <p class="font-mono uppercase tracking-[0.3em] text-[#94a3b8] mb-5" style="font-size: clamp(0.55rem, 0.75vw, 0.8rem);">
              Autonomous Systems · Edge AI · Intelligence
            </p>

            <p class="text-[#94a3b8] max-w-lg mx-auto mb-8 font-light leading-[1.8]" style="font-size: clamp(0.85rem, 0.95vw, 1rem);">
              Building multi-agent swarms, on-prem AI matching frontier models, knowledge graph pipelines, and edge inference systems.
            </p>

            <!--
              WCAG 2.4.4 — Each link has a clear, descriptive label.
              External links include "(opens in new tab)" for screen reader users.
              WCAG 2.4.7 — Focus styles for .hero-btn defined in <style> below.
            -->
            <div class="flex flex-wrap gap-3 justify-center">
              <a
                href="https://linkedin.com/in/iannelsondev"
                target="_blank"
                rel="noopener noreferrer"
                class="hero-btn"
                aria-label="LinkedIn profile (opens in new tab)"
              >LinkedIn</a>
              <a
                href="https://github.com/iannelsondev"
                target="_blank"
                rel="noopener noreferrer"
                class="hero-btn"
                aria-label="GitHub profile (opens in new tab)"
              >GitHub</a>
              <a href="mailto:iannelsondev@proton.me" class="hero-btn" aria-label="Send email to iannelsondev@proton.me">iannelsondev@proton.me</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!--
    WCAG 1.3.1 — Scroll indicator is decorative; aria-hidden suppresses it
    from the accessibility tree.
  -->
  <div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 scroll-hint" aria-hidden="true" style="opacity: 0.35;">
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

  .hero-text-glass {
    background: rgba(8, 8, 14, 0.45);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    border: 1px solid rgba(99, 102, 241, 0.12);
    box-shadow:
      0 0 40px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.03);
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
    /* Fallback color for non-webkit engines (18:1 contrast) */
    color: #f1f5f9;
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
    /* WCAG 2.4.7 — Explicit focus ring for keyboard users */
    outline-offset: 3px;
  }

  .hero-btn:hover {
    background: linear-gradient(135deg, #6366f1, #06b6d4);
    transform: translateY(-2px);
  }

  /* WCAG 2.4.7 — Visible focus indicator distinct from hover state */
  .hero-btn:focus-visible {
    outline: 2px solid #7c7ff4;
    outline-offset: 4px;
  }

  /* WCAG 2.3.3 — Disable bounce animation for reduced-motion users */
  @media (prefers-reduced-motion: reduce) {
    .scroll-hint {
      animation: none !important;
    }
  }
</style>
