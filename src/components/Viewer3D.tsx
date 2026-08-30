'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';

export default function Viewer3D({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);
    camera.position.set(30, 30, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const hemi = new THREE.HemisphereLight(0xffffff, 0x334155, 1);
    const dir = new THREE.DirectionalLight(0xffffff, 1.2);
    dir.position.set(20, 40, 30);
    scene.add(hemi, dir);

    const low = new THREE.DirectionalLight(0xffffff, 0.5);
    low.position.set(-20, -10, -20);
    scene.add(low);

    function resize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
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
        const loader = url.toLowerCase().endsWith('.ply')
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

        const material = new THREE.MeshStandardMaterial({
          color: 0x8ab4f8,
          metalness: 0.1,
          roughness: 0.6,
          flatShading: true,
        });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        const fitDist = (maxDim * 3.2) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
        camera.position.set(fitDist / 1.4, fitDist / 1.8, fitDist);
        camera.lookAt(0, 0, 0);
        controls.target.set(0, 0, 0);
        controls.update();

        if (cancelled) return;
        setLoading(false);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || 'Could not load model');
        setLoading(false);
      }
    })();

    let raf = 0;
    const loop = () => {
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [url]);

  return (
    <div ref={containerRef} className="relative h-[380px] w-full overflow-hidden rounded-lg bg-slate-900">
      {loading && !error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center text-sm text-slate-300">
          Loading 3D model…
        </div>
      )}
      {error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900">
          <p className="max-w-xs text-center text-sm text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
