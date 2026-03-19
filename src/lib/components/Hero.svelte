<script lang="ts">
  import { onMount } from 'svelte';

  // No external props needed — hero is static content

  let canvas = $state<HTMLCanvasElement | null>(null);

  onMount(() => {
    if (!canvas) return;

    // ---- Dynamic import so Three.js never runs on the server ----
    let stopped = false;
    let cleanupFn: (() => void) | null = null;

    import('three').then((THREE) => {
      if (stopped || !canvas) return;

      // ------------------------------------------------------------------ //
      // Scene & renderer
      // ------------------------------------------------------------------ //
      const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);

      const scene = new THREE.Scene();

      const camera = new THREE.PerspectiveCamera(
        60,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        100
      );
      camera.position.z = 15;

      // ------------------------------------------------------------------ //
      // Shared geometries & materials
      // ------------------------------------------------------------------ //
      // Node sphere — shared geometry, individual materials per node
      const sphereGeo = new THREE.SphereGeometry(1, 8, 8); // radius=1, scaled per node

      // Glow sprite — larger transparent sphere around each node
      const glowGeo = new THREE.SphereGeometry(1, 8, 8);

      const INDIGO = 0x6366f1;
      const CYAN = 0x06b6d4;
      const NEUTRAL = 0xc8cdd6;

      const NODE_COLORS = [INDIGO, INDIGO, INDIGO, CYAN, CYAN, NEUTRAL];

      // Edge line geometry — pre-allocated with max edges
      const MAX_EDGES = 300;
      const edgePositions = new Float32Array(MAX_EDGES * 6); // 2 vertices * 3 components
      const edgeGeo = new THREE.BufferGeometry();
      edgeGeo.setAttribute('position', new THREE.BufferAttribute(edgePositions, 3));
      edgeGeo.setDrawRange(0, 0);

      const edgeMat = new THREE.LineBasicMaterial({
        color: INDIGO,
        transparent: true,
        opacity: 0.25,
      });
      const edgeMesh = new THREE.LineSegments(edgeGeo, edgeMat);
      scene.add(edgeMesh);

      // Group that rotates slowly on Y for parallax depth feel
      const nodeGroup = new THREE.Group();
      scene.add(nodeGroup);

      // ------------------------------------------------------------------ //
      // Node type
      // ------------------------------------------------------------------ //
      interface GraphNode {
        mesh: THREE.Mesh;
        glow: THREE.Mesh;
        vx: number;
        vy: number;
        vz: number;
        born: number;       // performance.now() timestamp
        lifetime: number;   // ms
        radius: number;
        colorHex: number;
      }

      const nodes: GraphNode[] = [];
      const TARGET_COUNT = 55;
      const EDGE_DIST_THRESHOLD = 4.5;
      const SPAWN_INTERVAL_MS = 400; // ~2.5 nodes/sec
      const SPREAD = 10; // spawn radius from edge

      let lastSpawn = 0;

      function createNode(): GraphNode {
        const radius = 0.15 + Math.random() * 0.3; // 0.15–0.45 (bigger, more visible)
        const colorHex = NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)];

        const mat = new THREE.MeshBasicMaterial({
          color: colorHex,
          transparent: true,
          opacity: 0.9,
        });
        const mesh = new THREE.Mesh(sphereGeo, mat);
        mesh.scale.setScalar(radius);

        const glowMat = new THREE.MeshBasicMaterial({
          color: colorHex,
          transparent: true,
          opacity: 0.2,
          side: THREE.BackSide,
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        glow.scale.setScalar(radius * 3.5);
        mesh.add(glow);

        // Spawn at random edge of the view volume
        const edge = Math.floor(Math.random() * 4);
        let x: number, y: number, z: number;
        z = (Math.random() - 0.5) * 6;
        if (edge === 0) { x = -SPREAD; y = (Math.random() - 0.5) * SPREAD * 1.5; }
        else if (edge === 1) { x = SPREAD; y = (Math.random() - 0.5) * SPREAD * 1.5; }
        else if (edge === 2) { y = -SPREAD * 0.8; x = (Math.random() - 0.5) * SPREAD * 2; }
        else { y = SPREAD * 0.8; x = (Math.random() - 0.5) * SPREAD * 2; }

        mesh.position.set(x, y, z);
        nodeGroup.add(mesh);

        // Initial drift velocity pointing roughly toward center with noise
        const speed = 0.008 + Math.random() * 0.012;
        const angle = Math.atan2(-y, -x) + (Math.random() - 0.5) * 1.2;
        return {
          mesh,
          glow,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          vz: (Math.random() - 0.5) * 0.005,
          born: performance.now(),
          lifetime: 8000 + Math.random() * 12000,
          radius,
          colorHex,
        };
      }

      function removeNode(node: GraphNode) {
        nodeGroup.remove(node.mesh);
        (node.mesh.material as THREE.MeshBasicMaterial).dispose();
        (node.glow.material as THREE.MeshBasicMaterial).dispose();
      }

      // Seed initial nodes scattered across the field (not edge-spawned)
      for (let i = 0; i < TARGET_COUNT; i++) {
        const n = createNode();
        // Override spawn position to scatter across field
        n.mesh.position.set(
          (Math.random() - 0.5) * SPREAD * 1.8,
          (Math.random() - 0.5) * SPREAD * 1.2,
          (Math.random() - 0.5) * 5
        );
        // Random initial velocity
        n.vx = (Math.random() - 0.5) * 0.015;
        n.vy = (Math.random() - 0.5) * 0.015;
        n.vz = (Math.random() - 0.5) * 0.005;
        // Random born offset so they don't all die at the same time
        n.born = performance.now() - Math.random() * n.lifetime * 0.8;
        nodes.push(n);
      }

      // ------------------------------------------------------------------ //
      // Mouse parallax state
      // ------------------------------------------------------------------ //
      let targetCamX = 0;
      let targetCamY = 0;

      function onMouseMove(e: MouseEvent) {
        const rect = canvas!.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width;  // 0–1
        const ny = (e.clientY - rect.top) / rect.height;  // 0–1
        targetCamX = (nx - 0.5) * 2.0;   // ±1
        targetCamY = -(ny - 0.5) * 2.0;  // ±1 (invert Y)
      }
      window.addEventListener('mousemove', onMouseMove);

      // ------------------------------------------------------------------ //
      // Resize handler
      // ------------------------------------------------------------------ //
      function onResize() {
        if (!canvas) return;
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
      }
      window.addEventListener('resize', onResize);

      // ------------------------------------------------------------------ //
      // Edge rebuild — called every few frames
      // ------------------------------------------------------------------ //
      let framesSinceEdgeRebuild = 0;
      const EDGE_REBUILD_INTERVAL = 3;

      function rebuildEdges() {
        let edgeCount = 0;
        const pos = edgeGeo.attributes.position as THREE.BufferAttribute;
        const arr = pos.array as Float32Array;

        for (let i = 0; i < nodes.length && edgeCount < MAX_EDGES; i++) {
          const a = nodes[i].mesh.position;
          for (let j = i + 1; j < nodes.length && edgeCount < MAX_EDGES; j++) {
            const b = nodes[j].mesh.position;
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dz = a.z - b.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (dist < EDGE_DIST_THRESHOLD) {
              const base = edgeCount * 6;
              arr[base]     = a.x; arr[base + 1] = a.y; arr[base + 2] = a.z;
              arr[base + 3] = b.x; arr[base + 4] = b.y; arr[base + 5] = b.z;
              edgeCount++;
            }
          }
        }

        pos.needsUpdate = true;
        edgeGeo.setDrawRange(0, edgeCount * 2);
      }

      // ------------------------------------------------------------------ //
      // Animation loop
      // ------------------------------------------------------------------ //
      renderer.setAnimationLoop(() => {
        const now = performance.now();

        // Spawn new nodes if below target
        if (nodes.length < TARGET_COUNT && now - lastSpawn > SPAWN_INTERVAL_MS) {
          nodes.push(createNode());
          lastSpawn = now;
        }

        // Update nodes
        for (let i = nodes.length - 1; i >= 0; i--) {
          const node = nodes[i];
          const age = now - node.born;
          const t = age / node.lifetime; // 0→1

          // Fade out in last 15% of lifetime
          const opacity = t > 0.85 ? 1 - (t - 0.85) / 0.15 : 1;
          const mat = node.mesh.material as THREE.MeshBasicMaterial;
          const glowMat = node.glow.material as THREE.MeshBasicMaterial;
          mat.opacity = opacity * 0.9;
          glowMat.opacity = opacity * 0.2;
          node.mesh.scale.setScalar(node.radius * (t > 0.85 ? opacity : 1));

          if (t >= 1) {
            removeNode(node);
            nodes.splice(i, 1);
            continue;
          }

          // Force simulation
          const px = node.mesh.position.x;
          const py = node.mesh.position.y;
          const pz = node.mesh.position.z;

          // Gravity toward center
          node.vx += -px * 0.0005;
          node.vy += -py * 0.0005;
          node.vz += -pz * 0.0002;

          // Repulsion from other nodes
          for (let j = 0; j < nodes.length; j++) {
            if (i === j) continue;
            const other = nodes[j].mesh.position;
            const dx = px - other.x;
            const dy = py - other.y;
            const dz = pz - other.z;
            const dist2 = dx * dx + dy * dy + dz * dz;
            if (dist2 < 4 && dist2 > 0.001) {
              const dist = Math.sqrt(dist2);
              const force = 0.002 / dist2;
              node.vx += (dx / dist) * force;
              node.vy += (dy / dist) * force;
              node.vz += (dz / dist) * force;
            }
          }

          // Damping
          node.vx *= 0.98;
          node.vy *= 0.98;
          node.vz *= 0.98;

          node.mesh.position.x += node.vx;
          node.mesh.position.y += node.vy;
          node.mesh.position.z += node.vz;
        }

        // Rebuild edges every N frames
        framesSinceEdgeRebuild++;
        if (framesSinceEdgeRebuild >= EDGE_REBUILD_INTERVAL) {
          rebuildEdges();
          framesSinceEdgeRebuild = 0;
        }

        // Slow Y rotation of the node group
        nodeGroup.rotation.y += 0.001;

        // Mouse parallax — lerp camera toward target
        camera.position.x += (targetCamX - camera.position.x) * 0.03;
        camera.position.y += (targetCamY - camera.position.y) * 0.03;

        renderer.render(scene, camera);
      });

      // ------------------------------------------------------------------ //
      // Cleanup
      // ------------------------------------------------------------------ //
      cleanupFn = () => {
        renderer.setAnimationLoop(null);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', onResize);

        for (const node of nodes) removeNode(node);

        sphereGeo.dispose();
        glowGeo.dispose();
        edgeGeo.dispose();
        edgeMat.dispose();
        renderer.dispose();
      };
    });

    return () => {
      stopped = true;
      cleanupFn?.();
    };
  });
