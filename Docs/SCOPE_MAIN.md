# SCOPE CHÍNH: PHYSICS SIMULATION & VISUALIZATION WEB APP
## Physics Education Platform - UIT DHMT Project

---

## 📑 Cấu trúc SCOPE (Modular)

Scope đồ án được chia thành **10 file riêng biệt** để dễ quản lý:

### 1. **SCOPE_MAIN.md** ← Bạn đang đọc
   - File điều phối chính
   - Hướng dẫn sử dụng scope
   - Mục lục toàn bộ

### 2. **01_OVERVIEW.md**
   - Tổng quan dự án
   - Mục tiêu & công nghệ
   - Yêu cầu DHMT

### 3. **02_USER_ACTIONS.md**
   - Global Runtime Rules (3 trạng thái: STOPPED, RUNNING, PAUSED)
   - Parameter Modification Rules
   - Viewport Interaction Rules
   - Data Recording & Export

### 4. **03_UI_ARCHITECTURE.md**
   - Layout chính (sidebar + viewport)
   - SIDEBAR (Control Panel)
     - Scene Navigation
     - Playback Controls
     - Parameters Panel (4 tabs)
     - Display Options
     - Data Export
   - VIEWPORT 3D
   - Statistics Panel

### 5. **04_SCENES.md**
   - Scene 1: Inclined Plane (Mặt phẳng nghiêng)
     - Concept & Structure
     - Parameters
     - Data Display
     - Actions & Constraints
   - Scene 2: Free Fall (Rơi tự do)
   - Scene 3: Horizontal Force (Lực ngang)
   - Scene 4: Collision (Va chạm)

### 6. **05_PHYSICS_SYSTEM.md**
   - Các loại lực (Force Types)
   - Các đại lượng vật lý (Physical Quantities)
   - Công thức cần hiển thị (Formulas)

### 7. **06_CODE_ARCHITECTURE.md**
   - Cấu trúc thư mục (Directory Structure)
   - Data Flow Architecture
   - Core Objects & Classes
   - Key Functions

### 8. **07_GRAPHICS.md**
   - Transformation
   - Projection
   - Lighting & Shading
   - Shadows
   - Texture Mapping
   - Raycasting
   - Material System

### 9. **08_IMPLEMENTATION.md**
   - Main Loop & Physics Sync
   - Fixed Timestep
   - Mesh ↔ Body Synchronization
   - Export & Persistence
   - Implementation Timeline (8 phases)

### 10. **09_DEFENSE.md**
   - Checklist yêu cầu DHMT
   - Code Quality Standards
   - Pedagogical Value
   - Performance Targets
   - Vấn đáp Tips & Sample Questions
   - References & Resources
   - Final Deliverables

---

## 🎯 Cách sử dụng SCOPE

### Khi bắt đầu dự án:
1. Đọc **01_OVERVIEW.md** - Hiểu rõ mục tiêu chung
2. Đọc **02_USER_ACTIONS.md** - Hiểu rõ action người dùng
3. Đọc **03_UI_ARCHITECTURE.md** - Hiểu UI cần xây dựng

### Khi code từng component:
4. Đọc **06_CODE_ARCHITECTURE.md** - Cấu trúc thư mục
5. Đọc file chuyên biệt (04_SCENES.md, 05_PHYSICS_SYSTEM.md, 07_GRAPHICS.md)

### Khi implementation:
6. Theo **08_IMPLEMENTATION.md** - Timeline & Strategy
7. Kiểm tra qua **09_DEFENSE.md** - Checklist

### Khi chuẩn bị defense:
8. Đọc **09_DEFENSE.md** - Vấn đáp tips & references

---

## 📊 Tóm tắt dự án

### Mục tiêu
- **Đối tượng:** Giáo viên & học sinh THCS
- **Chức năng:** Trang web mô phỏng vật lý 3D tương tác
- **Mục đích:** Trực quan hóa hiện tượng vật lý, hiểu công thức

### Công nghệ
- Three.js (Rendering 3D)
- Cannon-es (Physics)
- Lil-gui (UI)
- Stats.js (FPS Monitor)
- OrbitControls (Camera)
- Vite (Build)

### 4 Cảnh Chính
1. **Inclined Plane** - Mặt phẳng nghiêng
2. **Free Fall** - Rơi tự do
3. **Horizontal Force** - Lực ngang
4. **Collision** - Va chạm

