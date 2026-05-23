# 02_USER_ACTIONS.md
## User Actions & Runtime Constraints

---

## 2.1 Application States (3 Trạng thái chính)

### State Diagram
```
              [Play]
           ↙        ↖
      STOPPED    RUNNING
           ↖        ↙
         [Pause]   [Reset]
              ↓
           PAUSED
           ↙    ↖
        [Play] [Reset]
```

### STOPPED State
- **Định nghĩa:** Ứng dụng chưa bắt đầu hoặc đã reset
- **Physics:** Không chạy (dt = 0)
- **Objects:** Ở vị trí ban đầu
- **Time:** t = 0 (reset)
- **User Actions Allowed:**
  - ✅ Thay đổi BẤT KỲ tham số nào
  - ✅ Kéo vật trong viewport để đặt vị trí
  - ✅ Thay đổi camera
  - ✅ Bấm [Play] để bắt đầu

### RUNNING State
- **Định nghĩa:** Mô phỏng đang hoạt động
- **Physics:** Chạy với fixed timestep 1/60
- **Objects:** Chuyển động theo lực
- **Time:** Tăng liên tục (t += dt)
- **User Actions Allowed:**
  - ✅ Thay đổi lực tác dụng F (magnitude)
  - ✅ Thay đổi hướng lực F (angle)
  - ✅ Thay đổi tốc độ mô phỏng (speed multiplier)
  - ✅ Bật/tắt bảng dữ liệu
  - ✅ Bật/tắt vector lực
  - ✅ Bật/tắt debug mode
  - ✅ Điều khiển camera (Orbit, Zoom, Pan)
  - ✅ Bấm [Pause] để tạm dừng
- **User Actions NOT Allowed:**
  - ❌ Thay đổi khối lượng, hình dạng, kích thước
  - ❌ Thay đổi tham số môi trường (gravity, friction, etc.)
  - ❌ Kéo vật trong viewport
  - ❌ Thay đổi vị trí ban đầu

### PAUSED State
- **Định nghĩa:** Mô phỏng tạm dừng (suspend)
- **Physics:** Không chạy nhưng giữ state hiện tại
- **Objects:** Ở vị trí tạm dừng (không di chuyển)
- **Time:** Giữ nguyên (không tăng)
- **User Actions Allowed:**
  - ✅ Thay đổi BẤT KỲ tham số nào (như STOPPED)
  - ✅ Kéo vật trong viewport
  - ✅ Thay đổi camera
  - ✅ Bấm [Play] để resume (tiếp tục từ điểm tạm dừng)
  - ✅ Bấm [Reset] để quay về vị trí ban đầu

---

## 2.2 Parameter Modification Rules

### 2.2.1 Safe Parameters (Có thể thay đổi khi RUNNING)

#### Force Control
- **Magnitude (Độ lớn lực F):**
  - Slider: 0 - 100 N
  - Thay đổi thực time khi RUNNING
  - Ảnh hưởng ngay lập tức
  
- **Direction (Hướng lực F):**
  - Slider góc (tuỳ cảnh)
  - Thay đổi thực time khi RUNNING
  - Ảnh hưởng ngay lập tức

#### Simulation Control
- **Speed Multiplier:**
  - 0.5x, 1x, 2x, 4x
  - Thay đổi tốc độ tick của physics
  - Có thể bật/tắt pause giữa chừng

#### Display Control
- **Show/Hide Data Panel:** Checkbox
- **Show/Hide Force Vectors:** Dropdown (All/Selected/None)
- **Debug Mode:** Checkbox (wireframe, bbox)

#### Camera Control
- **Orbit:** Right-click + Drag (mọi trạng thái)
- **Zoom:** Scroll (mọi trạng thái)
- **Pan:** Middle-click + Drag (optional)
- **Reset View:** Button

### 2.2.2 Structural Parameters (Chỉ thay đổi khi STOPPED hoặc PAUSED)

| Tham số | Scope | Ảnh hưởng |
|--------|-------|----------|
| **Mass** | Mỗi cảnh | Ảnh hưởng gia tốc & động năng |
| **Shape** | S1, S2, S3 | Ảnh hưởng mass distribution |
| **Dimensions** | S1, S2, S3 | Ảnh hưởng mass moment & collision |
| **Angle θ** | S1 | Ảnh hưởng lực gravity component |
| **Length** | S1 | Ảnh hưởng stopping point |
| **Initial Height** | S2 | Ảnh hưởng thời gian rơi |
| **Friction μ** | S1, S3 | Ảnh hưởng lực ma sát |
| **Restitution** | S4 | Ảnh hưởng bounce behavior |
| **Initial Velocity** | S4 | Ảnh hưởng collision dynamics |
| **Initial Position** | S1, S2, S3, S4 | Ảnh hưởng vị trí bắt đầu |

### 2.2.3 Implementation Strategy

#### Option A: Disable Controls
- Khi RUNNING, disable (grey out) các structural parameters
- UI hiển thị tooltip: "This parameter is locked during simulation"
- Nút play/pause toggle trạng thái

```javascript
// Ví dụ
if (state.isRunning) {
  uiController.massSlider.disabled = true
  uiController.angleSlider.disabled = true
}
```

