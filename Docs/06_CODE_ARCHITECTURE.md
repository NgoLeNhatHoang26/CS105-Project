# 06_CODE_ARCHITECTURE.md
## Code Architecture & Directory Structure

---

## 6.1 Directory Structure

### Complete Project Layout

```
physics-simulator/
│
├── 📄 index.html                  # Entry point (CDN imports, main container)
├── 📄 package.json               # Dependencies & scripts
├── 📄 vite.config.js            # Vite configuration
├── 📄 README.md                 # Vietnamese documentation
│
├── 📁 src/                       # Main source code
│   │
│   ├── 📄 main.js               # MAIN LOOP & INITIALIZATION
│   │   └── Calls: requestAnimationFrame()
│   │   └── Manages: Physics update, Mesh sync, Render
│   │
│   ├── 📄 state.js              # GLOBAL STATE MANAGEMENT
│   │   └── Centralized state object
│   │   └── Mutations: setState(), updateParameter()
│   │
│   ├── 📄 constants.js          # CONSTANTS & DEFAULTS
│   │   └── Scene parameters
│   │   └── Physics defaults
│   │   └── UI defaults
│   │
│   │
│   ├── 📁 engine/               # CORE 3D & PHYSICS ENGINE
│   │   │
│   │   ├── 📄 physics.js        # CANNON-ES Physics World
│   │   │   ├── Class: PhysicsEngine
│   │   │   ├── Methods:
│   │   │   │   - constructor(gravity)
│   │   │   │   - createWorld()
│   │   │   │   - addBody(mass, position, shape)
│   │   │   │   - removeBody(body)
│   │   │   │   - update(dt)
│   │   │   │   - setGravity(g)
│   │   │   │   - reset()
│   │   │   └── Properties: world, bodies
│   │   │
│   │   ├── 📄 view.js          # THREE.JS RENDERER
│   │   │   ├── Class: Renderer
│   │   │   ├── Methods:
│   │   │   │   - constructor(canvas)
│   │   │   │   - createScene()
│   │   │   │   - createCamera()
│   │   │   │   - createRenderer()
│   │   │   │   - setupLighting()
│   │   │   │   - setupShadows()
│   │   │   │   - render(scene, camera)
│   │   │   │   - dispose()
│   │   │   │   - onWindowResize()
│   │   │   └── Properties: scene, camera, renderer, lights
│   │   │
│   │   └── 📄 sceneManager.js  # SCENE LIFECYCLE MANAGEMENT
│   │       ├── Class: SceneManager
│   │       ├── Methods:
│   │       │   - init(sceneNumber)
│   │       │   - dispose()
│   │       │   - reset()
│   │       │   - update(dt)
│   │       │   - getObjects()
│   │       │   - setParameter(key, value)
│   │       │   - cleanupScene()
│   │       └── Handles: Memory cleanup, object creation
│   │
│   │
│   ├── 📁 scenes/               # 4 PHYSICS SCENES
│   │   ├── 📄 sceneFactory.js   # Factory method pattern
│   │   │   └── createScene(sceneNumber) → Scene object
│   │   │
│   │   ├── 📄 scene1_incline.js
│   │   │   ├── createScene1() → { objects, physics, setup }
│   │   │   ├── setupGeometry1()
│   │   │   ├── setupPhysics1()
│   │   │   └── getScene1Data()
│   │   │
│   │   ├── 📄 scene2_freefall.js
│   │   │   └── Same structure as scene1
│   │   │
│   │   ├── 📄 scene3_horizontal.js
│   │   │   └── Same structure as scene1
│   │   │
│   │   └── 📄 scene4_collision.js
│   │       └── Special: 2 objects, collision handling
│   │
│   │
│   ├── 📁 components/           # REUSABLE COMPONENTS
│   │   │
│   │   ├── 📄 geometries.js     # Object factories
│   │   │   ├── createBox(width, height, depth, color)
│   │   │   ├── createSphere(radius, color)
│   │   │   ├── createCylinder(radius, height, color)
│   │   │   └── Each returns: { mesh, body }
│   │   │
│   │   ├── 📄 materials.js      # Material definitions
│   │   │   ├── createPhongMaterial(color, options)
│   │   │   ├── setMaterialProperties()
│   │   │   └── disposeMaterial()
│   │   │
│   │   └── 📄 lights.js         # Lighting setup
│   │       ├── createAmbientLight()
│   │       ├── createDirectionalLight()
│   │       └── createPointLight()
│   │
│   │
│   ├── 📁 visualization/        # VISUAL HELPERS
│   │   │
│   │   ├── 📄 vectorHelpers.js  # Force visualization
│   │   │   ├── class ForceVisualizer
│   │   │   ├── Methods:
│   │   │   │   - drawForce(origin, force, color, label)
│   │   │   │   - drawAllForces(object, forces)
│   │   │   │   - update()
│   │   │   │   - clear()
│   │   │   └── Uses: THREE.ArrowHelper
│   │   │
│   │   ├── 📄 debugHelpers.js   # Debug visualization
│   │   │   ├── createWireframe()
│   │   │   ├── createBoundingBox()
│   │   │   ├── createGridHelper()
│   │   │   └── createAxesHelper()
│   │   │
│   │   └── 📄 gridHelper.js     # Floor/incline grid
│   │       └── createGridTexture()
│   │
│   │
│   ├── 📁 interaction/          # USER INPUT & INTERACTION
│   │   │
│   │   ├── 📄 input.js          # Keyboard & mouse events
│   │   │   ├── handleKeyDown(event)
│   │   │   ├── handleKeyUp(event)
│   │   │   ├── handleMouseMove(event)
│   │   │   ├── handleMouseDown(event)
│   │   │   └── handleMouseUp(event)
│   │   │
│   │   ├── 📄 raycasting.js     # Object selection & drag
│   │   │   ├── class Raycaster
│   │   │   ├── Methods:
│   │   │   │   - onMouseMove(event)
│   │   │   │   - onMouseDown(event)
│   │   │   │   - onMouseDrag(event)
│   │   │   │   - onMouseUp(event)
│   │   │   │   - highlightObject()
│   │   │   │   - dragObject()
│   │   │   └── Respects: state.isRunning
│   │   │
│   │   └── 📄 controls.js       # OrbitControls wrapper
│   │       ├── setupOrbitControls(camera, canvas)
│   │       ├── resetCamera()
│   │       └── setTarget(object)
│   │
│   │
│   ├── 📁 ui/                   # USER INTERFACE
│   │   │
│   │   ├── 📄 uiManager.js      # Main UI controller
│   │   │   ├── class UIManager
│   │   │   ├── Methods:
│   │   │   │   - init()
│   │   │   │   - updateDataPanel()
│   │   │   │   - updateParameterPanel()
│   │   │   │   - setSceneUI()
│   │   │   │   - updatePlaybackState()
│   │   │   └── Uses: Lil-gui, Stats.js
│   │   │
│   │   ├── 📄 panels.js         # Panel creation functions
│   │   │   ├── createSceneNavigator() → folder
│   │   │   ├── createPlaybackControls() → folder
│   │   │   ├── createObjectProperties() → folder
│   │   │   ├── createForceControl() → folder
│   │   │   ├── createEnvironment() → folder
│   │   │   ├── createSceneParameters() → folder
│   │   │   ├── createDisplayOptions() → folder
│   │   │   └── createDataExport() → folder
│   │   │
│   │   └── 📄 stats.js          # Stats.js integration
│   │       ├── initStats()
│   │       ├── stats.update()
│   │       └── stats.dom (append to page)
│   │
│   │
│   ├── 📁 physics/              # PHYSICS UTILITIES
│   │   │
│   │   ├── 📄 calculator.js     # Physical calculations
│   │   │   ├── calculateAcceleration(forces, mass)
│   │   │   ├── calculateVelocity(v, a, dt)
│   │   │   ├── calculatePosition(p, v, a, dt)
│   │   │   ├── calculateKineticEnergy(mass, velocity)
│   │   │   ├── calculateForceComponents()
│   │   │   └── All with Vietnamese comments
│   │   │
│   │   ├── 📄 forceManager.js   # Force management
│   │   │   ├── calculateGravity(mass, gravity)
│   │   │   ├── calculateFriction(normal, mu)
│   │   │   ├── calculateNormalForce()
│   │   │   ├── calculateNetForce(forces)
│   │   │   └── applyForce(body, force, position)
│   │   │
│   │   └── 📄 constraints.js    # Physics constraints
│   │       ├── createInclineConstraint()
│   │       ├── createBoundaryConstraint()
│   │       └── handleCollision()
│   │
│   │
│   └── 📁 utils/                # UTILITIES
│       │
│       ├── 📄 logger.js         # Debug logging
│       │   ├── log(message, level)
│       │   ├── error(message)
│       │   └── warn(message)
│       │
│       ├── 📄 data.js           # Data export
│       │   ├── exportToCSV(data, filename)
│       │   ├── recordDataPoint()
│       │   └── formatData()
│       │
│       └── 📄 helpers.js        # General helpers
│           ├── clamp(value, min, max)
│           ├── lerp(a, b, t)
│           ├── degreesToRadians()
│           └── radiansToDegrees()
│
│
├── 📁 assets/                   # STATIC ASSETS
│   │
│   ├── 📁 textures/
│   │   ├── grid.png            # Grid pattern
│   │   ├── wood.png            # Wood texture (optional)
│   │   └── metal.png           # Metal texture (optional)
│   │
│   └── 📁 models/
│       └── teapot.json         # (Optional) Teapot model
│
│
└── 📄 README.md                 # Vietnamese documentation
    ├── Setup instructions
    ├── Keyboard shortcuts
    ├── Feature list
    └── Physics concepts
```