</script>

<section
  id="home"
  class="relative h-full w-full overflow-hidden"
  aria-label="Introduction"
>
  <!-- Glass panel with Three.js behind, content on top -->
  <div class="relative z-10 flex items-center justify-center h-full px-4 sm:px-6 md:px-8">
    <div class="hero-glass relative w-full max-w-4xl rounded-2xl overflow-hidden">

      <!-- Three.js renders INTO this panel -->
      <canvas
        bind:this={canvas}
        class="absolute inset-0 w-full h-full"
        aria-hidden="true"
        style="z-index: 0;"
      ></canvas>

      <!-- Content sits on top of the Three.js canvas inside the glass -->
      <div class="relative z-10 flex flex-col items-center justify-center text-center px-6 sm:px-10 md:px-16 py-12 md:py-16">

        <h1 class="hero-name leading-[0.95] mb-5">Ian Nelson</h1>

        <p
          class="font-mono uppercase tracking-[0.3em] text-[#94a3b8] mb-5"
          style="font-size: clamp(0.55rem, 0.75vw, 0.8rem);"
        >
          Autonomous Systems · Edge AI · Intelligence
        </p>

        <p
          class="text-[#94a3b8] max-w-lg mx-auto mb-8 font-light leading-[1.8]"
          style="font-size: clamp(0.85rem, 0.95vw, 1rem);"
        >
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

  <!-- Scroll indicator outside the glass -->
  <div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-bounce" aria-hidden="true" style="opacity: 0.35;">
    <span class="font-mono text-[0.5rem] tracking-[0.2em] uppercase text-[#94a3b8]">SCROLL</span>
    <div class="w-px h-6" style="background: linear-gradient(to bottom, #6366f1, transparent);"></div>
  </div>
</section>

<style>
  .hero-glass {
    background: rgba(12, 12, 18, 0.55);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(99, 102, 241, 0.12);
    box-shadow:
      0 0 60px rgba(99, 102, 241, 0.06),
      0 25px 60px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.03);
  }

  .hero-name {
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: clamp(2.8rem, 5.5vw, 4.5rem);
    letter-spacing: -0.02em;
    color: #f1f5f9;
    text-shadow:
      0 0 30px rgba(99, 102, 241, 0.25),
      0 0 60px rgba(99, 102, 241, 0.1);
  }

  .hero-btn {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #f1f5f9;
    padding: 0.65rem 1.5rem;
    border-radius: 0.5rem;
    border: 1px solid transparent;
    background:
      linear-gradient(rgba(12, 12, 18, 0.8), rgba(12, 12, 18, 0.8)) padding-box,
      linear-gradient(135deg, #6366f1, #06b6d4) border-box;
    transition: transform 0.2s, background 0.2s;
  }

  .hero-btn:hover {
    background: linear-gradient(135deg, #6366f1, #06b6d4);
    transform: translateY(-2px);
  }
</style>
