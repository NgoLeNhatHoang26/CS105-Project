# Physics Simulation — Mô phỏng vật lý 3D

Đồ án Đồ họa máy tính (DHMT) — Web app mô phỏng vật lý tương tác cho THCS.

## Công nghệ

- **Three.js** — rendering 3D (transformation, projection, lighting, shadows, texture, raycasting)
- **Cannon-es** — physics
- **Vite** — build & dev server
- **lil-gui** — điều khiển tham số
- **Stats.js** — theo dõi FPS

## Cài đặt

```bash
npm install
npm run dev
```

Phím tắt: **Space** = Play/Pause, **R** = Reset.

Mở trình duyệt desktop (Chrome/Firefox/Edge) tại `http://localhost:5173`.

## 4 Scene

1. **Mặt phẳng nghiêng** — `a = (F + mg sinθ − μmg cosθ) / m`
2. **Rơi tự do / ném ngang** — `y = h − ½gt²`, lực F tạo `a_x`
3. **Lực ngang + ma sát** — `a = (F − μmg) / m`
4. **Va chạm** — bảo toàn động lượng, hệ số hồi phục `e`

## Điều khiển

| Thao tác | Mô tả |
|----------|--------|
| **Play** | Bắt đầu / tiếp tục mô phỏng |
| **Pause** | Tạm dừng (có thể chỉnh mọi tham số, kéo vật) |
| **Reset** | Về trạng thái ban đầu |
| **Reset View** | Camera mặc định |
| Chuột trái + kéo | Orbit camera |
| Scroll | Zoom |
| Click chuột trái (STOPPED/PAUSED) | Chọn vật |

### Trạng thái RUNNING

- Chỉ đổi được: lực F (scene 1–3), tốc độ mô phỏng, hiển thị, camera
- Scene 4: khóa mọi tham số khi đang chạy

## Khái niệm đồ họa (DHMT)

- **Transformation:** sync mesh ↔ body, xoay mặt phẳng nghiêng
- **Projection:** `PerspectiveCamera`, chỉnh FOV / near / far trong GUI
- **Lighting:** Phong (`MeshPhongMaterial`), ambient + directional
- **Shadows:** `PCFSoftShadowMap`
- **Texture:** lưới procedural UV trên sàn / ramp
- **Raycasting:** chọn và kéo vật khi không RUNNING

## Cấu trúc mã

Xem `Docs/06_CODE_ARCHITECTURE.md` và thư mục `src/`.

## Demo bảo vệ (gợi ý ~5 phút)

1. Scene 1: đổi góc θ → Play → quan sát gia tốc & bóng
2. Scene 2: h=20, F ngang → quỹ đạo parabol
3. Scene 3: F < ma sát → vật đứng yên
4. Scene 4: so sánh momentum trước/sau va chạm
5. Chỉnh FOV → giải thích perspective projection
