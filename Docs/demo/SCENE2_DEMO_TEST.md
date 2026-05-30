# Demo Test — Scene 2: Rơi tự do

**Thời gian:** ~1,5 phút · **Mục tiêu:** Rơi tự do thuần + so sánh lý thuyết; ném ngang (parabol).

---

## Chuẩn bị

- [ ] Scene: **Rơi tự do**
- [ ] **Vector lực:** `all` hoặc `selected`
- [ ] **Reset** về trạng thái sạch
- [ ] (Tuỳ chọn) `node scripts/verify-scene2.mjs` — xác nhận t_chạm ≈ √(2h/g)

> Scene 2 dùng `damping: false` — rơi tự do không bị Cannon làm chậm thêm.

---

## Test A — Rơi tự do thuần (test chính)

### Tham số

| Tham số | Giá trị |
|---------|---------|
| khối lượng (m) | **5** kg |
| h — độ cao đáy (m) | **20** m |
| \|F\| | **0** N |
| góc F ngang / dọc | **0**° |
| g | **9,8** m/s² |
| Tốc độ sim | **1** |

### Các bước demo

| # | Thao tác | Nói gì (gợi ý) |
|---|----------|----------------|
| 1 | Mở **Công thức** (`y = h − ½gt²`, `t_chạm`) | “Rơi tự do: thời gian không phụ thuộc khối lượng.” |
| 2 | **Play** | “Vật rơi thẳng đứng trong không gian 3D.” |
| 3 | Theo dõi **h (đáy)**, **t**, **\|v\|** | “Độ cao giảm, vận tốc tăng.” |
| 4 | Khi chạm đất → Pause | “Trạng thái: đã chạm đất.” |
| 5 | So sánh **t_chạm đất** với √(2h/g) | Lý thuyết: √(2×20/9,8) ≈ **2,02 s** |
| 6 | Xem **y (lý thuyết)**, **v_y (lý thuyết)** (nếu có) | Khớp xu hướng công thức |

### Kết quả kỳ vọng

- Quỹ đạo **thẳng đổ** (F = 0).
- `t_chạm` ≈ **2 s** (sai số nhỏ do bước 1/60 s).
- `v_chạm` ≈ √(2gh) ≈ **19,8 m/s**.
- Đổi **m** (Pause → m = 10 hoặc 20) → **thời gian rơi gần như không đổi**.

---

## Test B — Khối lượng không ảnh hưởng thời gian rơi (~20s)

| # | Thao tác | Kỳ vọng |
|---|----------|---------|
| 1 | **Reset**, m = **2** kg, h = 20, F = 0 → **Play** | Ghi nhớ `t` chạm đất |
| 2 | **Reset**, m = **20** kg, cùng h → **Play** | `t_chạm` **gần bằng** lần 1 |

---

## Test C — Ném ngang / parabol (~25s)

| Tham số | Giá trị |
|---------|---------|
| h | **20** m |
| \|F\| | **25** N |
| góc F ngang | **0**° |
| góc F dọc | **0**° |

| # | Thao tác | Kỳ vọng |
|---|----------|---------|
| 1 | **Play** | Quỹ đạo **cong** — x tăng, y giảm |
| 2 | Theo dõi **x** (ngang) trên panel | Chuyển động ngang độc lập với dọc |

---

## Điểm DHMT nhắc nhanh

- Chuyển động = **translation** mesh theo physics.
- Nền scene tím đen (không gian) + sàn lưới texture.
- Panel so sánh **lý thuyết vs mô phỏng**.

---

## Checklist pass / fail

| Tiêu chí | Pass? |
|----------|-------|
| Rơi thẳng khi F = 0 | ☐ |
| t_chạm ≈ √(2h/g) | ☐ |
| m đổi, t_chạm gần như không đổi | ☐ |
| F ngang → quỹ đạo cong | ☐ |
