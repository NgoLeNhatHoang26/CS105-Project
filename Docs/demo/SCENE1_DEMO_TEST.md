# Demo Test — Scene 1: Mặt phẳng nghiêng

**Thời gian:** ~2 phút · **Mục tiêu:** Lực trên dốc, ma sát, đổi F khi đang chạy, kéo vật.

---

## Chuẩn bị (trước khi lên sóng)

- [ ] `npm run dev` đang chạy, FPS ~60 (góc viewport).
- [ ] **Tham số → Chọn scene:** `Mặt phẳng nghiêng`
- [ ] **Hiển thị → Vector lực:** `all`
- [ ] Mở mục **Công thức** và **Dữ liệu vật lý**
- [ ] Nhấn **Reset** (R) nếu vừa đổi scene

> **Vật lý mô phỏng:** Scene 1 dùng `damping: false` — không có lực cản tuyến tính ảo của Cannon. Panel `F_net` / `a` lấy từ `inclineForces`: khi ma sát giữ vật, **F_net = 0** và **a = 0** (không hiện số âm).

---

## Test A — Trượt tự nhiên xuống dốc (test chính)

### Tham số đặt sẵn

| Tham số | Giá trị |
|---------|---------|
| khối lượng (m) | **5** kg |
| độ dốc (θ) | **30**° |
| chiều dài dốc (L) | **5** m |
| ma sát μ | **0,3** |
| \|F\| | **0** N |
| góc F | **0**° |
| g (Môi trường) | **9,8** m/s² |
| Tốc độ sim | **1** |

### Các bước demo

| # | Thao tác | Nói gì (gợi ý) |
|---|----------|----------------|
| 1 | Chỉ panel **Công thức** (`F_net`, `a`, `Ek`) | “Công thức mặt phẳng nghiêng: trọng lực thành phần + ma sát.” |
| 2 | **Play** | “Vật trượt từ đỉnh dốc, có bóng PCF trên mặt phẳng.” |
| 3 | Quan sát **s dọc dốc**, **v**, **Ek** tăng | “Quãng đường dọc dốc và động năng tăng dần.” |
| 4 | Chờ vật **dừng** ở cuối dốc → tự **Pause** | “Hết chiều dài L — mô phỏng dừng.” |
| 5 | **Ghi mốc** → **Export CSV** (tuỳ chọn) | “Ghi snapshot để báo cáo.” |

### Kết quả kỳ vọng

- Vật trượt **xuống** dốc, không rơi khỏi mặt phẳng.
- Khi đang trượt: `F_net` > 0 (theo chiều xuống dốc), `f` ≈ μ·m·g·cos θ, `a` = F_net/m **dương**.
- `s dọc dốc` → gần **5 m** khi dừng.
- `Ek` > 0 khi có vận tốc.
- Tốc độ giảm chủ yếu do **ma sát / hết dốc**, không do damping ẩn.

---

## Test A′ — Ma sát giữ vật (kiểm tra panel, ~20s)

| Tham số | Giá trị |
|---------|---------|
| θ | **10**° |
| μ | **0,9** |
| \|F\| | **0** N |
| m | **5** kg |

| # | Thao tác | Kỳ vọng |
|---|----------|---------|
| 1 | **Pause** → kéo vật lên **giữa dốc** (raycast) | Vật nằm trên dốc, chưa chạy |
| 2 | **Play** (hoặc thử **Play** ngay nếu μ đủ lớn giữ vật) | Vật **không trượt** hoặc dừng rất nhanh |
| 3 | Xem **F_net**, **a** trên panel | **≈ 0** (không âm) — ma sát tĩnh cân bằng trọng lực thành phần |

---

## Test B — Đổi lực F khi RUNNING (~30s)

| # | Thao tác | Kỳ vọng |
|---|----------|---------|
| 1 | **Reset** → **Play** | Vật lại trượt |
| 2 | Khi đang chạy, tăng **\|F\|** lên **40** N (góc F = **0**°) | Gia tốc **tăng ngay**, vật nhanh hơn |
| 3 | Giảm **\|F\|** về **0** | Chậm lại, gần như chỉ còn trọng lực + ma sát |

> Chỉ nói: “Khi RUNNING chỉ đổi được lực F — đúng spec đồ án.”

---

## Test C — Đổi góc θ + kéo vật (~25s)

| # | Thao tác | Kỳ vọng |
|---|----------|---------|
| 1 | **Pause** hoặc **Reset** | Tham số mở khóa |
| 2 | Đổi **θ** → **45**° | Mặt dốc **xoay** (affine rotation) |
| 3 | **Pause** → **kéo vật** trên dốc (chuột) → **Play** | Vật chạy từ vị trí mới |
| 4 | **View** nếu camera lệch | Camera về mặc định |

---

## Điểm DHMT nhắc nhanh

- **Projection:** kéo FOV trong folder Projection.
- **Transformation:** xoay mặt phẳng (θ), sync mesh ↔ body.
- **Lighting / Shadow:** Phong + PCF khi vật trượt.
- **Texture:** lưới UV trên dốc/sàn.
- **Raycasting:** kéo vật khi Pause.

---

## Checklist pass / fail

| Tiêu chí | Pass? |
|----------|-------|
| Play/Pause/Reset hoạt động | ☐ |
| Vật trượt hết dốc rồi dừng | ☐ |
| Panel hiện s, v, Ek, các lực | ☐ |
| F_net / a không âm khi vật đứng trên dốc (Test A′) | ☐ |
| Không “tự chậm” khi μ = 0 (không damping ảo) | ☐ |
| Đổi F khi RUNNING có hiệu lực | ☐ |
| θ đổi → dốc xoay | ☐ |