---

## 6.2 Data Flow Architecture

### Main Update Loop

```
┌─────────────────────────────────────────┐
│  requestAnimationFrame(timestamp)       │
│  (Called 60 times per second)           │
└─────────────┬───────────────────────────┘
              │
              ↓
    ┌─────────────────────┐
    │ Calculate delta time │
    │ (dt = frame duration)│
    └──────────┬──────────┘
              │
              ↓
    ┌─────────────────────────────────────┐
    │ if (state.isRunning) {              │
    │   physics.update(dt)                │
    │   time += dt                        │
    │ }                                   │
    └──────────┬──────────────────────────┘
              │
              ↓
    ┌─────────────────────────────────────┐
    │ Sync Graphics with Physics:         │
    │ for each object {                   │
    │   mesh.position = body.position     │
    │   mesh.quaternion = body.quaternion │
    │ }                                   │
    └──────────┬──────────────────────────┘
              │
              ↓
    ┌─────────────────────────────────────┐
    │ Calculate Physical Data:            │
    │ - Acceleration, Velocity            │
    │ - Kinetic Energy, Forces            │
    │ - Other scene-specific data         │
    └──────────┬──────────────────────────┘
              │
              ↓
    ┌─────────────────────────────────────┐
    │ Update UI Panels:                   │
    │ - Update data display               │
    │ - Update parameter sliders (optional)│
    └──────────┬──────────────────────────┘
              │
              ↓
    ┌─────────────────────────────────────┐
    │ Update Visualizers:                 │
    │ if (showVectors) {                  │
    │   redraw force vectors              │
    │   update labels                     │
    │ }                                   │
    └──────────┬──────────────────────────┘
              │
              ↓
    ┌─────────────────────────────────────┐
    │ Render Scene:                       │
    │ renderer.render(scene, camera)      │
    └──────────┬──────────────────────────┘
              │
              ↓
    ┌─────────────────────────────────────┐
    │ Update Stats:                       │
    │ stats.update()                      │
    │ (FPS, render time, memory)          │
    └─────────────────────────────────────┘
```

