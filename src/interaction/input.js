/**
 * Phím tắt: Space = Play/Pause, R = Reset
 */
export function bindKeyboard({ onPlayPause, onReset }) {
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.code === 'Space') {
      e.preventDefault();
      onPlayPause();
    }
    if (e.code === 'KeyR') {
      onReset();
    }
  });
}
