import * as THREE from 'three';

export class DebugVisualizer {
  constructor(scene) {
    this.scene = scene;
    this.helpers = new THREE.Group();
    this.helpers.name = 'debugHelpers';
    scene.add(this.helpers);
    this.axes = new THREE.AxesHelper(5);
    this.grid = new THREE.GridHelper(24, 24, 0x444444, 0x222222);
    this.axes.visible = false;
    this.grid.visible = false;
    this.helpers.add(this.axes, this.grid);
    this.wireframes = [];
  }

  setEnabled(enabled) {
    this.axes.visible = enabled;
    this.grid.visible = enabled;
    this.wireframes.forEach((w) => {
      w.visible = enabled;
    });
  }

  trackMeshes(meshes) {
    this.clearWireframes();
    meshes.forEach((mesh) => {
      if (!mesh?.geometry) return;
      const wf = new THREE.WireframeGeometry(mesh.geometry);
      const line = new THREE.LineSegments(
        wf,
        new THREE.LineBasicMaterial({ color: 0xffff00 }),
      );
      line.position.copy(mesh.position);
      line.quaternion.copy(mesh.quaternion);
      line.visible = this.axes.visible;
      this.helpers.add(line);
      this.wireframes.push({ line, mesh, wf });
    });
  }

  update() {
    this.wireframes.forEach(({ line, mesh }) => {
      line.position.copy(mesh.position);
      line.quaternion.copy(mesh.quaternion);
    });
  }

  clearWireframes() {
    this.wireframes.forEach(({ line, wf }) => {
      this.helpers.remove(line);
      line.geometry.dispose();
      line.material.dispose();
      wf.dispose();
    });
    this.wireframes = [];
  }

  dispose() {
    this.clearWireframes();
    this.scene.remove(this.helpers);
    this.grid.dispose();
  }
}