#### Option B: Show Modal Dialog
- Khi user cố thay đổi structural parameter khi RUNNING
- Hiển thị modal: "Cannot change this while running. Pause first?"
- Có button [Pause] & [Cancel]

```javascript
if (state.isRunning && changedStructuralParam) {
  showModal("Pause simulation first to change this parameter")
  return false
}
```

**Recommendation:** Option A (disable controls) - rõ ràng & không rối

---

## 2.3 Viewport Interaction Rules

### 2.3.1 Object Selection

#### Khi STOPPED hoặc PAUSED:
```
User clicks on object
      ↓
Raycaster detects intersection
      ↓
Object is selected
      ↓
Highlight: emissive color (glow effect)
```

**Visual Feedback:**
- Material: `object.material.emissive.setHex(0xffff00)` (yellow glow)
- Scale: Optional small scale change
- Outline: Optional stroke effect

#### Khi RUNNING:
```
User clicks on object
      ↓
Raycaster detects intersection (READ ONLY)
      ↓
Object is selected (visual only)
      ↓
No interaction allowed
      ↓
Message: "Cannot interact while running"
```

**Visual Feedback:**
- Highlight allowed (emissive glow)
- But NOT draggable
- Show tooltip: "Pause to move object"

### 2.3.2 Object Dragging

#### Khi STOPPED hoặc PAUSED:
```
User clicks + drags object
      ↓
Raycaster enabled, allowDrag = true
      ↓
Object follows mouse in world space
      ↓
New position saved as "initialPosition"
      ↓
Physics body repositioned
```

**Implementation:**
```javascript
// Raycasting with drag
if (!state.isRunning) {
  raycaster.allowDrag = true
  // Calculate intersection plane (based on object position)
  // Convert screen coords to world coords
  // mesh.position = draggedPosition
  // body.position = draggedPosition
}
```

#### Khi RUNNING:
```
User clicks + tries to drag
      ↓
Raycaster enabled, but allowDrag = false
      ↓
Click only highlights object
      ↓
Drag is IGNORED
      ↓
Message: "Cannot drag while running - Pause first"
```

**Implementation:**
```javascript
if (state.isRunning) {
  raycaster.allowDrag = false
  // Only allow selection, not dragging
  if (intersected) {
    object.material.emissive.setHex(0xffff00)
    showTooltip("Pause to move object")
  }
}
```

### 2.3.3 Camera Controls

**Orbit Controls (Always Available):**
```
Right-click + drag → Orbit around target
Scroll → Zoom in/out
Middle-click + drag → Pan (optional)
```

**Reset View Button:**
```
Click [Reset View] → Camera reset to default position
```

**Implementation:**
```javascript
// OrbitControls setup
const controls = new OrbitControls(camera, renderer.domElement)
controls.autoRotate = false
controls.enableZoom = true
controls.enablePan = true
// Always enabled, regardless of state
```

### 2.3.4 Raycasting Implementation Checklist

```javascript
class Raycaster {
  constructor() {
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
    this.allowDrag = true
    this.selectedObject = null
  }
  
  onMouseMove(event) {
    // Update mouse position
    // Cast ray
    // Find intersections
    // Highlight if intersection
  }
  
  onMouseDown(event) {
    if (this.selectedObject && this.allowDrag) {
      // Start dragging
      this.isDragging = true
    }
  }
  
  onMouseDrag(event) {
    if (this.isDragging && this.allowDrag) {
      // Update object position in world space
      // Update physics body position
    }
  }
  
  onMouseUp(event) {
    if (this.isDragging) {
      // End dragging
      // Save new initial position
      this.isDragging = false
    }
  }
  
  // Called every frame
  update(state) {
    this.allowDrag = !state.isRunning
    // Update highlighting based on state
  }
}
```

---

## 2.4 Data Recording & Export System

### 2.4.1 Real-Time Data Panel

**Update Frequency:** Mỗi frame (60 Hz)

**Displayed Data:**
- Time (t): Simulation time in seconds
- Position: (x, y, z) in meters
- Velocity: (v, v_x, v_y, v_z) in m/s
- Acceleration: (a, a_x, a_y, a_z) in m/s²
- Kinetic Energy: Ek in Joules
- Mass: m in kg
- Forces: F, W, N, f, F_net in Newtons

**Data Panel Template:**
```
┌─────────────────────────────┐
│ PHYSICAL DATA              │
├─────────────────────────────┤
│ Time: 5.23 s                │
│ Position: (2.45, 0, 0) m    │
│ Velocity: 12.3 m/s          │
│ Acceleration: 2.5 m/s²      │
│ Kinetic Energy: 378.5 J     │
│ Mass: 5 kg                  │
├─────────────────────────────┤
│ FORCES                      │
│ Applied Force: 50 N         │
│ Gravity: 49 N               │
│ Normal Force: 42.4 N        │
│ Friction: 12.7 N            │
│ Net Force: 24.3 N           │
└─────────────────────────────┘
[Record Data Point] [Clear Records] [Export as CSV]
```

### 2.4.2 Data Point Recording

