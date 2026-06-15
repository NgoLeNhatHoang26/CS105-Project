# Physics Simulation — Mô phỏng vật lý 3D

Đồ án Đồ họa máy tính (DHMT) — Web app mô phỏng vật lý tương tác cho THCS (UIT CS431).

## Chạy nhanh

```bash
npm install
npm run dev
```

Mở **http://localhost:5173/** trên trình duyệt desktop. Phím tắt: **Space** = Play/Pause, **R** = Reset.

## Tài liệu

| File | Nội dung |
|------|----------|
| [Docs/OVERVIEW.md](./Docs/OVERVIEW.md) | Tổng quan đồ án, công nghệ, DHMT |
| [Docs/HUONG_DAN_SU_DUNG.md](./Docs/HUONG_DAN_SU_DUNG.md) | Cài đặt, giao diện, thao tác chung |
| [Docs/SCENE1_MAT_PHANG_NGHIENG.md](./Docs/SCENE1_MAT_PHANG_NGHIENG.md) | Cảnh 1 — Mặt phẳng nghiêng |
| [Docs/SCENE2_ROI_TU_DO.md](./Docs/SCENE2_ROI_TU_DO.md) | Cảnh 2 — Rơi tự do |
| [Docs/SCENE3_LUC_NGANG.md](./Docs/SCENE3_LUC_NGANG.md) | Cảnh 3 — Lực ngang |
| [Docs/SCENE4_VA_CHAM.md](./Docs/SCENE4_VA_CHAM.md) | Cảnh 4 — Va chạm |

## Công nghệ

Three.js · Vite · lil-gui · Stats.js · integrators vật lý tùy chỉnh (`src/physics/integrators/`)
