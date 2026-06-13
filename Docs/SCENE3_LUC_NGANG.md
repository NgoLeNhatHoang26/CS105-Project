# Cảnh 3 — Lực ngang

**Scene ID:** 3 · **Tên trong app:** Lực ngang

---

## Mục tiêu học tập

Mối quan hệ giữa lực kéo **F**, lực ma sát **f** và gia tốc trên mặt phẳng ngang; điều kiện vật bắt đầu/chấm dừt chuyển động.

---

## Hiện tượng mô phỏng

Vật nằm trên mặt phẳng ngang (sàn lưới). Lực **F** tác dụng theo phương ngang (mặt phẳng xz); ma sát **f** ngược chiều chuyển động (hoặc ngược chiều thành phần ngang của F khi v ≈ 0).

- Vật đứng yên nếu lực ngang đặt vào ≤ μ·m·g (ma sát tĩnh).
- Gia tốc theo **hợp lực thực** — khi phanh, **a** có thể ngược chiều vận tốc.
- Dừng khi chạm biên arena hoặc khi hợp lực ngang = 0.

Vật lý: `src/physics/integrators/horizontal.js`

---

## Tham số

| Tham số (GUI) | Khoảng | Mặc định | Khóa khi RUNNING |
|---------------|--------|----------|------------------|
| khối lượng (kg) | 0.1 – 500 | 5 | Có |
| ma sát μ | 0 – 1 | 0.3 | Có |
| cản không khí | bật/tắt | tắt | Không |
| \|F\| (N) | 0 – 100 | 0 | Không |
| góc F (°) | 0 – 360 | 0 | Không |
| g (m/s²) | 0 – 20 | 9.8 | Có (Môi trường) |

Góc F = 0°: lực theo +x; quay 360° để đổi hướng kéo trên mặt phẳng ngang.

---

## Cách sử dụng

1. **Chọn scene → Lực ngang** → **Reset**
2. μ = 0.3, m = 5 kg
3. Đặt **\|F\|** > μ·m·g (ví dụ F ≈ 20 N) để vật chuyển động
4. **Vector lực → all** → **Play**
5. Giảm F xuống dưới μmg → vật dừng
6. Thử góc F = 180° → đổi chiều chuyển động

---

## Đại lượng trên panel dữ liệu

| Nhãn | Ý nghĩa |
|------|---------|
| Vị trí (x, y, z) | Tọa độ vật |
| **x** | Tọa độ ngang chính (sceneSpecific) |
| v, \|v\|, a | Kinematics |
| F, W, N, f, F_net | Lực (N) |
| Ek | Động năng |

**F_net** trên panel ≈ F − f (trên mặt phẳng ngang); giảm thêm F_kk nếu bật cản không khí.

---

## Công thức (panel Công thức)

```
N = m·g
f = μ·N = μ·m·g
F_net = F − f
a = (F − μ·m·g) / m
x(t) = ½·a·t²   (v₀ = 0)
v(t) = a·t
Ek = ½·m·v²
```

---

## Vector lực trên vật

F (đỏ), W (xanh), N (vàng), f (cam), F_kk, F_net (trắng) — tại vị trí vật.

---

## Gợi ý thí nghiệm

| Thí nghiệm | Cách làm | Kết quả kỳ vọng |
|------------|----------|-----------------|
| F nhỏ hơn ma sát | \|F\| < μ·m·g | Vật đứng yên, f cân bằng F |
| Tăng lực kéo | F: 10 → 50 N | a tăng |
| Tăng ma sát | μ: 0.1 → 0.8 | a giảm |
| Đổi khối lượng | m tăng, F cố định | f tăng, a giảm |
| Đổi hướng | góc F: 0° → 180° | Vật đổi chiều |

---

## Demo gợi ý (~1,5 phút)

1. μ = 0.4, m = 5, F = 10 N → Play → vật **không** đi (F < μmg)
2. Tăng F lên 25 N → vật tăng tốc, **f** ngược chiều **v**
3. Giảm F khi đang chạy → **a** giảm, có thể âm (phanh)

---

*Quay lại: [HUONG_DAN_SU_DUNG.md](./HUONG_DAN_SU_DUNG.md) · [OVERVIEW.md](./OVERVIEW.md)*
