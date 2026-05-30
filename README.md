# Physics Simulation — Mô phỏng vật lý 3D

Đồ án Đồ họa máy tính (DHMT) — Web app mô phỏng vật lý tương tác cho THCS.

## Công nghệ

- **Three.js** — rendering 3D (transformation, projection, lighting, shadows, texture, raycasting)
- **Cannon-es** — physics engine
- **Vite** — build & dev server
- **lil-gui** — điều khiển tham số
- **Stats.js** — theo dõi FPS

## Cài đặt & chạy

```bash
npm install
npm run dev
```

Phím tắt: **Space** = Play/Pause, **R** = Reset.

Mở trình duyệt desktop (Chrome/Firefox/Edge) tại `http://localhost:5173`.

---

## Đáp ứng yêu cầu Đồ họa máy tính (DHMT)

### 1. Vẽ các khối hình cơ bản

| Hình | Geometry | Vị trí |
|------|----------|--------|
| Box (hình hộp) | `BoxGeometry` | Scene 1–3 (physics objects) + Graphics Showcase |
| Sphere (hình cầu) | `SphereGeometry` | Scene 2–4 (physics objects) + Graphics Showcase |
| Cone (hình nón) | `ConeGeometry` | **Graphics Showcase** (visual demo) |
| Cylinder (hình trụ) | `CylinderGeometry` | **Graphics Showcase** (visual demo) |
| Wheel (bánh xe) | `TorusGeometry` + `CylinderGeometry` + spoke boxes | **Graphics Showcase** |
| Teapot (ấm trà) | `LatheGeometry` (teapot profile) | **Graphics Showcase** |

**Xem showcase:** GUI → *Đồ họa máy tính → Khối hình cơ bản → Camera → Showcase*.

File: `src/graphics/graphicsShowcase.js`

---

### 2. Chiếu phối cảnh (Perspective Projection)

- `PerspectiveCamera` với `fov`, `near`, `far` có thể điều chỉnh trực tiếp.
- Khi thay đổi → `camera.updateProjectionMatrix()` được gọi tự động.
- **GUI:** *Tham số → Projection* (FOV, Near, Far).
- **Vị trí camera (X, Y, Z):** *Đồ họa máy tính → Vị trí camera* — đặt position camera + `controls.update()`.
- Reset camera: nút **View** trên toolbar.
- Giá trị được clamp để tránh canvas đen.

File: `src/engine/view.js`, `src/ui/uiManager.js`

---

### 3. Phép biến đổi Affine

| Phép | Demo |
|------|------|
| **Tịnh tiến (Translation)** | Slider X / Y / Z dời TorusKnot demo khỏi vị trí gốc |
| **Quay (Rotation)** | Slider Xoay X° / Y° / Z° — Euler XYZ, cập nhật `mesh.rotation` |
| **Tỉ lệ (Scale)** | Slider Tỉ lệ → `mesh.scale.setScalar(s)` |

**GUI:** *Đồ họa máy tính → Biến đổi Affine (Demo)* — nút *Reset Transform* về gốc.

Ngoài ra, mỗi physics scene thể hiện **Translation** thông qua `syncMeshFromBody` (mesh đồng bộ từ Cannon body mỗi bước), và scene 1 **Rotation** ramp khi đổi góc θ.

File: `src/graphics/graphicsShowcase.js`, `src/ui/uiManager.js`

---

### 4. Chiếu sáng đối tượng

| Loại ánh sáng | Triển khai | GUI điều chỉnh |
|---------------|-----------|----------------|
| **Ambient Light** | `AmbientLight(0xffffff, 0.55)` | *Chiếu sáng → Ambient* |
| **Directional Light** | `DirectionalLight(0xffffff, 0.85)` tại (15, 25, 12) | *Chiếu sáng → Directional* |
| **Point Light** | `PointLight(0xffa060, 0.55, 35)` tại (4, 10, 6) | *Chiếu sáng → Point Light / Point Intensity* |

Material: `MeshPhongMaterial` cho physics objects; `MeshStandardMaterial` cho showcase objects (PBR).

File: `src/components/lights.js`

---

### 5. Shadow Mapping

```javascript
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
directional.castShadow = true;
directional.shadow.mapSize = { width: 2048, height: 2048 };
```

- Tất cả physics objects: `castShadow = true`.
- Floor / ramp: `receiveShadow = true`.
- Showcase objects: `castShadow = receiveShadow = true`.
- Shadow frustum directional light: x ∈ [−25, 30] bao phủ cả showcase area (x ≈ 14–28).
- **Toggle:** *Đồ họa máy tính → Chiếu sáng → Bóng đổ (Shadows)*.

File: `src/engine/view.js`, `src/components/lights.js`

---

### 6. Texture Mapping

