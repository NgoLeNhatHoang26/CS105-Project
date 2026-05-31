'use strict';
const PptxGenJS = require('pptxgenjs');
const pres = new PptxGenJS();

pres.layout = 'LAYOUT_16x9';
pres.author = 'CS105-Project';

// ─── Design tokens ───────────────────────────────────────────────────────────
const C = {
  bg:        'FFFFFF',
  primary:   '1F4E79',
  accent:    '2E75B6',
  body:      '2D2D2D',
  muted:     '777777',
  rule:      'CCCCCC',
  highlight: 'FFF2CC',
  lightBlue: 'EBF3FA',
  white:     'FFFFFF',
  navyText:  'A0BBDD',
  navyBody:  'CADCFC',
  sectionHL: '7BAFD4',
};
const F = { face: 'Arial', title: 24, sh: 17, body: 16, label: 14, cite: 12 };
const M = 0.5; // margin inches

// helper: horizontal divider
function rule(slide, y) {
  slide.addShape(pres.ShapeType.rect, {
    x: M, y, w: 9.0, h: 0.025,
    fill: { color: C.rule }, line: { color: C.rule },
  });
}

// helper: section header text
function sectionHead(slide, txt, x, y, w, color) {
  slide.addText(txt, {
    x, y, w, h: 0.35,
    fontSize: F.sh, fontFace: F.face,
    color: color || C.accent, bold: true,
  });
}

// helper: vertical divider
function vRule(slide, x, y, h) {
  slide.addShape(pres.ShapeType.rect, {
    x, y, w: 0.025, h,
    fill: { color: C.rule }, line: { color: C.rule },
  });
}

// helper: action title (white background slides)
function actionTitle(slide, txt) {
  slide.addText(txt, {
    x: M, y: 0.18, w: 9.0, h: 1.0,
    fontSize: F.title, fontFace: F.face, color: C.primary,
    bold: true, valign: 'top', wrap: true,
  });
  rule(slide, 1.18);
}

// helper: styled table row (header)
function hRow(cells) {
  return cells.map(t => ({
    text: t,
    options: {
      bold: true,
      fill: { color: C.accent },
      color: C.white,
      fontSize: F.label,
      fontFace: F.face,
      valign: 'middle',
    },
  }));
}
function dRow(cells, even) {
  return cells.map(t => ({
    text: String(t),
    options: {
      fill: { color: even ? 'F0F6FC' : C.bg },
      color: C.body,
      fontSize: F.label,
      fontFace: F.face,
      valign: 'middle',
    },
  }));
}