**How to Record:**
- User bấm button [Record Data Point]
- Snapshot dữ liệu hiện tại được lưu

**Data Structure:**
```javascript
{
  id: "datapoint_001",
  timestamp: 1234567890,      // Unix timestamp
  simulationTime: 5.23,       // t in seconds
  frameNumber: 315,           // 60 fps × 5.23s
  position: { x, y, z },      // in meters
  velocity: { x, y, z },      // in m/s
  acceleration: { x, y, z },  // in m/s²
  kineticEnergy: 378.5,       // in Joules
  mass: 5,                    // in kg
  forces: {
    applied: 50,              // F in N
    gravity: 49,              // W in N
    normal: 42.4,             // N in N
    friction: 12.7,           // f in N
    net: 24.3                 // F_net in N
  },
  sceneSpecific: {
    // S1: angle, length_traveled, etc.
    // S2: height, height_traveled, etc.
    // S3: (none)
    // S4: obj1Position, obj2Position, obj1Velocity, obj2Velocity
  }
}
```

### 2.4.3 Data Recording Panel

**Display:**
- Table view của tất cả recorded data points
- Columns: Timestamp, Time (s), Position (m), Velocity (m/s), Energy (J)
- Sortable, filterable

**Actions:**
- [Delete] button per row (xóa mốc đó)
- [Clear All] button (xóa tất cả mốc)
- [Export as CSV] button (export toàn bộ)

### 2.4.4 CSV Export Format

**File naming:** `physics_simulation_[sceneNumber]_[timestamp].csv`

**Example:**
```csv
Scene,RecordID,FrameNumber,Time_s,X_m,Y_m,Z_m,Vx_ms,Vy_ms,Vz_ms,Ax_ms2,Ay_ms2,Az_ms2,Mass_kg,Ek_J,Force_F_N,Force_W_N,Force_N_N,Force_f_N,Force_Net_N
Scene1,1,0,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,5.00,0.00,0.00,49.00,42.43,0.00,6.57
Scene1,2,5,0.083,0.00,0.00,0.00,0.50,0.00,0.00,2.50,0.00,0.00,5.00,0.63,12.50,49.00,42.43,12.73,12.77
Scene1,3,10,0.167,0.00,0.00,0.00,0.99,0.00,0.00,2.50,0.00,0.00,5.00,2.45,12.50,49.00,42.43,12.73,12.77
...
```

**CSV Headers:**
```
Scene, RecordID, FrameNumber, Time_s, X_m, Y_m, Z_m, 
Vx_ms, Vy_ms, Vz_ms, Ax_ms2, Ay_ms2, Az_ms2, 
Mass_kg, Ek_J, 
Force_F_N, Force_W_N, Force_N_N, Force_f_N, Force_Net_N
```

---

## 2.5 State Management Implementation

### Global State Object

```javascript
// src/state.js
const state = {
  // Playback state
  isRunning: false,
  isPaused: false,
  
  // Current scene
  currentScene: 1,  // 1-4
  
  // Objects in scene
  objects: [
    {
      id: "object_1",
      mesh: THREE.Mesh,
      body: CANNON.Body,
      data: {
        position: { x, y, z },
        velocity: { x, y, z },
        acceleration: { x, y, z },
        mass: 5,
        shape: "box"
      }
    }
  ],
  
  // Parameters (scene-specific)
  parameters: {
    // Global
    gravity: 9.8,
    
    // Scene 1
    angle: 30,
    length: 5,
    friction: 0.3,
    
    // Scene 2
    initialHeight: 20,
    
    // Scene 3
    // (inherits friction)
    
    // Scene 4
    restitution: 0.6,
    object1Mass: 5,
    object2Mass: 3,
    object2InitialVelocity: 0,
  },
  
  // Display options
  display: {
    showDataPanel: true,
    showVectors: "selected",  // "all" | "selected" | "none"
    debugMode: false
  },
  
  // Recorded data points
  recordedData: [
    { /* data point 1 */ },
    { /* data point 2 */ },
    // ...
  ],
  
  // Time tracking
  simulationTime: 0,
  frameCount: 0,
  deltaTime: 0
}
```

### State Transitions

```javascript
// Play
function play() {
  state.isRunning = true
  state.isPaused = false
  startPhysicsLoop()
}

// Pause
function pause() {
  state.isRunning = false
  state.isPaused = true
  stopPhysicsLoop()
}

// Reset
function reset() {
  state.isRunning = false
  state.isPaused = false
  state.simulationTime = 0
  state.frameCount = 0
  
  // Reset all objects to initial positions
  for (const obj of state.objects) {
    obj.mesh.position.copy(obj.initialPosition)
    obj.mesh.quaternion.copy(obj.initialQuaternion)
    obj.body.position.copy(obj.initialPosition)
    obj.body.velocity.set(0, 0, 0)
    obj.body.angularVelocity.set(0, 0, 0)
  }
}

// Resume (Pause → Play)
function resume() {
  state.isRunning = true
  state.isPaused = false
  startPhysicsLoop()
}
```

---

**Next:** Đọc file `03_UI_ARCHITECTURE.md` để hiểu UI layout
