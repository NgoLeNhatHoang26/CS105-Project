# 04_SCENES.md
## 4 Physics Scenes - Chi tiết & Actions

---

## Scene 1: Inclined Plane (Mặt phẳng nghiêng)

### Physics Concepts
- **Chủ đề:** Chuyển động trên mặt phẳng nghiêng
- **Công thức chính:** `a = (F + mg sin(θ) - μmg cos(θ)) / m`
- **Bài học:** Phân tích lực, tác động của góc dốc, ma sát

### Scene Structure
```
        ▲ (Top of incline)
       /│
      / │ θ (angle)
     /  │
    /   │ Length
   /    │
  /_____|________
        ↓ (Bottom)
```

**Components:**
- Mặt phẳng nghiêm: Plane geometry, rotated by θ
- Vật (Box): Khởi tạo ở đỉnh dốc (top)
- Reset position: Luôn quay về đỉnh dốc

### Parameters (Scene 1)

| Tham số | Range | Default | Unit | Type |
|--------|-------|---------|------|------|
| Mass (m) | 0.1 - 50 | 5 | kg | RUNNING: DISABLE |
| Angle (θ) | 0° - 90° | 30° | degree | RUNNING: DISABLE |
| Length (L) | 1 - 10 | 5 | m | RUNNING: DISABLE |
| Friction (μ) | 0 - 1.0 | 0.3 | [none] | RUNNING: DISABLE |
| Force F mag | 0 - 100 | 0 | N | RUNNING: **ENABLE** |
| Force F ang | -90° - +90° | 0° | degree | RUNNING: **ENABLE** |
| Gravity (g) | 0 - 20 | 9.8 | m/s² | Global |

### Display Data (Scene 1)

```
REAL-TIME DATA:
├─ Time: 5.23 s
├─ Position along incline: 2.45 m
├─ Velocity: 8.5 m/s
├─ Acceleration: 1.8 m/s²
├─ Kinetic Energy: 180.3 J
└─ Mass: 5 kg

FORCES DISPLAY:
├─ Applied Force (F): 50 N (direction: angle)
├─ Weight Component (mg sin θ): 24.5 N (down incline)
├─ Normal Force (N): 42.4 N (⊥ surface)
├─ Friction Force (f = μN): 12.7 N (opposite motion)
└─ Net Force: 24.3 N (net along incline)
```

### Formulas to Display

```
// Basic
a = (F + mg sin(θ) - μmg cos(θ)) / m
v = a × t
s = 1/2 × a × t²

// Energy
Ek = 1/2 × m × v²

// Force components
W_parallel = m × g × sin(θ)
W_perpendicular = m × g × cos(θ)
N = m × g × cos(θ)
f = μ × N
F_net = F + mg sin(θ) - μmg cos(θ)
```

### User Actions & Constraints (Scene 1)

**Hành động chính:**
1. Chỉnh góc dốc (θ) → Ảnh hưởng gia tốc
2. Chỉnh hệ số ma sát (μ) → Ảnh hưởng lực cản
3. Chỉnh khối lượng (m) → Ảnh hưởng gia tốc (nếu không có lực)
4. Chỉnh lực tác dụng F → Ảnh hưởng ngay tức thì
5. Chỉnh hướng lực F → Chỉnh hướng vector

**Constraints:**

✅ **STOPPED/PAUSED:**
- Thay đổi tất cả tham số (θ, μ, m, L, shape)
- Kéo vật để đặt vị trí ban đầu (nếu cần)

✅ **RUNNING:**
- CHỈ thay đổi: Force F magnitude & direction
- Disable: θ, μ, m, L, shape

**Vật dừng khi:**
- Di chuyển hết chiều dài mặt phẳng (x ≥ L)
- Tự động dừng, không rơi xuống

**Reset:**
- Đưa vật về đỉnh dốc (x = 0)
- Reset thời gian = 0

### Graphics Implementation (Scene 1)

| Concept | How |
|---------|-----|
| Transformation | Plane: rotate by θ. Object: translate on incline |
| Projection | PerspectiveCamera (FOV adjustable) |
| Lighting | Phong model: Ambient + Directional + shadow |
| Shadows | PCFSoftShadowMap: Plane receives, object casts |
| Texture | Grid texture on incline (UV mapping) |
| Raycasting | Click object to select, drag to reposition |

