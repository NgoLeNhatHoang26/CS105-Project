# Hướng dẫn cài đặt & sử dụng

Tài liệu dành cho giáo viên, học sinh và người chấm đồ án khi chạy demo **Physics Sim**.

---

## Yêu cầu

- **Node.js** 18+ và **npm**
- Trình duyệt desktop: Chrome, Firefox hoặc Edge
- Màn hình PC (layout tối ưu cho 3 cột; thu nhỏ cửa sổ vẫn dùng được)

---

## Cài đặt & chạy

```bash
# Trong thư mục dự án
npm install
npm run dev
```

Mở trình duyệt tại **http://localhost:5173/**

Build production:

```bash
npm run build
npm run preview
```

---

## Giao diện

```
┌──────────────┬─────────────────┬──────────────┐
│ Sidebar trái │  Viewport 3D    │ Panel phải   │
│              │  (canvas)       │  (Phân tích) │
└──────────────┴─────────────────┴──────────────┘
```

| Khu vực | Chức năng |
|---------|-----------|
| **Sidebar trái** | Play/Pause/Reset/View, Di chuyển/Xoay vật, tham số lil-gui, mục Hướng dẫn |
| **Viewport giữa** | Mô phỏng 3D, vector lực, bóng đổ, Stats.js (FPS) |
| **Panel phải** | **Dữ liệu vật lý** (real-time), ghi mốc, export CSV, **Công thức** |

Badge trên header panel phải hiển thị tên scene đang chọn.

---

## Chọn cảnh

1. Sidebar trái → mục **Tham số** → folder **Chọn scene**
2. Chọn một trong bốn cảnh:
   - Mặt phẳng nghiêng
   - Rơi tự do
   - Lực ngang
   - Va chạm
3. Tham số riêng của cảnh xuất hiện ngay bên dưới; công thức panel phải đổi theo scene

Chi tiết từng cảnh:

- [SCENE1_MAT_PHANG_NGHIENG.md](./SCENE1_MAT_PHANG_NGHIENG.md)
- [SCENE2_ROI_TU_DO.md](./SCENE2_ROI_TU_DO.md)
- [SCENE3_LUC_NGANG.md](./SCENE3_LUC_NGANG.md)
- [SCENE4_VA_CHAM.md](./SCENE4_VA_CHAM.md)

---

## Điều khiển mô phỏng

| Nút | Chức năng | Phím tắt |
|-----|-----------|----------|
| **Play** | Bắt đầu / tiếp tục | `Space` |
| **Pause** | Tạm dừng, giữ vị trí và thời gian | `Space` |
| **Reset** | Về trạng thái ban đầu, t = 0 | `R` |
| **View** | Camera về góc mặc định | — |

**Tốc độ sim:** folder **Môi trường → Tốc độ sim** (0.5×, 1×, 2×, 4×).

**Trọng lực g:** folder **Môi trường → g (m/s²)** — áp dụng scene 1–3; scene 4 có thêm toggle **trọng lực g** riêng.

---

## Ba trạng thái ứng dụng

| Trạng thái | Mô tả |
|------------|-------|
| **STOPPED** | Chưa chạy hoặc vừa Reset — chỉnh được hầu hết tham số |
| **RUNNING** | Đang mô phỏng — một số tham số bị khóa (xem bảng dưới) |
| **PAUSED** | Tạm dừng — có thể kéo/xoay vật, chỉnh lại tham số bị khóa khi RUNNING |

### Khóa tham số khi RUNNING

| Scene | Chỉnh được khi RUNNING | Bị khóa khi RUNNING |
|-------|------------------------|---------------------|
| 1 – Mặt phẳng nghiêng | `\|F\|`, góc F, cản không khí | m, θ, L, μ |
| 2 – Rơi tự do | `\|F\|`, góc F, cản không khí | m, h, hình dạng |
| 3 – Lực ngang | `\|F\|`, góc F, cản không khí | m, μ |
| 4 – Va chạm | **Không có** — khóa toàn bộ | Tất cả tham số scene |

**g (m/s²)** bị khóa khi RUNNING ở mọi scene.

---

## Camera & tương tác vật

