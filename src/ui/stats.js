import Stats from 'stats.js';

export function initStats() {
  const stats = new Stats();
  stats.showPanel(0);
  stats.dom.style.position = 'absolute';
  stats.dom.style.top = '8px';
  stats.dom.style.left = 'auto';
  stats.dom.style.right = '8px';
  document.getElementById('viewport')?.appendChild(stats.dom);
  return stats;
}
