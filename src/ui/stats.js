import Stats from 'stats.js';

export function initStats() {
  const stats = new Stats();
  stats.showPanel(0);
  stats.dom.style.position = 'absolute';
  stats.dom.style.top = '10px';
  stats.dom.style.left = 'auto';
  stats.dom.style.right = '12px';
  stats.dom.style.zIndex = '5';
  stats.dom.style.pointerEvents = 'none';
  document.getElementById('viewport')?.appendChild(stats.dom);
  return stats;
}
