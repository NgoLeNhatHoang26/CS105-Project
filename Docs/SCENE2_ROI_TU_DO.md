# Cảnh 2 — Rơi tự do

**Scene ID:** 2 · **Tên trong app:** Rơi tự do

---

## Mục tiêu học tập

Quan sát rơi tự do thuần và (khi có lực ngang) chuyển động ném — hai phương độc lập trong không gian 3D.

---

## Hiện tượng mô phỏng

Vật thả từ độ cao ban đầu, rơi xuống sàn. Có thể thêm lực **F** theo góc ngang/dọc để tạo quỹ đạo cong (ném).

- **h** trong GUI là **độ cao đáy** vật so với mặt đất (không phải tọa độ tâm).
- Rơi thuần (`F = 0`, không cản không khí): dùng công thức analytic — khớp lý thuyết SGK.
- Vật dừng khi chạm đất.

Vật lý: `src/physics/integrators/freeFall.js`

---

## Tham số

| Tham số (GUI) | Khoảng | Mặc định | Khóa khi RUNNING |
|---------------|--------|----------|------------------|
| khối lượng (kg) | 0.1 – 500 | 5 | Có |
| h — độ cao đáy (m) | 1 – 100 | 20 | Có |
| cản không khí | bật/tắt | tắt | Không |
| \|F\| (N) | 0 – 100 | 0 | Không |
| góc F ngang (°) | 0 – 360 | 0 | Không |
| góc F dọc (°) | −90 – +90 | 0 | Không |
| g (m/s²) | 0 – 20 | 9.8 | Có (Môi trường) |

Hình dạng vật: đổi trong **Thuộc tính → Vật thí nghiệm → Hình dạng** (box, sphere, …).

---

## Cách sử dụng

1. **Chọn scene → Rơi tự do** → **Reset**
2. Đặt **h** (ví dụ 20 m), **F = 0** cho rơi thuần
3. **Vector lực → all** → **Play**
4. Theo dõi **h**, **v**, **t**; so sánh **y (lý thuyết)**, **v_y (lý thuyết)** khi rơi thuần
5. Thêm **F** ngang → quan sát quỹ đạo parabol
6. **Pause** → kéo vật → độ cao ban đầu cập nhật theo vị trí mới

---

## Đại lượng trên panel dữ liệu

| Nhãn | Ý nghĩa |
|------|---------|
| t | Thời gian |
| Vị trí, v, \|v\|, a | Kinematics |
| **h (đáy)**, **h₀** | Độ cao đáy / độ cao thả ban đầu |
| **t_chạm đất** | Ước lượng thời điểm chạm đất |
| **y (lý thuyết)**, **v_y (lý thuyết)** | So sánh rơi thuần (F = 0, không cản) |
| **v_chạm đất** | Vận tốc lý thuyết khi chạm đất |
| Trạng thái | `đã chạm đất` khi vật nằm trên sàn |

---

## Công thức (panel Công thức)

**Rơi tự do (F = 0):**

```
y(t) = y₀ − ½·g·t²
v_y(t) = g·t   (↓)
t_chạm = √(2·h / g)
v_chạm = √(2·g·h)
```

**Có lực / ném ngang:**

```
Thành phần ngang và dọc độc lập
Ek = ½·m·v²
Ep = m·g·h
```

---

## Vector lực trên vật

F (đỏ), W (xanh), N (vàng khi trên sàn), F_kk nếu bật cản không khí, F_net (trắng).

---

## Gợi ý thí nghiệm

| Thí nghiệm | Cách làm | Kết quả kỳ vọng |
|------------|----------|-----------------|
| Đổi chiều cao | h: 10 → 40 m | t_chạm tăng |
| Đổi khối lượng | m: 1 → 20 kg (F = 0) | t_chạm **không đổi** |
| Đổi g | g: 9.8 → 3.7 | Rơi chậm hơn |
| Rơi thuần | F = 0 | y, v_y khớp cột lý thuyết |
| Ném ngang | \|F\| > 0, góc ngang = 0° | Quỹ đạo cong |

---

## Demo gợi ý (~1,5 phút)

1. h = 20 m, F = 0 → Play → nêu **t_chạm ≈ √(2h/g)**
2. Chỉ **y (lý thuyết)** và **v_y (lý thuyết)** khớp xu hướng mô phỏng
3. Reset → thêm F ngang nhỏ → quỹ đạo không còn thẳng đứng

---

*Quay lại: [HUONG_DAN_SU_DUNG.md](./HUONG_DAN_SU_DUNG.md) · [OVERVIEW.md](./OVERVIEW.md)*
