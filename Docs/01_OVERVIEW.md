# 01_OVERVIEW.md
## Tổng quan dự án Physics Simulation

---

## 1.1 Mục tiêu chính

- **Đối tượng:** Giáo viên và học sinh THCS
- **Chức năng:** Trang web mô phỏng vật lý 3D tương tác
- **Mục đích giáo dục:** Giúp học sinh trực quan hóa các hiện tượng vật lý, hiểu rõ công thức và mối quan hệ giữa các đại lượng vật lý

---

## 1.2 Công nghệ sử dụng

### Frontend Stack
| Công nghệ | Mục đích | Version |
|-----------|---------|---------|
| **Three.js** | Rendering 3D graphics | v143+ (ES6 Module) |
| **Cannon-es** | Physics engine simulation | v0.20+ |
| **Lil-gui** | Parameter UI controls | v0.18+ |
| **Stats.js** | Performance monitoring | Latest |
| **OrbitControls** | Camera control | Three.js examples |
| **Vite** | Build tool & dev server | v4+ |

### Development
| Tool | Sử dụng |
|------|---------|
| **Language** | JavaScript (ES6+) |
| **Package Manager** | npm |
| **Module System** | ES6 Modules |
| **Browser Target** | Desktop (Chrome, Firefox, Safari, Edge) |

---

## 1.3 Yêu cầu từ đề tài DHMT (Computer Graphics)

Dự án **PHẢI** đáp ứng các khái niệm graphics cơ bản:

### ✅ Transformation (Phép biến đổi)
- **Translation:** Dịch chuyển vật trong không gian 3D
- **Rotation:** Xoay vật (sử dụng Quaternion từ physics body)
- **Scaling:** Co giãn vật (kích thước tuỳ thay đổi)
- **Affine Transformations:** Kết hợp các phép biến đổi trên

**Ứng dụng:**
- Vật di chuyển dựa physics: `mesh.position.copy(body.position)`
- Vật xoay theo gravity/collision: `mesh.quaternion.copy(body.quaternion)`
- Mặt phẳng nghiêng xoay: `plane.rotation.z = angle`

### ✅ Projection (Phép chiếu)
- **Perspective Projection:** Sử dụng `THREE.PerspectiveCamera`
- **Parameters:**
  - FOV (Field of View): 40° - 100° (adjustable)
  - Aspect Ratio: window.innerWidth / window.innerHeight
  - Near: 0.01 - 1 (adjustable)
  - Far: 100 - 10000 (adjustable)

**Ứng dụng:**
- Tạo cảnh view 3D chân thực
- Cho phép user điều chỉnh FOV, near, far qua UI

### ✅ Lighting (Ánh sáng)
- **Phong Reflection Model:**
  - Ambient Light: Ánh sáng môi trường (không có hướng)
  - Diffuse Light: Ánh sáng khuếch tán (có hướng, depend trên normal)
  - Specular Light: Ánh sáng phản chiếu sáng (shiny effect)

**Ứng dụng:**
- Material: `MeshPhongMaterial` (support Phong model)
- Ambient Light: `new THREE.AmbientLight(0xffffff, 0.6)`
- Directional Light: `new THREE.DirectionalLight(0xffffff, 0.8)`
- Point Light: `new THREE.PointLight(0xffffff, 1)` (optional)

### ✅ Shadows (Bóng đổ)
- **Shadow Mapping:** Sử dụng `THREE.PCFSoftShadowMapType`
- **Soft Shadows:** PCF (Percentage Closer Filtering) để làm mượt bóng
- **Implementation:**
  ```javascript
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMapType
  light.castShadow = true
  object.castShadow = true
  object.receiveShadow = true
  ```

**Ứng dụng:**
- Vật casts shadow lên mặt phẳng
- Mặt phẳng/sàn receives shadow
- Shadows động theo ánh sáng

### ✅ Texture Mapping (Ánh xạ kết cấu)
- **UV Mapping:** Ánh xạ texture 2D lên bề mặt 3D
- **Wrapping:** `THREE.RepeatWrapping` (repeat texture)
- **Repeating:** Điều chỉnh `texture.repeat.set(x, y)`

**Ứng dụng:**
- Grid texture cho mặt phẳng/sàn
- Metal texture cho vật (optional)
- Wood texture cho incline plane (optional)

### ✅ Raycasting (Phát xạ tia)
- **Object Selection:** Click vật để select
- **Drag Object:** Kéo vật khi STOPPED/PAUSED
- **Implementation:**
  ```javascript
  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(scene.children)
  ```

**Ứng dụng:**
- Select vật để highlight
- Drag vật để thay đổi initial position
- Disable drag khi RUNNING

---

## 1.4 Yêu cầu về Code Quality

### Code Structure
- ✅ Modular ES6 code (mỗi file có 1 mục đích rõ ràng)
- ✅ Separation of concerns (Physics, Graphics, UI, Input riêng biệt)
- ✅ No global state (centralized state management)
- ✅ Proper error handling

### Documentation
- ✅ Vietnamese comments explaining:
  - Graphics concepts (Transformation, Projection, Lighting, etc.)
  - Physics formulas (a = F/m, Ek = 1/2 mv², etc.)
  - Code logic (why, not just what)
