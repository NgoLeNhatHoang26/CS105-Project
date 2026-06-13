# Physics Sim — Tổng quan đồ án

**Physics Simulation** là web app mô phỏng vật lý 3D tương tác, phục vụ giáo dục THCS và đồ án **Đồ họa máy tính (DHMT)** — UIT CS431.

---

## Mục tiêu

- Trực quan hóa bốn hiện tượng vật lý cơ bản trong không gian 3D.
- Cho phép chỉnh tham số, chạy mô phỏng, đọc số liệu thời gian thực và so sánh với công thức lý thuyết.
- Kết hợp **mô phỏng vật lý** với các **kỹ thuật đồ họa 3D** (Three.js / WebGL).

**Đối tượng sử dụng:** giáo viên, học sinh THCS, giảng viên chấm đồ án.

---

## Bốn cảnh mô phỏng

| # | Cảnh | Công thức chính | Tài liệu |
|---|------|-----------------|----------|
| 1 | Mặt phẳng nghiêng | `a = (F + mg sin θ − μmg cos θ) / m` | [SCENE1_MAT_PHANG_NGHIENG.md](./SCENE1_MAT_PHANG_NGHIENG.md) |
| 2 | Rơi tự do / ném | `y = h − ½gt²`, `v_y = gt` | [SCENE2_ROI_TU_DO.md](./SCENE2_ROI_TU_DO.md) |
| 3 | Lực ngang | `a = (F − μmg) / m` | [SCENE3_LUC_NGANG.md](./SCENE3_LUC_NGANG.md) |
| 4 | Va chạm 1D | `p = m₁v₁ + m₂v₂`, hệ số phục hồi `e` | [SCENE4_VA_CHAM.md](./SCENE4_VA_CHAM.md) |

Hướng dẫn cài đặt và thao tác chung: [HUONG_DAN_SU_DUNG.md](./HUONG_DAN_SU_DUNG.md).

---

## Công nghệ

| Thành phần | Vai trò |
|------------|---------|
| **Three.js** (v0.170) | Rendering 3D: geometry, material, ánh sáng, bóng, texture, raycasting |
| **Vite** (v5) | Dev server và build production |
| **lil-gui** | Panel tham số và tùy chọn hiển thị |
| **Stats.js** | Theo dõi FPS (góc viewport) |
| **OrbitControls** | Xoay / zoom camera |
| **Integrators tùy chỉnh** | Vật lý analytic / Euler cố định `dt = 1/60 s` — không dùng engine vật lý bên thứ ba |

**Ngôn ngữ:** JavaScript ES6 modules · **Môi trường:** trình duyệt desktop (Chrome, Firefox, Edge).

---

## Kiến trúc ứng dụng

```
index.html
  └── src/main.js          ← vòng lặp render + physics
        ├── engine/view.js         ← WebGL renderer, camera, shadow map
        ├── engine/sceneManager.js ← load / reset scene
        ├── scenes/                  ← 4 scene vật lý
        ├── physics/integrators/     ← incline, freeFall, horizontal, collision1d
        ├── ui/uiManager.js          ← lil-gui, panel dữ liệu, công thức
        ├── visualization/           ← vector lực, lưới sàn, starfield
        ├── interaction/             ← OrbitControls, raycasting, kéo vật
        └── graphics/                ← texture, GLTF loader, hình vật thí nghiệm
```

**Luồng mỗi frame:** đọc input → tích phân vật lý (nếu RUNNING) → đồng bộ mesh → cập nhật panel dữ liệu & vector lực → render.

---

## Giao diện (layout 3 cột)

| Khu vực | Nội dung |
|---------|----------|
| **Sidebar trái** | Playback, chế độ Di chuyển / Xoay, tham số lil-gui, hướng dẫn |
| **Viewport giữa** | Canvas WebGL 3D |
| **Panel phải (Phân tích)** | Dữ liệu vật lý real-time, ghi mốc, export CSV, công thức theo scene |

Toggle **Panel dữ liệu** (folder Hiển thị) ẩn/hiện toàn bộ panel phải.

---

## Đáp ứng yêu cầu DHMT

### 1. Hình khối 3D

- `BoxGeometry`, `SphereGeometry`, `PlaneGeometry`, `ExtrudeGeometry` (mặt dốc), `LatheGeometry` (teapot), …
- File: `src/components/geometries.js`, `src/graphics/experimentObjectFactory.js`, `src/scenes/scene1_incline.js`, `src/visualization/gridHelper.js`
- Đổi hình vật qua **Tham số → Thuộc tính → Vật thí nghiệm → Hình dạng**

### 2. Chiếu phối cảnh (Perspective)

- `PerspectiveCamera` với FOV, near, far chỉnh trong **Tham số → Projection**
- Vị trí camera: **Thuộc tính → Vị trí camera**
- Reset góc nhìn: nút **View** trên toolbar

### 3. Ánh sáng & bóng đổ

- `AmbientLight` + `DirectionalLight` (cast shadow) + `PointLight`
- Shadow map: `PCFSoftShadowMap`, kích thước 2048×2048
- Điều chỉnh: **Thuộc tính → Chiếu sáng** (cường độ, bật/tắt bóng)
- File: `src/components/lights.js`, `src/engine/view.js`

### 4. Texture mapping

- Texture procedural vẽ trên Canvas → `CanvasTexture` (checker, wood, metal, brick, marble)
- Lưới sàn thí nghiệm trên `PlaneGeometry`
- File: `src/graphics/proceduralTextures.js`, `src/visualization/gridHelper.js`

### 5. Biến đổi affine

- **Tịnh tiến:** vật lý cập nhật `simState.position` → `syncMeshFromState`
- **Xoay:** chế độ Xoay trên toolbar, phím `[` `]` / `'` `\`, hoặc slider trong Thuộc tính
- **Scale:** slider Scale trong Thuộc tính
- File: `src/components/simSync.js`, `src/interaction/raycasting.js`

### 6. Raycasting

- Chọn và kéo vật khi STOPPED/PAUSED; highlight emissive khi hover
- File: `src/interaction/raycasting.js`, `src/interaction/dragConstraints.js`

### 7. Load model GLB/GLTF

- Chỉ thay lớp hiển thị; vật lý giữ nguyên
- **Thuộc tính → Load model (GLB/GLTF)**

---

## Cấu trúc thư mục chính

```
CS431-Project/
├── index.html
├── package.json
├── public/models/          ← sample.glb (tuỳ chọn)
├── Docs/                   ← tài liệu dự án
└── src/
    ├── main.js
    ├── constants.js        ← tham số mặc định 4 scene
    ├── state.js
    ├── engine/
    ├── scenes/             ← scene1_incline … scene4_collision
    ├── physics/
    ├── ui/
    ├── visualization/
    ├── interaction/
    └── graphics/
```

---

## Demo bảo vệ (gợi ý ~5–7 phút)

1. **Chạy app** — `npm run dev`, chỉ FPS ~60 (Stats.js).
2. **Scene 1** — đổi θ, bật vector lực `all`, Play, so sánh `F_net` / `a` với công thức panel phải.
3. **Scene 2** — h = 20 m, F = 0 → thời gian rơi; thêm F ngang → parabol.
4. **Scene 3** — F < μmg → đứng yên; tăng F → chuyển động.
5. **Scene 4** — va trực diện, so sánh `p`, `ΔEk` trước/sau va.
6. **Đồ họa** — đổi texture vật, bật/tắt shadow, chỉnh FOV, kéo vật bằng raycast.

---

*Tài liệu đồng bộ với mã nguồn hiện tại. Cập nhật: 2026.*
