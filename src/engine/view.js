import * as THREE from 'three';
import { setupSceneLights } from '../components/lights.js';

/**
 * Renderer — Perspective projection, Phong lighting, PCF soft shadows.
 */
export class ViewRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.lights = null;
    this._resizeObserver = null;
  }

  init() {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xb0c4de);
    this.scene.fog = new THREE.Fog(0xb0c4de, 40, 120);

    const g = { fov: 55, near: 0.1, far: 500 };
    this.camera = new THREE.PerspectiveCamera(g.fov, w / h, g.near, g.far);
    this.camera.position.set(8, 12, 18);
    this.camera.lookAt(0, 2, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.lights = setupSceneLights(this.scene);

    window.addEventListener('resize', this._onResize);
    return this;
  }

  _onResize = () => {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (!w || !h) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  updateCameraParams({ fov, near, far }) {
    if (fov != null) this.camera.fov = fov;
    if (near != null) this.camera.near = near;
    if (far != null) this.camera.far = far;
    this.camera.updateProjectionMatrix();
  }

  setBackground(color) {
    this.scene.background = new THREE.Color(color);
    if (this.scene.fog) this.scene.fog.color = this.scene.background;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  getScene() {
    return this.scene;
  }

  getCamera() {
    return this.camera;
  }

  dispose() {
    window.removeEventListener('resize', this._onResize);
    this.renderer?.dispose();
  }
}