- ✅ README.md (Vietnamese) với:
  - Setup instructions
  - Keyboard shortcuts
  - Feature list
  - Graphics concepts explanation

### Memory Management
- ✅ Proper disposal on scene cleanup
- ✅ No memory leaks
- ✅ Texture/Geometry/Material disposal khi không dùng

---

## 1.5 Yêu cầu về Performance

### Target Metrics
- **FPS:** 60 FPS stable (monitored by Stats.js)
- **Render Time:** < 16.67ms per frame
- **Physics Update:** Fixed 1/60 timestep
- **Memory:** < 500MB (reasonable for web app)

### Optimization Tips
- Use appropriate shadow map size (1024x1024 or 2048x2048)
- Limit number of lights (typically 3-4)
- Use efficient geometries (no over-detailed meshes)
- Batch static objects if many

---

## 1.6 Browser Compatibility

### Target Browsers
- ✅ Google Chrome (latest)
- ✅ Mozilla Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

### Requirements
- WebGL 2.0 support
- ES6 Module support
- Modern CSS Grid/Flexbox support

### NOT Supported
- ❌ Mobile/Tablet (Desktop only)
- ❌ Internet Explorer (too old)
- ❌ Very old browsers (IE11, old Safari)

---

## 1.7 Project Structure Summary

```
physics-simulator/
├── index.html              # Entry point
├── package.json           
├── vite.config.js         # Build config
│
├── src/                   # Source code
│   ├── main.js           # Main loop & initialization
│   ├── state.js          # Global state
│   ├── constants.js      # Constants & defaults
│   │
│   ├── engine/           # Core 3D/Physics
│   │   ├── physics.js    # Cannon-es setup
│   │   ├── view.js       # Three.js scene/camera/renderer
│   │   └── sceneManager.js
│   │
│   ├── scenes/           # 4 Physics scenes
│   │   ├── scene1_incline.js
│   │   ├── scene2_freefall.js
│   │   ├── scene3_horizontal.js
│   │   └── scene4_collision.js
│   │
│   ├── components/       # Reusable components
│   │   ├── geometries.js # Object factories
│   │   ├── materials.js  # Material definitions
│   │   └── lights.js     # Lighting setup
│   │
│   ├── visualization/    # Visual helpers
│   │   ├── vectorHelpers.js
│   │   ├── debugHelpers.js
│   │   └── gridHelper.js
│   │
│   ├── interaction/      # User input
│   │   ├── input.js
│   │   ├── raycasting.js
│   │   └── controls.js
│   │
│   ├── ui/              # UI panels
│   │   ├── uiManager.js
│   │   ├── panels.js
│   │   └── stats.js
│   │
│   ├── physics/         # Physics utilities
│   │   ├── calculator.js
│   │   ├── forceManager.js
│   │   └── constraints.js
│   │
│   └── utils/           # Utilities
│       ├── logger.js
│       ├── data.js
│       └── helpers.js
│
├── assets/              # Static assets
│   ├── textures/
│   │   ├── grid.png
│   │   ├── wood.png
│   │   └── metal.png
│   └── models/
│       └── teapot.json
│
└── README.md            # Project documentation (Vietnamese)
```

---

## 1.8 Tech Stack Decision Rationale

### Why Three.js?
- ✅ Best in class 3D library for web
- ✅ Excellent documentation & examples
- ✅ Large community & active development
- ✅ Good integration with other libraries
- ✅ Mobile-friendly (we disable it anyway)

### Why Cannon-es?
- ✅ Pure JavaScript implementation
- ✅ No need for Emscripten compilation
- ✅ Works in all modern browsers
- ✅ Good physics accuracy for educational purposes
- ✅ Easy to integrate with Three.js

### Why Lil-gui?
- ✅ Lightweight & simple
- ✅ Great for parameter adjustment
- ✅ Mobile friendly (we can disable)
- ✅ Easy to organize into folders/tabs
- ✅ No jQuery dependency

### Why Vite?
- ✅ Fast development server
- ✅ ES6 Module support out of the box
- ✅ Excellent build optimization
- ✅ Hot Module Replacement (HMR)
- ✅ No webpack complexity

---

## 1.9 Success Criteria

### Minimum Requirements (Pass)
- ✅ 4 scenes fully functional
- ✅ Basic UI controls working
- ✅ Physics simulation accurate
- ✅ All 6 graphics concepts implemented
- ✅ Code modular & commented

### Good Requirements (Merit)
- ✅ All of above +
- ✅ Smooth animations
- ✅ Force vector visualization
- ✅ Data export working
- ✅ Debug mode functional
- ✅ Professional UI

### Excellent Requirements (Honors)
- ✅ All of above +
- ✅ Camera animations (zoom, rotation)
- ✅ Advanced textures
- ✅ 60 FPS consistent
- ✅ Extensive Vietnamese documentation
- ✅ Impressive visual effects
- ✅ Excellent code architecture

---

**Next:** Đọc file `02_USER_ACTIONS.md` để hiểu user actions & constraints
