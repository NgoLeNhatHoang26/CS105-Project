# Hướng Dẫn Sử Dụng 4 Cảnh Mô Phỏng

> **Physics Sim** — Web app mô phỏng vật lý 3D cho giáo dục THCS (UIT CS431).  
> Tài liệu này dành cho giáo viên, học sinh và giảng viên chấm đồ án.

---

## Mục lục

1. [Tổng quan ứng dụng](#1-tổng-quan-ứng-dụng)
2. [Cảnh 1: Mặt phẳng nghiêng](#2-cảnh-1-mặt-phẳng-nghiêng)
3. [Cảnh 2: Rơi tự do](#3-cảnh-2-rơi-tự-do)
4. [Cảnh 3: Lực ngang](#4-cảnh-3-lực-ngang)
5. [Cảnh 4: Va chạm](#5-cảnh-4-va-chạm)
6. [Ý nghĩa màu vector lực](#6-ý-nghĩa-màu-vector-lực)
7. [Lưu ý khi sử dụng](#7-lưu-ý-khi-sử-dụng)
8. [Gợi ý cho giáo viên khi demo](#8-gợi-ý-cho-giáo-viên-khi-demo)

---

## 1. Tổng quan ứng dụng

### Mục tiêu

Physics Sim giúp quan sát trực quan các hiện tượng vật lý cơ bản trong không gian 3D: chuyển động trên mặt phẳng nghiêng, rơi tự do, chuyển động ngang có ma sát và va chạm. Học sinh có thể chỉnh tham số, chạy mô phỏng, đọc số liệu thời gian thực và so sánh với công thức lý thuyết.

### Giao diện chính

| Khu vực | Chức năng |
|---------|-----------|
| **Sidebar trái** | Điều khiển mô phỏng, tham số, dữ liệu, công thức, hướng dẫn |
| **Khung nhìn 3D (bên phải)** | Hiển thị cảnh mô phỏng, vector lực, bóng đổ |

### Các thao tác chung

#### Chọn scene

1. Mở mục **Tham số** trên sidebar.
2. Trong folder **Chọn scene**, chọn một trong bốn cảnh:
   - Mặt phẳng nghiêng
   - Rơi tự do
   - Lực ngang
   - Va chạm
3. Tham số riêng của cảnh sẽ hiện ngay bên dưới.

#### Chỉnh tham số

- Dùng thanh trượt (slider), ô số hoặc menu chọn trong sidebar.
- Một số tham số **bị khóa khi đang chạy** (xem mục [Lưu ý](#7-lưu-ý-khi-sử-dụng)).
- Trọng lực **g** và **Tốc độ sim** nằm trong folder **Môi trường**.

#### Play / Pause / Reset

| Nút | Chức năng | Phím tắt |
|-----|-----------|----------|
| **Play** | Bắt đầu hoặc tiếp tục mô phỏng | `Space` |
| **Pause** | Tạm dừng, giữ nguyên vị trí và thời gian | `Space` |
| **Reset** | Đưa vật về trạng thái ban đầu, thời gian = 0 | `R` |
| **View** | Đưa camera về góc nhìn mặc định | — |

#### Reset View

Nhấn **View** nếu camera bị xoay/zoom quá xa, không còn nhìn rõ vật.

#### Bật/tắt vector lực

1. Mở folder **Hiển thị** trong **Tham số**.
2. Chọn **Vector lực**:
   - `none` — tắt vector
   - `selected` — chỉ hiện **F** (lực tác dụng) và **F_net** (hợp lực)
   - `all` — hiện đủ F, W, N, f, F_net

#### Xem dữ liệu vật lý

- Mở mục **Dữ liệu vật lý** trên sidebar.
- Số liệu cập nhật theo thời gian thực khi mô phỏng chạy: thời gian, vị trí, vận tốc, gia tốc, động năng, các lực...
- Mỗi cảnh có thêm dữ liệu riêng (ví dụ: quãng đường dọc dốc, độ cao, vận tốc hai vật...).

#### Ghi mốc dữ liệu

1. Chạy mô phỏng đến thời điểm cần ghi.
2. Nhấn **＋ Ghi mốc** — lưu snapshot số liệu hiện tại.
3. Bảng mốc hiện bên dưới với các cột: thời gian, vị trí, vận tốc, động năng.
4. Nhấn **Xóa mốc** để xóa toàn bộ mốc đã ghi.

#### Export CSV

1. Ghi ít nhất một mốc dữ liệu.
2. Nhấn **Export CSV** — tải file `.csv` chứa toàn bộ mốc đã ghi.
3. Mở bằng Excel hoặc Google Sheets để phân tích, vẽ biểu đồ.

#### Điều khiển camera

| Thao tác | Cách làm |
|----------|----------|
| Xoay camera | Giữ **chuột trái** + kéo |
| Zoom | Cuộn **chuột giữa** |
| Chọn vật | **Click chuột trái** lên vật (khi Pause/Reset) |

---

## 2. Cảnh 1: Mặt phẳng nghiêng

### Mục tiêu học tập

Hiểu cách phân tích lực trên mặt phẳng nghiêng: thành phần trọng lực, phản lực, ma sát và hợp lực gây ra gia tốc.

### Hiện tượng mô phỏng

Một vật (hộp) đặt ở đỉnh mặt phẳng nghiêng, trượt xuống theo dốc. Vật dừng khi đi hết chiều dài dốc.

### Các tham số có thể chỉnh

| Tham số | Khoảng | Mô tả |
|---------|--------|-------|
| Khối lượng (m) | 0,1 – 50 kg | Khối lượng vật |
| Góc nghiêng (θ) | 0° – 90° | Độ dốc mặt phẳng |
| Chiều dài dốc (L) | 1 – 10 m | Quãng đường tối đa trên dốc |
| Ma sát (μ) | 0 – 1 | Hệ số ma sát |
| \|F\| | 0 – 100 N | Độ lớn lực tác dụng thêm |
| Góc F | −90° – +90° | Hướng lực F so với dốc |
| Trọng lực (g) | 0 – 20 m/s² | Trong folder **Môi trường** |

> **Khi đang chạy:** chỉ chỉnh được **\|F\|** và **góc F**. Các tham số còn lại cần Pause hoặc Reset trước.

### Cách sử dụng từng bước

1. Chọn scene **Mặt phẳng nghiêng** trong **Chọn scene**.
2. Chỉnh **góc nghiêng**, **ma sát**, **khối lượng** theo ý muốn.
3. Trong **Hiển thị**, đặt **Vector lực** = `all`.
4. Nhấn **Play**.
5. Quan sát vật trượt xuống dốc; theo dõi vận tốc và lực trên panel dữ liệu.
6. Nhấn **Reset** để thử bộ tham số khác.

### Các đại lượng cần quan sát

| Đại lượng | Ký hiệu trong panel | Ý nghĩa |
|-----------|---------------------|---------|
| Vị trí | Vị trí (x, y, z) | Tọa độ vật trong không gian |
| Quãng dọc dốc | s dọc dốc | Khoảng cách đã trượt trên dốc |
| Vận tốc | v, \|v\| | Vận tốc theo thời gian |
| Gia tốc | a | Gia tốc hiện tại |
| Trọng lực | W | Lực hấp dẫn (m·g) |
| Phản lực | N | Lực vuông góc mặt dốc |
| Ma sát | f | Lực cản trượt |
| Lực tác dụng | F | Lực kéo/đẩy thêm |
| Hợp lực | F_net | Lực tổng hợp theo phương chuyển động |
| Động năng | Ek | Năng lượng do chuyển động |

### Công thức liên quan

```
Thành phần trọng lực song song dốc:  mg·sin θ
Thành phần trọng lực vuông góc dốc: mg·cos θ
Phản lực:                              N = mg·cos θ
Ma sát:                                f = μ·N
Hợp lực:                               F_net = F + mg·sin θ − f
Định luật II Newton:                   F_net = m·a
Chuyển động:                           v = v₀ + a·t ,  s = v₀t + ½at²
Động năng:                             Ek = ½mv²
```

### Gợi ý thí nghiệm

| Thí nghiệm | Cách làm | Kết quả kỳ vọng |
|------------|----------|-----------------|
| Tăng góc nghiêng | θ: 15° → 45° → 60° | Gia tốc tăng, vật trượt nhanh hơn |
| Tăng ma sát | μ: 0 → 0,5 → 0,9 | Gia tốc giảm, có thể dừng sớm |
| Đổi khối lượng | m: 1 kg → 10 kg | Gia tốc không đổi (nếu không có F) |
| Thêm lực kéo | \|F\| > 0, góc F = 0° | Vật trượt nhanh hơn hoặc chậm lại tùy hướng |
| Lực cản chuyển động | \|F\| ngược chiều trượt | Vật có thể dừng trước khi hết dốc |

---

## 3. Cảnh 2: Rơi tự do

### Mục tiêu học tập

Quan sát chuyển động rơi tự do và (khi bật lực ngang) chuyển động ném ngang — hai phương chuyển động độc lập.

### Hiện tượng mô phỏng

Vật (hộp hoặc cầu) thả từ độ cao ban đầu, rơi xuống mặt đất. Nếu thêm lực ngang, quỹ đạo thành parabol (ném ngang). Vật dừng khi chạm đất.

### Các tham số

| Tham số | Khoảng | Mô tả |
|---------|--------|-------|
| Khối lượng (m) | 0,1 – 50 kg | Khối lượng vật |
| h — độ cao đáy (m) | 1 – 100 m | Độ cao **đáy** vật so với mặt đất |
| Hình dạng | box / sphere | Hình dạng vật |
| \|F\| | 0 – 100 N | Lực tác dụng thêm |
| Góc F ngang | 0° – 360° | Hướng thành phần ngang của F |
| Góc F dọc | −90° – +90° | Hướng thành phần dọc của F |
| Trọng lực (g) | 0 – 20 m/s² | Trong folder **Môi trường** |

> **Khi đang chạy:** chỉ chỉnh được **\|F\|** và các **góc F**. Các tham số còn lại cần Pause hoặc Reset.

### Cách sử dụng từng bước

1. Chọn scene **Rơi tự do**.
2. Đặt **h** (ví dụ 20 m), chọn **hình dạng** (box hoặc sphere).
3. Để thí nghiệm rơi tự thuần: để **\|F\| = 0**.
4. Bật **Vector lực** = `all`, nhấn **Play**.
5. Quan sát vật rơi; theo dõi **h**, **v**, **t** trên panel dữ liệu.
6. (Tuỳ chọn) Thêm lực ngang → quan sát quỹ đạo parabol.
7. **Reset** và thử độ cao hoặc khối lượng khác.

### Các đại lượng quan sát

| Đại lượng | Ký hiệu | Ý nghĩa |
|-----------|---------|---------|
| Thời gian | t | Thời gian mô phỏng |
| Độ cao | h | Độ cao đáy vật so với mặt đất |
| Vị trí ngang | x | Khoảng cách ngang (khi có lực ngang) |
| Vận tốc | v, \|v\| | Vận tốc tổng hợp |
| Gia tốc | a | Gia tốc (gần g theo phương dọc) |
| Động năng | Ek | Tăng dần khi vật rơi |
| Thời gian chạm đất | t_chạm đất | Ước lượng thời điểm chạm đất |
| Giá trị lý thuyết | y (lý thuyết), v_y (lý thuyết) | So sánh với công thức |

### Công thức

```
Rơi tự do (không có F):
  y = h − ½gt²
  v_y = gt
  t_chạm = √(2h/g)
  v_chạm = √(2gh)

Ném ngang / có lực ngang:
  x = ½·a_x·t²
  v_x = a_x·t

Động năng:
  Ek = ½mv²
```

### Gợi ý thí nghiệm

| Thí nghiệm | Cách làm | Kết quả kỳ vọng |
|------------|----------|-----------------|
| Đổi chiều cao | h: 10 m → 40 m | Thời gian rơi tăng |
| Đổi khối lượng | m: 1 kg → 20 kg | Thời gian rơi **không đổi** (trong chân không) |
| Đổi g | g: 9,8 → 3,7 (Mặt Trăng) | Rơi chậm hơn, t_chạm tăng |
| Kiểm tra khối lượng | So sánh hộp nặng vs nhẹ | Thời gian rơi giống nhau |
| Ném ngang | \|F\| > 0, góc ngang = 0° | Quỹ đạo cong parabol |

---

## 4. Cảnh 3: Lực ngang

### Mục tiêu học tập

Hiểu mối quan hệ giữa lực kéo, lực ma sát và gia tốc trên mặt phẳng ngang.

### Hiện tượng mô phỏng

Vật (hộp hoặc cầu) nằm trên mặt phẳng ngang. Lực F tác dụng theo phương ngang; ma sát cản chuyển động. Vật dừng khi chạm biên hoặc khi F ≤ f.

### Các tham số

| Tham số | Khoảng | Mô tả |
|---------|--------|-------|
| Khối lượng (m) | 0,1 – 50 kg | Khối lượng vật |
| Ma sát (μ) | 0 – 1 | Hệ số ma sát |
| Hình dạng | box / sphere | Hình dạng vật |
| \|F\| | 0 – 100 N | Độ lớn lực tác dụng |
| Góc F | 0° – 360° | Hướng lực trên mặt phẳng |
| Trọng lực (g) | 0 – 20 m/s² | Trong folder **Môi trường** |

> **Khi đang chạy:** chỉ chỉnh được **\|F\|** và **góc F**.

### Cách sử dụng từng bước

1. Chọn scene **Lực ngang**.
2. Đặt **μ** (ví dụ 0,3), **m** (ví dụ 5 kg).
3. Đặt **\|F\|** lớn hơn lực ma sát tĩnh (μ·m·g) để vật bắt đầu chuyển động.
4. Bật **Vector lực** = `all`, nhấn **Play**.
5. Quan sát vật trượt; theo dõi **x**, **v**, **F_net** trên panel.
6. Thử giảm F xuống dưới μmg → vật đứng yên.
7. **Reset** và thử hướng lực khác.

### Các đại lượng quan sát

| Đại lượng | Ý nghĩa |
|-----------|---------|
| Vị trí (x, z) | Vị trí vật trên mặt phẳng |
| Vận tốc v, \|v\| | Tốc độ chuyển động |
| Gia tốc a | Gia tốc theo phương lực tổng |
| Lực tác dụng F | Lực kéo/đẩy do người dùng đặt |
| Lực ma sát f | Lực cản, ngược chiều chuyển động |
| Hợp lực F_net | F − f (trên mặt phẳng ngang) |
| Động năng Ek | Tăng khi vật tăng tốc |

### Công thức

```
Phản lực:     N = mg
Ma sát:       f = μ·N = μ·mg
Hợp lực:      F_net = F − f
Gia tốc:      a = F_net / m = (F − μmg) / m
Chuyển động:  v = at ,  x = ½at²
Động năng:    Ek = ½mv²
```

### Gợi ý thí nghiệm

| Thí nghiệm | Cách làm | Kết quả kỳ vọng |
|------------|----------|-----------------|
| Tăng lực kéo | \|F\|: 10 → 50 N | Gia tốc tăng |
| Tăng ma sát | μ: 0,1 → 0,8 | Gia tốc giảm, dễ dừng |
| F < ma sát | \|F\| < μmg | Vật đứng yên |
| Đổi khối lượng | m: 2 → 20 kg | f tăng, a giảm (nếu F cố định) |
| Đổi hướng lực | Góc F: 0° → 180° | Vật đổi chiều chuyển động |

---

## 5. Cảnh 4: Va chạm

### Mục tiêu học tập

Quan sát va chạm một chiều (1D), bảo toàn động lượng và mất mát động năng tùy hệ số phục hồi.

### Hiện tượng mô phỏng

Hai quả cầu va chạm trên đường thẳng ngang. Trước va chạm có thể một hoặc cả hai vật chuyển động; sau va chạm vận tốc thay đổi theo định luật bảo toàn động lượng và hệ số e.

### Các tham số

| Tham số | Khoảng | Mô tả |
|---------|--------|-------|
| Tình huống | 4 preset | Va trực diện / Một vật chạy / Đuổi kịp / Đứng yên |
| m₁, m₂ | 0,1 – 50 kg | Khối lượng hai vật |
| Khoảng cách ban đầu | 1 – 20 m | Khoảng cách giữa hai vật |
| Bán kính | 0,2 – 1,5 m | Bán kính quả cầu |
| \|v₁\|, \|v₂\| | 0 – 20 m/s | Vận tốc ban đầu |
| Hướng v₁, v₂ | +x / −x | Chiều chuyển động ban đầu |
| Hệ số phục hồi (e) | 0 – 1 | e = 1: đàn hồi; e = 0: không đàn hồi |
| Ma sát (μ) | 0 – 1 | Ma sát sau va chạm |
| Pause sau va | bật/tắt | Tự dừng ngay sau va chạm |
| Trọng lực g | bật/tắt | Bật/tắt trọng lực trong cảnh |

> **Khi đang chạy:** **tất cả** tham số bị khóa. Cần Pause trước khi chỉnh.

### Cách sử dụng từng bước

1. Chọn scene **Va chạm**.
2. Chọn **Tình huống** (ví dụ: *Va trực diện* hoặc *Một vật chạy*).
3. Chỉnh **m₁**, **m₂**, **\|v₁\|**, **\|v₂\|**, **e** theo ý muốn.
4. (Tuỳ chọn) Bật **Pause sau va** để dừng ngay khi va chạm xảy ra.
5. Nhấn **Play** — hai vật di chuyển và va chạm.
6. Quan sát **v₁**, **v₂**, **p**, **ΔEk** trên panel dữ liệu.
7. **Reset** và thử tình huống hoặc khối lượng khác.

### Các đại lượng quan sát

| Đại lượng | Ý nghĩa |
|-----------|---------|
| v₁, v₂ | Vận tốc hai vật theo thời gian |
| p (động lượng) | Tổng động lượng hệ |
| p (sau va) | Động lượng sau va chạm |
| ΔEk | Mất mát động năng do va chạm |
| e (quan sát) | Hệ số phục hồi thực tế |
| v₁', v₂' (LT) | Vận tốc lý thuyết sau va |
| Trạng thái | Mô tả giai đoạn (trước/sau va) |

### Công thức

```
Động lượng:           p = mv
Bảo toàn động lượng:  m₁v₁ + m₂v₂ = m₁v₁' + m₂v₂'
Hệ số phục hồi:       e = (v₂' − v₁') / (v₁ − v₂)
Động năng:            Ek = ½mv²
Mất năng lượng:       ΔEk = Ek_sau − Ek_trước  (thường ≤ 0)
```

### Gợi ý thí nghiệm

| Thí nghiệm | Cách làm | Kết quả kỳ vọng |
|------------|----------|-----------------|
| Vật nặng va vật nhẹ | m₁ >> m₂ | Vật nặng gần như không đổi v |
| Vật nhẹ va vật nặng | m₁ << m₂ | Vật nhẹ bật ngược, vật nặng gần đứng yên |
| Hai vật ngược chiều | Preset *Va trực diện* | Va chạm mạnh, ΔEk lớn |
| Một vật đứng yên | Preset *Một vật chạy* | Vật đứng yên bị đẩy, vật chạy giảm tốc |
| e = 1 (đàn hồi) | e → 1 | ΔEk ≈ 0, động năng gần bảo toàn |
| e = 0 ( không đàn hồi) | e → 0 | Hai vật dính/chuyển động cùng v, ΔEk lớn |

---

## 6. Ý nghĩa màu vector lực

Khi bật **Vector lực** (chế độ `all`), các mũi tên hiển thị trên vật với màu sau:

| Ký hiệu | Tên | Màu | Ý nghĩa |
|---------|-----|-----|---------|
| **F** | Lực tác dụng | Đỏ | Lực kéo/đẩy do người dùng đặt |
| **W** | Trọng lực | Xanh dương | Lực hấp dẫn (P = mg, hướng xuống) |
| **N** | Phản lực | Vàng | Lực vuông góc bề mặt tiếp xúc |
| **f** | Ma sát | Cam | Lực cản trượt, ngược chiều chuyển động |
| **F_net** | Hợp lực | Trắng | Lực tổng hợp gây gia tốc |

> Ở chế độ `selected`, chỉ hiện **F** (đỏ) và **F_net** (trắng).  
> Cảnh **Va chạm** không có vector lực F do người dùng — tập trung vào vận tốc và động lượng.

---

## 7. Lưu ý khi sử dụng

### Khóa tham số khi đang chạy

| Cảnh | Tham số khóa khi RUNNING | Vẫn chỉnh được |
|------|--------------------------|----------------|
| 1 – Mặt phẳng nghiêng | m, θ, L, μ | \|F\|, góc F, tốc độ sim, hiển thị |
| 2 – Rơi tự do | m, h, hình dạng | \|F\|, góc F, tốc độ sim, hiển thị |
| 3 – Lực ngang | m, μ, hình dạng | \|F\|, góc F, tốc độ sim, hiển thị |
| 4 – Va chạm | **Tất cả** tham số | Chỉ tốc độ sim, hiển thị, camera |

→ Muốn đổi tham số bị khóa: nhấn **Pause** hoặc **Reset** trước.

### Mẹo sử dụng

- **Vật chạy quá nhanh:** giảm \|F\|, giảm g, hoặc chọn **Tốc độ sim** = 0,5× trong **Môi trường**.
- **Không thấy vật:** nhấn **View** để reset camera; xoay/zoom bằng chuột.
- **Quan sát lực rõ hơn:** bật **Vector lực** = `all` trước khi Play.
- **Lưu kết quả:** dùng **Ghi mốc** tại các thời điểm quan trọng, sau đó **Export CSV**.
- **So sánh lý thuyết:** mở mục **Công thức** trên sidebar; cảnh 2 và 4 có thêm số liệu lý thuyết trên panel dữ liệu.

### Phím tắt

| Phím | Thao tác |
|------|----------|
| `Space` | Play / Pause |
| `R` | Reset |

---

## 8. Gợi ý cho giáo viên khi demo

### Chuẩn bị trước khi demo (~2 phút)

1. Mở app trên trình duyệt desktop (Chrome / Firefox / Edge).
2. Bật **Vector lực** = `all` và mở **Dữ liệu vật lý**.
3. Chọn cảnh phù hợp bài học, đặt tham số mặc định hợp lý.
4. Kiểm tra camera bằng **View** nếu cần.

### Quy trình demo hiệu quả

| Bước | Việc làm |
|------|----------|
| 1 | Giới thiệu hiện tượng vật lý của cảnh |
| 2 | **Hỏi học sinh dự đoán** trước khi nhấn Play |
| 3 | Chạy mô phỏng, chỉ vào vector lực và số liệu |
| 4 | **Thay đổi một tham số** mỗi lần (không đổi nhiều cùng lúc) |
| 5 | So sánh số liệu mô phỏng với công thức trong mục **Công thức** |
| 6 | Ghi mốc tại 2–3 thời điểm, export CSV nếu cần bài tập về nhà |

### Gợi ý demo theo cảnh (~5 phút tổng)

| Cảnh | Demo nhanh |
|------|------------|
| **Mặt phẳng nghiêng** | θ: 15° → 45° → hỏi: vật trượt nhanh hay chậm hơn? |
| **Rơi tự do** | h = 20 m, so sánh hộp vs cầu — thời gian rơi có khác không? |
| **Lực ngang** | F nhỏ hơn ma sát → vật đứng; tăng F → vật chuyển động |
| **Va chạm** | Vật nặng va vật nhẹ; so sánh p trước/sau va trên panel |

### Câu hỏi gợi ý cho học sinh

- "Nếu tăng góc dốc, gia tốc tăng hay giảm? Tại sao?"
- "Hai vật khối lượng khác nhau rơi từ cùng độ cao — ai chạm đất trước?"
- "Khi F = ma sát, vật có chuyển động không?"
- "Sau va chạm, tổng động lượng có thay đổi không? Còn động năng thì sao?"

---

*Tài liệu được viết dựa trên phiên bản hiện tại của Physics Sim (4 scene, Three.js + Cannon-es). Cập nhật: 2026.*