---

## Scene 2: Free Fall (Rơi tự do)

### Physics Concepts
- **Chủ đề:** Rơi tự do & ném ngang (projectile motion)
- **Công thức chính:** 
  - `y = h - 1/2 × g × t²`
  - `x = 1/2 × a_x × t²`
  - `v_y = -g × t`
  - `v_x = a_x × t`
- **Bài học:** Độc lập chuyển động theo 2 phương

### Scene Structure
```
        ▲ h (Initial height)
        │ ●──────────────────→ v_x (horizontal velocity)
        │                     ↓
        │                     ▼ v_y (increasing downward)
        │                        ↓
        │                           ↓
        │                              ●
        │────────────────────────────────── (Ground)
        └────────────────────────────────┘
```

**Components:**
- Sky: Blue gradient background
- Object: Sphere/Box at height h
- Ground: Plane at y = 0
- Grid lines: Reference axes

### Parameters (Scene 2)

| Tham số | Range | Default | Unit | Type |
|--------|-------|---------|------|------|
| Mass (m) | 0.1 - 50 | 5 | kg | RUNNING: DISABLE |
| Initial Height (h) | 1 - 100 | 20 | m | RUNNING: DISABLE |
| Force F mag | 0 - 100 | 0 | N | RUNNING: **ENABLE** |
| Force F ang (horizontal) | 0° - 360° | 0° | degree | RUNNING: **ENABLE** |
| Force F ang (vertical) | -90° - +90° | 0° | degree | RUNNING: **ENABLE** |
| Gravity (g) | 0 - 20 | 9.8 | m/s² | Global |

### Display Data (Scene 2)

```
REAL-TIME DATA:
├─ Time: 2.05 s
├─ Height (Y): 14.5 m
├─ Horizontal Distance (X): 8.3 m
├─ Velocity (horizontal): 3.5 m/s
├─ Velocity (vertical): -20.1 m/s
├─ Total Velocity: 20.4 m/s
├─ Kinetic Energy: 1040 J
└─ Mass: 5 kg

ACCELERATION:
├─ Horizontal: 0.7 m/s² (from Force F)
└─ Vertical: -9.8 m/s² (gravity)
```

### Formulas to Display

```
// Motion equations
y = h - 1/2 × g × t²
x = 1/2 × a_x × t²
v_y = -g × t
v_x = a_x × t

// Energy
Ek = 1/2 × m × (v_x² + v_y²)

// Stopping condition
y = 0 → t_impact = sqrt(2 × h / g)
```

### User Actions & Constraints (Scene 2)

**Hành động chính:**
1. Chỉnh chiều cao ban đầu (h) → Ảnh hưởng thời gian rơi
2. Chỉnh khối lượng (m) → Không ảnh hưởng thời gian rơi
3. Chỉnh lực ngang F (magnitude & direction) → Tạo ném ngang/parabol

**Constraints:**

✅ **STOPPED/PAUSED:**
- Thay đổi tất cả tham số (h, m, shape)
- Kéo vật để đặt vị trí ban đầu

✅ **RUNNING:**
- CHỈ thay đổi: Force F
- Disable: h, m, shape

**Vật dừng khi:**
- Chạm đất (y ≤ 0)
- Tự động dừng lại

**Reset:**
- Đưa vật về độ cao h
- Reset vị trí ngang = 0
- Reset thời gian = 0

### Graphics Implementation (Scene 2)

| Concept | How |
|---------|-----|
| Transformation | Object: translate down (y decreases), translate horizontal |
| Projection | PerspectiveCamera with wider view (taller world) |
| Lighting | Phong: Sky light + ground shadows |
| Shadows | Object casts shadow on ground |
| Texture | Grid on ground, sky gradient background |
| Raycasting | Select object (but limited - mostly trajectory) |

---

## Scene 3: Horizontal Force (Lực ngang)

### Physics Concepts
- **Chủ đề:** Chuyển động ngang với ma sát
- **Công thức chính:** `a = (F - μmg) / m`
- **Bài học:** Tác động ma sát lên chuyển động

