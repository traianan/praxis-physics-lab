import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Eye, Pause, Play, RotateCcw, Waves } from 'lucide-react';
import { ExcitationTechnique, NotationSystem } from '../types/guitar';
import { formatMidiLabel, harmonicAmplitudes } from '../utils/musicTheory';

export type VibrationModeSelection = 'composite' | 1 | 2 | 3 | 4 | 5 | 6;
type CameraPreset = 'perspective' | 'side' | 'top';

type StringVibration3DPanelProps = {
  frequency: number;
  stringId: number;
  fret: number;
  openMidi: number;
  gaugeMm: number;
  notation: NotationSystem;
  pickPosition: number;
  technique: ExcitationTechnique;
  lastPluckTimestamp: number;
  onPluckDemo: () => void;
};

const STRING_LENGTH_UNITS = 10.0; // X from -5.0 (nut/fret) to +5.0 (saddle)
const X_MIN = -STRING_LENGTH_UNITS / 2;
const X_MAX = STRING_LENGTH_UNITS / 2;
const SEGMENTS_X = 144;
const RADIAL_SEGMENTS = 10;
const BASE_VISUAL_AMP = 0.52;

const HARMONIC_MODE_LABELS: Record<Exclude<VibrationModeSelection, 'composite'>, string> = {
  1: 'Fundamentală (n = 1 · f₀)',
  2: 'Armonicul 2 (n = 2 · 2f₀)',
  3: 'Armonicul 3 (n = 3 · 3f₀)',
  4: 'Armonicul 4 (n = 4 · 4f₀)',
  5: 'Armonicul 5 (n = 5 · 5f₀)',
  6: 'Armonicul 6 (n = 6 · 6f₀)',
};

function techniqueToMode(technique: ExcitationTechnique): VibrationModeSelection {
  if (technique === 'harmonic_12') return 2;
  if (technique === 'harmonic_7') return 3;
  if (technique === 'harmonic_5') return 4;
  return 'composite';
}

