import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

export type Vec3 = { x: number; y: number; z: number };

export type CosmosSceneOptions = { reducedMotion?: boolean };

/**
 * Imperative handle the React component drives. The scene owns the render loop
 * and eases the real camera toward whatever target the scroll handler sets, so
 * React never touches three per frame.
 */
export type CosmosScene = {
  /** Where the camera should drift to (scene eases toward it). */
  setCameraTarget(target: Vec3): void;
  /** 0..1 document scroll, used to fly the foreground past the camera. */
  setScrollProgress(progress: number): void;
  resize(width: number, height: number): void;
  dispose(): void;
};

const CAMERA_START: Vec3 = { x: 0, y: 30, z: 300 };
const LOOK_AT = new THREE.Vector3(0, 10, -600);
const NEBULA_Z = -1050;
const STAR_COUNT = 5000;
const STAR_LAYERS = 3;
const EASING = 0.05;

const MOUNTAIN_LAYERS = [
  { distance: -50, height: 60, color: 0x1a1a2e, opacity: 1 },
  { distance: -100, height: 80, color: 0x16213e, opacity: 0.8 },
  { distance: -150, height: 100, color: 0x0f3460, opacity: 0.6 },
  { distance: -200, height: 120, color: 0x0a4668, opacity: 0.4 },
] as const;