### Scene Structure
```
    ┌────────────────────────────┐
    │   ●──────F──────→          │
    │   ↑                        │
    │   f (friction) ←          │
    │                            │
    └────────────────────────────┘
      (Frictionless boundary)
```

**Components:**
- Floor: Plane at y = 0 (with texture grid)
- Object: Box at center
- Boundaries: Invisible walls (prevent falling off)
- Grid floor: Visual reference

### Parameters (Scene 3)

| Tham số | Range | Default | Unit | Type |
|--------|-------|---------|------|------|
| Mass (m) | 0.1 - 50 | 5 | kg | RUNNING: DISABLE |
| Friction (μ) | 0 - 1.0 | 0.3 | [none] | RUNNING: DISABLE |
| Force F mag | 0 - 100 | 0 | N | RUNNING: **ENABLE** |
| Force F ang | 0° - 360° | 0° | degree | RUNNING: **ENABLE** |
| Gravity (g) | 0 - 20 | 9.8 | m/s² | Global |

### Display Data (Scene 3)

```
REAL-TIME DATA:
├─ Time: 4.50 s
├─ Position (X, Z): (8.3, -2.1) m
├─ Velocity: 12.5 m/s
├─ Acceleration: 1.2 m/s²
├─ Kinetic Energy: 390.6 J
└─ Mass: 5 kg

FORCES:
├─ Applied Force (F): 50 N
├─ Weight: 49 N (downward, balanced by Normal)
├─ Normal Force (N): 49 N
├─ Friction Force (f = μN): 14.7 N (opposite motion)
└─ Net Force (horizontal): 35.3 N
```

### Formulas to Display

```
// Motion
a = (F - f) / m
a = (F - μmg) / m
v = a × t
s = 1/2 × a × t² + v₀ × t

// Forces
N = m × g (vertical, balanced)
f = μ × N = μ × m × g
F_net = F - f

// Energy
Ek = 1/2 × m × v²
```

### User Actions & Constraints (Scene 3)

**Hành động chính:**
1. Chỉnh khối lượng (m) → Ảnh hưởng ma sát tuyệt đối
2. Chỉnh hệ số ma sát (μ) → Ảnh hưởng lực cản
3. Chỉnh lực ngang F → Ảnh hưởng ngay tức thì
4. Chỉnh hướng lực (0° - 360°) → Thay đổi hướng vector

**Constraints:**

✅ **STOPPED/PAUSED:**
- Thay đổi tất cả tham số (m, μ, shape, size)
- Kéo vật để đặt vị trí ban đầu

✅ **RUNNING:**
- CHỈ thay đổi: Force F
- Disable: m, μ, shape, size

**Vật dừng khi:**
- Chạm biên scene
- Hoặc vận tốc giảm = 0 (nếu F < f)

**Reset:**
- Đưa vật về tâm scene
- Reset thời gian = 0

### Graphics Implementation (Scene 3)

| Concept | How |
|---------|-----|
| Transformation | Object: translate on horizontal plane (x, z) |
| Projection | Top-down or angled view |
| Lighting | Floor light + shadow from object |
| Shadows | Object casts shadow on floor |
| Texture | Detailed grid texture on floor |
| Raycasting | Select & drag object |

---

## Scene 4: Collision (Va chạm)

### Physics Concepts
- **Chủ đề:** Va chạm & bảo toàn động lượng
- **Công thức chính:** 
  - `m₁v₁ + m₂v₂ = m₁v₁' + m₂v₂'` (momentum conservation)
  - `e = (v₂' - v₁') / (v₁ - v₂)` (coefficient of restitution)
- **Bài học:** Động lượng bảo toàn, năng lượng mất mát

### Scene Structure
```
    Object 1         Object 2
       ●─────────→  ●
    (stationary)  (moving)
                     │
                     ↓
                  Collision!
                     │
    ●────←  →────●
   (moving)  (moving)
```

**Components:**
- Object 1: Box (mặc định)
- Object 2: Sphere (mặc định)
- Arena: Closed space (boundaries prevent objects falling out)
- Lighting: Multiple lights for dramatic collision effect

### Parameters (Scene 4)

