/**
 * car3d.js — visor 3D del coche para la pantalla de Inicio.
 *
 * Construye un coupé fastback estilizado por código (extrusión de un
 * perfil 2D + ruedas), NO un modelo 3D con licencia de una marca real.
 * Si en el futuro consigues/compras un .glb real, sustituye la función
 * buildCar() por un GLTFLoader y el resto del archivo (luces, cámara,
 * controles, resize) sigue funcionando igual.
 */
 
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
 
const COLORS = {
  bg: 0x1b1d1e,
  body: 0x2d3033,
  bodyDark: 0x232628,
  glass: 0x14171a,
  amber: 0xe8a33d,
  teal: 0x5e9e96,
  wheel: 0x111213,
  rim: 0x8a8f93,
  floorLine: 0x2e3235
};
 
function buildCarBody() {
  // Perfil lateral (X = longitud, Y = altura), sentido antihorario,
  // empezando en el paragolpes delantero. Silueta genérica de coupé
  // fastback (capó largo, techo bajo, luneta trasera muy inclinada).
  const pts = [
    [0.00, 0.26], [0.06, 0.46], [1.15, 0.56], [1.35, 0.56],
    [1.95, 1.12], [2.70, 1.14], [3.35, 0.95], [3.85, 0.58],
    [4.15, 0.56], [4.35, 0.46], [4.35, 0.26], [0.00, 0.26]
  ];
  const shape = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
 
  const depth = 1.72; // ancho del coche
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    bevelSegments: 2,
    curveSegments: 10
  });
  geo.translate(-2.175, 0, -depth / 2); // centrar en el origen
  geo.computeVertexNormals();
 
  const mat = new THREE.MeshStandardMaterial({
    color: COLORS.body,
    metalness: 0.45,
    roughness: 0.45
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  return mesh;
}
 
function buildGreenhouse() {
  // Franja de "cristal" del habitáculo, ligeramente hundida, solo
  // decorativa: refuerza la silueta sin modelar cada panel.
  const pts = [
    [1.40, 0.58], [1.92, 1.06], [2.62, 1.08], [3.20, 0.90], [3.55, 0.58]
  ];
  const shape = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
  const depth = 1.62;
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 8 });
  geo.translate(-2.175, 0.01, -depth / 2);
  const mat = new THREE.MeshStandardMaterial({
    color: COLORS.glass, metalness: 0.9, roughness: 0.15
  });
  return new THREE.Mesh(geo, mat);
}
 
function buildWheel() {
  const group = new THREE.Group();
  const tyre = new THREE.Mesh(
    new THREE.CylinderGeometry(0.34, 0.34, 0.24, 16),
    new THREE.MeshStandardMaterial({ color: COLORS.wheel, roughness: 0.9 })
  );
  tyre.rotation.z = Math.PI / 2;
  const rim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.16, 0.25, 12),
    new THREE.MeshStandardMaterial({ color: COLORS.rim, metalness: 0.7, roughness: 0.3 })
  );
  rim.rotation.z = Math.PI / 2;
  group.add(tyre, rim);
  return group;
}
 
function buildCar() {
  const car = new THREE.Group();
  car.add(buildCarBody());
  car.add(buildGreenhouse());
 
  const wheelPositions = [
    [0.95, 0.34, 0.78], [0.95, 0.34, -0.78],
    [3.55, 0.34, 0.78], [3.55, 0.34, -0.78]
  ];
  wheelPositions.forEach(([x, y, z]) => {
    const w = buildWheel();
    w.position.set(x - 2.175, y, z);
    car.add(w);
  });
 
  return car;
}
 
function buildFloor() {
  const group = new THREE.Group();
  const grid = new THREE.GridHelper(12, 24, COLORS.floorLine, COLORS.floorLine);
  grid.position.y = 0.001;
  grid.material.opacity = 0.35;
  grid.material.transparent = true;
  group.add(grid);
  return group;
}
 
export function initCar3D(canvas) {
  if (!canvas || typeof WebGLRenderingContext === 'undefined') return null;
 
  const scene = new THREE.Scene();
  scene.background = null;
 
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
  camera.position.set(4.6, 2.1, 4.2);
 
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
 
  scene.add(new THREE.AmbientLight(0x8891a0, 0.55));
 
  const keyLight = new THREE.DirectionalLight(COLORS.amber, 1.4);
  keyLight.position.set(4, 5, 3);
  scene.add(keyLight);
 
  const rimLight = new THREE.DirectionalLight(COLORS.teal, 0.9);
  rimLight.position.set(-4, 2, -4);
  scene.add(rimLight);
 
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.25);
  fillLight.position.set(-2, 1, 4);
  scene.add(fillLight);
 
  const car = buildCar();
  scene.add(car);
  scene.add(buildFloor());
 
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 0.55, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.enableZoom = true;
  controls.minDistance = 3.2;
  controls.maxDistance = 8;
  controls.minPolarAngle = Math.PI * 0.18;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.1;
  controls.update();
 
  function resize() {
    const { clientWidth, clientHeight } = canvas.parentElement;
    if (!clientWidth || !clientHeight) return;
    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
  }
 
  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);
  resize();
 
  let raf = null;
  function tick() {
    controls.update();
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }
  tick();
 
  // Pausa el render loop cuando la pestaña de Inicio no está visible,
  // para no gastar batería en un móvil de fondo.
  return {
    pause() { if (raf) cancelAnimationFrame(raf); raf = null; },
    resume() { if (!raf) tick(); },
    destroy() {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
    }
  };
}
 