### State Management Flow

```
USER ACTION (UI, Keyboard, Mouse)
        │
        ↓
INPUT HANDLERS (input.js, raycasting.js)
        │
        ├─→ Check state.isRunning
        │
        ├─→ Validate parameter constraints
        │
        ↓
STATE UPDATE (state.js)
        │
        ├─→ state.parameters.xxx = newValue
        │
        ├─→ state.isRunning = true/false
        │
        ↓
DEPENDENT UPDATES
        │
        ├─→ Physics: applyNewForces(), setGravity()
        │
        ├─→ UI: updateParameterPanel()
        │
        └─→ Graphics: updateMaterial(), updateLight()
```

---

## 6.3 Core Classes & Functions

### PhysicsEngine (physics.js)

```javascript
class PhysicsEngine {
  // Vietnamese comments explaining physics concepts
  
  constructor(gravity = 9.8) {
    // Khởi tạo Cannon.js world với trọng lực
    this.world = new CANNON.World()
    this.world.gravity.set(0, -gravity, 0)
    this.world.defaultContactMaterial.friction = 0.3
    
    this.bodies = []
    this.gravity = gravity
  }
  
  addBody(mass, position, shape, options) {
    // Thêm body vào physics world
    // shape: 'box', 'sphere', 'cylinder'
    // Returns: CANNON.Body
  }
  
  removeBody(body) {
    // Xóa body khỏi physics world
  }
  
  applyForce(body, force, worldPoint) {
    // Tác dụng lực lên body
    // force: Vector3
    // worldPoint: Point of application
  }
  
  update(dt) {
    // Cập nhật physics world một bước
    // dt: time delta (thường 1/60)
    this.world.step(1/60)
  }
  
  setGravity(gravity) {
    // Thay đổi trọng lực
    this.world.gravity.y = -gravity
  }
  
  reset() {
    // Reset tất cả bodies về vị trí ban đầu
  }
}
```

