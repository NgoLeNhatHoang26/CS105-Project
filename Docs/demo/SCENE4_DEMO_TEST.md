# Demo Test — Scene 4: Va chạm

**Thời gian:** ~2 phút · **Mục tiêu:** Bảo toàn động lượng, ΔEk, hệ số e; preset va chạm; ghi CSV.

---

## Chuẩn bị

- [ ] Scene: **Va chạm**
- [ ] **Vector lực:** `selected` hoặc `none` (tùy slide)
- [ ] **Pause sau va:** bật (tuỳ chọn — dễ nói)
- [ ] **trọng lực g:** **tắt** (mặc định — va chạm 1D ngang, **không** ma sát trong sim)
- [ ] **Reset**

> **Panel lực:** `F_net` ≈ độ lớn **ma sát** đang tác dụng lên vật 1 khi \|v₁\| > 0,01 và có g + μ; khi đứng yên hoặc tắt trọng lực → **0**. Không còn cứng = 0 mọi lúc.

---

## Test A — Va trực diện (test chính)

### Tham số

| Tham số | Giá trị |
|---------|---------|
| Tình huống | **Va trực diện** |
| m₁ | **5** kg |
| m₂ | **3** kg |
| khoảng cách ban đầu | **6** m |
| bán kính | **0,45** m |
| \|v₁\| | **5** m/s, hướng **+x** |
| \|v₂\| | **5** m/s, hướng **−x** |
| e (hệ số phục hồi) | **0,6** |
| pause sau va | **bật** (khuyên dùng khi demo) |

### Các bước demo

| # | Thao tác | Nói gì (gợi ý) |
|---|----------|----------------|
| 1 | Mở **Công thức** (p, e, v₁′, v₂′) | “Va chạm 1D — bảo toàn động lượng.” |
| 2 | Chỉ **v₁**, **v₂** trên panel (trước va) | “Hai vật lao vào nhau.” |
| 3 | **Play** | “Quan sát va chạm trong không gian 3D.” |
| 4 | Sau va: **Pause** (tự hoặc tay) | Đọc **v₁**, **v₂**, **p (sau va)** |
| 5 | So sánh **p** trước/sau | Động lượng **gần bảo toàn** (sai số nhỏ do mô phỏng) |
| 6 | Xem **ΔEk** | Thường **< 0** (mất năng lượng do e < 1) |
| 7 | **v₁′ (LT)**, **v₂′ (LT)** nếu có | So với công thức lý thuyết |
| 8 | **Ghi mốc** → **Export CSV** | “Xuất dữ liệu báo cáo.” |

### Kết quả kỳ vọng (va trực diện, m₁=5, m₂=3, v₁=+5, v₂=−5)

- Trước va: p ≈ 5×5 + 3×(−5) = **10 kg·m/s**
- Sau va: p **gần 10 kg·m/s**
- ΔEk **âm** (không va chạm hoàn toàn đàn hồi)
- e quan sát ≈ **0,6** (trên panel)
- Với **trọng lực tắt**, μ > 0 **không** làm chậm vật trước/sau va (ma sát chỉ khi `gravityEnabled` bật)

---

## Test B — Một vật chạy, một đứng yên (~30s)

| Tham số | Giá trị |
|---------|---------|
| Tình huống | **Một vật chạy** |
| m₁ | **5** kg |
| m₂ | **3** kg |
| \|v₁\| | **6** m/s (+x) |
| \|v₂\| | **0** |
| e | **0,5** |

| # | Thao tác | Kỳ vọng |
|---|----------|---------|
| 1 | **Reset** → **Play** | Vật 1 đâm vật 2 đứng yên |
| 2 | Sau va | Vật 2 **bay** theo hướng +x, vật 1 chậm lại |

---

## Test C — Đổi e (~20s)

| # | Thao tác | Kỳ vọng |
|---|----------|---------|
| 1 | **Pause**, e: **0** (không đàn hồi) | Sau va hai vật **dính** / cùng vận tốc |
| 2 | **Reset**, e: **1** (gần đàn hồi) | ΔEk **gần 0** hơn |

> Khi RUNNING: **không đổi** tham số — nhấn Pause trước.

---

## Test D — Kéo vật đổi khoảng cách (~15s)

| # | Thao tác | Kỳ vọng |
|---|----------|---------|
| 1 | **Pause** → kéo **object 1** hoặc **2** trên trục x | Đổi khoảng cách ban đầu |
| 2 | **Play** | Thời điểm va chạm thay đổi |

---

## Test E — Trọng lực + ma sát sau va (~30s)

| Tham số | Giá trị |
|---------|---------|
| Tình huống | **Một vật chạy** (hoặc va trực diện) |
| **trọng lực g** | **bật** |
| μ (ma sát) | **0,4** |
| \|v₁\| | **6** m/s (+x) |
| pause sau va | tắt (để xem vật trượt dần) |

| # | Thao tác | Kỳ vọng |
|---|----------|---------|
| 1 | **Reset** → **Play** → sau va | Vật 1 (thường nặng hơn) **chậm dần** trên trục x |
| 2 | Khi vật 1 còn trượt, xem **f**, **F_net** trên panel | **f** ≈ μ·m₁·g, **F_net** ≈ **f** (không luôn 0) |
| 3 | **Pause** → **tắt trọng lực** → **Play** (nếu vật còn v) | Ma sát **không** còn kéo — chứng minh ma sát phụ thuộc g |
| 4 | **Reset**, **tắt trọng lực**, μ = 0,4, **Play** | Va chạm **không** bị μ làm chậm khi g tắt (đối chiếu bước 1–3) |

---

## Điểm DHMT nhắc nhanh

- Hai vật = hai mesh, **transformation** độc lập.
- Va chạm Cannon + hiển thị số **p**, **Ek**.
- Scene 4 khóa GUI khi RUNNING — nhấn mạnh quy tắc đồ án.

---

## Checklist pass / fail

| Tiêu chí | Pass? |
|----------|-------|
| Va chạm xảy ra rõ ràng | ☐ |
| p sau va ≈ p trước | ☐ |
| ΔEk < 0 với e = 0,6 | ☐ |
| Preset “Một vật chạy” hoạt động | ☐ |
| Ghi mốc + Export CSV | ☐ |
| g tắt → μ không ảnh hưởng sim (Test A) | ☐ |
| g bật + μ → chậm sau va, F_net hiện f (Test E) | ☐ |
