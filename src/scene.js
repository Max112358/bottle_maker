import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export function initScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x18181c);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  camera.position.set(0, 50, 120);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const viewport = document.getElementById("viewport");
  viewport.appendChild(renderer.domElement);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 30, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  setupLights(scene);
  setupGround(scene);

  const bottleGroup = new THREE.Group();
  scene.add(bottleGroup);

  function resize() {
    const w = viewport.clientWidth;
    const h = viewport.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  window.addEventListener("resize", resize);

  return { scene, camera, renderer, controls, bottleGroup, resize, animate };
}

function setupLights(scene) {
  const ambient = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
  keyLight.position.set(40, 80, 60);
  keyLight.castShadow = true;
  keyLight.shadow.bias = -0.001;
  keyLight.shadow.mapSize.set(2048, 2048);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xaaccff, 1.0);
  fillLight.position.set(-40, 50, 30);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffddbb, 1.5);
  rimLight.position.set(0, 40, -60);
  scene.add(rimLight);
}

function setupGround(scene) {
  const grid = new THREE.GridHelper(200, 40, 0x333333, 0x1a1a1a);
  grid.position.y = -0.1;
  scene.add(grid);
}
