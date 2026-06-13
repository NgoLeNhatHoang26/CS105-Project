# Cảnh 4 — Va chạm

**Scene ID:** 4 · **Tên trong app:** Va chạm

---

## Mục tiêu học tập

Va chạm một chiều (1D) trên mặt ngang: bảo toàn động lượng, hệ số phục hồi **e**, mất mát động năng **ΔEk**.

---

## Hiện tượng mô phỏng

Hai vật (mặc định hình cầu) trượt trên đường thẳng ngang, va chạm đàn xuất, sau đó có thể tiếp tục chuyển động và bị ma sát làm chậm.

- Va chạm phát hiện khi khoảng cách giữa tâm ≤ 2r.
- Hệ số phục hồi: **va chạm đàn hồi** bật → e = 1; tắt → e = 0 (không đàn hồi).
- Ma sát μ: tác dụng khi \|v\| > ngưỡng nhỏ; dùng g toàn cục cho tính ma sát.
- **trọng lực g** (toggle scene): ảnh hưởng hiển thị W/N trên panel; ma sát vẫn dùng g toàn cục trong tính toán.

Vật lý: `src/physics/integrators/collision1d.js`

---

## Tham số

| Tham số (GUI) | Khoảng / tùy chọn | Mặc định | Khóa khi RUNNING |
|---------------|-------------------|----------|------------------|
| tình huống | 4 preset | Va trực diện | Có (toàn scene) |
| m₁, m₂ (kg) | 0.1 – 500 | 5, 3 | Có |
| khoảng cách ban đầu (m) | 1 – 20 | 6 | Có |
| bán kính (m) | 0.2 – 1.5 | 0.45 | Có |
| \|v₁\|, \|v₂\| (m/s) | 0 – 20 | 5, 5 | Có |
| hướng v₁, v₂ | +x / −x | →, ← | Có |
| va chạm đàn hồi | bật/tắt | tắt (e=0) | Có |
| ma sát μ | 0 – 1 | 0 | Có |
| cản không khí | bật/tắt | tắt | Có |
| pause sau va | bật/tắt | tắt | Có |
| trọng lực g | bật/tắt | tắt | Có |

### Bốn tình huống (preset)

| Preset | Mô tả ngắn |
|--------|-------------|
| **Va trực diện** | Hai vật đối xung, v₁ →, v₂ ← |
| **Một vật chạy** | v₁ > 0, v₂ = 0 |
| **Đuổi kịp** | Cùng chiều +x, v₁ > v₂ |
| **Đứng yên** | v₁ = v₂ = 0 (cần đẩy bằng cách đặt v₁/v₂ thủ công sau preset) |

Đổi **tình huống** áp dụng preset vận tốc và μ (không ghi đè m₁, m₂, khoảng cách).

> **Lưu ý:** Khi **RUNNING**, mọi tham số scene 4 bị khóa. **Pause** trước khi chỉnh.

---

## Cách sử dụng

1. **Chọn scene → Va chạm** → chọn **tình huống**
2. Chỉnh **m₁**, **m₂**, **\|v₁\|**, **\|v₂\|**, **va chạm đàn hồi**
3. (Tuỳ chọn) **pause sau va** để dừng ngay khi va
4. **Vector lực → all** → **Play**
5. Quan sát **v₁**, **v₂**, **p**, snapshot va chạm trên panel
6. **Reset** → thử khối lượng hoặc e khác

---

## Đại lượng trên panel dữ liệu

| Nhãn | Ý nghĩa |
|------|---------|
| m₁, m₂ | Khối lượng hai vật |
| x₁, x₂ | Vị trí theo trục x |
| v₁, v₂ | Vận tốc từng vật |
| p, p₁, p₂ | Động lượng tổng / từng vật |
| Ek, Ek₁, Ek₂ | Động năng |
| Va chạm | Có / Không; Đàn hồi (e=1) / Không đàn hồi (e=0) |
| Trạng thái | Đang chuyển động / Đã va chạm / Đã dừng / … |

**Sau va chạm** (khi đã xảy ra va):

| Nhãn | Ý nghĩa |
|------|---------|
| v₁ (trước), v₂ (trước) | Vận tốc trước va |
| v₁′ (sau), v₂′ (sau) | Vận tốc sau va (mô phỏng) |
| v₁′ (LT), v₂′ (LT) | Vận tốc lý thuyết |
| p (trước), p (sau va) | Bảo toàn động lượng |
| Ek (trước), Ek (sau) | Động năng trước/sau |
| ΔEk, Δp | Mất năng / lệch động lượng (≈ 0 nếu không lực ngoài) |

---

## Công thức (panel Công thức)

```
p = m₁v₁ + m₂v₂ = const
e = 0 (không đàn hồi) hoặc 1 (đàn hồi)

v₁′ = ((m₁ − e·m₂)v₁ + (1+e)m₂v₂) / (m₁ + m₂)
v₂′ = ((m₂ − e·m₁)v₂ + (1+e)m₁v₁) / (m₁ + m₂)

Ek = ½·m·v²
ΔEk = Ek_sau − Ek_trước  (≤ 0 khi e < 1)
```

---

## Vector lực — hai vật

Mỗi vật có bộ vector **riêng** tại vị trí mesh:

- **W** (xanh), **N** (vàng) — luôn hiển thị khi vector = `all` (m·g cho minh họa)
- **f** (cam) — khi vật đang trượt và μ > 0
- **F_net** (trắng) — hợp lực ngang (ma sát + cản không khí)
- Scene 4 **không có** lực F ngoài → chế độ `selected` chỉ thấy F_net khi vật chuyển động

---

## Thuộc tính đồ họa (2 vật)

**Thuộc tính → Object target → Object 1 / Object 2** — đổi hình, màu, texture, model GLB từng vật.

---

## Gợi ý thí nghiệm

| Thí nghiệm | Cách làm | Kết quả kỳ vọng |
|------------|----------|-----------------|
| Nặng va nhẹ | m₁ >> m₂ | Vật nặng gần giữ v, vật nhẹ bật mạnh |
| Nhẹ va nặng | m₁ << m₂ | Vật nhẹ đổi chiều, nặng gần đứng yên |
| e = 1 | Bật va chạm đàn hồi | ΔEk ≈ 0 |
| e = 0 | Tắt đàn hồi | Hai vật dính cùng v sau va, ΔEk < 0 |
| Ma sát sau va | μ > 0 | Vật chậm dần, f hiện trên từng vật |

---

## Demo gợi ý (~2 phút)

1. Preset **Va trực diện**, m₁ = 5, m₂ = 3, e = 0 → Play
2. Khi va: đọc **v₁ (trước)**, **v₂ (trước)** → **v₁′ (sau)**, **v₂′ (sau)**
3. So **p (trước)** và **p (sau va)**; chỉ **ΔEk** < 0
4. Bật e = 1, Reset, Play lại → **ΔEk** gần 0

---

*Quay lại: [HUONG_DAN_SU_DUNG.md](./HUONG_DAN_SU_DUNG.md) · [OVERVIEW.md](./OVERVIEW.md)*