export function createCosmosScene(
  canvas: HTMLCanvasElement,
  options: CosmosSceneOptions = {},
): CosmosScene {
  const reduced = options.reducedMotion ?? false;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.00025);

  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 2000);
  camera.position.set(CAMERA_START.x, CAMERA_START.y, CAMERA_START.z);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.5;

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  // Lower strength + higher threshold than a showcase scene: the hero text sits
  // over the bloom, so a blown-out white core would swallow it.
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.6, 0.4, 0.9);
  composer.addPass(bloom);

  const disposables: Array<{ dispose(): void }> = [];

  // --- Stars: three shells rotating at their own rate with depth. ---
  const starLayers: THREE.Points[] = [];
  for (let layer = 0; layer < STAR_LAYERS; layer++) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(STAR_COUNT * 3);
    const colors = new Float32Array(STAR_COUNT * 3);
    const sizes = new Float32Array(STAR_COUNT);

    for (let j = 0; j < STAR_COUNT; j++) {
      const radius = 200 + Math.random() * 800;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      positions[j * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[j * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[j * 3 + 2] = radius * Math.cos(phi);

      const color = new THREE.Color();
      const pick = Math.random();
      if (pick < 0.7) color.setHSL(0, 0, 0.8 + Math.random() * 0.2);
      else if (pick < 0.9) color.setHSL(0.08, 0.5, 0.8);
      else color.setHSL(0.6, 0.5, 0.8);
      colors[j * 3] = color.r;
      colors[j * 3 + 1] = color.g;
      colors[j * 3 + 2] = color.b;

      sizes[j] = Math.random() * 2 + 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 }, depth: { value: layer } },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float time;
        uniform float depth;
        void main() {
          vColor = color;
          vec3 pos = position;
          float angle = time * 0.05 * (1.0 - depth * 0.3);
          mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
          pos.xy = rot * pos.xy;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float opacity = 1.0 - smoothstep(0.0, 0.5, dist);
          gl_FragColor = vec4(vColor, opacity);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);
    starLayers.push(points);
    disposables.push(geometry, material);
  }

  // --- Nebula: a rippling gradient plane behind everything. ---
  const nebulaGeometry = new THREE.PlaneGeometry(8000, 4000, 100, 100);
  const nebulaMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      color1: { value: new THREE.Color(0x0033ff) },
      color2: { value: new THREE.Color(0xff0066) },
      opacity: { value: 0.3 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying float vElevation;
      uniform float time;
      void main() {
        vUv = uv;
        vec3 pos = position;
        float elevation = sin(pos.x * 0.01 + time) * cos(pos.y * 0.01 + time) * 20.0;
        pos.z += elevation;
        vElevation = elevation;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color1;
      uniform vec3 color2;
      uniform float opacity;
      uniform float time;
      varying vec2 vUv;
      varying float vElevation;
      void main() {
        float mixFactor = sin(vUv.x * 10.0 + time) * cos(vUv.y * 10.0 + time);
        vec3 color = mix(color1, color2, mixFactor * 0.5 + 0.5);
        float alpha = opacity * (1.0 - length(vUv - 0.5) * 2.0);
        alpha *= 1.0 + vElevation * 0.01;
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
  nebula.position.z = NEBULA_Z;
  scene.add(nebula);
  disposables.push(nebulaGeometry, nebulaMaterial);

  // --- Mountains: parallax silhouette layers you fly through. ---
  const mountains: THREE.Mesh[] = [];
  const mountainBaseZ: number[] = [];
  MOUNTAIN_LAYERS.forEach((layer) => {
    const points: THREE.Vector2[] = [];
    const segments = 50;
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments - 0.5) * 1000;
      const y =
        Math.sin(i * 0.1) * layer.height +
        Math.sin(i * 0.05) * layer.height * 0.5 +
        Math.random() * layer.height * 0.2 -
        100;
      points.push(new THREE.Vector2(x, y));
    }
    points.push(new THREE.Vector2(5000, -300));
    points.push(new THREE.Vector2(-5000, -300));

    const shape = new THREE.Shape(points);
    const geometry = new THREE.ShapeGeometry(shape);
    const material = new THREE.MeshBasicMaterial({
      color: layer.color,
      transparent: true,
      opacity: layer.opacity,
      side: THREE.DoubleSide,
    });
    const mountain = new THREE.Mesh(geometry, material);
    mountain.position.z = layer.distance;
    mountain.position.y = layer.distance;
    scene.add(mountain);
    mountains.push(mountain);
    mountainBaseZ.push(layer.distance);
    disposables.push(geometry, material);
  });

  // --- Atmosphere: faint rim glow around the scene. ---
  const atmosphereGeometry = new THREE.SphereGeometry(600, 32, 32);
  const atmosphereMaterial = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      uniform float time;
      void main() {
        float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
        vec3 atmosphere = vec3(0.3, 0.6, 1.0) * intensity;
        float pulse = sin(time * 2.0) * 0.1 + 0.9;
        atmosphere *= pulse;
        gl_FragColor = vec4(atmosphere, intensity * 0.25);
      }
    `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
  });
  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  scene.add(atmosphere);
  disposables.push(atmosphereGeometry, atmosphereMaterial);

  // --- Loop state ---
  const target: Vec3 = { ...CAMERA_START };
  const smooth: Vec3 = { ...CAMERA_START };
  let scrollProgress = 0;
  let dirty = true;
  let rafId = 0;
  const clock = new THREE.Clock();

  const setUniformTime = (t: number) => {
    for (const points of starLayers) {
      (points.material as THREE.ShaderMaterial).uniforms.time.value = t;
    }
    nebulaMaterial.uniforms.time.value = t * 0.5;
    atmosphereMaterial.uniforms.time.value = t;
  };

  const flyMountains = () => {
    // Push each layer forward past the camera as you scroll in; nearer layers
    // move faster, so the range opens up toward the nebula.
    mountains.forEach((mountain, i) => {
      mountain.position.z = mountainBaseZ[i] + scrollProgress * 900 * (1 + i * 0.3);
    });
  };

  const renderFrame = (time: number) => {
    if (reduced) {
      // No autonomous motion: snap to target, freeze every time-driven shader.
      smooth.x = target.x;
      smooth.y = target.y;
      smooth.z = target.z;
      setUniformTime(0);
    } else {
      smooth.x += (target.x - smooth.x) * EASING;
      smooth.y += (target.y - smooth.y) * EASING;
      smooth.z += (target.z - smooth.z) * EASING;
      setUniformTime(time);
      // A little wobble so the silhouette feels alive even between scrolls.
      mountains.forEach((mountain, i) => {
        mountain.position.x = Math.sin(time * 0.1) * 2 * (1 + i * 0.5);
      });
    }

    const floatX = reduced ? 0 : Math.sin(time * 0.1) * 2;
    const floatY = reduced ? 0 : Math.cos(time * 0.15) * 1;
    camera.position.set(smooth.x + floatX, smooth.y + floatY, smooth.z);
    camera.lookAt(LOOK_AT);
    flyMountains();
    composer.render();
  };

  const animate = () => {
    rafId = requestAnimationFrame(animate);
    if (reduced) {
      // Only paint when the scroll (or a resize) actually changed something.
      if (!dirty) return;
      dirty = false;
      renderFrame(0);
      return;
    }
    renderFrame(clock.getElapsedTime());
  };

  animate();

  return {
    setCameraTarget(next) {
      target.x = next.x;
      target.y = next.y;
      target.z = next.z;
      dirty = true;
    },
    setScrollProgress(progress) {
      scrollProgress = progress;
      dirty = true;
    },
    resize(width, height) {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      composer.setSize(width, height);
      bloom.setSize(width, height);
      dirty = true;
    },
    dispose() {
      if (rafId) cancelAnimationFrame(rafId);
      for (const item of disposables) item.dispose();
      bloom.dispose();
      composer.dispose();
      renderer.dispose();
    },
  };
}
