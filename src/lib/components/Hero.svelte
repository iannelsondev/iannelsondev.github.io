<script lang="ts">
  import { onMount } from 'svelte';

  let canvasEl = $state<HTMLCanvasElement | null>(null);
  let glassEl = $state<HTMLDivElement | null>(null);
  let webglReady = $state(false);
  let tourActive = $state(false);
  let tourStep = $state(0);

  // --- Graph controller (populated from Three.js closure) ---
  interface GraphController {
    focusCommunity: (index: number) => void;
    focusOverview: () => void;
    highlightCommunities: (boost: boolean) => void;
    highlightNodes: (boost: boolean) => void;
    highlightSolidEdges: (boost: boolean) => void;
    highlightDashedEdges: (boost: boolean) => void;
    setRotationSpeed: (speed: number) => void;
    spotlightNode: (communityIndex: number) => void;
    clearSpotlight: () => void;
    getStats: () => { nodes: number; edges: number; communities: number; crossEdges: number };
    resetAll: () => void;
  }

  let graphCtrl: GraphController | null = null;

  interface TourStepDef {
    title: string;
    description: string;
    content: 'text' | 'legend' | 'communities' | 'edges' | 'inference';
    position: 'bottom-right' | 'bottom-left' | 'top-right';
    onEnter?: () => void;
    onLeave?: () => void;
  }

  // Mock embedding vector for the node detail card
  const MOCK_EMBEDDING = [0.0234, -0.1892, 0.4521, 0.0087, -0.3341, 0.2156, -0.0743, 0.5102, -0.2891, 0.1234, -0.4012, 0.0891, 0.3367, -0.1558, 0.2003, -0.0421];

  // Live stats updated on tour start
  let tourStats = $state({ nodes: 0, edges: 0, communities: 0, crossEdges: 0 });

  const tourSteps: TourStepDef[] = [
    {
      title: 'Knowledge Graph',
      description: 'This is a live community-oriented knowledge graph — the same architecture powering VIPR and Talon Black. Each element represents a concept from GraphRAG pipelines.',
      content: 'text',
      position: 'bottom-right',
      onEnter: () => {
        graphCtrl?.focusOverview();
        graphCtrl?.setRotationSpeed(0.002);
        if (graphCtrl) tourStats = graphCtrl.getStats();
      },
      onLeave: () => {
        graphCtrl?.setRotationSpeed(0.0005);
      },
    },
    {
      title: 'Community Detection',
      description: 'Colored clusters are communities — densely connected subgraphs discovered by algorithms like Leiden. In GraphRAG, communities partition a knowledge graph into coherent topic groups that can be summarized and queried independently.',
      content: 'communities',
      position: 'bottom-left',
      onEnter: () => {
        graphCtrl?.focusCommunity(0);
        graphCtrl?.highlightCommunities(true);
      },
      onLeave: () => {
        graphCtrl?.highlightCommunities(false);
      },
    },
    {
      title: 'Vectorized Nodes',
      description: 'Each sphere is an entity — a document, concept, or extracted fact — embedded into a vector space. Proximity reflects semantic similarity from embeddings, enabling retrieval-augmented generation over structured knowledge rather than flat document chunks.',
      content: 'legend',
      position: 'bottom-right',
      onEnter: () => {
        graphCtrl?.focusCommunity(3);
        graphCtrl?.highlightNodes(true);
        graphCtrl?.spotlightNode(3);
      },
      onLeave: () => {
        graphCtrl?.highlightNodes(false);
        graphCtrl?.clearSpotlight();
      },
    },
    {
      title: 'Cross-Community Edges',
      description: 'Dashed lines are inter-community bridges — relationships an NLP pipeline discovers through entity resolution, coreference, and relation extraction. These connections are what make graph-based RAG more powerful than naive vector search alone.',
      content: 'edges',
      position: 'bottom-left',
      onEnter: () => {
        graphCtrl?.focusOverview();
        graphCtrl?.highlightDashedEdges(true);
        graphCtrl?.highlightSolidEdges(false);
      },
      onLeave: () => {
        graphCtrl?.highlightDashedEdges(false);
        graphCtrl?.highlightSolidEdges(false);
      },
    },
    {
      title: 'Edge Inference',
      description: 'This all runs locally. On-prem LLM inference with vLLM and ONNX edge models means entity extraction, embedding, and graph construction happen where the data lives — no cloud dependency, no data exfiltration, full autonomy.',
      content: 'inference',
      position: 'bottom-right',
      onEnter: () => {
        graphCtrl?.focusOverview();
        graphCtrl?.setRotationSpeed(0.003);
      },
      onLeave: () => {
        graphCtrl?.setRotationSpeed(0.0005);
      },
    },
  ];

  const currentTourStep = $derived(tourSteps[tourStep]);
  const isFirstStep = $derived(tourStep === 0);
  const isLastStep = $derived(tourStep === tourSteps.length - 1);

  function applyStepActions(step: number) {
    tourSteps[step].onEnter?.();
  }

  function leaveStepActions(step: number) {
    tourSteps[step].onLeave?.();
  }

  function startTour() {
    tourStep = 0;
    tourActive = true;
    applyStepActions(0);
  }

  function closeTour() {
    leaveStepActions(tourStep);
    graphCtrl?.resetAll();
    tourActive = false;
    tourStep = 0;
  }

  function nextStep() {
    if (isLastStep) { closeTour(); return; }
    leaveStepActions(tourStep);
    tourStep++;
    applyStepActions(tourStep);
  }

  function prevStep() {
    if (tourStep > 0) {
      leaveStepActions(tourStep);
      tourStep--;
      applyStepActions(tourStep);
    }
  }

  function handleTourKeydown(e: KeyboardEvent) {
    if (!tourActive) return;
    if (e.key === 'Escape') closeTour();
    else if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); nextStep(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); prevStep(); }
  }

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

          // --- Tour-driven camera & visual targets ---
          let camTargetX = 0, camTargetY = 0, camTargetZ = 16;
          let rotSpeed = 0.0005;
          const DEFAULT_FILL_OPACITY = 0.035;
          const DEFAULT_WIRE_OPACITY = 0.3;
          const DEFAULT_SOLID_OPACITY = 0.4;
          const DEFAULT_DASHED_OPACITY = 0.18;
          let targetFillOpacity = DEFAULT_FILL_OPACITY;
          let targetWireOpacity = DEFAULT_WIRE_OPACITY;
          let targetSolidOpacity = DEFAULT_SOLID_OPACITY;
          let targetDashedOpacity = DEFAULT_DASHED_OPACITY;
          let targetNodeScale = 1.0;

          // Spotlight: pulse a single node
          let spotlightNodeRef: Node | null = null;
          let spotlightPulsePhase = 0;

          // Edge counting for live stats
          let lastSolidCount = 0;
          let lastDashedCount = 0;

          graphCtrl = {
            focusCommunity(index: number) {
              const z = zones[index % zones.length];
              camTargetX = z.center.x * 0.4;
              camTargetY = z.center.y * 0.4;
              camTargetZ = 10;
            },
            focusOverview() {
              camTargetX = 0;
              camTargetY = 0;
              camTargetZ = 16;
            },
            highlightCommunities(boost: boolean) {
              targetFillOpacity = boost ? 0.12 : DEFAULT_FILL_OPACITY;
              targetWireOpacity = boost ? 0.7 : DEFAULT_WIRE_OPACITY;
            },
            highlightNodes(boost: boolean) {
              targetNodeScale = boost ? 1.8 : 1.0;
            },
            highlightSolidEdges(boost: boolean) {
              targetSolidOpacity = boost ? 0.8 : DEFAULT_SOLID_OPACITY;
            },
            highlightDashedEdges(boost: boolean) {
              if (boost) {
                targetDashedOpacity = 0.6;
                targetSolidOpacity = 0.1;
              } else {
                targetDashedOpacity = DEFAULT_DASHED_OPACITY;
                targetSolidOpacity = DEFAULT_SOLID_OPACITY;
              }
            },
            setRotationSpeed(speed: number) {
              rotSpeed = speed;
            },
            spotlightNode(communityIndex: number) {
              // Find the largest node in the target community
              let best: Node | null = null;
              for (const n of nodes) {
                if (n.community === communityIndex) {
                  if (!best || n.baseRadius > best.baseRadius) best = n;
                }
              }
              spotlightNodeRef = best;
              spotlightPulsePhase = 0;
            },
            clearSpotlight() {
              spotlightNodeRef = null;
            },
            getStats() {
              return {
                nodes: nodes.length,
                edges: lastSolidCount + lastDashedCount,
                communities: NUM_COMMUNITIES,
                crossEdges: lastDashedCount,
              };
            },
            resetAll() {
              camTargetX = 0;
              camTargetY = 0;
              camTargetZ = 16;
              rotSpeed = 0.0005;
              targetFillOpacity = DEFAULT_FILL_OPACITY;
              targetWireOpacity = DEFAULT_WIRE_OPACITY;
              targetSolidOpacity = DEFAULT_SOLID_OPACITY;
              targetDashedOpacity = DEFAULT_DASHED_OPACITY;
              targetNodeScale = 1.0;
              spotlightNodeRef = null;
            },
          };

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

              lastSolidCount = sc;
              lastDashedCount = dc;
            }

            // Lerp material opacities toward tour targets
            const lerpRate = 0.04;
            for (const z of zones) {
              const fm = z.fillMesh.material as THREE.MeshBasicMaterial;
              fm.opacity += (targetFillOpacity - fm.opacity) * lerpRate;
              const wm = z.wireMesh.material as THREE.LineBasicMaterial;
              wm.opacity += (targetWireOpacity - wm.opacity) * lerpRate;
            }
            solidMat.opacity += (targetSolidOpacity - solidMat.opacity) * lerpRate;
            dashedMat.opacity += (targetDashedOpacity - dashedMat.opacity) * lerpRate;

            // Lerp node scale toward target + spotlight pulse
            spotlightPulsePhase += 0.05;
            for (const n of nodes) {
              const isSpotlit = spotlightNodeRef === n;
              const pulseScale = isSpotlit ? 3.0 + Math.sin(spotlightPulsePhase) * 0.8 : targetNodeScale;
              const target = n.baseRadius * pulseScale;
              const cur = n.mesh.scale.x;
              const next = cur + (target - cur) * (isSpotlit ? 0.08 : lerpRate);
              const t = (now - n.born) / n.lifetime;
              if (t < 0.85) {
                n.mesh.scale.set(next, next, next);
                n.glowMesh.scale.set(next * 2, next * 2, next * 2);
              }
              // Boost spotlight glow
              if (isSpotlit) {
                n.glowMat.opacity = 0.8 + Math.sin(spotlightPulsePhase) * 0.2;
              }
            }

            // Gentle rotation + camera control
            communityGroup.rotation.y += rotSpeed;
            nodeGroup.rotation.y = communityGroup.rotation.y;

            // Camera: lerp toward tour target, then apply mouse parallax on top
            camera.position.z += (camTargetZ - camera.position.z) * 0.03;
            const baseCamX = camTargetX + (tourActive ? 0 : targetCX);
            const baseCamY = camTargetY + (tourActive ? 0 : targetCY);
            camera.position.x += (baseCamX - camera.position.x) * 0.03;
            camera.position.y += (baseCamY - camera.position.y) * 0.03;
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

      <!-- Info toggle — only visible when WebGL graph is rendering -->
      {#if webglReady}
        <button
          class="info-toggle"
          onclick={() => tourActive ? closeTour() : startTour()}
          aria-label={tourActive ? 'Close graph walkthrough' : 'What is this graph?'}
          aria-expanded={tourActive}
        >
          <span class="info-toggle-icon">{tourActive ? '✕' : '?'}</span>
        </button>
      {/if}

      <!-- Text content — in flow so the glass panel gets intrinsic height -->
      <div class="relative flex items-center justify-center hero-panel {tourActive ? 'hero-panel-hidden' : 'hero-panel-visible'}" style="z-index: 2;">
        <div class="{webglReady ? 'hero-text-glass' : ''} rounded-xl px-8 sm:px-12 md:px-16 py-14 md:py-20 max-w-2xl w-full mx-4">
          <div class="flex flex-col items-center text-center">
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

      <!-- VIPR-style guided tour tooltip -->
      {#if tourActive && currentTourStep}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="absolute inset-0"
          style="z-index: 3;"
          onkeydown={handleTourKeydown}
        >
          <!-- Semi-transparent overlay to dim the graph slightly -->
          <button
            class="absolute inset-0 cursor-default"
            style="background: rgba(0, 0, 0, 0.25);"
            onclick={closeTour}
            tabindex="-1"
            aria-label="Close tour"
          ></button>

          <!-- Detail card — positioned opposite the tooltip -->
          {#if tourStep === 0}
            <!-- Graph stats -->
            <div class="tour-detail tour-detail-top-left">
              <div class="text-[9px] text-[#64748b] uppercase tracking-wider mb-2">Marvel Cinematic Universe — Knowledge Graph</div>
              <div class="grid grid-cols-2 gap-1.5">
                <div class="detail-stat">
                  <div class="detail-stat-label">Entities</div>
                  <div class="detail-stat-value">{tourStats.nodes}</div>
                </div>
                <div class="detail-stat">
                  <div class="detail-stat-label">Relationships</div>
                  <div class="detail-stat-value">{tourStats.edges}</div>
                </div>
                <div class="detail-stat">
                  <div class="detail-stat-label">Communities</div>
                  <div class="detail-stat-value">{tourStats.communities}</div>
                </div>
                <div class="detail-stat">
                  <div class="detail-stat-label">Cross-links</div>
                  <div class="detail-stat-value">{tourStats.crossEdges}</div>
                </div>
              </div>
              <div class="flex flex-wrap gap-1 mt-2">
                {#each ['PERSON', 'ORG', 'ARTIFACT', 'LOCATION', 'EVENT'] as tag}
                  <span class="detail-tag">{tag}</span>
                {/each}
              </div>
            </div>
          {:else if tourStep === 1}
            <!-- Community detail card -->
            <div class="tour-detail tour-detail-top-right">
              <div class="text-[9px] text-[#64748b] uppercase tracking-wider mb-2">Community 0</div>
              <div class="flex items-center gap-2 mb-2">
                <span class="w-3 h-3 rounded-sm shrink-0" style="background: rgba(96, 165, 250, 0.3); border: 1px solid rgba(96, 165, 250, 0.6);"></span>
                <span class="text-xs text-[#e2e8f0]">The Avengers</span>
              </div>
              <div class="grid grid-cols-2 gap-1.5 mb-2">
                <div class="detail-stat">
                  <div class="detail-stat-label">Members</div>
                  <div class="detail-stat-value">12</div>
                </div>
                <div class="detail-stat">
                  <div class="detail-stat-label">Density</div>
                  <div class="detail-stat-value">0.78</div>
                </div>
                <div class="detail-stat">
                  <div class="detail-stat-label">Modularity</div>
                  <div class="detail-stat-value">0.43</div>
                </div>
                <div class="detail-stat">
                  <div class="detail-stat-label">Bridges</div>
                  <div class="detail-stat-value">9</div>
                </div>
              </div>
              <div class="flex flex-wrap gap-1 mb-1.5">
                {#each ['Tony Stark', 'Steve Rogers', 'Natasha Romanoff', 'Thor', 'Bruce Banner', 'Clint Barton'] as name}
                  <span class="detail-tag">{name}</span>
                {/each}
              </div>
              <p class="text-[10px] text-[#64748b] leading-relaxed">
                Highest bridge count — this community connects to Guardians, Asgard, and Wakanda clusters.
              </p>
            </div>
          {:else if tourStep === 2}
            <!-- Node + embedding vector detail -->
            <div class="tour-detail tour-detail-top-left">
              <div class="text-[9px] text-[#64748b] uppercase tracking-wider mb-2">Entity Node</div>
              <div class="flex items-center gap-2 mb-1.5">
                <span class="w-2.5 h-2.5 rounded-full shrink-0 detail-pulse" style="background: #fbbf24; box-shadow: 0 0 8px rgba(251, 191, 36, 0.5);"></span>
                <span class="text-xs text-[#e2e8f0] font-medium">Tony Stark</span>
              </div>
              <div class="grid grid-cols-2 gap-1.5 mb-2">
                <div class="detail-stat">
                  <div class="detail-stat-label">Type</div>
                  <div class="detail-stat-value text-[#fbbf24]">PERSON</div>
                </div>
                <div class="detail-stat">
                  <div class="detail-stat-label">Degree</div>
                  <div class="detail-stat-value">31</div>
                </div>
                <div class="detail-stat">
                  <div class="detail-stat-label">Confidence</div>
                  <div class="detail-stat-value">0.99</div>
                </div>
                <div class="detail-stat">
                  <div class="detail-stat-label">Dimensions</div>
                  <div class="detail-stat-value">384</div>
                </div>
              </div>
              <div class="text-[9px] text-[#64748b] uppercase tracking-wider mb-1">Embedding Vector</div>
              <div class="detail-vector">
                <span class="text-[#475569]">[</span>{#each MOCK_EMBEDDING.slice(0, 6) as v, i}<span class="{v >= 0 ? 'text-[#34d399]' : 'text-[#f472b6]'}">{v.toFixed(4)}</span>{#if i < 5}<span class="text-[#334155]">, </span>{/if}{/each}<span class="text-[#475569]">, ... ×378</span><span class="text-[#475569]">]</span>
              </div>
              <div class="detail-vector-bar mt-1.5">
                {#each MOCK_EMBEDDING as v}
                  <div
                    class="detail-vector-cell"
                    style="background: {v >= 0 ? `rgba(52, 211, 153, ${Math.abs(v)})` : `rgba(244, 114, 182, ${Math.abs(v)})`};"
                  ></div>
                {/each}
              </div>
              <div class="flex justify-between text-[8px] text-[#475569] mt-0.5">
                <span>model: all-MiniLM-L6-v2</span>
                <span>cosine sim → Steve Rogers: 0.82</span>
              </div>
            </div>
          {:else if tourStep === 3}
            <!-- Edge detail card -->
            <div class="tour-detail tour-detail-top-right">
              <div class="text-[9px] text-[#64748b] uppercase tracking-wider mb-2">Bridge Relationship</div>
              <div class="flex items-center gap-2 mb-2 text-[10px]">
                <span class="text-[#60a5fa]">Thor</span>
                <span class="w-6 h-px border-t border-dashed border-[#94a3b8] shrink-0"></span>
                <span class="text-[#34d399]">Guardians of the Galaxy</span>
              </div>
              <div class="grid grid-cols-2 gap-1.5 mb-2">
                <div class="detail-stat">
                  <div class="detail-stat-label">Relation</div>
                  <div class="detail-stat-value text-[#94a3b8]">ALLIED_WITH</div>
                </div>
                <div class="detail-stat">
                  <div class="detail-stat-label">Weight</div>
                  <div class="detail-stat-value">0.91</div>
                </div>
                <div class="detail-stat">
                  <div class="detail-stat-label">Source Com.</div>
                  <div class="detail-stat-value text-[#60a5fa]">Avengers</div>
                </div>
                <div class="detail-stat">
                  <div class="detail-stat-label">Target Com.</div>
                  <div class="detail-stat-value text-[#34d399]">Guardians</div>
                </div>
              </div>
              <div class="text-[9px] text-[#64748b] uppercase tracking-wider mb-1">Source Text</div>
              <p class="text-[10px] text-[#64748b] leading-relaxed italic">
                "Thor joined the Guardians aboard the Benatar after the events of Endgame, bridging the Asgardian and cosmic storylines..."
              </p>
              <div class="flex gap-1 mt-1.5">
                {#each ['coreference', 'relation extraction', 'temporal'] as tag}
                  <span class="detail-tag">{tag}</span>
                {/each}
              </div>
            </div>
          {:else if tourStep === 4}
            <!-- Inference pipeline card -->
            <div class="tour-detail tour-detail-top-left">
              <div class="text-[9px] text-[#64748b] uppercase tracking-wider mb-2">Inference Pipeline</div>
              <div class="space-y-1.5 text-[10px]">
                <div class="flex items-center gap-2">
                  <span class="detail-pipeline-dot" style="background: #06b6d4;"></span>
                  <span class="text-[#94a3b8] flex-1">NER: extract "Tony Stark", "Thanos"</span>
                  <span class="text-[#475569] tabular-nums">~240ms</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="detail-pipeline-dot" style="background: #22d3ee;"></span>
                  <span class="text-[#94a3b8] flex-1">Embed entities → 384-dim vectors</span>
                  <span class="text-[#475569] tabular-nums">~85ms</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="detail-pipeline-dot" style="background: #a78bfa;"></span>
                  <span class="text-[#94a3b8] flex-1">Resolve "Iron Man" → "Tony Stark"</span>
                  <span class="text-[#475569] tabular-nums">~180ms</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="detail-pipeline-dot" style="background: #34d399;"></span>
                  <span class="text-[#94a3b8] flex-1">Upsert nodes + DEFEATED edge</span>
                  <span class="text-[#475569] tabular-nums">~12ms</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="detail-pipeline-dot" style="background: #fbbf24;"></span>
                  <span class="text-[#94a3b8] flex-1">Leiden: recompute communities</span>
                  <span class="text-[#475569] tabular-nums">~350ms</span>
                </div>
              </div>
              <div class="mt-2 pt-2" style="border-top: 1px solid rgba(99, 102, 241, 0.1);">
                <div class="grid grid-cols-3 gap-1.5">
                  <div class="detail-stat">
                    <div class="detail-stat-label">Model</div>
                    <div class="detail-stat-value text-[10px]">Qwen-2.5</div>
                  </div>
                  <div class="detail-stat">
                    <div class="detail-stat-label">Runtime</div>
                    <div class="detail-stat-value text-[10px]">vLLM</div>
                  </div>
                  <div class="detail-stat">
                    <div class="detail-stat-label">GPU</div>
                    <div class="detail-stat-value text-[10px]">RTX 4090</div>
                  </div>
                </div>
              </div>
            </div>
          {/if}

          <!-- Tooltip -->
          <div class="tour-tooltip tour-pos-{currentTourStep.position}">
            <!-- Progress -->
            <div class="flex items-center gap-2 mb-2">
              <span class="text-[9px] text-[#64748b] uppercase tracking-wider">
                {tourStep + 1} / {tourSteps.length}
              </span>
              <div class="flex gap-1 ml-auto">
                {#each tourSteps as _, i}
                  <span
                    class="w-1.5 h-1.5 rounded-full transition-colors {i === tourStep ? 'bg-[#94a3b8]' : i < tourStep ? 'bg-[#475569]' : 'bg-[#1e293b]'}"
                  ></span>
                {/each}
              </div>
            </div>

            <!-- Title + Description -->
            <h3 class="text-sm font-medium text-[#e2e8f0] mb-1">{currentTourStep.title}</h3>
            <p class="text-xs text-[#94a3b8] leading-relaxed mb-2">{currentTourStep.description}</p>

            <!-- Content blocks -->
            {#if currentTourStep.content === 'communities'}
              <div class="mt-1 space-y-1 text-[10px]">
                <div class="flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-sm shrink-0" style="background: rgba(96, 165, 250, 0.3); border: 1px solid rgba(96, 165, 250, 0.5);"></span>
                  <span class="text-[#94a3b8]">Translucent boxes group communities</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-sm shrink-0" style="background: rgba(52, 211, 153, 0.3); border: 1px solid rgba(52, 211, 153, 0.5);"></span>
                  <span class="text-[#94a3b8]">Each community gets a distinct color</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-sm shrink-0" style="background: rgba(251, 191, 36, 0.3); border: 1px solid rgba(251, 191, 36, 0.5);"></span>
                  <span class="text-[#94a3b8]">Wireframe edges show cluster boundaries</span>
                </div>
                <p class="text-[#64748b] mt-1">
                  Detected by the Leiden algorithm — nodes within a community share more connections with each other than with outsiders.
                </p>
              </div>

            {:else if currentTourStep.content === 'legend'}
              <div class="mt-1 space-y-2 text-[10px]">
                <div class="flex items-center gap-3">
                  <div class="flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-[#94a3b8] shrink-0"></span>
                    <span class="text-[#94a3b8]">Few connections</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <span class="w-3.5 h-3.5 rounded-full bg-[#94a3b8] shrink-0"></span>
                    <span class="text-[#94a3b8]">Many connections</span>
                  </div>
                </div>
                <div class="space-y-1 text-[#94a3b8]">
                  <div class="flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#6366f1] shrink-0"></span>
                    <span>Glow ring = additive blending shows entity presence</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#06b6d4] shrink-0"></span>
                    <span>Color inherited from community membership</span>
                  </div>
                </div>
              </div>

            {:else if currentTourStep.content === 'edges'}
              <div class="mt-1 space-y-2 text-[10px]">
                <div class="flex items-center gap-2">
                  <span class="w-6 h-px bg-[#6366f1] shrink-0"></span>
                  <span class="text-[#94a3b8] font-medium">Solid</span>
                  <span class="text-[#64748b]">Intra-community</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="w-6 h-px border-t border-dashed border-[#94a3b8] shrink-0"></span>
                  <span class="text-[#94a3b8] font-medium">Dashed</span>
                  <span class="text-[#64748b]">Cross-community bridge</span>
                </div>
                <p class="text-[#64748b] mt-1">
                  Bridge relationships are often the most revealing — they link separate knowledge domains that naive vector search would never connect.
                </p>
              </div>

            {:else if currentTourStep.content === 'inference'}
              <div class="mt-1 space-y-1 text-[10px]">
                <div class="flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#06b6d4] shrink-0"></span>
                  <span class="text-[#94a3b8]">NLP entity extraction via on-prem LLMs</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#22d3ee] shrink-0"></span>
                  <span class="text-[#94a3b8]">Embedding generation with ONNX edge models</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#a78bfa] shrink-0"></span>
                  <span class="text-[#94a3b8]">Graph construction via Kafka-driven pipelines</span>
                </div>
                <div class="flex gap-1.5 mt-2">
                  {#each ['vLLM', 'ONNX', 'Kafka', 'SurrealDB'] as tag}
                    <span class="text-[9px] px-1.5 py-0.5 rounded" style="background: rgba(99, 102, 241, 0.12); color: #94a3b8;">{tag}</span>
                  {/each}
                </div>
              </div>
            {/if}

            <!-- Controls -->
            <div class="flex items-center gap-2 mt-3">
              {#if !isFirstStep}
                <button
                  onclick={prevStep}
                  class="px-2.5 py-1 text-[11px] text-[#64748b] hover:text-[#94a3b8] transition-colors"
                >Prev</button>
              {/if}
              <div class="flex-1"></div>
              <button
                onclick={closeTour}
                class="px-2.5 py-1 text-[11px] text-[#475569] hover:text-[#94a3b8] transition-colors"
              >Skip</button>
              <button
                onclick={nextStep}
                class="px-3 py-1 text-[11px] rounded transition-colors"
                style="background: rgba(99, 102, 241, 0.15); color: #e2e8f0;"
              >{isLastStep ? 'Done' : 'Next'}</button>
            </div>
          </div>
        </div>
      {/if}
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

  /* --- Info toggle button --- */
  .info-toggle {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    z-index: 10;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    border: 1px solid rgba(99, 102, 241, 0.3);
    background: rgba(10, 10, 16, 0.7);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.3s, background 0.3s;
  }

  .info-toggle:hover {
    border-color: rgba(99, 102, 241, 0.6);
    background: rgba(99, 102, 241, 0.15);
  }

  .info-toggle:focus-visible {
    outline: 2px solid #7c7ff4;
    outline-offset: 3px;
  }

  .info-toggle-icon {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.8rem;
    font-weight: 600;
    color: #94a3b8;
    line-height: 1;
  }

  /* --- Panel transitions --- */
  .hero-panel {
    transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .hero-panel-visible {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  .hero-panel-hidden {
    opacity: 0;
    transform: translateY(8px);
    pointer-events: none;
  }

  /* --- Tour tooltip (VIPR-style) --- */
  .tour-tooltip {
    position: absolute;
    width: 22rem;
    max-width: calc(100% - 2rem);
    background: rgba(15, 15, 20, 0.95);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: 0.5rem;
    padding: 1rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    transition: opacity 0.3s ease-out, transform 0.3s ease-out;
  }

  .tour-pos-bottom-right {
    bottom: 1.5rem;
    right: 1.5rem;
  }

  .tour-pos-bottom-left {
    bottom: 1.5rem;
    left: 1.5rem;
  }

  .tour-pos-top-right {
    top: 3.5rem;
    right: 1.5rem;
  }

  /* On small screens, center the tooltip at bottom */
  @media (max-width: 640px) {
    .tour-tooltip {
      left: 1rem;
      right: 1rem;
      bottom: 1rem;
      width: auto;
    }
    .tour-pos-bottom-right,
    .tour-pos-bottom-left,
    .tour-pos-top-right {
      top: auto;
      left: 1rem;
      right: 1rem;
      bottom: 1rem;
    }
  }

  /* --- Tour detail card --- */
  .tour-detail {
    position: absolute;
    width: 18rem;
    max-width: calc(100% - 2rem);
    background: rgba(15, 15, 20, 0.92);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(99, 102, 241, 0.15);
    border-radius: 0.5rem;
    padding: 0.75rem;
    box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.5);
    animation: detail-fade-in 0.4s ease-out;
  }

  @keyframes detail-fade-in {
    from { opacity: 0; transform: translateY(-6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .tour-detail-top-left {
    top: 1.5rem;
    left: 1.5rem;
  }

  .tour-detail-top-right {
    top: 3.5rem;
    right: 1.5rem;
  }

  .detail-stat {
    background: rgba(30, 41, 59, 0.4);
    border-radius: 0.25rem;
    padding: 0.25rem 0.5rem;
  }

  .detail-stat-label {
    font-size: 9px;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .detail-stat-value {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: #e2e8f0;
    font-variant-numeric: tabular-nums;
  }

  .detail-tag {
    font-size: 9px;
    background: rgba(99, 102, 241, 0.1);
    color: #94a3b8;
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
  }

  .detail-vector {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    line-height: 1.6;
    padding: 0.375rem 0.5rem;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(99, 102, 241, 0.08);
    border-radius: 0.25rem;
    overflow-x: hidden;
    white-space: nowrap;
  }

  .detail-vector-bar {
    display: flex;
    gap: 1px;
    height: 12px;
    border-radius: 2px;
    overflow: hidden;
  }

  .detail-vector-cell {
    flex: 1;
    border-radius: 1px;
    min-width: 0;
  }

  .detail-pipeline-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .detail-pulse {
    animation: pulse-glow 2s ease-in-out infinite;
  }

  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 6px rgba(251, 191, 36, 0.4); }
    50% { box-shadow: 0 0 14px rgba(251, 191, 36, 0.8); }
  }

  /* On small screens, stack detail above tooltip */
  @media (max-width: 640px) {
    .tour-detail {
      position: relative;
      top: auto;
      left: auto;
      right: auto;
      width: auto;
      margin: 1rem 1rem 0;
    }
    .tour-detail-top-left,
    .tour-detail-top-right {
      top: auto;
      left: 1rem;
      right: 1rem;
    }
  }

  /* WCAG 2.3.3 — Disable animations for reduced-motion users */
  @media (prefers-reduced-motion: reduce) {
    .scroll-hint {
      animation: none !important;
    }
    .hero-panel,
    .tour-tooltip,
    .tour-detail {
      transition: none !important;
      animation: none !important;
    }
    .detail-pulse {
      animation: none !important;
    }
  }
</style>