| Thao tác | Cách làm |
|----------|----------|
| Xoay camera | Chuột trái + kéo trên nền trống |
| Zoom | Cuộn chuột giữa |
| Chọn vật | Click vật (khi Pause/Stopped) |
| Kéo vật | Chế độ **Di chuyển** (mặc định) + kéo vật |
| Xoay vật | Chế độ **Xoay** + kéo, hoặc phím `[` `]` (trục Y), `'` `\` (trục X) |

Gợi ý trạng thái hiển thị dưới thanh nút (drag-hint) thay đổi theo RUNNING/PAUSED và chế độ Di chuyển/Xoay.

---

## Panel Phân tích (bên phải)

### Dữ liệu vật lý

Cập nhật mỗi frame khi mô phỏng chạy:

- Thời gian **t**, vị trí, vận tốc **v**, gia tốc **a**, động năng **Ek**, khối lượng **m**
- Các lực: **F**, **W**, **N**, **f**, **F_kk** (cản không khí nếu bật), **F_net**
- Dữ liệu riêng từng scene (quãng dốc, độ cao, p, va chạm…)

### Ghi mốc & Export CSV

1. Chạy mô phỏng đến thời điểm cần ghi
2. **＋ Ghi mốc** — lưu snapshot (t, Pos, v, Ek)
3. **Xóa mốc** — xóa toàn bộ
4. **Export CSV** — tải file (cần có ít nhất một mốc)

### Công thức

Hiển thị công thức lý thuyết của scene đang chọn — dùng để so sánh với số liệu mô phỏng.

### Ẩn panel

**Tham số → Hiển thị → Panel dữ liệu** — ẩn/hiện **cả** panel phải (dữ liệu + công thức).

---

## Vector lực

**Tham số → Hiển thị → Vector lực:**

| Giá trị | Hiển thị |
|---------|----------|
| `none` | Tắt vector |
| `selected` | Chỉ **F** (lực tác dụng) và **F_net** |
| `all` | Đủ F, W, N, f, F_kk, F_net |

### Màu vector

| Ký hiệu | Màu | Ý nghĩa |
|---------|-----|---------|
| **F** | Đỏ | Lực tác dụng (scene 1–3) |
| **W** | Xanh dương | Trọng lực |
| **N** | Vàng | Phản lực |
| **f** | Cam | Ma sát |
| **F_kk** | Xanh lục | Cản không khí |
| **F_net** | Trắng | Hợp lực |

**Scene 4:** mỗi vật có bộ vector riêng tại vị trí vật (W, N, f, F_net); không có lực F ngoài.

---

## Tham số đồ họa (Thuộc tính)

Folder **Thuộc tính** trong lil-gui (đóng mặc định):

| Mục | Chức năng |
|-----|-----------|
| **Vật thí nghiệm** | Hình dạng, texture, màu, wireframe, scale, xoay |
| **Load model** | Gắn file GLB/GLTF lên vật (physics không đổi) |
| **Vị trí camera** | Slider X/Y/Z |
| **Chiếu sáng** | Ambient, Directional, Point light, bóng đổ |

Scene 4: chọn **Object target** (Object 1 / Object 2) trước khi đổi hình từng vật.

**Projection:** FOV, Near, Far — folder riêng trong **Tham số**.

---

## Phím tắt

| Phím | Hành động |
|------|-----------|
| `Space` | Play / Pause |
| `R` | Reset |
| `[` `]` | Xoay vật trục Y (chọn vật trước) |
| `'` `\` | Xoay vật trục X |

---

## Lưu ý khi sử dụng

1. **Reset** sau khi đổi tham số cấu trúc (góc dốc, khối lượng, khoảng cách va chạm…) để vật về vị trí ban đầu.
2. Scene 4: chỉnh tham số khi **Pause** hoặc **Reset** — không chỉnh khi đang RUNNING.
3. **Cản không khí** (scene 1–4): bật trong tham số scene để thêm lực cản `F_kk`.
4. So sánh lý thuyết: mở **Công thức** panel phải; scene 2 có thêm dòng **y (lý thuyết)**, **v_y (lý thuyết)** khi rơi thuần.
5. Model GLB: đặt `public/models/sample.glb` hoặc chọn file từ máy qua **Chọn file…**

---

## Gợi ý demo nhanh (~2 phút / scene)

1. Chọn scene → **Reset** → bật **Vector lực = all**
2. Mở panel **Dữ liệu vật lý** và **Công thức**
3. **Play** → nói về hiện tượng và chỉ số trên panel
4. **Pause** → đổi một tham số → **Reset** → **Play** lại để so sánh
5. **Ghi mốc** ở 2–3 thời điểm → **Export CSV** (tuỳ chọn)

---

*Xem thêm tổng quan dự án: [OVERVIEW.md](./OVERVIEW.md)*