// ═════════════════════════════════════════════════════════════════════════════
// SLIDE 1 — Title
// ═════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.primary };

  s.addText('Mô phỏng vật lý 3D tương tác', {
    x: 0.7, y: 0.95, w: 8.6, h: 1.5,
    fontSize: 36, fontFace: F.face, color: C.white,
    bold: true, align: 'left', valign: 'top',
  });
  s.addText('Interactive 3D Physics Simulation', {
    x: 0.7, y: 2.45, w: 8.6, h: 0.45,
    fontSize: 18, fontFace: F.face, color: C.navyText,
    italic: true, align: 'left',
  });

  // accent line
  s.addShape(pres.ShapeType.rect, {
    x: 0.7, y: 3.0, w: 8.8, h: 0.05,
    fill: { color: C.accent }, line: { color: C.accent },
  });

  s.addText('Môn học: CS105 — Đồ họa máy tính', {
    x: 0.7, y: 3.15, w: 8.6, h: 0.38,
    fontSize: 16, fontFace: F.face, color: C.navyBody, align: 'left',
  });
  s.addText('[Họ tên sinh viên]   ·   [MSSV]   ·   [Lớp]', {
    x: 0.7, y: 3.6, w: 8.6, h: 0.38,
    fontSize: 15, fontFace: F.face, color: C.navyBody, align: 'left',
  });
  s.addText('Giảng viên hướng dẫn: [Tên GVHD]   ·   Năm học: 2025–2026', {
    x: 0.7, y: 4.0, w: 8.6, h: 0.38,
    fontSize: 15, fontFace: F.face, color: C.navyBody, align: 'left',
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// SLIDE 2 — Mục tiêu đồ án
// ═════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  actionTitle(s, 'Đồ án xây dựng ứng dụng web mô phỏng vật lý 3D, hiện thực đầy đủ 6 kỹ thuật đồ họa máy tính và phục vụ giáo dục');

  sectionHead(s, 'Mục tiêu kỹ thuật — 6 kỹ thuật đồ họa theo yêu cầu đề tài', M, 1.28, 9.0);

  const rows2 = [
    hRow(['#', 'Kỹ thuật đồ họa', 'Hiện thực trong dự án']),
    dRow(['1', 'Vẽ hình khối 3D', 'Box · Sphere · Cone · Cylinder · Wheel · Teapot (LatheGeometry)'], false),
    dRow(['2', 'Chiếu phối cảnh', 'PerspectiveCamera — FOV, Near, Far chỉnh trực tiếp qua GUI'], true),
    dRow(['3', 'Biến đổi Affine', 'Tịnh tiến, Xoay (Quaternion), Tỉ lệ — slider demo trực quan'], false),
    dRow(['4', 'Chiếu sáng Phong', 'Ambient + Directional + Point Light — cường độ điều chỉnh được'], true),
    dRow(['5', 'Bóng đổ', 'PCFSoftShadowMap (2048×2048) — bật/tắt thời gian thực'], false),
    dRow(['6', 'Ánh xạ kết cấu', '6 CanvasTexture thủ tục: Grid, Checker, Wood, Metal, Brick, Marble'], true),
  ];

  s.addTable(rows2, {
    x: M, y: 1.68, w: 9.0, h: 2.9,
    colW: [0.45, 2.55, 6.0],
    rowH: 0.38,
    border: { type: 'solid', color: 'D5E8F5', pt: 0.5 },
  });

  // Footer goal
  s.addShape(pres.ShapeType.rect, {
    x: M, y: 4.75, w: 9.0, h: 0.025, fill: { color: C.rule }, line: { color: C.rule },
  });
  s.addText('Mục tiêu giáo dục: giúp học sinh THCS trực quan hóa và hiểu rõ 4 hiện tượng vật lý cốt lõi qua mô phỏng 3D tương tác', {
    x: M, y: 4.82, w: 9.0, h: 0.55,
    fontSize: F.cite + 1, fontFace: F.face, color: C.muted, italic: true,
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// SLIDE 3 — Ý tưởng chương trình
// ═════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  actionTitle(s, 'Ứng dụng gồm 2 phần: Physics Simulator giúp học sinh thực hành vật lý, và Graphics Showcase trình diễn kỹ thuật đồ họa');

  // Left: Physics Simulator
  sectionHead(s, 'Physics Simulator', M, 1.28, 4.3);
  s.addText([
    { text: '4 scene vật lý:\n', options: { bold: true } },
    { text: '  • Mặt phẳng nghiêng — lực, góc dốc, ma sát\n' },
    { text: '  • Rơi tự do / ném ngang — quỹ đạo parabol\n' },
    { text: '  • Lực ngang + ma sát — tăng/giảm tốc\n' },
    { text: '  • Va chạm — bảo toàn động lượng\n\n' },
    { text: 'Hiển thị thời gian thực:\n', options: { bold: true } },
    { text: '  • Vận tốc, gia tốc, lực, động năng\n' },
    { text: '  • Vector mũi tên minh họa lực\n' },
    { text: '  • Công thức vật lý tương ứng mỗi scene' },
  ], {
    x: M, y: 1.68, w: 4.3, h: 3.5,
    fontSize: F.body - 1, fontFace: F.face, color: C.body, paraSpaceAfter: 3,
  });

  // Vertical divider
  vRule(s, 4.95, 1.28, 3.95);

  // Right: Graphics Showcase
  sectionHead(s, 'Graphics Showcase', 5.2, 1.28, 4.3);
  s.addText([
    { text: '6 hình khối 3D:\n', options: { bold: true } },
    { text: '  • Box, Sphere, Cone, Cylinder, Wheel, Teapot\n\n' },
    { text: 'Demo kỹ thuật đồ họa:\n', options: { bold: true } },
    { text: '  • Slider biến đổi Affine (tịnh tiến, xoay, tỉ lệ)\n' },
    { text: '  • Chọn texture (Wood, Metal, Brick, Marble…)\n' },
    { text: '  • Bật/tắt Ambient / Directional / Point Light\n' },
    { text: '  • Toggle bóng đổ (Shadow Mapping)\n' },
    { text: '  • Chỉnh FOV → quan sát phép chiếu phối cảnh\n' },
    { text: '  • Điều chỉnh vị trí camera (X, Y, Z)' },
  ], {
    x: 5.2, y: 1.68, w: 4.3, h: 3.5,
    fontSize: F.body - 1, fontFace: F.face, color: C.body, paraSpaceAfter: 3,
  });

  // Footer: user interactions
  s.addShape(pres.ShapeType.rect, {
    x: M, y: 5.05, w: 9.0, h: 0.025, fill: { color: C.rule }, line: { color: C.rule },
  });
  s.addText('Điều khiển: Orbit camera (chuột) · Play / Pause / Reset · Kéo vật đặt vị trí · Điều chỉnh tham số qua bảng GUI real-time', {
    x: M, y: 5.1, w: 9.0, h: 0.4,
    fontSize: F.cite, fontFace: F.face, color: C.muted,
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// SLIDE 4 — Các chức năng chính
// ═════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  actionTitle(s, 'Chương trình tích hợp 4 scene vật lý đầy đủ chức năng, 6 hình khối 3D, load model GLB và các tiện ích đồ họa');

  // Left column: 4 Scenes
  sectionHead(s, '4 Scene vật lý', M, 1.28, 4.5);
  const sceneRows = [
    hRow(['Scene', 'Công thức chính']),
    dRow(['Mặt phẳng nghiêng', 'a = (F + mg sinθ − μmg cosθ) / m'], false),
    dRow(['Rơi tự do / Ném ngang', 'y = h − ½gt²,  x = ½a_x t²'], true),
    dRow(['Lực ngang + ma sát', 'a = (F − μmg) / m'], false),
    dRow(["Va chạm 1D", "m₁v₁ + m₂v₂ = m₁v₁' + m₂v₂'"], true),
  ];
  s.addTable(sceneRows, {
    x: M, y: 1.68, w: 4.5, h: 2.15,
    colW: [2.1, 2.4],
    rowH: 0.38,
    border: { type: 'solid', color: 'D5E8F5', pt: 0.5 },
  });

  sectionHead(s, 'Chức năng đồ họa', M, 3.93, 4.5);
  s.addText([
    { text: '• Load model GLB/GLTF ', options: { bold: true } },
    { text: '(GLTFLoader — thay lớp hiển thị, giữ collider)\n' },
    { text: '• Raycasting ', options: { bold: true } },
    { text: '— click chọn vật, kéo đặt vị trí ban đầu\n' },
    { text: '• Stats.js ', options: { bold: true } },
    { text: '— theo dõi FPS, render time\n' },
    { text: '• Reset View ', options: { bold: true } },
    { text: '— khôi phục camera mặc định' },
  ], {
    x: M, y: 4.33, w: 4.5, h: 1.1,
    fontSize: F.body - 1, fontFace: F.face, color: C.body, paraSpaceAfter: 4,
  });

  // Vertical divider
  vRule(s, 5.05, 1.28, 4.15);

  // Right column: Tech stack
  sectionHead(s, 'Công nghệ sử dụng', 5.25, 1.28, 4.25);
  const techRows = [
    hRow(['Thư viện', 'Vai trò']),
    dRow(['Three.js v0.170', 'Rendering 3D, đồ họa máy tính'], false),
    dRow(['Cannon-es v0.20', 'Mô phỏng vật lý Newton'], true),
    dRow(['lil-gui v0.20', 'Bảng điều khiển tham số GUI'], false),
    dRow(['Stats.js', 'Theo dõi FPS, render time'], true),
    dRow(['Vite v5', 'Build tool & dev server (HMR)'], false),
  ];
  s.addTable(techRows, {
    x: 5.25, y: 1.68, w: 4.25, h: 2.15,
    colW: [2.0, 2.25],
    rowH: 0.38,
    border: { type: 'solid', color: 'D5E8F5', pt: 0.5 },
  });

  sectionHead(s, 'Tham số & điều khiển', 5.25, 3.93, 4.25);
  s.addText([
    { text: '• Tham số STOPPED: ', options: { bold: true } },
    { text: 'khối lượng, góc, ma sát, hình dạng\n' },
    { text: '• Tham số RUNNING: ', options: { bold: true } },
    { text: 'lực F (scene 1–3 thay đổi ngay)\n' },
    { text: '• Hiệu năng mục tiêu: ', options: { bold: true } },
    { text: '60 FPS ổn định, dt = 1/60 s cố định' },
  ], {
    x: 5.25, y: 4.33, w: 4.25, h: 1.1,
    fontSize: F.body - 1, fontFace: F.face, color: C.body, paraSpaceAfter: 4,
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// SLIDE 5 — Kỹ thuật đồ họa
// ═════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  actionTitle(s, 'Sáu kỹ thuật đồ họa cốt lõi được hiện thực hoàn chỉnh — từ lý thuyết đến triển khai code thực tế với Three.js');

  const techniques = [
    {
      title: '1. Chiếu phối cảnh (Perspective Projection)',
      lines: [
        'THREE.PerspectiveCamera(fov, aspect, near, far)',
        'FOV, Near, Far chỉnh qua GUI → camera.updateProjectionMatrix()',
        'Hiệu ứng xa gần thực tế, clamp tránh canvas đen',
      ],
    },
    {
      title: '2. Biến đổi Affine (Affine Transformation)',
      lines: [
        'Translation: mesh.position.copy(body.position)',
        'Rotation: mesh.quaternion.copy(body.quaternion)',
        'Scale: mesh.scale.setScalar(s) — slider demo trực quan',
      ],
    },
    {
      title: '3. Chiếu sáng — Mô hình Phong',
      lines: [
        'AmbientLight(0xffffff, 0.55) — ánh sáng môi trường',
        'DirectionalLight(0xffffff, 0.85) tại (15, 25, 12)',
        'PointLight(0xffa060, 0.55, 35) — ánh sáng điểm màu cam',
      ],
    },
    {
      title: '4. Bóng đổ (Shadow Mapping)',
      lines: [
        'PCFSoftShadowMap — Percentage Closer Filtering',
        'shadow.mapSize = 2048×2048 — bóng sắc nét',
        'castShadow = receiveShadow = true cho tất cả vật',
      ],
    },
    {
      title: '5. Ánh xạ kết cấu (Texture Mapping)',
      lines: [
        '6 CanvasTexture thủ tục: Grid, Checker, Wood, Metal, Brick, Marble',
        'UV Mapping: RepeatWrapping + texture.repeat.set(x, y)',
        'Áp dụng lên sàn, ramp của 4 scene + showcase objects',
      ],
    },
    {
      title: '6. Raycasting',
      lines: [
        'raycaster.setFromCamera(mouse, camera)',
        'intersectObjects() → highlight + kéo vật',
        'Vô hiệu kéo khi trạng thái RUNNING',
      ],
    },
  ];

  const colX = [M, 5.1];
  const rowY = [1.28, 2.82, 4.35];

  techniques.forEach((t, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = colX[col];
    const y = rowY[row];
    const w = 4.4;
    const h = 1.38;

    // Card background
    s.addShape(pres.ShapeType.roundRect, {
      x, y, w, h,
      fill: { color: C.lightBlue },
      line: { color: C.accent, pt: 1.2 },
      rectRadius: 0.1,
    });

    // Card title
    s.addText(t.title, {
      x: x + 0.15, y: y + 0.1, w: w - 0.3, h: 0.35,
      fontSize: 13, fontFace: F.face, color: C.accent, bold: true,
    });

    // Card body lines
    const bodyText = t.lines.map((l, j) => ({
      text: (j < t.lines.length - 1 ? l + '\n' : l),
      options: {},
    }));
    s.addText(bodyText, {
      x: x + 0.15, y: y + 0.48, w: w - 0.3, h: h - 0.58,
      fontSize: 12, fontFace: F.face, color: C.body,
      paraSpaceAfter: 2,
    });
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// SLIDE 7 — Kết quả, Hạn chế, Hướng phát triển (Conclusions)
// ═════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.primary };

  // Section label
  s.addText('Kết quả & Tổng kết', {
    x: M, y: 0.18, w: 9.0, h: 0.38,
    fontSize: 18, fontFace: F.face, color: C.navyText,
  });

  // Accent rule
  s.addShape(pres.ShapeType.rect, {
    x: M, y: 0.58, w: 9.0, h: 0.05,
    fill: { color: C.accent }, line: { color: C.accent },
  });

  // Results
  s.addText('Kết quả đạt được', {
    x: M, y: 0.72, w: 9.0, h: 0.35,
    fontSize: F.sh, fontFace: F.face, color: C.sectionHL, bold: true,
  });
  s.addText([
    { text: '1. 4 scene vật lý hoàn chỉnh ', options: { bold: true } },
    { text: '— dữ liệu real-time, công thức, vector lực minh họa\n' },
    { text: '2. Đủ 6 kỹ thuật đồ họa theo yêu cầu ', options: { bold: true } },
    { text: '— chiếu, biến đổi, ánh sáng Phong, bóng đổ, texture, raycasting\n' },
    { text: '3. 6 hình khối 3D + load model GLB/GLTF ', options: { bold: true } },
    { text: '— Box, Sphere, Cone, Cylinder, Wheel, Teapot\n' },
    { text: '4. Hiệu năng ổn định 60 FPS ', options: { bold: true } },
    { text: '— code module ES6, chú thích tiếng Việt đầy đủ' },
  ], {
    x: M, y: 1.12, w: 9.0, h: 1.52,
    fontSize: F.body, fontFace: F.face, color: C.white,
    paraSpaceAfter: 5,
  });

  // Thin divider
  s.addShape(pres.ShapeType.rect, {
    x: M, y: 2.72, w: 9.0, h: 0.025,
    fill: { color: '2E75B6' }, line: { color: '2E75B6' },
  });

  // Left: Limitations
  s.addText('Hạn chế hiện tại', {
    x: M, y: 2.82, w: 4.3, h: 0.35,
    fontSize: F.sh, fontFace: F.face, color: C.sectionHL, bold: true,
  });
  s.addText([
    { text: '• Chỉ hỗ trợ máy tính để bàn (desktop)\n' },
    { text: '• Texture tạo thủ tục, chưa dùng ảnh thực\n' },
    { text: '• Physics chưa xử lý 3D phức tạp\n' },
    { text: '• Chưa có âm thanh hiệu ứng va chạm' },
  ], {
    x: M, y: 3.22, w: 4.3, h: 1.5,
    fontSize: F.body - 1, fontFace: F.face, color: C.navyBody,
    paraSpaceAfter: 6,
  });

  // Vertical divider
  vRule(s, 4.95, 2.82, 2.0);

  // Right: Future
  s.addText('Hướng phát triển', {
    x: 5.2, y: 2.82, w: 4.3, h: 0.35,
    fontSize: F.sh, fontFace: F.face, color: C.sectionHL, bold: true,
  });
  s.addText([
    { text: '• Hỗ trợ giao diện mobile / tablet\n' },
    { text: '• Bổ sung scene: con lắc, sóng, điện từ\n' },
    { text: '• Tích hợp WebXR (VR/AR)\n' },
    { text: '• Xuất báo cáo PDF + quản lý lớp học' },
  ], {
    x: 5.2, y: 3.22, w: 4.3, h: 1.5,
    fontSize: F.body - 1, fontFace: F.face, color: C.navyBody,
    paraSpaceAfter: 6,
  });

  // Bottom accent
  s.addShape(pres.ShapeType.rect, {
    x: M, y: 5.0, w: 9.0, h: 0.05,
    fill: { color: C.accent }, line: { color: C.accent },
  });
  s.addText('CS105 — Đồ họa máy tính  ·  2025–2026', {
    x: M, y: 5.12, w: 9.0, h: 0.38,
    fontSize: 13, fontFace: F.face, color: C.navyText, align: 'center',
  });
}

// ─── Write file ──────────────────────────────────────────────────────────────
pres.writeFile({ fileName: '/Users/dangvanvy/CS105-Project/CS105_Presentation.pptx' })
  .then(() => console.log('✓ Done: CS105_Presentation.pptx'))
  .catch(err => { console.error('Error:', err); process.exit(1); });