| Tham số | Range | Default | Unit | Type |
|--------|-------|---------|------|------|
| Object 1 Mass | 0.1 - 50 | 5 | kg | RUNNING: DISABLE |
| Object 2 Mass | 0.1 - 50 | 3 | kg | RUNNING: DISABLE |
| Object 2 Init Vel | 0 - 20 | 5 | m/s | RUNNING: DISABLE |
| Restitution (e) | 0 - 1.0 | 0.6 | [none] | RUNNING: DISABLE |
| Gravity (g) | 0 - 20 | 9.8 | m/s² | Global |

**Note:** Scene 4 không có lực F user trong MVP

### Display Data (Scene 4)

```
BEFORE COLLISION:
├─ Object 1 Velocity: 0 m/s
├─ Object 2 Velocity: 10 m/s
├─ Total Momentum: 30 kg·m/s
├─ Total KE: 150 J
└─ Status: No collision

AFTER COLLISION:
├─ Object 1 Velocity: 4 m/s
├─ Object 2 Velocity: 6 m/s
├─ Total Momentum: 38 kg·m/s (momentum conserved!)
├─ Total KE: 120 J (energy lost to deformation)
├─ Energy Loss: 30 J
└─ Status: Collision detected!
```

### Formulas to Display

```
// Momentum conservation
p_before = m₁v₁ + m₂v₂
p_after = m₁v₁' + m₂v₂'
p_before = p_after ✓

// Coefficient of restitution
e = (v₂' - v₁') / (v₁ - v₂)
if e = 1: Perfectly elastic
if e = 0: Perfectly inelastic
if 0 < e < 1: Partially elastic

// Kinetic energy
Ek_before = 1/2 × m₁ × v₁² + 1/2 × m₂ × v₂²
Ek_after = 1/2 × m₁ × v₁'² + 1/2 × m₂ × v₂'²
ΔEk = Ek_after - Ek_before (usually < 0)
```

### User Actions & Constraints (Scene 4)

**Hành động chính:**
1. Chỉnh khối lượng vật 1 & 2 (m₁, m₂) → Ảnh hưởng velocities sau collision
2. Chỉnh vận tốc ban đầu (v₂) → Ảnh hưởng collision outcome
3. Chỉnh restitution (e) → Ảnh hưởng bounce behavior
4. Chỉnh vị trí ban đầu → Set starting positions

**Constraints:**

✅ **STOPPED/PAUSED:**
- Thay đổi m₁, m₂, v₂, e, initial positions
- Kéo vật để đặt vị trí

✅ **RUNNING:**
- **Không** thay đổi bất cứ tham số nào
- Chỉ có thể dừng & xem kết quả

**Vật dừng khi:**
- Chạm biên scene
- Sau khi va chạm kết thúc (tùy thiết kế)

**Reset:**
- Đưa cả hai vật về vị trí ban đầu
- Reset vận tốc theo giá trị ban đầu
- Reset thời gian = 0

### Graphics Implementation (Scene 4)

| Concept | How |
|---------|-----|
| Transformation | Both objects: translate + rotate (sphere spins) |
| Projection | Dynamic perspective (can follow collision) |
| Lighting | Multiple lights, dynamic shadows on collision |
| Shadows | Both objects cast shadows |
| Texture | Different textures for 2 objects (distinguish) |
| Raycasting | Collision detection visualization |

---

## Scene Comparison Matrix

| Feature | S1 | S2 | S3 | S4 |
|---------|----|----|----|----|
| **Type** | Incline | Projectile | Friction | Collision |
| **Objects** | 1 | 1 | 1 | 2 |
| **Main Force** | F, Gravity, Friction | F, Gravity | F, Friction | Impact |
| **Key Formula** | a = (F + mg sin θ - μN)/m | y = h - 1/2gt² | a = (F - μmg)/m | p = m₁v₁ + m₂v₂ |
| **Target Concept** | Force analysis | Projectile motion | Friction | Momentum |
| **Time to complete** | ~30s - 5min | ~3s | ~10s | ~2s |

---

**Next:** Đọc file `05_PHYSICS_SYSTEM.md` để hiểu hệ thống lực & đại lượng
