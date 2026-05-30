# Demo Test — Scene 3: Lực ngang

**Thời gian:** ~1,5 phút · **Mục tiêu:** Ma sát vs lực kéo; F < μmg → đứng yên; F > μmg → chuyển động.

---

## Chuẩn bị

- [ ] Scene: **Lực ngang**
- [ ] **Vector lực:** `all`
- [ ] **Reset**
- [ ] Demo số trên panel: giữ **góc F = 0°** (lực theo +x); góc khác → vector lực đúng nhưng cột **F** scalar có thể lệch độ lớn

> **Sau fix:** không `linearDamping`; **gia tốc** = hợp lực / m (theo vector), không theo dấu vận tốc. Khi đứng: **F_net ≈ 0**, **a ≈ 0** (không âm).

---

## Test A — Vật đứng yên vì F < ma sát (mở đầu ấn tượng)

### Tham số

| Tham số | Giá trị |
|---------|---------|
| m | **5** kg |
| μ | **0,5** |
| \|F\| | **10** N |
| góc F | **0**° |
| g | **9,8** m/s² |

**Tính nhanh:** f_max = μ·m·g = 0,5 × 5 × 9,8 = **24,5 N** → F = 10 N **nhỏ hơn** ma sát tĩnh (vật đứng yên nếu không có vận tốc ban đầu).

> Nếu vật vẫn trượt nhẹ: giảm F xuống **5** N hoặc tăng μ lên **0,6**.

### Các bước

| # | Thao tác | Nói gì |
|---|----------|--------|
| 1 | **Play** | “Lực kéo 10 N nhưng ma sát lớn hơn — vật không đi.” |
| 2 | Quan sát **v ≈ 0**, **F_net ≈ 0**, **a_x ≈ 0**, **a_z ≈ 0** | “Hợp lực không đủ vượt ma sát — gia tốc bằng 0, không âm.” |
| 3 | Chỉ vector **f** ngược chiều F | “Vector ma sát hiển thị khi bật all.” |

**Pass:** sau vài giây vật vẫn gần đứng; panel **không** hiện gia tốc âm.

---

## Test B — Vật chuyển động khi F đủ lớn (test chính)

### Tham số

| Tham số | Giá trị |
|---------|---------|
| m | **5** kg |
| μ | **0,3** |
| \|F\| | **50** N |
| góc F | **0**° |
| g | **9,8** m/s² |

**Tính nhanh:** f = 0,3 × 5 × 9,8 = **14,7 N** → F_net ≈ 50 − 14,7 = **35,3 N** → a ≈ 7 m/s².

### Các bước

| # | Thao tác | Kỳ vọng |
|---|----------|---------|
| 1 | **Reset** → **Play** | Vật **tăng tốc** ngang |
| 2 | Theo dõi **x**, **v**, **Ek** tăng | Đúng a = (F − μmg)/m |
| 3 | Khi **RUNNING**, tăng F lên **80** N | Nhanh hơn ngay lập tức |
| 4 | Giảm F xuống **5** N khi đang chạy | Chậm dần, có thể dừng (không bị “hút” bởi damping) |

---

## Test C — Phanh / đổi hướng (~25s)

| Tham số | Giá trị |
|---------|---------|
| m | **5** kg |
| μ | **0,3** |
| \|F\| ban đầu | **50** N, góc **0**° |

| # | Thao tác | Kỳ vọng |
|---|----------|---------|
| 1 | **Play** → chờ **v** rõ (v > 1 m/s) | Vật chạy +x |
| 2 | Khi **RUNNING**, đổi **góc F** → **180**° (hoặc giảm F rồi đẩy ngược) | Vật **chậm lại** |
| 3 | Xem **a_x** trên panel khi đang phanh | **a_x** cùng dấu với hợp lực (thường **âm** khi v > 0 và F ngược) — **không** luôn cùng dấu **v** |

> Đây là điểm chứng minh fix bug #4: gia tốc theo **lực**, không theo dấu vận tốc.

---

## Test D — Đổi μ (~15s)

| # | Thao tác | Kỳ vọng |
|---|----------|---------|
| 1 | **Pause**, μ: **0,1** → **0,8**, F = 50, **Play** | μ lớn → chậm hơn / dễ dừng |

---

## Điểm DHMT nhắc nhanh

- Ma sát + lực → vector **f**, **F**, **F_net**.
- Mặt sàn **texture** lưới; biên arena vô hình.
- Đổi F runtime — chứng minh điều khiển realtime.

---

## Checklist pass / fail

| Tiêu chí | Pass? |
|----------|-------|
| F nhỏ + μ lớn → đứng yên, F_net/a ≈ 0 | ☐ |
| F = 50 N, μ = 0,3 → chuyển động | ☐ |
| Phanh: a theo hướng lực (Test C) | ☐ |
| Đổi F khi RUNNING | ☐ |
| Vector lực hiển thị đúng | ☐ |
