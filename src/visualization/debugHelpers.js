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
    this.bboxes = [];
    this._enabled = false;
  }

  setEnabled(enabled) {
    this._enabled = enabled;
    this.axes.visible = enabled;
    this.grid.visible = enabled;
    this.wireframes.forEach((w) => {
      w.visible = enabled;
    });
    this.bboxes.forEach((b) => {
      b.helper.visible = enabled;
    });
  }

  trackMeshes(meshes) {
    this.clearWireframes();
    this.clearBboxes();
    meshes.forEach((mesh) => {
      if (!mesh) return;
      this._addWireframe(mesh);
      this._addBBox(mesh);
    });
  }

  _addWireframe(mesh) {
    const targets = [];
    if (mesh.isMesh && mesh.geometry) targets.push(mesh);
    mesh.traverse?.((c) => {
      if (c.isMesh && c.geometry) targets.push(c);
    });

    targets.forEach((m) => {
      const wf = new THREE.WireframeGeometry(m.geometry);
      const line = new THREE.LineSegments(
        wf,
        new THREE.LineBasicMaterial({ color: 0xffff00 }),
      );
      line.position.copy(mesh.position);
      line.quaternion.copy(mesh.quaternion);
      line.scale.copy(mesh.scale);
      line.visible = this._enabled;
      this.helpers.add(line);
      this.wireframes.push({ line, mesh, wf, target: m });
    });
  }

  _addBBox(mesh) {
    const helper = new THREE.Box3Helper(new THREE.Box3(), 0xff66cc);
    helper.visible = this._enabled;
    this.helpers.add(helper);
    this.bboxes.push({ helper, mesh });
  }

  update() {
    this.wireframes.forEach(({ line, mesh }) => {
      line.position.copy(mesh.position);
      line.quaternion.copy(mesh.quaternion);
      line.scale.copy(mesh.scale);
    });

    this.bboxes.forEach(({ helper, mesh }) => {
      const box = new THREE.Box3().setFromObject(mesh);
      helper.box.copy(box);
      helper.updateMatrixWorld(true);
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

  clearBboxes() {
    this.bboxes.forEach(({ helper }) => {
      this.helpers.remove(helper);
    });
    this.bboxes = [];
  }

  dispose() {
    this.clearWireframes();
    this.clearBboxes();
    this.scene.remove(this.helpers);
    this.grid.dispose();
  }
}