export const StringVibration3DPanel: React.FC<StringVibration3DPanelProps> = ({
  frequency,
  stringId,
  fret,
  openMidi,
  gaugeMm,
  notation,
  pickPosition,
  technique,
  lastPluckTimestamp,
  onPluckDemo,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const [selectedMode, setSelectedMode] = useState<VibrationModeSelection>(1);
  const [followTechnique, setFollowTechnique] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [slowMoFactor, setSlowMoFactor] = useState<number>(1.0);
  const [amplitudeScale, setAmplitudeScale] = useState<number>(1.0);
  const [sustainedWave, setSustainedWave] = useState<boolean>(true);
  const [showEnvelope, setShowEnvelope] = useState<boolean>(true);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('perspective');
  const [webglError, setWebglError] = useState<string | null>(null);

  // Sync mode when technique changes if auto-follow is active
  useEffect(() => {
    if (followTechnique) {
      setSelectedMode(techniqueToMode(technique));
    }
  }, [technique, followTechnique]);

  const effectiveMode: VibrationModeSelection = followTechnique ? techniqueToMode(technique) : selectedMode;

  const compositeWeights = useMemo(() => harmonicAmplitudes(pickPosition, 6), [pickPosition]);

  const modeFrequency = useMemo(() => {
    if (effectiveMode === 'composite') return frequency;
    return frequency * effectiveMode;
  }, [frequency, effectiveMode]);

  const noteLabel = useMemo(
    () => formatMidiLabel(openMidi + fret, notation),
    [openMidi, fret, notation]
  );

  // Physics summary metrics
  const interiorNodesCount = effectiveMode === 'composite' ? 0 : effectiveMode - 1;
  const antinodesCount = effectiveMode === 'composite' ? 1 : effectiveMode;
  const periodMs = modeFrequency > 0 ? 1000 / modeFrequency : 0;
  // Speed of wave c = 2 * L_eff * f0 (L_eff = 0.65 * 2^(-fret/12))
  const effectiveLengthM = 0.65 * Math.pow(2, -fret / 12);
  const wavelengthM =
    effectiveMode === 'composite' ? 2 * effectiveLengthM : (2 * effectiveLengthM) / effectiveMode;

  // Live simulation parameters ref so the WebGL loop reads fresh React state without recreating scene
  const simStateRef = useRef({
    frequency,
    modeFrequency,
    effectiveMode,
    compositeWeights,
    pickPosition,
    gaugeMm,
    isPlaying,
    slowMoFactor,
    amplitudeScale,
    sustainedWave,
    showEnvelope,
    lastPluckTimestamp,
  });

  useEffect(() => {
    simStateRef.current = {
      frequency,
      modeFrequency,
      effectiveMode,
      compositeWeights,
      pickPosition,
      gaugeMm,
      isPlaying,
      slowMoFactor,
      amplitudeScale,
      sustainedWave,
      showEnvelope,
      lastPluckTimestamp,
    };
  }, [
    frequency,
    modeFrequency,
    effectiveMode,
    compositeWeights,
    pickPosition,
    gaugeMm,
    isPlaying,
    slowMoFactor,
    amplitudeScale,
    sustainedWave,
    showEnvelope,
    lastPluckTimestamp,
  ]);

  const cameraControlsApiRef = useRef<{
    applyPreset: (preset: CameraPreset) => void;
    triggerPluckImpulse: () => void;
  } | null>(null);

  // Trigger pluck energy burst whenever lastPluckTimestamp updates
  useEffect(() => {
    if (lastPluckTimestamp > 0) {
      cameraControlsApiRef.current?.triggerPluckImpulse();
    }
  }, [lastPluckTimestamp]);

  // Apply camera preset when changed
  useEffect(() => {
    cameraControlsApiRef.current?.applyPreset(cameraPreset);
  }, [cameraPreset]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      // Probe WebGL support safely before initializing full pipeline
      const probeCanvas = document.createElement('canvas');
      const probeGl = (probeCanvas.getContext('webgl2') ||
        probeCanvas.getContext('webgl') ||
        probeCanvas.getContext('experimental-webgl')) as
        | WebGL2RenderingContext
        | WebGLRenderingContext
        | null;
      if (!probeGl) {
        setWebglError('WebGL nu este disponibil în acest browser.');
        return;
      }

      const debugInfo = probeGl.getExtension('WEBGL_debug_renderer_info');
      const rendererStr = debugInfo
        ? String(probeGl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '')
        : String(probeGl.getParameter(probeGl.RENDERER) || '');
      const isSoftwareGl = /SwiftShader|llvmpipe|Software/i.test(rendererStr);

      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
        alpha: false,
      });
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.shadowMap.enabled = !isSoftwareGl;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      const initWidth = container.clientWidth || 720;
      const initHeight = container.clientHeight || 360;
      renderer.setSize(initWidth, initHeight);
      renderer.domElement.style.display = 'block';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      // Scene setup matching laboratory forest/sage theme with deep studio contrast
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x11201b);
      scene.fog = new THREE.Fog(0x11201b, 18, 36);

      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      const roomEnv = new RoomEnvironment();
      const envRT = pmremGenerator.fromScene(roomEnv, 0.04);
      scene.environment = envRT.texture;
      scene.environmentIntensity = 0.6;
      roomEnv.dispose();
      pmremGenerator.dispose();

      // Camera & OrbitControls
      const camera = new THREE.PerspectiveCamera(38, initWidth / initHeight, 0.1, 100);
      camera.position.set(0.8, 2.3, 8.6);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 0.1, 0);
      controls.enableDamping = !isSoftwareGl;
      controls.dampingFactor = 0.06;
      controls.minDistance = 4.2;
      controls.maxDistance = 16.5;
      controls.maxPolarAngle = Math.PI * 0.62;
      controls.minPolarAngle = 0.12;
      controls.update();

      // Lighting
      const hemiLight = new THREE.HemisphereLight(0xf3f7f4, 0x2c1b10, 0.55);
      scene.add(hemiLight);

      const keyLight = new THREE.DirectionalLight(0xfff4df, 1.55);
      keyLight.position.set(4.5, 7.5, 5.5);
      if (!isSoftwareGl) {
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 1024;
        keyLight.shadow.mapSize.height = 1024;
        keyLight.shadow.camera.near = 1;
        keyLight.shadow.camera.far = 22;
        keyLight.shadow.camera.left = -7;
        keyLight.shadow.camera.right = 7;
        keyLight.shadow.camera.top = 5;
        keyLight.shadow.camera.bottom = -5;
        keyLight.shadow.bias = -0.0005;
      }
      scene.add(keyLight);

      const rimLight = new THREE.DirectionalLight(0xaad5c6, 0.5);
      rimLight.position.set(-5.0, 3.0, -4.5);
      scene.add(rimLight);

      // Composite Multi-Part Acoustic Guitar Stage Group
      const guitarStage = new THREE.Group();
      scene.add(guitarStage);

      // Materials (varied roughness/metalness, no flat unlit boxes)
      const spruceMat = new THREE.MeshStandardMaterial({
        color: 0xc9965b,
        roughness: 0.42,
        metalness: 0.04,
      });
      const rosewoodMat = new THREE.MeshStandardMaterial({
        color: 0x3b2318,
        roughness: 0.62,
        metalness: 0.05,
      });
      const soundholeVoidMat = new THREE.MeshStandardMaterial({
        color: 0x0b100e,
        roughness: 0.95,
        metalness: 0.0,
      });
      const rosetteMat = new THREE.MeshStandardMaterial({
        color: 0xdfd2ba,
        roughness: 0.4,
        metalness: 0.12,
      });
      const boneMat = new THREE.MeshStandardMaterial({
        color: 0xf4efe3,
        roughness: 0.34,
        metalness: 0.04,
      });
      const fretMetalMat = new THREE.MeshStandardMaterial({
        color: 0xd6ddd9,
        roughness: 0.22,
        metalness: 0.88,
      });
      const stringBronzeMat = new THREE.MeshStandardMaterial({
        color: 0xe6a15c,
        roughness: 0.24,
        metalness: 0.86,
        emissive: 0x4b2109,
        emissiveIntensity: 0.25,
      });
      const nodeSphereMat = new THREE.MeshStandardMaterial({
        color: 0xd66b30,
        roughness: 0.25,
        metalness: 0.3,
        emissive: 0x7c2d12,
        emissiveIntensity: 0.45,
      });
      const pickMarkerMat = new THREE.MeshStandardMaterial({
        color: 0x2dd4bf,
        roughness: 0.3,
        metalness: 0.25,
        emissive: 0x0f766e,
        emissiveIntensity: 0.45,
      });

      // Acoustic body / soundboard (right side under the string)
      const soundboardGeo = new THREE.BoxGeometry(6.4, 0.28, 3.2);
      const soundboardMesh = new THREE.Mesh(soundboardGeo, spruceMat);
      soundboardMesh.position.set(2.4, -0.78, 0);
      soundboardMesh.receiveShadow = true;
      guitarStage.add(soundboardMesh);

      // Soundhole dark recess + decorative rosette ring
      const soundholeGeo = new THREE.CylinderGeometry(0.88, 0.88, 0.04, 40);
      const soundholeMesh = new THREE.Mesh(soundholeGeo, soundholeVoidMat);
      soundholeMesh.position.set(2.0, -0.635, 0);
      guitarStage.add(soundholeMesh);

      const rosetteGeo = new THREE.TorusGeometry(0.95, 0.035, 12, 48);
      const rosetteMesh = new THREE.Mesh(rosetteGeo, rosetteMat);
      rosetteMesh.rotation.x = Math.PI / 2;
      rosetteMesh.position.set(2.0, -0.63, 0);
      guitarStage.add(rosetteMesh);

      // Neck & Rosewood Fretboard (left side under string)
      const neckGeo = new THREE.BoxGeometry(5.6, 0.24, 1.05);
      const neckMesh = new THREE.Mesh(neckGeo, rosewoodMat);
      neckMesh.position.set(-2.6, -0.68, 0);
      neckMesh.receiveShadow = true;
      guitarStage.add(neckMesh);

      // Fret wires along the neck (frets 1..12 mapped proportionally within [-5.0, 0.0])
      const fretPositionsX: number[] = [];
      for (let f = 1; f <= 12; f++) {
        // Equal-tempered scale position x = L * (1 - 2^(-f/12))
        const frac = 1 - Math.pow(2, -f / 12);
        fretPositionsX.push(X_MIN + frac * STRING_LENGTH_UNITS);
      }
      const fretWireGeo = new THREE.CylinderGeometry(0.018, 0.018, 1.02, 10);
      const fretInstanced = new THREE.InstancedMesh(fretWireGeo, fretMetalMat, fretPositionsX.length);
      const dummyObj = new THREE.Object3D();
      fretPositionsX.forEach((fx, idx) => {
        dummyObj.position.set(fx, -0.555, 0);
        dummyObj.rotation.set(Math.PI / 2, 0, 0);
        dummyObj.updateMatrix();
        fretInstanced.setMatrixAt(idx, dummyObj.matrix);
      });
      fretInstanced.instanceMatrix.needsUpdate = true;
      guitarStage.add(fretInstanced);

      // Left Nut / Capo Boundary (at X_MIN = -5.0)
      const nutBaseGeo = new THREE.BoxGeometry(0.18, 0.62, 1.15);
      const nutBaseMesh = new THREE.Mesh(nutBaseGeo, boneMat);
      nutBaseMesh.position.set(X_MIN - 0.06, -0.28, 0);
      nutBaseMesh.castShadow = true;
      nutBaseMesh.receiveShadow = true;
      guitarStage.add(nutBaseMesh);

      // Right Rosewood Bridge + Bone Saddle (at X_MAX = +5.0)
      const bridgeBaseGeo = new THREE.BoxGeometry(0.55, 0.16, 1.55);
      const bridgeBaseMesh = new THREE.Mesh(bridgeBaseGeo, rosewoodMat);
      bridgeBaseMesh.position.set(X_MAX + 0.12, -0.56, 0);
      bridgeBaseMesh.castShadow = true;
      bridgeBaseMesh.receiveShadow = true;
      guitarStage.add(bridgeBaseMesh);

      const saddleGeo = new THREE.BoxGeometry(0.12, 0.56, 1.2);
      const saddleMesh = new THREE.Mesh(saddleGeo, boneMat);
      saddleMesh.position.set(X_MAX + 0.06, -0.24, 0);
      saddleMesh.castShadow = true;
      guitarStage.add(saddleMesh);

      const pinGeo = new THREE.CylinderGeometry(0.045, 0.03, 0.14, 12);
      const pinMesh = new THREE.Mesh(pinGeo, boneMat);
      pinMesh.position.set(X_MAX + 0.28, -0.45, 0);
      guitarStage.add(pinMesh);

      // Reference equilibrium axis line (dashed)
      const eqPoints = [new THREE.Vector3(X_MIN, 0, 0), new THREE.Vector3(X_MAX, 0, 0)];
      const eqGeo = new THREE.BufferGeometry().setFromPoints(eqPoints);
      const eqMat = new THREE.LineDashedMaterial({
        color: 0x6b8f82,
        dashSize: 0.18,
        gapSize: 0.12,
        transparent: true,
        opacity: 0.55,
      });
      const eqLine = new THREE.Line(eqGeo, eqMat);
      eqLine.computeLineDistances();
      scene.add(eqLine);

      // Dynamic 3D Tubular String Mesh (pre-allocated indexed BufferGeometry updated in-place)
      const ringCount = SEGMENTS_X + 1;
      const vertCount = ringCount * RADIAL_SEGMENTS;
      const stringPositions = new Float32Array(vertCount * 3);
      const stringNormals = new Float32Array(vertCount * 3);
      const stringIndices: number[] = [];

      for (let i = 0; i < SEGMENTS_X; i++) {
        for (let j = 0; j < RADIAL_SEGMENTS; j++) {
          const nextJ = (j + 1) % RADIAL_SEGMENTS;
          const a = i * RADIAL_SEGMENTS + j;
          const b = (i + 1) * RADIAL_SEGMENTS + j;
          const c = (i + 1) * RADIAL_SEGMENTS + nextJ;
          const d = i * RADIAL_SEGMENTS + nextJ;
          stringIndices.push(a, b, d);
          stringIndices.push(b, c, d);
        }
      }

      const stringGeo = new THREE.BufferGeometry();
      const posAttr = new THREE.BufferAttribute(stringPositions, 3);
      posAttr.setUsage(THREE.DynamicDrawUsage);
      const normAttr = new THREE.BufferAttribute(stringNormals, 3);
      normAttr.setUsage(THREE.DynamicDrawUsage);
      stringGeo.setAttribute('position', posAttr);
      stringGeo.setAttribute('normal', normAttr);
      stringGeo.setIndex(stringIndices);

      const stringMesh = new THREE.Mesh(stringGeo, stringBronzeMat);
      stringMesh.castShadow = true;
      // Avoid stale bounding sphere culling while deforming dynamically
      stringMesh.frustumCulled = false;
      scene.add(stringMesh);

      // Standing-wave upper & lower envelope curves (3D lines)
      const envUpperArr = new Float32Array(ringCount * 3);
      const envLowerArr = new Float32Array(ringCount * 3);
      const envUpperGeo = new THREE.BufferGeometry();
      const envLowerGeo = new THREE.BufferGeometry();
      const envUpperAttr = new THREE.BufferAttribute(envUpperArr, 3);
      envUpperAttr.setUsage(THREE.DynamicDrawUsage);
      const envLowerAttr = new THREE.BufferAttribute(envLowerArr, 3);
      envLowerAttr.setUsage(THREE.DynamicDrawUsage);
      envUpperGeo.setAttribute('position', envUpperAttr);
      envLowerGeo.setAttribute('position', envLowerAttr);

      const envMat = new THREE.LineBasicMaterial({
        color: 0x5eead4,
        transparent: true,
        opacity: 0.5,
      });
      const envUpperLine = new THREE.Line(envUpperGeo, envMat);
      const envLowerLine = new THREE.Line(envLowerGeo, envMat);
      envUpperLine.frustumCulled = false;
      envLowerLine.frustumCulled = false;
      scene.add(envUpperLine);
      scene.add(envLowerLine);

      // Pre-allocated pool of up to 5 interior nodal spheres (for n=2..6) + 2 boundary clamp rings
      const nodeGeo = new THREE.SphereGeometry(0.085, 18, 18);
      const nodeSpheres: THREE.Mesh[] = [];
      for (let k = 0; k < 5; k++) {
        const sphere = new THREE.Mesh(nodeGeo, nodeSphereMat);
        sphere.visible = false;
        scene.add(sphere);
        nodeSpheres.push(sphere);
      }

      // Pick position indicator cone (shown in composite mode)
      const pickConeGeo = new THREE.ConeGeometry(0.08, 0.24, 16);
      const pickCone = new THREE.Mesh(pickConeGeo, pickMarkerMat);
      pickCone.rotation.x = Math.PI;
      scene.add(pickCone);

      // Pre-allocated vectors for zero-GC animation loop
      const centerX = new Float32Array(ringCount);
      const centerY = new Float32Array(ringCount);
      const centerZ = new Float32Array(ringCount);
      const envProfile = new Float32Array(ringCount);
      const tangent = new THREE.Vector3();
      const normalVec = new THREE.Vector3();
      const binormalVec = new THREE.Vector3();
      const upHint = new THREE.Vector3(0, 0, 1);

      let simPhase = 0;
      let pluckBoost = 1.0;
      let prevTimestamp = performance.now();
      let rafId = 0;
      let timerId = 0;
      let disposed = false;

      // Expose camera preset & pluck burst helpers
      cameraControlsApiRef.current = {
        applyPreset: (preset: CameraPreset) => {
          if (preset === 'perspective') {
            camera.position.set(0.8, 2.3, 8.6);
            controls.target.set(0, 0.05, 0);
          } else if (preset === 'side') {
            camera.position.set(0, 0.15, 9.6);
            controls.target.set(0, 0.0, 0);
          } else {
            camera.position.set(0, 8.8, 0.8);
            controls.target.set(0, 0.0, 0);
          }
          controls.update();
        },
        triggerPluckImpulse: () => {
          pluckBoost = 1.35;
        },
      };

      const updateGeometryAndMarkers = (nowMs: number) => {
        const dt = Math.min(0.05, Math.max(0.001, (nowMs - prevTimestamp) / 1000));
        prevTimestamp = nowMs;

        const st = simStateRef.current;

        // Visual angular frequency smoothly scales with actual selected frequency (log + linear feel)
        // Base 110 Hz (A2) ~ 1.6 visual cycles/sec at 1x slow-mo; higher notes/harmonics oscillate noticeably faster
        const visualHz = Math.min(
          16.0,
          Math.max(0.45, 1.35 * Math.pow(st.modeFrequency / 110, 0.58) * st.slowMoFactor)
        );

        if (st.isPlaying) {
          simPhase += dt * visualHz * Math.PI * 2;
          if (simPhase > Math.PI * 2000) {
            simPhase -= Math.PI * 2000;
          }
        }

        // Pluck envelope decay
        if (st.sustainedWave) {
          pluckBoost += (1.0 - pluckBoost) * Math.min(1, dt * 3.2);
        } else {
          pluckBoost = Math.max(0.02, pluckBoost * Math.exp(-dt * 0.85));
        }

        const amp = BASE_VISUAL_AMP * st.amplitudeScale * pluckBoost;
        const radius = 0.022 + (st.gaugeMm - 0.3) * 0.016; // Realistic visual string thickness

        // Adjust string bronze/steel hue subtly based on wound vs plain strings
        if (st.gaugeMm < 0.55) {
          stringBronzeMat.color.setHex(0xdce4e0); // plain steel strings 1-2
        } else {
          stringBronzeMat.color.setHex(0xe59d58); // phosphor-bronze wound strings 3-6
        }

        // Compute string centerline & envelope profile
        for (let i = 0; i <= SEGMENTS_X; i++) {
          const u = i / SEGMENTS_X; // 0..1 along string
          const x = X_MIN + u * STRING_LENGTH_UNITS;
          centerX[i] = x;

          let yDisp = 0;
          let zDisp = 0;
          let maxEnv = 0;

          if (st.effectiveMode === 'composite') {
            // Superposition of modes n=1..6 weighted by pluck position
            for (let mIdx = 0; mIdx < st.compositeWeights.length; mIdx++) {
              const n = mIdx + 1;
              const w = st.compositeWeights[mIdx];
              const spatial = Math.sin(n * Math.PI * u);
              // Each harmonic oscillates at n * fundamental phase
              yDisp += w * spatial * Math.cos(n * simPhase);
              // Subtle orthogonal Z polarization so 3D orbital view clearly shows 3D motion
              zDisp += w * spatial * 0.24 * Math.sin(n * simPhase);
              maxEnv += Math.abs(w * spatial);
            }
            // Normalize envelope nicely around peak
            yDisp *= amp * 0.72;
            zDisp *= amp * 0.72;
            maxEnv *= amp * 0.72;
          } else {
            const n = st.effectiveMode;
            const spatial = Math.sin(n * Math.PI * u);
            yDisp = amp * spatial * Math.cos(simPhase);
            zDisp = amp * 0.22 * spatial * Math.sin(simPhase);
            maxEnv = amp * Math.abs(spatial);
          }

          centerY[i] = yDisp;
          centerZ[i] = zDisp;
          envProfile[i] = maxEnv;
        }

        // Sweep circular cross-sections along centerline to build smooth 3D tube
        for (let i = 0; i <= SEGMENTS_X; i++) {
          const iPrev = Math.max(0, i - 1);
          const iNext = Math.min(SEGMENTS_X, i + 1);
          tangent
            .set(
              centerX[iNext] - centerX[iPrev],
              centerY[iNext] - centerY[iPrev],
              centerZ[iNext] - centerZ[iPrev]
            )
            .normalize();

          binormalVec.crossVectors(tangent, upHint).normalize();
          if (binormalVec.lengthSq() < 0.0001) {
            binormalVec.set(0, 1, 0);
          }
          normalVec.crossVectors(binormalVec, tangent).normalize();

          const cx = centerX[i];
          const cy = centerY[i];
          const cz = centerZ[i];

          for (let j = 0; j < RADIAL_SEGMENTS; j++) {
            const theta = (j / RADIAL_SEGMENTS) * Math.PI * 2;
            const cosT = Math.cos(theta);
            const sinT = Math.sin(theta);

            const nx = normalVec.x * cosT + binormalVec.x * sinT;
            const ny = normalVec.y * cosT + binormalVec.y * sinT;
            const nz = normalVec.z * cosT + binormalVec.z * sinT;

            const vIdx = (i * RADIAL_SEGMENTS + j) * 3;
            stringPositions[vIdx] = cx + nx * radius;
            stringPositions[vIdx + 1] = cy + ny * radius;
            stringPositions[vIdx + 2] = cz + nz * radius;

            stringNormals[vIdx] = nx;
            stringNormals[vIdx + 1] = ny;
            stringNormals[vIdx + 2] = nz;
          }

          const lineIdx = i * 3;
          envUpperArr[lineIdx] = cx;
          envUpperArr[lineIdx + 1] = envProfile[i];
          envUpperArr[lineIdx + 2] = 0;

          envLowerArr[lineIdx] = cx;
          envLowerArr[lineIdx + 1] = -envProfile[i];
          envLowerArr[lineIdx + 2] = 0;
        }

        posAttr.needsUpdate = true;
        normAttr.needsUpdate = true;
        envUpperAttr.needsUpdate = true;
        envLowerAttr.needsUpdate = true;

        envUpperLine.visible = st.showEnvelope;
        envLowerLine.visible = st.showEnvelope;

        // Update interior node spheres for pure harmonics (n >= 2)
        const numInteriorNodes = st.effectiveMode === 'composite' ? 0 : st.effectiveMode - 1;
        for (let k = 0; k < nodeSpheres.length; k++) {
          if (k < numInteriorNodes && typeof st.effectiveMode === 'number') {
            const frac = (k + 1) / st.effectiveMode;
            nodeSpheres[k].position.set(X_MIN + frac * STRING_LENGTH_UNITS, 0, 0);
            nodeSpheres[k].visible = true;
          } else {
            nodeSpheres[k].visible = false;
          }
        }

        // Update pick position cone when showing composite wave
        if (st.effectiveMode === 'composite') {
          pickCone.visible = true;
          pickCone.position.set(X_MIN + st.pickPosition * STRING_LENGTH_UNITS, 0.72, 0);
        } else {
          pickCone.visible = false;
        }
      };

      const renderFrame = (nowMs: number) => {
        if (disposed) return;
        updateGeometryAndMarkers(nowMs);
        controls.update();
        renderer.render(scene, camera);
      };

      const scheduleNext = () => {
        if (disposed) return;
        if (isSoftwareGl) {
          timerId = window.setTimeout(() => {
            if (!disposed) {
              renderFrame(performance.now());
              scheduleNext();
            }
          }, 32);
        } else {
          rafId = window.requestAnimationFrame((t) => {
            renderFrame(t);
            scheduleNext();
          });
        }
      };

      // Responsive container resizing
      const resizeObserver = new ResizeObserver((entries) => {
        if (disposed) return;
        for (const entry of entries) {
          const w = Math.max(120, Math.floor(entry.contentRect.width));
          const h = Math.max(180, Math.floor(entry.contentRect.height));
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      });
      resizeObserver.observe(container);

      // Initial render + start loop
      renderFrame(performance.now());
      scheduleNext();

      return () => {
        disposed = true;
        cameraControlsApiRef.current = null;
        if (rafId) window.cancelAnimationFrame(rafId);
        if (timerId) window.clearTimeout(timerId);
        resizeObserver.disconnect();
        controls.dispose();

        // Dispose geometries & materials cleanly
        soundboardGeo.dispose();
        soundholeGeo.dispose();
        rosetteGeo.dispose();
        neckGeo.dispose();
        fretWireGeo.dispose();
        nutBaseGeo.dispose();
        bridgeBaseGeo.dispose();
        saddleGeo.dispose();
        pinGeo.dispose();
        eqGeo.dispose();
        stringGeo.dispose();
        envUpperGeo.dispose();
        envLowerGeo.dispose();
        nodeGeo.dispose();
        pickConeGeo.dispose();

        spruceMat.dispose();
        rosewoodMat.dispose();
        soundholeVoidMat.dispose();
        rosetteMat.dispose();
        boneMat.dispose();
        fretMetalMat.dispose();
        stringBronzeMat.dispose();
        nodeSphereMat.dispose();
        pickMarkerMat.dispose();
        eqMat.dispose();
        envMat.dispose();
        envRT.dispose();

        renderer.dispose();
      };
    } catch {
      setWebglError('Inițializarea motorului 3D WebGL a eșuat pe acest dispozitiv.');
    }
  }, []);

  return (
    <div className="rounded-xl border border-[#d8e2dc] bg-white p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-[#13221d]">
              Simulare 3D WebGL: Moduri de vibrație ale corzii
            </h3>
            <span className="rounded border border-[#c8dad1] bg-[#edf3f0] px-2 py-0.5 text-[11px] font-mono font-medium text-[#0d4a3e]">
              WebGL 3D
            </span>
          </div>
          <p className="text-xs text-[#53665f] mt-1">
            Animația este încetinită și amplitudinea vizuală este mărită. Componenta transversală 3D ajută la observarea modurilor, dar nu reprezintă o măsurare a deplasării reale. Trage sau atinge pentru a roti scena.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              onPluckDemo();
              cameraControlsApiRef.current?.triggerPluckImpulse();
            }}
            className="px-3 py-1.5 rounded-lg bg-[#0d4a3e] hover:bg-[#09362d] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Waves className="w-3.5 h-3.5" />
            <span>Ciupește și animă 3D</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="px-3 py-1.5 rounded-lg border border-[#d8e2dc] bg-[#fafcfa] hover:bg-[#edf3f0] text-xs font-medium text-[#13221d] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pauză' : 'Continuă'}</span>
          </button>
        </div>
      </div>

      {/* 4-KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f]">FRECVENȚĂ MOD (fₙ)</div>
          <div className="text-base font-bold text-[#13221d] mt-0.5 font-mono tabular-nums">
            {modeFrequency.toFixed(2)} Hz
          </div>
          <div className="text-[11px] text-[#53665f]">
            Coarda {stringId} · {noteLabel} (f₀ = {frequency.toFixed(1)} Hz)
          </div>
        </div>

        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f]">MOD DE VIBRAȚIE</div>
          <div className="text-sm font-bold text-[#0d4a3e] mt-1">
            {effectiveMode === 'composite'
              ? 'Mod compus (n=1…6)'
              : effectiveMode === 1
                ? 'Fundamentală (n = 1)'
                : `Armonicul ${effectiveMode} (${effectiveMode}f₀)`}
          </div>
        </div>

        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f]">NODURI / VENTRURI</div>
          <div className="text-base font-bold text-[#b85d2b] mt-0.5 font-mono tabular-nums">
            {effectiveMode === 'composite'
              ? 'Suprapunere dinamică'
              : `${interiorNodesCount} noduri · ${antinodesCount} ${antinodesCount === 1 ? 'ventru' : 'ventruri'}`}
          </div>
        </div>

        <div className="rounded-lg bg-[#edf3f0] border border-[#dce6e1] px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[#53665f]">PERIOADĂ & λ</div>
          <div className="text-base font-bold text-[#13221d] mt-0.5 font-mono tabular-nums">
            {periodMs.toFixed(2)} ms · {(wavelengthM * 100).toFixed(1)} cm
          </div>
        </div>
      </div>

      {/* Mode Selector + Camera Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#edf3f0]">
          <button
            type="button"
            onClick={() => {
              setFollowTechnique(false);
              setSelectedMode('composite');
            }}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              effectiveMode === 'composite'
                ? 'bg-[#0d4a3e] text-white'
                : 'text-[#53665f] hover:text-[#13221d]'
            }`}
          >
            Compus (ciupire)
          </button>
          {([1, 2, 3, 4, 5, 6] as const).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => {
                setFollowTechnique(false);
                setSelectedMode(n);
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer ${
                effectiveMode === n
                  ? 'bg-[#0d4a3e] text-white'
                  : 'text-[#53665f] hover:text-[#13221d]'
              }`}
            >
              {n === 1 ? 'n=1 (f₀)' : `n=${n} (${n}f₀)`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-[#53665f]" />
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#edf3f0]">
            {(
              [
                { id: 'perspective', label: '3D' },
                { id: 'side', label: 'Lateral' },
                { id: 'top', label: 'De sus' },
              ] as const
            ).map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setCameraPreset(preset.id);
                  cameraControlsApiRef.current?.applyPreset(preset.id);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  cameraPreset === preset.id
                    ? 'bg-[#0d4a3e] text-white'
                    : 'text-[#53665f] hover:text-[#13221d]'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* WebGL 3D Viewport */}
      {webglError ? (
        <div className="rounded-lg border border-[#d8e2dc] bg-[#fafcfa] p-6 text-center text-xs text-[#53665f]">
          {webglError}
        </div>
      ) : (
        <div className="relative rounded-lg border border-[#223931] bg-[#11201b] overflow-hidden">
          <div
            ref={mountRef}
            className="w-full h-[320px] sm:h-[360px] cursor-grab active:cursor-grabbing"
            aria-label="Simulare 3D WebGL a vibrației corzii de chitară"
          />
          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 bg-[#0d1915] border-t border-[#223931] text-[11px] text-[#b4c7bf]">
            <span>
              {effectiveMode === 'composite'
                ? `Suprapunere armonică · poziție pană p = ${pickPosition.toFixed(2)} L (reper turcoaz)`
                : HARMONIC_MODE_LABELS[effectiveMode]}
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#e59d58]" />
                Coardă vibrantă
              </span>
              {effectiveMode !== 'composite' && effectiveMode >= 2 && (
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#d66b30]" />
                  Noduri staționare
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-0.5 bg-[#5eead4]" />
                Anvelopă undă
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Simulation Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center pt-1">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[#13221d]">Viteză vizuală (slow-mo)</span>
            <span className="font-mono font-semibold text-[#0d4a3e] tabular-nums">
              {slowMoFactor.toFixed(2)}×
            </span>
          </div>
          <input
            type="range"
            min={0.25}
            max={2.5}
            step={0.05}
            value={slowMoFactor}
            onChange={(e) => setSlowMoFactor(Number(e.target.value))}
            className="lab-slider w-full"
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[#13221d]">Amplitudine vizuală</span>
            <span className="font-mono font-semibold text-[#b85d2b] tabular-nums">
              {amplitudeScale.toFixed(1)}×
            </span>
          </div>
          <input
            type="range"
            min={0.4}
            max={1.8}
            step={0.1}
            value={amplitudeScale}
            onChange={(e) => setAmplitudeScale(Number(e.target.value))}
            className="lab-slider w-full"
          />
        </div>

        <label className="flex items-center gap-2 text-xs font-medium text-[#13221d] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={sustainedWave}
            onChange={(e) => setSustainedWave(e.target.checked)}
            className="accent-[#0d4a3e] w-3.5 h-3.5"
          />
          <span>Mod staționar continuu</span>
        </label>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="flex items-center gap-2 text-xs font-medium text-[#13221d] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showEnvelope}
              onChange={(e) => setShowEnvelope(e.target.checked)}
              className="accent-[#0d4a3e] w-3.5 h-3.5"
            />
            <span>Anvelopă</span>
          </label>

          <button
            type="button"
            onClick={() => {
              setFollowTechnique(true);
              setSlowMoFactor(1.0);
              setAmplitudeScale(1.0);
              setSustainedWave(true);
              setShowEnvelope(true);
              setCameraPreset('perspective');
              cameraControlsApiRef.current?.applyPreset('perspective');
            }}
            className="px-2.5 py-1 rounded-md border border-[#d8e2dc] bg-[#fafcfa] hover:bg-[#edf3f0] text-[11px] font-medium text-[#53665f] hover:text-[#13221d] flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Resetare 3D</span>
          </button>
        </div>
      </div>
    </div>
  );
};
