/**
 * 3D Universe Interactive Simulation Canvas using Three.js
 * Visualizes Galaxies, Stars, Civilizations, Light Waves, and 3D Search Sphere
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Globe,
  Radio,
  Play,
  Pause,
  FastForward,
  StepForward,
  Compass,
  Sparkles,
  Layers,
  Search,
  Eye
} from 'lucide-react';
import {
  Civilization,
  Galaxy,
  Star,
  SearchRound,
  SimulationParams,
  SimulationStats
} from '../types/simulation';

interface Universe3DCanvasProps {
  civilizations: Civilization[];
  galaxies?: Galaxy[];
  stars?: Star[];
  stats: SimulationStats | null;
  params: SimulationParams;
  onSelectCivilization: (civ: Civilization) => void;
  isRunning: boolean;
}

export const Universe3DCanvas: React.FC<Universe3DCanvasProps> = ({
  civilizations,
  galaxies = [],
  stars = [],
  stats,
  params,
  onSelectCivilization,
  isRunning
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Interactive 3D Objects
  const searchSphereMeshRef = useRef<THREE.Mesh | null>(null);
  const searchRingMeshRef = useRef<THREE.LineLoop | null>(null);
  const civPointsRef = useRef<THREE.Points | null>(null);
  const civPositionsRef = useRef<Float32Array | null>(null);
  const civColorsRef = useRef<Float32Array | null>(null);
  const signalWavesGroupRef = useRef<THREE.Group | null>(null);

  // Camera Animation State
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 800, 1800));
  const targetCamLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const currentCamLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // Simulation Time & Wave Animation
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [visualSpeed, setVisualSpeed] = useState<number>(1.0);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [currentSearchRadius, setCurrentSearchRadius] = useState<number>(25000);
  const [searchCoverage, setSearchCoverage] = useState<string>('all_galaxies');
  const [cameraFocusMode, setCameraFocusMode] = useState<string>('universe');

  const waveProgressRef = useRef<number>(0);
  const physicalEpochRef = useRef<number>(params.simulationEpoch);

  // Touch / Drag controls
  const isPointerDownRef = useRef<boolean>(false);
  const pointerStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const sphericalRef = useRef<THREE.Spherical>(new THREE.Spherical(2000, Math.PI / 3, Math.PI / 4));

  // Initialize Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 450;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x050813);
    scene.fog = new THREE.FogExp2(0x050813, 0.00015);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(50, width / height, 1, 50000);
    camera.position.set(0, 1000, 2200);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0x223355, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xfff5d0, 2.5, 3000);
    sunLight.position.set(0, 50, 0);
    scene.add(sunLight);

    // 5. Earth & Solar System Marker
    const earthGroup = new THREE.Group();
    earthGroup.name = 'EarthSystem';

    // Earth Sphere (Glowing Cyan-Blue)
    const earthGeo = new THREE.SphereGeometry(14, 24, 24);
    const earthMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    // Earth Atmosphere / Halo
    const earthGlowGeo = new THREE.SphereGeometry(22, 16, 16);
    const earthGlowMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.35,
      wireframe: true
    });
    const earthGlow = new THREE.Mesh(earthGlowGeo, earthGlowMat);
    earthGroup.add(earthGlow);

    // Coordinate Ring at Earth
    const earthRingGeo = new THREE.RingGeometry(26, 28, 32);
    const earthRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6
    });
    const earthRing = new THREE.Mesh(earthRingGeo, earthRingMat);
    earthRing.rotation.x = Math.PI / 2;
    earthGroup.add(earthRing);

    scene.add(earthGroup);

    // 6. Deep Cosmic Starfield & Background Nebula
    const starCount = 3500;
    const bgStarGeo = new THREE.BufferGeometry();
    const bgStarPos = new Float32Array(starCount * 3);
    const bgStarColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 8000 + Math.random() * 8000;

      const sinPhi = Math.sin(phi);
      bgStarPos[i * 3] = r * sinPhi * Math.cos(theta);
      bgStarPos[i * 3 + 1] = r * sinPhi * Math.sin(theta);
      bgStarPos[i * 3 + 2] = r * Math.cos(phi);

      // Star colors (Blue, White, Pale Yellow)
      const colorRoll = Math.random();
      if (colorRoll > 0.8) {
        bgStarColors[i * 3] = 0.6;
        bgStarColors[i * 3 + 1] = 0.8;
        bgStarColors[i * 3 + 2] = 1.0;
      } else if (colorRoll > 0.4) {
        bgStarColors[i * 3] = 0.9;
        bgStarColors[i * 3 + 1] = 0.9;
        bgStarColors[i * 3 + 2] = 1.0;
      } else {
        bgStarColors[i * 3] = 1.0;
        bgStarColors[i * 3 + 1] = 0.85;
        bgStarColors[i * 3 + 2] = 0.6;
      }
    }
    bgStarGeo.setAttribute('position', new THREE.BufferAttribute(bgStarPos, 3));
    bgStarGeo.setAttribute('color', new THREE.BufferAttribute(bgStarColors, 3));

    const bgStarMat = new THREE.PointsMaterial({
      size: 3.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.65
    });
    const bgStars = new THREE.Points(bgStarGeo, bgStarMat);
    scene.add(bgStars);

    // 7. Cosmic Web Filaments (Subtle lines)
    const webLinesMat = new THREE.LineBasicMaterial({
      color: 0x1e293b,
      transparent: true,
      opacity: 0.35
    });
    const webGeo = new THREE.BufferGeometry();
    const webPoints: number[] = [];
    for (let w = 0; w < 40; w++) {
      const x1 = (Math.random() - 0.5) * 6000;
      const y1 = (Math.random() - 0.5) * 1200;
      const z1 = (Math.random() - 0.5) * 6000;
      const x2 = x1 + (Math.random() - 0.5) * 2000;
      const y2 = y1 + (Math.random() - 0.5) * 600;
      const z2 = z1 + (Math.random() - 0.5) * 2000;
      webPoints.push(x1, y1, z1, x2, y2, z2);
    }
    webGeo.setAttribute('position', new THREE.Float32BufferAttribute(webPoints, 3));
    const webMesh = new THREE.LineSegments(webGeo, webLinesMat);
    scene.add(webMesh);

    // 8. Milky Way Spiral Disk (Logarithmic particles)
    const mwArmCount = 4;
    const mwStarCount = 5000;
    const mwGeo = new THREE.BufferGeometry();
    const mwPos = new Float32Array(mwStarCount * 3);
    const mwColors = new Float32Array(mwStarCount * 3);

    for (let i = 0; i < mwStarCount; i++) {
      // Bulge vs Arms
      if (i < 1200) {
        // Galactic core
        const r = Math.pow(Math.random(), 2) * 200;
        const th = Math.random() * Math.PI * 2;
        mwPos[i * 3] = r * Math.cos(th);
        mwPos[i * 3 + 1] = (Math.random() - 0.5) * 70;
        mwPos[i * 3 + 2] = r * Math.sin(th);

        // Core bright yellow-white
        mwColors[i * 3] = 1.0;
        mwColors[i * 3 + 1] = 0.95;
        mwColors[i * 3 + 2] = 0.7;
      } else {
        // Spiral arms
        const arm = Math.floor(Math.random() * mwArmCount);
        const armAngle = (arm * Math.PI * 2) / mwArmCount;
        const dist = 150 + Math.random() * 850;
        const curve = dist * 0.0035;
        const angle = armAngle + curve + (Math.random() - 0.5) * 0.45;

        mwPos[i * 3] = Math.cos(angle) * dist;
        mwPos[i * 3 + 1] = (Math.random() - 0.5) * (35 * (1 - dist / 1100));
        mwPos[i * 3 + 2] = Math.sin(angle) * dist;

        // Arm bluish-cyan stars
        mwColors[i * 3] = 0.4 + Math.random() * 0.3;
        mwColors[i * 3 + 1] = 0.6 + Math.random() * 0.4;
        mwColors[i * 3 + 2] = 0.9 + Math.random() * 0.1;
      }
    }
    mwGeo.setAttribute('position', new THREE.BufferAttribute(mwPos, 3));
    mwGeo.setAttribute('color', new THREE.BufferAttribute(mwColors, 3));
    const mwMat = new THREE.PointsMaterial({
      size: 4,
      vertexColors: true,
      transparent: true,
      opacity: 0.7
    });
    const mwPoints = new THREE.Points(mwGeo, mwMat);
    scene.add(mwPoints);

    // 9. Other Galaxies (Andromeda, Triangulum, LMC, SMC)
    const galaxiesGroup = new THREE.Group();
    galaxiesGroup.name = 'ExternalGalaxies';

    const extGalaxiesData = [
      { name: 'Andromeda (M31)', pos: [1400, 350, -800], color: 0x93c5fd, size: 300 },
      { name: 'Triangulum (M33)', pos: [-1200, -200, 1100], color: 0x67e8f9, size: 180 },
      { name: 'LMC Dwarf', pos: [-600, -550, -600], color: 0xfde047, size: 140 },
      { name: 'SMC Dwarf', pos: [-750, -700, -400], color: 0xf472b6, size: 100 }
    ];

    extGalaxiesData.forEach((g) => {
      const gGeo = new THREE.BufferGeometry();
      const gStarCount = 600;
      const gPos = new Float32Array(gStarCount * 3);
      for (let s = 0; s < gStarCount; s++) {
        const rad = Math.pow(Math.random(), 1.5) * g.size;
        const th = Math.random() * Math.PI * 2;
        gPos[s * 3] = g.pos[0] + Math.cos(th) * rad;
        gPos[s * 3 + 1] = g.pos[1] + (Math.random() - 0.5) * (rad * 0.3);
        gPos[s * 3 + 2] = g.pos[2] + Math.sin(th) * rad;
      }
      gGeo.setAttribute('position', new THREE.BufferAttribute(gPos, 3));
      const gMat = new THREE.PointsMaterial({
        size: 3.5,
        color: g.color,
        transparent: true,
        opacity: 0.65
      });
      galaxiesGroup.add(new THREE.Points(gGeo, gMat));
    });
    scene.add(galaxiesGroup);

    // 10. Expanding 3D Search Wave (Yellow transparent sphere & ring)
    const searchSphereGeo = new THREE.SphereGeometry(1, 32, 32);
    const searchSphereMat = new THREE.MeshBasicMaterial({
      color: 0xeab308,
      transparent: true,
      opacity: 0.12,
      wireframe: true
    });
    const searchSphere = new THREE.Mesh(searchSphereGeo, searchSphereMat);
    searchSphere.visible = true;
    scene.add(searchSphere);
    searchSphereMeshRef.current = searchSphere;

    // Glowing yellow wave leading-edge ring
    const ringPts: THREE.Vector3[] = [];
    const ringSegments = 64;
    for (let r = 0; r <= ringSegments; r++) {
      const theta = (r / ringSegments) * Math.PI * 2;
      ringPts.push(new THREE.Vector3(Math.cos(theta), 0, Math.sin(theta)));
    }
    const searchRingGeo = new THREE.BufferGeometry().setFromPoints(ringPts);
    const searchRingMat = new THREE.LineBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.85,
      linewidth: 2
    });
    const searchRing = new THREE.LineLoop(searchRingGeo, searchRingMat);
    scene.add(searchRing);
    searchRingMeshRef.current = searchRing;

    // 11. Signal Waves Group (for animated emitted signal paths)
    const sigGroup = new THREE.Group();
    scene.add(sigGroup);
    signalWavesGroupRef.current = sigGroup;

    // Resize Handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, []);

  // Update Civilizations 3D Particle Cloud when civilizations data changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || civilizations.length === 0) return;

    // Remove existing civ points if present
    if (civPointsRef.current) {
      scene.remove(civPointsRef.current);
      civPointsRef.current.geometry.dispose();
      (civPointsRef.current.material as THREE.Material).dispose();
      civPointsRef.current = null;
    }

    // Limit rendered 3D particles to 12,000 for smooth 60fps on mobile GPUs
    const sampleLimit = Math.min(12000, civilizations.length);
    const step = Math.max(1, Math.floor(civilizations.length / sampleLimit));
    const renderCount = Math.ceil(civilizations.length / step);

    const positions = new Float32Array(renderCount * 3);
    const colors = new Float32Array(renderCount * 3);
    const sizes = new Float32Array(renderCount);

    const maxDist = params.maxDistance || 100000;
    // Scale universe coordinates to ~1400 Three.js coordinate units
    const coordScale = 1400 / maxDist;

    let idx = 0;
    for (let i = 0; i < civilizations.length && idx < renderCount; i += step) {
      const civ = civilizations[i];
      const r = civ.distance * coordScale;
      const x = Math.cos(civ.angle) * r;
      const z = Math.sin(civ.angle) * r;
      const y = (civ.z || 0) * (r * 0.15);

      positions[idx * 3] = x;
      positions[idx * 3 + 1] = y;
      positions[idx * 3 + 2] = z;

      // Color coding based on Civilization Status & Detection
      if (civ.detected) {
        // Bright Gold / Yellow (Detected Technosignature)
        colors[idx * 3] = 0.95;
        colors[idx * 3 + 1] = 0.75;
        colors[idx * 3 + 2] = 0.05;
        sizes[idx] = 7.5;
      } else if (civ.currentState === 'active') {
        // Electric Cyan (Active in Present, not yet detected at Earth)
        colors[idx * 3] = 0.22;
        colors[idx * 3 + 1] = 0.74;
        colors[idx * 3 + 2] = 0.97;
        sizes[idx] = 5.0;
      } else if (civ.currentState === 'developing') {
        // Soft Teal (Emerging Civilization)
        colors[idx * 3] = 0.18;
        colors[idx * 3 + 1] = 0.83;
        colors[idx * 3 + 2] = 0.75;
        sizes[idx] = 4.0;
      } else if (civ.currentState === 'evolved') {
        // Purple / Magenta (Transcended / Advanced Communication)
        colors[idx * 3] = 0.75;
        colors[idx * 3 + 1] = 0.52;
        colors[idx * 3 + 2] = 0.98;
        sizes[idx] = 6.0;
      } else if (civ.currentState === 'collapsed') {
        // Crimson / Muted Red (Collapsed / Extinct)
        colors[idx * 3] = 0.94;
        colors[idx * 3 + 1] = 0.27;
        colors[idx * 3 + 2] = 0.27;
        sizes[idx] = 3.5;
      } else {
        // Slate / Undetectable
        colors[idx * 3] = 0.4;
        colors[idx * 3 + 1] = 0.45;
        colors[idx * 3 + 2] = 0.55;
        sizes[idx] = 3.0;
      }

      idx++;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 5.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.95
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);
    civPointsRef.current = points;
    civPositionsRef.current = positions;
    civColorsRef.current = colors;
  }, [civilizations, params.maxDistance]);

  // Main 3D Animation & Render Loop
  useEffect(() => {
    let lastTime = performance.now();

    const animate = (time: number) => {
      animFrameRef.current = requestAnimationFrame(animate);

      const delta = (time - lastTime) / 1000;
      lastTime = time;

      const scene = sceneRef.current;
      const camera = cameraRef.current;
      const renderer = rendererRef.current;
      if (!scene || !camera || !renderer) return;

      // 1. Advance Wave Animation (Visual animation speed clearly separated from physical $c$)
      if (!isPaused && !isRunning) {
        waveProgressRef.current += delta * 0.15 * visualSpeed;
        if (waveProgressRef.current > 1.0) {
          waveProgressRef.current = 0.05;
        }
      }

      // Update 3D Search Sphere scale & position
      const maxDist = params.maxDistance || 100000;
      const coordScale = 1400 / maxDist;
      const currentSimRadiusLy = waveProgressRef.current * maxDist;
      setCurrentSearchRadius(Math.round(currentSimRadiusLy));

      const scaledWaveRadius = Math.max(10, currentSimRadiusLy * coordScale);

      if (searchSphereMeshRef.current) {
        searchSphereMeshRef.current.scale.set(scaledWaveRadius, scaledWaveRadius, scaledWaveRadius);
      }
      if (searchRingMeshRef.current) {
        searchRingMeshRef.current.scale.set(scaledWaveRadius, 1, scaledWaveRadius);
      }

      // Smooth camera interpolation towards target position & lookAt
      camera.position.lerp(targetCamPosRef.current, 0.05);
      currentCamLookAtRef.current.lerp(targetCamLookAtRef.current, 0.05);
      camera.lookAt(currentCamLookAtRef.current);

      renderer.render(scene, camera);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPaused, isRunning, visualSpeed, params.maxDistance]);

  // Camera Focus Preset Handler
  const handleFocusTarget = (mode: string) => {
    setCameraFocusMode(mode);
    const maxDist = params.maxDistance || 100000;
    const coordScale = 1400 / maxDist;

    if (mode === 'earth') {
      targetCamPosRef.current.set(0, 80, 180);
      targetCamLookAtRef.current.set(0, 0, 0);
    } else if (mode === 'milkyway') {
      targetCamPosRef.current.set(0, 500, 950);
      targetCamLookAtRef.current.set(0, 0, 0);
    } else if (mode === 'andromeda') {
      targetCamPosRef.current.set(1400, 550, -400);
      targetCamLookAtRef.current.set(1400, 350, -800);
    } else if (mode === 'detected') {
      const firstDet = civilizations.find((c) => c.detected);
      if (firstDet) {
        const r = firstDet.distance * coordScale;
        const x = Math.cos(firstDet.angle) * r;
        const z = Math.sin(firstDet.angle) * r;
        targetCamPosRef.current.set(x + 50, 40, z + 70);
        targetCamLookAtRef.current.set(x, 0, z);
      } else {
        targetCamPosRef.current.set(0, 500, 1100);
        targetCamLookAtRef.current.set(0, 0, 0);
      }
    } else {
      // Full Universe view
      targetCamPosRef.current.set(0, 1200, 2200);
      targetCamLookAtRef.current.set(0, 0, 0);
    }
  };

  // Zoom controls
  const handleZoom = (direction: 'in' | 'out') => {
    const factor = direction === 'in' ? 0.75 : 1.35;
    targetCamPosRef.current.multiplyScalar(factor);
  };

  // Touch and Mouse Orbit Controls on Canvas
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isPointerDownRef.current = true;
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current || !cameraRef.current) return;

    const deltaX = e.clientX - pointerStartRef.current.x;
    const deltaY = e.clientY - pointerStartRef.current.y;
    pointerStartRef.current = { x: e.clientX, y: e.clientY };

    // Orbit angles update
    sphericalRef.current.setFromVector3(targetCamPosRef.current);
    sphericalRef.current.theta -= deltaX * 0.005;
    sphericalRef.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, sphericalRef.current.phi - deltaY * 0.005));

    targetCamPosRef.current.setFromSpherical(sphericalRef.current);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isPointerDownRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
  };

  // 3D Raycasting for Tapping Stars / Civilizations to open Bottom Sheet
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = mountRef.current;
    const camera = cameraRef.current;
    if (!container || !camera || civilizations.length === 0) return;

    const rect = container.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.params.Points = { threshold: 25 }; // Mobile finger tap threshold
    raycaster.setFromCamera(mouse, camera);

    if (civPointsRef.current) {
      const intersects = raycaster.intersectObject(civPointsRef.current);
      if (intersects.length > 0 && intersects[0].index !== undefined) {
        const index = intersects[0].index;
        const step = Math.max(1, Math.floor(civilizations.length / Math.min(12000, civilizations.length)));
        const civIndex = Math.min(civilizations.length - 1, index * step);
        const selected = civilizations[civIndex];
        if (selected) {
          onSelectCivilization(selected);
          return;
        }
      }
    }

    // Default to closest civilization if clicking near detected
    const firstDet = civilizations.find((c) => c.detected);
    if (firstDet && Math.random() > 0.5) {
      onSelectCivilization(firstDet);
    }
  };

  // Multi-round step button
  const handleAdvanceRound = () => {
    const nextRound = (currentRound % (params.searchRounds || 4)) + 1;
    setCurrentRound(nextRound);
    waveProgressRef.current = nextRound / (params.searchRounds || 4);
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-cyan-900/60 bg-[#050813] shadow-2xl">
      {/* 3D WebGL Canvas Mount Container */}
      <div
        ref={mountRef}
        className="w-full h-[440px] sm:h-[500px] cursor-grab active:cursor-grabbing touch-none select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleClick}
      />

      {/* Floating HUD Layer 1: Top Status Banner */}
      <div className="absolute top-2 left-2 right-2 pointer-events-none flex items-center justify-between gap-2 z-10">
        <div className="bg-slate-900/85 backdrop-blur-md border border-cyan-800/60 rounded-xl px-2.5 py-1.5 shadow-lg flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <div>
            <div className="text-[11px] font-bold text-slate-100 flex items-center gap-1 font-tech">
              <span>3D UNIVERSE SIMULATION</span>
              <span className="text-cyan-400">c = 1.0 ly/yr</span>
            </div>
            <div className="text-[10px] text-slate-300 font-mono">
              Search Wave: <b className="text-yellow-400">{currentSearchRadius.toLocaleString()} ly</b> (Round {currentRound})
            </div>
          </div>
        </div>

        <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl px-2.5 py-1.5 shadow-lg text-right font-mono text-[10px]">
          <div className="text-slate-400">Civilizations</div>
          <div className="text-emerald-400 font-bold">
            {stats?.detectedCount ?? 0} Detected
          </div>
        </div>
      </div>

      {/* Floating HUD Layer 2: Camera Controls (Top Right Vertical Stack) */}
      <div className="absolute top-14 right-2 z-20 flex flex-col gap-1.5 pointer-events-auto">
        <button
          onClick={() => handleZoom('in')}
          title="Zoom In"
          className="w-9 h-9 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700 hover:border-cyan-500 text-slate-200 flex items-center justify-center shadow-lg active:scale-95 transition-all"
        >
          <ZoomIn className="w-4 h-4 text-cyan-400" />
        </button>
        <button
          onClick={() => handleZoom('out')}
          title="Zoom Out"
          className="w-9 h-9 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700 hover:border-cyan-500 text-slate-200 flex items-center justify-center shadow-lg active:scale-95 transition-all"
        >
          <ZoomOut className="w-4 h-4 text-cyan-400" />
        </button>
        <button
          onClick={() => handleFocusTarget('universe')}
          title="Reset Camera"
          className="w-9 h-9 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700 hover:border-cyan-500 text-slate-200 flex items-center justify-center shadow-lg active:scale-95 transition-all"
        >
          <RotateCcw className="w-4 h-4 text-slate-300" />
        </button>
      </div>

      {/* Floating HUD Layer 3: Camera Focus Presets Bar */}
      <div className="absolute top-14 left-2 z-20 flex flex-wrap gap-1 max-w-[210px] pointer-events-auto">
        <button
          onClick={() => handleFocusTarget('earth')}
          className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
            cameraFocusMode === 'earth'
              ? 'bg-cyan-500 text-slate-950 border-cyan-400'
              : 'bg-slate-900/80 text-cyan-300 border-cyan-800/60 hover:bg-slate-800'
          }`}
        >
          โลก (Earth)
        </button>
        <button
          onClick={() => handleFocusTarget('milkyway')}
          className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
            cameraFocusMode === 'milkyway'
              ? 'bg-cyan-500 text-slate-950 border-cyan-400'
              : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800'
          }`}
        >
          ทางช้างเผือก
        </button>
        <button
          onClick={() => handleFocusTarget('andromeda')}
          className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
            cameraFocusMode === 'andromeda'
              ? 'bg-cyan-500 text-slate-950 border-cyan-400'
              : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800'
          }`}
        >
          Andromeda
        </button>
        <button
          onClick={() => handleFocusTarget('detected')}
          className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
            cameraFocusMode === 'detected'
              ? 'bg-yellow-500 text-slate-950 border-yellow-400'
              : 'bg-slate-900/80 text-yellow-300 border-yellow-800/60 hover:bg-slate-800'
          }`}
        >
          ส่องจุดตรวจพบ
        </button>
      </div>

      {/* Floating HUD Layer 4: Interactive Timeline & Simulation Controls (Bottom Bar) */}
      <div className="absolute bottom-2 left-2 right-2 z-20 pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-2 sm:p-2.5 shadow-2xl flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 text-[11px]">
          {/* Play/Pause & Step Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsPaused((p) => !p)}
              className="p-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
              title={isPaused ? 'Play' : 'Pause'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
            </button>
            <button
              onClick={() => {
                waveProgressRef.current = Math.min(1.0, waveProgressRef.current + 0.05);
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
              title="Step Wave Forward"
            >
              <StepForward className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleAdvanceRound}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-[11px] flex items-center gap-1 min-h-[32px]"
              title="Trigger Next Search Round"
            >
              <Search className="w-3 h-3 text-amber-400" />
              <span>Next Round (+1)</span>
            </button>
          </div>

          {/* Visual Speed Multiplier */}
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
            <span>Visual Speed:</span>
            {[0.5, 1, 2, 5].map((s) => (
              <button
                key={s}
                onClick={() => setVisualSpeed(s)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  visualSpeed === s
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Legend / Status Colors Guide */}
        <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] text-slate-300 pt-1 border-t border-slate-800/80">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_6px_#facc15]" />
              ตรวจพบ (Detected)
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              อารยธรรมปัจจุบัน
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              วิวัฒนาการสูง
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              ล่มสลายแล้ว
            </span>
          </div>
          <span className="text-slate-400 italic">แตะที่ดาวหรืออารยธรรมเพื่อดูประวัติลึก</span>
        </div>
      </div>
    </div>
  );
};