### Key Features
- ✅ Real-time parameter adjustment (on-the-fly khi RUNNING)
- ✅ Force vector visualization
- ✅ Data recording & export (CSV)
- ✅ Debug mode (wireframe, bbox)
- ✅ Camera animation (Orbit, Zoom)
- ✅ Play/Pause/Reset controls
- ✅ Selectable object shapes (Box, Sphere, Cylinder)

---

## 🎮 State Management (3 Trạng thái)

```
┌────────────────────────────────────────┐
│         STOPPED (Initial)              │
│  - Không chạy / đã reset               │
│  - Tất cả tham số có thể đổi           │
│  - Có thể kéo vật trong viewport       │
└────────┬─────────────────────────────┘
         │ [Play]
         ↓
┌────────────────────────────────────────┐
│         RUNNING (Active)               │
│  - Mô phỏng đang chạy                  │
│  - Chỉ đổi được: F, angle, camera      │
│  - Không thể kéo vật                   │
└────────┬─────────────────────────────┘
         │ [Pause]
         ↓
┌────────────────────────────────────────┐
│         PAUSED (Suspended)             │
│  - Mô phỏng tạm dừng                   │
│  - Tất cả tham số có thể đổi           │
│  - Có thể kéo vật trong viewport       │
└────────┬──────────────────────────────┘
         │ [Play] hoặc [Reset]
         └─────────────────────────┘
```

---

## 🔄 Data Flow

```
INPUT (User Actions)
        ↓
   [UI Panel]
        ↓
   [State Management]
        ↓
[Physics Engine] ↔ [Calculator]
        ↓
[Three.js Scene] ← Mesh Sync
        ↓
[Renderer]
        ↓
OUTPUT (Visualization + Data Panel + Stats)
```

---

## 📋 Bảng tham chiếu nhanh

### Parameters - Mỗi cảnh có gì?

| Tham số | S1 | S2 | S3 | S4 | Khi RUNNING |
|--------|----|----|----|----|------------|
| Mass | ✅ | ✅ | ✅ | ✅ | DISABLE |
| Shape | ✅ | ✅ | ✅ | - | DISABLE |
| Dimensions | ✅ | ✅ | ✅ | - | DISABLE |
| Angle θ | ✅ | - | - | - | DISABLE |
| Length | ✅ | - | - | - | DISABLE |
| Height | - | ✅ | - | - | DISABLE |
| Friction μ | ✅ | - | ✅ | - | DISABLE |
| Restitution | - | - | - | ✅ | DISABLE |
| Force F mag | ✅ | ✅ | ✅ | ❌ | **ENABLE** |
| Force F ang | ✅ | ✅ | ✅ | ❌ | **ENABLE** |
| Init Velocity | - | - | - | ✅ | DISABLE |
| Gravity | Chung | Chung | Chung | Chung | **ENABLE** |

### Display Data - Mỗi cảnh hiển thị gì?

| Data | S1 | S2 | S3 | S4 |
|------|----|----|----|----|
| Time | ✅ | ✅ | ✅ | ✅ |
| Position | ✅ | ✅ | ✅ | ✅ (2 vật) |
| Velocity | ✅ | ✅ | ✅ | ✅ (2 vật) |
| Acceleration | ✅ | ✅ | ✅ | ✅ (2 vật) |
| Kinetic Energy | ✅ | ✅ | ✅ | ✅ (2 vật) |
| Forces | ✅ | ✅ | ✅ | ✅ |
| Momentum | - | - | - | ✅ |

---

## 🎬 Quick Scene Overview

### Scene 1: Inclined Plane
- **Phương trình:** `a = (F + mg sin(θ) - μmg cos(θ)) / m`
- **Chủ đề:** Phân tích lực trên mặt phẳng nghiêng
- **Mục tiêu:** Hiểu tác động của góc, ma sát, lực lên gia tốc

### Scene 2: Free Fall
- **Phương trình:** `y = h - 1/2 gt²`, `x = 1/2 ax t²`
- **Chủ đề:** Rơi tự do & ném ngang
- **Mục tiêu:** Thấy sự độc lập của chuyển động theo 2 phương

### Scene 3: Horizontal Force
- **Phương trình:** `a = (F - μmg) / m`
- **Chủ đề:** Ma sát & chuyển động ngang
- **Mục tiêu:** Hiểu tác động ma sát lên chuyển động

### Scene 4: Collision
- **Phương trình:** `m₁v₁ + m₂v₂ = m₁v₁' + m₂v₂'`
- **Chủ đề:** Va chạm & bảo toàn động lượng
- **Mục tiêu:** Thấy động lượng được bảo toàn trong va chạm

