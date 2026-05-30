# Kịch bản demo — 4 scene

Mỗi file là **một kịch bản test/demo** độc lập (~1,5–2 phút/scene). Dùng khi bảo vệ, quay video hoặc kiểm tra app trước ngày nộp.

| File | Scene | Thời gian gợi ý |
|------|-------|------------------|
| [SCENE1_DEMO_TEST.md](./SCENE1_DEMO_TEST.md) | Mặt phẳng nghiêng | ~2 phút |
| [SCENE2_DEMO_TEST.md](./SCENE2_DEMO_TEST.md) | Rơi tự do | ~1,5 phút |
| [SCENE3_DEMO_TEST.md](./SCENE3_DEMO_TEST.md) | Lực ngang | ~1,5 phút |
| [SCENE4_DEMO_TEST.md](./SCENE4_DEMO_TEST.md) | Va chạm | ~2 phút |

**Chạy app:** `npm run dev` → http://localhost:5173

**Phím tắt:** `Space` Play/Pause · `R` Reset

---

## Cập nhật kịch bản (sau fix vật lý)

Các file `SCENE*_DEMO_TEST.md` đã chỉnh cho khớp code hiện tại:

| Thay đổi | Scene | Ý nghĩa khi demo |
|----------|-------|------------------|
| Tắt `linearDamping` Cannon | 1, 3, 4 | Vật không bị “kéo ngược” khi không có lực ma sát tương ứng |
| `F_net` / `a` không âm khi đứng | 1, 3 | Panel không hiện gia tốc âm khi ma sát giữ vật |
| Gia tốc theo hợp lực | 3 | Khi phanh / đổi hướng, `a` ngược chiều chuyển động (không theo dấu vận tốc) |
| Ma sát + `gravityEnabled` | 4 | μ chỉ có hiệu lực khi **bật trọng lực**; `F_net` trên panel ≈ μ·m₁·g khi vật 1 trượt |
| `forces.net` telemetry | 4 | Không cứng = 0; hiện độ lớn ma sát đang tác dụng (khi có g và v₁ ≠ 0) |

**Kiểm tra nhanh trước demo:** `npm run build` · Scene 2: `node scripts/verify-scene2.mjs`
