# Cảnh 1 — Mặt phẳng nghiêng

**Scene ID:** 1 · **Tên trong app:** Mặt phẳng nghiêng

---

## Mục tiêu học tập

Phân tích lực trên mặt phẳng nghiêng: thành phần trọng lực song song/vuông góc dốc, phản lực, ma sát và hợp lực gây gia tốc.

---

## Hiện tượng mô phỏng

Một vật đặt ở **đỉnh dốc**, trượt xuống theo phương dốc. Mặt dốc tạo bằng `ExtrudeGeometry`; sàn lưới phía dưới. Vật dừng khi đi hết chiều dài dốc **L** hoặc khi ma sát/hợp lực cân bằng.

Vật lý: integrator `src/physics/integrators/incline.js` — không dùng damping ảo; khi đứng yên do ma sát, **F_net = 0** và **a = 0**.

---

## Tham số

| Tham số (GUI) | Khoảng | Mặc định | Khóa khi RUNNING |
|---------------|--------|----------|------------------|
| khối lượng (kg) | 0.1 – 500 | 5 | Có |
| độ dốc (°) | 0 – 90 | 30 | Có |
| chiều dài dốc (m) | 1 – 10 | 5 | Có |
| ma sát μ | 0 – 1 | 0.3 | Có |
| cản không khí | bật/tắt | tắt | Không |
| \|F\| (N) | 0 – 100 | 0 | Không |
| góc F (°) | −90 – +90 | 0 | Không |
| g (m/s²) | 0 – 20 | 9.8 | Có (Môi trường) |

**Lực F** nằm trong mặt phẳng chứa dốc; góc F tính so với phương dốc.

---

## Cách sử dụng

1. **Chọn scene → Mặt phẳng nghiêng** → **Reset**
2. Chỉnh **θ**, **μ**, **m** (ví dụ 30°, 0.3, 5 kg)
3. **Hiển thị → Vector lực → all**
4. **Play** — quan sát vật trượt và số liệu panel phải
5. Khi RUNNING: tăng **\|F\|** để thấy gia tốc đổi ngay
6. **Pause** → kéo vật trên dốc → **Play** tiếp
7. **Reset** để thử bộ tham số khác

---

## Đại lượng trên panel dữ liệu

| Nhãn | Ý nghĩa |
|------|---------|
| t | Thời gian mô phỏng |
| Vị trí | Tọa độ (x, y, z) |
| v, \|v\| | Vận tốc |
| a | Gia tốc |
| Ek, m | Động năng, khối lượng |
| F, W, N, f, F_net | Các lực (N) |
| **s dọc dốc** | Quãng đường đã trượt trên dốc |

---

## Công thức (panel Công thức)

**Lực:**

```
W = m·g
N = m·g·cos θ
f = μ·N
F_net = F − m·g·sin θ − f    (theo phương dốc xuống)
```

**Chuyển động:**

```
a = F_net / m
v(t) = v₀ + a·t
s(t) = v₀t + ½·a·t²
Ek = ½·m·v²
```

---

## Vector lực trên vật

Một bộ mũi tên tại vị trí vật: F (đỏ), W (xanh), N (vàng), f (cam), F_kk nếu bật cản không khí, F_net (trắng).

---

## Gợi ý thí nghiệm

| Thí nghiệm | Tham số | Kết quả kỳ vọng |
|------------|---------|-----------------|
| Tăng góc | θ: 15° → 45° → 60° | a tăng, trượt nhanh hơn |
| Tăng ma sát | μ: 0 → 0.5 → 0.9 | a giảm, có thể dừng trên dốc |
| Đổi khối lượng | m: 1 → 10 kg (F = 0) | a không đổi |
| Lực kéo cùng chiều | \|F\| > 0, góc F = 0° | Trượt nhanh hơn |
| Lực cản | \|F\| ngược chiều trượt | Có thể dừng trước hết dốc |

---

## Demo gợi ý (~2 phút)

1. θ = 30°, μ = 0.3, m = 5, F = 0 → Play → chỉ **W**, **N**, **f**, **F_net** trên dốc
2. Tăng F khi RUNNING → **a** và **s dọc dốc** tăng nhanh hơn
3. So sánh **Ek** với công thức ½mv² trên panel **Công thức**

---

*Quay lại: [HUONG_DAN_SU_DUNG.md](./HUONG_DAN_SU_DUNG.md) · [OVERVIEW.md](./OVERVIEW.md)*