### Renderer (view.js)

```javascript
class Renderer {
  constructor(canvas, width, height) {
    this.canvas = canvas
    this.width = width
    this.height = height
    
    this.scene = null
    this.camera = null
    this.renderer = null
    this.lights = []
    
    this.init()
  }
  
  createScene() {
    // Tạo Three.js Scene
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0xcccccc)
    this.scene.fog = new THREE.Fog(0xcccccc, 1000)
  }
  
  createCamera(fov = 60, near = 0.1, far = 10000) {
    // Tạo PerspectiveCamera
    // Các tham số adjustable
    this.camera = new THREE.PerspectiveCamera(
      fov,
      this.width / this.height,
      near,
      far
    )
    this.camera.position.set(0, 15, 30)
  }
  
  setupLighting() {
    // Setup Ambient + Directional + Point lights
    // Phong model: Ambient + Diffuse + Specular
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(20, 30, 10)
    directionalLight.castShadow = true
    
    this.lights.push(ambientLight, directionalLight)
    this.scene.add(...this.lights)
  }
  
  setupShadows() {
    // Enable PCFSoftShadowMap
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMapType
    
    // Configure shadow properties
    for (const light of this.lights) {
      if (light.castShadow) {
        light.shadow.mapSize.width = 2048
        light.shadow.mapSize.height = 2048
        light.shadow.camera.near = 0.5
        light.shadow.camera.far = 500
      }
    }
  }
  
  render(scene, camera) {
    this.renderer.render(scene, camera)
  }
  
  dispose() {
    // Cleanup: dispose geometry, material, texture
  }
}
```

### SceneManager (sceneManager.js)

```javascript
class SceneManager {
  constructor(renderer, physicsEngine, raycaster) {
    this.renderer = renderer
    this.physics = physicsEngine
    this.raycaster = raycaster
    
    this.currentScene = null
    this.currentSceneNumber = 1
    this.objects = []
  }
  
  init(sceneNumber) {
    // Khởi tạo scene mới
    // 1. Cleanup scene cũ
    this.dispose()
    
    // 2. Create new scene
    const sceneConfig = sceneFactory.createScene(sceneNumber)
    
    // 3. Add objects to renderer & physics
    for (const obj of sceneConfig.objects) {
      this.renderer.scene.add(obj.mesh)
      this.physics.addBody(obj.body)
      this.objects.push(obj)
    }
    
    this.currentSceneNumber = sceneNumber
  }
  
  reset() {
    // Reset tất cả objects về initial state
    for (const obj of this.objects) {
      obj.mesh.position.copy(obj.initialPosition)
      obj.body.position.copy(obj.initialPosition)
      obj.body.velocity.set(0, 0, 0)
    }
  }
  
  dispose() {
    // Cleanup scene cũ: dispose geometry, material
    for (const obj of this.objects) {
      this.renderer.scene.remove(obj.mesh)
      this.physics.removeBody(obj.body)
      
      obj.mesh.geometry.dispose()
      obj.mesh.material.dispose()
    }
    this.objects = []
  }
  
  update(dt) {
    // Update scene-specific logic
  }
  
  getObjects() {
    return this.objects
  }
}
```

### UIManager (ui/uiManager.js)

