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
        opacity: 0.12,
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
        const radius = 0.08 + Math.random() * 0.17; // 0.08–0.25
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
          opacity: 0.08,
          side: THREE.BackSide,
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        glow.scale.setScalar(radius * 2.8);
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
          glowMat.opacity = opacity * 0.08;
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
  <!-- Three.js canvas: fills section, sits behind all content -->
  <canvas
    bind:this={canvas}
    class="absolute inset-0 w-full h-full"
    aria-hidden="true"
  ></canvas>

  <!-- Content overlay -->
  <div class="relative z-10 flex flex-col items-center justify-center h-full text-center px-8 py-24 gap-0">

    <!-- Name -->
    <h1
      class="font-bold leading-none mb-4"
      style="
        font-family: 'Poppins', sans-serif;
        font-size: clamp(2.5rem, 6vw, 5rem);
        letter-spacing: 0.15em;
        color: #f1f5f9;
        text-shadow: 0 0 40px rgba(99,102,241,0.3), 0 0 80px rgba(99,102,241,0.15);
      "
    >
      IAN NELSON
    </h1>

    <!-- Subtitle -->
    <p
      class="uppercase tracking-[0.35em] text-[#94a3b8] mb-5"
      style="
        font-family: 'JetBrains Mono', monospace;
        font-size: clamp(0.6rem, 0.8vw, 0.85rem);
      "
    >
      AUTONOMOUS SYSTEMS · EDGE AI · INTELLIGENCE
    </p>

    <!-- Tagline -->
    <p
      class="text-[#94a3b8] max-w-lg mx-auto mb-10 leading-[1.8]"
      style="
        font-family: 'Poppins', sans-serif;
        font-weight: 300;
        font-size: clamp(0.875rem, 1vw, 1.05rem);
      "
    >
      Building multi-agent swarms, on-prem AI matching frontier models, knowledge graph pipelines, and edge inference systems.
    </p>

    <!-- CTA buttons -->
    <div class="flex flex-wrap gap-3 justify-center mb-14">
      <a
        href="https://linkedin.com/in/iannelsondev"
        target="_blank"
        rel="noopener noreferrer"
        class="font-mono text-[0.7rem] tracking-[0.14em] uppercase text-[#f1f5f9] px-6 py-3 rounded-md
          transition-[transform,background] duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        style="border: 1px solid transparent; background: linear-gradient(#0a0a0f, #0a0a0f) padding-box, linear-gradient(135deg, #6366f1, #06b6d4) border-box;"
        onmouseover={(e) => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #6366f1, #06b6d4)'; }}
        onfocus={(e) => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #6366f1, #06b6d4)'; }}
        onmouseout={(e) => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(#0a0a0f, #0a0a0f) padding-box, linear-gradient(135deg, #6366f1, #06b6d4) border-box'; }}
        onblur={(e) => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(#0a0a0f, #0a0a0f) padding-box, linear-gradient(135deg, #6366f1, #06b6d4) border-box'; }}
      >LinkedIn</a>

      <a
        href="https://github.com/iannelsondev"
        target="_blank"
        rel="noopener noreferrer"
        class="font-mono text-[0.7rem] tracking-[0.14em] uppercase text-[#f1f5f9] px-6 py-3 rounded-md
          transition-[transform,background] duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        style="border: 1px solid transparent; background: linear-gradient(#0a0a0f, #0a0a0f) padding-box, linear-gradient(135deg, #6366f1, #06b6d4) border-box;"
        onmouseover={(e) => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #6366f1, #06b6d4)'; }}
        onfocus={(e) => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #6366f1, #06b6d4)'; }}
        onmouseout={(e) => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(#0a0a0f, #0a0a0f) padding-box, linear-gradient(135deg, #6366f1, #06b6d4) border-box'; }}
        onblur={(e) => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(#0a0a0f, #0a0a0f) padding-box, linear-gradient(135deg, #6366f1, #06b6d4) border-box'; }}
      >GitHub</a>

      <a
        href="mailto:iannelsondev@proton.me"
        class="font-mono text-[0.7rem] tracking-[0.14em] uppercase text-[#f1f5f9] px-6 py-3 rounded-md
          transition-[transform,background] duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        style="border: 1px solid transparent; background: linear-gradient(#0a0a0f, #0a0a0f) padding-box, linear-gradient(135deg, #6366f1, #06b6d4) border-box;"
        onmouseover={(e) => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #6366f1, #06b6d4)'; }}
        onfocus={(e) => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #6366f1, #06b6d4)'; }}
        onmouseout={(e) => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(#0a0a0f, #0a0a0f) padding-box, linear-gradient(135deg, #6366f1, #06b6d4) border-box'; }}
        onblur={(e) => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(#0a0a0f, #0a0a0f) padding-box, linear-gradient(135deg, #6366f1, #06b6d4) border-box'; }}
      >iannelsondev@proton.me</a>
    </div>

    <!-- Scroll indicator -->
    <div class="flex flex-col items-center gap-2 animate-bounce" aria-hidden="true" style="opacity: 0.4;">
      <span class="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-[#94a3b8]">SCROLL</span>
      <div class="w-px h-8" style="background: linear-gradient(to bottom, #6366f1, transparent);"></div>
    </div>

  </div>
</section>
