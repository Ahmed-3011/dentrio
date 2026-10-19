'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';

const MATERIAL_MODES = {
  ceramic: { color: 0xf1f5f9, roughness: 0.32, metalness: 0.05 },
  stone: { color: 0xe2b887, roughness: 0.45, metalness: 0.02 },
  contrast: { color: 0x38bdf8, roughness: 0.28, metalness: 0.12 },
} as const;

export default function Viewer3D({ url, fileName }: { url: string; fileName?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [materialMode, setMaterialMode] = useState<'ceramic' | 'stone' | 'contrast'>('ceramic');

  const meshRef = useRef<THREE.Mesh | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const defaultPosRef = useRef<{ pos: THREE.Vector3; target: THREE.Vector3 } | null>(null);
  const materialModeRef = useRef(materialMode);
  const wireframeRef = useRef(wireframe);
  const renderNeededRef = useRef(true);

  useEffect(() => {
    materialModeRef.current = materialMode;
    wireframeRef.current = wireframe;
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // Professional clean dental CAD viewport background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x131d2e);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 3000);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: window.devicePixelRatio <= 1.25,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.85;
    controls.zoomSpeed = 1.2;
    controlsRef.current = controls;

    // ─── High-Definition Clinical Studio Multi-Point Lighting ──────
    // 1. Ambient Light - Ensures zero pitch-black blind spots
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    // 2. Hemisphere Light - Natural top sky / bottom ground reflection
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x475569, 0.6);
    scene.add(hemiLight);

    // 3. Key Occlusal Light (Bright clean light for cusps and grooves)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.25);
    keyLight.position.set(30, 60, 45);
    scene.add(keyLight);

    // 4. Fill Light (Opposite side fill for soft, clear margin visibility)
    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.6);
    fillLight.position.set(-40, 25, -30);
    scene.add(fillLight);

    // 5. Margin Rim Light (Sharp edge & undercut definition)
    const rimLight = new THREE.DirectionalLight(0x93c5fd, 0.7);
    rimLight.position.set(0, -35, -50);
    scene.add(rimLight);

    // 6. Camera-Mounted Headlamp (Moves with user viewpoint to brightly illuminate deep preps)
    const headLight = new THREE.PointLight(0xffffff, 0.45, 1000);
    camera.add(headLight);
    scene.add(camera);

    function resize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderNeededRef.current = true;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to load model (${res.status})`);
        const buffer = await res.arrayBuffer();
        if (cancelled) return;
        const loader = (fileName || url).toLowerCase().endsWith('.ply')
          ? new PLYLoader()
          : new STLLoader();
        const geometry = loader.parse(buffer) as THREE.BufferGeometry;

        geometry.computeVertexNormals();
        geometry.center();
        geometry.computeBoundingBox();
        const bbox = geometry.boundingBox!;
        const size = new THREE.Vector3();
        bbox.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z) || 1;

        // High-fidelity clinical ceramic / zirconia shade material
        const mode = MATERIAL_MODES[materialModeRef.current];
        const material = new THREE.MeshStandardMaterial({
          color: mode.color,
          roughness: mode.roughness,
          metalness: mode.metalness,
          flatShading: false,
        });
        material.wireframe = wireframeRef.current;

        const mesh = new THREE.Mesh(geometry, material);
        meshRef.current = mesh;
        scene.add(mesh);

        const fitDist = (maxDim * 0.6) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
        camera.position.set(fitDist / 1.3, fitDist / 1.5, fitDist);
        camera.lookAt(0, 0, 0);
        controls.target.set(0, 0, 0);
        controls.update();

        defaultPosRef.current = {
          pos: camera.position.clone(),
          target: new THREE.Vector3(0, 0, 0),
        };

        if (cancelled) return;
        setLoading(false);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Could not load model');
        setLoading(false);
      }
    })();

    const markDirty = () => {
      renderNeededRef.current = true;
    };
    controls.addEventListener('change', markDirty);

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      controls.update();
      if (renderNeededRef.current) {
        renderNeededRef.current = false;
        renderer.render(scene, camera);
      }
    };
    loop();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      controls.removeEventListener('change', markDirty);
      ro.disconnect();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [url, fileName]);

  // Handle Material Color & Style Updates
  useEffect(() => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    const mode = MATERIAL_MODES[materialMode];
    mat.color.setHex(mode.color);
    mat.roughness = mode.roughness;
    mat.metalness = mode.metalness;
    mat.wireframe = wireframe;
    mat.needsUpdate = true;
    renderNeededRef.current = true;
  }, [materialMode, wireframe]);

  function resetView() {
    if (!cameraRef.current || !controlsRef.current || !defaultPosRef.current) return;
    cameraRef.current.position.copy(defaultPosRef.current.pos);
    controlsRef.current.target.copy(defaultPosRef.current.target);
    controlsRef.current.update();
  }

  function setViewAngle(x: number, y: number, z: number) {
    if (!cameraRef.current || !controlsRef.current) return;
    const dist = cameraRef.current.position.length();
    cameraRef.current.position.set(x * dist, y * dist, z * dist);
    cameraRef.current.lookAt(0, 0, 0);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  }

  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[#131d2e] shadow-xl">
      <div ref={containerRef} className="h-full w-full cursor-grab active:cursor-grabbing" />

      {/* Floating Toolbar Controls */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-1.5 rounded-xl border border-[rgba(42,127,255,0.25)] bg-[#0E1B2A]/90 p-1.5 shadow-lg backdrop-blur-md">
        <button
          type="button"
          onClick={() => setMaterialMode('ceramic')}
          title="Ceramic Ivory Mode"
          className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
            materialMode === 'ceramic'
              ? 'bg-[var(--accent)] text-white shadow-sm'
              : 'text-[var(--text-muted)] hover:text-white'
          }`}
        >
          🦷 Ceramic
        </button>
        <button
          type="button"
          onClick={() => setMaterialMode('stone')}
          title="Dental Die Stone Mode"
          className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
            materialMode === 'stone'
              ? 'bg-[#c59b67] text-white shadow-sm'
              : 'text-[var(--text-muted)] hover:text-white'
          }`}
        >
          🏛️ Stone
        </button>
        <button
          type="button"
          onClick={() => setMaterialMode('contrast')}
          title="High Contrast Cyan"
          className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
            materialMode === 'contrast'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-[var(--text-muted)] hover:text-white'
          }`}
        >
          💎 Contrast
        </button>
        <button
          type="button"
          onClick={() => setWireframe(!wireframe)}
          title="Toggle Wireframe Mesh"
          className={`rounded-lg border px-2 py-1 text-xs font-bold transition ${
            wireframe
              ? 'border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--accent-light)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-white'
          }`}
        >
          🕸️ Wire
        </button>
      </div>

      {/* Quick View Angle Buttons */}
      <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 rounded-xl border border-[rgba(42,127,255,0.25)] bg-[#0E1B2A]/90 p-1.5 shadow-lg backdrop-blur-md">
        <button
          type="button"
          onClick={() => setViewAngle(0, 1, 0.2)}
          className="rounded-lg px-2 py-1 text-xs font-semibold text-[var(--text-muted)] hover:bg-[#123B6B]/40 hover:text-white"
          title="Occlusal View (Top)"
        >
          Top
        </button>
        <button
          type="button"
          onClick={() => setViewAngle(0, 0.2, 1)}
          className="rounded-lg px-2 py-1 text-xs font-semibold text-[var(--text-muted)] hover:bg-[#123B6B]/40 hover:text-white"
          title="Buccal / Front View"
        >
          Front
        </button>
        <button
          type="button"
          onClick={() => setViewAngle(1, 0.2, 0)}
          className="rounded-lg px-2 py-1 text-xs font-semibold text-[var(--text-muted)] hover:bg-[#123B6B]/40 hover:text-white"
          title="Lateral / Side View"
        >
          Side
        </button>
        <button
          type="button"
          onClick={resetView}
          className="rounded-lg bg-[var(--accent-dim)] px-2.5 py-1 text-xs font-bold text-[var(--accent-light)] hover:bg-[var(--accent)] hover:text-white transition"
          title="Reset Camera Position"
        >
          ⟲ Reset
        </button>
      </div>

      {loading && !error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#131d2e]/80 backdrop-blur-sm text-xs font-bold text-white gap-2">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
          <span>Rendering 3D model with clinical studio lighting…</span>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#131d2e] p-4">
          <p className="max-w-xs text-center text-xs font-bold text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