| Texture | Loại | Vị trí |
|---------|------|--------|
| Grid (lưới) | `CanvasTexture` procedural | Sàn (floor) & ramp của 4 scenes |
| Checker | `CanvasTexture` procedural | Showcase demo — chọn trong GUI |
| Wood (gỗ) | `CanvasTexture` procedural | Showcase demo |
| Metal (kim loại) | `CanvasTexture` procedural | Showcase demo |
| Brick (gạch) | `CanvasTexture` procedural | Showcase demo |
| Marble (đá hoa) | `CanvasTexture` procedural | Showcase demo |

Tất cả texture dùng `RepeatWrapping` + `repeat.set(...)` để tile đúng UV.

**GUI:** *Đồ họa máy tính → Texture demo → Chọn texture* áp texture lên showcase objects.

File: `src/graphics/proceduralTextures.js`, `src/visualization/gridHelper.js`

---

### 7. Load model từ file (GLB/GLTF)

- **GLTFLoader** (`src/graphics/modelLoader.js`) — chọn file hoặc dùng `/models/sample.glb` trong `public/models/`.
- Model chỉ thay **lớp hiển thị**; collider Cannon (box/sphere/cylinder proxy) **giữ nguyên** để physics ổn định.
- **GUI:** *Thuộc tính → Load model (GLB/GLTF)*.

---

### 8. Animation / Chuyển động 3D

Thể hiện qua 4 scene vật lý:

| Scene | Chuyển động |
|-------|------------|
| Mặt phẳng nghiêng | Vật trượt dọc ramp, có/không có lực F, ma sát μ |
| Rơi tự do | Vật rơi tự do + ném ngang (quỹ đạo parabol) |
| Lực ngang | Tăng tốc / giảm tốc trên mặt ngang |
| Va chạm 1D | Hai vật va chạm, bảo toàn động lượng, hệ số e |

Animation loop cố định `dt = 1/60 s` để đảm bảo tính toán vật lý ổn định.

---

## 4 Scene vật lý

1. **Mặt phẳng nghiêng** — `a = (F + mg sinθ − μmg cosθ) / m`
2. **Rơi tự do / ném ngang** — `y = h − ½gt²`, lực F tạo `a_x`
3. **Lực ngang + ma sát** — `a = (F − μmg) / m`
4. **Va chạm** — bảo toàn động lượng, hệ số hồi phục `e`

## Điều khiển

| Thao tác | Mô tả |
|----------|--------|
| **Play** | Bắt đầu / tiếp tục mô phỏng |
| **Pause** | Tạm dừng |
| **Reset** | Về trạng thái ban đầu |
| **Reset View** | Camera mặc định |
| Chuột trái + kéo | Orbit camera |
| Scroll | Zoom |
| Click + kéo (STOPPED/PAUSED) | Chọn và **kéo vật** đổi vị trí ban đầu |
| Kéo nền trống | Xoay camera (Orbit) |

### Trạng thái RUNNING

- Chỉ đổi được: lực F (scene 1–3), tốc độ mô phỏng, hiển thị, camera
- Scene 4: khóa mọi tham số khi đang chạy

## Cấu trúc mã

```
src/
├── graphics/
│   ├── proceduralTextures.js   ← Texture generators
│   ├── experimentObjectFactory.js ← Primitives + wheel + teapot lathe
│   ├── modelLoader.js          ← GLTF/GLB load + fit scale
│   └── applySceneModels.js     ← Gắn model lên vật thí nghiệm
├── components/
│   ├── lights.js               ← Ambient + Directional + Point light
│   └── materials.js
├── engine/
│   ├── view.js                 ← Camera, renderer, shadow map, setShadows()
│   └── physics.js
├── scenes/                     ← 4 physics scenes (không thay đổi)
├── ui/
│   └── uiManager.js            ← lil-gui (physics params + buildGraphicsPanel)
└── visualization/
    └── gridHelper.js           ← Grid texture mapping cho floor/ramp
```

## Demo bảo vệ (gợi ý ~7 phút)

1. **Physics scenes** (4 phút)
   - Scene 1: đổi góc θ → Play → quan sát gia tốc & bóng đổ
   - Scene 2: h=20, F ngang → quỹ đạo parabol
   - Scene 3: F < ma sát → vật đứng yên
   - Scene 4: so sánh momentum trước/sau va chạm

2. **Graphics Demo** (3 phút)
   - GUI → *Đồ họa máy tính → Khối hình cơ bản → Camera → Showcase*
   - Chỉ cho thấy 6 primitive shapes (Box, Sphere, Cone, Cylinder, Wheel, Teapot)
   - Affine: kéo slider Tịnh tiến X → Translation; Xoay Y° → Rotation; Tỉ lệ → Scale
   - Đổi Texture demo: wood, metal, brick...
   - Toggle Point Light, Shadows
   - Chỉnh FOV để giải thích perspective projection
   - Camera → Vật lý để quay lại simulation
