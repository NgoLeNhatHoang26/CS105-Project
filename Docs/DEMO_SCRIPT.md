# Kịch bản demo bảo vệ (~5 phút)

## 1. Mở app & Stats.js (30s)

- `npm run dev` — chỉ FPS ~60 trên desktop.
- Giới thiệu layout: sidebar lil-gui, panel dữ liệu, viewport WebGL.

## 2. Đồ họa — Projection & Lighting (45s)

- Folder **Projection**: kéo **FOV** → giải thích perspective projection (`PerspectiveCamera`).
- Tắt/bật ánh sáng directional (trong code) → Phong diffuse/specular trên `MeshPhongMaterial`.
- Chỉ bóng PCF khi vật di chuyển trên sàn.

## 3. Scene 1 — Mặt phẳng nghiêng (60s)

- θ = 30°, μ = 0.3, m = 5 kg → **Play**.
- Panel: `F_net`, `s` dọc dốc, `Ek`.
- Tăng **F** khi RUNNING → gia tốc đổi ngay (lực runtime).
- **Pause** → kéo vật (raycasting) → **Play** tiếp.

## 4. Scene 2 — Rơi tự do (45s)

- h = 20 m, F = 0 → thời gian rơi ~ √(2h/g).
- Thêm F ngang → quỹ đạo cong (độc lập x/y).

## 5. Scene 3 — Lực ngang (45s)

- μ lớn, F nhỏ → vật không đi (F < μmg).
- Tăng F → chuyển động + ma sát hiển thị.

## 6. Scene 4 — Va chạm (60s)

- m₁=5, m₂=3, v₂=5 m/s, e=0.6 → **Play**.
- Sau va chạm: panel **p**, **ΔEk**, hệ số e.
- Nhấn **Ghi mốc** → **Export CSV**.

## 7. Transformation & Texture (30s)

- Scene 1: đổi θ → rotation mặt phẳng (affine).
- Sàn lưới: UV repeat (`RepeatWrapping`).

## Câu hỏi thường gặp

- **Tại sao tách calculator và Cannon?** — Hiển thị đúng công thức SGK; Cannon mô phỏng chuyển động.
- **Fixed timestep?** — 1/60 s, ổn định, không phụ thuộc FPS.
- **dispose()?** — Tránh leak khi đổi scene.