```javascript
class UIManager {
  constructor(state, physics, renderer) {
    this.state = state
    this.physics = physics
    this.renderer = renderer
    
    this.gui = new GUI()
    this.panels = {}
    this.stats = null
  }
  
  init() {
    // Tạo tất cả UI panels
    this.createSceneNavigator()
    this.createPlaybackControls()
    this.createObjectProperties()
    this.createForceControl()
    this.createEnvironment()
    this.createSceneParameters()
    this.createDisplayOptions()
    this.createDataExport()
    
    this.initStats()
  }
  
  updateDataPanel(data) {
    // Update real-time data display
    // Mỗi frame gọi function này
    document.getElementById('dataPanel').innerText = `
      Time: ${data.time.toFixed(2)} s
      Position: (${data.position.x.toFixed(2)}, ${data.position.y.toFixed(2)}) m
      Velocity: ${data.velocity.toFixed(2)} m/s
      ...
    `
  }
  
  setControlsDisabledWhenRunning() {
    // Disable structural parameters khi RUNNING
    if (this.state.isRunning) {
      this.panels.mass.disable()
      this.panels.angle.disable()
      // ...
    } else {
      this.panels.mass.enable()
      this.panels.angle.enable()
    }
  }
}
```

---

## 6.4 Component Integration

### How Everything Works Together

```
INDEX.HTML
  ↓ (imports)
MAIN.JS (main loop entry point)
  ↓ (creates)
  ├─→ RENDERER (view.js)
  │   ├─→ Scene, Camera, Renderer
  │   └─→ Lights & Shadows
  │
  ├─→ PHYSICS ENGINE (physics.js)
  │   └─→ Cannon.js World
  │
  ├─→ SCENE MANAGER (sceneManager.js)
  │   └─→ init(sceneNumber)
  │
  ├─→ UI MANAGER (ui/uiManager.js)
  │   ├─→ Lil-gui panels
  │   └─→ Stats.js monitor
  │
  ├─→ RAYCASTER (interaction/raycasting.js)
  │   └─→ Object selection & drag
  │
  ├─→ ORBIT CONTROLS (interaction/controls.js)
  │   └─→ Camera control
  │
  └─→ FORCE VISUALIZER (visualization/vectorHelpers.js)
      └─→ Draw force vectors

MAIN LOOP (requestAnimationFrame)
  ├─→ physics.update(dt)
  ├─→ Sync mesh ↔ body
  ├─→ calculator.calculateData()
  ├─→ ui.updateDataPanel()
  ├─→ forceVisualizer.update()
  ├─→ renderer.render()
  └─→ stats.update()
```

---

## 6.5 Module Dependencies

```
main.js
├── state.js
├── constants.js
├── engine/
│   ├── physics.js
│   ├── view.js
│   └── sceneManager.js
│       ├── scenes/sceneFactory.js
│       │   ├── scene1_incline.js
│       │   ├── scene2_freefall.js
│       │   ├── scene3_horizontal.js
│       │   └── scene4_collision.js
│       └── components/
│           ├── geometries.js
│           ├── materials.js
│           └── lights.js
│
├── interaction/
│   ├── raycasting.js
│   ├── input.js
│   └── controls.js
│
├── ui/
│   ├── uiManager.js
│   ├── panels.js
│   └── stats.js
│
├── visualization/
│   ├── vectorHelpers.js
│   ├── debugHelpers.js
│   └── gridHelper.js
│
├── physics/
│   ├── calculator.js
│   ├── forceManager.js
│   └── constraints.js
│
└── utils/
    ├── data.js
    ├── logger.js
    └── helpers.js
```

---

## 6.6 Key Design Patterns Used

### 1. Singleton Pattern
- **PhysicsEngine:** Only 1 instance
- **Renderer:** Only 1 instance
- **State:** Global centralized state

### 2. Factory Pattern
- **sceneFactory.createScene():** Creates scenes 1-4
- **geometries.createBox():** Creates geometry + body

### 3. Observer Pattern
- **State changes** → UI updates automatically
- **Lil-gui** watches parameter changes

### 4. Command Pattern
- **Play/Pause/Reset** buttons send commands to state

### 5. Separation of Concerns
- **Physics:** Cannon.js logic only
- **Graphics:** Three.js logic only
- **UI:** Lil-gui & DOM logic only
- **NO mixing** of concerns

---

**Next:** Đọc file `08_IMPLEMENTATION.md` để hiểu timeline & strategy