---

## 🎨 Graphics Checklist (DHMT)

✅ **Transformation:** Translation, Rotation, Scaling
✅ **Projection:** Perspective (FOV adjustable)
✅ **Lighting:** Phong Model (Ambient, Directional, Point)
✅ **Shadows:** PCFSoftShadowMap
✅ **Texture:** UV Mapping + Wrapping
✅ **Raycasting:** Object selection & drag

---

## 🚀 Implementation Strategy

### Phase 1: Setup Infrastructure
- Project structure
- Vite config
- Three.js + Cannon-es initialization
- Main loop

### Phase 2: Core Engine
- PhysicsEngine class
- Renderer class
- SceneManager class
- Lighting & Shadows

### Phase 3-6: Scene Implementation
- Xây dựng từng Scene (Scene 1→4)
- Test physics sync
- Add parameters & UI

### Phase 7: Polish & Export
- Force vectors
- Debug mode
- Data export
- UI refinement

### Phase 8: Defense Prep
- Documentation
- Record demo
- Practice vấn đáp

---

## 📖 Cách đọc files

Mỗi file scope có cấu trúc:
1. **Heading chính** - Chủ đề
2. **Subsections** - Chi tiết
3. **Code examples** - Minh họa
4. **Tables/diagrams** - Tóm tắt

### Tips:
- **Lần đầu:** Đọc ngang toàn bộ để hiểu overview
- **Khi code:** Tham khảo file chuyên biệt từng cần thiết
- **Khi stuck:** Search từ khóa trong tất cả files

---

## 🔗 Mối liên hệ giữa files

```
SCOPE_MAIN.md (Bạn đang đọc)
├── 01_OVERVIEW.md
│   └── "Công nghệ gì cần dùng?"
│   └── "Yêu cầu DHMT?"
│
├── 02_USER_ACTIONS.md
│   └── "Người dùng có thể làm gì?"
│   └── "Trạng thái nào có constraint gì?"
│
├── 03_UI_ARCHITECTURE.md
│   └── "UI cần có gì?"
│   └── "Sidebar bao gồm những gì?"
│
├── 04_SCENES.md
│   └── "Scene X có gì?"
│   └── "Công thức là gì?"
│   └── "Constraints là gì?"
│
├── 05_PHYSICS_SYSTEM.md
│   └── "Các lực nào?"
│   └── "Đại lượng nào cần track?"
│
├── 06_CODE_ARCHITECTURE.md
│   └── "Cấu trúc thư mục?"
│   └── "Classes nào cần?"
│
├── 07_GRAPHICS.md
│   └── "Graphics concepts như thế nào?"
│   └── "Lighting, Shadow setup?"
│
├── 08_IMPLEMENTATION.md
│   └── "Làm theo timeline nào?"
│   └── "Main loop code?"
│
└── 09_DEFENSE.md
    └── "Checklist gì?"
    └── "Câu hỏi vấn đáp?"
```

---

## ⚡ Quick Start Checklist

- [ ] Đọc `01_OVERVIEW.md` - Hiểu overview
- [ ] Đọc `02_USER_ACTIONS.md` - Hiểu user actions
- [ ] Đọc `03_UI_ARCHITECTURE.md` - Hiểu UI layout
- [ ] Đọc `04_SCENES.md` - Hiểu 4 cảnh
- [ ] Đọc `06_CODE_ARCHITECTURE.md` - Hiểu code structure
- [ ] Bắt đầu Phase 1 theo `08_IMPLEMENTATION.md`

---

## 📞 Khi có câu hỏi

**Q: Người dùng có thể làm gì trong trạng thái RUNNING?**
→ Xem `02_USER_ACTIONS.md` → Section 2.2.1

**Q: Scene 1 cần hiển thị những data nào?**
→ Xem `04_SCENES.md` → Section 3.1

**Q: File structure cần như thế nào?**
→ Xem `06_CODE_ARCHITECTURE.md` → Section 5.1

**Q: Cách implement physics sync?**
→ Xem `08_IMPLEMENTATION.md` → Section 9.2-9.3

**Q: Cần implement graphics concepts nào?**
→ Xem `07_GRAPHICS.md` → Tất cả sections

---

**Last Updated:** 2024
**Project:** Physics Simulation Education Web App
**For:** UIT - Computer Graphics (DHMT)
